"use client";

import Link from "next/link";
import Squares from "@/components/marketing/InteractiveBackground";

const MILESTONES = [
  { year: "2024 Q1", title: "Research Begins", desc: "Behavioral data pipeline built on top of GSS 2024 dataset. First agent prototypes created." },
  { year: "2024 Q2", title: "Trinity Engine v1", desc: "First working integration of Prospect Theory, social graph dynamics, and LLM reasoning." },
  { year: "2024 Q3", title: "Closed Beta", desc: "Invited 12 strategic research teams to validate simulation accuracy against real market outcomes." },
  { year: "2024 Q4", title: "Public Launch", desc: "Notaprompt platform opens to the public. Explorer tier available free for all researchers." },
];

const VALUES = [
  {
    icon: "⬡",
    title: "Fidelity Over Speed",
    desc: "We don't cut corners on behavioral accuracy. Every simulation reflects the full complexity of real human decision-making.",
  },
  {
    icon: "◎",
    title: "Design Meets Science",
    desc: "Premium interfaces build trust and reduce friction. We believe the experience of using a tool shapes the quality of insight you extract from it.",
  },
  {
    icon: "⊕",
    title: "Radical Transparency",
    desc: "We show our work. Every simulation comes with full methodology documentation and data lineage tracing.",
  },
];

export default function AboutPage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", overflowX: "hidden" }}>
      <style jsx>{`
        .about-hero-shell {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 140px 4vw 96px;
          overflow: hidden;
        }
        .about-hero-title {
          font-family: var(--heading);
          font-size: clamp(56px, 7vw, 94px);
          font-weight: 800;
          line-height: 0.94;
          letter-spacing: -0.05em;
          color: var(--bright);
          margin: 0;
        }
        .about-hero-title .accent {
          background: linear-gradient(135deg, var(--accent) 0%, #2a76ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .about-mini-card {
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.58);
          backdrop-filter: blur(18px);
          border-radius: 18px;
          padding: 18px 20px;
        }
        .about-panel {
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.58);
          backdrop-filter: blur(18px);
          border-radius: 24px;
          box-shadow: 0 28px 70px rgba(0, 82, 255, 0.06);
        }
        .about-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
          gap: 56px;
          align-items: center;
        }
        .about-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 34px;
        }
        .about-btn-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 34px;
        }
        .about-story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 100px;
          align-items: start;
        }
        .about-values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .about-timeline-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          position: relative;
        }
        @media (max-width: 1024px) {
          .about-hero-grid {
            grid-template-columns: 1fr;
          }
          .about-values-grid {
            grid-template-columns: 1fr 1fr;
          }
          .about-timeline-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 768px) {
          .about-hero-shell {
            min-height: auto;
            padding: 100px 5vw 64px;
          }
          .about-hero-title {
            font-size: clamp(40px, 12vw, 64px);
          }
          .about-stat-grid {
            grid-template-columns: 1fr 1fr;
          }
          .about-btn-row {
            flex-direction: column;
          }
          .about-btn-row a {
            text-align: center;
            justify-content: center;
          }
          .about-story-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .about-values-grid {
            grid-template-columns: 1fr;
          }
          .about-timeline-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .about-hero-shell {
            padding: 90px 5vw 56px;
          }
          .about-hero-title {
            font-size: clamp(36px, 13vw, 56px);
          }
          .about-stat-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ── Hero ── */}
      <section className="about-hero-shell">
        <Squares
          direction="diagonal"
          speed={0.25}
          squareSize={40}
          borderColor="rgba(0, 82, 255, 0.03)"
          hoverFillColor="rgba(0, 82, 255, 0.06)"
        />
        <div style={{ position: "absolute", top: "8%", right: "-12%", width: "32vw", height: "32vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 82, 255, 0.08) 0%, rgba(0, 82, 255, 0.03) 40%, transparent 72%)", filter: "blur(84px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "42%", left: "-12%", width: "30vw", height: "30vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 82, 255, 0.05) 0%, rgba(0, 82, 255, 0.02) 42%, transparent 72%)", filter: "blur(84px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1400, margin: "0 auto" }}>
          <div className="about-hero-grid">
            <div>
              <span className="mkt-eyebrow">[LUCIDE_TECH_MANIFESTO_v1.0]</span>
              <h1 className="about-hero-title" style={{ marginTop: 18, maxWidth: 780 }}>
                Design <span className="accent">First.</span>
                <br />
                <span style={{ color: "var(--bright)" }}>Engineered Always.</span>
              </h1>
              <p style={{ maxWidth: 560, color: "var(--muted)", fontSize: 18, lineHeight: 1.75, marginTop: 26 }}>
                Lucide Tech sits at the intersection of aesthetic clarity and hard engineering.
                We build digital experiences that feel premium, load fast, and actually help people make decisions.
              </p>

              <div className="about-stat-grid">
                {[
                  { label: "ESTABLISHED", value: "2024 // DXB", note: "Studio roots" },
                  { label: "FOCUS", value: "HIGH_FIDELITY", note: "Design and system quality" },
                  { label: "APPROACH", value: "SELECTIVE", note: "Boutique execution" },
                ].map((item) => (
                  <div key={item.label} className="about-mini-card">
                    <span className="mkt-eyebrow" style={{ marginBottom: 10 }}>{item.label}</span>
                    <div style={{ fontFamily: "var(--heading)", fontSize: "clamp(20px, 2vw, 28px)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--bright)", lineHeight: 1 }}>{item.value}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", color: "var(--accent)", marginTop: 8, textTransform: "uppercase" }}>{item.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-panel" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span style={{ display: "inline-flex", alignItems: "center", padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(0, 82, 255, 0.12)", background: "rgba(0, 82, 255, 0.04)", color: "var(--accent)", fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em" }}>// STUDIO_VALUES</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.16em" }}>OPERATING_MODE // ACTIVE</span>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  ["Fidelity Over Speed", "We optimize for clarity and robust behavior, not shortcuts."],
                  ["Design Meets Science", "The interface is part of the product, not decoration."],
                  ["Radical Transparency", "Methodology and data lineage are always visible."],
                ].map(([title, desc], idx) => (
                  <div key={title} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "14px 16px", borderRadius: 16, border: "1px solid rgba(0, 82, 255, 0.08)", background: idx === 0 ? "rgba(0, 82, 255, 0.05)" : "rgba(255,255,255,0.45)" }}>
                    <div>
                      <div style={{ fontFamily: "var(--heading)", fontSize: 16, fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.03em" }}>{title}</div>
                      <div style={{ marginTop: 4, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{desc}</div>
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.16em", color: "var(--accent)", paddingTop: 2 }}>0{idx + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Story Section ── */}
      <section style={{ padding: "100px 4vw", borderTop: "1px solid var(--border)", background: "var(--bg-darker)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }} className="about-story-grid">
          <div>
            <span className="mkt-eyebrow">[THE_STORY]</span>
            <h2 className="mkt-h2" style={{ marginTop: 16, textAlign: "left" }}>
              Why We
              <br />
              <span style={{ color: "var(--accent)" }}>Built This.</span>
            </h2>
            <p style={{ color: "var(--text)", fontSize: "17px", lineHeight: 1.8, marginBottom: "24px", marginTop: "24px" }}>
              The market is saturated with &quot;good enough.&quot; Generic templates,
              sluggish performance, and forgettable design have become the norm.
            </p>
            <p style={{ color: "var(--muted)", fontSize: "17px", lineHeight: 1.8 }}>
              Lucide Tech was born to bridge the gap between academic rigor and
              real-world strategic application. We believe that how a product{" "}
              <em style={{ color: "var(--text)" }}>feels</em> is as important
              as how it functions. A premium interface builds trust, reduces
              friction, and commands attention.
            </p>
          </div>

          {/* Capabilities card */}
          <div style={{ padding: "48px", border: "1px solid var(--border)", borderRadius: "20px", background: "rgba(255,255,255,0.5)", backdropFilter: "blur(18px)", position: "relative", boxShadow: "0 28px 70px rgba(0, 82, 255, 0.04)" }}>
            <div style={{ position: "absolute", top: -1, left: -1, width: 20, height: 20, borderTop: "1px solid var(--accent)", borderLeft: "1px solid var(--accent)" }} />
            <div style={{ position: "absolute", bottom: -1, right: -1, width: 20, height: 20, borderBottom: "1px solid var(--accent)", borderRight: "1px solid var(--accent)" }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--accent)", letterSpacing: "0.2em", display: "block", marginBottom: "32px" }}>
              [STUDIO_CAPABILITIES]
            </span>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { num: "01", title: "BEHAVIORAL_SIMULATION", desc: "Production-grade multi-agent systems grounded in real sociometric data." },
                { num: "02", title: "NEXT_JS_ENGINEERING", desc: "Server-side performance meets client-side fluidity. Zero-compromise UX." },
                { num: "03", title: "INTELLIGENT_SYSTEMS", desc: "Integrating LLMs, graph algorithms, and AI inference layers." },
              ].map((c, i) => (
                <li key={i} style={{ borderBottom: i < 2 ? "1px solid var(--border)" : "none", paddingBottom: i < 2 ? "20px" : 0 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--accent)", display: "block", marginBottom: "8px" }}>{c.num}</span>
                  <strong style={{ display: "block", color: "var(--bright)", fontSize: "15px", fontFamily: "var(--mono)", marginBottom: "6px", letterSpacing: "0.05em" }}>{c.title}</strong>
                  <span style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6 }}>{c.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Studio Values ── */}
      <section className="mkt-section">
        <div className="mkt-section-header">
          <span className="mkt-eyebrow">[OPERATING_PRINCIPLES]</span>
          <h2 className="mkt-h2">
            What We
            <br />
            Believe In.
          </h2>
        </div>
        <div className="about-values-grid">
          {VALUES.map((v, i) => (
            <div
              key={i}
              style={{
                padding: "36px 28px",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.55)",
                backdropFilter: "blur(14px)",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 32px rgba(0, 82, 255, 0.03)",
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(0, 82, 255, 0.06)", border: "1px solid rgba(0, 82, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 20, color: "var(--accent)" }}>
                {v.icon}
              </div>
              <h3 style={{ fontFamily: "var(--heading)", fontSize: "18px", fontWeight: 700, color: "var(--bright)", letterSpacing: "-0.02em", marginBottom: "12px" }}>
                {v.title}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Timeline ── */}
      <section style={{ padding: "80px 4vw 120px", background: "var(--bg-darker)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div className="mkt-section-header">
            <span className="mkt-eyebrow">[PRODUCT_TIMELINE]</span>
            <h2 className="mkt-h2">From Zero to Platform.</h2>
          </div>
          <div className="about-timeline-grid">
            <div style={{ position: "absolute", top: 22, left: "12.5%", right: "12.5%", height: 1, background: "linear-gradient(90deg, transparent, var(--border) 10%, var(--border) 90%, transparent)" }} />
            {MILESTONES.map((m, i) => (
              <div key={i} style={{ padding: "0 24px 40px", position: "relative", zIndex: 1 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-darker)", border: "1px solid rgba(0, 82, 255, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 0 18px rgba(0, 82, 255, 0.12)" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)", display: "block" }} />
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--accent)", letterSpacing: "0.15em", display: "block", marginBottom: "8px" }}>{m.year}</span>
                <h3 style={{ fontFamily: "var(--heading)", fontSize: "16px", fontWeight: 700, color: "var(--bright)", marginBottom: "10px", letterSpacing: "-0.02em" }}>{m.title}</h3>
                <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.65 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section style={{ padding: "120px 4vw", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", textAlign: "center", position: "relative" }}>
        <span style={{ fontSize: "100px", color: "var(--accent)", opacity: 0.08, position: "absolute", top: "80px", left: "50%", transform: "translateX(-50%)", fontFamily: "Georgia, serif", lineHeight: 1, userSelect: "none" }}>
          &quot;
        </span>
        <blockquote style={{ maxWidth: 800, margin: "0 auto", fontSize: "clamp(20px, 2.5vw, 30px)", lineHeight: 1.45, color: "var(--bright)", letterSpacing: "-0.01em", fontStyle: "italic", marginBottom: "40px", position: "relative", fontFamily: "var(--sans)" }}>
          &ldquo;We don&apos;t build software. We craft digital artifacts for brands that refuse to blend in.&rdquo;
        </blockquote>
        <span style={{ fontFamily: "var(--mono)", color: "var(--accent)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em" }}>
          [LUCIDE_TECH_TEAM]
        </span>
      </section>

      {/* ── CTA ── */}
      <div className="pricing-cta-banner">
        <span className="mkt-eyebrow">[START_EXPERIMENTING]</span>
        <h2 className="pricing-cta-title">
          Ready to
          <br />
          <span style={{ color: "var(--accent)" }}>Experiment?</span>
        </h2>
        <p className="pricing-cta-sub">
          Build your first simulation free. No credit card required.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" className="btn-hero-primary">
            START FREE SIMULATION →
          </Link>
          <Link href="/contact" className="btn-hero-ghost">
            STUDIO INQUIRY
          </Link>
        </div>
      </div>
    </div>
  );
}
