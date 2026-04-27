"use client";
import { useEffect } from "react";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/* ── glass card shared style ── */
const glass = {
  background: "rgba(255,255,255,0.055)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
  borderRadius: "16px",
} as const;

/* ── ambient glow layer (drop behind section cards) ── */
function Glow({ top, left, right, size = "50%", opacity = 0.030 }: {
  top?: string; left?: string; right?: string; size?: string; opacity?: number;
}) {
  return (
    <div style={{
      position: "absolute", pointerEvents: "none", zIndex: 0,
      top, left, right,
      width: size, height: size,
      background: `radial-gradient(ellipse, rgba(255,255,255,${opacity}) 0%, transparent 70%)`,
      filter: "blur(55px)",
      transform: "translate(-50%, -50%)",
    }} />
  );
}

/* ══ ICONS ══ */
function StepIcon({ type }: { type: "review" | "monitor" | "record" }) {
  const c = "rgba(255,255,255,0.90)";
  if (type === "review") return (
    <g>
      <rect x={-8} y={-12} width={16} height={22} rx={3} fill="none" stroke={c} strokeWidth={1.7} />
      <line x1={-5} y1={-5} x2={5} y2={-5} stroke={c} strokeWidth={1.3} strokeOpacity={.78} />
      <line x1={-5} y1={0} x2={5} y2={0} stroke={c} strokeWidth={1.3} strokeOpacity={.78} />
      <line x1={-5} y1={5} x2={1} y2={5} stroke={c} strokeWidth={1.3} strokeOpacity={.50} />
    </g>
  );
  if (type === "monitor") return (
    <g>
      <path d="M-11,0 C-6,-8 6,-8 11,0 C6,8 -6,8 -11,0 Z" fill="none" stroke={c} strokeWidth={1.7} />
      <circle cx={0} cy={0} r={3.5} fill="none" stroke={c} strokeWidth={1.4} />
      <circle cx={0} cy={0} r={1.4} fill={c} />
    </g>
  );
  return (
    <g>
      <rect x={-11} y={-5} width={11} height={10} rx={5} fill="none" stroke={c} strokeWidth={1.7} />
      <rect x={0} y={-5} width={11} height={10} rx={5} fill="none" stroke={c} strokeWidth={1.7} />
    </g>
  );
}

function FeatureIcon({ type }: { type: string }) {
  const c = "rgba(255,255,255,0.90)";
  switch (type) {
    case "audit": return (
      <g>
        <path d="M0,-12 L10,-7 L10,3 L0,12 L-10,3 L-10,-7 Z" fill="none" stroke={c} strokeWidth={1.7} />
        <path d="M-4,0.5 L-1,4 L5,-3.5" stroke={c} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    );
    case "escrow": return (
      <g>
        <rect x={-9} y={-3} width={18} height={14} rx={3} fill="none" stroke={c} strokeWidth={1.7} />
        <path d="M-9,-3 L0,-12 L9,-3" fill="none" stroke={c} strokeWidth={1.7} />
        <circle cx={0} cy={4} r={2.5} fill="none" stroke={c} strokeWidth={1.4} />
        <line x1={0} y1={6.5} x2={0} y2={9} stroke={c} strokeWidth={1.4} />
      </g>
    );
    case "check": return (
      <g>
        <circle cx={0} cy={-6} r={4.5} fill="none" stroke={c} strokeWidth={1.6} />
        <line x1={0} y1={-1.5} x2={0} y2={12} stroke={c} strokeWidth={1.4} />
        <line x1={-8} y1={2} x2={-2} y2={2} stroke={c} strokeWidth={1.3} strokeOpacity={.65} />
        <line x1={-8} y1={7} x2={-2} y2={7} stroke={c} strokeWidth={1.3} strokeOpacity={.45} />
        <path d="M2.5,0.5 L4.5,2.5 L8,-1.5" stroke={c} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    );
    case "chain": return (
      <g>
        <rect x={-11} y={-5} width={11} height={10} rx={5} fill="none" stroke={c} strokeWidth={1.7} />
        <rect x={0} y={-5} width={11} height={10} rx={5} fill="none" stroke={c} strokeWidth={1.7} />
        <line x1={-8} y1={7} x2={-4} y2={11} stroke={c} strokeWidth={1.3} strokeOpacity={.6} />
        <line x1={4} y1={7} x2={8} y2={11} stroke={c} strokeWidth={1.3} strokeOpacity={.6} />
      </g>
    );
    default: return null;
  }
}

/* ══ ICON BOX ══ */
function IconBox({ type, size = 52 }: { type: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "13px", flexShrink: 0,
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.14)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="28" height="28" viewBox="-13 -13 26 26" fill="none">
        <FeatureIcon type={type} />
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section style={{
      display: "flex", minHeight: "100vh", paddingTop: "62px",
      overflow: "hidden", alignItems: "stretch",
    }}>
      {/* LEFT TEXT */}
      <div style={{
        flex: "0 0 46%", minWidth: 0,
        display: "flex", alignItems: "center",
        padding: "0 40px 0 180px",
      }}>
        <div style={{ paddingBottom: "80px" }}>

          {/* badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            border: "1px solid rgba(255,255,255,0.16)", borderRadius: "999px",
            padding: "5px 16px 5px 8px", fontSize: "11.5px",
            color: "rgba(255,255,255,0.62)",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
            marginBottom: "34px",
          }}>
            <span className="pulse-dot" style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: "rgba(255,255,255,0.72)", flexShrink: 0
            }} />
            2,847+ Contracts audited monthly with ContractGuard AI
          </div>

          <h1 style={{
            fontSize: "clamp(62px,5.8vw,90px)", fontWeight: 900,
            lineHeight: 1.0, letterSpacing: "-0.04em", color: "white",
            marginBottom: "26px",
          }}>
            Contracts<br /><span className="text-shimmer">Secured.</span>
          </h1>

          <p style={{
            fontSize: "15.5px", lineHeight: 1.78,
            color: "rgba(255,255,255,0.50)", maxWidth: "310px",
            marginBottom: "42px",
          }}>
            Audit Contracts, Verify Milestones, And Keep
            Payments On Track — Effortlessly.
          </p>

          <div style={{ display: "flex", gap: "14px", marginBottom: "64px" }}>
            <a href="/audit" style={{
              background: "white", color: "#080808", fontWeight: 700,
              fontSize: "14px", padding: "14px 32px", borderRadius: "6px",
              textDecoration: "none", letterSpacing: "-0.01em",
              display: "inline-flex", alignItems: "center", gap: "9px",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.22), 0 4px 18px rgba(255,255,255,0.14)",
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.28), 0 8px 28px rgba(255,255,255,0.22)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.22), 0 4px 18px rgba(255,255,255,0.14)";
                el.style.transform = "translateY(0)";
              }}
              onMouseDown={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.97)"; }}
              onMouseUp={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
            >
              Audit Contract
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="/dashboard" style={{
              background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.85)",
              fontWeight: 600, fontSize: "14px", padding: "14px 28px",
              borderRadius: "6px", border: "1px solid rgba(255,255,255,0.16)",
              textDecoration: "none", display: "inline-block",
              backdropFilter: "blur(10px)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
              transition: "background 0.2s, border-color 0.2s, transform 0.22s ease",
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "rgba(255,255,255,0.11)";
                el.style.borderColor = "rgba(255,255,255,0.24)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "rgba(255,255,255,0.07)";
                el.style.borderColor = "rgba(255,255,255,0.16)";
                el.style.transform = "translateY(0)";
              }}
              onMouseDown={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.97)"; }}
              onMouseUp={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
            >
              View Dashboard
            </a>
          </div>

          <div>
            <p style={{
              fontSize: "12px", color: "rgba(255,255,255,0.28)",
              letterSpacing: "1.4px", marginBottom: "16px", textTransform: "uppercase" as const,
            }}>
              Trusted by builders across the ecosystem
            </p>
            <div style={{
              overflow: "hidden", maxWidth: "320px",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
              maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
            }}>
              <div className="marquee-track">
                {["Superteam", "Colosseum", "Solana", "Anthropic", "Phantom", "Metaplex", "Superteam", "Colosseum", "Solana", "Anthropic", "Phantom", "Metaplex"].map((n, i) => (
                  <span key={i} style={{
                    fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap",
                    color: "rgba(255,255,255,0.18)", letterSpacing: "-0.01em",
                    marginRight: "36px",
                  }}>{n}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — image */}
      <div style={{
        flex: 1, position: "relative", overflow: "hidden", minWidth: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
          WebkitMaskImage: "radial-gradient(ellipse 78% 82% at 52% 50%, black 10%, transparent 85%)",
          maskImage: "radial-gradient(ellipse 78% 82% at 52% 50%, black 10%, transparent 85%)",
        }} />
        <div style={{
          position: "absolute", zIndex: 1, pointerEvents: "none",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "75%", height: "75%",
          background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 55%, transparent 100%)",
          filter: "blur(55px)", borderRadius: "50%",
          animation: "pulseGlow 6s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", zIndex: 2, pointerEvents: "none",
          top: "48%", left: "50%", transform: "translate(-50%,-50%)",
          width: "42%", height: "42%",
          background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
          filter: "blur(22px)", borderRadius: "50%",
          animation: "pulseGlow 4s ease-in-out infinite",
          animationDelay: "0.8s",
        }} />
        <div style={{
          position: "absolute", zIndex: 3, pointerEvents: "none",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "90%", aspectRatio: "1",
        }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100"
            style={{ animation: "spinRing 42s linear infinite", display: "block" }}>
            <circle cx="50" cy="50" r="48" fill="none"
              stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" strokeDasharray="4 12" />
          </svg>
        </div>
        <div style={{
          position: "absolute", zIndex: 3, pointerEvents: "none",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "73%", aspectRatio: "1",
        }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100"
            style={{ animation: "spinRingCCW 28s linear infinite", display: "block" }}>
            <circle cx="50" cy="50" r="48" fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="2 9" />
          </svg>
        </div>
        <div style={{
          position: "relative", zIndex: 4,
          width: "640px", height: "640px",
          maxWidth: "92%", flexShrink: 0,
          animation: "floatNode 6s ease-in-out infinite",
          filter: "drop-shadow(0 0 28px rgba(255,255,255,0.16)) drop-shadow(0 0 68px rgba(255,255,255,0.07))",
        }}>
          <Image src="/contraguardv2.png" alt="ContractGuard AI" fill
            style={{ objectFit: "contain", objectPosition: "center" }} priority />
        </div>
        <div style={{
          position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none",
          background: "radial-gradient(ellipse 78% 84% at 52% 50%, transparent 52%, #080808 92%)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0, width: "90px",
          background: "linear-gradient(to right, #080808 0%, transparent 100%)",
          zIndex: 6, pointerEvents: "none",
        }} />
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      num: "01", type: "review" as const,
      when: "BEFORE THE DEAL",
      title: "AI Contract Review",
      desc: "Upload your contract PDF. AI reads every clause, detects price markups, identifies unfair terms, and outputs a fairness score — before you sign anything.",
    },
    {
      num: "02", type: "monitor" as const,
      when: "DURING THE PROJECT",
      title: "Checkpoint Monitoring",
      desc: "At each milestone, contractors upload proof of work. AI cross-references it with the contract spec and sends a full verification report instantly.",
    },
    {
      num: "03", type: "record" as const,
      when: "AFTER EACH STEP",
      title: "On-Chain Record",
      desc: "Every contract hash, AI report, and approval is permanently stored on Solana blockchain. Immutable — no one can edit or delete it, ever.",
    },
  ];

  return (
    <section id="how-it-works" style={{
      padding: "120px 0", background: "#080808",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", pointerEvents: "none", zIndex: 0,
        top: "50%", left: "50%",
        width: "80%", height: "80%",
        background: "radial-gradient(ellipse, rgba(255,255,255,0.028) 0%, transparent 65%)",
        filter: "blur(60px)",
        transform: "translate(-50%, -50%)",
      }} />

      <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 80px", position: "relative", zIndex: 1 }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: "80px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center",
            border: "1px solid rgba(255,255,255,0.14)", borderRadius: "999px",
            padding: "4px 14px", fontSize: "11px",
            color: "rgba(255,255,255,0.58)", background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
            marginBottom: "20px", letterSpacing: "1.5px",
          }}>
            HOW IT WORKS
          </div>
          <h2 style={{
            fontSize: "clamp(34px,3.8vw,52px)", fontWeight: 900,
            letterSpacing: "-0.04em", color: "white", lineHeight: 1.05,
            marginBottom: "16px",
          }}>
            Three phases.<br />Zero surprises.
          </h2>
          <p style={{
            fontSize: "15px", color: "rgba(255,255,255,0.42)",
            maxWidth: "420px", margin: "0 auto", lineHeight: 1.76,
          }}>
            From contract review to final payment — every step verified by AI
            and recorded on blockchain.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
          {steps.map((s, i) => (
            <div key={i} className={`card-lift reveal d${i + 1}`} style={{
              ...glass, padding: "36px 30px 34px",
              position: "relative", overflow: "hidden",
            }}>
              {/* Top accent gradient line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                background: "linear-gradient(to right, transparent 5%, rgba(255,255,255,0.22) 40%, rgba(255,255,255,0.22) 60%, transparent 95%)",
                pointerEvents: "none",
              }} />

              {/* Large decorative step number */}
              <div style={{
                position: "absolute", top: "10px", right: "18px",
                fontSize: "96px", fontWeight: 900, fontFamily: "monospace",
                letterSpacing: "-0.07em", lineHeight: 1,
                background: "linear-gradient(175deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.03) 75%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                userSelect: "none", pointerEvents: "none",
              }}>{s.num}</div>

              {/* Phase label */}
              <span style={{
                display: "block", fontSize: "9.5px", letterSpacing: "2.2px",
                color: "rgba(255,255,255,0.38)", fontWeight: 600,
                textTransform: "uppercase" as const,
                marginBottom: "30px",
              }}>{s.when}</span>

              {/* Icon box */}
              <div style={{
                width: "52px", height: "52px", borderRadius: "13px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "24px",
              }}>
                <svg width="28" height="28" viewBox="-13 -13 26 26" fill="none">
                  <StepIcon type={s.type} />
                </svg>
              </div>

              <h3 style={{
                fontSize: "18px", fontWeight: 700, color: "white",
                marginBottom: "12px", letterSpacing: "-0.025em",
              }}>{s.title}</h3>

              <p style={{ fontSize: "14px", lineHeight: 1.78, color: "rgba(255,255,255,0.44)" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   FEATURES
══════════════════════════════════════════════════════ */
function Features() {
  const items = [
    {
      type: "audit", tag: "AI POWERED",
      title: "AI Contract Audit",
      desc: "Fairness score 1–10, line-by-line price analysis, risky clause detection, and specific revision suggestions — before you commit to anything.",
    },
    {
      type: "escrow", tag: "SOLANA",
      title: "Smart Escrow Payments",
      desc: "Funds locked in a Solana smart contract. Released automatically when milestones are approved — no banks, no middlemen, no delays.",
    },
    {
      type: "check", tag: "MONITORING",
      title: "Checkpoint Verification",
      desc: "At every milestone, contractors upload photo evidence. AI cross-references against the contract spec. Approve or request revision — on-chain.",
    },
    {
      type: "chain", tag: "BLOCKCHAIN",
      title: "Tamper-Proof Records",
      desc: "Contract hash, AI reports, and every approval written to Solana. Permanent evidence that no one — not even us — can alter or delete.",
    },
  ];

  return (
    <section id="features" style={{
      padding: "120px 0",
      background: "linear-gradient(180deg, #080808 0%, #0a0c0f 100%)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", pointerEvents: "none", zIndex: 0,
        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "65%", height: "75%",
        background: "radial-gradient(ellipse, rgba(255,255,255,0.026) 0%, transparent 65%)",
        filter: "blur(65px)",
      }} />

      <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 80px", position: "relative", zIndex: 1 }}>
        <div className="reveal" style={{ marginBottom: "64px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center",
            border: "1px solid rgba(255,255,255,0.14)", borderRadius: "999px",
            padding: "4px 14px", fontSize: "11px",
            color: "rgba(255,255,255,0.58)", background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
            marginBottom: "20px", letterSpacing: "1.5px",
          }}>
            FEATURES
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <h2 style={{
              fontSize: "clamp(32px,3.6vw,48px)", fontWeight: 900,
              letterSpacing: "-0.04em", color: "white", lineHeight: 1.05, maxWidth: "480px",
            }}>
              Everything you need<br />to stay protected.
            </h2>
            <p style={{
              fontSize: "14px", color: "rgba(255,255,255,0.40)",
              maxWidth: "290px", lineHeight: 1.76, textAlign: "right",
            }}>
              Built for builders, contractors, and anyone
              who&apos;s been burned by a bad contract.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {items.map((f, i) => (
            <div key={i} className={`card-lift reveal d${i + 1}`} style={{ ...glass, padding: "40px 36px" }}
              onMouseMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                e.currentTarget.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.055) 55%)`;
              }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.055)"; }}
            >
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: "28px",
              }}>
                <IconBox type={f.type} />
                <div style={{
                  fontSize: "9.5px", letterSpacing: "1.8px",
                  color: "rgba(255,255,255,0.38)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "999px", padding: "4px 10px",
                  background: "rgba(255,255,255,0.04)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
                }}>{f.tag}</div>
              </div>
              <h3 style={{
                fontSize: "18px", fontWeight: 700, color: "white",
                marginBottom: "12px", letterSpacing: "-0.025em",
              }}>{f.title}</h3>
              <p style={{ fontSize: "14px", lineHeight: 1.78, color: "rgba(255,255,255,0.44)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   STATS
══════════════════════════════════════════════════════ */
function Stats() {
  const stats = [
    { value: "< $0.01", label: "PER TRANSACTION", sub: "Near-zero fees on Solana" },
    { value: "400ms", label: "FINALITY SPEED", sub: "Faster than any other chain" },
    { value: "100%", label: "IMMUTABLE", sub: "Records can never be altered" },
    { value: "Claude", label: "POWERED BY AI", sub: "Anthropic's most capable model" },
  ];

  return (
    <section style={{
      padding: "100px 0", background: "#080808",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", pointerEvents: "none", zIndex: 0,
        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "55%", height: "80%",
        background: "radial-gradient(ellipse, rgba(255,255,255,0.030) 0%, transparent 65%)",
        filter: "blur(60px)",
      }} />
      <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 80px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{
            fontSize: "clamp(30px,3.2vw,44px)", fontWeight: 900,
            letterSpacing: "-0.04em", color: "white", marginBottom: "12px",
          }}>Trustless by design.</h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.40)", lineHeight: 1.75 }}>
            Built on Solana for speed, cost-efficiency, and absolute immutability.
          </p>
        </div>

        <div className="reveal" style={{
          display: "grid", gridTemplateColumns: "repeat(4,1fr)",
          border: "1px solid rgba(255,255,255,0.13)",
          borderRadius: "16px", overflow: "hidden",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.16)",
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.045)",
              padding: "44px 28px", textAlign: "center",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.09)" : "none",
              transition: "background 0.28s ease",
              cursor: "default",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.075)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.045)"; }}
            >
              <div style={{
                fontSize: "clamp(26px,2.8vw,38px)", fontWeight: 900,
                letterSpacing: "-0.04em", color: "white", marginBottom: "8px",
              }}>{s.value}</div>
              <div style={{
                fontSize: "10.5px", letterSpacing: "1.6px",
                color: "rgba(255,255,255,0.55)", marginBottom: "6px",
              }}>{s.label}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.32)" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   CTA
══════════════════════════════════════════════════════ */
function CTA() {
  return (
    <section style={{
      padding: "140px 0",
      background: "linear-gradient(180deg, #0a0c0f 0%, #080808 100%)",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", pointerEvents: "none", zIndex: 0,
        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: "75%", height: "100%",
        background: "radial-gradient(ellipse, rgba(255,255,255,0.038) 0%, transparent 60%)",
        filter: "blur(70px)",
      }} />

      <div style={{
        maxWidth: "640px", margin: "0 auto",
        padding: "0 40px", textAlign: "center",
        position: "relative", zIndex: 1,
      }}>
        <div className="reveal border-glow-pulse" style={{
          background: "rgba(255,255,255,0.058)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "24px",
          padding: "64px 56px",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: "999px",
            padding: "4px 14px", fontSize: "11px",
            color: "rgba(255,255,255,0.58)", background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
            marginBottom: "28px", letterSpacing: "1.5px",
          }}>
            GET STARTED
          </div>

          <h2 style={{
            fontSize: "clamp(30px,4vw,48px)", fontWeight: 900,
            letterSpacing: "-0.045em", color: "white",
            lineHeight: 1.05, marginBottom: "22px",
          }}>
            Secure your next contract<br />with AI + blockchain.
          </h2>

          <p style={{
            fontSize: "15px", color: "rgba(255,255,255,0.44)",
            marginBottom: "44px", lineHeight: 1.75,
          }}>
            Upload your contract PDF, get an AI audit in seconds,
            and lock every milestone on-chain — for free.
          </p>

          <div style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
            <a href="/audit" style={{
              background: "white", color: "#080808", fontWeight: 700,
              fontSize: "15px", padding: "15px 36px", borderRadius: "8px",
              textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.22), 0 4px 18px rgba(255,255,255,0.14)",
            }}>
              Audit Contract
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor"
                  strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="/pricing" style={{
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)",
              fontSize: "15px", padding: "15px 30px", borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
            }}>
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useEffect(() => {
    const els = document.querySelectorAll<Element>('.reveal');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          // Remove reveal class after transition finishes so card-lift hover stays snappy
          setTimeout(() => {
            e.target.classList.remove('reveal');
            observer.unobserve(e.target);
          }, 1250);
        }
      }),
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main style={{ background: "#080808", minHeight: "100vh", color: "white", overflowX: "hidden" }}>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Stats />
      <CTA />
      <Footer />
    </main>
  );
}
