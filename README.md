# ContractGuard AI

AI-powered contract auditing and on-chain escrow platform built on Solana. Upload a service contract PDF, get a detailed AI audit in seconds, then lock the payment in a Solana smart contract with milestone-based release — all in one flow.

---

## How It Works

```
PDF Upload → AI Audit (Claude) → Review Results → Create On-Chain Contract → Milestone Escrow
```

1. **Audit** — User uploads a PDF contract. The backend extracts text and passes it to the Claude AI agent, which analyzes clauses, detects price markups, and flags risky terms.
2. **Create Contract** — After the audit, the user clicks "Create Contract". The form is pre-filled from audit results. User sets the USDC amount, contractor wallet, and milestones, then deploys to Solana Devnet.
3. **Dashboard** — Both client and contractor track progress. Contractor submits evidence per milestone; the AI agent reviews it; client approves or requests revision.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | CSS-in-JS (inline styles), Tailwind CSS |
| Blockchain | Solana Devnet, Anchor 1.0 |
| Wallet | Phantom via `@solana/wallet-adapter` |
| AI Agent | Claude Code CLI (`claude -p`) as a subprocess |
| Token | Mock USDC (custom SPL mint on Devnet) |
| PDF parsing | pdf-parse |

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Node.js](https://nodejs.org) | 18+ | |
| [Claude Code CLI](https://claude.ai/code) | latest | The AI agent runs as a `claude` subprocess |
| [Phantom Wallet](https://phantom.app) | latest | Browser extension for Solana |

---

## Folder Structure

This project is part of a monorepo. **The three folders must share the same parent directory:**

```
Frontier/
├── frontend/              ← Next.js app (this folder)
│   ├── app/
│   │   ├── api/           ← API routes (upload, audit-stream, checkpoint)
│   │   ├── audit/         ← Audit page
│   │   ├── create/        ← Create contract page
│   │   ├── dashboard/     ← Dashboard + contract detail
│   │   └── lib/
│   │       ├── contractAgent.ts   ← Agent runner (spawns claude CLI)
│   │       ├── useContractProgram.ts  ← Solana/Anchor hooks & PDAs
│   │       └── idl.ts             ← Anchor IDL
│   └── .env.local
│
├── contractguard-agent/   ← AI agent context
│   └── CLAUDE.md          ← Agent system prompt (contract review instructions)
│
└── smartcontract/         ← Solana Anchor program (deployed on Devnet)
```

> The frontend resolves the agent at `../contractguard-agent` by default. You can override this with `AGENT_DIR` in `.env.local`.

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd Frontier/frontend
npm install
```

### 2. Log in to Claude Code CLI

The AI agent runs by spawning `claude -p` as a child process. You must be authenticated:

```bash
claude login
```

Verify it works:
```bash
claude -p "Say hello" --output-format text
```

### 3. Set up environment variables

Create `frontend/.env.local`:

```env
# Claude model for the AI agent
# claude-haiku-4-5-20251001  → fast & cheap (good for testing)
# claude-sonnet-4-6           → balanced (recommended)
# claude-opus-4-7             → most capable (for important demos)
CLAUDE_MODEL=claude-sonnet-4-6

# Optional: override agent folder path
# AGENT_DIR=/absolute/path/to/contractguard-agent
```

### 4. Set up Phantom Wallet on Devnet

1. Install [Phantom](https://phantom.app)
2. Go to **Settings → Developer Settings → Change Network → Devnet**
3. Get free testnet SOL: [faucet.solana.com](https://faucet.solana.com)

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How the AI Agent Works

The agent is **not an API call** — it runs Claude Code CLI as a subprocess directly on your machine.

When a user uploads a contract for audit, the backend (`app/lib/contractAgent.ts`) does this:

```
Next.js API route → spawn("claude", ["-p", "--model", ...]) → contractguard-agent/ (cwd)
                                                                       ↓
                                                               CLAUDE.md is loaded as context
                                                                       ↓
                                                               Contract text sent via stdin
                                                                       ↓
                                                               Claude responds with JSON
```

**`contractguard-agent/CLAUDE.md`** is the agent's system prompt. It defines two modes:

- **Contract Review** — analyzes a full contract PDF. Returns a JSON with `fairness_score`, `price_analysis`, `risky_clauses`, and `overall_summary`.
- **Checkpoint Review** — checks a contractor's submitted evidence against contract specs. Returns `APPROVED`, `NEEDS_REVISION`, or `MAJOR_ISSUE`.

The agent always responds in the same language as the UI (EN/ID), enforced via the prompt.

---

## Testing the Full Flow

### Step 1 — Audit a contract
1. Go to `/audit`
2. Upload any PDF contract (must contain selectable text, not a scanned image)
3. Wait for the AI to analyze (~15–60 seconds depending on contract length)
4. Review the fairness score, risky clauses, and overpriced items

### Step 2 — Create an on-chain contract
1. Click **Create Contract** in the audit results (form is pre-filled from the audit)
2. On `/create`, connect your Phantom wallet
3. Click **Claim 1,000 USDC** to get mock USDC for testing (24h cooldown per wallet)
4. Fill in the contractor wallet address and USDC amount
5. Adjust milestones if needed, then click **Deploy Contract**
6. Approve the transaction in Phantom

### Step 3 — Manage on the dashboard
1. Go to `/dashboard` to see your deployed contract
2. From the contract detail page you can submit evidence, approve milestones, or cancel

---

## On-Chain Details

- **Network:** Solana Devnet
- **Program ID:** `2Htsz7Xf4YWZTc8tupBTgsFHwZNZDzi59FRr9AWmxdNq`
- **Token:** Mock USDC (custom SPL mint, 6 decimals, 1,000 per claim, 24h cooldown)
- **Escrow:** USDC locked in a PDA escrow token account on contract creation, released per approved milestone

---

## Production Build

```bash
npm run build
npm run start
```

---

## Troubleshooting

**`Gagal menjalankan Claude Code` / `Failed to run Claude Code`**
→ Claude CLI is not installed or not logged in. Run `claude login` and try again.

**PDF upload fails with "failed to extract text"**
→ The PDF is likely a scanned image. Use a PDF with real selectable text.

**`[Fast Refresh] rebuilding` is very slow on first load**
→ Normal — Solana/Anchor dependencies are heavy. Subsequent navigations are fast once compiled.

**Wallet won't connect**
→ Install Phantom, set it to **Devnet**, and refresh the page.

**Transaction fails**
→ You need SOL for fees (~0.01 SOL minimum). Claim at [faucet.solana.com](https://faucet.solana.com).

**Claim USDC fails with "cooldown active"**
→ Each wallet can only claim once every 24 hours. Use a different wallet for testing.
