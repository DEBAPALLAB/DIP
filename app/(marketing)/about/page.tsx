"use client";

import React from "react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="landing-v2-container" style={{ paddingBottom: "0" }}>
      {/* Decorative Hero Background */}
      <div 
        style={{ 
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
          background: "radial-gradient(circle at 50% 50%, rgba(255,107,53,0.03) 0%, transparent 70%)",
          zIndex: 0, pointerEvents: "none"
        }} 
      />

      {/* Hero Section */}
      <section className="hero-v2" style={{ minHeight: "90vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", position: "relative", zIndex: 1 }}>
        <span className="section-label" style={{ letterSpacing: "0.5em", marginBottom: "32px", opacity: 0.6 }}>[LUCIDE_TECH_MANIFESTO_v1.0]</span>
        <h1 style={{ fontSize: "clamp(48px, 10vw, 140px)", lineHeight: "0.8", marginBottom: "48px", letterSpacing: "-0.05em" }}>
          DESIGN <span style={{ color: "var(--orange)", fontStyle: "italic" }}>FIRST.</span><br />
          ENGINEERED <span style={{ opacity: 0.3 }}>ALWAYS.</span>
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: "800px", margin: "0 auto", lineHeight: "1.6", fontSize: "19px", letterSpacing: "-0.01em" }}>
          Lucide Tech is a boutique digital product studio. We operate at the intersection of aesthetic luxury and hard-core engineering. We don't just build sites; we craft digital experiences that feel premium and drive outcomes.
        </p>
        
        <div style={{ marginTop: "80px" }}>
            <div style={{ display: "flex", gap: "100px", justifyContent: "center" }}>
                <div>
                   <span style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--orange)", marginBottom: "8px" }}>ESTABLISHED</span>
                   <span style={{ fontSize: "24px", color: "var(--bright)", fontWeight: 700 }}>2024//DXB</span>
                </div>
                <div>
                   <span style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--orange)", marginBottom: "8px" }}>FOCUS</span>
                   <span style={{ fontSize: "24px", color: "var(--bright)", fontWeight: 700 }}>HIGH_FIDELITY</span>
                </div>
                <div>
                   <span style={{ display: "block", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--orange)", marginBottom: "8px" }}>CLIENTS</span>
                   <span style={{ fontSize: "24px", color: "var(--bright)", fontWeight: 700 }}>SELECTIVE</span>
                </div>
            </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section style={{ padding: "160px 0", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "120px" }}>
            <div>
               <h2 style={{ fontSize: "64px", lineHeight: "1", marginBottom: "40px", letterSpacing: "-0.03em" }}>THE <span style={{ color: "var(--orange)" }}>STORY.</span></h2>
               <p style={{ color: "var(--text)", fontSize: "18px", lineHeight: "1.8", marginBottom: "32px" }}>
                 The market is saturated with "good enough." Generic templates, sluggish performance, and forgettable design have become the norm.
               </p>
               <p style={{ color: "var(--muted)", fontSize: "18px", lineHeight: "1.8" }}>
                 Lucide Tech was born to bridge the gap. We believe that how a product <strong>feels</strong> is as important as how it functions. A premium interface builds trust, reduces friction, and commands attention.
               </p>
            </div>
            <div style={{ position: "relative" }}>
               <div style={{ border: "1px solid var(--border)", padding: "60px", background: "var(--bg-darker)", position: "relative" }}>
                  <div style={{ position: "absolute", top: -1, left: -1, width: 20, height: 20, borderTop: "1px solid var(--orange)", borderLeft: "1px solid var(--orange)" }} />
                  <div style={{ position: "absolute", bottom: -1, right: -1, width: 20, height: 20, borderBottom: "1px solid var(--orange)", borderRight: "1px solid var(--orange)" }} />
                  
                  <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--orange)", marginBottom: "32px" }}>[STUDIO_CAPABILITIES]</div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "24px" }}>
                     <li style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                        <strong style={{ display: "block", color: "var(--bright)", fontSize: "18px", marginBottom: "4px" }}>01 // BRUTALIST_UI</strong>
                        <span style={{ fontSize: "13px", color: "var(--muted)" }}>Loud, clear, and uncompromising visual systems.</span>
                     </li>
                     <li style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                        <strong style={{ display: "block", color: "var(--bright)", fontSize: "18px", marginBottom: "4px" }}>02 // NEXT_JS_EXERT</strong>
                        <span style={{ fontSize: "13px", color: "var(--muted)" }}>Server-side performance meets client-side fluidity.</span>
                     </li>
                     <li style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                        <strong style={{ display: "block", color: "var(--bright)", fontSize: "18px", marginBottom: "4px" }}>03 // INTELLIGENT_SYSTEMS</strong>
                        <span style={{ fontSize: "13px", color: "var(--muted)" }}>Integrating multi-agent simulations and AI layers.</span>
                     </li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* Quote Section */}
      <section style={{ padding: "160px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", textAlign: "center", position: "relative" }}>
         <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <span style={{ fontSize: "80px", color: "var(--orange)", opacity: 0.2, position: "absolute", top: "120px", left: "50%", transform: "translateX(-50%)", fontFamily: "serif" }}>"</span>
            <p style={{ fontSize: "32px", lineHeight: "1.4", color: "var(--bright)", letterSpacing: "-0.01em", fontStyle: "italic", marginBottom: "48px" }}>
              "We don't build software. We craft digital artifacts for brands that refuse to blend in."
            </p>
            <span style={{ fontFamily: "var(--mono)", color: "var(--orange)", fontSize: "13px", fontWeight: 700 }}>[LUCIDE_TECH_TEAM]</span>
         </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "200px 0", textAlign: "center" }}>
          <h2 style={{ fontSize: "80px", letterSpacing: "-0.04em", marginBottom: "48px" }}>READY TO <br /><span style={{ color: "var(--orange)" }}>EXPERIMENT?</span></h2>
          <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
            <Link href="/register" className="btn-v2-primary" style={{ textDecoration: "none", padding: "18px 48px" }}>
              START_FREE_SIMULATION
            </Link>
            <Link href="/contact" className="btn-v2-ghost" style={{ textDecoration: "none", padding: "18px 48px" }}>
              STUDIO_INQUIRY
            </Link>
          </div>
      </section>

      <footer style={{ textAlign: "center", padding: "80px 0", borderTop: "1px solid var(--border)", background: "var(--bg-darker)" }}>
         <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.5em" }}>STRAWBERRY // DXB_OFFICE_2024</span>
      </footer>
    </div>
  );
}
