import { NextRequest } from "next/server";
import { analyzeContract } from "../../lib/contractAgent";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 120;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Jailbreak / prompt-injection detection ────────────────────────────────────
const INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above)\s+(instructions?|rules?|prompt)/i,
  /disregard\s+.{0,15}instructions?/i,
  /forget\s+(all|previous)\s+(instructions?|rules?|training)/i,
  /override\s+(?:all\s+)?(?:previous\s+)?instructions?/i,
  /\[INST\]|\[\/INST\]|<\|system\|>|<\|user\|>|<\|im_start\|>/,
  /<<SYS>>|<\/SYS>/,
  /reveal\s+(your\s+)?(system\s+)?(prompt|instructions?)/i,
  /you\s+are\s+now\s+(?:a\s+)?(?:different\s+|new\s+)?(?:ai|assistant|model|bot|gpt|claude)/i,
  /new\s+instructions?:\s/i,
];

function hasInjection(text: string): boolean {
  return INJECTION_PATTERNS.some(p => p.test(text));
}

// ── Agent timeout (ms) ────────────────────────────────────────────────────────
const AGENT_TIMEOUT_MS = 85_000;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { contractText, model, charCount, lang } = body as {
    contractText?: string;
    model?: string;
    charCount?: number;
    lang?: "en" | "id";
  };

  const isEn = lang === "en";

  if (!contractText || contractText.trim().length < 50) {
    return new Response(
      JSON.stringify({ success: false, error: isEn ? "Contract text is empty." : "Teks kontrak tidak boleh kosong." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Jailbreak guard ──────────────────────────────────────────────────────────
  if (hasInjection(contractText)) {
    const errMsg = isEn
      ? "Suspicious content detected in the contract. Analysis aborted for security."
      : "Konten mencurigakan terdeteksi dalam kontrak. Analisis dihentikan demi keamanan.";
    return new Response(
      `data: ${JSON.stringify({ type: "error", message: errMsg })}\n\n`,
      { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
    );
  }

  const wordCount = Math.ceil((charCount ?? contractText.length) / 5);
  const encoder   = new TextEncoder();

  // ── Progress stage messages (localised) ──────────────────────────────────────
  const stages = isEn ? [
    { delay: 1200, message: "Scanning payment clauses and terms..." },
    { delay: 2400, message: "Checking price markups against market estimates..." },
    { delay: 3800, message: "Detecting one-sided clauses and risky terms..." },
    { delay: 5400, message: "Evaluating escrow security and protection gaps..." },
    { delay: 7200, message: "Calculating fairness score and writing report..." },
  ] : [
    { delay: 1200, message: "Menganalisis klausul pembayaran dan termin..." },
    { delay: 2400, message: "Memeriksa markup harga terhadap estimasi pasar..." },
    { delay: 3800, message: "Mendeteksi klausul sepihak dan terms berisiko..." },
    { delay: 5400, message: "Mengevaluasi keamanan escrow dan celah perlindungan..." },
    { delay: 7200, message: "Menghitung fairness score dan menyusun laporan..." },
  ];

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch { /* stream already closed */ }
      };

      const timers: ReturnType<typeof setTimeout>[] = [];

      try {
        send({
          type: "progress",
          message: isEn
            ? `Contract received. Scanning ~${wordCount} words...`
            : `Kontrak diterima. Memindai ~${wordCount} kata...`,
        });
        await sleep(400);

        // Agent call wrapped with timeout
        let agentDone = false;
        const agentPromise = analyzeContract(contractText.trim(), model, lang ?? "id")
          .then(r => { agentDone = true; return r; });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => {
            if (!agentDone) reject(new Error(isEn ? "Analysis timed out." : "Analisis timeout."));
          }, AGENT_TIMEOUT_MS)
        );

        for (const s of stages) {
          timers.push(setTimeout(() => send({ type: "progress", message: s.message }), s.delay));
        }

        const result = await Promise.race([agentPromise, timeoutPromise]);
        timers.forEach(clearTimeout);

        const analysisHash = createHash("sha256").update(JSON.stringify(result)).digest("hex");

        send({
          type: "result",
          data: result,
          meta: {
            analysis_hash: analysisHash,
            analyzed_at: new Date().toISOString(),
            char_count: contractText.length,
            model_used: model ?? process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6",
          },
        });

      } catch (err) {
        timers.forEach(clearTimeout);
        const raw = err instanceof Error ? err.message : String(err);

        let message: string;
        if (raw.includes("timed out") || raw.includes("timeout")) {
          message = isEn
            ? "Analysis timed out. The contract may be too long. Please try again."
            : "Analisis timeout. Kontrak mungkin terlalu panjang. Coba lagi.";
        } else if (raw.includes("format") || raw.includes("JSON") || raw.includes("parse")) {
          message = isEn
            ? "AI returned an unexpected format. Please try again."
            : "AI mengembalikan format yang tidak terduga. Coba lagi.";
        } else {
          message = isEn ? `Analysis failed: ${raw}` : `Analisis gagal: ${raw}`;
        }

        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache",
      "Connection":        "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
