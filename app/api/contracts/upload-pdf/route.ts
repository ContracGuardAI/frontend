import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const EVIDENCE_ROOT = path.resolve(process.cwd(), "..", "evidence");

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const pdaAddress = formData.get("pdaAddress") as string | null;

  if (!file || file.size === 0) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }
  if (!pdaAddress) {
    return Response.json({ error: "pdaAddress is required" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return Response.json({ error: "Only PDF files are allowed" }, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) {
    return Response.json({ error: "File terlalu besar (max 50MB)" }, { status: 400 });
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${pdaAddress}/${timestamp}_${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // ── 1. Simpan ke lokal: evidence/{pdaAddress}/contract/{filename} ──────────
  const localDir  = path.join(EVIDENCE_ROOT, pdaAddress, "contract");
  const localFile = path.join(localDir, safeName);
  try {
    await mkdir(localDir, { recursive: true });
    await writeFile(localFile, buffer);
    console.log(`[upload-pdf] Saved locally: ${localFile}`);
  } catch (e) {
    console.error("[upload-pdf] Local save failed:", e);
  }

  // ── 2. Upload ke Supabase Storage ─────────────────────────────────────────
  const { error } = await supabaseAdmin.storage
    .from("contracts")
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
    console.error("[upload-pdf] Supabase upload error:", error);
    return Response.json({ error: "Upload gagal: " + error.message }, { status: 500 });
  }

  // Update pdf_path di tabel contracts
  await supabaseAdmin
    .from("contracts")
    .update({ pdf_path: storagePath })
    .eq("pda_address", pdaAddress);

  return Response.json({ path: storagePath, success: true });
}
