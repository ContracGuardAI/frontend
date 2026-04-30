import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File tidak ditemukan." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Hanya file PDF yang diterima." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Hash file asli untuk on-chain proof
    const fileHash = createHash("sha256").update(buffer).digest("hex");

    // Extract teks dari PDF
    // Require ke lib langsung untuk bypass bug test file pdf-parse@1.x
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse");
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text?.trim() ?? "";

    if (extractedText.length < 50) {
      return NextResponse.json(
        { success: false, error: "Gagal mengekstrak teks dari PDF. Pastikan PDF bukan hasil scan gambar." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        file_name: file.name,
        file_hash: fileHash,
        page_count: pdfData.numpages,
        char_count: extractedText.length,
        contract_text: extractedText,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memproses file.";
    console.error("[upload/route] Error:", message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
