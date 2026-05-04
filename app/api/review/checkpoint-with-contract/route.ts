import { spawn } from "child_process";
import path from "path";
import { existsSync } from "fs";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 120;

const AGENT_DIR = (() => {
  if (process.env.AGENT_DIR) return process.env.AGENT_DIR;
  const sibling = path.resolve(process.cwd(), "..", "contractguard-agent");
  const bundled = path.resolve(process.cwd(), "agent");
  return existsSync(path.join(sibling, "CLAUDE.md")) ? sibling : bundled;
})();

const MODEL = process.env.CLAUDE_MODEL ?? "claude-haiku-4-5-20251001";
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

type ImageMediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

interface ContentBlock {
  type: string;
  source?: { type: string; media_type: string; data: string };
  text?: string;
}

async function fetchFromSupabase(storagePath: string, bucket: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const { data, error } = await supabaseAdmin.storage.from(bucket).download(storagePath);
    if (error || !data) return null;
    const buffer = Buffer.from(await data.arrayBuffer());
    return { buffer, contentType: data.type };
  } catch {
    return null;
  }
}

function runClaudeReview(content: ContentBlock[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const message = JSON.stringify({
      type: "user",
      message: { role: "user", content },
    });

    const isWindows = process.platform === "win32";
    const proc = spawn(
      "claude",
      ["-p", "--model", MODEL, "--input-format", "stream-json", "--output-format", "stream-json",
       "--verbose", "--allowedTools", "Read"],
      { cwd: AGENT_DIR, stdio: ["pipe", "pipe", "pipe"], shell: isWindows }
    );

    let stdout = "";
    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.on("error", (err: Error) => reject(new Error(`Claude spawn error: ${err.message}`)));
    proc.on("close", () => {
      for (const line of stdout.split("\n")) {
        try {
          const parsed = JSON.parse(line.trim());
          if (parsed.type === "result" && parsed.result) return resolve(parsed.result.trim());
        } catch { /* skip */ }
      }
      reject(new Error("No result from Claude"));
    });

    proc.stdin.write(message + "\n");
    proc.stdin.end();
  });
}

function parseReviewJson(raw: string): Record<string, unknown> {
  let text = raw.trim();
  if (text.startsWith("```json")) text = text.split("```json")[1].split("```")[0].trim();
  else if (text.startsWith("```")) text = text.split("```")[1].split("```")[0].trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1) text = text.slice(first, last + 1);
  return JSON.parse(text);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    submissionId: string;
    pdaAddress: string;
    checkpointIndex: number;
  };

  const { submissionId, pdaAddress, checkpointIndex } = body;
  if (!submissionId || !pdaAddress || checkpointIndex === undefined) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Fetch submission + contract data dari Supabase
  const { data: submission } = await supabaseAdmin
    .from("evidence_submissions")
    .select("id, ipfs_cid, supabase_path, file_type")
    .eq("id", submissionId)
    .single();

  const { data: contract } = await supabaseAdmin
    .from("contracts")
    .select(`
      title, total_amount,
      pdf_path,
      checkpoints!inner (name, description, payment_percent)
    `)
    .eq("pda_address", pdaAddress)
    .eq("checkpoints.checkpoint_index", checkpointIndex)
    .single();

  if (!submission || !contract) {
    return Response.json({ error: "Data tidak ditemukan" }, { status: 404 });
  }

  const checkpoint = (contract.checkpoints as { name: string; description: string; payment_percent: number }[])[0];
  const paymentAmount = ((checkpoint.payment_percent / 100) * Number(contract.total_amount)).toFixed(2);

  const content: ContentBlock[] = [];

  // ── Lampirkan gambar evidence dari Supabase (lebih reliable dari IPFS) ──
  let evidenceNote = `Evidence di-upload ke IPFS (CID: ${submission.ipfs_cid}).`;

  if (submission.supabase_path) {
    const evidence = await fetchFromSupabase(submission.supabase_path, "evidence");
    if (evidence) {
      const ct = evidence.contentType.split(";")[0].trim();
      const isImage = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(ct);
      if (isImage && evidence.buffer.byteLength <= MAX_IMAGE_BYTES) {
        content.push({
          type: "image",
          source: { type: "base64", media_type: ct as ImageMediaType, data: evidence.buffer.toString("base64") },
        });
        evidenceNote = `Gambar evidence (${ct}, ${(evidence.buffer.byteLength / 1024).toFixed(0)}KB) dari Supabase Storage terlampir.`;
      } else if (ct === "application/pdf") {
        evidenceNote = `PDF evidence (${(evidence.buffer.byteLength / 1024).toFixed(0)}KB) di-upload. Tinjau berdasarkan spesifikasi.`;
      }
    }
  }

  // ── Lampirkan PDF kontrak dari Supabase (sebagai konteks spesifikasi) ──
  let contractNote = "PDF kontrak tidak tersedia, gunakan spesifikasi dari teks di bawah.";
  if (contract.pdf_path) {
    const pdf = await fetchFromSupabase(contract.pdf_path, "contracts");
    if (pdf) {
      contractNote = `PDF kontrak asli (${(pdf.buffer.byteLength / 1024).toFixed(0)}KB) tersedia di Supabase. Bandingkan evidence dengan spesifikasi kontrak.`;
    }
  }

  const prompt = `REVIEW CHECKPOINT — Perbandingan Evidence vs Kontrak

KONTRAK: ${contract.title}
TOTAL NILAI: ${contract.total_amount} USDC
CHECKPOINT #${checkpointIndex}: ${checkpoint.name}
PEMBAYARAN: ${paymentAmount} USDC (${checkpoint.payment_percent}% dari total)

SPESIFIKASI CHECKPOINT:
${checkpoint.description}

STATUS EVIDENCE:
${evidenceNote}

STATUS DOKUMEN KONTRAK:
${contractNote}

${content.length > 0 ? "Gambar evidence terlampir di atas. Analisis apakah evidence membuktikan penyelesaian sesuai spesifikasi." : ""}

Berikan review dalam format JSON:
{
  "approved": true/false,
  "confidence": 0-100,
  "summary": "ringkasan singkat",
  "notes": ["catatan 1", "catatan 2"],
  "recommendation": "APPROVE" | "REVISION" | "REJECT"
}`;

  content.push({ type: "text", text: prompt });

  try {
    const raw = await runClaudeReview(content);
    const result = parseReviewJson(raw);

    // Simpan hasil review ke Supabase
    await supabaseAdmin
      .from("evidence_submissions")
      .update({ ai_review: result })
      .eq("id", submissionId);

    return Response.json(result);
  } catch (err) {
    console.error("[review/checkpoint-with-contract] Error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Review gagal" },
      { status: 500 }
    );
  }
}
