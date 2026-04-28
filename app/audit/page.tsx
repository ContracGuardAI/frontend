"use client";
import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { IconDollar, IconAlertTriangle, IconFileText, IconShield } from "../components/Icons";
import { toast } from "../components/Toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "../components/WalletProvider";
import type { ContractReviewResult } from "../../../contractguard-agent/contractAgent";

/* ── shared glass style ── */
const glass = {
  background: "rgba(255,255,255,0.055)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
  borderRadius: "16px",
} as const;

type Tab = "price" | "clauses" | "suggestions";
type FileState = "idle" | "dragging" | "uploading" | "analyzing" | "done" | "error";

/* ── risk badge ── */
function RiskBadge({ risk }: { risk: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    high:   { bg: "rgba(255,80,80,0.10)",  text: "rgba(255,120,120,1)", border: "rgba(255,80,80,0.22)" },
    medium: { bg: "rgba(255,190,0,0.10)",  text: "rgba(255,210,80,1)",  border: "rgba(255,190,0,0.22)" },
    low:    { bg: "rgba(80,220,140,0.10)", text: "rgba(80,220,140,1)",  border: "rgba(80,220,140,0.22)" },
  };
  const c = colors[risk] ?? colors.medium;
  return (
    <span style={{
      fontSize: "10px", letterSpacing: "1.2px", fontWeight: 600,
      padding: "3px 9px", borderRadius: "999px",
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {risk.toUpperCase()}
    </span>
  );
}

/* ── fairness score arc ── */
function ScoreArc({ score }: { score: number }) {
  const r = 48;
  const circumference = Math.PI * r;
  const dash = (score / 10) * circumference;
  const color = score >= 7 ? "rgba(80,220,140,0.9)" : score >= 5 ? "rgba(255,210,80,0.9)" : "rgba(255,100,100,0.9)";

  return (
    <div style={{ textAlign: "center", marginBottom: "32px" }}>
      <svg width="130" height="72" viewBox="0 0 130 72" style={{ overflow: "visible" }}>
        <path d="M 17 65 A 48 48 0 0 1 113 65" fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 17 65 A 48 48 0 0 1 113 65" fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 10px ${color})`, transition: "stroke-dasharray 1.4s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div style={{ marginTop: "-20px" }}>
        <div style={{
          fontSize: "52px", fontWeight: 900, color, letterSpacing: "-0.04em", lineHeight: 1,
          filter: `drop-shadow(0 0 16px ${color.replace("0.9", "0.35")})`,
        }}>
          {score}
        </div>
        <div style={{ fontSize: "11px", letterSpacing: "1.5px", color: "rgba(255,255,255,0.40)", marginTop: "4px" }}>
          FAIRNESS SCORE / 10
        </div>
      </div>
    </div>
  );
}

/* ── format number as IDR ── */
function formatIDR(num: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
}

/* ── map API risk_level / status to UI risk string ── */
function toRisk(val: string): "high" | "medium" | "low" {
  if (val === "high" || val === "overpriced") return "high";
  if (val === "medium" || val === "underpriced") return "medium";
  return "low";
}

export default function AuditPage() {
  const [fileState, setFileState] = useState<FileState>("idle");
  const [fileName, setFileName] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("price");
  const [result, setResult] = useState<ContractReviewResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [analysisHash, setAnalysisHash] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Invalid file", "Only PDF files are accepted.");
      return;
    }

    setFileName(file.name);
    setErrorMsg("");
    setResult(null);

    // Step 1: Upload PDF
    setFileState("uploading");
    toast.info("Uploading contract...", "Extracting text from PDF");

    const formData = new FormData();
    formData.append("file", file);

    let contractText = "";
    let fHash = "";

    try {
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) throw new Error(uploadJson.error);
      contractText = uploadJson.data.contract_text;
      fHash = uploadJson.data.file_hash;
      setFileHash(fHash);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setErrorMsg(msg);
      setFileState("error");
      toast.error("Upload failed", msg);
      return;
    }

    // Step 2: Analyze with AI
    setFileState("analyzing");
    toast.info("Analyzing contract...", "AI is reading every clause");

    try {
      const auditRes = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText }),
      });
      const auditJson = await auditRes.json();
      if (!auditJson.success) throw new Error(auditJson.error);
      setResult(auditJson.data);
      setAnalysisHash(auditJson.meta.analysis_hash);
      setFileState("done");
      toast.success("Review complete", file.name);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI analysis failed.";
      setErrorMsg(msg);
      setFileState("error");
      toast.error("Analysis failed", msg);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFileState("idle");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const isLoading = fileState === "uploading" || fileState === "analyzing";
  const loadingLabel = fileState === "uploading" ? "Extracting PDF text..." : "AI is analyzing every clause...";

  const tabs: { id: Tab; label: string; count: number }[] = result ? [
    { id: "price",       label: "Price Analysis",    count: result.price_analysis.length },
    { id: "clauses",     label: "Risky Clauses",     count: result.risky_clauses.length },
    { id: "suggestions", label: "Suggestions",        count: result.revision_suggestions.length },
  ] : [];

  return (
    <main style={{ background: "#080808", minHeight: "100vh", color: "white" }}>
      <Navbar />

      {/* ambient glow */}
      <div style={{
        position: "fixed", pointerEvents: "none", zIndex: 0,
        top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: "70%", height: "60%",
        background: "radial-gradient(ellipse, rgba(255,255,255,0.028) 0%, transparent 65%)",
        filter: "blur(70px)",
      }} />

      <div style={{
        maxWidth: "1200px", margin: "0 auto", padding: "120px 80px 80px",
        position: "relative", zIndex: 1,
      }}>

        {/* Page header */}
        <div style={{ marginBottom: "56px" }}>
          <div className="page-in p0" style={{
            display: "inline-flex", alignItems: "center",
            border: "1px solid rgba(201,168,76,0.38)", borderRadius: "999px",
            padding: "4px 14px", fontSize: "11px",
            color: "rgba(201,168,76,0.85)", background: "rgba(201,168,76,0.06)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            boxShadow: "inset 0 1px 0 rgba(201,168,76,0.16), 0 0 14px rgba(201,168,76,0.08)",
            marginBottom: "18px", letterSpacing: "1.5px",
          }}>
            AI CONTRACT REVIEW
          </div>
          <h1 className="page-in p1" style={{
            fontSize: "clamp(36px,4vw,54px)", fontWeight: 900,
            letterSpacing: "-0.04em", color: "white", lineHeight: 1.0,
            marginBottom: "14px",
          }}>
            Upload your contract.<br />Get the truth in seconds.
          </h1>
          <p className="page-in p2" style={{ fontSize: "15px", color: "rgba(255,255,255,0.44)", maxWidth: "480px", lineHeight: 1.75 }}>
            AI reads every clause, detects price markups, flags risky terms,
            and gives you a fairness score — before you sign anything.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="page-in p3" style={{
          display: "grid",
          gridTemplateColumns: fileState === "done" ? "1fr 1.4fr" : "1fr 1fr",
          gap: "24px",
          transition: "grid-template-columns 0.4s ease",
        }}>

          {/* LEFT: Upload */}
          <div>
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); if (!isLoading) setFileState("dragging"); }}
              onDragLeave={() => { if (!isLoading) setFileState("idle"); }}
              onDrop={e => { if (!isLoading) onDrop(e); }}
              onClick={() => { if (!isLoading) inputRef.current?.click(); }}
              style={{
                ...glass,
                padding: "48px 32px",
                cursor: isLoading ? "wait" : "pointer",
                textAlign: "center",
                marginBottom: "16px",
                border: fileState === "dragging"
                  ? "1px solid rgba(255,255,255,0.40)"
                  : fileState === "done"
                  ? "1px solid rgba(80,220,140,0.30)"
                  : fileState === "error"
                  ? "1px solid rgba(255,80,80,0.30)"
                  : "1px dashed rgba(255,255,255,0.18)",
                transition: "border 0.2s, background 0.2s",
              }}
            >
              <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }}
                onChange={e => e.target.files && handleFile(e.target.files[0])} />

              {isLoading && (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none"
                      style={{ animation: "spinRing 1.2s linear infinite" }}>
                      <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
                      <path d="M22 4 A18 18 0 0 1 40 22" stroke="rgba(255,255,255,0.80)" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "white", marginBottom: "8px" }}>
                    {fileState === "uploading" ? "Uploading..." : "Analyzing contract..."}
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.40)" }}>{loadingLabel}</div>
                </>
              )}

              {fileState === "done" && (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                      <circle cx="22" cy="22" r="20" fill="rgba(80,220,140,0.10)" stroke="rgba(80,220,140,0.40)" strokeWidth="1.5" />
                      <path d="M13 22 L19 28 L31 16" stroke="rgba(80,220,140,0.90)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "rgba(80,220,140,0.90)", marginBottom: "6px" }}>
                    Review complete
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)", marginBottom: "12px" }}>{fileName}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.22)", wordBreak: "break-all", padding: "0 8px" }}>
                    hash: {fileHash.slice(0, 16)}...
                  </div>
                  <div style={{ marginTop: "16px" }}>
                    <button onClick={() => { setFileState("idle"); setResult(null); }} style={{
                      fontSize: "12px", color: "rgba(255,255,255,0.45)",
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: "6px", padding: "6px 14px", cursor: "pointer",
                      fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                    }}>
                      Analyze another
                    </button>
                  </div>
                </>
              )}

              {fileState === "error" && (
                <>
                  <div style={{ marginBottom: "16px", color: "rgba(255,100,100,0.80)", fontSize: "14px", fontWeight: 600 }}>
                    Analysis failed
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.40)", marginBottom: "16px" }}>{errorMsg}</div>
                  <button onClick={() => setFileState("idle")} style={{
                    fontSize: "12px", color: "rgba(255,255,255,0.55)",
                    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "6px", padding: "6px 14px", cursor: "pointer",
                    fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                  }}>
                    Try again
                  </button>
                </>
              )}

              {(fileState === "idle" || fileState === "dragging") && (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                      <rect x="8" y="6" width="28" height="36" rx="4" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1.8" />
                      <line x1="14" y1="16" x2="30" y2="16" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" />
                      <line x1="14" y1="22" x2="30" y2="22" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" />
                      <line x1="14" y1="28" x2="22" y2="28" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" />
                      <circle cx="33" cy="34" r="7" fill="#080808" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" />
                      <line x1="33" y1="31" x2="33" y2="37" stroke="rgba(255,255,255,0.70)" strokeWidth="1.8" strokeLinecap="round" />
                      <line x1="30" y1="34" x2="36" y2="34" stroke="rgba(255,255,255,0.70)" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "white", marginBottom: "8px" }}>
                    Drop your contract PDF here
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.40)", marginBottom: "20px" }}>
                    or click to browse
                  </div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    fontSize: "11.5px", color: "rgba(255,255,255,0.30)",
                    border: "1px solid rgba(255,255,255,0.10)", borderRadius: "999px",
                    padding: "4px 12px",
                  }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5" stroke="rgba(255,255,255,0.40)" strokeWidth="1.2" />
                      <line x1="6" y1="5" x2="6" y2="9" stroke="rgba(255,255,255,0.40)" strokeWidth="1.2" strokeLinecap="round" />
                      <circle cx="6" cy="3.5" r="0.6" fill="rgba(255,255,255,0.40)" />
                    </svg>
                    PDF only · Max 10MB
                  </div>
                </>
              )}
            </div>

            {/* What AI checks */}
            <div style={{ ...glass, padding: "24px 28px" }}>
              <div style={{ fontSize: "12px", letterSpacing: "1.5px", color: "rgba(201,168,76,0.70)", marginBottom: "16px" }}>
                WHAT AI CHECKS
              </div>
              {[
                { Icon: IconDollar,        label: "Price markup detection vs. market rates" },
                { Icon: IconAlertTriangle, label: "One-sided clauses & risky terms" },
                { Icon: IconFileText,      label: "Scope ambiguity & missing deliverables" },
                { Icon: IconShield,        label: "Escrow & payment security gaps" },
              ].map(({ Icon, label }, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 8px",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  borderRadius: "8px", cursor: "default",
                  transition: "transform 0.2s ease, background 0.2s ease",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateX(4px)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)";
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={15} color="rgba(255,255,255,0.65)" strokeWidth={1.7} />
                  </div>
                  <span style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.55)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Results */}
          {fileState !== "done" || !result ? (
            <div style={{
              ...glass, padding: "48px 36px",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              textAlign: "center", minHeight: "400px",
            }}>
              <div style={{ marginBottom: "24px", opacity: 0.25 }}>
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <rect x="16" y="10" width="40" height="52" rx="5" fill="none" stroke="white" strokeWidth="2" />
                  <line x1="24" y1="26" x2="48" y2="26" stroke="white" strokeWidth="1.5" strokeOpacity={0.5} />
                  <line x1="24" y1="34" x2="48" y2="34" stroke="white" strokeWidth="1.5" strokeOpacity={0.5} />
                  <line x1="24" y1="42" x2="36" y2="42" stroke="white" strokeWidth="1.5" strokeOpacity={0.5} />
                </svg>
              </div>
              <div style={{ fontSize: "17px", fontWeight: 600, color: "rgba(255,255,255,0.30)", marginBottom: "8px" }}>
                Upload a contract to see the AI review
              </div>
              <div style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.22)" }}>
                Results will appear here
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Score card */}
              <div style={{ ...glass, padding: "32px 36px", animation: "fadeSlideUp 0.48s cubic-bezier(0.16,1,0.3,1) forwards", opacity: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "11px", letterSpacing: "1.5px", color: "rgba(255,255,255,0.40)", marginBottom: "8px" }}>
                      AI REVIEW RESULT
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "white", marginBottom: "4px" }}>
                      Contract analysis complete
                    </div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.40)", marginBottom: "12px" }}>
                      {result.price_analysis.filter(p => p.status === "overpriced").length} overpriced items · {result.risky_clauses.filter(c => c.risk_level === "high").length} high-risk clauses
                    </div>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.50)", lineHeight: 1.65, maxWidth: "280px" }}>
                      {result.overall_summary}
                    </p>
                  </div>
                  <ScoreArc score={result.fairness_score} />
                </div>
              </div>

              {/* Tabs */}
              <div style={{ ...glass, overflow: "hidden", animation: "fadeSlideUp 0.48s cubic-bezier(0.16,1,0.3,1) forwards", animationDelay: "0.10s", opacity: 0 }}>
                <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                      flex: 1, padding: "14px 16px", background: "transparent",
                      border: "none", cursor: "pointer", fontSize: "13px",
                      color: activeTab === t.id ? "white" : "rgba(255,255,255,0.42)",
                      fontWeight: activeTab === t.id ? 700 : 400,
                      borderBottom: activeTab === t.id ? "2px solid rgba(201,168,76,0.85)" : "2px solid transparent",
                      transition: "color 0.2s",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                    }}>
                      {t.label}
                      <span style={{
                        fontSize: "10px", padding: "2px 7px", borderRadius: "999px",
                        background: activeTab === t.id ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.10)",
                        color: activeTab === t.id ? "rgba(201,168,76,0.85)" : "rgba(255,255,255,0.60)",
                      }}>{t.count}</span>
                    </button>
                  ))}
                </div>

                <div style={{ padding: "24px 28px", maxHeight: "340px", overflowY: "auto" }}>

                  {/* Price Analysis */}
                  {activeTab === "price" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {result.price_analysis.map((item, i) => (
                        <div key={i} style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: "10px", padding: "14px 16px",
                          transition: "border-color 0.2s, background 0.2s",
                        }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.13)";
                            (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                            (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "white", flex: 1 }}>{item.item}</div>
                            <RiskBadge risk={toRisk(item.status)} />
                          </div>
                          <div style={{ display: "flex", gap: "24px", marginBottom: "8px" }}>
                            <div>
                              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1px" }}>CONTRACT</div>
                              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.70)" }}>{formatIDR(item.contract_price)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1px" }}>MARKET EST.</div>
                              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.70)" }}>{item.market_estimate}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1px" }}>STATUS</div>
                              <div style={{ fontSize: "13px", fontWeight: 700, color: toRisk(item.status) === "high" ? "rgba(255,100,100,0.90)" : toRisk(item.status) === "medium" ? "rgba(255,210,80,0.90)" : "rgba(80,220,140,0.90)" }}>
                                {item.status.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)", lineHeight: 1.55, margin: 0 }}>{item.notes}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Risky Clauses */}
                  {activeTab === "clauses" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {result.risky_clauses.map((item, i) => (
                        <div key={i} style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: "10px", padding: "16px 18px",
                          transition: "border-color 0.2s, background 0.2s",
                        }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.13)";
                            (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                            (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "white" }}>{item.clause}</div>
                            <RiskBadge risk={item.risk_level} />
                          </div>
                          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.50)", lineHeight: 1.65, margin: "0 0 8px" }}>{item.issue}</p>
                          {item.potential_impact && (
                            <p style={{ fontSize: "12px", color: "rgba(255,150,100,0.55)", lineHeight: 1.55, margin: "0 0 8px" }}>
                              ⚠ {item.potential_impact}
                            </p>
                          )}
                          {item.suggestion && (
                            <p style={{ fontSize: "12px", color: "rgba(80,220,140,0.55)", lineHeight: 1.55, margin: 0 }}>
                              ✓ {item.suggestion}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {activeTab === "suggestions" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {result.revision_suggestions.map((s, i) => (
                        <div key={i} style={{
                          display: "flex", gap: "14px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: "10px", padding: "14px 16px",
                          transition: "border-color 0.2s, background 0.2s",
                        }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.13)";
                            (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                            (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                          }}
                        >
                          <div style={{
                            width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                            background: "rgba(201,168,76,0.10)",
                            border: "1px solid rgba(201,168,76,0.30)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "11px", fontWeight: 700, color: "rgba(201,168,76,0.80)",
                          }}>{i + 1}</div>
                          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: 0 }}>{s}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Record on chain CTA */}
              <div style={{
                ...glass, padding: "24px 28px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                animation: "fadeSlideUp 0.48s cubic-bezier(0.16,1,0.3,1) forwards", animationDelay: "0.20s", opacity: 0,
              }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "white", marginBottom: "4px" }}>
                    Ready to create on-chain contract?
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", wordBreak: "break-all" }}>
                    hash: {analysisHash.slice(0, 24)}...
                  </div>
                </div>
                {connected ? (
                  <a href="/create" style={{
                    background: "white", color: "#080808", fontWeight: 700,
                    fontSize: "13.5px", padding: "12px 28px", borderRadius: "7px",
                    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.20), 0 4px 14px rgba(255,255,255,0.12)",
                    whiteSpace: "nowrap", transition: "opacity 0.2s, transform 0.2s",
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88";
                      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
                      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                    }}
                  >
                    Create Contract
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                ) : (
                  <button onClick={() => setVisible(true)} style={{
                    background: "rgba(201,168,76,0.12)", color: "rgba(201,168,76,0.90)",
                    fontWeight: 700, fontSize: "13.5px", padding: "12px 24px",
                    borderRadius: "7px", border: "1px solid rgba(201,168,76,0.35)",
                    cursor: "pointer", whiteSpace: "nowrap",
                    fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                    transition: "background 0.2s, transform 0.2s",
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.20)";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.12)";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    }}
                  >
                    Connect Wallet First
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
