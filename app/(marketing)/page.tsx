"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { InlineLogin } from "@/components/marketing/InlineLogin";
import { HeroNetwork3D } from "@/components/marketing/HeroNetwork3D";
import { AnimatedCounter } from "@/components/marketing/AnimatedCounter";
import { GlowCard } from "@/components/marketing/GlowCard";
import { ScrambleText } from "@/components/marketing/ScrambleText";
import { PromptComparison } from "@/components/marketing/PromptComparison";

export default function LandingPage() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div style={{ background: "#050507", color: "var(--text)", overflowX: "hidden" }}>
      
      {/* ══ 1. HERO SECTION (High-Contrast / Modern Agency Design) ════════════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px 6vw",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          background: "radial-gradient(circle at 80% 30%, rgba(200, 241, 53, 0.03) 0%, transparent 60%)"
        }}
      >
        {/* Decorative Grid Lines */}
        <div style={{ position: "absolute", top: 0, left: "6vw", width: "1px", height: "100%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: "6vw", width: "1px", height: "100%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />

        {/* Top Ticker Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.2em", color: "var(--muted)" }}>NOTAPROMPT_v4.2 // ONLINE</span>
          </div>
          <Link href="/login" className="btn-ghost-setup" style={{ padding: "6px 16px", fontSize: "9px" }}>
            COMMAND_CENTER →
          </Link>
        </div>

        {/* Main Hero Split */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "40px", alignItems: "center", margin: "8vh 0", zIndex: 5 }}>
          {/* Left Column: Big Vision Typography */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div style={{ display: "inline-flex", padding: "6px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "999px", width: "fit-content", fontFamily: "var(--mono)", fontSize: "10px", color: "var(--accent)" }}>
              // THE_DECISION_INTELLIGENCE_REVOLUTION
            </div>
            
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontSize: "clamp(42px, 5.5vw, 76px)", fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.05em", color: "var(--bright)" }}>
              Not a chat.<br />
              <span style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontStyle: "normal", fontWeight: 300, color: "rgba(255,255,255,0.4)" }}>Beyond</span> the prompt.
            </h1>

            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, maxWidth: "560px", fontWeight: 400 }}>
              Stop validating critical business strategies by asking static chatbots for generic opinions. 
              <strong> Notaprompt</strong> compiles your concepts into living small-world simulation networks of 1,499 interactive, sociometrically aligned agents.
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "12px" }}>
              <Link href="/setup" className="btn-cta" style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 28px", borderRadius: "999px", fontSize: "11px", fontWeight: 800 }}>
                LAUNCH SIMULATION <span style={{ fontSize: "14px" }}>↗</span>
              </Link>
              <Link href="#manifesto" className="btn-ghost-setup" style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 28px", borderRadius: "999px", fontSize: "11px", fontWeight: 800 }}>
                EXPLORE METHODOLOGY
              </Link>
            </div>
          </div>

          {/* Right Column: 3D Network Graph Visual Accent */}
          <div style={{ position: "relative", height: "540px", width: "100%", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "24px", background: "rgba(255,255,255,0.01)", backdropFilter: "blur(10px)", overflow: "hidden" }}>
            {/* Custom Overlay Stats */}
            <div style={{ position: "absolute", top: "24px", left: "24px", zIndex: 10, background: "rgba(10,10,10,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px 14px", fontFamily: "var(--mono)", fontSize: "10px" }}>
              <div style={{ color: "var(--muted)", fontSize: "8px", letterSpacing: "0.1em" }}>ACTIVE_POPULATION</div>
              <div style={{ color: "var(--accent)", fontSize: "20px", fontWeight: 800, marginTop: "2px" }}>1,499 AGENTS</div>
            </div>
            
            <div style={{ position: "absolute", bottom: "24px", right: "24px", zIndex: 10, background: "rgba(10,10,10,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px 14px", fontFamily: "var(--mono)", fontSize: "10px" }}>
              <div style={{ color: "var(--muted)", fontSize: "8px", letterSpacing: "0.1em" }}>ADOPTION_PEAK</div>
              <div style={{ color: "var(--orange)", fontSize: "20px", fontWeight: 800, marginTop: "2px" }}>78.4% DETECTED</div>
            </div>

            <HeroNetwork3D />
          </div>
        </div>

        {/* Bottom Partner Grayscale Strip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "32px", width: "100%", zIndex: 5 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--bright)", fontFamily: "var(--mono)", letterSpacing: "-0.02em" }}>3,572,401,988</span>
            <span style={{ fontSize: "9px", color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.08em", marginTop: "4px" }}>DEMOGRAPHIC DATA POINTS FITTED IN CURRENT COMPILED RUNS</span>
          </div>
          <div style={{ display: "flex", gap: "28px", alignItems: "center", opacity: 0.4, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em" }}>WATTS-STROGATZ GRAPH</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em" }}>GSS VECTOR ENGINE</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em" }}>PROSPECT THEORY MODEL</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em" }}>OPENROUTER COGNITION</span>
          </div>
        </div>
      </section>

      {/* ══ 2. THE MANIFESTO SECTION (Inspired by Image 2 of Batch 1) ════════════════ */}
      <section
        id="manifesto"
        style={{
          padding: "12vh 6vw",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          display: "grid",
          gridTemplateColumns: "0.3fr 1.7fr",
          gap: "40px",
          position: "relative"
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "6vw", width: "1px", height: "100%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: "6vw", width: "1px", height: "100%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />

        <div>
          <span style={{ display: "inline-flex", padding: "6px 14px", border: "1px solid var(--border)", borderRadius: "999px", fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)" }}>
            Vision
          </span>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <p style={{ fontFamily: "var(--sans)", fontSize: "clamp(26px, 3.8vw, 48px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.04em", color: "var(--bright)" }}>
            Built on <span style={{ color: "var(--accent)", fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontWeight: 300 }}>clear intention</span> and rigorous mathematical craft, we model buyer, community, and citizen mindsets to simulate propagation cascades. Watch cascade contagions spread through small-world graphs so every strategic launch feels <span style={{ color: "rgba(255,255,255,0.4)" }}>calm, predictable, and fully within your control.</span>
          </p>
          <p style={{ fontSize: "13px", color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.05em", marginTop: "12px" }}>
            DESIGNED BY DYNAMIC COGNITIVE VECTORS — SYSTEM_VERSION_7.2
          </p>
        </div>
      </section>

      {/* ══ 3. ACCENTED NETWORK GRAPH FEATURE SECTIONS (As Requested!) ════════════════ */}
      <section
        style={{
          padding: "10vh 6vw",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          position: "relative"
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "6vw", width: "1px", height: "100%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: "6vw", width: "1px", height: "100%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />

        {/* Section Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px", marginBottom: "64px" }}>
          <div>
            <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--accent)", letterSpacing: "0.2em", display: "block", marginBottom: "12px" }}>[COGNITIVE_ARCHITECTURE]</span>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 54px)", fontWeight: 800, letterSpacing: "-0.04em", fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", color: "var(--bright)", lineHeight: 1.05 }}>
              The Mechanics of a<br />
              <span style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.4)" }}>Small-World Cascade</span>
            </h2>
          </div>
          <p style={{ fontSize: "16px", color: "var(--muted)", maxWidth: "440px", lineHeight: 1.5 }}>
            Watch how ideas, behaviors, and messages diffuse across complex networks of interconnected micro-personas in real time.
          </p>
        </div>

        {/* Dynamic Accented Layout Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
          
          {/* Card 1: Network Graph framed in premium card */}
          <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px", height: "580px", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
              <div>
                <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)" }}>01 / SYSTEM_VISUALIZATION</span>
                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--bright)", marginTop: "4px" }}>Live Contagion Cascade</h3>
              </div>
              <span style={{ fontSize: "11px", color: "var(--accent)", fontFamily: "var(--mono)" }}>SYS_STABLE ↗</span>
            </div>
            
            {/* The Accented 3D Graph embedded as focal point */}
            <div style={{ flex: 1, position: "relative", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "16px", background: "rgba(0,0,0,0.2)", overflow: "hidden" }}>
              <HeroNetwork3D />
            </div>
          </div>

          {/* Card 2: Interactive metrics & metadata panels */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Sub-Card 1: Barcode Metric (Inspired by Image 3 of Batch 1) */}
            <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)" }}>02 / PERFORMANCE_METRICS</span>
                  <h4 style={{ fontSize: "18px", fontWeight: 700, color: "var(--bright)", marginTop: "4px" }}>Cascade Adherency Precision</h4>
                </div>
                <span style={{ fontSize: "9px", background: "#000", border: "1px solid rgba(200,241,53,0.3)", color: "var(--accent)", padding: "4px 10px", borderRadius: "999px", fontFamily: "var(--mono)", fontWeight: 700 }}>NEW_NODE</span>
              </div>
              
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", margin: "12px 0" }}>
                <span style={{ fontSize: "56px", fontWeight: 800, letterSpacing: "-0.04em", fontFamily: "var(--sans)", color: "var(--bright)" }}>86.4%</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>/ Cascade Contagion Confidence</span>
              </div>

              {/* Barcode-adoption SVG Meter */}
              <div style={{ width: "100%", height: "24px", margin: "8px 0" }}>
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 10">
                  {Array.from({ length: 50 }).map((_, idx) => {
                    const fillOpacity = idx < 42 ? 0.95 : 0.15;
                    const strokeColor = idx < 42 ? "var(--accent)" : "rgba(255,255,255,0.15)";
                    return (
                      <line
                        key={idx}
                        x1={idx * 2}
                        y1={0}
                        x2={idx * 2}
                        y2={10}
                        stroke={strokeColor}
                        strokeWidth={0.8}
                        strokeOpacity={fillOpacity}
                      />
                    );
                  })}
                </svg>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)" }}>
                <span>0% ACCURACY</span>
                <span>120 COGNITIVE INTERVIEWS RUNNING SAMPLES</span>
                <span>100% STABLE</span>
              </div>
            </div>

            {/* Sub-Card 2: Telemetry details */}
            <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)" }}>03 / COGNITIVE_VECTORS</span>
                  <h4 style={{ fontSize: "18px", fontWeight: 700, color: "var(--bright)", marginTop: "4px" }}>General Social Survey Variables</h4>
                </div>
                <span style={{ fontSize: "14px", color: "var(--bright)" }}>↗</span>
              </div>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                Every compiled agent profile factors high-dimensional psychological traits. We load conforming index vectors, peer affinity scales, budget elasticities, and skepticism coefficients to map real buyer actions.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ══ 4. A/B COMPARISON ENGINE ════════════════ */}
      <section
        style={{
          padding: "10vh 6vw",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          position: "relative"
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "6vw", width: "1px", height: "100%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: "6vw", width: "1px", height: "100%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "800px", margin: "0 auto 48px auto", textAlign: "center" }}>
          <span style={{ display: "inline-flex", padding: "6px 14px", border: "1px solid var(--border)", borderRadius: "999px", fontFamily: "var(--mono)", fontSize: "10px", color: "var(--accent)", marginBottom: "16px" }}>
            [THE_COMPARISON]
          </span>
          <h2 style={{ fontSize: "clamp(32px, 4.5vw, 54px)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--bright)", lineHeight: 1.05, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
            Boring Chatbot Guesswork<br />
            vs. <span style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.4)" }}>Notaprompt Simulation</span>
          </h2>
          <p style={{ fontSize: "16px", color: "var(--muted)", marginTop: "16px" }}>
            Compare how standard predictive language models forecast customer behaviors compared to actual topological contagion cascades.
          </p>
        </div>

        <PromptComparison />
      </section>

      {/* ══ 5. DYNAMIC STEPS / HOW IT WORKS (Tactical List Layout) ════════════════ */}
      <section
        style={{
          padding: "10vh 6vw",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          position: "relative"
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "6vw", width: "1px", height: "100%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: "6vw", width: "1px", height: "100%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px", marginBottom: "64px" }}>
          <div>
            <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--accent)", letterSpacing: "0.2em", display: "block", marginBottom: "12px" }}>[THE_PROCESS]</span>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 54px)", fontWeight: 800, letterSpacing: "-0.04em", fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", color: "var(--bright)", lineHeight: 1.05 }}>
              From Conceptualization<br />
              <span style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.4)" }}>to Live Cascade</span>
            </h2>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            { num: "01", label: "COMPILE", title: "Input Strategy Concepts", desc: "Enter your strategic launch message, concept outline, or channel blueprints. Our compiler breaks these down into multivariable parameters." },
            { num: "02", label: "MAP", title: "Synthesize Small-World Network Topology", desc: "We map relationships based on spatial small-world graphs (Watts-Strogatz algorithms), allocating precise conformist thresholds across 1,499 distinct agents." },
            { num: "03", label: "RUN", title: "Trigger Behavioral Propagation Contagions", desc: "Initiate peer-to-peer cascades. Watch agents deliberate, conform, resist, and dynamically influence neighboring nodes over multiple steps." },
            { num: "04", label: "EXTRAPOLATE", title: "Harvest Non-Linear Telemetry", desc: "Forget vague bullet points. Retrieve concrete analytics logs detailing peak adoptions, resistant node profiles, and critical campaign tipping points." }
          ].map((step, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredStep(idx)}
              onMouseLeave={() => setHoveredStep(null)}
              style={{
                display: "grid",
                gridTemplateColumns: "0.15fr 0.25fr 0.8fr 0.8fr 0.1fr",
                alignItems: "center",
                padding: "36px 0",
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                borderBottom: idx === 3 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                opacity: hoveredStep === null || hoveredStep === idx ? 1 : 0.35,
                background: hoveredStep === idx ? "rgba(200, 241, 53, 0.01)" : "transparent"
              }}
            >
              <span style={{ fontFamily: "var(--mono)", fontSize: "16px", color: hoveredStep === idx ? "var(--accent)" : "var(--muted)", fontWeight: 700 }}>{step.num}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.1em" }}>// {step.label}</span>
              <h4 style={{ fontSize: "20px", fontWeight: 700, color: hoveredStep === idx ? "var(--accent)" : "var(--bright)", transition: "color 0.2s ease" }}>{step.title}</h4>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5, paddingRight: "40px" }}>{step.desc}</p>
              <span style={{ fontSize: "18px", color: hoveredStep === idx ? "var(--accent)" : "var(--muted)", textAlign: "right", transition: "transform 0.3s ease", transform: hoveredStep === idx ? "translateX(4px)" : "none" }}>↗</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 6. ACCESS COMMAND CENTER (Premium / Elegant Sign-In Banner) ════════════════ */}
      <section
        style={{
          padding: "10vh 6vw",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          position: "relative"
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "6vw", width: "1px", height: "100%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: "6vw", width: "1px", height: "100%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div>
            <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--accent)", letterSpacing: "0.2em", display: "block", marginBottom: "12px" }}>[SECURE_ACCESS_PORTAL]</span>
            <h2 style={{ fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.04em", fontFamily: "var(--sans)", color: "var(--bright)", lineHeight: 1.05, marginBottom: "20px" }}>
              Access the Command Center.
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.6, marginBottom: "28px", maxWidth: "460px" }}>
              Enter your secure credentials to orchestrate new small-world networks, load historical simulation runs, or scale agent capabilities.
            </p>
            <Link href="/pricing" style={{ fontSize: "11px", fontFamily: "var(--mono)", letterSpacing: "0.05em", color: "var(--accent)", textDecoration: "none" }}>
              VIEW SUBSCRIPTION TIERS & NODES →
            </Link>
          </div>
          <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "40px" }}>
            <InlineLogin />
          </div>
        </div>
      </section>

    </div>
  );
}
