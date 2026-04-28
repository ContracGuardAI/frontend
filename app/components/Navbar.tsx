"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      height: scrolled ? "56px" : "62px",
      backdropFilter: scrolled ? "blur(32px)" : "blur(24px)",
      WebkitBackdropFilter: scrolled ? "blur(32px)" : "blur(24px)",
      background: scrolled ? "rgba(8,8,8,0.92)" : "rgba(8,8,8,0.80)",
      borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)"}`,
      boxShadow: scrolled
        ? "0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.70)"
        : "0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.55)",
      transition: "height 0.3s ease, background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
    }}>
      <div style={{
        maxWidth: "1400px", margin: "0 auto", padding: "0 48px",
        height: "100%", display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "11px", textDecoration: "none" }}>
          <Image
            src="/contract-guard.png"
            alt="ContractGuard AI"
            width={300}
            height={300}
            style={{ width: "54px", height: "54px", borderRadius: "9px", objectFit: "contain", display: "block", transform: "scale(1.9) translateX(6px)", transformOrigin: "center" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{
              fontWeight: 800, fontSize: "14.5px",
              letterSpacing: "-0.03em", color: "white",
              lineHeight: 1.1,
            }}>
              ContractGuard
            </span>
            <span style={{
              fontSize: "9px", letterSpacing: "2.2px",
              color: "rgba(201,168,76,0.60)", fontWeight: 600,
              textTransform: "uppercase" as const,
              lineHeight: 1,
            }}>
              AI · Secured
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "36px" }}>
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = href === pathname || (href !== "/" && pathname.startsWith(href.split("#")[0]) && href.split("#")[0] !== "/");
            return (
              <Link key={label} href={href} style={{
                color: isActive ? "#C9A84C" : "rgba(255,255,255,0.46)",
                fontSize: "14px", textDecoration: "none",
                transition: "color 0.2s ease, text-shadow 0.2s ease",
                fontWeight: isActive ? 700 : 400,
                position: "relative",
                textShadow: isActive ? "0 0 18px rgba(201,168,76,0.45)" : "none",
              }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(201,168,76,0.80)";
                    (e.currentTarget as HTMLAnchorElement).style.textShadow = "0 0 14px rgba(201,168,76,0.30)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.46)";
                    (e.currentTarget as HTMLAnchorElement).style.textShadow = "none";
                  }
                }}
              >
                {label}
                {isActive && (
                  <span style={{
                    position: "absolute", bottom: "-4px", left: 0, right: 0,
                    height: "1.5px",
                    background: "linear-gradient(to right, transparent, #C9A84C 30%, #E8C470 50%, #C9A84C 70%, transparent)",
                    borderRadius: "999px",
                    boxShadow: "0 0 8px rgba(201,168,76,0.50)",
                  }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link href="/audit" style={{
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.75)",
            fontWeight: 600, fontSize: "13.5px",
            padding: "9px 20px", borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.12)",
            cursor: "pointer", textDecoration: "none",
            backdropFilter: "blur(8px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
            transition: "background 0.2s, border-color 0.2s",
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.10)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.20)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.12)";
            }}
          >
            Audit Contract
          </Link>
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
