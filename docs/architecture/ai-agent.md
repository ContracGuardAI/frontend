# AI Agent Architecture

## How the AI Works

ContractGuard does not call the Anthropic API directly. Instead, it spawns the **Claude Code CLI** as a child process from the Next.js API routes. This approach means:

- No API key in `.env` — uses the developer's authenticated Claude CLI session
- The agent's behavior is controlled by a `CLAUDE.md` system prompt file
- All AI outputs are returned as structured JSON

---

## Agent Directory

The agent context lives at `agent/CLAUDE.md` (relative to `frontend/`). This file contains:

1. **Expert persona** — Senior auditor with 10+ years in Indonesian procurement contracts
2. **Three operating modes** (triggered by prompt structure):
   - **Mode 1: Contract Review** → Full analysis, returns `ContractReviewResult` JSON
   - **Mode 2: Checkpoint Review** → Milestone verification, returns `CheckpointReviewResult` JSON
   - **Mode 3: Contract Q&A** → Conversational answers about a specific contract
3. **Indonesian law references** (UU, PP, Perpres, KUH Perdata) for compliance checks

---

## How `contractAgent.ts` Works

**File:** `app/lib/contractAgent.ts`

### Core Execution — `runClaude(prompt, model)`

```typescript
function runClaude(prompt: string, model: string): Promise<string>
```

Internally this runs:
```bash
claude -p "<prompt>" --model <model> --output-format text
```

The subprocess is spawned from `AGENT_DIR` (defaults to `../agent`) so the `CLAUDE.md` system prompt is picked up automatically.

---

### Contract Analysis — `analyzeContract()`

```typescript
async function analyzeContract(
  contractText: string,
  model?: string,         // defaults to CLAUDE_MODEL env var
  lang?: "en" | "id",    // response language
  detection?: ContractDetectionResult,
  preloadedMarketData?: Record<string, string>
): Promise<ContractReviewResult>
```

**Execution steps:**
1. Detect contract type via `detectContractType(contractText)` (separate Claude call)
2. Optionally fetch market prices for each line item via `fetchAllMarketPrices(keywords)`
3. Build a structured prompt injecting contract text + market data + language
4. Call `runClaude(prompt, model)` → parse JSON output

**Returns:**
```typescript
interface ContractReviewResult {
  analysis_type: "contract_review"
  contract_type?: ContractType        // e.g. "jasa_it"
  expert_role?: string
  fairness_score: number              // 1–10
  price_analysis: PriceItem[]
  risky_clauses: RiskyClause[]        // risk: "high" | "medium" | "low"
  regulation_compliance?: RegulationCheck[]
  revision_suggestions: string[]
  uncertainty_questions?: string[]
  overall_summary: string
}
```

---

### Checkpoint Verification — `reviewCheckpoint()`

```typescript
async function reviewCheckpoint(
  contractSpec: string,
  evidenceText: string,
  model?: string,
  lang?: "en" | "id"
): Promise<CheckpointReviewResult>
```

**Returns:**
```typescript
interface CheckpointReviewResult {
  analysis_type: "checkpoint_review"
  status: "APPROVED" | "NEEDS_REVISION" | "MAJOR_ISSUE"
  compliance_score: number            // 0–100
  findings: string
  required_fixes: string[]
  approved_items: string[]
}
```

---

### Contract Q&A — `chatContract()`

```typescript
async function chatContract(
  contractText: string,
  analysisResult?: ContractReviewResult | null,
  userQuestion: string,
  model?: string,
  lang?: "en" | "id"
): Promise<string>          // plain text answer
```

---

## Market Price Integration

When Claude reviews pricing in a contract, it can optionally benchmark against real market data:

| Source | Function | API Required |
|--------|----------|-------------|
| Blibli.com | `fetchBlibliPrices(keyword)` | No (web scraping) |
| Google Shopping | `fetchSerpApiPrices(keyword)` | `SERPAPI_KEY` |
| Google Custom Search | `fetchGoogleCsePrices(keyword)` | `GOOGLE_CSE_KEY` + `GOOGLE_CSE_ID` |

All three run in parallel via `fetchAllMarketPrices(keywords)`. Results are summarized via `summarizePrices()` which filters outliers and formats a human-readable price range.

---

## Supported Contract Types

```typescript
type ContractType =
  | "pengadaan_barang"    // Goods procurement
  | "konstruksi"           // Construction
  | "jasa_it"              // IT services
  | "jasa_konsultasi"      // Consulting
  | "jasa_hukum"           // Legal services
  | "jasa_pendidikan"      // Education/training
  | "ketenagakerjaan"      // Employment
  | "jasa_lainnya"         // Other services
```

Each type maps to a specific expert persona and a set of Indonesian regulations used for compliance checking.
