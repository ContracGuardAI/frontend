"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "../components/Toast";

const glass = {
  background: "rgba(255,255,255,0.055)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
  borderRadius: "16px",
} as const;

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  padding: "12px 16px",
  color: "white",
  fontSize: "14px",
  outline: "none",
  fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
  boxSizing: "border-box" as const,
  transition: "border-color 0.2s",
} as const;

const labelStyle = {
  fontSize: "12px",
  letterSpacing: "0.8px",
  color: "rgba(255,255,255,0.45)",
  marginBottom: "8px",
  display: "block",
} as const;

interface Checkpoint {
  name: string;
  description: string;
  payment: string;
}

export default function CreatePage() {
  const [step, setStep] = useState(1);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  /* Step 1 state */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientWallet, setClientWallet] = useState("8xKm...9dFQ");
  const [contractorWallet, setContractorWallet] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [currency, setCurrency] = useState("SOL");

  /* Step 2 state */
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([
    { name: "Foundation & Structure", description: "Pondasi dan struktur bangunan selesai", payment: "30" },
    { name: "Roofing & Walls", description: "Atap dan dinding selesai", payment: "40" },
    { name: "Finishing", description: "Pengecatan, lantai, dan finishing", payment: "30" },
  ]);

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

  const handleDeploy = () => {
    setDeploying(true);
    toast.info("Deploying to Solana...", "Awaiting wallet signature");
    setTimeout(() => {
      setDeploying(false);
      setDeployed(true);
      toast.success("Contract deployed!", "Live on Solana Devnet");
    }, 2800);
  };

  const STEPS = [
    { num: 1, label: "Contract Details" },
    { num: 2, label: "Checkpoints" },
    { num: 3, label: "Review & Deploy" },
  ];

  return (
    <main style={{ background: "#080808", minHeight: "100vh", color: "white" }}>
      <Navbar />

      <div style={{
        position: "fixed", pointerEvents: "none", zIndex: 0,
        top: "40%", left: "50%", transform: "translate(-50%, -50%)",
        width: "65%", height: "65%",
        background: "radial-gradient(ellipse, rgba(255,255,255,0.026) 0%, transparent 65%)",
        filter: "blur(70px)",
      }} />

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "120px 40px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center",
            border: "1px solid rgba(255,255,255,0.14)", borderRadius: "999px",
            padding: "4px 14px", fontSize: "11px",
            color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
            marginBottom: "18px", letterSpacing: "1.5px",
          }}>
            CREATE CONTRACT
          </div>
          <h1 style={{
            fontSize: "clamp(32px,3.5vw,48px)", fontWeight: 900,
            letterSpacing: "-0.04em", color: "white", marginBottom: "12px",
          }}>
            Deploy your contract to Solana.
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.42)", lineHeight: 1.7 }}>
            Set up milestones, define payments, and lock everything on-chain.
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "48px", gap: "0" }}>
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
                  background: step === s.num ? "white" : step > s.num ? "rgba(80,220,140,0.15)" : "rgba(255,255,255,0.06)",
                  border: step === s.num ? "none" : step > s.num ? "1px solid rgba(80,220,140,0.40)" : "1px solid rgba(255,255,255,0.12)",
                  color: step === s.num ? "#080808" : step > s.num ? "rgba(80,220,140,0.90)" : "rgba(255,255,255,0.40)",
                  boxShadow: step === s.num ? "0 0 0 4px rgba(255,255,255,0.10)" : "none",
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
                  color: step === s.num ? "white" : step > s.num ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.30)",
                }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: "60px", height: "1px", margin: "0 12px",
                  background: step > s.num ? "rgba(80,220,140,0.35)" : "rgba(255,255,255,0.10)",
                  transition: "background 0.3s ease",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div style={{ ...glass, padding: "40px 44px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "white", marginBottom: "32px", letterSpacing: "-0.025em" }}>
              Contract Details
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div>
                <label style={labelStyle}>CONTRACT TITLE</label>
                <input style={inputStyle} placeholder="e.g. Renovasi Rumah — Jl. Sudirman No. 12"
                  value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>DESCRIPTION</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "90px", resize: "vertical" } as React.CSSProperties}
                  placeholder="Describe the scope of work..."
                  value={description} onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>CLIENT WALLET (YOU)</label>
                  <input style={{ ...inputStyle, color: "rgba(255,255,255,0.45)", cursor: "not-allowed" }}
                    value={clientWallet} readOnly />
                </div>
                <div>
                  <label style={labelStyle}>CONTRACTOR WALLET</label>
                  <input style={inputStyle} placeholder="e.g. 7mXp...3kRw"
                    value={contractorWallet} onChange={e => setContractorWallet(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>TOTAL CONTRACT AMOUNT</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input style={{ ...inputStyle, flex: 1 }} type="number" placeholder="0.00"
                    value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
                  <div style={{
                    display: "flex", gap: "4px", padding: "4px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "8px",
                  }}>
                    {["SOL", "USDC"].map(c => (
                      <button key={c} onClick={() => setCurrency(c)} style={{
                        padding: "6px 14px", borderRadius: "5px", border: "none",
                        background: currency === c ? "rgba(255,255,255,0.14)" : "transparent",
                        color: currency === c ? "white" : "rgba(255,255,255,0.42)",
                        fontSize: "13px", fontWeight: 600, cursor: "pointer",
                        fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                        transition: "all 0.2s",
                      }}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "36px" }}>
              <button onClick={() => setStep(2)} style={{
                background: "white", color: "#080808", fontWeight: 700,
                fontSize: "14px", padding: "13px 32px", borderRadius: "7px",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "8px",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.20), 0 4px 14px rgba(255,255,255,0.12)",
                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
              }}>
                Next: Set Checkpoints
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ ...glass, padding: "32px 44px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "white", marginBottom: "4px", letterSpacing: "-0.025em" }}>
                    Set Checkpoints
                  </h2>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.42)" }}>
                    Define milestones and their payment share
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
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px", padding: "20px 22px",
                    position: "relative",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <div style={{
                        width: "26px", height: "26px", borderRadius: "50%",
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.14)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.60)",
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      {checkpoints.length > 1 && (
                        <button onClick={() => removeCheckpoint(i)} style={{
                          background: "transparent", border: "none", cursor: "pointer",
                          color: "rgba(255,255,255,0.30)", padding: "4px",
                          transition: "color 0.2s",
                        }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: "12px" }}>
                      <div>
                        <label style={labelStyle}>MILESTONE NAME</label>
                        <input style={inputStyle} placeholder="e.g. Foundation"
                          value={cp.name} onChange={e => updateCheckpoint(i, "name", e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>DESCRIPTION</label>
                        <input style={inputStyle} placeholder="What will be delivered"
                          value={cp.description} onChange={e => updateCheckpoint(i, "description", e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>PAYMENT %</label>
                        <input style={{ ...inputStyle, textAlign: "center" }} type="number" placeholder="0"
                          value={cp.payment} onChange={e => updateCheckpoint(i, "payment", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={addCheckpoint} style={{
                width: "100%", marginTop: "12px",
                background: "transparent", border: "1px dashed rgba(255,255,255,0.16)",
                borderRadius: "10px", padding: "13px",
                color: "rgba(255,255,255,0.45)", fontSize: "13.5px", fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                transition: "border-color 0.2s, color 0.2s",
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Add Checkpoint
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setStep(1)} style={{
                background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)",
                fontSize: "14px", fontWeight: 600, padding: "13px 24px", borderRadius: "7px",
                border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer",
                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
              }}>
                Back
              </button>
              <button onClick={() => setStep(3)} style={{
                background: "white", color: "#080808", fontWeight: 700,
                fontSize: "14px", padding: "13px 32px", borderRadius: "7px",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "8px",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.20), 0 4px 14px rgba(255,255,255,0.12)",
                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
              }}>
                Review & Deploy
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && !deployed && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Summary card */}
            <div style={{ ...glass, padding: "36px 44px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "white", marginBottom: "28px", letterSpacing: "-0.025em" }}>
                Review Contract
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
                {[
                  { label: "CONTRACT TITLE", value: title || "Untitled Contract" },
                  { label: "TOTAL AMOUNT", value: `${totalAmount || "0"} ${currency}` },
                  { label: "CLIENT", value: clientWallet },
                  { label: "CONTRACTOR", value: contractorWallet || "Not set" },
                ].map((row, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "10px", padding: "14px 16px",
                  }}>
                    <div style={{ fontSize: "10.5px", letterSpacing: "1.5px", color: "rgba(255,255,255,0.38)", marginBottom: "6px" }}>{row.label}</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "white", wordBreak: "break-all" }}>{row.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "24px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "1.5px", color: "rgba(255,255,255,0.38)", marginBottom: "16px" }}>
                  CHECKPOINTS ({checkpoints.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {checkpoints.map((cp, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "8px", padding: "12px 16px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{ fontSize: "14px", color: "white", fontWeight: 600 }}>
                          {cp.name || `Checkpoint ${i + 1}`}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
                          {totalAmount ? `${((parseFloat(cp.payment) || 0) / 100 * parseFloat(totalAmount)).toFixed(2)} ${currency}` : `${cp.payment || 0}%`}
                        </span>
                        <div style={{
                          padding: "3px 10px", borderRadius: "999px", fontSize: "10.5px",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          color: "rgba(255,255,255,0.45)",
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
                  <circle cx="9" cy="9" r="7.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.3" />
                  <line x1="9" y1="8" x2="9" y2="13" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="9" cy="5.5" r="0.8" fill="rgba(255,255,255,0.55)" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "white", marginBottom: "4px" }}>
                  Deploying to Solana Devnet
                </div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.40)", lineHeight: 1.65, margin: 0 }}>
                  Contract hash + escrow will be created on-chain. You&apos;ll need to approve the transaction in your Phantom wallet.
                  Transaction fee is approximately 0.00005 SOL.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setStep(2)} style={{
                background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)",
                fontSize: "14px", fontWeight: 600, padding: "13px 24px", borderRadius: "7px",
                border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer",
                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
              }}>
                Back
              </button>
              <button onClick={handleDeploy} disabled={deploying} style={{
                background: deploying ? "rgba(255,255,255,0.60)" : "white",
                color: "#080808", fontWeight: 700,
                fontSize: "14px", padding: "13px 32px", borderRadius: "7px",
                border: "none", cursor: deploying ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: "8px",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.20), 0 4px 14px rgba(255,255,255,0.12)",
                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
              }}>
                {deploying ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 44 44" fill="none"
                      style={{ animation: "spinRing 1.2s linear infinite" }}>
                      <circle cx="22" cy="22" r="18" stroke="rgba(0,0,0,0.20)" strokeWidth="5" />
                      <path d="M22 4 A18 18 0 0 1 40 22" stroke="#080808" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                    Deploying...
                  </>
                ) : (
                  <>
                    Deploy to Solana
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
          <div style={{ ...glass, padding: "64px 48px", textAlign: "center" }}>
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
            <h2 style={{ fontSize: "28px", fontWeight: 900, color: "white", marginBottom: "12px", letterSpacing: "-0.04em" }}>
              Contract deployed!
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", marginBottom: "8px" }}>
              Your contract is now live on Solana Devnet.
            </p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "8px", padding: "10px 16px", marginBottom: "36px",
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="3" width="8" height="10" rx="2" fill="none" stroke="rgba(255,255,255,0.40)" strokeWidth="1.3" />
                <path d="M5 1 h6 a2 2 0 0 1 2 2 v8" fill="none" stroke="rgba(255,255,255,0.40)" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)", fontFamily: "monospace" }}>
                txn: 5Xm9...k4Rp
              </span>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <a href="/dashboard" style={{
                background: "white", color: "#080808", fontWeight: 700,
                fontSize: "14px", padding: "13px 32px", borderRadius: "7px",
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.20), 0 4px 14px rgba(255,255,255,0.12)",
              }}>
                View in Dashboard
              </a>
              <a href="/audit" style={{
                background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)",
                fontSize: "14px", fontWeight: 600, padding: "13px 26px", borderRadius: "7px",
                border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none",
              }}>
                New Audit
              </a>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </main>
  );
}
