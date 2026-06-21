"use client";

import Link from "next/link";
import { GlowCard } from "@/components/marketing/GlowCard";
import Squares from "@/components/marketing/InteractiveBackground";

const DEEP_FEATURES = [
  {
    icon: "◼",
    tag: "01_CORE_ENGINE",
    title: "Behavioral Vector Modeling",
    headline: "Real people. Real data. Real decisions.",
    desc: "We ingest the General Social Survey 2024 and extract multi-dimensional behavioral vectors representing trust, risk aversion, social conformity, and economic outlook. These are living distributions drawn from real human responses.",
    stats: [
      { val: "1,499", label: "Real respondents" },
      { val: "±2.4%", label: "Margin of error" },
      { val: "8D", label: "Behavioral dimensions" },
    ],
  },
  {
    icon: "◉",
    tag: "02_NETWORK_DYNAMICS",
    title: "Social Cascade Simulation",
    headline: "Map the exact moment local becomes global.",
    desc: "Simulations run on high-fidelity Watts-Strogatz small-world networks that model the strength of weak ties. We identify the structural bottlenecks where influence stalls or accelerates before real-world deployment.",
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
    desc: "Every agent uses language-model reasoning to interpret your narrative and decide, based on their sociological profile, whether to adopt, resist, or propagate. The result is realistic social dynamics that statistical models cannot replicate.",
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
    icon: "◇",
    tag: "ANALYSIS",
    title: "Tipping Point Detection",
    desc: "Identify exact cascade thresholds with graph-theoretic precision. Know where influence stalls before it costs you.",
  },
  {
    icon: "⊞",
    tag: "EXPORT",
    title: "Behavioral Intelligence Reports",
    desc: "Export adoption curves, influence maps, persona breakdowns, and bottleneck analysis as shareable artifacts.",
  },
  {
    icon: "⬚",
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
    desc: "All simulation data is encrypted at rest and in transit. Role-based access controls and audit logs included.",
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", overflowX: "hidden" }}>
      <style jsx>{`
        .feature-hero-shell {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 140px 4vw 96px;
          overflow: hidden;
        }
        .feature-hero-title {
          font-family: var(--heading);
          font-size: clamp(56px, 7vw, 94px);
          font-weight: 800;
          line-height: 0.94;
          letter-spacing: -0.05em;
          color: var(--bright);
          margin: 0;
        }
        .feature-hero-title .accent {
          background: linear-gradient(135deg, var(--accent) 0%, #2a76ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 40px rgba(0, 82, 255, 0.12);
        }
        .feature-hero-copy {
          max-width: 650px;
          color: var(--muted);
          font-size: 18px;
          line-height: 1.7;
          margin: 0;
        }
        .feature-stat {
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.56);
          backdrop-filter: blur(18px);
          border-radius: 18px;
          padding: 18px 20px;
          box-shadow: 0 22px 56px rgba(0, 82, 255, 0.05);
        }
        .feature-stat-label {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--muted);
          display: block;
          margin-bottom: 10px;
        }
        .feature-stat-value {
          font-family: var(--heading);
          font-size: clamp(22px, 2vw, 32px);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--bright);
          line-height: 1;
        }
        .feature-stat-note {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--accent);
          margin-top: 8px;
          text-transform: uppercase;
        }
        .feature-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
          gap: 56px;
          align-items: center;
        }
        .feature-mini-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 34px;
        }
        .feature-btn-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 34px;
        }
        .feature-deep-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }
        .feature-deep-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .feature-hero-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .feature-hero-shell {
            min-height: auto;
            padding: 100px 5vw 64px;
          }
          .feature-hero-title {
            font-size: clamp(40px, 12vw, 64px);
          }
          .feature-hero-copy {
            font-size: 16px;
          }
          .feature-mini-stat-grid {
            grid-template-columns: 1fr 1fr;
          }
          .feature-btn-row {
            flex-direction: column;
          }
          .feature-btn-row a {
            text-align: center;
            justify-content: center;
          }
          .feature-deep-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .feature-deep-stats {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 480px) {
          .feature-hero-shell {
            padding: 90px 5vw 56px;
          }
          .feature-hero-title {
            font-size: clamp(36px, 13vw, 56px);
          }
          .feature-mini-stat-grid {
            grid-template-columns: 1fr;
          }
          .feature-deep-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="feature-hero-shell">
        <Squares direction="diagonal" speed={0.25} squareSize={40} borderColor="rgba(0, 82, 255, 0.03)" hoverFillColor="rgba(0, 82, 255, 0.06)" />
        <div style={{ position: "absolute", top: "8%", right: "-10%", width: "32vw", height: "32vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 82, 255, 0.08) 0%, rgba(0, 82, 255, 0.03) 38%, transparent 72%)", filter: "blur(84px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "48%", left: "-12%", width: "30vw", height: "30vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 82, 255, 0.05) 0%, rgba(0, 82, 255, 0.02) 40%, transparent 72%)", filter: "blur(84px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1400, margin: "0 auto" }}>
          <div className="feature-hero-grid">
            <div>
              <span className="mkt-eyebrow">[PRODUCT_CAPABILITIES]</span>
              <h1 className="feature-hero-title" style={{ marginTop: 18, maxWidth: 760 }}>
                Engineered for
                <br />
                <span className="accent">Precision.</span>
              </h1>
              <p className="feature-hero-copy" style={{ marginTop: 26 }}>
                Notaprompt turns strategic ideas into measurable simulation runs.
                Compare adoption paths, isolate tipping points, and inspect the
                agent-level behaviors that drive outcomes before you commit.
              </p>

              <div className="feature-btn-row">
                <Link href="/setup" className="btn-hero-primary">START SIMULATING →</Link>
                <Link href="/technology" className="btn-hero-ghost">SEE THE TECHNOLOGY</Link>
              </div>

              <div className="feature-mini-stat-grid">
                <div className="feature-stat">
                  <span className="feature-stat-label">NETWORKS</span>
                  <div className="feature-stat-value">Small-world</div>
                  <div className="feature-stat-note">Topological cascade modeling</div>
                </div>
                <div className="feature-stat">
                  <span className="feature-stat-label">DATA</span>
                  <div className="feature-stat-value">1,499</div>
                  <div className="feature-stat-note">Verified respondent vectors</div>
                </div>
                <div className="feature-stat">
                  <span className="feature-stat-label">OUTPUT</span>
                  <div className="feature-stat-value">Reports</div>
                  <div className="feature-stat-note">Adoption, resistance, bottlenecks</div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ padding: 24, border: "1px solid var(--border)", borderRadius: 24, background: "rgba(255, 255, 255, 0.58)", backdropFilter: "blur(18px)", boxShadow: "0 28px 70px rgba(0, 82, 255, 0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", color: "var(--accent)" }}>// FEATURE_MAP</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", color: "var(--muted)" }}>LIVE_PREVIEW</span>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {[
                    ["Behavioral vectors", "Real respondent distributions"],
                    ["Cascade simulation", "Small-world propagation graph"],
                    ["Agent reasoning", "LLM-backed local decisions"],
                    ["Telemetry output", "Shareable insight artifacts"],
                  ].map(([title, desc], idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        padding: "14px 16px",
                        borderRadius: 16,
                        border: "1px solid rgba(0, 82, 255, 0.08)",
                        background: idx === 1 ? "rgba(0, 82, 255, 0.05)" : "rgba(255,255,255,0.45)",
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: "var(--heading)", fontSize: 15, fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.03em" }}>{title}</div>
                        <div style={{ marginTop: 4, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{desc}</div>
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.16em", color: "var(--accent)", paddingTop: 2, flexShrink: 0 }}>
                        0{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="feature-stat">
                  <span className="feature-stat-label">MODES</span>
                  <div className="feature-stat-value">Explore</div>
                  <div className="feature-stat-note">Browse by layer</div>
                </div>
                <div className="feature-stat">
                  <span className="feature-stat-label">ACCESS</span>
                  <div className="feature-stat-value">Free</div>
                  <div className="feature-stat-note">No credit card</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mkt-section-header">
          <span className="mkt-eyebrow">[FULL_FEATURE_SET]</span>
          <h2 className="mkt-h2">Everything in<br />the Engine.</h2>
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

      {DEEP_FEATURES.map((f, i) => (
        <section
          key={i}
          style={{
            padding: "100px 4vw",
            background: i % 2 === 1 ? "var(--bg-darker)" : "var(--bg)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div className="feature-deep-grid">
            <div style={{ order: i % 2 === 1 ? 1 : 0 }}>
              <span className="mkt-eyebrow">// {f.tag}</span>
              <h2 style={{ fontFamily: "var(--heading)", fontSize: "clamp(26px, 3.5vw, 46px)", fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.04em", lineHeight: 1.05, margin: "16px 0" }}>
                {f.title}
              </h2>
              <p style={{ fontSize: "17px", fontWeight: 600, color: "var(--text)", marginBottom: 16, lineHeight: 1.5 }}>
                {f.headline}
              </p>
              <p style={{ color: "var(--muted)", fontSize: "15px", lineHeight: 1.8 }}>
                {f.desc}
              </p>
            </div>

            <div style={{ order: i % 2 === 1 ? 0 : 1 }}>
              <div style={{ padding: "40px", border: "1px solid var(--border)", borderRadius: "24px", background: "rgba(255,255,255,0.56)", backdropFilter: "blur(18px)", position: "relative", overflow: "hidden", boxShadow: "0 28px 70px rgba(0,82,255,0.06)" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(0, 82, 255, 0.4), transparent)" }} />
                <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--accent)", letterSpacing: "0.2em", display: "block", marginBottom: "32px" }}>
                  {f.icon} {f.tag}
                </span>
                <div className="feature-deep-stats">
                  {f.stats.map((s, si) => (
                    <div key={si}>
                      <div style={{ fontFamily: "var(--heading)", fontSize: "clamp(22px, 2.5vw, 34px)", fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.04em", marginBottom: "8px" }}>
                        {s.val}
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
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

      <div className="pricing-cta-banner">
        <span className="mkt-eyebrow">[GET_STARTED]</span>
        <h2 className="pricing-cta-title">
          Ready to Run Your<br />First Simulation?
        </h2>
        <p className="pricing-cta-sub">
          Start free. No credit card. Up to 100 agents on the Explorer tier.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" className="btn-hero-primary">CREATE FREE ACCOUNT →</Link>
          <Link href="/pricing" className="btn-hero-ghost">VIEW PRICING</Link>
        </div>
      </div>
    </div>
  );
}
