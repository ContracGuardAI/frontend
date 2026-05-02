# Configuration

## Environment Variables

Create `.env.local` in the `frontend/` directory:

```bash
cp .env.example .env.local   # if example exists
# or create manually:
touch .env.local
```

### Required

```env
# Claude model for AI contract analysis
# Options: claude-haiku-4-5-20251001 | claude-sonnet-4-6 | claude-opus-4-7
CLAUDE_MODEL=claude-haiku-4-5-20251001
```

| Value | Speed | Quality | Best For |
|-------|-------|---------|----------|
| `claude-haiku-4-5-20251001` | Fast (~5s) | Good | Development, testing |
| `claude-sonnet-4-6` | Medium (~15s) | Great | Production, demos |
| `claude-opus-4-7` | Slow (~30s) | Best | Important audits |

### Optional — Price Scraping

ContractGuard can benchmark contract prices against real market data. To enable:

```env
# SerpAPI — Google Shopping results
SERPAPI_KEY=your_serpapi_key_here
```

> Without this key, price analysis still runs using Blibli data only.

### Optional — Agent Path Override

```env
# Override the AI agent directory (defaults to ../agent relative to frontend/)
AGENT_DIR=/absolute/path/to/contractguard-agent
```

---

## Solana Network

The app connects to **Solana Devnet** by default. No additional configuration is needed.

Program ID (deployed on Devnet):
```
2Htsz7Xf4YWZTc8tupBTgsFHwZNZDzi59FRr9AWmxdNq
```

To test with on-chain features, you'll need Phantom Wallet configured to **Devnet**:
1. Open Phantom → Settings → Developer Settings → Change Network → Devnet
2. Get Devnet SOL from [sol-faucet.com](https://sol-faucet.com) or the Solana CLI faucet

---

## Next Step

Run the development server → [Quick Start](quick-start.md)
