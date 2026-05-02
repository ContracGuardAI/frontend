import { spawn } from "child_process";
import path from "path";

const AGENT_DIR = (() => {
  if (process.env.AGENT_DIR) return process.env.AGENT_DIR;
  const sibling = path.resolve(process.cwd(), "..", "contractguard-agent");
  const bundled = path.resolve(process.cwd(), "agent");
  const { existsSync } = require("fs") as typeof import("fs");
  return existsSync(path.join(sibling, "CLAUDE.md")) ? sibling : bundled;
})();

export const CLAUDE_MODELS = {
  haiku:  "claude-haiku-4-5-20251001",
  sonnet: "claude-sonnet-4-6",
  opus:   "claude-opus-4-7",
} as const;

export type ClaudeModelKey = keyof typeof CLAUDE_MODELS;

// ─── Contract Types ──────────────────────────────────────────────────────────

export type ContractType =
  | "pengadaan_barang"
  | "konstruksi"
  | "jasa_it"
  | "jasa_konsultasi"
  | "jasa_hukum"
  | "jasa_pendidikan"
  | "ketenagakerjaan"
  | "jasa_lainnya";

export interface ContractDetection {
  contract_type: ContractType;
  items_to_check: string[];
  confidence: number;
}

// ─── Expert Personas ─────────────────────────────────────────────────────────

const EXPERT_PERSONAS: Record<ContractType, string> = {
  pengadaan_barang:
    "Procurement Specialist dan Analis Harga Pasar dengan pengalaman 15+ tahun di pengadaan barang/jasa pemerintah dan swasta Indonesia. Kamu memahami harga pasar, spesifikasi teknis, dan potensi markup yang tidak wajar.",
  konstruksi:
    "Quantity Surveyor (QS) bersertifikat dan Ahli Teknik Sipil dengan pengalaman 15+ tahun di proyek konstruksi Indonesia. Kamu memahami Rencana Anggaran Biaya (RAB), Analisa Harga Satuan Pekerjaan (AHSP), standar SNI, dan regulasi jasa konstruksi.",
  jasa_it:
    "Senior Software Engineer dan IT Consultant dengan 10+ tahun pengalaman di pengembangan sistem, estimasi biaya proyek IT, dan pengelolaan vendor teknologi di Indonesia. Kamu memahami standar harga development, SLA, dan potensi risiko kontrak IT.",
  jasa_konsultasi:
    "Senior Business Consultant dan Management Advisor dengan 12+ tahun pengalaman di Indonesia. Kamu memahami standar fee konsultan, deliverable yang wajar, dan klausul yang melindungi kepentingan klien.",
  jasa_hukum:
    "Advokat Senior dan Legal Consultant dengan spesialisasi hukum perdata dan kontrak komersial Indonesia, berpengalaman 15+ tahun. Kamu memahami KUHPerdata, standar honorarium advokat, dan klausul yang berpotensi merugikan klien.",
  jasa_pendidikan:
    "Training & Development Expert dan Education Consultant dengan 10+ tahun pengalaman di Indonesia. Kamu memahami standar biaya pelatihan, sertifikasi instruktur, dan indikator kualitas program pendidikan.",
  ketenagakerjaan:
    "HR Consultant dan Employment Law Specialist dengan 12+ tahun pengalaman di ketenagakerjaan Indonesia. Kamu memahami UU Ketenagakerjaan, PP PKWT, standar upah, hak-hak pekerja, dan klausul yang melanggar hukum.",
  jasa_lainnya:
    "Auditor Kontrak Profesional dan Business Consultant berpengalaman di berbagai industri Indonesia. Kamu menganalisis kontrak secara objektif berdasarkan prinsip keadilan dan hukum perjanjian Indonesia.",
};

// ─── Regulations ─────────────────────────────────────────────────────────────

const REGULATIONS: Record<ContractType, string[]> = {
  pengadaan_barang: [
    "Perpres No. 12/2021 tentang Pengadaan Barang/Jasa Pemerintah",
    "UU No. 8/1999 tentang Perlindungan Konsumen",
    "UU No. 5/1999 tentang Larangan Praktik Monopoli",
    "KUHPerdata Pasal 1313–1381 tentang Perjanjian",
  ],
  konstruksi: [
    "UU No. 2/2017 tentang Jasa Konstruksi",
    "PP No. 22/2020 tentang Pelaksanaan Jasa Konstruksi",
    "KUHPerdata Pasal 1601b tentang Pemborongan Pekerjaan",
    "Permen PUPR terkait Analisa Harga Satuan Pekerjaan (AHSP)",
  ],
  jasa_it: [
    "UU No. 11/2008 jo. UU No. 19/2016 tentang ITE",
    "PP No. 71/2019 tentang Penyelenggaraan Sistem Elektronik",
    "KUHPerdata Pasal 1313–1381 tentang Perjanjian",
    "Permen Kominfo No. 5/2020 tentang Penyelenggara Sistem Elektronik",
  ],
  jasa_konsultasi: [
    "KUHPerdata Pasal 1601 tentang Perjanjian Kerja",
    "KUHPerdata Pasal 1313–1381 tentang Perjanjian",
    "UU No. 8/1999 tentang Perlindungan Konsumen",
  ],
  jasa_hukum: [
    "UU No. 18/2003 tentang Advokat",
    "Kode Etik Advokat Indonesia (KEAI)",
    "KUHPerdata Pasal 1792–1819 tentang Pemberian Kuasa",
    "KUHPerdata Pasal 1313–1381 tentang Perjanjian",
  ],
  jasa_pendidikan: [
    "UU No. 20/2003 tentang Sistem Pendidikan Nasional",
    "PP No. 4/2022 tentang Standar Nasional Pendidikan",
    "KUHPerdata Pasal 1313–1381 tentang Perjanjian",
  ],
  ketenagakerjaan: [
    "UU No. 13/2003 tentang Ketenagakerjaan",
    "PP No. 35/2021 tentang PKWT, Alih Daya, Waktu Kerja, dan PHK",
    "UU No. 6/2023 tentang Cipta Kerja (klaster ketenagakerjaan)",
    "Permenaker No. 5/2023 tentang Penyesuaian Waktu Kerja",
  ],
  jasa_lainnya: [
    "KUHPerdata Pasal 1313–1381 tentang Perjanjian",
    "KUHPerdata Pasal 1320 tentang Syarat Sahnya Perjanjian",
    "UU No. 30/1999 tentang Arbitrase dan Alternatif Penyelesaian Sengketa",
    "UU No. 8/1999 tentang Perlindungan Konsumen",
  ],
};

// ─── Runner ──────────────────────────────────────────────────────────────────

function resolveModel(modelOrKey?: string): string {
  if (!modelOrKey) return process.env.CLAUDE_MODEL ?? CLAUDE_MODELS.sonnet;
  return CLAUDE_MODELS[modelOrKey as ClaudeModelKey] ?? modelOrKey;
}

function runClaude(prompt: string, model?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === "win32";
    const claudeProcess = spawn(
      "claude",
      ["-p", "--model", resolveModel(model), "--output-format", "text", "--allowedTools", "Read"],
      { cwd: AGENT_DIR, stdio: ["pipe", "pipe", "pipe"], shell: isWindows }
    );

    let stdout = "";
    let stderr = "";
    claudeProcess.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    claudeProcess.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
    claudeProcess.on("error", (err: Error) => reject(new Error(`Gagal menjalankan Claude: ${err.message}`)));
    claudeProcess.on("close", (code: number | null) => {
      if (code !== 0 && !stdout.trim()) {
        return reject(new Error(`Claude exit ${code}: ${stderr.slice(0, 300)}`));
      }
      resolve(stdout.trim());
    });
    claudeProcess.stdin.write(prompt);
    claudeProcess.stdin.end();
  });
}

function parseJson(raw: string): Record<string, unknown> {
  let text = raw.trim();
  if (text.startsWith("```json")) text = text.split("```json")[1].split("```")[0].trim();
  else if (text.startsWith("```")) text = text.split("```")[1].split("```")[0].trim();
  const first = text.indexOf("{");
  const last  = text.lastIndexOf("}");
  if (first !== -1 && last !== -1) text = text.slice(first, last + 1);
  return JSON.parse(text);
}

// ─── Price Sources ────────────────────────────────────────────────────────────

export interface PriceDataPoint {
  name: string;
  price: number;
  source: string;
}

export async function fetchBlibliPrices(keyword: string): Promise<PriceDataPoint[]> {
  return new Promise((resolve) => {
    const scriptPath = path.resolve(process.cwd(), "..", "neru-scrapper", "blibli_json.py");

    // On WSL: use python.exe (Windows Python) to bypass WSL network block
    // On Windows: use python directly
    const pythonCmd = process.platform === "win32" ? "python" : "python.exe";

    const proc = spawn(pythonCmd, [scriptPath, keyword], {
      stdio: ["pipe", "pipe", "pipe"],
      shell: process.platform === "win32",
    });

    let stdout = "";
    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.on("error", (e) => {
      console.error(`[Blibli] spawn error for "${keyword}":`, e.message);
      resolve([]);
    });
    proc.on("close", () => {
      try {
        const items = JSON.parse(stdout.trim());
        console.log(`[Blibli] "${keyword}" → ${Array.isArray(items) ? items.length : 0} items`);
        resolve(Array.isArray(items) ? items.filter((p: PriceDataPoint) => p.price > 500000) : []);
      } catch {
        console.error(`[Blibli] JSON parse error for "${keyword}": ${stdout.slice(0, 100)}`);
        resolve([]);
      }
    });
  });
}

export async function fetchSerpApiPrices(keyword: string): Promise<PriceDataPoint[]> {
  const key = process.env.SERPAPI_KEY;
  if (!key) return [];
  try {
    const params = new URLSearchParams({
      q:       `harga ${keyword}`,
      tbm:     "shop",
      gl:      "id",
      hl:      "id",
      api_key: key,
    });
    const res  = await fetch(`https://serpapi.com/search?${params}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.error(`[SerpAPI] HTTP ${res.status} for "${keyword}"`);
      return [];
    }
    const data = await res.json();
    const items: any[] = data?.shopping_results ?? [];
    console.log(`[SerpAPI] "${keyword}" → ${items.length} shopping results`);
    // Log raw prices untuk debug
    items.slice(0, 5).forEach(item => console.log(`  [SerpAPI raw] "${item.title?.slice(0,40)}" price="${item.price}"`));
    return items
      .map((item) => {
        const raw   = String(item.price ?? "0").replace(/[^\d]/g, "");
        const price = parseInt(raw, 10);
        return { name: (item.title ?? "").slice(0, 60), price, source: "Google Shopping" };
      })
      .filter((p) => p.price > 50000) // filter harga tidak masuk akal (< Rp 50.000 biasanya per-unit/satuan)
      .slice(0, 8);
  } catch {
    return [];
  }
}

export async function fetchGoogleCsePrices(keyword: string): Promise<PriceDataPoint[]> {
  const key = process.env.GOOGLE_CSE_KEY;
  const cx  = process.env.GOOGLE_CSE_ID;
  if (!key || !cx) return [];
  try {
    const params = new URLSearchParams({
      key,
      cx,
      q:   `harga ${keyword} indonesia`,
      num: "10",
      gl:  "id",
      lr:  "lang_id",
    });
    const res  = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[GoogleCSE] HTTP ${res.status} for "${keyword}": ${errText.slice(0, 200)}`);
      return [];
    }
    const data = await res.json();
    const items: any[] = data?.items ?? [];
    console.log(`[GoogleCSE] "${keyword}" → ${items.length} results`);
    // Log snippet pertama untuk debug
    if (items[0]) console.log(`[GoogleCSE] Sample snippet: ${items[0].snippet?.slice(0, 150)}`);

    // Ekstrak harga dari snippet Google CSE
    // Cek dulu apakah ada pagemap pricing data (lebih akurat)
    const results: PriceDataPoint[] = [];
    for (const item of items) {
      const text = `${item.title ?? ""} ${item.snippet ?? ""}`;

      // Pola 1: "Rp 1.500.000" atau "Rp1.500.000" atau "Rp1500000"
      // Pola 2: angka dengan separator titik Indonesia "1.500.000"
      // Pola 3: harga dengan koma "1,500,000"
      const pricePatterns = [
        /Rp\.?\s*(\d[\d.]{3,})/gi,           // Rp 1.500.000 atau Rp1500000
        /(\d{1,3}(?:\.\d{3}){2,})/g,         // 1.500.000 (min 2 separator → ≥ 1 juta)
        /IDR\s*(\d[\d.,]{3,})/gi,             // IDR 1.500.000
      ];

      let found = false;
      for (const pattern of pricePatterns) {
        const matches = [...text.matchAll(pattern)];
        for (const m of matches) {
          const raw   = m[1].replace(/[.,]/g, "");
          const price = parseInt(raw, 10);
          if (price > 50000 && price < 5_000_000_000) {
            results.push({ name: (item.title ?? "").slice(0, 60), price, source: "Google Search" });
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }
    return results.slice(0, 8);
  } catch {
    return [];
  }
}

export function summarizePrices(points: PriceDataPoint[], keyword: string): string | null {
  const rawPrices = points.map((p) => p.price).filter((p) => p > 0);
  if (!rawPrices.length) return null;

  // Rough median for outlier detection (robust even with a few outliers)
  const sorted0     = [...rawPrices].sort((a, b) => a - b);
  const roughMedian = sorted0[Math.floor(sorted0.length / 2)];
  const fmt0 = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
  console.log(`[summarize] "${keyword}" rawPrices (${rawPrices.length}): ${sorted0.map(fmt0).join(", ")}`);
  console.log(`[summarize] roughMedian=${fmt0(roughMedian)}, filter range: ${fmt0(roughMedian*0.1)} – ${fmt0(roughMedian*10)}`);

  // Remove prices below 10% or above 1000% of rough median
  // This catches per-unit prices mixed with per-roll/bulk prices (e.g. Rp 31.234/m vs Rp 3.250.000/roll)
  const prices = rawPrices.filter(
    (p) => p >= roughMedian * 0.1 && p <= roughMedian * 10
  );
  console.log(`[summarize] after filter (${prices.length}): ${[...prices].sort((a,b)=>a-b).map(fmt0).join(", ")}`);
  if (!prices.length) return null;

  const filteredPoints = points.filter(
    (p) => p.price >= roughMedian * 0.1 && p.price <= roughMedian * 10
  );
  const outlierCount  = rawPrices.length - prices.length;

  const sorted  = [...prices].sort((a, b) => a - b);
  const avg     = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const median  = sorted[Math.floor(sorted.length / 2)];
  const fmt     = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
  const sources = [...new Set(filteredPoints.map((p) => p.source))].join(", ");
  const examples = filteredPoints.slice(0, 4)
    .map((p) => `    - [${p.source}] ${p.name} — ${fmt(p.price)}`)
    .join("\n");

  const outlierNote = outlierCount > 0
    ? `\n  (${outlierCount} data outlier diabaikan — kemungkinan harga per unit/satuan, bukan per paket)`
    : "";

  return `[${keyword.toUpperCase()}] (sumber: ${sources}, ${prices.length} data)
  Min     : ${fmt(Math.min(...prices))}
  Max     : ${fmt(Math.max(...prices))}
  Rata-rata: ${fmt(avg)}
  Median  : ${fmt(median)}${outlierNote}
  Contoh:
${examples}`;
}

// ─── Stage 1: Detect Contract Type ──────────────────────────────────────────

export async function detectContractType(
  contractText: string
): Promise<ContractDetection> {
  const snippet = contractText.slice(0, 5000);
  const prompt  = `Deteksi Jenis Kontrak

Analisis teks kontrak berikut dan tentukan jenisnya. Lakukan Mode 0: Deteksi Jenis Kontrak sesuai instruksi di CLAUDE.md.

PENTING: Jika kontrak berisi pembelian barang/perangkat (laptop, komputer, printer, furnitur, kendaraan, dll) maka contract_type = "pengadaan_barang" meskipun barangnya berupa perangkat IT/elektronik. "jasa_it" HANYA untuk pembuatan software/website/aplikasi.

Teks Kontrak (cuplikan):
${snippet}`;

  try {
    const raw    = await runClaude(prompt, CLAUDE_MODELS.haiku);
    const parsed = parseJson(raw) as unknown as ContractDetection;
    return {
      contract_type:  parsed.contract_type  ?? "jasa_lainnya",
      items_to_check: Array.isArray(parsed.items_to_check) ? parsed.items_to_check : [],
      confidence:     parsed.confidence     ?? 0.7,
    };
  } catch {
    return { contract_type: "jasa_lainnya", items_to_check: [], confidence: 0.5 };
  }
}

// ─── Stage 2: Full Contract Review ───────────────────────────────────────────

export interface PriceItem {
  item: string;
  contract_price: number;
  market_estimate: string;
  market_source?: string;
  status: "overpriced" | "fair" | "underpriced";
  notes: string;
}

export interface RiskyClause {
  clause: string;
  risk_level: "high" | "medium" | "low";
  issue: string;
  potential_impact: string;
  suggestion: string;
  regulation_basis?: string;
}

export interface RegulationCheck {
  regulation: string;
  status: "compliant" | "non_compliant" | "unclear";
  notes: string;
}

export interface ContractReviewResult {
  analysis_type: "contract_review";
  contract_type?: ContractType;
  expert_role?: string;
  fairness_score: number;
  price_analysis: PriceItem[];
  risky_clauses: RiskyClause[];
  regulation_compliance?: RegulationCheck[];
  revision_suggestions: string[];
  uncertainty_questions?: string[];
  overall_summary: string;
}

export async function analyzeContract(
  contractText: string,
  model?: string,
  lang: "en" | "id" = "id",
  detection?: ContractDetection,
  preloadedMarketData?: string
): Promise<ContractReviewResult> {
  if (!contractText || contractText.length < 50) {
    throw new Error("Teks kontrak terlalu pendek untuk dianalisis.");
  }

  const contractType = detection?.contract_type ?? "jasa_lainnya";
  const persona      = EXPERT_PERSONAS[contractType];
  const regulations  = REGULATIONS[contractType];

  // Gunakan data yang sudah di-fetch dari route (lebih efisien — progress bisa ditampilkan ke user)
  const marketData = preloadedMarketData ?? "";

  const marketSection = marketData
    ? `\n${marketData}\nGunakan data di atas sebagai referensi UTAMA untuk price_analysis. Sebutkan median, rentang harga, dan selisih % secara eksplisit. Berikan WARNING JELAS jika ada harga yang tidak wajar (>20% di atas median pasar).\n`
    : "";

  const regulationList = regulations.map(r => `- ${r}`).join("\n");

  const langInstruction = lang === "en"
    ? "IMPORTANT: Respond ONLY in English. All JSON text fields must be in English."
    : "PENTING: Respond HANYA dalam Bahasa Indonesia. Semua field teks dalam JSON harus dalam Bahasa Indonesia.";

  const prompt = `Contract Review Request

${langInstruction}

Kamu adalah: ${persona}

Regulasi yang relevan untuk kontrak ini:
${regulationList}
${marketSection}
Lakukan analisis kontrak berikut secara menyeluruh dari sudut pandang keahlianmu. Gunakan regulasi di atas untuk mengidentifikasi klausul yang tidak sesuai hukum. Jika ada informasi yang kurang, masukkan pertanyaan ke field uncertainty_questions.

${lang === "en" ? "Contract Text:" : "Teks Kontrak:"}
${contractText}

Lakukan Contract Review sesuai instruksi Mode 1 di CLAUDE.md.`;

  const raw    = await runClaude(prompt, model);
  const parsed = parseJson(raw) as unknown as ContractReviewResult;

  if (parsed.analysis_type !== "contract_review") {
    throw new Error(lang === "en"
      ? "Agent output does not match Contract Review format."
      : "Output agent tidak sesuai format Contract Review.");
  }

  return parsed;
}

// ─── Contract Q&A ────────────────────────────────────────────────────────────

export interface ContractChatResult { answer: string; }

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
    ? contractText.slice(0, 6000) + "\n...[teks dipotong]"
    : contractText;

  const expertContext = analysisResult?.expert_role
    ? `\nKamu adalah ${EXPERT_PERSONAS[(analysisResult.contract_type ?? "jasa_lainnya") as ContractType] ?? "auditor kontrak profesional"}.`
    : "";

  const analysisContext = analysisResult
    ? `\n\nRingkasan analisis sebelumnya:\n- Fairness score: ${analysisResult.fairness_score}/10\n- Jenis kontrak: ${analysisResult.contract_type ?? "-"}\n- Expert role: ${analysisResult.expert_role ?? "-"}\n- Ringkasan: ${analysisResult.overall_summary}\n- Klausul risiko tinggi: ${analysisResult.risky_clauses.filter(c => c.risk_level === "high").map(c => c.clause).join(", ") || "tidak ada"}\n- Item overpriced: ${analysisResult.price_analysis.filter(p => p.status === "overpriced").map(p => p.item).join(", ") || "tidak ada"}`
    : "";

  const prompt = `Contract Q&A Request
${expertContext}
${langInstruction}

Teks kontrak:
${contractSnippet}
${analysisContext}

Pertanyaan user: ${userQuestion.trim()}

Jawab pertanyaan ini secara profesional sesuai instruksi di CLAUDE.md.`;

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
    ? "IMPORTANT: Respond ONLY in English."
    : "PENTING: Respond HANYA dalam Bahasa Indonesia.";

  const prompt = `Checkpoint Review Request

${langInstruction}

${lang === "en" ? "Contract work specification:" : "Spesifikasi pekerjaan dari kontrak:"}
${contractSpec}

${lang === "en" ? "Work evidence submitted by contractor:" : "Bukti pekerjaan yang disubmit oleh kontraktor:"}
${evidenceText}

${lang === "en" ? "Follow the Checkpoint Review instructions in CLAUDE.md." : "Lakukan Checkpoint Review sesuai instruksi Mode 2 di CLAUDE.md."}`;

  const raw    = await runClaude(prompt, model);
  const parsed = parseJson(raw) as unknown as CheckpointReviewResult;

  if (parsed.analysis_type !== "checkpoint_review") {
    throw new Error(lang === "en"
      ? "Agent output does not match Checkpoint Review format."
      : "Output agent tidak sesuai format Checkpoint Review.");
  }

  return parsed;
}
