# POST /api/checkpoint

Verify a contractor's milestone submission against the contract specification using AI.

---

## Request

```http
POST /api/checkpoint
Content-Type: application/json
```

**Body:**

```typescript
{
  contractSpec: string,    // Required — original contract text or milestone specification
  evidenceText: string,    // Required — contractor's submitted evidence
  model?: string,          // Optional — Claude model
  lang?: "en" | "id"       // Optional — response language (default: "id")
}
```

---

## Response

```typescript
// 200 OK
{
  success: true,
  data: CheckpointReviewResult
}
```

### `CheckpointReviewResult` Schema

```typescript
{
  analysis_type: "checkpoint_review",
  status: "APPROVED" | "NEEDS_REVISION" | "MAJOR_ISSUE",
  compliance_score: number,      // 0–100
  findings: string,              // Summary of what the AI found
  required_fixes: string[],      // Specific items that must be corrected
  approved_items: string[]       // Items that meet the specification
}
```

---

## Example

```bash
curl -X POST http://localhost:3000/api/checkpoint \
  -H "Content-Type: application/json" \
  -d '{
    "contractSpec": "Milestone 1: Deliver UI mockups for 5 screens in Figma with responsive design",
    "evidenceText": "Figma link: figma.com/file/xxx — Contains 5 screens: Home, Login, Dashboard, Profile, Settings. Desktop and mobile variants included.",
    "lang": "en"
  }'
```

```json
{
  "success": true,
  "data": {
    "analysis_type": "checkpoint_review",
    "status": "APPROVED",
    "compliance_score": 92,
    "findings": "All 5 required screens are present with both desktop and mobile variants. Design quality is consistent and responsive.",
    "required_fixes": [],
    "approved_items": [
      "5 screens delivered as specified",
      "Desktop and mobile variants included",
      "Figma file is accessible and organized"
    ]
  }
}
```

---

## Status Meanings

| Status | Score Range | Action |
|--------|-------------|--------|
| `APPROVED` | 80–100 | Client may approve payment release |
| `NEEDS_REVISION` | 50–79 | Contractor must fix specific items |
| `MAJOR_ISSUE` | 0–49 | Significant non-compliance; review required |
