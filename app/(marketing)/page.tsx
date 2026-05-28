"use client";

import Link from "next/link";
import { useEffect } from "react";
import { InlineLogin } from "@/components/marketing/InlineLogin";
import { HeroNetwork3D } from "@/components/marketing/HeroNetwork3D";
import { AnimatedCounter } from "@/components/marketing/AnimatedCounter";
import { GlowCard } from "@/components/marketing/GlowCard";
import { ScrambleText } from "@/components/marketing/ScrambleText";

/* ─────────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: "⬡",
    tag: "CORE_ENGINE",
    title: "Behavioral Vector Modeling",
    desc: "1,499 real GSS respondents become living mathematical distributions — trust, risk aversion, social conformity, and economic outlook encoded as high-dimensional vectors.",
  },
  {
    icon: "◎",
    tag: "NETWORK_DYNAMICS",
    title: "Social Cascade Simulation",
    desc: "Simulate how influence propagates through Watts-Strogatz small-world networks. Find structural bottlenecks before they cost you.",
  },
  {
    icon: "⊕",
    tag: "INTELLIGENCE",
    title: "LLM-Powered Agent Reasoning",
    desc: "Every agent uses state-of-the-art language model reasoning to decide — based on their unique sociological profile — whether to adopt, resist, or propagate.",
  },
  {
    icon: "▣",
    tag: "STRATEGY",
    title: "Parallel Scenario Testing",
    desc: "Run thousands of simulation variants in parallel. Find the optimal message, channel, and sequencing before real-world commitment.",
  },
  {
    icon: "◈",
    tag: "ANALYSIS",
    title: "Tipping Point Detection",
    desc: "Non-linear phenomena — the exact moment a local trend becomes global — identified and reported with supporting graph-theoretic metrics.",
  },
  {
    icon: "⊞",
    tag: "EXPORT",
    title: "Behavioral Intelligence Reports",
    desc: "Full-spectrum reports: adoption curves, influence maps, persona breakdowns, and bottleneck analysis — all exportable.",
  },
];

const HOW_STEPS = [
  {
    num: "01",
    tag: "SYNTHESIZE",
    title: "Define Your Narrative",
    desc: "Input your strategic decision, product launch, or policy. We synthesize a representative population from verified sociometric data.",
  },
  {
    num: "02",
    tag: "INITIALIZE",
    title: "Map Behavioral Vectors",
    desc: "Each agent receives a unique psychological profile: trust levels, risk aversion, budget sensitivity, and social influence radius.",
  },
  {
    num: "03",
    tag: "SIMULATE",
    title: "Run the Cascade",
    desc: "Agents negotiate, deliberate, and decide across a social graph. Watch adoption spread, stall, and tipping points emerge in real time.",
  },
  {
    num: "04",
    tag: "ANALYZE",
    title: "Extract Intelligence",
    desc: "Bottlenecks, entry points, resistor profiles, and projected adoption rates — delivered as an actionable strategic report.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "The cascade modeling fundamentally changed how we approach market entry. We saw adoption tipping points that traditional focus groups could never surface.",
    name: "Dr. A. Chen",
    role: "Director of Strategic Research",
    initials: "AC",
  },
  {
    quote:
      "I ran 500 parallel simulations before our product launch. The structural bottlenecks Strawberry identified saved us from a catastrophic messaging failure.",
    name: "M. Reeves",
    role: "Product Strategy Lead",
    initials: "MR",
  },
  {
    quote:
      "Watching agents with real behavioral profiles negotiate and resist in real time — it's like having a live preview of your target market's collective mind.",
    name: "P. Nath",
    role: "Behavioral Economist",
    initials: "PN",
  },
];
/* ─────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty(
        "--mouse-x",
        `${e.clientX}px`
      );
      document.documentElement.style.setProperty(
        "--mouse-y",
        `${e.clientY}px`
      );
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>

      {/* ══ 1. HERO ═══════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "0 4vw",
          background:
            "radial-gradient(ellipse at 75% 45%, rgba(255,107,53,0.07) 0%, transparent 52%)",
        }}
      >
        <div className="saas-hero-wrap">
          {/* ── Left: copy ── */}
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              <ScrambleText
                text="PLATFORM_v4.2 · QUANTUM_BEHAVIOR_MODEL"
                duration={800}
                revealSpeed={25}
              />
            </div>

            <h1 className="hero-h1">
              <span className="hero-dim">DECODE</span>
              <br />
              THE ARC
              <br />
              <span className="accent">OF INFLUENCE.</span>
            </h1>

            <p className="hero-sub">
              Precision agent-level simulation for strategic decision-making.
              Map adoption cascades, identify structural bottlenecks, and
              stress-test your strategy against verified sociometric data.
            </p>

            <div className="hero-ctas">
              <Link href="/setup" className="btn-hero-primary">
                LAUNCH SIMULATION →
              </Link>
              <Link href="/technology" className="btn-hero-ghost">
                HOW IT WORKS
              </Link>
            </div>

            <div className="hero-badge-strip">
              <span className="hero-badge-label">POWERED BY</span>
              <span className="hero-trust-pill pill-active">
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--green)",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                GSS 2024 DATA
              </span>
              <span className="hero-trust-pill">WATTS-STROGATZ</span>
              <span className="hero-trust-pill">LLM AGENTS</span>
            </div>
          </div>

          {/* ── Right: 3-D graph ── */}
          <div className="hero-right">
            {/* Floating pill — top-right */}
            <div
              style={{
                position: "absolute",
                top: "12%",
                right: "4%",
                background: "rgba(8,8,8,0.88)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "12px 18px",
                fontFamily: "var(--mono)",
                fontSize: "11px",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  color: "var(--muted)",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  marginBottom: "4px",
                }}
              >
                ADOPTION_RATE
              </div>
              <div
                style={{
                  color: "var(--green)",
                  fontSize: "26px",
                  fontWeight: 800,
                  fontFamily: "var(--heading)",
                  letterSpacing: "-0.04em",
                }}
              >
                64.2%
              </div>
            </div>

            {/* Floating pill — bottom-left */}
            <div
              style={{
                position: "absolute",
                bottom: "18%",
                left: "4%",
                background: "rgba(8,8,8,0.88)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "12px 18px",
                fontFamily: "var(--mono)",
                fontSize: "11px",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  color: "var(--muted)",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  marginBottom: "4px",
                }}
              >
                AGENTS_LIVE
              </div>
              <div
                style={{
                  color: "var(--orange)",
                  fontSize: "26px",
                  fontWeight: 800,
                  fontFamily: "var(--heading)",
                  letterSpacing: "-0.04em",
                }}
              >
                1,499
              </div>
            </div>

            <HeroNetwork3D />
          </div>
        </div>
      </section>

      {/* ══ 2. STATS BAR ══════════════════════════════════════════ */}
      <div className="stats-bar-new">
        <AnimatedCounter target={1499} label="Survey Respondents" />
        <AnimatedCounter
          target={64.2}
          decimals={1}
          suffix="%"
          label="Avg Adoption Rate"
        />
        <AnimatedCounter target={12} suffix="ms" label="Avg Model Latency" />
        <AnimatedCounter target={50000} label="Simulations Run" />
      </div>

      {/* ══ 3. FEATURES GRID ══════════════════════════════════════ */}
      <section className="mkt-section">
        <div className="mkt-section-header">
          <span className="mkt-eyebrow">[CAPABILITIES]</span>
          <h2 className="mkt-h2">
            Engineered for
            <br />
            Precision.
          </h2>
          <p className="mkt-sub">
            Every layer of Strawberry is built to replicate the actual mechanics
            of human decision-making at population scale.
          </p>
        </div>
        <div className="features-grid-3">
          {FEATURES.map((f, i) => (
            <GlowCard key={i}>
              <div className="feature-icon-wrap">{f.icon}</div>
              <span className="feature-card-tag">// {f.tag}</span>
              <h3 className="feature-card-title">{f.title}</h3>
              <p className="feature-card-desc">{f.desc}</p>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* ══ 4. HOW IT WORKS ═══════════════════════════════════════ */}
      <div className="how-section-bg">
        <div className="mkt-section">
          <div className="mkt-section-header">
            <span className="mkt-eyebrow">[METHODOLOGY]</span>
            <h2 className="mkt-h2">
              Four Steps to
              <br />
              Clarity.
            </h2>
          </div>
          <div className="how-steps">
            {HOW_STEPS.map((step, i) => (
              <div key={i} className="how-step">
                <div className="how-step-num">{step.num}</div>
                <span className="how-step-tag">{step.tag}</span>
                <h3 className="how-step-title">{step.title}</h3>
                <p className="how-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ 5. TESTIMONIALS ═══════════════════════════════════════ */}
      <section className="mkt-section">
        <div className="mkt-section-header">
          <span className="mkt-eyebrow">[FIELD_REPORTS]</span>
          <h2 className="mkt-h2">
            From the
            <br />
            Command Line.
          </h2>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <p className="testimonial-quote">{t.quote}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 6. PRICING CTA ════════════════════════════════════════ */}
      <div className="pricing-cta-banner">
        <span className="mkt-eyebrow">[COMMERCIAL_ACCESS]</span>
        <h2 className="pricing-cta-title">
          Start Free.
          <br />
          Scale When Ready.
        </h2>
        <p className="pricing-cta-sub">
          From solo researchers to enterprise strategy teams — a tier built
          for every scale of decision.
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
            START FREE →
          </Link>
          <Link href="/pricing" className="btn-hero-ghost">
            VIEW PRICING
          </Link>
        </div>
      </div>

      {/* ══ 7. LOGIN SECTION ══════════════════════════════════════ */}
      <section className="mkt-section">
        <div className="home-login-section">
          <div className="login-form-hook">
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                color: "var(--orange)",
                letterSpacing: "0.18em",
              }}
            >
              [AUTHENTICATION_GATE]
            </span>
            <h2
              style={{
                fontFamily: "var(--heading)",
                fontSize: "clamp(28px, 3.5vw, 44px)",
                color: "var(--bright)",
                letterSpacing: "-0.04em",
                fontWeight: 800,
                lineHeight: 1.05,
              }}
            >
              ACCESS THE
              <br />
              COMMAND CENTER.
            </h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "15px",
                lineHeight: 1.65,
                maxWidth: 400,
              }}
            >
              Log in to your private workspace to manage experiments, analyze
              results, and export behavioral intelligence reports.
            </p>
            <div style={{ marginTop: "24px" }}>
              <Link
                href="/technology"
                style={{
                  color: "var(--muted)",
                  fontSize: "11px",
                  textDecoration: "none",
                  fontFamily: "var(--mono)",
                  letterSpacing: "0.08em",
                }}
              >
                LEARN MORE ABOUT ENCRYPTION →
              </Link>
            </div>
          </div>
          <InlineLogin />
        </div>
      </section>
    </div>
  );
}
