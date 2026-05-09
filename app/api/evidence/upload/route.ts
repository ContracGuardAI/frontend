import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

// Root folder evidence: D:\frontier\evidence\
const EVIDENCE_ROOT = path.resolve(process.cwd(), "..", "evidence");

export async function POST(req: NextRequest) {
  const jwt = process.env.PINATA_JWT;

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

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const relativePath = `${pdaAddress}/${checkpointIndex}/${timestamp}_${safeName}`;

  // ── 1. Simpan ke lokal disk ────────────────────────────────
  const localDir  = path.join(EVIDENCE_ROOT, pdaAddress, checkpointIndex);
  const localFile = path.join(localDir, `${timestamp}_${safeName}`);
  let localPath: string | null = null;
  try {
    await mkdir(localDir, { recursive: true });
    await writeFile(localFile, buffer);
    localPath = localFile;
    console.log(`[evidence/upload] Saved locally: ${localFile}`);
  } catch (e) {
    console.error("[evidence/upload] Local save failed:", e);
    // Tidak hard-fail
  }

  // ── 2. Upload ke Pinata (opsional, untuk CID on-chain) ────
  let ipfsCid: string | null = null;
  if (jwt) {
    try {
      const pinataForm = new FormData();
      pinataForm.append("file", new Blob([buffer], { type: file.type }), file.name);
      pinataForm.append("pinataMetadata", JSON.stringify({ name: `evidence_${timestamp}_${file.name}` }));
      pinataForm.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

      const pinataRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
        body: pinataForm,
      });

      if (pinataRes.ok) {
        const pinataData = await pinataRes.json() as { IpfsHash: string };
        ipfsCid = pinataData.IpfsHash;
        console.log(`[evidence/upload] Pinata CID: ${ipfsCid}`);
      }
    } catch (e) {
      console.error("[evidence/upload] Pinata error:", e);
    }
  }

  // ── 3. Upload ke Supabase Storage (backup) ────────────────
  let supabasePath: string | null = null;
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (!buckets?.find(b => b.name === "evidence")) {
      await supabaseAdmin.storage.createBucket("evidence", { public: false });
    }
    const { error: storageErr } = await supabaseAdmin.storage
      .from("evidence")
      .upload(relativePath, buffer, { contentType: file.type, upsert: false });
    if (!storageErr) supabasePath = relativePath;
  } catch (e) {
    console.error("[evidence/upload] Supabase storage error:", e);
  }

  // ── 4. Simpan record ke evidence_submissions ──────────────
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

  const { data: submission } = await supabaseAdmin
    .from("evidence_submissions")
    .insert({
      checkpoint_id: checkpoint?.id ?? null,
      ipfs_cid: ipfsCid ?? `local_${timestamp}`,
      supabase_path: supabasePath,
      file_type: file.type,
      file_size: file.size,
      submitted_by: contractorWallet ?? null,
      // local_path disimpan di metadata jika kolom ada, atau fallback ke supabase_path
    })
    .select("id")
    .single();

  return Response.json({
    ipfsCid: ipfsCid ?? `local_${timestamp}`,
    supabasePath,
    localPath,
    submissionId: submission?.id ?? null,
    success: true,
  });
}
