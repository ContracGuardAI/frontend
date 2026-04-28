"use client";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const glass = {
  background: "rgba(255,255,255,0.055)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
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
    <main style={{ background: "#080808", minHeight: "100vh", color: "white" }}>
      <Navbar />

      <section style={{ padding: "140px 0 120px", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", pointerEvents: "none", zIndex: 0,
          top: "30%", left: "50%", transform: "translate(-50%, -50%)",
          width: "70%", height: "60%",
          background: "radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 65%)",
          filter: "blur(70px)",
        }} />

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 80px", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div className="page-in p0" style={{ textAlign: "center", marginBottom: "72px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center",
              border: "1px solid rgba(201,168,76,0.38)", borderRadius: "999px",
              padding: "4px 14px", fontSize: "11px",
              color: "rgba(201,168,76,0.85)", background: "rgba(201,168,76,0.06)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              boxShadow: "inset 0 1px 0 rgba(201,168,76,0.16)",
              marginBottom: "24px", letterSpacing: "1.5px",
            }}>
              PRICING
            </div>
            <h1 style={{
              fontSize: "clamp(40px,5vw,64px)", fontWeight: 900,
              letterSpacing: "-0.04em", color: "white", lineHeight: 1.05,
              marginBottom: "18px",
            }}>
              Simple, transparent<br />
              <span className="text-shimmer">pricing.</span>
            </h1>
            <p style={{
              fontSize: "16px", color: "rgba(255,255,255,0.45)",
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
                  ? "1px solid rgba(201,168,76,0.45)"
                  : "1px solid rgba(255,255,255,0.13)",
                boxShadow: plan.highlight
                  ? "0 0 0 1px rgba(201,168,76,0.14), 0 8px 40px rgba(201,168,76,0.12), 0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)"
                  : "0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
              }}>
                {/* Top accent line */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "1px", pointerEvents: "none",
                  background: plan.highlight
                    ? "linear-gradient(to right, transparent 5%, rgba(201,168,76,0.70) 50%, transparent 95%)"
                    : "linear-gradient(to right, transparent 5%, rgba(255,255,255,0.18) 50%, transparent 95%)",
                }} />

                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: "16px", right: "16px",
                    fontSize: "9.5px", letterSpacing: "1.6px",
                    color: "rgba(201,168,76,0.90)",
                    border: "1px solid rgba(201,168,76,0.38)",
                    borderRadius: "999px", padding: "3px 10px",
                    background: "rgba(201,168,76,0.10)",
                  }}>POPULAR</div>
                )}

                <div style={{ marginBottom: "28px" }}>
                  <p style={{
                    fontSize: "12px", letterSpacing: "1.8px",
                    color: plan.highlight ? "rgba(201,168,76,0.85)" : "rgba(255,255,255,0.45)",
                    marginBottom: "10px", fontWeight: 600,
                  }}>{plan.name.toUpperCase()}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)" }}>$</span>
                    <span style={{
                      fontSize: "52px", fontWeight: 900,
                      letterSpacing: "-0.05em", color: "white", lineHeight: 1,
                    }}>{plan.price}</span>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>/ {plan.period}</span>
                  </div>
                  <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.42)", lineHeight: 1.65 }}>
                    {plan.desc}
                  </p>
                </div>

                <div style={{
                  height: "1px", marginBottom: "26px",
                  background: "rgba(255,255,255,0.08)",
                }} />

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: "13px" }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
                        <circle cx="8" cy="8" r="7.5" stroke="rgba(201,168,76,0.45)" />
                        <path d="M4.5 8L7 10.5L11.5 5.5" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.60)", lineHeight: 1.5 }}>{f}</span>
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
                    background: "linear-gradient(135deg, #C9A84C 0%, #E8C470 50%, #C9A84C 100%)",
                    backgroundSize: "200% 100%",
                    color: "#1a1200",
                    boxShadow: "0 0 0 1px rgba(201,168,76,0.40), 0 4px 18px rgba(201,168,76,0.28)",
                  } : {
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.80)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }),
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                    if (plan.highlight) {
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 0 1px rgba(201,168,76,0.55), 0 8px 28px rgba(201,168,76,0.40)";
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                    if (plan.highlight) {
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 0 1px rgba(201,168,76,0.40), 0 4px 18px rgba(201,168,76,0.28)";
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
            fontSize: "13px", color: "rgba(255,255,255,0.28)", lineHeight: 1.7,
          }}>
            All plans include Solana Devnet testing at no extra cost.{" "}
            <span style={{ color: "rgba(201,168,76,0.55)" }}>No credit card required for Free plan.</span>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
