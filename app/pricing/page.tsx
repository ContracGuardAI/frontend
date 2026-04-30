"use client";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const glass = {
  background: "var(--surface)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid var(--border)",
  boxShadow: "var(--glass-shadow)",
  borderRadius: "20px",
} as const;

const plans = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    desc: "Get started with basic contract auditing.",
    features: [
      "3 contract reviews / month",
      "AI fairness score",
      "Basic clause detection",
      "PDF upload support",
    ],
    cta: "Get Started",
    href: "/audit",
    highlight: false,
  },
  {
    name: "Pro",
    price: "9",
    period: "per month",
    desc: "Full AI audit suite for active builders.",
    features: [
      "Unlimited contract reviews",
      "Deep price markup analysis",
      "Full risky clause detection",
      "Checkpoint monitoring",
      "On-chain record (Solana)",
      "PDF + text upload",
      "Priority AI processing",
    ],
    cta: "Start Free Trial",
    href: "/audit",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "49",
    period: "per month",
    desc: "For teams and high-volume projects.",
    features: [
      "Everything in Pro",
      "Team workspace",
      "Custom AI prompts",
      "Bulk contract upload",
      "Dedicated support",
      "Custom on-chain program",
      "SLA guarantee",
    ],
    cta: "Contact Us",
    href: "/audit",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <Navbar />

      <section style={{ padding: "140px 0 120px", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", pointerEvents: "none", zIndex: 0,
          top: "30%", left: "50%", transform: "translate(-50%, -50%)",
          width: "70%", height: "60%",
          background: "radial-gradient(ellipse, var(--accent-glow) 0%, transparent 65%)",
          filter: "blur(70px)",
        }} />

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 80px", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div className="page-in p0" style={{ textAlign: "center", marginBottom: "72px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center",
              border: "1px solid var(--accent-border-strong)", borderRadius: "999px",
              padding: "4px 14px", fontSize: "11px",
              color: "var(--accent-text)", background: "var(--accent-bg)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              boxShadow: "inset 0 1px 0 var(--accent-glow)",
              marginBottom: "24px", letterSpacing: "1.5px",
            }}>
              PRICING
            </div>
            <h1 style={{
              fontSize: "clamp(40px,5vw,64px)", fontWeight: 900,
              letterSpacing: "-0.04em", color: "var(--text)", lineHeight: 1.05,
              marginBottom: "18px",
            }}>
              Simple, transparent<br />
              <span className="text-shimmer">pricing.</span>
            </h1>
            <p style={{
              fontSize: "16px", color: "var(--text-3)",
              maxWidth: "400px", margin: "0 auto", lineHeight: 1.78,
            }}>
              Start free. Upgrade when you need more.
              No hidden fees, no lock-in.
            </p>
          </div>

          {/* Plans */}
          <div className="page-in p1" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px",
            alignItems: "start",
          }}>
            {plans.map((plan) => (
              <div key={plan.name} style={{
                ...glass,
                padding: "40px 34px",
                position: "relative", overflow: "hidden",
                border: plan.highlight
                  ? "1px solid var(--accent-border-strong)"
                  : "1px solid var(--border)",
                boxShadow: plan.highlight
                  ? `0 0 0 1px var(--accent-glow), 0 8px 40px var(--accent-glow), var(--glass-shadow)`
                  : "var(--glass-shadow)",
              }}>
                {/* Top accent line */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "1px", pointerEvents: "none",
                  background: plan.highlight
                    ? "linear-gradient(to right, transparent 5%, var(--accent-border-hover) 50%, transparent 95%)"
                    : "linear-gradient(to right, transparent 5%, var(--border-strong) 50%, transparent 95%)",
                }} />

                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: "16px", right: "16px",
                    fontSize: "9.5px", letterSpacing: "1.6px",
                    color: "var(--accent-text)",
                    border: "1px solid var(--accent-border-strong)",
                    borderRadius: "999px", padding: "3px 10px",
                    background: "var(--accent-bg)",
                  }}>POPULAR</div>
                )}

                <div style={{ marginBottom: "28px" }}>
                  <p style={{
                    fontSize: "12px", letterSpacing: "1.8px",
                    color: plan.highlight ? "var(--accent-text)" : "var(--text-3)",
                    marginBottom: "10px", fontWeight: 600,
                  }}>{plan.name.toUpperCase()}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "14px", color: "var(--text-3)" }}>$</span>
                    <span style={{
                      fontSize: "52px", fontWeight: 900,
                      letterSpacing: "-0.05em", color: "var(--text)", lineHeight: 1,
                    }}>{plan.price}</span>
                    <span style={{ fontSize: "13px", color: "var(--text-4)" }}>/ {plan.period}</span>
                  </div>
                  <p style={{ fontSize: "13.5px", color: "var(--text-3)", lineHeight: 1.65 }}>
                    {plan.desc}
                  </p>
                </div>

                <div style={{
                  height: "1px", marginBottom: "26px",
                  background: "var(--border-light)",
                }} />

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: "13px" }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
                        <circle cx="8" cy="8" r="7.5" stroke="var(--accent-border)" />
                        <path d="M4.5 8L7 10.5L11.5 5.5" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: "13.5px", color: "var(--text-2)", lineHeight: 1.5 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} style={{
                  display: "block", textAlign: "center",
                  padding: "13px 0", borderRadius: "8px",
                  fontSize: "14px", fontWeight: 700,
                  textDecoration: "none",
                  transition: "transform 0.22s ease, box-shadow 0.22s ease, opacity 0.2s",
                  ...(plan.highlight ? {
                    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 50%, var(--accent) 100%)",
                    backgroundSize: "200% 100%",
                    color: "var(--btn-primary-text)",
                    boxShadow: `0 0 0 1px var(--accent-border-strong), 0 4px 18px var(--accent-glow)`,
                  } : {
                    background: "var(--btn-ghost-bg)",
                    color: "var(--text-2)",
                    border: "1px solid var(--border)",
                  }),
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                    if (plan.highlight) {
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 0 1px var(--accent-border-hover), 0 8px 28px var(--accent-glow)`;
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                    if (plan.highlight) {
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 0 1px var(--accent-border-strong), 0 4px 18px var(--accent-glow)`;
                    }
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="page-in p2" style={{
            textAlign: "center", marginTop: "48px",
            fontSize: "13px", color: "var(--text-4)", lineHeight: 1.7,
          }}>
            All plans include Solana Devnet testing at no extra cost.{" "}
            <span style={{ color: "var(--accent-text-dim)" }}>No credit card required for Free plan.</span>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
