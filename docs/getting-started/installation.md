# Installation

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | LTS recommended |
| npm | 8+ | Included with Node.js |
| Claude Code CLI | latest | `npm i -g @anthropic-ai/claude-code` |
| Phantom Wallet | latest | Browser extension |
| Git | any | For cloning the repo |

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-org/contractguard-ai.git
cd contractguard-ai/frontend
```

## 2. Install Dependencies

```bash
npm install
```

This installs:
- `next` 14.2.5
- `@solana/web3.js`, `@solana/wallet-adapter-*`
- `@anchor-lang/core`
- `pdf-parse`
- TypeScript + Tailwind CSS dev tools

## 3. Install & Authenticate Claude CLI

ContractGuard uses the Claude Code CLI as its AI engine. The CLI must be installed and authenticated separately from this project.

```bash
# Install globally
npm install -g @anthropic-ai/claude-code

# Authenticate (opens browser login)
claude login
```

> **Important:** The CLI authentication is per-machine. You only need to do this once.
> The frontend calls `claude -p "..."` as a subprocess — no Anthropic API key is needed in `.env`.

## 4. Verify Installation

```bash
# Check Node.js
node --version     # should be v18+

# Check Claude CLI
claude --version

# Check wallet extension
# Open your browser → Phantom extension should be visible
```

---

## Next Step

Configure your environment variables → [Configuration](configuration.md)
