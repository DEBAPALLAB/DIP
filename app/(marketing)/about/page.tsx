"use client";

import React from "react";
import Link from "next/link";

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
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "160px 4vw 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 40%, rgba(255,107,53,0.06), transparent 55%)",
            pointerEvents: "none",
          }}
        />

        <span
          className="mkt-eyebrow"
          style={{ letterSpacing: "0.5em", opacity: 0.7 }}
        >
          [LUCIDE_TECH_MANIFESTO_v1.0]
        </span>

        <h1
          className="hero-h1"
          style={{ marginTop: 24, maxWidth: 900, textAlign: "center" }}
        >
          Design <span className="accent">First.</span>
          <br />
          <span className="hero-dim">Engineered Always.</span>
        </h1>

        <p
          style={{
            color: "var(--muted)",
            maxWidth: "780px",
            margin: "24px auto 60px",
            lineHeight: 1.75,
            fontSize: "18px",
            letterSpacing: "-0.01em",
          }}
        >
          Lucide Tech is a boutique digital product studio. We operate at the
          intersection of aesthetic luxury and hard-core engineering. We don't
          just build tools; we craft digital experiences that feel premium and
          drive outcomes.
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "80px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "ESTABLISHED", val: "2024 // DXB" },
            { label: "FOCUS", val: "HIGH_FIDELITY" },
            { label: "APPROACH", val: "SELECTIVE" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--mono)",
                  fontSize: "9px",
                  color: "var(--orange)",
                  letterSpacing: "0.2em",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                {s.label}
              </span>
              <span
                style={{
                  fontFamily: "var(--heading)",
                  fontSize: "22px",
                  color: "var(--bright)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                {s.val}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Story Section ─────────────────────────────────────────── */}
      <section
        style={{
          padding: "120px 4vw",
          borderTop: "1px solid var(--border)",
          background: "var(--bg-darker)",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "100px",
            alignItems: "start",
          }}
        >
          <div>
            <span className="mkt-eyebrow">[THE_STORY]</span>
            <h2
              className="mkt-h2"
              style={{ marginTop: 16, textAlign: "left" }}
            >
              Why We
              <br />
              <span style={{ color: "var(--orange)" }}>Built This.</span>
            </h2>
            <p
              style={{
                color: "var(--text)",
                fontSize: "17px",
                lineHeight: 1.8,
                marginBottom: "24px",
                marginTop: "24px",
              }}
            >
              The market is saturated with &quot;good enough.&quot; Generic templates,
              sluggish performance, and forgettable design have become the norm.
            </p>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "17px",
                lineHeight: 1.8,
              }}
            >
              Lucide Tech was born to bridge the gap between academic rigor and
              real-world strategic application. We believe that how a product{" "}
              <em style={{ color: "var(--text)" }}>feels</em> is as important
              as how it functions. A premium interface builds trust, reduces
              friction, and commands attention.
            </p>
          </div>

          {/* Capabilities card */}
          <div
            style={{
              padding: "48px",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
              position: "relative",
            }}
          >
            {/* Corner decorations */}
            <div
              style={{
                position: "absolute",
                top: -1,
                left: -1,
                width: 20,
                height: 20,
                borderTop: "1px solid var(--orange)",
                borderLeft: "1px solid var(--orange)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -1,
                right: -1,
                width: 20,
                height: 20,
                borderBottom: "1px solid var(--orange)",
                borderRight: "1px solid var(--orange)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "9px",
                color: "var(--orange)",
                letterSpacing: "0.2em",
                display: "block",
                marginBottom: "32px",
              }}
            >
              [STUDIO_CAPABILITIES]
            </span>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { num: "01", title: "BEHAVIORAL_SIMULATION", desc: "Production-grade multi-agent systems grounded in real sociometric data." },
                { num: "02", title: "NEXT_JS_ENGINEERING", desc: "Server-side performance meets client-side fluidity. Zero-compromise UX." },
                { num: "03", title: "INTELLIGENT_SYSTEMS", desc: "Integrating LLMs, graph algorithms, and AI inference layers." },
              ].map((c, i) => (
                <li
                  key={i}
                  style={{
                    borderBottom: i < 2 ? "1px solid var(--border)" : "none",
                    paddingBottom: i < 2 ? "20px" : 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--orange)",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    {c.num}
                  </span>
                  <strong
                    style={{
                      display: "block",
                      color: "var(--bright)",
                      fontSize: "15px",
                      fontFamily: "var(--mono)",
                      marginBottom: "6px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {c.title}
                  </strong>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {c.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Studio Values ─────────────────────────────────────────── */}
      <section className="mkt-section">
        <div className="mkt-section-header">
          <span className="mkt-eyebrow">[OPERATING_PRINCIPLES]</span>
          <h2 className="mkt-h2">
            What We
            <br />
            Believe In.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
        >
          {VALUES.map((v, i) => (
            <div
              key={i}
              style={{
                padding: "36px 28px",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "rgba(255,107,53,0.1)",
                  border: "1px solid rgba(255,107,53,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  marginBottom: 20,
                }}
              >
                {v.icon}
              </div>
              <h3
                style={{
                  fontFamily: "var(--heading)",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--bright)",
                  letterSpacing: "-0.02em",
                  marginBottom: "12px",
                }}
              >
                {v.title}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.7 }}>
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 4vw 120px",
          background: "var(--bg-darker)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div className="mkt-section-header">
            <span className="mkt-eyebrow">[PRODUCT_TIMELINE]</span>
            <h2 className="mkt-h2">From Zero to Platform.</h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 22,
                left: "12.5%",
                right: "12.5%",
                height: 1,
                background: "linear-gradient(90deg, transparent, var(--border) 10%, var(--border) 90%, transparent)",
              }}
            />
            {MILESTONES.map((m, i) => (
              <div
                key={i}
                style={{
                  padding: "0 24px 40px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "var(--bg-darker)",
                    border: "1px solid var(--orange)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 24,
                    boxShadow: "0 0 16px rgba(255,107,53,0.2)",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "var(--orange)",
                      display: "block",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "9px",
                    color: "var(--orange)",
                    letterSpacing: "0.15em",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  {m.year}
                </span>
                <h3
                  style={{
                    fontFamily: "var(--heading)",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--bright)",
                    marginBottom: "10px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {m.title}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--muted)",
                    lineHeight: 1.65,
                  }}
                >
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote ─────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "120px 4vw",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          textAlign: "center",
          position: "relative",
        }}
      >
        <span
          style={{
            fontSize: "100px",
            color: "var(--orange)",
            opacity: 0.12,
            position: "absolute",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "Georgia, serif",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          "
        </span>
        <blockquote
          style={{
            maxWidth: 800,
            margin: "0 auto",
            fontSize: "clamp(20px, 2.5vw, 30px)",
            lineHeight: 1.45,
            color: "var(--bright)",
            letterSpacing: "-0.01em",
            fontStyle: "italic",
            marginBottom: "40px",
            position: "relative",
            fontFamily: "var(--sans)",
          }}
        >
          &ldquo;We don&apos;t build software. We craft digital artifacts for brands
          that refuse to blend in.&rdquo;
        </blockquote>
        <span
          style={{
            fontFamily: "var(--mono)",
            color: "var(--orange)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.2em",
          }}
        >
          [LUCIDE_TECH_TEAM]
        </span>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <div className="pricing-cta-banner">
        <span className="mkt-eyebrow">[START_EXPERIMENTING]</span>
        <h2 className="pricing-cta-title">
          Ready to
          <br />
          <span style={{ color: "var(--orange)" }}>Experiment?</span>
        </h2>
        <p className="pricing-cta-sub">
          Build your first simulation free. No credit card required.
        </p>
        <div
          style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
        >
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
