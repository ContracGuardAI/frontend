"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { IconDocument } from "../components/Icons";

const glass = {
  background: "rgba(255,255,255,0.055)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
  borderRadius: "16px",
} as const;

type Status = "Active" | "Draft" | "Completed" | "Disputed";

const STATUS_STYLES: Record<Status, { bg: string; text: string; border: string }> = {
  Active:    { bg: "rgba(80,220,140,0.10)", text: "rgba(80,220,140,0.90)",  border: "rgba(80,220,140,0.28)" },
  Draft:     { bg: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.55)", border: "rgba(255,255,255,0.14)" },
  Completed: { bg: "rgba(100,160,255,0.10)", text: "rgba(130,180,255,0.90)", border: "rgba(100,160,255,0.28)" },
  Disputed:  { bg: "rgba(255,80,80,0.10)",  text: "rgba(255,120,120,0.90)", border: "rgba(255,80,80,0.28)" },
};

const MOCK_CONTRACTS = [
  {
    id: "cg-001",
    title: "Renovasi Rumah Tingkat 2 — Jl. Sudirman",
    contractor: "PT. Bangun Jaya",
    contractorWallet: "7mXp...3kRw",
    totalAmount: "12.5 SOL",
    status: "Active" as Status,
    checkpoints: { total: 4, completed: 2, current: "Roofing & Walls" },
    createdAt: "Apr 20, 2025",
    fairnessScore: 6,
  },
  {
    id: "cg-002",
    title: "Interior Kantor — Gedung Menara Utara Lt. 8",
    contractor: "CV. Desain Prima",
    contractorWallet: "3pQs...8mNk",
    totalAmount: "8.2 SOL",
    status: "Draft" as Status,
    checkpoints: { total: 3, completed: 0, current: "Not started" },
    createdAt: "Apr 24, 2025",
    fairnessScore: 8,
  },
  {
    id: "cg-003",
    title: "Pengadaan Furnitur & AC — Kantor Baru",
    contractor: "Toko Mebel Makmur",
    contractorWallet: "9kLw...2pXj",
    totalAmount: "3.8 SOL",
    status: "Completed" as Status,
    checkpoints: { total: 2, completed: 2, current: "All done" },
    createdAt: "Mar 15, 2025",
    fairnessScore: 9,
  },
  {
    id: "cg-004",
    title: "Pengerjaan Taman & Landscaping",
    contractor: "Green Space Studio",
    contractorWallet: "4nVm...7cWq",
    totalAmount: "2.1 SOL",
    status: "Disputed" as Status,
    checkpoints: { total: 3, completed: 1, current: "Under review" },
    createdAt: "Apr 10, 2025",
    fairnessScore: 5,
  },
];

type Filter = "All" | Status;
const FILTERS: Filter[] = ["All", "Active", "Draft", "Completed", "Disputed"];

function StatusPill({ status }: { status: Status }) {
  const s = STATUS_STYLES[status];
  return (
    <span style={{
      fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.8px",
      padding: "4px 11px", borderRadius: "999px",
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
    }}>{status.toUpperCase()}</span>
  );
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.40)" }}>
          {completed}/{total} checkpoints
        </span>
        <span style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div style={{
        height: "4px", borderRadius: "999px",
        background: "rgba(255,255,255,0.08)", overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: "999px",
          width: `${pct}%`,
          background: pct === 100 ? "rgba(80,220,140,0.80)" : "rgba(255,255,255,0.55)",
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

function CountUp({ end, duration = 900 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const steps = 40;
    const increment = end / steps;
    const intervalMs = duration / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.round(start));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <>{count}</>;
}

export default function DashboardPage() {
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = filter === "All" ? MOCK_CONTRACTS : MOCK_CONTRACTS.filter(c => c.status === filter);

  const stats = [
    { label: "TOTAL CONTRACTS", value: MOCK_CONTRACTS.length },
    { label: "ACTIVE",          value: MOCK_CONTRACTS.filter(c => c.status === "Active").length },
    { label: "COMPLETED",       value: MOCK_CONTRACTS.filter(c => c.status === "Completed").length },
    { label: "ESCROW LOCKED",   value: "24.3 SOL" },
  ];

  return (
    <main style={{ background: "#080808", minHeight: "100vh", color: "white" }}>
      <Navbar />

      <div style={{
        position: "fixed", pointerEvents: "none", zIndex: 0,
        top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: "70%", height: "60%",
        background: "radial-gradient(ellipse, rgba(255,255,255,0.024) 0%, transparent 65%)",
        filter: "blur(70px)",
      }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "110px 80px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
          <div>
            <div className="page-in p0" style={{
              display: "inline-flex", alignItems: "center",
              border: "1px solid rgba(201,168,76,0.38)", borderRadius: "999px",
              padding: "4px 14px", fontSize: "11px",
              color: "rgba(201,168,76,0.85)", background: "rgba(201,168,76,0.06)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              boxShadow: "inset 0 1px 0 rgba(201,168,76,0.16), 0 0 14px rgba(201,168,76,0.08)",
              marginBottom: "14px", letterSpacing: "1.5px",
            }}>
              DASHBOARD
            </div>
            <h1 className="page-in p1" style={{
              fontSize: "clamp(30px,3.5vw,44px)", fontWeight: 900,
              letterSpacing: "-0.04em", color: "white", lineHeight: 1.0,
            }}>
              Your Contracts
            </h1>
          </div>
          <Link href="/create" className="page-in p2" style={{
            background: "white", color: "#080808", fontWeight: 700,
            fontSize: "13.5px", padding: "12px 26px", borderRadius: "7px",
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.20), 0 4px 14px rgba(255,255,255,0.12)",
            transition: "opacity 0.2s, transform 0.2s, box-shadow 0.2s",
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 0 1px rgba(255,255,255,0.22), 0 8px 22px rgba(255,255,255,0.18)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 0 1px rgba(255,255,255,0.20), 0 4px 14px rgba(255,255,255,0.12)";
            }}
            onMouseDown={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.97)"; }}
            onMouseUp={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New Contract
          </Link>
        </div>

        {/* Stats */}
        <div className="page-in p3" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px", marginBottom: "32px",
        }}>
          {stats.map((s, i) => (
            <div key={i} className="card-lift" style={{ ...glass, padding: "22px 24px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "1.6px", color: "rgba(255,255,255,0.40)", marginBottom: "8px" }}>{s.label}</div>
              <div className="num-glow" style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-0.04em", background: "linear-gradient(135deg, #E8C470 0%, #C9A84C 50%, #F5DEB3 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {typeof s.value === "number" ? <CountUp end={s.value} /> : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="page-in p4" style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "8px 18px", borderRadius: "8px", cursor: "pointer",
              fontSize: "13px", fontWeight: filter === f ? 700 : 400,
              background: filter === f ? "rgba(201,168,76,0.10)" : "transparent",
              color: filter === f ? "rgba(201,168,76,0.90)" : "rgba(255,255,255,0.40)",
              border: filter === f ? "1px solid rgba(201,168,76,0.32)" : "1px solid transparent",
              fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
              transition: "all 0.2s",
              boxShadow: filter === f ? "inset 0 1px 0 rgba(201,168,76,0.16)" : "none",
            } as React.CSSProperties}>
              {f}
              {f !== "All" && (
                <span style={{ marginLeft: "6px", fontSize: "10.5px", opacity: 0.6 }}>
                  {MOCK_CONTRACTS.filter(c => c.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contract cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((contract, i) => (
            <Link key={contract.id} href={`/dashboard/${contract.id}`} style={{ textDecoration: "none" }}>
              <div style={{
                ...glass, padding: "24px 28px",
                cursor: "pointer",
                transition: "border-color 0.25s ease, background 0.25s ease, transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease",
                display: "grid", gridTemplateColumns: "1fr 1fr auto",
                gap: "24px", alignItems: "center",
                animation: `fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s both`,
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.22)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.075)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 44px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.22)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.13)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.055)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)";
                }}
              >
                {/* Left: title + contractor */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    {contract.status === "Active" && (
                      <span className="pulse-dot" style={{
                        width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0,
                        background: "rgba(80,220,140,0.90)",
                        boxShadow: "0 0 6px rgba(80,220,140,0.60)",
                      }} />
                    )}
                    <StatusPill status={contract.status} />
                    <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.30)" }}>{contract.createdAt}</span>
                  </div>
                  <h3 style={{
                    fontSize: "16px", fontWeight: 700, color: "white",
                    marginBottom: "6px", letterSpacing: "-0.02em",
                  }}>{contract.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: "rgba(255,255,255,0.25)",
                    }} />
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
                      {contract.contractor}
                    </span>
                    <span style={{
                      fontSize: "11px", fontFamily: "monospace",
                      color: "rgba(255,255,255,0.22)",
                    }}>
                      {contract.contractorWallet}
                    </span>
                  </div>
                </div>

                {/* Middle: progress */}
                <div>
                  <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>
                    Current: <span style={{ color: "rgba(255,255,255,0.60)", fontWeight: 600 }}>{contract.checkpoints.current}</span>
                  </div>
                  <ProgressBar
                    completed={contract.checkpoints.completed}
                    total={contract.checkpoints.total}
                  />
                </div>

                {/* Right: amount + caret */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <div style={{ fontSize: "18px", fontWeight: 900, letterSpacing: "-0.03em", background: "linear-gradient(135deg, #E8C470, #C9A84C)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {contract.totalAmount}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.30)" }}>
                    Fairness: {contract.fairnessScore}/10
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.35 }}>
                    <path d="M4 8H12M12 8L8 4M12 8L8 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div style={{
              ...glass, padding: "64px 48px",
              textAlign: "center",
            }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", opacity: 0.20 }}>
                <IconDocument size={52} color="white" strokeWidth={1.4} />
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "rgba(255,255,255,0.40)", marginBottom: "8px" }}>
                No {filter.toLowerCase()} contracts
              </div>
              <div style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.25)", marginBottom: "24px" }}>
                Create your first contract to get started
              </div>
              <Link href="/create" style={{
                background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)",
                fontSize: "14px", fontWeight: 600, padding: "12px 26px", borderRadius: "7px",
                border: "1px solid rgba(255,255,255,0.14)", textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: "8px",
                transition: "background 0.2s, border-color 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.13)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.22)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.14)";
                }}
              >
                Create Contract
              </Link>
            </div>
          )}
        </div>

      </div>
      <Footer />
    </main>
  );
}
