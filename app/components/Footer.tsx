"use client";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      padding: "48px 0", background: "#050505",
      borderTop: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{
        maxWidth: "1160px", margin: "0 auto", padding: "0 80px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Image
            src="/contract-guard.png"
            alt=""
            width={26}
            height={26}
            style={{ borderRadius: "6px", objectFit: "contain", opacity: 0.72, display: "block" }}
          />
          <span style={{
            fontSize: "14px", fontWeight: 700,
            color: "rgba(255,255,255,0.45)", letterSpacing: "-0.02em",
          }}>ContractGuard AI</span>
        </Link>

        <div style={{ display: "flex", gap: "28px" }}>
          {[
            { label: "Features", href: "/#features" },
            { label: "Pricing", href: "/pricing" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Audit", href: "/audit" },
            { label: "GitHub", href: "#" },
          ].map(({ label, href }) => (
            <Link key={label} href={href} style={{
              fontSize: "13px", color: "rgba(255,255,255,0.28)", textDecoration: "none",
              transition: "color 0.2s",
            }}>
              {label}
            </Link>
          ))}
        </div>

        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.20)" }}>
          © 2025 ContractGuard AI · Built on Solana
        </div>
      </div>
    </footer>
  );
}
