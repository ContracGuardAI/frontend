import { spawn } from "child_process";
import path from "path";

// Priority: env override → monorepo sibling → bundled inside frontend/agent/
const AGENT_DIR = (() => {
  if (process.env.AGENT_DIR) return process.env.AGENT_DIR;
  const sibling  = path.resolve(process.cwd(), "..", "contractguard-agent");
  const bundled  = path.resolve(process.cwd(), "agent");
  const { existsSync } = require("fs") as typeof import("fs");
  return existsSync(path.join(sibling, "CLAUDE.md")) ? sibling : bundled;
})();

// Model yang tersedia — ubah CLAUDE_MODEL di .env.local untuk ganti model
// Pilihan: "claude-haiku-4-5-20251001" | "claude-sonnet-4-6" | "claude-opus-4-7"
export const CLAUDE_MODELS = {
  haiku:  "claude-haiku-4-5-20251001",   // cepat, murah, untuk testing
  sonnet: "claude-sonnet-4-6",            // seimbang, untuk produksi
  opus:   "claude-opus-4-7",              // terbaik, untuk demo penting
} as const;

export type ClaudeModelKey = keyof typeof CLAUDE_MODELS;

function resolveModel(modelOrKey?: string): string {
  if (!modelOrKey) {
    return process.env.CLAUDE_MODEL ?? CLAUDE_MODELS.sonnet;
  }
  // Terima alias pendek ("haiku", "sonnet", "opus") atau model ID lengkap
  return CLAUDE_MODELS[modelOrKey as ClaudeModelKey] ?? modelOrKey;
}

function runClaude(prompt: string, model?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === "win32";
    const resolvedModel = resolveModel(model);

    const claudeProcess = spawn(
      "claude",
      [
        "-p",
        "--model",        resolvedModel,
        "--output-format", "text",
        "--allowedTools", "Read",
      ],
      {
        cwd: AGENT_DIR,
        stdio: ["pipe", "pipe", "pipe"],
        shell: isWindows,
      }
    );

    let stdout = "";
    let stderr = "";

    claudeProcess.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    claudeProcess.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    claudeProcess.on("error", (err: Error) => {
      reject(new Error(`Gagal menjalankan Claude Code: ${err.message}`));
    });

    claudeProcess.on("close", (code: number | null) => {
      if (code !== 0 && !stdout.trim()) {
        return reject(
          new Error(`Claude Code keluar dengan kode ${code}: ${stderr.slice(0, 300)}`)
        );
      }
      resolve(stdout.trim());
    });

    claudeProcess.stdin.write(prompt);
    claudeProcess.stdin.end();
  });
}

function parseClaudeOutput(raw: string): Record<string, unknown> {
  let text = raw.trim();

  // Bersihkan jika ada pembungkus markdown
  if (text.startsWith("```json")) {
    text = text.split("```json")[1].split("```")[0].trim();
  } else if (text.startsWith("```")) {
    text = text.split("```")[1].split("```")[0].trim();
  }

  // Ambil hanya bagian JSON jika ada teks sebelum/sesudah
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(text);
}

// ─── Contract Review ────────────────────────────────────────────────────────

export interface PriceItem {
  item: string;
  contract_price: number;
  market_estimate: string;
  status: "overpriced" | "fair" | "underpriced";
  notes: string;
}

export interface RiskyClause {
  clause: string;
  risk_level: "high" | "medium" | "low";
  issue: string;
  potential_impact: string;
  suggestion: string;
}

export interface ContractReviewResult {
  analysis_type: "contract_review";
  fairness_score: number;
  price_analysis: PriceItem[];
  risky_clauses: RiskyClause[];
  revision_suggestions: string[];
  overall_summary: string;
}

export async function analyzeContract(
  contractText: string,
  model?: string,
  lang: "en" | "id" = "id"
): Promise<ContractReviewResult> {
  if (!contractText || contractText.length < 50) {
    throw new Error("Teks kontrak terlalu pendek untuk dianalisis.");
  }

  const langInstruction = lang === "en"
    ? "IMPORTANT: Respond ONLY in English. Every text field in the JSON output must be written in English."
    : "PENTING: Respond HANYA dalam Bahasa Indonesia. Semua field teks dalam output JSON harus dalam Bahasa Indonesia.";

  const prompt = `Contract Review Request

${langInstruction}

${lang === "en" ? "Analyze the following contract completely and professionally." : "Analisis kontrak kerja berikut secara lengkap dan profesional."}

${lang === "en" ? "Contract Text:" : "Teks Kontrak:"}
${contractText}

${lang === "en" ? "Follow the Contract Review instructions in CLAUDE.md." : "Lakukan Contract Review sesuai instruksi di CLAUDE.md."}`;

  const raw = await runClaude(prompt, model);
  const parsed = parseClaudeOutput(raw) as unknown as ContractReviewResult;

  if (parsed.analysis_type !== "contract_review") {
    throw new Error(lang === "en"
      ? "Agent output does not match Contract Review format."
      : "Output agent tidak sesuai format Contract Review.");
  }

  return parsed;
}

// ─── Contract Q&A ────────────────────────────────────────────────────────────

export interface ContractChatResult {
  answer: string;
}

export async function chatContract(
  contractText: string,
  analysisResult: ContractReviewResult | null,
  userQuestion: string,
  model?: string,
  lang: "en" | "id" = "id"
): Promise<ContractChatResult> {
  if (!userQuestion || userQuestion.trim().length < 3) {
    throw new Error(lang === "en" ? "Question is too short." : "Pertanyaan terlalu pendek.");
  }

  const langInstruction = lang === "en"
    ? "IMPORTANT: Respond ONLY in English. Write in plain text, not JSON."
    : "PENTING: Respond HANYA dalam Bahasa Indonesia. Tulis dalam plain text, bukan JSON.";

  const contractSnippet = contractText.length > 6000
    ? contractText.slice(0, 6000) + "\n...[teks dipotong karena terlalu panjang]"
    : contractText;

  const analysisContext = analysisResult
    ? `\n\nRingkasan hasil analisis AI sebelumnya:\n- Fairness score: ${analysisResult.fairness_score}/10\n- Ringkasan: ${analysisResult.overall_summary}\n- Klausul risiko tinggi: ${analysisResult.risky_clauses.filter(c => c.risk_level === "high").map(c => c.clause).join(", ") || "tidak ada"}\n- Item overpriced: ${analysisResult.price_analysis.filter(p => p.status === "overpriced").map(p => p.item).join(", ") || "tidak ada"}`
    : "";

  const prompt = `Contract Q&A Request

${langInstruction}

Teks kontrak:
${contractSnippet}
${analysisContext}

Pertanyaan user: ${userQuestion.trim()}

Jawab pertanyaan ini secara profesional sesuai instruksi Mode 3 di CLAUDE.md.`;

  const raw = await runClaude(prompt, model);
  return { answer: raw.trim() };
}

// ─── Checkpoint Review ───────────────────────────────────────────────────────

export interface CheckpointReviewResult {
  analysis_type: "checkpoint_review";
  status: "APPROVED" | "NEEDS_REVISION" | "MAJOR_ISSUE";
  compliance_score: number;
  findings: string;
  required_fixes: string[];
  approved_items: string[];
}

export async function reviewCheckpoint(
  contractSpec: string,
  evidenceText: string,
  model?: string,
  lang: "en" | "id" = "id"
): Promise<CheckpointReviewResult> {
  if (!contractSpec || !evidenceText) {
    throw new Error(lang === "en"
      ? "Contract spec and work evidence are required."
      : "Spesifikasi kontrak dan bukti kerja wajib diisi.");
  }

  const langInstruction = lang === "en"
    ? "IMPORTANT: Respond ONLY in English. Every text field in the JSON output must be written in English."
    : "PENTING: Respond HANYA dalam Bahasa Indonesia. Semua field teks dalam output JSON harus dalam Bahasa Indonesia.";

  const prompt = `Checkpoint Review Request

${langInstruction}

${lang === "en" ? "Contract work specification:" : "Spesifikasi pekerjaan dari kontrak:"}
${contractSpec}

${lang === "en" ? "Work evidence submitted by contractor:" : "Bukti pekerjaan yang disubmit oleh kontraktor:"}
${evidenceText}

${lang === "en" ? "Follow the Checkpoint Review instructions in CLAUDE.md." : "Lakukan Checkpoint Review sesuai instruksi di CLAUDE.md."}`;

  const raw = await runClaude(prompt, model);
  const parsed = parseClaudeOutput(raw) as unknown as CheckpointReviewResult;

  if (parsed.analysis_type !== "checkpoint_review") {
    throw new Error(lang === "en"
      ? "Agent output does not match Checkpoint Review format."
      : "Output agent tidak sesuai format Checkpoint Review.");
  }

  return parsed;
}
