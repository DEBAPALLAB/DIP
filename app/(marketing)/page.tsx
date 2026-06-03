"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { InlineLogin } from "@/components/marketing/InlineLogin";
import { HeroNetwork3D } from "@/components/marketing/HeroNetwork3D";
import { AnimatedCounter } from "@/components/marketing/AnimatedCounter";
import { GlowCard } from "@/components/marketing/GlowCard";
import { ScrambleText } from "@/components/marketing/ScrambleText";
import { PromptComparison } from "@/components/marketing/PromptComparison";
import { ManifestoTextReveal } from "@/components/marketing/ManifestoTextReveal";

export default function LandingPage() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  // Mouse move effect for interactive glow coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Scroll listener for Macbook mockup zoom animation
  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / 650, 1);
      if (mockupRef.current) {
        mockupRef.current.style.transform = `scale(${1 + progress * 0.06}) translateY(${-progress * 25}px)`;
      }
    };
    // Initial run
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -40px 0px", // triggers slightly before entering the screen
      }
    );

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div style={{ background: "transparent", color: "var(--text)", overflowX: "hidden", position: "relative" }}>
      {/* Dynamic reveal stylesheet */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }
        .reveal-on-scroll.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.1s !important; }
        .reveal-delay-2 { transition-delay: 0.2s !important; }
        .reveal-delay-3 { transition-delay: 0.3s !important; }
        .reveal-delay-4 { transition-delay: 0.4s !important; }
      `}} />

      {/* ── BACKGROUND BLOBS & TEXTURES ── */}
      <div style={{ position: "absolute", top: "15%", right: "-15%", width: "55vw", height: "55vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(6, 182, 212, 0.07) 0%, rgba(0, 82, 255, 0.05) 35%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", top: "45%", left: "-5%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(236, 72, 153, 0.05) 0%, rgba(99, 102, 241, 0.03) 40%, transparent 75%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      {/* ══ 1. HERO SECTION ════════════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "115vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "120px 6vw 60px 6vw",
          borderBottom: "1px solid var(--border)",
          background: "transparent"
        }}
      >
        {/* Decorative Grid Lines */}
        <div style={{ position: "absolute", top: 0, left: "6vw", width: "1px", height: "100%", background: "rgba(0, 82, 255, 0.025)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: "6vw", width: "1px", height: "100%", background: "rgba(0, 82, 255, 0.025)", pointerEvents: "none" }} />

        {/* Centered Eyebrow Pill
        <div className="reveal-on-scroll" style={{ display: "inline-flex", padding: "6px 16px", background: "rgba(0, 82, 255, 0.05)", border: "1px solid rgba(0, 82, 255, 0.15)", borderRadius: "999px", fontFamily: "var(--mono)", fontSize: "10px", color: "#0052ff", fontWeight: 600, marginBottom: "28px", letterSpacing: "0.08em", zIndex: 10 }}>
          // THE DECISION INTELLIGENCE CORE
        </div> */}

        {/* Giant Centered Headline */}
        <h1 className="reveal-on-scroll reveal-delay-1" style={{
          textAlign: "center",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "clamp(46px, 6.5vw, 82px)",
          fontWeight: 800,
          lineHeight: 0.95,
          letterSpacing: "-0.04em",
          color: "var(--bright)",
          maxWidth: "1050px",
          margin: "0 auto 24px auto",
          marginTop: "28px",
          zIndex: 10
        }}>
          Simulation-Driven Decisions<br />
          <span style={{ fontWeight: 300, color: "var(--muted)" }}>Powered by AI Agents</span>
        </h1>

        {/* Clean Center Description */}
        <p className="reveal-on-scroll reveal-delay-2" style={{
          textAlign: "center",
          fontSize: "18px",
          color: "var(--text)",
          lineHeight: 1.65,
          maxWidth: "680px",
          margin: "0 auto 36px auto",
          fontWeight: 400,
          zIndex: 10
        }}>
          Stop validating critical business strategies by asking static chatbots for generic opinions. Notaprompt compiles concepts into living social simulation networks of interactive, sociometrically aligned agents.
        </p>

        {/* Centered Actions Capsule */}
        <div className="reveal-on-scroll reveal-delay-3" style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "72px", zIndex: 10 }}>
          <Link href="/setup" className="btn-getstarted-capsule" style={{ padding: "14px 36px", fontSize: "14px" }}>
            Launch Simulator Free
          </Link>
          <Link href="#manifesto" className="btn-signout-capsule" style={{ border: "1px solid var(--border)", padding: "14px 36px", fontSize: "14px" }}>
            Explore Methodology
          </Link>
        </div>

        {/* Centered SaaS Dashboard Mockup Outer Container */}
        <div className="reveal-on-scroll reveal-delay-4" style={{ position: "relative", width: "100%", maxWidth: "1160px", zIndex: 10, margin: "0 auto" }}>

          {/* Accent glow washing behind the dashboard mockup */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            height: "100%",
            background: "radial-gradient(circle, rgba(0, 82, 255, 0.05) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: -1
          }} />

          {/* SaaS Frame (Premium Light-glass Container / Browser Mockup) with dynamic scroll zoom */}
          <div
            ref={mockupRef}
            style={{
              width: "100%",
              height: "580px",
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(0, 82, 255, 0.15)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 30px 80px rgba(0, 82, 255, 0.16), 0 0 50px rgba(0, 82, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              transform: "scale(1) translateY(0px)",
              transition: "box-shadow 0.3s ease",
            }}
          >
            {/* Dashboard Inner App Header */}
            <div style={{
              height: "56px",
              borderBottom: "1px solid rgba(0, 82, 255, 0.06)",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(255, 255, 255, 0.5)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {/* macOS Window Controls */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#ff5f56", border: "0.5px solid #e0443e", display: "block" }} />
                  <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#ffbd2e", border: "0.5px solid #dea123", display: "block" }} />
                  <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#27c93f", border: "0.5px solid #1aab29", display: "block" }} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "4px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0052ff", boxShadow: "0 0 10px rgba(0, 82, 255, 0.4)" }} />
                  <span style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.2em", color: "var(--text)" }}>NOTAPROMPT_v4.2 // ONLINE</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "20px", fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.08em" }}>
                <span>OVERVIEW</span>
                <span style={{ color: "#0052ff", fontWeight: 700 }}>NETWORK_GRAPH</span>
                <span>DEMOGRAPHICS</span>
                <span>RESULTS</span>
              </div>
              <div style={{ fontSize: "9px", fontFamily: "var(--mono)", color: "var(--muted)" }}>
                SECURE_NODE_7.2
              </div>
            </div>

            {/* Main Area inside Mockup: Graph & Overlay Widgets */}
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              {/* Float Widget Left */}
              <div style={{ position: "absolute", top: "24px", left: "24px", zIndex: 10, background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(0, 82, 255, 0.08)", borderRadius: "12px", padding: "12px 18px", fontFamily: "var(--mono)", fontSize: "10px", boxShadow: "0 10px 30px rgba(0, 82, 255, 0.03)" }}>
                <div style={{ color: "var(--muted)", fontSize: "8px", letterSpacing: "0.1em" }}>ACTIVE_POPULATION</div>
                <div style={{ color: "var(--bright)", fontSize: "20px", fontWeight: 800, marginTop: "2px" }}>1,499 AGENTS</div>
              </div>

              {/* Float Widget Right */}
              <div style={{ position: "absolute", top: "24px", right: "24px", zIndex: 10, background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(0, 82, 255, 0.08)", borderRadius: "12px", padding: "12px 18px", fontFamily: "var(--mono)", fontSize: "10px", boxShadow: "0 10px 30px rgba(0, 82, 255, 0.03)" }}>
                <div style={{ color: "var(--muted)", fontSize: "8px", letterSpacing: "0.1em" }}>ADOPTION_PEAK</div>
                <div style={{ color: "#0052ff", fontSize: "20px", fontWeight: 800, marginTop: "2px", textShadow: "0 0 10px rgba(0, 82, 255, 0.2)" }}>78.4% DETECTED</div>
              </div>

              <HeroNetwork3D />
            </div>
          </div>
        </div>

        {/* Bottom Partner Grayscale Strip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", borderTop: "1px solid var(--border)", paddingTop: "32px", width: "100%", maxWidth: "1160px", zIndex: 5, marginTop: "80px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--bright)", fontFamily: "var(--mono)", letterSpacing: "-0.02em" }}>3,572,401,988</span>
            <span style={{ fontSize: "9px", color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.08em", marginTop: "4px" }}>DEMOGRAPHIC DATA POINTS FITTED IN CURRENT COMPILED RUNS</span>
          </div>
          <div style={{ display: "flex", gap: "28px", alignItems: "center", opacity: 0.5, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", color: "var(--text)" }}>WATTS-STROGATZ GRAPH</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", color: "var(--text)" }}>GSS VECTOR ENGINE</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", color: "var(--text)" }}>PROSPECT THEORY MODEL</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", color: "var(--text)" }}>OPENROUTER COGNITION</span>
          </div>
        </div>
      </section>

      {/* ══ 2. THE MANIFESTO SECTION ════════════════ */}
      <section
        id="manifesto"
        style={{
          padding: "12vh 6vw",
          borderBottom: "1px solid var(--border)",
          display: "grid",
          gridTemplateColumns: "0.3fr 1.7fr",
          gap: "40px",
          position: "relative"
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "6vw", width: "1px", height: "100%", background: "rgba(0, 82, 255, 0.015)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: "6vw", width: "1px", height: "100%", background: "rgba(0, 82, 255, 0.015)", pointerEvents: "none" }} />

        <div className="reveal-on-scroll">
          <span style={{ display: "inline-flex", padding: "6px 14px", border: "1px solid var(--border)", borderRadius: "999px", fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)" }}>
            Vision
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <ManifestoTextReveal />
          <p className="reveal-on-scroll reveal-delay-2" style={{ fontSize: "13px", color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.05em", marginTop: "12px" }}>
            DESIGNED BY DYNAMIC COGNITIVE VECTORS — SYSTEM_VERSION_7.2
          </p>
        </div>
      </section>

      {/* ══ 3. ACCENTED NETWORK GRAPH FEATURE SECTIONS ════════════════ */}
      <section
        style={{
          padding: "10vh 6vw",
          borderBottom: "1px solid var(--border)",
          position: "relative"
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "6vw", width: "1px", height: "100%", background: "rgba(0, 82, 255, 0.015)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: "6vw", width: "1px", height: "100%", background: "rgba(0, 82, 255, 0.015)", pointerEvents: "none" }} />

        {/* Section Header */}
        <div className="reveal-on-scroll" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px", marginBottom: "64px" }}>
          <div>
            <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--accent)", letterSpacing: "0.2em", display: "block", marginBottom: "12px" }}>[COGNITIVE_ARCHITECTURE]</span>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 54px)", fontWeight: 800, letterSpacing: "-0.04em", fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", color: "var(--bright)", lineHeight: 1.05 }}>
              The Mechanics of a<br />
              <span style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontWeight: 300, color: "var(--muted)" }}>Small-World Cascade</span>
            </h2>
          </div>
          <p style={{ fontSize: "16px", color: "var(--muted)", maxWidth: "440px", lineHeight: 1.5 }}>
            Watch how ideas, behaviors, and messages diffuse across complex networks of interconnected micro-personas in real time.
          </p>
        </div>

        {/* Dynamic Accented Layout Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>

          {/* Card 1: Network Graph framed in premium card */}
          <div className="reveal-on-scroll" style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px", height: "580px", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
              <div>
                <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)" }}>01 / SYSTEM_VISUALIZATION</span>
                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--bright)", marginTop: "4px" }}>Live Contagion Cascade</h3>
              </div>
              <span style={{ fontSize: "11px", color: "var(--accent)", fontFamily: "var(--mono)" }}>SYS_STABLE ↗</span>
            </div>

            {/* The Accented 3D Graph embedded as focal point */}
            <div style={{ flex: 1, position: "relative", border: "1px dashed var(--border)", borderRadius: "16px", background: "rgba(0,0,0,0.02)", overflow: "hidden" }}>
              <HeroNetwork3D />
            </div>
          </div>

          {/* Card 2: Interactive metrics & metadata panels */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Sub-Card 1: Barcode Metric */}
            <div className="reveal-on-scroll reveal-delay-1" style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)" }}>02 / PERFORMANCE_METRICS</span>
                  <h4 style={{ fontSize: "18px", fontWeight: 700, color: "var(--bright)", marginTop: "4px" }}>Cascade Adherency Precision</h4>
                </div>
                <span style={{ fontSize: "9px", background: "rgba(0, 82, 255, 0.05)", border: "1px solid rgba(0, 82, 255, 0.15)", color: "var(--accent)", padding: "4px 10px", borderRadius: "999px", fontFamily: "var(--mono)", fontWeight: 700 }}>NEW_NODE</span>
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
                    const strokeColor = idx < 42 ? "var(--accent)" : "rgba(0,0,0,0.1)";
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
            <div className="reveal-on-scroll reveal-delay-2" style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)" }}>03 / COGNITIVE_VECTORS</span>
                  <h4 style={{ fontSize: "18px", fontWeight: 700, color: "var(--bright)", marginTop: "4px" }}>General Social Survey Variables</h4>
                </div>
                <span style={{ fontSize: "14px", color: "var(--bright)" }}>↗</span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.5 }}>
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
          borderBottom: "1px solid var(--border)",
          position: "relative"
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "6vw", width: "1px", height: "100%", background: "rgba(0, 82, 255, 0.015)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: "6vw", width: "1px", height: "100%", background: "rgba(0, 82, 255, 0.015)", pointerEvents: "none" }} />

        <div className="reveal-on-scroll" style={{ maxWidth: "800px", margin: "0 auto 48px auto", textAlign: "center" }}>
          <span style={{ display: "inline-flex", padding: "6px 14px", border: "1px solid var(--border)", borderRadius: "999px", fontFamily: "var(--mono)", fontSize: "10px", color: "var(--accent)", marginBottom: "16px" }}>
            [THE_COMPARISON]
          </span>
          <h2 style={{ fontSize: "clamp(32px, 4.5vw, 54px)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--bright)", lineHeight: 1.05, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
            Boring Chatbot Guesswork<br />
            vs. <span style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontWeight: 300, color: "var(--muted)" }}>Notaprompt Simulation</span>
          </h2>
          <p style={{ fontSize: "16px", color: "var(--muted)", marginTop: "16px" }}>
            Compare how standard predictive language models forecast customer behaviors compared to actual topological contagion cascades.
          </p>
        </div>

        <div className="reveal-on-scroll reveal-delay-1">
          <PromptComparison />
        </div>
      </section>

      {/* ══ 5. DYNAMIC STEPS / HOW IT WORKS ════════════════ */}
      <section
        style={{
          padding: "10vh 6vw",
          borderBottom: "1px solid var(--border)",
          position: "relative"
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "6vw", width: "1px", height: "100%", background: "rgba(0, 82, 255, 0.015)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: "6vw", width: "1px", height: "100%", background: "rgba(0, 82, 255, 0.015)", pointerEvents: "none" }} />

        <div className="reveal-on-scroll" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px", marginBottom: "64px" }}>
          <div>
            <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--accent)", letterSpacing: "0.2em", display: "block", marginBottom: "12px" }}>[THE_PROCESS]</span>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 54px)", fontWeight: 800, letterSpacing: "-0.04em", fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", color: "var(--bright)", lineHeight: 1.05 }}>
              From Conceptualization<br />
              <span style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontWeight: 300, color: "var(--muted)" }}>to Live Cascade</span>
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
              className={`reveal-on-scroll reveal-delay-${idx}`}
              style={{
                display: "grid",
                gridTemplateColumns: "0.15fr 0.25fr 0.8fr 0.8fr 0.1fr",
                alignItems: "center",
                padding: "36px 0",
                borderTop: "1px solid var(--border)",
                borderBottom: idx === 3 ? "1px solid var(--border)" : "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                opacity: hoveredStep === null || hoveredStep === idx ? 1 : 0.35,
                background: hoveredStep === idx ? "rgba(0, 82, 255, 0.02)" : "transparent"
              }}
            >
              <span style={{ fontFamily: "var(--mono)", fontSize: "16px", color: hoveredStep === idx ? "var(--accent)" : "var(--muted)", fontWeight: 700 }}>{step.num}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.1em" }}>// {step.label}</span>
              <h4 style={{ fontSize: "20px", fontWeight: 700, color: hoveredStep === idx ? "var(--accent)" : "var(--bright)", transition: "color 0.2s ease" }}>{step.title}</h4>
              <p style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.5, paddingRight: "40px" }}>{step.desc}</p>
              <span style={{ fontSize: "18px", color: hoveredStep === idx ? "var(--accent)" : "var(--muted)", textAlign: "right", transition: "transform 0.3s ease", transform: hoveredStep === idx ? "translateX(4px)" : "none" }}>↗</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 6. ACCESS COMMAND CENTER ════════════════ */}
      <section
        style={{
          padding: "10vh 6vw",
          borderBottom: "1px solid var(--border)",
          position: "relative"
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "6vw", width: "1px", height: "100%", background: "rgba(0, 82, 255, 0.015)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: "6vw", width: "1px", height: "100%", background: "rgba(0, 82, 255, 0.015)", pointerEvents: "none" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div className="reveal-on-scroll">
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
          <div className="reveal-on-scroll reveal-delay-2" style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "24px", padding: "40px" }}>
            <InlineLogin />
          </div>
        </div>
      </section>

    </div>
  );
}
