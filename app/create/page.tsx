"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "../components/Toast";
import { useLanguage } from "../components/LanguageProvider";
import ClaimUsdcButton from "../components/ClaimUsdcButton";
import {
  useContractProgram, getContractPDA, getUsdcMintPDA, getATA,
  usdcToUnits, hashString, BN, PublicKey,
  TOKEN_PROGRAM_ID,
} from "../lib/useContractProgram";

const glass = {
  background: "var(--surface)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid var(--border)",
  boxShadow: "var(--glass-shadow)",
  borderRadius: "16px",
} as const;

const inputStyle = {
  width: "100%",
  background: "var(--input-bg)",
  border: "1px solid var(--input-border)",
  borderRadius: "8px",
  padding: "12px 16px",
  color: "var(--input-text)",
  fontSize: "14px",
  outline: "none",
  fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
  boxSizing: "border-box" as const,
  transition: "border-color 0.2s",
} as const;

const labelStyle = {
  fontSize: "12px",
  letterSpacing: "0.8px",
  color: "var(--text-3)",
  marginBottom: "8px",
  display: "block",
} as const;

interface Checkpoint {
  name: string;
  description: string;
  payment: string;
}

const PROGRAM_ID = "2Htsz7Xf4YWZTc8tupBTgsFHwZNZDzi59FRr9AWmxdNq";

export default function CreatePage() {
  const { t, lang } = useLanguage();
  const { program, wallet } = useContractProgram();
  const [step, setStep] = useState(1);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [contractPDA, setContractPDA] = useState<string>("");

  /* Step 1 state */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contractorWallet, setContractorWallet] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [usdcBalance, setUsdcBalance] = useState(0);

  /* Step 2 state */
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([
    { name: "Foundation & Structure", description: "Pondasi dan struktur bangunan selesai", payment: "30" },
    { name: "Roofing & Walls", description: "Atap dan dinding selesai", payment: "40" },
    { name: "Finishing", description: "Pengecatan, lantai, dan finishing", payment: "30" },
  ]);

  /* Pre-fill dari hasil audit */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("contractguard_prefill");
      if (!raw) return;
      sessionStorage.removeItem("contractguard_prefill");
      const data = JSON.parse(raw) as { title?: string; description?: string; checkpoints?: Checkpoint[] };
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.checkpoints?.length) setCheckpoints(data.checkpoints);
    } catch {}
  }, []);

  const addCheckpoint = () => {
    setCheckpoints([...checkpoints, { name: "", description: "", payment: "" }]);
  };

  const removeCheckpoint = (i: number) => {
    setCheckpoints(checkpoints.filter((_, idx) => idx !== i));
  };

  const updateCheckpoint = (i: number, field: keyof Checkpoint, value: string) => {
    const updated = [...checkpoints];
    updated[i] = { ...updated[i], [field]: value };
    setCheckpoints(updated);
  };

  const totalPercent = checkpoints.reduce((sum, cp) => sum + (parseFloat(cp.payment) || 0), 0);

  const handleDeploy = async () => {
    if (!program || !wallet.publicKey) {
      toast.error("Wallet not connected", "Please connect your Phantom wallet first");
      return;
    }
    if (!contractorWallet) {
      toast.error("Missing contractor", "Enter the contractor wallet address");
      return;
    }
    const usdcAmt = parseFloat(totalAmount);
    if (!usdcAmt || usdcAmt <= 0) {
      toast.error("Invalid amount", "Enter a valid USDC amount");
      return;
    }
    if (usdcBalance < usdcAmt) {
      toast.error("Insufficient USDC", `You have ${usdcBalance.toFixed(2)} USDC, need ${usdcAmt}`);
      return;
    }

    setDeploying(true);
    toast.info("Deploying to Solana...", "Awaiting wallet signature");

    try {
      const contractor    = new PublicKey(contractorWallet);
      const createdAt     = new BN(Math.floor(Date.now() / 1000));
      const totalUnits    = usdcToUnits(usdcAmt);
      const mint          = getUsdcMintPDA();
      const clientATA     = getATA(mint, wallet.publicKey);
      const pda           = getContractPDA(wallet.publicKey, contractor, createdAt);
      const escrowATA     = getATA(mint, pda);

      const contractHash  = await hashString(`${title}|${description}|${Date.now()}`);
      const aiReviewHash  = await hashString(`ai_review|${contractHash}`);

      // Distribute USDC proportionally across checkpoints
      const cpInputs = checkpoints.map((cp, i) => {
        const pct     = parseFloat(cp.payment) || 0;
        const payment = new BN(Math.round((pct / 100) * totalUnits.toNumber()));
        const deadline = new BN(Math.floor(Date.now() / 1000) + (i + 1) * 30 * 86400);
        return {
          descriptionHash: (cp.description || `Checkpoint ${i + 1}`).slice(0, 64),
          paymentAmount: payment,
          deadline,
        };
      });
      // Fix rounding: last checkpoint gets remainder
      const sumSoFar = cpInputs.slice(0, -1).reduce((s, c) => s.add(c.paymentAmount), new BN(0));
      cpInputs[cpInputs.length - 1].paymentAmount = totalUnits.sub(sumSoFar);

      type Methods = {
        createContract: (
          a: BN, b: string, c: string, d: BN,
          e: number, f: number, g: number, h: number, i: number,
          j: typeof cpInputs,
        ) => { accounts: (accs: object) => { rpc: () => Promise<string> } }
      };

      await (program.methods as never as Methods).createContract(
        createdAt, contractHash, aiReviewHash, totalUnits,
        10, 500, 7, 3, 3,
        cpInputs,
      ).accounts({
        client:               wallet.publicKey,
        contractor,
        contract:             pda,
        mint,
        escrowTokenAccount:   escrowATA,
        clientTokenAccount:   clientATA,
        tokenProgram:         TOKEN_PROGRAM_ID,
      }).rpc();

      setContractPDA(pda.toBase58());
      setDeploying(false);
      setDeployed(true);
      toast.success("Contract deployed!", `${usdcAmt} USDC locked in escrow`);
    } catch (err: unknown) {
      setDeploying(false);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Deploy failed", msg.slice(0, 80));
    }
  };

  const STEPS = [
    { num: 1, label: t("create.step1") },
    { num: 2, label: t("create.step2") },
    { num: 3, label: t("create.step3") },
  ];

  const stepAnim = { animation: "fadeSlideUp 0.38s cubic-bezier(0.16,1,0.3,1) 0.04s both" };

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <Navbar />

      <div style={{
        position: "fixed", pointerEvents: "none", zIndex: 0,
        top: "40%", left: "50%", transform: "translate(-50%, -50%)",
        width: "65%", height: "65%",
        background: "radial-gradient(ellipse, var(--orb) 0%, transparent 65%)",
        filter: "blur(70px)",
      }} />

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "120px 40px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <div className="page-in p0" style={{
            display: "inline-flex", alignItems: "center",
            border: "1px solid var(--accent-border-strong)", borderRadius: "999px",
            padding: "4px 14px", fontSize: "11px",
            color: "var(--accent-text)", background: "var(--accent-bg)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            boxShadow: "inset 0 1px 0 var(--accent-glow), 0 0 14px var(--accent-glow)",
            marginBottom: "18px", letterSpacing: "1.5px",
          }}>{t("create.badge")}</div>
          <h1 className="page-in p1" style={{
            fontSize: "clamp(32px,3.5vw,48px)", fontWeight: 900,
            letterSpacing: "-0.04em", color: "var(--text)", marginBottom: "12px",
          }}>
            {t("create.headline")}
          </h1>
          <p className="page-in p2" style={{ fontSize: "14px", color: "var(--text-3)", lineHeight: 1.7 }}>
            {t("create.subtitle")}
          </p>
        </div>

        {/* USDC claim bar */}
        <div className="page-in p3" style={{ marginBottom: "32px" }}>
          <ClaimUsdcButton onBalanceChange={setUsdcBalance} />
        </div>

        {/* Step indicators */}
        <div className="page-in p3" style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "48px", gap: "0" }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center" }}>
              <div
                onClick={() => !deployed && s.num < step && setStep(s.num)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  cursor: s.num < step && !deployed ? "pointer" : "default",
                }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 700,
                  background: step === s.num ? "linear-gradient(135deg, var(--accent), var(--accent-2))" : step > s.num ? "rgba(80,220,140,0.15)" : "var(--surface-2)",
                  border: step === s.num ? "none" : step > s.num ? "1px solid rgba(80,220,140,0.40)" : "1px solid var(--border)",
                  color: step === s.num ? "var(--btn-primary-text)" : step > s.num ? "rgba(80,220,140,0.90)" : "var(--text-3)",
                  boxShadow: step === s.num ? `0 0 0 4px var(--accent-glow), 0 0 16px var(--accent-glow)` : "none",
                  transition: "all 0.3s ease",
                }}>
                  {step > s.num ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7 L5.5 10.5 L12 4" stroke="rgba(80,220,140,0.90)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : s.num}
                </div>
                <span style={{
                  fontSize: "13px", fontWeight: step === s.num ? 700 : 400,
                  color: step === s.num ? "var(--text)" : step > s.num ? "var(--text-2)" : "var(--text-4)",
                }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: "60px", height: "1px", margin: "0 12px",
                  background: step > s.num ? "rgba(80,220,140,0.35)" : "var(--border-light)",
                  transition: "background 0.3s ease",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div key="step1" style={{ ...glass, padding: "40px 44px", ...stepAnim }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "32px", letterSpacing: "-0.025em" }}>
              {t("create.s1Title")}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div>
                <label style={labelStyle}>{t("create.labelTitle")}</label>
                <input style={inputStyle} placeholder={t("create.phTitle")}
                  value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>{t("create.labelDesc")}</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "90px", resize: "vertical" } as React.CSSProperties}
                  placeholder={t("create.phDesc")}
                  value={description} onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>{t("create.labelClient")}</label>
                  <input style={{ ...inputStyle, color: "var(--text-3)", cursor: "not-allowed" }}
                    value={wallet.publicKey?.toBase58() ?? "Connect wallet"} readOnly />
                </div>
                <div>
                  <label style={labelStyle}>{t("create.labelContractor")}</label>
                  <input style={inputStyle} placeholder={t("create.phContractor")}
                    value={contractorWallet} onChange={e => setContractorWallet(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>{t("create.labelAmount")}</label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input style={{ ...inputStyle, flex: 1 }} type="number" placeholder="0.00"
                    value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
                  <div style={{
                    padding: "10px 16px", borderRadius: "8px",
                    background: "rgba(39,117,255,0.10)",
                    border: "1px solid rgba(39,117,255,0.25)",
                    fontSize: "13px", fontWeight: 700, color: "rgba(100,180,255,0.90)",
                    whiteSpace: "nowrap",
                  }}>USDC</div>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-4)", marginTop: "6px" }}>
                  Balance: <span style={{ color: "var(--text-2)", fontWeight: 600 }}>{usdcBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "36px" }}>
              <button onClick={() => setStep(2)} style={{
                background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", fontWeight: 700,
                fontSize: "14px", padding: "13px 32px", borderRadius: "7px",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "8px",
                boxShadow: "var(--glass-shadow)",
                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                transition: "opacity 0.2s, transform 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
                onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              >
                {t("create.nextCheckpoints")}
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div key="step2" style={{ display: "flex", flexDirection: "column", gap: "12px", ...stepAnim }}>
            <div style={{ ...glass, padding: "32px 44px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "4px", letterSpacing: "-0.025em" }}>
                    {t("create.s2Title")}
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
                    {t("create.s2Subtitle")}
                  </p>
                </div>
                <div style={{
                  padding: "8px 16px", borderRadius: "8px",
                  background: Math.abs(totalPercent - 100) < 0.01 ? "rgba(80,220,140,0.10)" : "rgba(255,190,0,0.10)",
                  border: `1px solid ${Math.abs(totalPercent - 100) < 0.01 ? "rgba(80,220,140,0.30)" : "rgba(255,190,0,0.30)"}`,
                  color: Math.abs(totalPercent - 100) < 0.01 ? "rgba(80,220,140,0.90)" : "rgba(255,210,80,0.90)",
                  fontSize: "13px", fontWeight: 700, textAlign: "center",
                }}>
                  {totalPercent}% / 100%
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {checkpoints.map((cp, i) => (
                  <div key={i} style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "12px", padding: "20px 22px",
                    position: "relative",
                    animation: `fadeSlideUp 0.32s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s both`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <div style={{
                        width: "26px", height: "26px", borderRadius: "50%",
                        background: "var(--accent-bg)",
                        border: "1px solid var(--accent-border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: 700, color: "var(--accent-text)",
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      {checkpoints.length > 1 && (
                        <button onClick={() => removeCheckpoint(i)} style={{
                          background: "transparent", border: "none", cursor: "pointer",
                          color: "var(--text-4)", padding: "4px",
                          transition: "color 0.2s",
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,100,100,0.70)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-4)"; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: "12px" }}>
                      <div>
                        <label style={labelStyle}>{t("create.labelMilestone")}</label>
                        <input style={inputStyle} placeholder={t("create.phMilestone")}
                          value={cp.name} onChange={e => updateCheckpoint(i, "name", e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>{t("create.labelMilestoneDesc")}</label>
                        <input style={inputStyle} placeholder={t("create.phMilestoneDesc")}
                          value={cp.description} onChange={e => updateCheckpoint(i, "description", e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>{t("create.labelPayment")}</label>
                        <input style={{ ...inputStyle, textAlign: "center" }} type="number" placeholder="0"
                          value={cp.payment} onChange={e => updateCheckpoint(i, "payment", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={addCheckpoint} style={{
                width: "100%", marginTop: "12px",
                background: "transparent", border: "1px dashed var(--border)",
                borderRadius: "10px", padding: "13px",
                color: "var(--text-3)", fontSize: "13.5px", fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                transition: "border-color 0.2s, color 0.2s, background 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                {t("create.addCheckpoint")}
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setStep(1)} style={{
                background: "var(--btn-ghost-bg)", color: "var(--btn-ghost-text)",
                fontSize: "14px", fontWeight: 600, padding: "13px 24px", borderRadius: "7px",
                border: "1px solid var(--btn-ghost-border)", cursor: "pointer",
                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                transition: "background 0.2s, border-color 0.2s, transform 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--btn-ghost-bg)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--btn-ghost-border)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
                onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
              >
                {t("create.back")}
              </button>
              <button onClick={() => setStep(3)} style={{
                background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", fontWeight: 700,
                fontSize: "14px", padding: "13px 32px", borderRadius: "7px",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "8px",
                boxShadow: "var(--glass-shadow)",
                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                transition: "opacity 0.2s, transform 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
                onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              >
                {t("create.reviewDeploy")}
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && !deployed && (
          <div key="step3" style={{ display: "flex", flexDirection: "column", gap: "16px", ...stepAnim }}>
            {/* Summary card */}
            <div style={{ ...glass, padding: "36px 44px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "28px", letterSpacing: "-0.025em" }}>
                {t("create.s3Title")}
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
                {[
                  { label: t("create.labelContractTitle"), value: title || t("create.untitled") },
                  { label: t("create.labelTotalAmount"), value: `${totalAmount || "0"} USDC` },
                  { label: t("create.labelClientRow"), value: wallet.publicKey?.toBase58() ?? "—" },
                  { label: t("create.labelContractorRow"), value: contractorWallet || t("create.notSet") },
                ].map((row, i) => (
                  <div key={i} style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "10px", padding: "14px 16px",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLDivElement).style.background = "var(--surface)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--card-border)";
                      (e.currentTarget as HTMLDivElement).style.background = "var(--card-bg)";
                    }}
                  >
                    <div style={{ fontSize: "10.5px", letterSpacing: "1.5px", color: "var(--text-4)", marginBottom: "6px" }}>{row.label}</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", wordBreak: "break-all" }}>{row.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "24px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "1.5px", color: "var(--text-4)", marginBottom: "16px" }}>
                  {t("create.checkpointLabel")} ({checkpoints.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {checkpoints.map((cp, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "8px", padding: "12px 16px",
                      animation: `fadeSlideUp 0.30s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s both`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-4)", fontWeight: 700 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{ fontSize: "14px", color: "var(--text)", fontWeight: 600 }}>
                          {cp.name || `${t("create.checkpoint")} ${i + 1}`}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "13px", color: "var(--text-3)" }}>
                          {totalAmount ? `${((parseFloat(cp.payment) || 0) / 100 * parseFloat(totalAmount)).toFixed(2)} USDC` : `${cp.payment || 0}%`}
                        </span>
                        <div style={{
                          padding: "3px 10px", borderRadius: "999px", fontSize: "10.5px",
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          color: "var(--text-3)",
                        }}>
                          {cp.payment || 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* On-chain info */}
            <div style={{
              ...glass, padding: "20px 28px",
              display: "flex", gap: "16px", alignItems: "flex-start",
            }}>
              <div style={{ flexShrink: 0, marginTop: "2px" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7.5" stroke="var(--text-3)" strokeWidth="1.3" />
                  <line x1="9" y1="8" x2="9" y2="13" stroke="var(--text-2)" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="9" cy="5.5" r="0.8" fill="var(--text-2)" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
                  {t("create.onChainTitle")}
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-3)", lineHeight: 1.65, margin: 0, marginBottom: "10px" }}>
                  {t("create.onChainDesc")}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", letterSpacing: "0.6px", color: "var(--text-4)", textTransform: "uppercase" }}>Program ID</span>
                  <span style={{
                    fontFamily: "monospace", fontSize: "11.5px", color: "var(--text-2)",
                    background: "var(--surface-2)", border: "1px solid var(--border)",
                    borderRadius: "5px", padding: "2px 8px", wordBreak: "break-all",
                  }}>
                    {PROGRAM_ID}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setStep(2)} style={{
                background: "var(--btn-ghost-bg)", color: "var(--btn-ghost-text)",
                fontSize: "14px", fontWeight: 600, padding: "13px 24px", borderRadius: "7px",
                border: "1px solid var(--btn-ghost-border)", cursor: "pointer",
                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                transition: "background 0.2s, border-color 0.2s, transform 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--btn-ghost-bg)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--btn-ghost-border)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
                onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
              >
                {t("create.back")}
              </button>
              <button onClick={handleDeploy} disabled={deploying} style={{
                background: deploying ? "var(--surface)" : "var(--btn-primary-bg)",
                color: "var(--btn-primary-text)", fontWeight: 700,
                fontSize: "14px", padding: "13px 32px", borderRadius: "7px",
                border: "none", cursor: deploying ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: "8px",
                boxShadow: "var(--glass-shadow)",
                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                transition: "opacity 0.2s, transform 0.2s",
              }}
                onMouseEnter={e => {
                  if (!deploying) {
                    (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
                onMouseDown={e => { if (!deploying) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                onMouseUp={e => { if (!deploying) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              >
                {deploying ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 44 44" fill="none"
                      style={{ animation: "spinRing 1.2s linear infinite" }}>
                      <circle cx="22" cy="22" r="18" stroke="var(--border)" strokeWidth="5" />
                      <path d="M22 4 A18 18 0 0 1 40 22" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                    {t("create.deploying")}
                  </>
                ) : (
                  <>
                    {t("create.deployBtn")}
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── DEPLOYED SUCCESS ── */}
        {deployed && (
          <div key="deployed" style={{ ...glass, padding: "64px 48px", textAlign: "center", animation: "fadeSlideUp 0.48s cubic-bezier(0.16,1,0.3,1) 0.04s both" }}>
            <div style={{ marginBottom: "32px", position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {/* Ripple rings */}
              {[1, 2, 3].map(n => (
                <div key={n} style={{
                  position: "absolute", borderRadius: "50%",
                  border: "1px solid rgba(80,220,140,0.25)",
                  width: `${64 + n * 28}px`, height: `${64 + n * 28}px`,
                  animation: `pulseGlow ${1.8 + n * 0.5}s ease-in-out infinite`,
                  animationDelay: `${n * 0.3}s`,
                  opacity: 0.6,
                }} />
              ))}
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" fill="rgba(80,220,140,0.12)" stroke="rgba(80,220,140,0.40)" strokeWidth="1.5" />
                <path d="M18 32 L27 41 L46 22" stroke="rgba(80,220,140,0.95)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  style={{ filter: "drop-shadow(0 0 6px rgba(80,220,140,0.60))" }} />
              </svg>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text)", marginBottom: "12px", letterSpacing: "-0.04em" }}>
              {t("create.successTitle")}
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-3)", marginBottom: "8px" }}>
              {t("create.successSub")}
            </p>
            <div style={{ marginBottom: "36px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              {/* Contract Account PDA */}
              {contractPDA && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: "rgba(80,220,140,0.06)",
                  border: "1px solid rgba(80,220,140,0.25)",
                  borderRadius: "8px", padding: "10px 16px",
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="3" width="8" height="10" rx="2" fill="none" stroke="rgba(80,220,140,0.70)" strokeWidth="1.3" />
                    <path d="M5 1 h6 a2 2 0 0 1 2 2 v8" fill="none" stroke="rgba(80,220,140,0.70)" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontSize: "11px", letterSpacing: "0.5px", color: "rgba(80,220,140,0.60)", textTransform: "uppercase" }}>Contract Account</span>
                  <span style={{ fontSize: "12px", color: "rgba(80,220,140,0.90)", fontFamily: "monospace", wordBreak: "break-all", maxWidth: "260px" }}>
                    {contractPDA.slice(0, 20)}...{contractPDA.slice(-6)}
                  </span>
                </div>
              )}
              {/* Program ID */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "8px", padding: "10px 16px",
              }}>
                <span style={{ fontSize: "11px", letterSpacing: "0.5px", color: "var(--text-4)", textTransform: "uppercase" }}>Program ID</span>
                <span style={{ fontSize: "12px", color: "var(--text-2)", fontFamily: "monospace", wordBreak: "break-all", maxWidth: "320px" }}>
                  {PROGRAM_ID}
                </span>
              </div>
              {/* Explorer links */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                {contractPDA && (
                  <a
                    href={`https://explorer.solana.com/address/${contractPDA}?cluster=devnet`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "12px", color: "rgba(80,220,140,0.85)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    View Contract on Explorer
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7M7 1h4m0 0v4m0-4L5.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                )}
                <a
                  href={`https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "12px", color: "var(--accent)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", opacity: 0.75 }}
                >
                  View Program
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7M7 1h4m0 0v4m0-4L5.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <a href="/dashboard" style={{
                background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", fontWeight: 700,
                fontSize: "14px", padding: "13px 32px", borderRadius: "7px",
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px",
                boxShadow: "var(--glass-shadow)",
                transition: "opacity 0.2s, transform 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                }}
                onMouseDown={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.97)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
              >
                {t("create.viewDashboard")}
              </a>
              <a href="/audit" style={{
                background: "var(--btn-ghost-bg)", color: "var(--btn-ghost-text)",
                fontSize: "14px", fontWeight: 600, padding: "13px 26px", borderRadius: "7px",
                border: "1px solid var(--btn-ghost-border)", textDecoration: "none",
                transition: "background 0.2s, border-color 0.2s, transform 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-strong)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--btn-ghost-bg)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--btn-ghost-border)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                }}
                onMouseDown={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.97)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
              >
                {t("create.newAudit")}
              </a>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </main>
  );
}
