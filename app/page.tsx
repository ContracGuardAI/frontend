"use client";
import Image from "next/image";

/* ══════════════════════════════════════════════════════
   ICONS — used in step cards & feature cards
══════════════════════════════════════════════════════ */
function StepIcon({ type }: { type: "review"|"monitor"|"record" }) {
  const c = "rgba(255,255,255,0.85)";
  if (type === "review") return (
    <g>
      <rect x={-8} y={-12} width={16} height={22} rx={3} fill="none" stroke={c} strokeWidth={1.7}/>
      <line x1={-5} y1={-5} x2={5}  y2={-5} stroke={c} strokeWidth={1.3} strokeOpacity={.78}/>
      <line x1={-5} y1={ 0} x2={5}  y2={ 0} stroke={c} strokeWidth={1.3} strokeOpacity={.78}/>
      <line x1={-5} y1={ 5} x2={1}  y2={ 5} stroke={c} strokeWidth={1.3} strokeOpacity={.50}/>
    </g>
  );
  if (type === "monitor") return (
    <g>
      <path d="M-11,0 C-6,-8 6,-8 11,0 C6,8 -6,8 -11,0 Z"
        fill="none" stroke={c} strokeWidth={1.7}/>
      <circle cx={0} cy={0} r={3.5} fill="none" stroke={c} strokeWidth={1.4}/>
      <circle cx={0} cy={0} r={1.4} fill={c}/>
    </g>
  );
  return (
    <g>
      <rect x={-11} y={-5} width={11} height={10} rx={5} fill="none" stroke={c} strokeWidth={1.7}/>
      <rect x={ 0}  y={-5} width={11} height={10} rx={5} fill="none" stroke={c} strokeWidth={1.7}/>
    </g>
  );
}

function FeatureIcon({ type }: { type: string }) {
  const c = "rgba(255,255,255,0.85)";
  switch (type) {
    case "audit": return (
      <g>
        <path d="M0,-12 L10,-7 L10,3 L0,12 L-10,3 L-10,-7 Z"
          fill="none" stroke={c} strokeWidth={1.7}/>
        <path d="M-4,0.5 L-1,4 L5,-3.5" stroke={c} strokeWidth={1.9}
          strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </g>
    );
    case "escrow": return (
      <g>
        <rect x={-9} y={-3} width={18} height={14} rx={3} fill="none" stroke={c} strokeWidth={1.7}/>
        <path d="M-9,-3 L0,-12 L9,-3" fill="none" stroke={c} strokeWidth={1.7}/>
        <circle cx={0} cy={4} r={2.5} fill="none" stroke={c} strokeWidth={1.4}/>
        <line x1={0} y1={6.5} x2={0} y2={9} stroke={c} strokeWidth={1.4}/>
      </g>
    );
    case "check": return (
      <g>
        <circle cx={0} cy={-6} r={4.5} fill="none" stroke={c} strokeWidth={1.6}/>
        <line x1={0} y1={-1.5} x2={0} y2={12} stroke={c} strokeWidth={1.4}/>
        <line x1={-8} y1={2}   x2={-2} y2={2}  stroke={c} strokeWidth={1.3} strokeOpacity={.65}/>
        <line x1={-8} y1={7}   x2={-2} y2={7}  stroke={c} strokeWidth={1.3} strokeOpacity={.45}/>
        <path d="M2.5,0.5 L4.5,2.5 L8,-1.5" stroke={c} strokeWidth={1.5}
          strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </g>
    );
    case "chain": return (
      <g>
        <rect x={-11} y={-5} width={11} height={10} rx={5} fill="none" stroke={c} strokeWidth={1.7}/>
        <rect x={  0} y={-5} width={11} height={10} rx={5} fill="none" stroke={c} strokeWidth={1.7}/>
        <line x1={-8} y1={7} x2={-4} y2={11} stroke={c} strokeWidth={1.3} strokeOpacity={.6}/>
        <line x1={ 4} y1={7} x2={ 8} y2={11} stroke={c} strokeWidth={1.3} strokeOpacity={.6}/>
      </g>
    );
    default: return null;
  }
}


/* ══════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════ */
function Navbar() {
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:50,
      height:"62px",
      borderBottom:"1px solid rgba(255,255,255,0.07)",
      backdropFilter:"blur(18px)",
      background:"rgba(7,7,7,0.90)",
    }}>
      <div style={{
        maxWidth:"1400px", margin:"0 auto", padding:"0 48px",
        height:"100%", display:"flex", alignItems:"center",
        justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"11px" }}>
          <Image src="/logo.png" alt="ContractGuard AI" width={34} height={34}
            style={{ borderRadius:"9px", objectFit:"contain" }}/>
          <span style={{ fontWeight:700, fontSize:"15.5px", letterSpacing:"-0.025em", color:"white" }}>
            ContractGuard
            <span style={{ color:"rgba(255,255,255,0.38)", fontWeight:400 }}> AI</span>
          </span>
          <span style={{ width:"4px", height:"4px", borderRadius:"50%",
            background:"rgba(255,255,255,0.22)", marginLeft:"4px", display:"inline-block" }}/>
        </div>

        <div style={{ display:"flex", gap:"42px" }}>
          {["Products","Features","Integrations","Pricing"].map(l => (
            <a key={l} href="#" style={{
              color:"rgba(255,255,255,0.52)", fontSize:"14px", textDecoration:"none",
            }}>{l}</a>
          ))}
        </div>

        <button style={{
          background:"white", color:"#080808", fontWeight:700, fontSize:"14px",
          padding:"10px 24px", borderRadius:"6px", border:"none", cursor:"pointer",
          display:"flex", alignItems:"center", gap:"9px", letterSpacing:"-0.01em",
        }}>
          Connect Wallet
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor"
              strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section style={{
      display:"flex", minHeight:"100vh", paddingTop:"62px",
      overflow:"hidden", alignItems:"stretch",
    }}>
      {/* ── LEFT TEXT ── */}
      <div style={{
        flex:"0 0 46%", minWidth:0,
        display:"flex", alignItems:"center",
        padding:"0 40px 0 180px",
      }}>
        <div style={{ paddingBottom:"80px", animation:"fadeSlideUp 0.8s ease both" }}>

          {/* badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            border:"1px solid rgba(255,255,255,0.13)", borderRadius:"999px",
            padding:"5px 16px 5px 8px", fontSize:"11.5px",
            color:"rgba(255,255,255,0.50)", background:"rgba(255,255,255,0.03)",
            marginBottom:"34px",
          }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%",
              background:"rgba(255,255,255,0.48)", flexShrink:0 }}/>
            2,847+ Contracts audited monthly with ContractGuard AI
          </div>

          {/* headline */}
          <h1 style={{
            fontSize:"clamp(62px,5.8vw,90px)", fontWeight:900,
            lineHeight:1.0, letterSpacing:"-0.04em", color:"white",
            marginBottom:"26px",
            animation:"fadeSlideUp 0.8s 0.08s ease both",
          }}>
            Contracts<br/>Secured.
          </h1>

          {/* subtitle */}
          <p style={{
            fontSize:"15.5px", lineHeight:1.78,
            color:"rgba(255,255,255,0.43)", maxWidth:"310px",
            marginBottom:"42px", animation:"fadeSlideUp 0.8s 0.16s ease both",
          }}>
            Audit Contracts, Verify Milestones, And Keep
            Payments On Track — Effortlessly.
          </p>

          {/* buttons */}
          <div style={{
            display:"flex", gap:"14px", marginBottom:"64px",
            animation:"fadeSlideUp 0.8s 0.24s ease both",
          }}>
            <button style={{
              background:"white", color:"#080808", fontWeight:700,
              fontSize:"14px", padding:"14px 32px", borderRadius:"6px",
              border:"none", cursor:"pointer", letterSpacing:"-0.01em",
            }}>
              Audit Contract
            </button>
            <button style={{
              background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.80)",
              fontWeight:600, fontSize:"14px", padding:"14px 28px",
              borderRadius:"6px", border:"1px solid rgba(255,255,255,0.14)",
              cursor:"pointer",
            }}>
              View Demo
            </button>
          </div>

          {/* trust */}
          <div style={{ animation:"fadeSlideUp 0.8s 0.32s ease both" }}>
            <p style={{
              fontSize:"13px", color:"rgba(255,255,255,0.28)",
              fontStyle:"italic", marginBottom:"18px",
            }}>
              Trusted by thousands of modern builders.
            </p>
            <div style={{ display:"flex", gap:"30px", alignItems:"center" }}>
              {["Superteam","Colosseum","Solana","Anthropic"].map(n => (
                <span key={n} style={{
                  fontSize:"13px", fontWeight:600,
                  color:"rgba(255,255,255,0.16)", letterSpacing:"-0.01em",
                }}>{n}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT — image + majestic effects ── */}
      <div style={{
        flex:1, position:"relative", overflow:"hidden", minWidth:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        animation:"fadeSlideUp 0.9s 0.12s ease both",
      }}>

        {/* 0. Isometric grid bg */}
        <div style={{
          position:"absolute", inset:0, zIndex:0,
          backgroundImage:`
            linear-gradient(rgba(255,255,255,0.020) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.020) 1px, transparent 1px)`,
          backgroundSize:"36px 36px",
          WebkitMaskImage:"radial-gradient(ellipse 78% 82% at 52% 50%, black 10%, transparent 85%)",
          maskImage:"radial-gradient(ellipse 78% 82% at 52% 50%, black 10%, transparent 85%)",
        }}/>

        {/* 1. Wide outer glow — big soft atmosphere */}
        <div style={{
          position:"absolute", zIndex:1, pointerEvents:"none",
          top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          width:"75%", height:"75%",
          background:"radial-gradient(circle, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 55%, transparent 100%)",
          filter:"blur(55px)", borderRadius:"50%",
          animation:"pulseGlow 6s ease-in-out infinite",
        }}/>

        {/* 1b. Inner concentrated glow — spotlight on image */}
        <div style={{
          position:"absolute", zIndex:2, pointerEvents:"none",
          top:"48%", left:"50%",
          transform:"translate(-50%,-50%)",
          width:"42%", height:"42%",
          background:"radial-gradient(circle, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
          filter:"blur(22px)", borderRadius:"50%",
          animation:"pulseGlow 4s ease-in-out infinite",
          animationDelay:"0.8s",
        }}/>

        {/* 2. Outer rotating dashed ring */}
        <div style={{
          position:"absolute", zIndex:3, pointerEvents:"none",
          top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          width:"90%", aspectRatio:"1",
        }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100"
            style={{ animation:"spinRing 42s linear infinite", display:"block" }}>
            <circle cx="50" cy="50" r="48" fill="none"
              stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" strokeDasharray="4 12"/>
          </svg>
        </div>

        {/* 3. Inner counter-rotating ring */}
        <div style={{
          position:"absolute", zIndex:3, pointerEvents:"none",
          top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          width:"73%", aspectRatio:"1",
        }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100"
            style={{ animation:"spinRingCCW 28s linear infinite", display:"block" }}>
            <circle cx="50" cy="50" r="48" fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="2 9"/>
          </svg>
        </div>

        {/* 4. The image — floating with drop-shadow glow */}
        <div style={{
          position:"relative", zIndex:4,
          width:"640px", height:"640px",
          maxWidth:"92%", flexShrink:0,
          animation:"floatNode 6s ease-in-out infinite",
          filter:"drop-shadow(0 0 28px rgba(255,255,255,0.16)) drop-shadow(0 0 68px rgba(255,255,255,0.07))",
        }}>
          <Image src="/contraguardv2.png" alt="ContractGuard AI" fill
            style={{ objectFit:"contain", objectPosition:"center" }} priority/>
        </div>

        {/* 5. Vignette — wider transparent zone for larger image */}
        <div style={{
          position:"absolute", inset:0, zIndex:5, pointerEvents:"none",
          background:"radial-gradient(ellipse 78% 84% at 52% 50%, transparent 52%, #080808 92%)",
        }}/>
        {/* 6. Left-edge hard fade */}
        <div style={{
          position:"absolute", top:0, left:0, bottom:0, width:"90px",
          background:"linear-gradient(to right, #080808 0%, transparent 100%)",
          zIndex:6, pointerEvents:"none",
        }}/>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      num:"01", type:"review" as const,
      when:"BEFORE THE DEAL",
      title:"AI Contract Review",
      desc:"Upload your contract PDF. AI reads every clause, detects price markups, identifies unfair terms, and outputs a fairness score — before you sign anything.",
    },
    {
      num:"02", type:"monitor" as const,
      when:"DURING THE PROJECT",
      title:"Checkpoint Monitoring",
      desc:"At each milestone, contractors upload proof of work. AI cross-references it with the contract spec and sends a full verification report instantly.",
    },
    {
      num:"03", type:"record" as const,
      when:"AFTER EACH STEP",
      title:"On-Chain Record",
      desc:"Every contract hash, AI report, and approval is permanently stored on Solana blockchain. Immutable — no one can edit or delete it, ever.",
    },
  ];

  return (
    <section style={{
      padding:"120px 0", background:"#080808",
      borderTop:"1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ maxWidth:"1160px", margin:"0 auto", padding:"0 80px" }}>

        {/* header */}
        <div style={{ textAlign:"center", marginBottom:"80px" }}>
          <div style={{
            display:"inline-flex", alignItems:"center",
            border:"1px solid rgba(255,255,255,0.10)", borderRadius:"999px",
            padding:"4px 14px", fontSize:"11px",
            color:"rgba(255,255,255,0.42)", background:"rgba(255,255,255,0.03)",
            marginBottom:"20px", fontFamily:"var(--font-dm),'DM Sans',sans-serif", letterSpacing:"1.5px",
          }}>
            HOW IT WORKS
          </div>
          <h2 style={{
            fontSize:"clamp(34px,3.8vw,52px)", fontWeight:900,
            letterSpacing:"-0.04em", color:"white", lineHeight:1.05,
            marginBottom:"16px",
          }}>
            Three phases.<br/>Zero surprises.
          </h2>
          <p style={{
            fontSize:"15px", color:"rgba(255,255,255,0.38)",
            maxWidth:"420px", margin:"0 auto", lineHeight:1.76,
          }}>
            From contract review to final payment — every step verified by AI
            and recorded on blockchain.
          </p>
        </div>

        {/* step cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"20px" }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              background:"rgba(255,255,255,0.022)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:"16px", padding:"36px 32px",
              position:"relative", overflow:"hidden",
            }}>
              {/* watermark number */}
              <div style={{
                position:"absolute", top:"-6px", right:"18px",
                fontSize:"82px", fontWeight:900,
                color:"rgba(255,255,255,0.028)", letterSpacing:"-0.06em",
                lineHeight:1, userSelect:"none", fontFamily:"system-ui,sans-serif",
                pointerEvents:"none",
              }}>{s.num}</div>

              {/* when label */}
              <div style={{
                fontSize:"10.5px", fontFamily:"var(--font-dm),'DM Sans',sans-serif",
                letterSpacing:"2px", color:"rgba(255,255,255,0.28)",
                marginBottom:"20px",
              }}>{s.when}</div>

              {/* icon box */}
              <div style={{
                width:"52px", height:"52px", borderRadius:"13px",
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.10)",
                display:"flex", alignItems:"center", justifyContent:"center",
                marginBottom:"22px",
              }}>
                <svg width="28" height="28" viewBox="-13 -13 26 26" fill="none">
                  <StepIcon type={s.type}/>
                </svg>
              </div>

              <h3 style={{
                fontSize:"18px", fontWeight:700, color:"white",
                marginBottom:"12px", letterSpacing:"-0.025em",
              }}>{s.title}</h3>

              <p style={{
                fontSize:"14px", lineHeight:1.78,
                color:"rgba(255,255,255,0.40)",
              }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   FEATURES
══════════════════════════════════════════════════════ */
function Features() {
  const items = [
    {
      type:"audit",   tag:"AI POWERED",
      title:"AI Contract Audit",
      desc:"Fairness score 1–10, line-by-line price analysis, risky clause detection, and specific revision suggestions — before you commit to anything.",
    },
    {
      type:"escrow",  tag:"SOLANA",
      title:"Smart Escrow Payments",
      desc:"Funds locked in a Solana smart contract. Released automatically when milestones are approved — no banks, no middlemen, no delays.",
    },
    {
      type:"check",   tag:"MONITORING",
      title:"Checkpoint Verification",
      desc:"At every milestone, contractors upload photo evidence. AI cross-references against the contract spec. Approve or request revision — on-chain.",
    },
    {
      type:"chain",   tag:"BLOCKCHAIN",
      title:"Tamper-Proof Records",
      desc:"Contract hash, AI reports, and every approval written to Solana. Permanent evidence that no one — not even us — can alter or delete.",
    },
  ];

  return (
    <section style={{
      padding:"120px 0",
      background:"linear-gradient(180deg, #080808 0%, #090c10 100%)",
    }}>
      <div style={{ maxWidth:"1160px", margin:"0 auto", padding:"0 80px" }}>

        {/* header */}
        <div style={{ marginBottom:"64px" }}>
          <div style={{
            display:"inline-flex", alignItems:"center",
            border:"1px solid rgba(255,255,255,0.10)", borderRadius:"999px",
            padding:"4px 14px", fontSize:"11px",
            color:"rgba(255,255,255,0.42)", background:"rgba(255,255,255,0.03)",
            marginBottom:"20px", fontFamily:"var(--font-dm),'DM Sans',sans-serif", letterSpacing:"1.5px",
          }}>
            FEATURES
          </div>
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"flex-end",
          }}>
            <h2 style={{
              fontSize:"clamp(32px,3.6vw,48px)", fontWeight:900,
              letterSpacing:"-0.04em", color:"white", lineHeight:1.05,
              maxWidth:"480px",
            }}>
              Everything you need<br/>to stay protected.
            </h2>
            <p style={{
              fontSize:"14px", color:"rgba(255,255,255,0.36)",
              maxWidth:"290px", lineHeight:1.76, textAlign:"right",
            }}>
              Built for builders, contractors, and anyone
              who&apos;s been burned by a bad contract.
            </p>
          </div>
        </div>

        {/* 2×2 grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
          {items.map((f, i) => (
            <div key={i} style={{
              background:"rgba(255,255,255,0.025)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:"16px", padding:"40px 36px",
            }}>
              <div style={{
                display:"flex", justifyContent:"space-between",
                alignItems:"flex-start", marginBottom:"28px",
              }}>
                {/* icon */}
                <div style={{
                  width:"52px", height:"52px", borderRadius:"13px",
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.10)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <svg width="28" height="28" viewBox="-13 -13 26 26" fill="none">
                    <FeatureIcon type={f.type}/>
                  </svg>
                </div>
                {/* tag pill */}
                <div style={{
                  fontSize:"9.5px", fontFamily:"var(--font-dm),'DM Sans',sans-serif",
                  letterSpacing:"1.8px", color:"rgba(255,255,255,0.28)",
                  border:"1px solid rgba(255,255,255,0.09)",
                  borderRadius:"999px", padding:"4px 10px",
                }}>{f.tag}</div>
              </div>

              <h3 style={{
                fontSize:"18px", fontWeight:700, color:"white",
                marginBottom:"12px", letterSpacing:"-0.025em",
              }}>{f.title}</h3>

              <p style={{
                fontSize:"14px", lineHeight:1.78,
                color:"rgba(255,255,255,0.40)",
              }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   STATS — Why Solana
══════════════════════════════════════════════════════ */
function Stats() {
  const stats = [
    { value:"< $0.01", label:"PER TRANSACTION",  sub:"Near-zero fees on Solana" },
    { value:"400ms",   label:"FINALITY SPEED",   sub:"Faster than any other chain" },
    { value:"100%",    label:"IMMUTABLE",         sub:"Records can never be altered" },
    { value:"Claude",  label:"POWERED BY AI",     sub:"Anthropic's most capable model" },
  ];

  return (
    <section style={{
      padding:"100px 0", background:"#080808",
      borderTop:"1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ maxWidth:"1160px", margin:"0 auto", padding:"0 80px" }}>

        <div style={{ textAlign:"center", marginBottom:"60px" }}>
          <h2 style={{
            fontSize:"clamp(30px,3.2vw,44px)", fontWeight:900,
            letterSpacing:"-0.04em", color:"white", marginBottom:"12px",
          }}>Trustless by design.</h2>
          <p style={{
            fontSize:"14px", color:"rgba(255,255,255,0.36)", lineHeight:1.75,
          }}>
            Built on Solana for speed, cost-efficiency, and absolute immutability.
          </p>
        </div>

        <div style={{
          display:"grid", gridTemplateColumns:"repeat(4,1fr)",
          border:"1px solid rgba(255,255,255,0.07)",
          borderRadius:"16px", overflow:"hidden",
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background:"#090909", padding:"44px 28px", textAlign:"center",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none",
            }}>
              <div style={{
                fontSize:"clamp(26px,2.8vw,38px)", fontWeight:900,
                letterSpacing:"-0.04em", color:"white", marginBottom:"8px",
              }}>{s.value}</div>
              <div style={{
                fontSize:"10.5px", fontFamily:"var(--font-dm),'DM Sans',sans-serif",
                letterSpacing:"1.6px", color:"rgba(255,255,255,0.48)",
                marginBottom:"6px",
              }}>{s.label}</div>
              <div style={{
                fontSize:"13px", color:"rgba(255,255,255,0.28)",
              }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   CTA
══════════════════════════════════════════════════════ */
function CTA() {
  return (
    <section style={{
      padding:"140px 0",
      background:"linear-gradient(180deg, #090c10 0%, #07101a 50%, #080808 100%)",
      borderTop:"1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{
        maxWidth:"700px", margin:"0 auto",
        padding:"0 80px", textAlign:"center",
      }}>
        <div style={{
          display:"inline-flex", alignItems:"center",
          border:"1px solid rgba(255,255,255,0.10)", borderRadius:"999px",
          padding:"4px 14px", fontSize:"11px",
          color:"rgba(255,255,255,0.42)", background:"rgba(255,255,255,0.03)",
          marginBottom:"28px", fontFamily:"var(--font-dm),'DM Sans',sans-serif", letterSpacing:"1.5px",
        }}>
          GET STARTED
        </div>

        <h2 style={{
          fontSize:"clamp(36px,4.2vw,58px)", fontWeight:900,
          letterSpacing:"-0.045em", color:"white",
          lineHeight:1.05, marginBottom:"24px",
        }}>
          Secure your next contract<br/>with AI + blockchain.
        </h2>

        <p style={{
          fontSize:"15.5px", color:"rgba(255,255,255,0.38)",
          marginBottom:"52px", lineHeight:1.75,
        }}>
          Upload your contract PDF, get an AI audit in seconds,
          and lock every milestone on-chain — for free.
        </p>

        <div style={{ display:"flex", gap:"16px", justifyContent:"center" }}>
          <button style={{
            background:"white", color:"#080808", fontWeight:700,
            fontSize:"15px", padding:"16px 38px", borderRadius:"8px",
            border:"none", cursor:"pointer", letterSpacing:"-0.01em",
            display:"flex", alignItems:"center", gap:"10px",
          }}>
            Audit Contract
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor"
                strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button style={{
            background:"transparent", color:"rgba(255,255,255,0.58)",
            fontSize:"15px", padding:"16px 30px", borderRadius:"8px",
            border:"1px solid rgba(255,255,255,0.13)", cursor:"pointer",
          }}>
            Read the Docs
          </button>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{
      padding:"48px 0", background:"#050505",
      borderTop:"1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{
        maxWidth:"1160px", margin:"0 auto", padding:"0 80px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <Image src="/logo.png" alt="" width={22} height={22}
            style={{ borderRadius:"6px", objectFit:"contain", opacity:0.65 }}/>
          <span style={{
            fontSize:"14px", fontWeight:700,
            color:"rgba(255,255,255,0.50)", letterSpacing:"-0.02em",
          }}>ContractGuard AI</span>
        </div>

        <div style={{ display:"flex", gap:"32px" }}>
          {["Products","Features","Docs","GitHub"].map(l => (
            <a key={l} href="#" style={{
              fontSize:"13px", color:"rgba(255,255,255,0.28)", textDecoration:"none",
            }}>{l}</a>
          ))}
        </div>

        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.20)" }}>
          © 2025 ContractGuard AI · Built on Solana
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE ROOT
══════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main style={{
      background:"#080808", minHeight:"100vh",
      color:"white", overflowX:"hidden",
    }}>
      <Navbar/>
      <Hero/>
      <HowItWorks/>
      <Features/>
      <Stats/>
      <CTA/>
      <Footer/>
    </main>
  );
}
