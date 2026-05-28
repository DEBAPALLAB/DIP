"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Squares from "@/components/marketing/InteractiveBackground";
import * as d3Force from "d3-force";

/* ─── Live Network Preview (kept from original, polished) ─────── */
function DemoNetworkGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setDimensions({ width, height });

    const simNodes = Array.from({ length: 44 }, (_, i) => ({
      id: i,
      group: Math.floor(Math.random() * 3),
      radius: 4 + Math.random() * 7,
      x: Math.random() * width,
      y: Math.random() * height,
    }));

    const simLinks = Array.from({ length: 65 }, () => ({
      source: Math.floor(Math.random() * 44),
      target: Math.floor(Math.random() * 44),
    })).filter((l) => l.source !== l.target);

    const simulation = d3Force
      .forceSimulation(simNodes as any)
      .force(
        "link",
        d3Force
          .forceLink(simLinks)
          .id((d: any) => d.id)
          .distance(50)
          .strength(0.5)
      )
      .force("charge", d3Force.forceManyBody().strength(-110))
      .force("center", d3Force.forceCenter(width / 2, height / 2))
      .force("collide", d3Force.forceCollide().radius(12))
      .on("tick", () => {
        setNodes([...simNodes]);
        setLinks([...simLinks]);
      });

    return () => {
      simulation.stop();
    };
  }, []);

  const nodeColors = ["#ff6b35", "#C8F135", "#ff4444"];

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        background: "rgba(0,0,0,0.12)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <svg width={dimensions.width} height={dimensions.height}>
        <g>
          {links.map((link: any, i) => (
            <line
              key={i}
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={0.8}
            />
          ))}
          {nodes.map((node: any) => (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill={nodeColors[node.group]}
              fillOpacity={0.65}
              stroke="var(--bg)"
              strokeWidth={1.5}
            />
          ))}
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          fontFamily: "var(--mono)",
          fontSize: "8px",
          color: "var(--muted)",
          background: "rgba(0,0,0,0.6)",
          padding: "4px 8px",
          borderRadius: 4,
          letterSpacing: "0.1em",
        }}
      >
        [LIVE_NETWORK_TOPOLOGY_PREVIEW]
      </div>
    </div>
  );
}

/* ─── Workflow Explorer ───────────────────────────────────────── */
function WorkflowExplorer() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      tag: "01_SYNTHESIZE",
      title: "PROFILE_GENERATION",
      desc: "We ingest your strategic narrative and synthesize high-resolution sociological profiles from verification data, creating a representative cross-section of your target population.",
      console: [
        "> INITIALIZING_DATA_INGESTION",
        "> SCANNING_GSS_2024_VECTOR_DISTRIBUTION...",
        "> 1,499_RECORDS_FOUND",
        "> GENERATING_VIRTUAL_COMMUNITIES...",
        "> SUCCESS: POPULATION_SYNTHESIS_COMPLETE [±2.4%_MARGIN]",
      ],
    },
    {
      tag: "02_INITIALIZE",
      title: "VECTOR_MAPPING",
      desc: "Every agent is assigned a unique behavioral vector — Trust, Risk-Aversion, and Social Conformity — derived from 1,499 real-world respondents.",
      console: [
        "> MAPPING_BEHAVIORAL_VECTORS",
        "> AGENT_402: TRUST_0.12 | RISK_AV_0.82",
        "> AGENT_119: TRUST_0.78 | RISK_AV_0.22",
        "> NORMALIZING_COGNITIVE_BIAS...",
        "> DATA_FIDELITY: 98.2%",
      ],
    },
    {
      tag: "03_SIMULATE",
      title: "DYNAMIC_CASCADES",
      desc: "The model runs the strategic input through the social graph. Agents negotiate with peers and observe clusters, revealing non-linear tipping points.",
      console: [
        "> DEPLOYING_WATTS_STROGATZ_NETWORK",
        "> ITERATION_10: SOCIAL_CONTAGION_IDLE",
        "> ITERATION_40: LOCALIZED_CASCADE_START",
        "> ITERATION_85: TIPPING_POINT_REACHED",
        "> CONVERGENCE_STABILITY: 0.94",
      ],
    },
    {
      tag: "04_ANALYZE",
      title: "STRUCTURAL_INSIGHTS",
      desc: "We extract the structural bottlenecks and tipping points, providing actionable intelligence on where your strategy will succeed or stall.",
      console: [
        "> EXTRACTING_GRAPH_METRICS",
        "> BOTTLENECK_DETECTED: CLUSTER_B_REJECTION",
        "> ADOPTION_RATE_PROJECTED: 64.2%",
        "> GENERATING_STRATEGIC_REPORT...",
        "> READY: DOWNLOAD_INSIGHTS_JSON",
      ],
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "40px",
        background: "rgba(255,255,255,0.015)",
        padding: "40px",
        border: "1px solid var(--border)",
        borderRadius: "12px",
      }}
    >
      {/* Steps list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {steps.map((step, idx) => (
          <div
            key={step.tag}
            onMouseEnter={() => setActiveStep(idx)}
            onClick={() => setActiveStep(idx)}
            style={{
              padding: "22px 24px",
              border: `1px solid ${activeStep === idx ? "var(--orange)" : "var(--border)"}`,
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background:
                activeStep === idx
                  ? "rgba(255, 107, 53, 0.04)"
                  : "transparent",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "9px",
                color:
                  activeStep === idx ? "var(--orange)" : "var(--muted)",
                letterSpacing: "0.15em",
                display: "block",
                marginBottom: "8px",
              }}
            >
              {step.tag}
            </span>
            <h3
              style={{
                color:
                  activeStep === idx ? "var(--bright)" : "var(--text)",
                fontSize: "15px",
                fontFamily: "var(--mono)",
                fontWeight: 700,
                letterSpacing: "0.04em",
                marginBottom: activeStep === idx ? "12px" : 0,
              }}
            >
              {step.title}
            </h3>
            {activeStep === idx && (
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "13px",
                  lineHeight: 1.65,
                }}
              >
                {step.desc}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Console output */}
      <div
        style={{
          background: "var(--bg-darker)",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          padding: "28px",
          fontFamily: "var(--mono)",
          fontSize: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(to right, transparent, var(--orange), transparent)",
            animation: "scanning 2.4s linear infinite",
          }}
        />
        <span
          style={{
            color: "var(--orange)",
            opacity: 0.5,
            marginBottom: "8px",
            fontSize: "9px",
            letterSpacing: "0.15em",
          }}
        >
          [SIMULATED_CONSOLE_OUTPUT]
        </span>
        {steps[activeStep].console.map((line, i) => (
          <div
            key={i}
            style={{
              color: line.startsWith("> SUCCESS")
                ? "var(--green)"
                : line.includes("DETECTED")
                ? "var(--oppose)"
                : "var(--text)",
              borderLeft: "2px solid rgba(255,107,53,0.3)",
              paddingLeft: "12px",
              lineHeight: 1.5,
            }}
          >
            {line}
          </div>
        ))}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <div className="generating-spinner" style={{ width: 10, height: 10 }} />
          <span
            style={{
              color: "var(--muted)",
              textTransform: "uppercase",
              fontSize: "9px",
              letterSpacing: "0.12em",
            }}
          >
            Awaiting_Signal...
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes scanning {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(500px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function TechnologyPage() {
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
      {/* ── Hero ── */}
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
          borderColor="rgba(255,107,53,0.04)"
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
          <span className="mkt-eyebrow">[THE_STACK]</span>
          <h1 className="hero-h1" style={{ marginTop: 20, maxWidth: 680 }}>
            The Trinity
            <br />
            <span className="accent">Engine.</span>
          </h1>

          {/* Three pillars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "40px",
              marginTop: "60px",
            }}
          >
            {[
              {
                num: "01",
                title: "BEHAVIORAL DATA",
                desc: "The General Social Survey 2024: multi-dimensional vectors of trust, risk aversion, social conformity, and economic outlook — living mathematical distributions, not static profiles.",
              },
              {
                num: "02",
                title: "AGENT ARCHITECTURE",
                desc: "Each agent is an autonomous reasoning unit. State-of-the-art LLMs interpret narratives, apply behavioral vectors, and make decisions aligned to their specific sociological profile.",
              },
              {
                num: "03",
                title: "NETWORK TOPOLOGY",
                desc: "Watts-Strogatz small-world networks model 'The Strength of Weak Ties', accurately predicting how localized trends become global contagion phenomena.",
              },
            ].map((pillar, i) => (
              <div
                key={i}
                style={{
                  padding: "32px",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.025), transparent)",
                  transition: "all 0.3s ease",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "10px",
                    color: "var(--orange)",
                    letterSpacing: "0.15em",
                    display: "block",
                    marginBottom: "16px",
                  }}
                >
                  {pillar.num}.
                </span>
                <h2
                  style={{
                    fontFamily: "var(--mono)",
                    color: "var(--bright)",
                    fontSize: "13px",
                    fontWeight: 700,
                    marginBottom: "16px",
                    letterSpacing: "0.1em",
                  }}
                >
                  {pillar.title}
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    lineHeight: 1.75,
                    fontSize: "14px",
                  }}
                >
                  {pillar.desc}
                </p>
              </div>
            ))}

            {/* Live stats card */}
            <div
              className="glass"
              style={{ padding: "32px", borderRadius: "10px" }}
            >
              <span
                style={{
                  color: "var(--orange)",
                  display: "block",
                  marginBottom: "20px",
                  fontFamily: "var(--mono)",
                  fontSize: "9px",
                  letterSpacing: "0.15em",
                }}
              >
                // LIVE_STATUS
              </span>
              {[
                { label: "COMPUTE_NODES", val: "1,499_ACTIVE" },
                { label: "AVG_LATENCY", val: "< 12ms" },
                { label: "MODEL_VERSION", val: "v3.4.2_LATEST" },
                { label: "UPTIME", val: "99.98%" },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    paddingBottom: "12px",
                    borderBottom:
                      i < 3 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <span style={{ color: "var(--muted)" }}>{stat.label}</span>
                  <span style={{ color: "var(--bright)", fontWeight: 700 }}>
                    {stat.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow Explorer ── */}
      <div
        style={{
          background: "var(--bg-darker)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="mkt-section">
          <div className="mkt-section-header">
            <span className="mkt-eyebrow">[METHODOLOGY]</span>
            <h2 className="mkt-h2">The Precision Workflow.</h2>
          </div>
          <WorkflowExplorer />
        </div>
      </div>

      {/* ── Why Simulate + Network Graph ── */}
      <section className="mkt-section">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
        >
          <div>
            <span className="mkt-eyebrow">[THE_REASONING]</span>
            <h2 className="mkt-h2" style={{ marginTop: 16 }}>
              Why Simulate
              <br />
              the Population?
            </h2>
            <p
              style={{
                color: "var(--muted)",
                lineHeight: 1.75,
                fontSize: "15px",
                marginBottom: "32px",
                marginTop: "16px",
              }}
            >
              Traditional focus groups are limited by small sample sizes and
              observer bias. They tell you what a handful of people say they
              will do — not how a population <em>system</em> will actually
              react.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                {
                  label: "Systemic Response",
                  text: "Capture the non-linear tipping points where local movements become global phenomena.",
                },
                {
                  label: "Diversity of Thought",
                  text: "Model the irrationality, hesitation, and complex trust-chains of 1,499+ unique behavioral vectors simultaneously.",
                },
                {
                  label: "Risk Prediction",
                  text: "Identify structural bottlenecks and narratives that stall adoption before they manifest in reality.",
                },
              ].map((point, i) => (
                <div key={i} style={{ display: "flex", gap: 16 }}>
                  <span
                    style={{
                      color: "var(--orange)",
                      fontWeight: 700,
                      flexShrink: 0,
                      fontFamily: "var(--mono)",
                      fontSize: "13px",
                    }}
                  >
                    →
                  </span>
                  <p style={{ color: "var(--text)", fontSize: "14px", lineHeight: 1.65 }}>
                    <strong style={{ color: "var(--bright)" }}>
                      {point.label}:
                    </strong>{" "}
                    {point.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <DemoNetworkGraph />
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="pricing-cta-banner">
        <span className="mkt-eyebrow">[EXPERIENCE_THE_ENGINE]</span>
        <h2 className="pricing-cta-title">
          See it Live.
          <br />
          Run Your First Simulation.
        </h2>
        <p className="pricing-cta-sub">
          Explorer tier is free. No credit card. Up to 100 agents.
        </p>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/register" className="btn-hero-primary">
            START FREE →
          </Link>
          <Link href="/features" className="btn-hero-ghost">
            EXPLORE FEATURES
          </Link>
        </div>
      </div>
    </div>
  );
}
