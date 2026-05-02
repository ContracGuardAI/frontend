# POST /api/upload

Extract text from an uploaded PDF contract.

---

## Request

```http
POST /api/upload
Content-Type: multipart/form-data
```

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | PDF file to extract text from |

---

## Response

```typescript
// 200 OK
{
  success: true,
  data: {
    text: string,         // Full extracted text from the PDF
    pageCount: number,    // Number of pages
    charCount: number     // Character count of extracted text
  }
}
```

---

## Example

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@contract.pdf"
```

```json
{
  "success": true,
  "data": {
    "text": "PERJANJIAN KERJA SAMA\n\nPasal 1 - Definisi\n...",
    "pageCount": 12,
    "charCount": 8431
  }
}
```

---

## Notes

- Only `.pdf` files are accepted
- Text extraction uses `pdf-parse` library
- Scanned PDFs (image-based) may return empty or low-quality text — use a text-layer PDF when possible
- The extracted `text` value is what you pass to `/api/audit`
