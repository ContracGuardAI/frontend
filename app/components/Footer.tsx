"use client";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      padding: "22px 0", background: "#050505",
      borderTop: "1px solid rgba(201,168,76,0.14)",
      position: "relative",
    }}>
      {/* subtle gold top glow line */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "40%", height: "1px", pointerEvents: "none",
        background: "linear-gradient(to right, transparent, rgba(201,168,76,0.35), transparent)",
      }} />

      <div style={{
        maxWidth: "1160px", margin: "0 auto", padding: "0 80px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        {/* Logo — same style as Navbar */}
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: "11px",
          textDecoration: "none", transition: "opacity 0.2s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.75"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
        >
          <Image
            src="/contract-guard.png"
            alt="ContractGuard AI"
            width={300}
            height={300}
            style={{ width: "46px", height: "46px", borderRadius: "9px", objectFit: "contain", display: "block", transform: "scale(1.9) translateX(6px)", transformOrigin: "center" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{
              fontWeight: 800, fontSize: "14px",
              letterSpacing: "-0.03em", color: "rgba(255,255,255,0.70)",
              lineHeight: 1.1,
            }}>ContractGuard</span>
            <span style={{
              fontSize: "9px", letterSpacing: "2.2px",
              color: "rgba(201,168,76,0.55)", fontWeight: 600,
              textTransform: "uppercase" as const, lineHeight: 1,
            }}>AI · Secured</span>
          </div>
        </Link>

        {/* Nav links — gold hover */}
        <div style={{ display: "flex", gap: "30px" }}>
          {[
            { label: "GitHub", href: "#" },
            { label: "Docs",   href: "#" },
          ].map(({ label, href }) => (
            <Link key={label} href={href} style={{
              fontSize: "13px", color: "rgba(255,255,255,0.35)",
              textDecoration: "none",
              transition: "color 0.2s, text-shadow 0.2s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C";
                (e.currentTarget as HTMLAnchorElement).style.textShadow = "0 0 12px rgba(201,168,76,0.35)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.35)";
                (e.currentTarget as HTMLAnchorElement).style.textShadow = "none";
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div style={{
          fontSize: "11.5px", color: "rgba(255,255,255,0.22)",
          letterSpacing: "0.2px",
        }}>
          © 2025 ContractGuard AI ·{" "}
          <span style={{ color: "rgba(201,168,76,0.45)" }}>Built on Solana</span>
        </div>
      </div>
    </footer>
  );
}
