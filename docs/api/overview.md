# API Reference — Overview

All API routes are Next.js Route Handlers located in `app/api/`. They run server-side and are not exposed to the client as JavaScript.

---

## Base URL

In development: `http://localhost:3000`

---

## Available Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | [`/api/upload`](upload.md) | Upload and parse a PDF contract |
| `POST` | [`/api/audit`](audit.md) | Analyze a contract with AI |
| `POST` | [`/api/audit-stream`](audit-stream.md) | Stream audit results in real time |
| `POST` | [`/api/checkpoint`](checkpoint.md) | Verify milestone evidence with AI |
| `POST` | [`/api/chat-contract`](chat-contract.md) | Ask questions about a contract |

---

## Common Request Headers

```http
Content-Type: application/json
```

For file upload (`/api/upload`):
```http
Content-Type: multipart/form-data
```

---

## Common Response Shape

All endpoints return JSON:

```typescript
// Success
{
  success: true,
  data: { ... }       // endpoint-specific payload
}

// Error
{
  success: false,
  error: "Error message describing what went wrong"
}
```

---

## Error Codes

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad request — missing or invalid parameters |
| 500 | Server error — AI call failed, parsing error, etc. |

---

## AI Model Selection

All AI endpoints accept an optional `model` field in the request body:

```json
{
  "model": "claude-sonnet-4-6"
}
```

Valid values:
- `claude-haiku-4-5-20251001` — fastest
- `claude-sonnet-4-6` — balanced (recommended)
- `claude-opus-4-7` — most capable

If omitted, defaults to the `CLAUDE_MODEL` environment variable.
