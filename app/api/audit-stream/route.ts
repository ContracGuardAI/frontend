import { NextRequest } from "next/server";
import { analyzeContract } from "../../../../../contractguard-agent/contractAgent";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 120;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { contractText, model, charCount } = body as {
    contractText?: string;
    model?: string;
    charCount?: number;
  };

  if (!contractText || contractText.trim().length < 50) {
    return new Response(
      JSON.stringify({ success: false, error: "Teks kontrak tidak boleh kosong." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const wordCount  = Math.ceil((charCount ?? contractText.length) / 5);
  const encoder    = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        // Stage 1 — receiving
        send({ type: "progress", message: `Kontrak diterima. Memindai ~${wordCount} kata...` });
        await sleep(400);

        // Stage 2 — start agent in background
        const agentPromise = analyzeContract(contractText.trim(), model);

        const stages = [
          { delay: 1200, message: "Menganalisis klausul pembayaran dan termin..." },
          { delay: 2400, message: "Memeriksa markup harga terhadap estimasi pasar..." },
          { delay: 3800, message: "Mendeteksi klausul sepihak dan terms berisiko..." },
          { delay: 5400, message: "Mengevaluasi keamanan escrow dan celah perlindungan..." },
          { delay: 7200, message: "Menghitung fairness score dan menyusun laporan..." },
        ];

        // Stream progress stages while agent runs
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (const s of stages) {
          timers.push(setTimeout(() => {
            try { send({ type: "progress", message: s.message }); } catch {}
          }, s.delay));
        }

        // Await real agent result
        const result = await agentPromise;
        timers.forEach(clearTimeout);

        // Compute hash
        const analysisHash = createHash("sha256")
          .update(JSON.stringify(result))
          .digest("hex");

        // Stream final result
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
        const message = err instanceof Error ? err.message : "Analisis gagal.";
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
