# Quick Start

## Start the Development Server

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## User Flow

Follow this path to test all features end-to-end:

### Step 1 — Audit a Contract

1. Navigate to `/audit`
2. Upload a PDF contract **or** paste contract text into the text area
3. Click **Analyze Contract**
4. Wait 5–30 seconds (depends on model and contract length)
5. Review the results:
   - **Fairness Score** (1–10)
   - **Risky Clauses** — highlighted in red/yellow
   - **Price Analysis** — each line item vs. market price
   - **Revision Suggestions**

> **Tip:** The analysis is also returned as a structured JSON hash you can record on-chain.

---

### Step 2 — Connect Your Wallet

1. Click **Connect Wallet** in the navbar (top right)
2. Select **Phantom** from the wallet modal
3. Approve the connection in the Phantom popup
4. Your wallet address will appear in the navbar

**Claim Mock USDC** (for testing escrow):
- A **Claim 1,000** button appears next to your wallet address
- Click it to receive 1,000 mock USDC on Devnet
- There is a 24-hour cooldown per wallet

---

### Step 3 — Deploy a Contract On-Chain

1. Navigate to `/create`
2. Fill in contract details:
   - Client wallet address
   - Contractor wallet address
   - Contract title & description
   - Total amount (in USDC)
   - Milestones (title + amount each)
3. Paste the audit hash from Step 1 (optional but recommended)
4. Click **Deploy Contract**
5. Approve the Solana transaction in Phantom
6. Contract is now live on Devnet

---

### Step 4 — Manage Contracts on Dashboard

1. Navigate to `/dashboard`
2. All contracts where you are client or contractor appear here
3. Click a contract to open the detail page
4. **As contractor:** Submit milestone evidence (text/links)
5. **As client:** Review AI-verified milestone → Approve release → Approve transaction

---

## Available Scripts

```bash
npm run dev      # Start dev server (hot reload) on http://localhost:3000
npm run build    # Build for production
npm run start    # Run production build
```
