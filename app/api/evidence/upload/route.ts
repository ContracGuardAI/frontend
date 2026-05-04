import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

export async function POST(req: NextRequest) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return Response.json({ error: "Pinata not configured" }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const pdaAddress = formData.get("pdaAddress") as string | null;
  const checkpointIndex = formData.get("checkpointIndex") as string | null;
  const contractorWallet = formData.get("contractorWallet") as string | null;

  if (!file || file.size === 0) return Response.json({ error: "No file provided" }, { status: 400 });
  if (!pdaAddress) return Response.json({ error: "pdaAddress is required" }, { status: 400 });
  if (checkpointIndex === null) return Response.json({ error: "checkpointIndex is required" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: "Format tidak didukung. Gunakan JPG, PNG, atau PDF." }, { status: 400 });
  }
  if (file.size > 100 * 1024 * 1024) {
    return Response.json({ error: "File terlalu besar (max 100MB)" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // ── 1. Upload ke Pinata (untuk CID on-chain) ──────────────
  const pinataForm = new FormData();
  pinataForm.append("file", new Blob([buffer], { type: file.type }), file.name);
  pinataForm.append("pinataMetadata", JSON.stringify({ name: `evidence_${Date.now()}_${file.name}` }));
  pinataForm.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  const pinataRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: pinataForm,
  });

  if (!pinataRes.ok) {
    const errText = await pinataRes.text();
    console.error("[evidence/upload] Pinata error:", errText);
    return Response.json({ error: "Upload ke IPFS gagal" }, { status: 502 });
  }

  const pinataData = await pinataRes.json() as { IpfsHash: string };
  const ipfsCid = pinataData.IpfsHash;

  // ── 2. Upload ke Supabase Storage (untuk AI bisa baca) ───
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const supabasePath = `${pdaAddress}/${checkpointIndex}/${timestamp}_${safeName}`;

  // Auto-create bucket jika belum ada
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (!buckets?.find(b => b.name === "evidence")) {
    await supabaseAdmin.storage.createBucket("evidence", { public: false });
  }

  const { error: storageErr } = await supabaseAdmin.storage
    .from("evidence")
    .upload(supabasePath, buffer, { contentType: file.type, upsert: false });

  if (storageErr) {
    console.error("[evidence/upload] Supabase storage error:", storageErr);
    // Tidak hard-fail — CID Pinata sudah ada, lanjutkan
  }

  // ── 3. Simpan record ke evidence_submissions ──────────────
  // Cari contract_id dulu, lalu checkpoint_id
  const { data: contract } = await supabaseAdmin
    .from("contracts")
    .select("id")
    .eq("pda_address", pdaAddress)
    .maybeSingle();

  const { data: checkpoint } = contract
    ? await supabaseAdmin
        .from("checkpoints")
        .select("id")
        .eq("contract_id", contract.id)
        .eq("checkpoint_index", parseInt(checkpointIndex))
        .maybeSingle()
    : { data: null };

  // Simpan dengan checkpoint_id jika ketemu
  const { data: submission } = await supabaseAdmin
    .from("evidence_submissions")
    .insert({
      checkpoint_id: checkpoint?.id ?? null,
      ipfs_cid: ipfsCid,
      supabase_path: storageErr ? null : supabasePath,
      file_type: file.type,
      file_size: file.size,
      submitted_by: contractorWallet ?? null,
    })
    .select("id")
    .single();

  return Response.json({
    ipfsCid,
    supabasePath: storageErr ? null : supabasePath,
    submissionId: submission?.id ?? null,
    success: true,
  });
}
