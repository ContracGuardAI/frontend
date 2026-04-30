"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { IconDollar, IconAlertTriangle, IconFileText, IconShield } from "../components/Icons";
import { toast } from "../components/Toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "../components/WalletProvider";
import type { ContractReviewResult } from "../../../contractguard-agent/contractAgent";
import { useLanguage } from "../components/LanguageProvider";

const glass = {
  background: "var(--surface)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid var(--border)",
  boxShadow: "var(--glass-shadow)",
  borderRadius: "16px",
} as const;

type FileState = "idle" | "dragging" | "uploading" | "analyzing" | "done" | "error";

type AuditChatMsg =
  | { role: "user"; kind: "file"; name: string }
  | { role: "ai"; kind: "text"; text: string; variant?: "normal" | "error" | "success" }
  | { role: "ai"; kind: "score"; result: ContractReviewResult }
  | { role: "ai"; kind: "risks"; result: ContractReviewResult }
  | { role: "ai"; kind: "cta"; analysisHash: string };

// GREETING is created inside component so it can be translated
const GREETING_ID = "Halo! Upload kontrak PDF kamu di panel kiri dan saya akan mengaudit setiap klausanya secara mendetail.";
const GREETING_EN = "Hello! Upload a contract PDF on the left panel and I'll audit every clause in detail.";

function toRisk(val: string): "high" | "medium" | "low" {
  if (val === "high" || val === "overpriced") return "high";
  if (val === "medium" || val === "underpriced") return "medium";
  return "low";
}

function formatIDR(num: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
}

function RiskBadge({ risk }: { risk: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    high:   { bg: "rgba(255,80,80,0.10)",  text: "rgba(255,120,120,1)", border: "rgba(255,80,80,0.22)" },
    medium: { bg: "rgba(255,190,0,0.10)",  text: "rgba(255,210,80,1)",  border: "rgba(255,190,0,0.22)" },
    low:    { bg: "rgba(80,220,140,0.10)", text: "rgba(80,220,140,1)",  border: "rgba(80,220,140,0.22)" },
  };
  const c = colors[risk] ?? colors.medium;
  return (
    <span style={{
      fontSize: "10px", letterSpacing: "1.2px", fontWeight: 600,
      padding: "3px 9px", borderRadius: "999px",
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      flexShrink: 0,
    }}>
      {risk.toUpperCase()}
    </span>
  );
}

function AiAvatar() {
  return (
    <div style={{
      width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0, marginTop: "1px",
      background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.2" stroke="var(--accent-text)" strokeWidth="1.3" />
        <circle cx="7" cy="7" r="2.1" fill="var(--accent-text)" />
      </svg>
    </div>
  );
}

function ChatTypingBubble() {
  return (
    <div style={{ display: "flex", gap: "9px", alignItems: "flex-start", marginBottom: "12px", animation: "chatMsgIn 0.2s ease both" }}>
      <AiAvatar />
      <div style={{
        background: "var(--surface-2)", border: "1px solid var(--border-light)",
        borderRadius: "4px 12px 12px 12px", padding: "11px 14px",
        display: "flex", gap: "4px", alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "var(--text-4)", display: "inline-block",
            animation: `chatTypingDot 1.2s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

function AuditChatMessage({ msg, isNew }: { msg: AuditChatMsg; isNew: boolean }) {
  const { lang } = useLanguage();
  const anim: React.CSSProperties = isNew ? { animation: "chatMsgIn 0.28s ease both" } : {};

  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px", ...anim }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
          borderRadius: "12px 12px 4px 12px", padding: "10px 14px", maxWidth: "80%",
        }}>
          <div style={{
            width: "30px", height: "36px", borderRadius: "5px", flexShrink: 0,
            background: "var(--accent-bg-hover)", border: "1px solid var(--accent-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
              <path d="M2 1h7l4 4v10H2z" stroke="var(--accent-text)" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
              <path d="M9 1v4h4" stroke="var(--accent-text)" strokeWidth="1.3" fill="none" />
              <line x1="4" y1="8"  x2="10" y2="8"  stroke="var(--accent-text)" strokeWidth="1.1" strokeOpacity="0.7" />
              <line x1="4" y1="11" x2="10" y2="11" stroke="var(--accent-text)" strokeWidth="1.1" strokeOpacity="0.5" />
            </svg>
          </div>
          <div>
            <div style={{
              fontSize: "12.5px", fontWeight: 600, color: "var(--accent-text)",
              lineHeight: 1.3, maxWidth: "180px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{msg.name}</div>
            <div style={{ fontSize: "10.5px", color: "var(--text-4)", marginTop: "2px" }}>{lang === "en" ? "PDF · Sending for audit" : "PDF · Dikirim untuk diaudit"}</div>
          </div>
        </div>
      </div>
    );
  }

  if (msg.kind === "text") {
    const isError   = msg.variant === "error";
    const isSuccess = msg.variant === "success";
    return (
      <div style={{ display: "flex", gap: "9px", alignItems: "flex-start", marginBottom: "12px", ...anim }}>
        <AiAvatar />
        <div style={{
          background: isSuccess ? "rgba(80,220,140,0.08)" : isError ? "rgba(255,80,80,0.08)" : "var(--surface-2)",
          border: `1px solid ${isSuccess ? "rgba(80,220,140,0.22)" : isError ? "rgba(255,80,80,0.22)" : "var(--border-light)"}`,
          borderRadius: "4px 12px 12px 12px", padding: "10px 14px",
          maxWidth: "86%", fontSize: "13px", lineHeight: 1.68,
          color: isSuccess ? "rgba(80,220,140,0.92)" : isError ? "rgba(255,100,100,0.90)" : "var(--text-2)",
          whiteSpace: "pre-line",
        }}>
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.kind === "score") {
    const r = msg.result;
    const score = r.fairness_score;
    const color = score >= 7 ? "rgba(80,220,140,0.9)" : score >= 5 ? "rgba(255,210,80,0.9)" : "rgba(255,100,100,0.9)";
    const overpricedCount = r.price_analysis.filter(p => p.status === "overpriced").length;
    const highRiskCount   = r.risky_clauses.filter(c => c.risk_level === "high").length;
    return (
      <div style={{ display: "flex", gap: "9px", alignItems: "flex-start", marginBottom: "12px", ...anim }}>
        <AiAvatar />
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "4px 12px 12px 12px", padding: "16px 18px",
          maxWidth: "92%", width: "100%",
        }}>
          <div style={{ fontSize: "10.5px", letterSpacing: "1.3px", color: "var(--accent-text-dim)", marginBottom: "12px" }}>
            {lang === "en" ? "AUDIT COMPLETE" : "AUDIT SELESAI"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "12px" }}>
            <div style={{
              fontSize: "52px", fontWeight: 900, color, letterSpacing: "-0.04em", lineHeight: 1,
              filter: `drop-shadow(0 0 12px ${color.replace("0.9", "0.22")})`,
            }}>
              {score}
              <span style={{ fontSize: "20px", color: "var(--text-4)", fontWeight: 500 }}>/10</span>
            </div>
            <div>
              <div style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
                {lang === "en" ? "Fairness Score" : "Skor Keadilan"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: 1.55 }}>
                {overpricedCount} {lang === "en" ? "overpriced items" : "item mahal"}<br />{highRiskCount} {lang === "en" ? "high-risk clauses" : "klausul risiko tinggi"}
              </div>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.68, margin: 0 }}>
            {r.overall_summary}
          </p>
        </div>
      </div>
    );
  }

  if (msg.kind === "risks") {
    const r = msg.result;
    const highRisks  = r.risky_clauses.filter(c => c.risk_level === "high").slice(0, 3);
    const overpriced = r.price_analysis.filter(p => p.status === "overpriced").slice(0, 3);
    return (
      <div style={{ display: "flex", gap: "9px", alignItems: "flex-start", marginBottom: "12px", ...anim }}>
        <AiAvatar />
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "4px 12px 12px 12px", padding: "16px 18px",
          maxWidth: "92%", width: "100%",
        }}>
          {highRisks.length > 0 && (
            <div style={{ marginBottom: overpriced.length > 0 ? "16px" : 0 }}>
              <div style={{ fontSize: "10.5px", letterSpacing: "1.3px", color: "rgba(255,100,100,0.65)", marginBottom: "10px" }}>
                {lang === "en" ? "HIGH-RISK CLAUSES" : "KLAUSUL RISIKO TINGGI"}
              </div>
              {highRisks.map((c, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  padding: "9px 0",
                  borderBottom: i < highRisks.length - 1 ? "1px solid var(--border-light)" : "none",
                  gap: "10px",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>{c.clause}</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-3)", lineHeight: 1.5 }}>{c.issue}</div>
                  </div>
                  <RiskBadge risk={c.risk_level} />
                </div>
              ))}
            </div>
          )}
          {overpriced.length > 0 && (
            <div>
              <div style={{ fontSize: "10.5px", letterSpacing: "1.3px", color: "rgba(255,185,50,0.65)", marginBottom: "10px" }}>
                {lang === "en" ? "OVERPRICED ITEMS" : "ITEM TERLALU MAHAL"}
              </div>
              {overpriced.map((p, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "9px 0",
                  borderBottom: i < overpriced.length - 1 ? "1px solid var(--border-light)" : "none",
                  gap: "10px",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)" }}>{p.item}</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-3)" }}>
                      {formatIDR(p.contract_price)} → {p.market_estimate}
                    </div>
                  </div>
                  <RiskBadge risk={toRisk(p.status)} />
                </div>
              ))}
            </div>
          )}
          {highRisks.length === 0 && overpriced.length === 0 && (
            <div style={{ fontSize: "13px", color: "rgba(80,220,140,0.85)" }}>
              {lang === "en" ? "✓ No high-risk clauses or overpriced items found." : "✓ Tidak ada klausul berisiko tinggi atau item yang terlalu mahal ditemukan."}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (msg.kind === "cta") {
    return (
      <div style={{ display: "flex", gap: "9px", alignItems: "flex-start", marginBottom: "12px", ...anim }}>
        <AiAvatar />
        <div style={{
          background: "rgba(80,220,140,0.06)", border: "1px solid rgba(80,220,140,0.20)",
          borderRadius: "4px 12px 12px 12px", padding: "14px 16px", maxWidth: "88%",
        }}>
          <div style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.68, marginBottom: "14px" }}>
            {lang === "en" ? "Audit complete! Want to lock this contract on-chain with Solana smart escrow?" : "Audit selesai! Mau mengunci kontrak ini on-chain dengan Solana smart escrow?"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" as const }}>
            <a href="/create" style={{
              background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)",
              fontWeight: 700, fontSize: "12.5px", padding: "8px 18px", borderRadius: "6px",
              textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "7px",
              transition: "opacity 0.2s, transform 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
            >
              {lang === "en" ? "Create Contract" : "Buat Kontrak"}
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <span style={{ fontSize: "10.5px", color: "var(--text-4)", fontFamily: "monospace" }}>
              hash: {msg.analysisHash.slice(0, 14)}...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function AuditPage() {
  const { lang, t } = useLanguage();
  const greeting: AuditChatMsg = {
    role: "ai", kind: "text",
    text: lang === "en" ? GREETING_EN : GREETING_ID,
  };

  const [fileState, setFileState] = useState<FileState>("idle");
  const [fileName, setFileName]   = useState("");
  const [fileHash, setFileHash]   = useState("");
  const [chatMsgs, setChatMsgs]   = useState<AuditChatMsg[]>([]);
  const [chatTyping, setChatTyping] = useState(false);

  // Re-init greeting when language changes
  useEffect(() => {
    setChatMsgs(prev => {
      if (prev.length === 0 || (prev.length === 1 && prev[0].kind === "text" && (prev[0].text === GREETING_ID || prev[0].text === GREETING_EN))) {
        return [{ role: "ai", kind: "text", text: lang === "en" ? GREETING_EN : GREETING_ID }];
      }
      return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const chatRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  const addMsg = (msg: AuditChatMsg) =>
    setChatMsgs(prev => [...prev, msg]);

  // Scroll within chat container only
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMsgs, chatTyping]);

  const isLoading = fileState === "uploading" || fileState === "analyzing";

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Invalid file", "Only PDF files are accepted.");
      return;
    }

    setFileName(file.name);
    setChatMsgs([greeting]);
    setTimeout(() => addMsg({ role: "user", kind: "file", name: file.name }), 0);

    // ── Step 1: Upload PDF ────────────────────────────────────
    setFileState("uploading");
    setChatTyping(true);
    toast.info("Uploading contract...", "Extracting text from PDF");

    const formData = new FormData();
    formData.append("file", file);

    let contractText = "";
    let fHash = "";
    let charCount = 0;

    try {
      const uploadRes  = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) throw new Error(uploadJson.error);
      contractText = uploadJson.data.contract_text;
      fHash        = uploadJson.data.file_hash;
      charCount    = uploadJson.data.char_count;
      setFileHash(fHash);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setChatTyping(false);
      addMsg({ role: "ai", kind: "text", text: `Upload gagal: ${msg}\n\nCoba lagi dengan file PDF yang valid.`, variant: "error" });
      setFileState("error");
      toast.error("Upload failed", msg);
      return;
    }

    // ── Step 2: Stream audit via SSE ─────────────────────────
    setChatTyping(false);
    setFileState("analyzing");
    setChatTyping(true);
    toast.info("Analyzing contract...", "AI is reading every clause");

    try {
      const res = await fetch("/api/audit-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText, charCount }),
      });

      if (!res.ok || !res.body) throw new Error("Stream tidak tersedia.");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let event: { type: string; message?: string; data?: unknown; meta?: { analysis_hash: string } };
          try { event = JSON.parse(line.slice(6)); } catch { continue; }

          if (event.type === "progress" && event.message) {
            // Replace typing indicator with real agent progress message,
            // then re-show typing for next stage
            setChatTyping(false);
            addMsg({ role: "ai", kind: "text", text: event.message });
            setChatTyping(true);
          }

          if (event.type === "result" && event.data && event.meta) {
            setChatTyping(false);
            setFileState("done");
            toast.success("Review complete", file.name);

            const result = event.data as import("../../../contractguard-agent/contractAgent").ContractReviewResult;
            addMsg({ role: "ai", kind: "score", result });
            setTimeout(() => addMsg({ role: "ai", kind: "risks", result }), 500);
            setTimeout(() => addMsg({ role: "ai", kind: "cta", analysisHash: event.meta!.analysis_hash }), 1000);
          }

          if (event.type === "error" && event.message) {
            throw new Error(event.message);
          }
        }
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI analysis failed.";
      setChatTyping(false);
      addMsg({ role: "ai", kind: "text", text: `Analisis gagal: ${msg}`, variant: "error" });
      setFileState("error");
      toast.error("Analysis failed", msg);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFileState("idle");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const loadingLabel = fileState === "uploading"
    ? (lang === "en" ? "Extracting PDF text..." : "Mengekstrak teks PDF...")
    : (lang === "en" ? "AI is analyzing every clause..." : "AI sedang menganalisis setiap klausul...");

  const statusLabel  = isLoading
    ? (fileState === "uploading" ? "UPLOADING" : "ANALYZING")
    : fileState === "done" ? "DONE" : "READY";
  const statusColor  = isLoading ? "rgba(255,210,80,0.90)" : "rgba(80,220,140,0.90)";
  const statusBorder = isLoading ? "rgba(255,210,80,0.22)" : "rgba(80,220,140,0.22)";
  const statusBg     = isLoading ? "rgba(255,210,80,0.08)" : "rgba(80,220,140,0.08)";

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <Navbar />

      <div style={{
        position: "fixed", pointerEvents: "none", zIndex: 0,
        top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: "70%", height: "60%",
        background: "radial-gradient(ellipse, var(--orb) 0%, transparent 65%)",
        filter: "blur(70px)",
      }} />

      <div style={{
        maxWidth: "1200px", margin: "0 auto", padding: "120px 80px 80px",
        position: "relative", zIndex: 1,
      }}>

        {/* Page header */}
        <div style={{ marginBottom: "56px" }}>
          <div className="page-in p0" style={{
            display: "inline-flex", alignItems: "center",
            border: "1px solid var(--accent-border-strong)", borderRadius: "999px",
            padding: "4px 14px", fontSize: "11px",
            color: "var(--accent-text)", background: "var(--accent-bg)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            boxShadow: "inset 0 1px 0 var(--accent-glow), 0 0 14px var(--accent-glow)",
            marginBottom: "18px", letterSpacing: "1.5px",
          }}>
            {t("audit.badge")}
          </div>
          <h1 className="page-in p1" style={{
            fontSize: "clamp(36px,4vw,54px)", fontWeight: 900,
            letterSpacing: "-0.04em", color: "var(--text)", lineHeight: 1.0,
            marginBottom: "14px",
          }}>
            {lang === "en" ? <>Upload your contract.<br />Get the truth in seconds.</> : <>Upload kontrak kamu.<br />Dapatkan kebenarannya dalam hitungan detik.</>}
          </h1>
          <p className="page-in p2" style={{ fontSize: "15px", color: "var(--text-3)", maxWidth: "480px", lineHeight: 1.75 }}>
            {t("audit.subtitle")}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="page-in p3" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "24px" }}>

          {/* LEFT: Upload + what AI checks */}
          <div>
            <div
              onDragOver={e => { e.preventDefault(); if (!isLoading) setFileState("dragging"); }}
              onDragLeave={() => { if (!isLoading) setFileState("idle"); }}
              onDrop={e => { if (!isLoading) onDrop(e); }}
              onClick={() => { if (!isLoading) inputRef.current?.click(); }}
              style={{
                ...glass, padding: "48px 32px",
                cursor: isLoading ? "wait" : "pointer",
                textAlign: "center", marginBottom: "16px",
                border: fileState === "dragging"
                  ? "1px solid var(--border-strong)"
                  : fileState === "done"
                  ? "1px solid rgba(80,220,140,0.30)"
                  : fileState === "error"
                  ? "1px solid rgba(255,80,80,0.30)"
                  : "1px dashed var(--border)",
                transition: "border 0.2s, background 0.2s",
              }}
            >
              <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }}
                onChange={e => e.target.files && handleFile(e.target.files[0])} />

              {isLoading && (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none"
                      style={{ animation: "spinRing 1.2s linear infinite" }}>
                      <circle cx="22" cy="22" r="18" stroke="var(--border)" strokeWidth="3" />
                      <path d="M22 4 A18 18 0 0 1 40 22" stroke="var(--text)" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>
                    {fileState === "uploading" ? t("audit.uploading") : t("audit.analyzing")}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-3)" }}>{loadingLabel}</div>
                </>
              )}

              {fileState === "done" && (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                      <circle cx="22" cy="22" r="20" fill="rgba(80,220,140,0.10)" stroke="rgba(80,220,140,0.40)" strokeWidth="1.5" />
                      <path d="M13 22 L19 28 L31 16" stroke="rgba(80,220,140,0.90)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "rgba(80,220,140,0.90)", marginBottom: "6px" }}>
                    Review complete
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "12px" }}>{fileName}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-4)", wordBreak: "break-all", padding: "0 8px" }}>
                    hash: {fileHash.slice(0, 16)}...
                  </div>
                  <div style={{ marginTop: "16px" }}>
                    <button onClick={e => {
                      e.stopPropagation();
                      setFileState("idle");
                      setChatMsgs([greeting]);
                      setChatTyping(false);
                    }} style={{
                      fontSize: "12px", color: "var(--text-3)",
                      background: "var(--surface-2)", border: "1px solid var(--border)",
                      borderRadius: "6px", padding: "6px 14px", cursor: "pointer",
                      fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                    }}>
                      {t("audit.changeFile")}
                    </button>
                  </div>
                </>
              )}

              {fileState === "error" && (
                <>
                  <div style={{ marginBottom: "16px", color: "rgba(255,100,100,0.80)", fontSize: "14px", fontWeight: 600 }}>
                    Analysis failed
                  </div>
                  <button onClick={e => { e.stopPropagation(); setFileState("idle"); }} style={{
                    fontSize: "12px", color: "var(--text-2)",
                    background: "var(--surface-2)", border: "1px solid var(--border)",
                    borderRadius: "6px", padding: "6px 14px", cursor: "pointer",
                    fontFamily: "var(--font-dm), 'DM Sans', sans-serif",
                  }}>
                    Try again
                  </button>
                </>
              )}

              {(fileState === "idle" || fileState === "dragging") && (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                      <rect x="8" y="6" width="28" height="36" rx="4" fill="none" stroke="var(--border-strong)" strokeWidth="1.8" />
                      <line x1="14" y1="16" x2="30" y2="16" stroke="var(--border)" strokeWidth="1.4" />
                      <line x1="14" y1="22" x2="30" y2="22" stroke="var(--border)" strokeWidth="1.4" />
                      <line x1="14" y1="28" x2="22" y2="28" stroke="var(--border)" strokeWidth="1.4" />
                      <circle cx="33" cy="34" r="7" fill="var(--bg)" stroke="var(--border-strong)" strokeWidth="1.5" />
                      <line x1="33" y1="31" x2="33" y2="37" stroke="var(--text-2)" strokeWidth="1.8" strokeLinecap="round" />
                      <line x1="30" y1="34" x2="36" y2="34" stroke="var(--text-2)" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>
                    {lang === "en" ? "Drop your contract PDF here" : "Taruh PDF kontrak kamu di sini"}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-3)", marginBottom: "20px" }}>
                    {lang === "en" ? "or click to browse" : "atau klik untuk memilih file"}
                  </div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    fontSize: "11.5px", color: "var(--text-4)",
                    border: "1px solid var(--border-light)", borderRadius: "999px",
                    padding: "4px 12px",
                  }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5" stroke="var(--text-3)" strokeWidth="1.2" />
                      <line x1="6" y1="5" x2="6" y2="9" stroke="var(--text-3)" strokeWidth="1.2" strokeLinecap="round" />
                      <circle cx="6" cy="3.5" r="0.6" fill="var(--text-3)" />
                    </svg>
                    {lang === "en" ? "PDF only · Max 10MB" : "Hanya PDF · Maks 10MB"}
                  </div>
                </>
              )}
            </div>

            {/* What AI checks */}
            <div style={{ ...glass, padding: "24px 28px" }}>
              <div style={{ fontSize: "12px", letterSpacing: "1.5px", color: "var(--accent-text-dim)", marginBottom: "16px" }}>
                {lang === "en" ? "WHAT AI CHECKS" : "APA YANG AI PERIKSA"}
              </div>
              {[
                { Icon: IconDollar,        label: lang === "en" ? "Price markup detection vs. market rates" : "Deteksi markup harga vs. harga pasar" },
                { Icon: IconAlertTriangle, label: lang === "en" ? "One-sided clauses & risky terms" : "Klausul sepihak & syarat berisiko" },
                { Icon: IconFileText,      label: lang === "en" ? "Scope ambiguity & missing deliverables" : "Ambiguitas lingkup & deliverables yang hilang" },
                { Icon: IconShield,        label: lang === "en" ? "Escrow & payment security gaps" : "Celah keamanan escrow & pembayaran" },
              ].map(({ Icon, label }, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 8px",
                  borderBottom: i < 3 ? "1px solid var(--border-light)" : "none",
                  borderRadius: "8px", cursor: "default",
                  transition: "transform 0.2s ease, background 0.2s ease",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateX(4px)";
                    (e.currentTarget as HTMLDivElement).style.background = "var(--surface-2)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)";
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                    background: "var(--surface-2)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={15} color="var(--text-2)" strokeWidth={1.7} />
                  </div>
                  <span style={{ fontSize: "13.5px", color: "var(--text-2)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Chat window */}
          <div style={{
            ...glass, borderRadius: "20px", overflow: "hidden",
            display: "flex", flexDirection: "column",
            minHeight: "640px",
          }}>
            {/* Header */}
            <div style={{
              padding: "13px 16px", borderBottom: "1px solid var(--border-light)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "var(--surface-2)", flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "8px",
                  background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.2" stroke="var(--accent-text)" strokeWidth="1.3" />
                    <circle cx="7" cy="7" r="2.1" fill="var(--accent-text)" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
                    {t("demo.agentName")}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-4)", marginTop: "1px" }}>
                    {t("demo.agentSub")}
                  </div>
                </div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "3px 10px", borderRadius: "999px",
                background: statusBg, border: `1px solid ${statusBorder}`,
                transition: "all 0.3s",
              }}>
                <span style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: statusColor, display: "inline-block",
                  animation: isLoading ? "spinRing 1.5s linear infinite" : "pulseGlow 2s ease-in-out infinite",
                }} />
                <span style={{ fontSize: "10px", fontWeight: 700, color: statusColor, letterSpacing: "0.8px" }}>
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px" }}>
              {chatMsgs.map((msg, i) => (
                <AuditChatMessage key={i} msg={msg} isNew={i === chatMsgs.length - 1} />
              ))}
              {chatTyping && <ChatTypingBubble />}
              <div style={{ height: "4px" }} />
            </div>

            {/* Bottom bar — status only, no input */}
            <div style={{
              padding: "11px 14px", borderTop: "1px solid var(--border-light)",
              background: "var(--surface-2)", flexShrink: 0,
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <div style={{
                flex: 1, padding: "9px 13px", borderRadius: "10px",
                background: "var(--input-bg)", border: "1px solid var(--border-light)",
                fontSize: "13px", color: "var(--text-5)", userSelect: "none",
              }}>
                {fileState === "idle"      && (lang === "en" ? "Upload a contract PDF to begin..." : "Upload PDF kontrak untuk memulai...")}
                {fileState === "dragging"  && (lang === "en" ? "Drop it!" : "Lepaskan di sini!")}
                {fileState === "uploading" && (lang === "en" ? "Extracting PDF text..." : "Mengekstrak teks PDF...")}
                {fileState === "analyzing" && (lang === "en" ? "AI is analyzing every clause..." : "AI sedang menganalisis setiap klausul...")}
                {fileState === "done"      && (lang === "en" ? "Audit complete — upload another to compare" : "Audit selesai — upload lagi untuk membandingkan")}
                {fileState === "error"     && (lang === "en" ? "Something went wrong — try again" : "Terjadi kesalahan — coba lagi")}
              </div>
              <div style={{
                width: "34px", height: "34px", borderRadius: "8px", flexShrink: 0,
                background: "var(--surface)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0.35, cursor: "not-allowed",
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="var(--text-3)"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
