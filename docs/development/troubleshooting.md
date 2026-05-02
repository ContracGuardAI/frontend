# Troubleshooting

Common issues and how to fix them.

---

## Claude CLI Issues

### "claude: command not found"

The Claude Code CLI is not installed or not in your PATH.

```bash
npm install -g @anthropic-ai/claude-code
```

Then verify:
```bash
claude --version
```

If installed but not found, check your global npm bin directory is in PATH:
```bash
npm config get prefix
# Add <prefix>/bin to your PATH
```

---

### AI analysis returns empty or garbled JSON

**Cause:** Claude returned non-JSON output (a conversational reply, an error message, or markdown-wrapped JSON).

**Fix:** The `parseJson()` function in `contractAgent.ts` handles markdown-wrapped JSON. If it still fails:
1. Check `CLAUDE_MODEL` in `.env.local` — try a more capable model (`claude-sonnet-4-6`)
2. Check the `agent/CLAUDE.md` system prompt is intact
3. Try a shorter or cleaner contract text input

---

### Analysis is slow (> 30 seconds)

**Cause:** Large contract + capable model = slow.

**Fix:**
- Switch `CLAUDE_MODEL` to `claude-haiku-4-5-20251001` for development
- Use `/api/audit-stream` to show progress instead of waiting silently

---

## Wallet & Solana Issues

### "WalletSendTransactionError"

**Possible causes:**
1. **Insufficient SOL** — Need ~0.01 SOL for transaction fees. Get Devnet SOL from a faucet.
2. **Wrong network** — Phantom must be set to **Devnet**, not Mainnet or Testnet
3. **Stale blockhash** — Transaction expired. Try again.
4. **Mint address mismatch** — The `getUsdcMintPDA()` derived address may differ from `config.mint` on-chain. This can happen if the program was redeployed.

**Check Phantom network:**
> Phantom → Settings → Developer Settings → Network → Devnet

**Get Devnet SOL:**
```bash
solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet
```

---

### "Wallet not connected" errors in components

**Cause:** Component is trying to access `wallet.publicKey` before connection.

**Fix:** All wallet-dependent actions are guarded by `if (!wallet.publicKey) return;`. If you see this in a custom component, add the same guard.

---

### Claim USDC button shows cooldown immediately after connect

**Cause:** The `UserMintRecord` account already exists for this wallet from a previous claim.

**Fix:** This is expected behavior. Wait for the 24-hour cooldown to expire, or use a different wallet for testing.

---

## PDF Upload Issues

### "Failed to parse PDF"

**Cause:** Scanned PDF (image-only) or password-protected PDF.

**Fix:**
- Use a PDF with a real text layer
- If scanned, run OCR first (e.g., Adobe Acrobat, Google Drive's OCR feature)
- Remove password protection before uploading

---

### "File too large"

**Cause:** Default Next.js API route body limit is 4 MB.

**Fix:** Increase the limit in `app/api/upload/route.ts`:

```typescript
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
```

---

## Build Issues

### TypeScript errors on build

```bash
cd frontend
npx tsc --noEmit
```

Review any type errors and fix them. Common issues:
- Missing type annotations on API response handlers
- Using `any` where a specific type is expected

---

### `next build` fails with "Module not found"

Check that all dependencies are installed:

```bash
npm install
```

If the issue is with `@anchor-lang/core` or Solana packages, ensure you're on Node 18+:

```bash
node --version  # must be v18+
```
