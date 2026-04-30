"use client";
import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "./WalletProvider";

function shortAddress(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export default function WalletButton() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (connected && publicKey) {
    return (
      <div ref={ref} style={{ position: "relative" }}>
        {/* Address pill */}
        <div
          onClick={() => setOpen(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            background: open ? "rgba(80,220,140,0.12)" : "rgba(80,220,140,0.08)",
            border: open ? "1px solid rgba(80,220,140,0.40)" : "1px solid rgba(80,220,140,0.25)",
            borderRadius: "6px", padding: "8px 14px",
            fontSize: "13px", color: "rgba(80,220,140,0.90)",
            fontWeight: 600, letterSpacing: "-0.01em",
            cursor: "pointer", userSelect: "none",
            transition: "background 0.18s, border-color 0.18s",
          }}
        >
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "rgba(80,220,140,0.90)",
            boxShadow: "0 0 6px rgba(80,220,140,0.60)",
            flexShrink: 0,
          }} />
          {shortAddress(publicKey.toBase58())}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{
            marginLeft: "2px", opacity: 0.55,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}>
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Dropdown popup */}
        {open && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            minWidth: "160px",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            boxShadow: "0 16px 40px rgba(0,0,0,0.40), 0 0 0 1px var(--border)",
            overflow: "hidden",
            zIndex: 100,
            animation: "slideDown 0.15s cubic-bezier(0.16,1,0.3,1)",
          }}>
            {/* Full address */}
            <div style={{
              padding: "12px 14px 10px",
              borderBottom: "1px solid var(--border-light)",
            }}>
              <div style={{ fontSize: "10px", letterSpacing: "1px", color: "var(--text-4)", marginBottom: "4px" }}>
                CONNECTED
              </div>
              <div style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-2)", wordBreak: "break-all" }}>
                {publicKey.toBase58().slice(0, 20)}...
              </div>
            </div>

            {/* Disconnect option */}
            <button
              onClick={() => { disconnect(); setOpen(false); }}
              style={{
                width: "100%", padding: "11px 14px",
                background: "transparent", border: "none",
                display: "flex", alignItems: "center", gap: "9px",
                cursor: "pointer", textAlign: "left",
                color: "rgba(255,100,100,0.80)",
                fontSize: "13px", fontWeight: 600,
                fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,80,80,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 7H13M10 4L13 7L10 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              Disconnect
            </button>
          </div>
        )}

        <style>{`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <button onClick={() => setVisible(true)} style={{
      background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)",
      fontWeight: 700, fontSize: "13.5px",
      padding: "9px 22px", borderRadius: "6px", border: "none", cursor: "pointer",
      display: "flex", alignItems: "center", gap: "8px", letterSpacing: "-0.01em",
      boxShadow: "0 0 0 1px var(--border), 0 3px 12px rgba(0,0,0,0.15)",
      transition: "transform 0.2s, box-shadow 0.2s, opacity 0.2s",
      fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 1px var(--border-strong), 0 6px 20px rgba(0,0,0,0.20)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 1px var(--border), 0 3px 12px rgba(0,0,0,0.15)";
      }}
      onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
      onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
    >
      Connect Wallet
      <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
        <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
