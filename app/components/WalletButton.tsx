"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "./WalletProvider";

function shortAddress(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export default function WalletButton() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Connected indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: "7px",
          background: "rgba(80,220,140,0.08)",
          border: "1px solid rgba(80,220,140,0.25)",
          borderRadius: "6px", padding: "8px 14px",
          fontSize: "13px", color: "rgba(80,220,140,0.90)",
          fontWeight: 600, letterSpacing: "-0.01em",
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "rgba(80,220,140,0.90)",
            boxShadow: "0 0 6px rgba(80,220,140,0.60)",
            flexShrink: 0,
          }} />
          {shortAddress(publicKey.toBase58())}
        </div>
        {/* Disconnect */}
        <button onClick={() => disconnect()} style={{
          background: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.45)",
          fontSize: "12px", fontWeight: 600,
          padding: "8px 12px", borderRadius: "6px",
          border: "1px solid rgba(255,255,255,0.10)",
          cursor: "pointer",
          transition: "background 0.2s, color 0.2s",
          fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,80,80,0.10)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,100,100,0.80)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,80,80,0.20)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.10)";
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setVisible(true)} style={{
      background: "white", color: "#080808", fontWeight: 700, fontSize: "13.5px",
      padding: "9px 22px", borderRadius: "6px", border: "none", cursor: "pointer",
      display: "flex", alignItems: "center", gap: "8px", letterSpacing: "-0.01em",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.15), 0 3px 12px rgba(255,255,255,0.10)",
      transition: "transform 0.2s, box-shadow 0.2s, opacity 0.2s",
      fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 1px rgba(255,255,255,0.22), 0 6px 20px rgba(255,255,255,0.18)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 1px rgba(255,255,255,0.15), 0 3px 12px rgba(255,255,255,0.10)";
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
