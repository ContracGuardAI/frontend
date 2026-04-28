"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { IconShield, IconLink, IconSparkle, IconGlobe } from "../components/Icons";

const glass = {
  background: "rgba(255,255,255,0.055)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
  borderRadius: "20px",
} as const;

const PLANS = [
  {
    name: "Free",
    tagline: "For individuals",
    price: "0",
    unit: "forever",
    cta: "Get Started",
    ctaHref: "/audit",
    featured: false,
    features: [
      { text: "3 AI contract reviews / month", included: true },
      { text: "Fairness score & basic analysis", included: true },
      { text: "Price markup detection", included: true },
      { text: "Manual contract creation", included: true },
      { text: "Smart contract escrow", included: false },
      { text: "On-chain record (Solana)", included: false },
      { text: "Checkpoint monitoring", included: false },
      { text: "Priority AI queue", included: false },
    ],
  },
  {
    name: "Pro",
    tagline: "For active builders",
    price: "0.5",
    unit: "% per contract",
    sub: "0.1 SOL minimum fee per review",
    cta: "Start Free Trial",
    ctaHref: "/audit",
    featured: true,
    features: [
      { text: "Unlimited AI contract reviews", included: true },
      { text: "Full price analysis & market rates", included: true },
      { text: "Risky clause detection + suggestions", included: true },
      { text: "Smart contract escrow (Solana)", included: true },
      { text: "On-chain immutable records", included: true },
      { text: "Checkpoint monitoring + AI review", included: true },
      { text: "Priority AI queue", included: true },
      { text: "Export PDF reports", included: false },
    ],
  },
  {
    name: "Enterprise",
    tagline: "For companies & agencies",
    price: "Custom",
    unit: "contact us",
    cta: "Contact Sales",
    ctaHref: "#",
    featured: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "White-label deployment", included: true },
      { text: "Custom AI system prompt", included: true },
      { text: "Multi-language contract review", included: true },
      { text: "Reputation system (on-chain scores)", included: true },
      { text: "Dispute resolution with arbiter voting", included: true },
      { text: "Export PDF reports", included: true },
      { text: "Dedicated SLA & support", included: true },
    ],
  },
];

const FAQS = [
  {
    q: "How does the 0.5% fee work?",
    a: "The platform fee is 0.5% of the total escrow amount. For a 10 SOL contract, that's 0.05 SOL. There's a minimum of 0.1 SOL per review to cover Solana transaction costs.",
  },
  {
    q: "Is my contract data stored on your servers?",
    a: "Contract hashes and AI review hashes are stored on Solana blockchain — fully public and immutable. The full PDF and AI report text are stored on our servers. We never sell or share your contract data.",
  },
  {
    q: "Can I use this for any type of contract?",
    a: "Yes. ContractGuard AI works best for construction, renovation, service, and freelance contracts. We've optimized the AI prompts specifically for Indonesian contract law and pricing standards.",
  },
  {
    q: "What happens if contractor disputes the AI review?",
    a: "The Enterprise plan includes a decentralized dispute resolution system. A pool of registered arbiters stakes SOL to vote on disputes. This adds a trustless layer without needing courts or lawyers.",
  },
  {
    q: "Do I need SOL to use the free tier?",
    a: "No. The free tier uses off-chain AI analysis only — no blockchain transactions required. You only need SOL when creating an on-chain contract or using escrow.",
  },
];

function CheckIcon({ included }: { included: boolean }) {
  if (included) return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="6.5" fill="rgba(80,220,140,0.12)" stroke="rgba(80,220,140,0.35)" strokeWidth="1" />
      <path d="M4.5 7.5 L6.5 9.5 L10.5 5.5" stroke="rgba(80,220,140,0.90)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="6.5" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
      <line x1="5.5" y1="5.5" x2="9.5" y2="9.5" stroke="rgba(255,255,255,0.18)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="9.5" y1="5.5" x2="5.5" y2="9.5" stroke="rgba(255,255,255,0.18)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* ── Accordion FAQ ── */
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        ...glass,
        padding: "20px 26px",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
      onClick={() => setOpen(o => !o)}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.075)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.20)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.055)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.13)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "white", letterSpacing: "-0.02em", margin: 0, flex: 1 }}>{q}</h3>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.30s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <path d="M3 6 L8 11 L13 6" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Smooth height animation via CSS grid trick */}
      <div style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        transition: "grid-template-rows 0.32s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ overflow: "hidden" }}>
          <p style={{
            fontSize: "13.5px", color: "rgba(255,255,255,0.50)",
            lineHeight: 1.70, margin: "12px 0 2px 0",
          }}>{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <main style={{ background: "#080808", minHeight: "100vh", color: "white" }}>
      <Navbar />

      <div style={{
        position: "fixed", pointerEvents: "none", zIndex: 0,
        top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: "70%", height: "65%",
        background: "radial-gradient(ellipse, rgba(255,255,255,0.026) 0%, transparent 65%)",
        filter: "blur(75px)",
      }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "120px 80px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <div className="page-in p0" style={{
            display: "inline-flex", alignItems: "center",
            border: "1px solid rgba(201,168,76,0.38)", borderRadius: "999px",
            padding: "4px 14px", fontSize: "11px",
            color: "rgba(201,168,76,0.85)", background: "rgba(201,168,76,0.06)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            boxShadow: "inset 0 1px 0 rgba(201,168,76,0.16), 0 0 14px rgba(201,168,76,0.08)",
            marginBottom: "20px", letterSpacing: "1.5px",
          }}>
            PRICING
          </div>
          <h1 className="page-in p1" style={{
            fontSize: "clamp(36px,4.2vw,58px)", fontWeight: 900,
            letterSpacing: "-0.045em", color: "white",
            lineHeight: 1.0, marginBottom: "18px",
          }}>
            Simple, transparent pricing.
          </h1>
          <p className="page-in p2" style={{
            fontSize: "15px", color: "rgba(255,255,255,0.44)",
            maxWidth: "480px", margin: "0 auto", lineHeight: 1.75,
          }}>
            Start free. Pay only when your contract closes.
            No subscriptions — just a small platform fee.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="page-in p3" style={{
          display: "grid", gridTemplateColumns: "1fr 1.08fr 1fr",
          gap: "16px", marginBottom: "80px", alignItems: "start",
        }}>
          {PLANS.map((plan) => (
            <div key={plan.name} className="card-lift" style={{
              ...glass,
              padding: plan.featured ? "36px 32px" : "30px 28px",
              border: plan.featured ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(255,255,255,0.10)",
              background: plan.featured ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.045)",
              boxShadow: plan.featured
                ? "0 8px 40px rgba(0,0,0,0.65), inset 0 1px 0 rgba(201,168,76,0.22), 0 0 40px rgba(201,168,76,0.06)"
                : "0 4px 24px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.12)",
              position: "relative",
            }}>
              {plan.featured && (
                <div style={{
                  position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #C9A84C, #E8C470)", color: "#080808",
                  fontSize: "10.5px", fontWeight: 800, letterSpacing: "1px",
                  padding: "4px 14px", borderRadius: "999px",
                  boxShadow: "0 0 0 1px rgba(201,168,76,0.40), 0 4px 14px rgba(201,168,76,0.35)",
                  whiteSpace: "nowrap",
                }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "1.5px", color: "rgba(255,255,255,0.40)", marginBottom: "6px" }}>
                  {plan.tagline.toUpperCase()}
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: 900, color: "white", letterSpacing: "-0.03em", marginBottom: "14px" }}>
                  {plan.name}
                </h2>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: plan.price === "Custom" ? "28px" : "36px", fontWeight: 900, color: "white", letterSpacing: "-0.04em" }}>
                    {plan.price === "0" ? "Free" : plan.price === "Custom" ? "Custom" : `${plan.price}%`}
                  </span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.38)" }}>{plan.unit}</span>
                </div>
                {plan.sub && (
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.30)", marginTop: "4px" }}>{plan.sub}</div>
                )}
              </div>

              <Link href={plan.ctaHref} style={{
                display: "block", textAlign: "center",
                padding: "13px 0", borderRadius: "8px",
                fontSize: "14px", fontWeight: 700, textDecoration: "none",
                marginBottom: "28px",
                transition: "transform 0.22s ease, box-shadow 0.22s ease, background 0.2s, border-color 0.2s",
                ...(plan.featured ? {
                  background: "white", color: "#080808",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.22), 0 4px 14px rgba(255,255,255,0.14)",
                } : {
                  background: "rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.75)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
                }),
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.transform = "translateY(-2px)";
                  if (plan.featured) {
                    el.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.28), 0 8px 24px rgba(255,255,255,0.20)";
                  } else {
                    el.style.background = "rgba(255,255,255,0.12)";
                    (el.style as CSSStyleDeclaration & { borderColor: string }).borderColor = "rgba(255,255,255,0.22)";
                  }
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.transform = "translateY(0)";
                  if (plan.featured) {
                    el.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.22), 0 4px 14px rgba(255,255,255,0.14)";
                  } else {
                    el.style.background = "rgba(255,255,255,0.07)";
                    (el.style as CSSStyleDeclaration & { borderColor: string }).borderColor = "rgba(255,255,255,0.14)";
                  }
                }}
                onMouseDown={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.97)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
              >
                {plan.cta}
              </Link>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "22px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "1.2px", color: "rgba(201,168,76,0.65)", marginBottom: "14px" }}>
                  INCLUDED
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <CheckIcon included={f.included} />
                      <span style={{
                        fontSize: "13px",
                        color: f.included ? "rgba(255,255,255,0.62)" : "rgba(255,255,255,0.24)",
                      }}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="page-in p4" style={{ ...glass, padding: "28px 36px", marginBottom: "80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "24px" }}>
            {[
              { Icon: IconShield,  title: "Non-custodial",      desc: "We never hold your funds. Escrow is a Solana PDA." },
              { Icon: IconLink,    title: "Fully on-chain",      desc: "Every audit hash is written to Solana devnet." },
              { Icon: IconSparkle, title: "Claude AI",           desc: "Powered by Anthropic's most capable model." },
              { Icon: IconGlobe,   title: "Built for Indonesia", desc: "Optimized for Indonesian contract law & pricing." },
            ].map(({ Icon, title, desc }, i) => (
              <div key={i} style={{
                textAlign: "center", padding: "14px 8px", borderRadius: "12px",
                transition: "background 0.2s ease, transform 0.22s ease",
                cursor: "default",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px", margin: "0 auto 12px",
                  background: "rgba(201,168,76,0.08)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  boxShadow: "inset 0 1px 0 rgba(201,168,76,0.18), 0 0 10px rgba(201,168,76,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={18} color="#C9A84C" strokeWidth={1.7} />
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "white", marginBottom: "5px" }}>{title}</div>
                <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.38)", lineHeight: 1.55 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <h2 style={{
            fontSize: "clamp(28px,3vw,38px)", fontWeight: 900,
            letterSpacing: "-0.04em", color: "white", marginBottom: "12px",
          }}>Frequently asked questions</h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.40)" }}>
            Still have questions? Reach us on{" "}
            <a href="#" style={{ color: "rgba(255,255,255,0.60)", textDecoration: "underline" }}>Discord</a> or{" "}
            <a href="#" style={{ color: "rgba(255,255,255,0.60)", textDecoration: "underline" }}>GitHub</a>.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "80px" }}>
          {FAQS.map((faq, i) => <FAQ key={i} q={faq.q} a={faq.a} />)}
        </div>

        {/* Bottom CTA */}
        <div style={{
          background: "rgba(255,255,255,0.058)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.20)",
          borderRadius: "20px", padding: "52px", textAlign: "center",
        }}>
          <h2 style={{
            fontSize: "clamp(26px,3vw,36px)", fontWeight: 900,
            letterSpacing: "-0.04em", color: "white", marginBottom: "14px",
          }}>
            Ready to secure your contracts?
          </h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.42)", marginBottom: "32px" }}>
            Start with the free tier — no credit card, no wallet required.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link href="/audit" style={{
              background: "white", color: "#080808", fontWeight: 700,
              fontSize: "14px", padding: "14px 36px", borderRadius: "8px",
              textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "9px",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.22), 0 4px 18px rgba(255,255,255,0.14)",
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = "translateY(-2px)";
                el.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.28), 0 8px 28px rgba(255,255,255,0.22)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.22), 0 4px 18px rgba(255,255,255,0.14)";
              }}
              onMouseDown={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.97)"; }}
              onMouseUp={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
            >
              Start Free Audit
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/create" style={{
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)",
              fontSize: "14px", fontWeight: 600, padding: "14px 30px", borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.14)", textDecoration: "none",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
              transition: "background 0.2s, border-color 0.2s, transform 0.22s ease",
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "rgba(255,255,255,0.10)";
                el.style.borderColor = "rgba(255,255,255,0.22)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "rgba(255,255,255,0.06)";
                el.style.borderColor = "rgba(255,255,255,0.14)";
                el.style.transform = "translateY(0)";
              }}
              onMouseDown={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.97)"; }}
              onMouseUp={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
            >
              Create Contract
            </Link>
          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}
