"use client";

import Link from "next/link";
import { GlowCard } from "@/components/marketing/GlowCard";
import Squares from "@/components/marketing/InteractiveBackground";

const DEEP_FEATURES = [
  {
    icon: "⬡",
    tag: "01_CORE_ENGINE",
    title: "Behavioral Vector Modeling",
    headline: "Real people. Real data. Real decisions.",
    desc: "We ingest the General Social Survey 2024 — 1,499 verified respondents — and extract multi-dimensional behavioral vectors representing trust, risk aversion, social conformity, and economic outlook. These aren't archetypes. They're living mathematical distributions drawn from real human responses.",
    stats: [
      { val: "1,499", label: "Real respondents" },
      { val: "±2.4%", label: "Margin of error" },
      { val: "8D", label: "Behavioral dimensions" },
    ],
  },
  {
    icon: "◎",
    tag: "02_NETWORK_DYNAMICS",
    title: "Social Cascade Simulation",
    headline: "Map the exact moment local becomes global.",
    desc: "Simulations run on high-fidelity Watts-Strogatz small-world networks that model 'The Strength of Weak Ties'. We identify the structural bottlenecks where influence stalls or accelerates — giving you precise leverage points before real-world deployment.",
    stats: [
      { val: "5,000", label: "Max agents" },
      { val: "∞", label: "Network topologies" },
      { val: "0.94", label: "Convergence stability" },
    ],
  },
  {
    icon: "⊕",
    tag: "03_INTELLIGENCE",
    title: "LLM-Powered Agent Reasoning",
    headline: "Agents that think, hesitate, and resist.",
    desc: "Every agent uses state-of-the-art language model reasoning to interpret your narrative and decide — based on their unique sociological profile — whether to adopt, resist, or propagate. This produces non-deterministic, richly realistic social dynamics that statistical models cannot replicate.",
    stats: [
      { val: "GPT-4o", label: "Reasoning backbone" },
      { val: "98.2%", label: "Profile fidelity" },
      { val: "< 12ms", label: "Avg latency" },
    ],
  },
];

const ALL_FEATURES = [
  {
    icon: "▣",
    tag: "STRATEGY",
    title: "Parallel Scenario Testing",
    desc: "Run thousands of simulation variants with different strategies in parallel to find the optimal approach before committing.",
  },
  {
    icon: "◈",
    tag: "ANALYSIS",
    title: "Tipping Point Detection",
    desc: "Identify exact cascade thresholds with graph-theoretic precision. Know where influence stalls before it costs you.",
  },
  {
    icon: "⊞",
    tag: "EXPORT",
    title: "Behavioral Intelligence Reports",
    desc: "Full exportable output: adoption curves, influence maps, persona breakdowns, and bottleneck analysis.",
  },
  {
    icon: "⬔",
    tag: "SEGMENTATION",
    title: "Population Filtering",
    desc: "Slice populations by persona archetype, trust cluster, economic tier, or any behavioral dimension.",
  },
  {
    icon: "⊗",
    tag: "API",
    title: "Programmatic Access",
    desc: "Trigger simulations, receive results via webhook, and pipeline data directly into your analytics stack.",
  },
  {
    icon: "◉",
    tag: "SECURITY",
    title: "Encrypted Workspaces",
    desc: "All simulation data encrypted at rest and in transit. Role-based access controls and audit logs.",
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "72vh",
          display: "flex",
          alignItems: "center",
          padding: "160px 4vw 100px",
          overflow: "hidden",
        }}
      >
        <Squares
          direction="diagonal"
          speed={0.25}
          squareSize={40}
          borderColor="rgba(255,107,53,0.05)"
          hoverFillColor="rgba(255,107,53,0.08)"
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1400,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <span className="mkt-eyebrow">[PRODUCT_CAPABILITIES]</span>
          <h1
            className="hero-h1"
            style={{ marginTop: 20, maxWidth: 760 }}
          >
            Engineered for
            <br />
            <span className="accent">Precision.</span>
          </h1>
          <p className="hero-sub">
            Strawberry provides a level of granularity in social simulation
            never before accessible outside academic research. By combining real
            behavioral data with modern LLM reasoning, we map the latent
            landscape of public opinion.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link href="/setup" className="btn-hero-primary">
              START SIMULATING →
            </Link>
            <Link href="/technology" className="btn-hero-ghost">
              SEE THE TECHNOLOGY
            </Link>
          </div>
        </div>
      </section>

      {/* ── Deep Feature Sections ─────────────────────────────────── */}
      {DEEP_FEATURES.map((f, i) => (
        <section
          key={i}
          style={{
            padding: "120px 4vw",
            background: i % 2 === 1 ? "var(--bg-darker)" : "var(--bg)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              maxWidth: 1400,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "80px",
              alignItems: "center",
            }}
          >
            {/* Text */}
            <div style={{ order: i % 2 === 1 ? 1 : 0 }}>
              <span className="mkt-eyebrow">// {f.tag}</span>
              <h2
                style={{
                  fontFamily: "var(--heading)",
                  fontSize: "clamp(28px, 3.5vw, 48px)",
                  fontWeight: 800,
                  color: "var(--bright)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.05,
                  margin: "16px 0 16px",
                }}
              >
                {f.title}
              </h2>
              <p
                style={{
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 16,
                  lineHeight: 1.5,
                }}
              >
                {f.headline}
              </p>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "15px",
                  lineHeight: 1.8,
                }}
              >
                {f.desc}
              </p>
            </div>

            {/* Stats card */}
            <div style={{ order: i % 2 === 1 ? 0 : 1 }}>
              <div
                style={{
                  padding: "48px",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Top accent line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 1,
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,107,53,0.5), transparent)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "9px",
                    color: "var(--orange)",
                    letterSpacing: "0.2em",
                    display: "block",
                    marginBottom: "36px",
                  }}
                >
                  {f.icon} {f.tag}
                </span>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "24px",
                  }}
                >
                  {f.stats.map((s, si) => (
                    <div key={si}>
                      <div
                        style={{
                          fontFamily: "var(--heading)",
                          fontSize: "34px",
                          fontWeight: 800,
                          color: "var(--bright)",
                          letterSpacing: "-0.04em",
                          marginBottom: "8px",
                        }}
                      >
                        {s.val}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "9px",
                          color: "var(--muted)",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ── All Features Grid ─────────────────────────────────────── */}
      <section
        className="mkt-section"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="mkt-section-header">
          <span className="mkt-eyebrow">[FULL_FEATURE_SET]</span>
          <h2 className="mkt-h2">
            Everything in
            <br />
            the Engine.
          </h2>
        </div>
        <div className="features-grid-3">
          {ALL_FEATURES.map((f, i) => (
            <GlowCard key={i}>
              <div className="feature-icon-wrap">{f.icon}</div>
              <span className="feature-card-tag">// {f.tag}</span>
              <h3 className="feature-card-title">{f.title}</h3>
              <p className="feature-card-desc">{f.desc}</p>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <div className="pricing-cta-banner">
        <span className="mkt-eyebrow">[GET_STARTED]</span>
        <h2 className="pricing-cta-title">
          Ready to Run Your
          <br />
          First Simulation?
        </h2>
        <p className="pricing-cta-sub">
          Start free. No credit card. Up to 100 agents on the Explorer tier.
        </p>
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/register" className="btn-hero-primary">
            CREATE FREE ACCOUNT →
          </Link>
          <Link href="/pricing" className="btn-hero-ghost">
            VIEW PRICING
          </Link>
        </div>
      </div>
    </div>
  );
}
