import { spawn } from "child_process";
import path from "path";
import { existsSync } from "fs";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 90;

const AGENT_DIR = (() => {
  if (process.env.AGENT_DIR) return process.env.AGENT_DIR;
  const sibling = path.resolve(process.cwd(), "..", "contractguard-agent");
  const bundled = path.resolve(process.cwd(), "agent");
  return existsSync(path.join(sibling, "CLAUDE.md")) ? sibling : bundled;
})();

const MODEL = process.env.CLAUDE_MODEL ?? "claude-haiku-4-5-20251001";

const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
];

function runClaudeReview(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const message = JSON.stringify({
      type: "user",
      message: { role: "user", content: [{ type: "text", text: prompt }] },
    });

    const isWindows = process.platform === "win32";
    const proc = spawn(
      "claude",
      ["-p", "--model", MODEL, "--input-format", "stream-json", "--output-format", "stream-json",
       "--verbose", "--allowedTools", "WebFetch"],
      { cwd: AGENT_DIR, stdio: ["pipe", "pipe", "pipe"], shell: isWindows }
    );

    let stdout = "";
    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.on("error", (err: Error) => reject(new Error(`Claude spawn error: ${err.message}`)));
    proc.on("close", () => {
      for (const line of stdout.split("\n")) {
        try {
          const parsed = JSON.parse(line.trim());
          if (parsed.type === "result" && parsed.result) {
            return resolve(parsed.result.trim());
          }
        } catch { /* skip malformed lines */ }
      }
      reject(new Error("No result returned from Claude"));
    });

    proc.stdin.write(message + "\n");
    proc.stdin.end();
  });
}

function parseReviewJson(raw: string): Record<string, unknown> {
  let text = raw.trim();
  // Hapus code fence jika ada
  if (text.includes("```json")) text = text.split("```json")[1].split("```")[0].trim();
  else if (text.includes("```")) text = text.split("```")[1].split("```")[0].trim();
  // Ekstrak objek JSON pertama yang ditemukan
  const first = text.indexOf("{");
  const last  = text.lastIndexOf("}");
  if (first !== -1 && last !== -1) text = text.slice(first, last + 1);
  try {
    return JSON.parse(text);
  } catch {
    // Fallback: Claude tidak return JSON sama sekali — buat respons default
    console.error("[parseReviewJson] Tidak bisa parse JSON dari:", text.slice(0, 200));
    return {
      recommendation: "REVISION",
      score: 50,
      finding: "AI tidak dapat memproses bukti secara otomatis. Review manual diperlukan.",
      details: ["Response AI tidak dalam format yang diharapkan", "Silakan review bukti secara manual"],
    };
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    cid: string;
    checkpointName: string;
    checkpointDescription: string;
    contractTitle: string;
    totalAmount: number;
    paymentPercent: number;
  };

  const { cid, checkpointName, checkpointDescription, contractTitle, totalAmount, paymentPercent } = body;

  if (!cid || !checkpointName || !checkpointDescription) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const paymentAmount = ((paymentPercent / 100) * totalAmount).toFixed(2);

  // Buat URL list dari semua gateway IPFS — Claude akan coba fetch salah satunya
  const ipfsUrls = IPFS_GATEWAYS.map(gw => `${gw}${cid}`).join("\n- ");

  const prompt = `Kamu adalah AI reviewer untuk smart contract escrow. Tugasmu: review apakah bukti kerja yang disubmit memenuhi spesifikasi checkpoint.

KONTRAK: ${contractTitle}
TOTAL NILAI: ${totalAmount} USDC
CHECKPOINT: ${checkpointName}
PEMBAYARAN: ${paymentAmount} USDC (${paymentPercent}% dari total)

SPESIFIKASI YANG HARUS DIPENUHI:
${checkpointDescription}

FILE BUKTI (IPFS CID: ${cid}):
Gunakan WebFetch untuk mengambil dan menganalisis file bukti dari salah satu URL berikut:
- ${ipfsUrls}

Coba URL pertama dulu, jika gagal coba URL berikutnya. Analisis isi file bukti tersebut dan nilai apakah membuktikan penyelesaian sesuai spesifikasi di atas.

INSTRUKSI PENTING: Balas HANYA dengan JSON valid, tanpa teks lain sebelum atau sesudah JSON. Format wajib:
{
  "recommendation": "APPROVED" | "REVISION" | "DISPUTED",
  "score": <angka 0-100>,
  "finding": "<ringkasan 1-2 kalimat>",
  "details": ["<poin 1>", "<poin 2>", "<poin 3>"]
}

Kriteria recommendation:
- APPROVED: bukti jelas memenuhi semua spesifikasi
- REVISION: bukti kurang lengkap atau ada ketidaksesuaian minor
- DISPUTED: bukti tidak relevan, tidak ada, atau sangat tidak memenuhi spesifikasi

Jika file tidak bisa diakses dari semua gateway, tetap berikan penilaian berdasarkan informasi yang ada dengan score rendah dan recommendation REVISION.`;

  try {
    const raw = await runClaudeReview(prompt);
    const result = parseReviewJson(raw);
    return Response.json(result);
  } catch (err) {
    console.error("[review-checkpoint] Error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Review gagal" },
      { status: 500 }
    );
  }
}
