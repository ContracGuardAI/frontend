"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { IconCheck, IconX, IconUpload } from "../../components/Icons";
import { toast } from "../../components/Toast";

const glass = {
  background: "rgba(255,255,255,0.055)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
  borderRadius: "16px",
} as const;

type CPStatus = "approved" | "submitted" | "pending" | "revision";

const CP_STATUS: Record<CPStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  approved: { label: "APPROVED",   bg: "rgba(80,220,140,0.10)", text: "rgba(80,220,140,0.90)",  border: "rgba(80,220,140,0.28)", dot: "rgba(80,220,140,0.90)" },
  submitted:{ label: "SUBMITTED",  bg: "rgba(255,210,80,0.10)", text: "rgba(255,210,80,0.90)",  border: "rgba(255,210,80,0.28)", dot: "rgba(255,210,80,0.90)" },
  pending:  { label: "PENDING",    bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.45)", border: "rgba(255,255,255,0.12)", dot: "rgba(255,255,255,0.30)" },
  revision: { label: "NEEDS REVISION", bg: "rgba(255,80,80,0.10)", text: "rgba(255,120,120,0.90)", border: "rgba(255,80,80,0.28)", dot: "rgba(255,120,120,0.90)" },
};

const CONTRACT = {
  id: "cg-001",
  title: "Renovasi Rumah Tingkat 2 — Jl. Sudirman",
  contractor: "PT. Bangun Jaya",
  contractorWallet: "7mXpLk9...3kRw",
  clientWallet: "8xKmPq2...9dFQ",
  totalAmount: "12.5",
  currency: "SOL",
  status: "Active",
  contractHash: "a7f3c92d1e8b4f56a2d0c3e7b1f9a4d8",
  aiReviewHash: "3b8f1a2c9d4e5f7a0b3c6e9f2a5b8c1d",
  createdAt: "Apr 20, 2025",
  fairnessScore: 6,
  checkpoints: [
    {
      id: 1,
      name: "Foundation & Structure",
      description: "Pondasi, kolom, dan struktur bangunan utama selesai. Termasuk penggalian, pengecoran fondasi, dan pemasangan kolom beton bertulang.",
      payment: "30",
      status: "approved" as CPStatus,
      submittedAt: "Apr 25, 2025",
      approvedAt: "Apr 26, 2025",
      evidence: "Foto fondasi sudah dicor + laporan pengawas lapangan.pdf",
      aiReport: {
        status: "APPROVED",
        score: 9,
        finding: "Bukti kerja sesuai spesifikasi kontrak. Pengecoran fondasi sudah dilakukan dengan tulangan yang benar. Tidak ada temuan signifikan.",
        details: ["Foto pengecoran fondasi menunjukkan ketebalan minimal 25cm sesuai kontrak", "Laporan pengawas menyatakan kualitas beton K-250 sesuai spesifikasi", "Tidak ada tanda-tanda keropos atau cacat struktural"],
      },
    },
    {
      id: 2,
      name: "Roofing & Walls",
      description: "Pemasangan atap, dinding bata, dan plester. Termasuk rangka atap baja ringan dan genteng metal.",
      payment: "40",
      status: "submitted" as CPStatus,
      submittedAt: "May 2, 2025",
      approvedAt: null,
      evidence: "Video progress atap + foto dinding.zip",
      aiReport: {
        status: "NEEDS_REVIEW",
        score: 7,
        finding: "Sebagian besar pekerjaan sesuai spesifikasi, namun ditemukan ketidaksesuaian pada pemasangan genteng di area pojok atap.",
        details: ["Rangka atap baja ringan terpasang sesuai spesifikasi", "Dinding bata sudah diplester rata", "PERHATIAN: Area pojok atap barat daya menunjukkan celah yang berpotensi menyebabkan kebocoran — perlu perbaikan sebelum approval"],
      },
    },
    {
      id: 3,
      name: "Finishing",
      description: "Pengecatan, pemasangan lantai keramik, dan finishing akhir.",
      payment: "30",
      status: "pending" as CPStatus,
      submittedAt: null,
      approvedAt: null,
      evidence: null,
      aiReport: null,
    },
  ],
};

function StatusBadge({ status }: { status: CPStatus }) {
  const s = CP_STATUS[status];
  return (
    <span style={{
      fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.7px",
      padding: "4px 11px", borderRadius: "999px",
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
    }}>{s.label}</span>
  );
}

export default function ContractDetailPage() {
  const [activeCP, setActiveCP] = useState<number | null>(1);
  const [submitMode, setSubmitMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [escrowReady, setEscrowReady] = useState(false);
  const contract = CONTRACT;

  useEffect(() => {
    const t = setTimeout(() => setEscrowReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  const totalPaid = contract.checkpoints
    .filter(cp => cp.status === "approved")
    .reduce((sum, cp) => sum + parseFloat(cp.payment), 0);
  const totalAmount = parseFloat(contract.totalAmount);
  const paidAmount = (totalPaid / 100) * totalAmount;
  const lockedAmount = totalAmount - paidAmount;

  const handleSubmit = () => {
    setSubmitting(true);
    toast.info("Submitting evidence...", "AI review will begin shortly");
    setTimeout(() => {
      setSubmitting(false);
      setSubmitMode(false);
      toast.success("Evidence submitted", "AI review in progress");
    }, 2000);
  };

  const handleApprove = () => {
    toast.success("Checkpoint approved", "Payment released to contractor");
  };

  const handleRevision = () => {
    toast.warning("Revision requested", "Contractor will be notified");
  };

  const currentCP = activeCP !== null ? contract.checkpoints.find(c => c.id === activeCP) : null;

  return (
    <main style={{ background: "#080808", minHeight: "100vh", color: "white" }}>
      <Navbar />

      <div style={{
        position: "fixed", pointerEvents: "none", zIndex: 0,
        top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: "65%", height: "60%",
        background: "radial-gradient(ellipse, rgba(255,255,255,0.022) 0%, transparent 65%)",
        filter: "blur(70px)",
      }} />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "110px 80px 80px", position: "relative", zIndex: 1 }}>

        {/* Back link */}
        <Link href="/dashboard" className="page-in p0" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          color: "rgba(255,255,255,0.40)", textDecoration: "none",
          fontSize: "13px", marginBottom: "28px",
          transition: "color 0.2s, transform 0.2s",
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.75)";
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateX(-3px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.40)";
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateX(0)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10 7H2M2 7L6 3M2 7L6 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Contract header */}
        <div className="page-in p1" style={{ ...glass, padding: "28px 32px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={{
                  fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.7px", padding: "4px 11px",
                  borderRadius: "999px", background: "rgba(80,220,140,0.10)",
                  color: "rgba(80,220,140,0.90)", border: "1px solid rgba(80,220,140,0.28)",
                }}>ACTIVE</span>
                <span style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.30)" }}>{contract.createdAt}</span>
              </div>
              <h1 style={{
                fontSize: "clamp(20px,2.5vw,28px)", fontWeight: 900,
                letterSpacing: "-0.03em", color: "white", marginBottom: "12px",
              }}>{contract.title}</h1>
              <div style={{ display: "flex", gap: "24px" }}>
                {[
                  { label: "CLIENT", value: contract.clientWallet },
                  { label: "CONTRACTOR", value: `${contract.contractor} (${contract.contractorWallet})` },
                ].map((p, i) => (
                  <div key={i}>
                    <div style={{ fontSize: "9.5px", letterSpacing: "1.5px", color: "rgba(255,255,255,0.32)", marginBottom: "3px" }}>{p.label}</div>
                    <div style={{ fontSize: "12.5px", fontFamily: "monospace", color: "rgba(255,255,255,0.55)" }}>{p.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Escrow summary */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "12px", padding: "20px 24px", minWidth: "220px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            }}>
              <div style={{ fontSize: "10px", letterSpacing: "1.5px", color: "rgba(255,255,255,0.35)", marginBottom: "6px" }}>ESCROW STATUS</div>
              <div style={{ fontSize: "26px", fontWeight: 900, color: "white", letterSpacing: "-0.04em", marginBottom: "12px" }}>
                {contract.totalAmount} {contract.currency}
              </div>
              {/* Escrow bar */}
              <div style={{ height: "5px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{
                  height: "100%", borderRadius: "999px",
                  width: escrowReady ? `${totalPaid}%` : "0%",
                  background: "linear-gradient(to right, rgba(80,220,140,0.85), rgba(80,220,140,0.50))",
                  transition: "width 1.4s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: "0 0 8px rgba(80,220,140,0.40)",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                <span style={{ color: "rgba(80,220,140,0.70)" }}>Released: {paidAmount.toFixed(2)} SOL</span>
                <span style={{ color: "rgba(255,255,255,0.35)" }}>Locked: {lockedAmount.toFixed(2)} SOL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content: 2 columns */}
        <div className="page-in p2" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "20px" }}>

          {/* LEFT: Checkpoint timeline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "1.5px", color: "rgba(255,255,255,0.35)", marginBottom: "4px", paddingLeft: "4px" }}>
              CHECKPOINTS
            </div>
            {contract.checkpoints.map((cp, i) => {
              const st = CP_STATUS[cp.status];
              const isActive = activeCP === cp.id;
              return (
                <div key={cp.id} style={{ position: "relative" }}>
                  {/* Connector line */}
                  {i < contract.checkpoints.length - 1 && (
                    <div style={{
                      position: "absolute", left: "20px", top: "100%",
                      width: "2px", height: "10px",
                      background: `linear-gradient(to bottom, ${st.dot}, transparent)`,
                      zIndex: 2,
                    }} />
                  )}
                  <div
                    onClick={() => setActiveCP(isActive ? null : cp.id)}
                    style={{
                      ...glass, padding: "20px 22px",
                      cursor: "pointer",
                      border: isActive ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.10)",
                      background: isActive ? "rgba(255,255,255,0.075)" : "rgba(255,255,255,0.045)",
                      transition: "all 0.2s",
                      animation: `fadeSlideUp 0.42s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s both`,
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.18)";
                        (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.062)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.10)";
                        (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.045)";
                      }
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                        {/* Step indicator */}
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: cp.status === "approved" ? "rgba(80,220,140,0.12)" : "rgba(255,255,255,0.07)",
                          border: `1px solid ${st.dot}44`,
                          boxShadow: `0 0 12px ${st.dot}20`,
                        }}>
                          {cp.status === "approved" ? (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M2 7 L5.5 10.5 L12 4" stroke="rgba(80,220,140,0.90)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <span style={{ fontSize: "12px", fontWeight: 700, color: st.dot }}>{cp.id}</span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: "white", marginBottom: "4px" }}>{cp.name}</div>
                          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)" }}>
                            {(parseFloat(cp.payment) / 100 * totalAmount).toFixed(2)} SOL ({cp.payment}%)
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={cp.status} />
                    </div>

                    {isActive && (
                      <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.48)", lineHeight: 1.65, marginBottom: "16px" }}>
                          {cp.description}
                        </p>

                        {/* Action buttons */}
                        {cp.status === "submitted" && (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={e => { e.stopPropagation(); handleApprove(); }}
                              style={{
                                flex: 1, padding: "10px 0", borderRadius: "7px",
                                background: "rgba(80,220,140,0.15)",
                                border: "1px solid rgba(80,220,140,0.30)",
                                color: "rgba(80,220,140,0.90)", fontWeight: 700, fontSize: "13px",
                                cursor: "pointer",
                                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                                transition: "background 0.2s, border-color 0.2s, transform 0.15s",
                              } as React.CSSProperties}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(80,220,140,0.24)";
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(80,220,140,0.15)";
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                              }}
                              onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                            >
                              <IconCheck size={14} color="rgba(80,220,140,0.90)" strokeWidth={2.2} />
                              Approve
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); handleRevision(); }}
                              style={{
                                flex: 1, padding: "10px 0", borderRadius: "7px",
                                background: "rgba(255,80,80,0.08)",
                                border: "1px solid rgba(255,80,80,0.22)",
                                color: "rgba(255,120,120,0.90)", fontWeight: 700, fontSize: "13px",
                                cursor: "pointer",
                                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                                transition: "background 0.2s, border-color 0.2s, transform 0.15s",
                              } as React.CSSProperties}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,80,80,0.16)";
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,80,80,0.08)";
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                              }}
                              onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                            >
                              <IconX size={14} color="rgba(255,120,120,0.90)" strokeWidth={2.2} />
                              Request Revision
                            </button>
                          </div>
                        )}

                        {cp.status === "pending" && (
                          <button
                            onClick={e => { e.stopPropagation(); setSubmitMode(true); }}
                            style={{
                              width: "100%", padding: "11px", borderRadius: "7px",
                              background: "rgba(255,255,255,0.10)",
                              border: "1px solid rgba(255,255,255,0.18)",
                              color: "white", fontWeight: 700, fontSize: "13.5px",
                              cursor: "pointer",
                              fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                              transition: "background 0.2s, transform 0.15s",
                            } as React.CSSProperties}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.16)";
                              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.10)";
                              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                            }}
                            onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                          >
                            <IconUpload size={15} color="rgba(255,255,255,0.80)" strokeWidth={1.8} />
                            Submit Evidence
                          </button>
                        )}

                        {cp.status === "approved" && (
                          <div style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            fontSize: "12.5px", color: "rgba(80,220,140,0.70)",
                          }}>
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                              <path d="M2 7 L5.5 10.5 L12 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Payment released · {(parseFloat(cp.payment) / 100 * totalAmount).toFixed(2)} SOL sent to contractor
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: AI report + contract info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Submit evidence modal overlay */}
            {submitMode && (
              <div style={{
                ...glass, padding: "28px 30px",
                border: "1px solid rgba(255,255,255,0.22)",
                animation: "fadeSlideUp 0.32s cubic-bezier(0.16,1,0.3,1) both",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
                    Submit Evidence
                  </h3>
                  <button onClick={() => setSubmitMode(false)} style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.40)", padding: "4px",
                    transition: "color 0.2s",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.75)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.40)"; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px dashed rgba(255,255,255,0.16)",
                  borderRadius: "10px", padding: "32px",
                  textAlign: "center", marginBottom: "16px", cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.28)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.16)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.50)", marginBottom: "6px" }}>
                    Upload photos / documents
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.30)" }}>
                    JPG, PNG, PDF · Max 50MB
                  </div>
                </div>
                <textarea
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.11)",
                    borderRadius: "8px", padding: "12px 14px",
                    color: "rgba(255,255,255,0.70)", fontSize: "13.5px", outline: "none",
                    minHeight: "80px", resize: "vertical",
                    fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                    boxSizing: "border-box",
                    marginBottom: "14px",
                  } as React.CSSProperties}
                  placeholder="Describe what was completed..."
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    width: "100%", padding: "13px", borderRadius: "7px", border: "none",
                    background: submitting ? "rgba(255,255,255,0.50)" : "white",
                    color: "#080808", fontWeight: 700, fontSize: "14px",
                    cursor: submitting ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "opacity 0.2s, transform 0.15s",
                    boxShadow: "0 4px 14px rgba(255,255,255,0.15)",
                  } as React.CSSProperties}
                  onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                  onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"; }}
                  onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                >
                  {submitting ? "Submitting..." : "Submit for AI Review"}
                </button>
              </div>
            )}

            {/* AI Report card */}
            {currentCP?.aiReport ? (
              <div style={{ ...glass, padding: "24px 28px" }}>
                <div style={{ fontSize: "10.5px", letterSpacing: "1.5px", color: "rgba(255,255,255,0.35)", marginBottom: "14px" }}>
                  AI REVIEW — {currentCP.name}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: "white", letterSpacing: "-0.04em" }}>
                      {currentCP.aiReport.score}/10
                    </div>
                    <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.40)" }}>
                      Compliance Score
                    </div>
                  </div>
                  <span style={{
                    fontSize: "11px", fontWeight: 700, letterSpacing: "0.6px",
                    padding: "5px 13px", borderRadius: "999px",
                    background: currentCP.aiReport.status === "APPROVED" ? "rgba(80,220,140,0.10)" : "rgba(255,210,80,0.10)",
                    color: currentCP.aiReport.status === "APPROVED" ? "rgba(80,220,140,0.90)" : "rgba(255,210,80,0.90)",
                    border: currentCP.aiReport.status === "APPROVED" ? "1px solid rgba(80,220,140,0.28)" : "1px solid rgba(255,210,80,0.28)",
                  }}>
                    {currentCP.aiReport.status}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.50)", lineHeight: 1.65, marginBottom: "16px" }}>
                  {currentCP.aiReport.finding}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {currentCP.aiReport.details.map((d, i) => (
                    <div key={i} style={{
                      display: "flex", gap: "10px", alignItems: "flex-start",
                      fontSize: "12.5px", color: "rgba(255,255,255,0.45)", lineHeight: 1.55,
                    }}>
                      <div style={{
                        width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0,
                        marginTop: "7px",
                        background: d.startsWith("PERHATIAN") ? "rgba(255,210,80,0.80)" : "rgba(255,255,255,0.30)",
                      }} />
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            ) : currentCP && (
              <div style={{ ...glass, padding: "36px 28px", textAlign: "center" }}>
                <div style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.30)", marginBottom: "6px" }}>
                  No AI report yet
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.22)" }}>
                  Submit evidence to trigger AI review
                </div>
              </div>
            )}

            {/* Contract on-chain info */}
            <div style={{ ...glass, padding: "22px 26px" }}>
              <div style={{ fontSize: "10.5px", letterSpacing: "1.5px", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>
                ON-CHAIN RECORD
              </div>
              {[
                { label: "CONTRACT HASH", value: contract.contractHash },
                { label: "AI REVIEW HASH", value: contract.aiReviewHash },
                { label: "NETWORK", value: "Solana Devnet" },
                { label: "FAIRNESS SCORE", value: `${contract.fairnessScore}/10` },
              ].map((row, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <span style={{ fontSize: "11px", letterSpacing: "1px", color: "rgba(255,255,255,0.32)" }}>{row.label}</span>
                  <span style={{
                    fontSize: "12px", fontFamily: row.label.includes("HASH") ? "monospace" : "inherit",
                    color: "rgba(255,255,255,0.58)",
                    maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{row.value}</span>
                </div>
              ))}
              <a href="#" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                marginTop: "14px",
                fontSize: "12.5px", color: "rgba(255,255,255,0.35)",
                textDecoration: "none",
                transition: "color 0.2s, transform 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.65)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateX(2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.35)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateX(0)";
                }}
              >
                View on Solana Explorer
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10 L10 2 M10 2 H5 M10 2 V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
