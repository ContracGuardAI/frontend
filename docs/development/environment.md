# Environment Variables

All environment variables are set in `frontend/.env.local`. This file is not committed to git.

---

## Variables Reference

### `CLAUDE_MODEL` (Required)

The Claude model used by the AI agent for all analysis tasks.

```env
CLAUDE_MODEL=claude-haiku-4-5-20251001
```

| Value | Description |
|-------|-------------|
| `claude-haiku-4-5-20251001` | Fastest (~5–8s). Best for development and testing. |
| `claude-sonnet-4-6` | Balanced (~15–20s). Recommended for production. |
| `claude-opus-4-7` | Most capable (~30–60s). Best for complex or high-stakes contracts. |

---

### `AGENT_DIR` (Optional)

Override the directory where the Claude CLI agent runs. Defaults to `../agent` relative to the `frontend/` directory.

```env
AGENT_DIR=C:\Users\user\my-custom-agent
```

The referenced directory must contain a `CLAUDE.md` file — this is the system prompt for the AI agent.

---

### `SERPAPI_KEY` (Optional)

API key for SerpAPI. Enables Google Shopping price lookups for contract item benchmarking.

```env
SERPAPI_KEY=your_key_here
```

Get a key at: [serpapi.com](https://serpapi.com)

---

### `GOOGLE_CSE_KEY` (Optional)

Google Cloud API key for Custom Search Engine price lookups.

```env
GOOGLE_CSE_KEY=your_google_api_key_here
```

---

### `GOOGLE_CSE_ID` (Optional)

Your Google Custom Search Engine ID.

```env
GOOGLE_CSE_ID=your_cse_id_here
```

---

## Example `.env.local`

```env
# Required
CLAUDE_MODEL=claude-sonnet-4-6

# Optional — market price APIs
SERPAPI_KEY=abc123xyz
GOOGLE_CSE_KEY=AIzaSy...
GOOGLE_CSE_ID=0123456789abc:example

# Optional — override agent directory
# AGENT_DIR=/absolute/path/to/agent
```

---

## Notes

- Never commit `.env.local` to git — it is listed in `.gitignore`
- There is no `ANTHROPIC_API_KEY` — the app uses Claude CLI subprocess, not the API
- Solana network (Devnet) is hardcoded in the frontend; no RPC URL config is needed
