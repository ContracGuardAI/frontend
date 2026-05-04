import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";

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
  const path = `${pdaAddress}/${timestamp}_${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabaseAdmin.storage
    .from("contracts")
    .upload(path, arrayBuffer, {
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
    .update({ pdf_path: path })
    .eq("pda_address", pdaAddress);

  return Response.json({ path, success: true });
}
