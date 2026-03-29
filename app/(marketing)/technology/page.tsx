"use client";

import React, { useEffect, useState, useRef } from "react";
import Squares from "@/components/marketing/InteractiveBackground";
import * as d3Force from "d3-force";

function DemoNetworkGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setDimensions({ width, height });

    const simNodes = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      group: Math.floor(Math.random() * 3),
      radius: 4 + Math.random() * 8,
      x: Math.random() * width,
      y: Math.random() * height
    }));

    const simLinks = Array.from({ length: 60 }, () => ({
      source: Math.floor(Math.random() * 40),
      target: Math.floor(Math.random() * 40),
    })).filter(l => l.source !== l.target);

    const simulation = d3Force.forceSimulation(simNodes as any)
      .force("link", d3Force.forceLink(simLinks).id((d: any) => d.id).distance(50).strength(0.5))
      .force("charge", d3Force.forceManyBody().strength(-100))
      .force("center", d3Force.forceCenter(width / 2, height / 2))
      .force("collide", d3Force.forceCollide().radius(12))
      .on("tick", () => {
        setNodes([...simNodes]);
        setLinks([...simLinks]);
      });

    return () => { simulation.stop(); };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "400px", background: "rgba(0,0,0,0.1)", border: "1px solid var(--border)", borderRadius: "4px", position: "relative", overflow: "hidden" }}>
      <svg width={dimensions.width} height={dimensions.height}>
        <g>
          {links.map((link: any, i) => (
            <line
              key={i}
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              stroke="var(--border)"
              strokeWidth={0.5}
              opacity={0.3}
            />
          ))}
          {nodes.map((node: any) => (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill={node.group === 0 ? "var(--orange)" : node.group === 1 ? "var(--support)" : "var(--bright)"}
              fillOpacity={0.6}
              stroke="var(--bg)"
              strokeWidth={1}
            />
          ))}
        </g>
      </svg>
      <div style={{ position: "absolute", bottom: "12px", right: "12px", fontFamily: "var(--mono)", fontSize: "8px", color: "var(--muted)", backgroundColor: "rgba(0,0,0,0.5)", padding: "4px 8px" }}>
        [LIVE_NETWORK_TOPOLOGY_PREVIEW]
      </div>
    </div>
  );
}

function WorkflowExplorer() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "SYNTHESIZE",
      title: "PROFILE_GENERATION",
      tag: "01_SYNTHESIZE",
      desc: "We ingest your strategic narrative and synthesize high-resolution sociological profiles from verification data, creating a representative cross-section of your target population.",
      console: [
        "> INITIALIZING_DATA_INGESTION",
        "> SCANNING_GSS_2024_VECTOR_DISTRIBUTION...",
        "> 1,499_RECORDS_FOUND",
        "> GENERATING_VIRTUAL_COMMUNITIES...",
        "> SUCCESS: POPULATION_SYNTHESIS_COMPLETE [±2.4%_MARGIN]"
      ]
    },
    {
      id: "INITIALIZE",
      title: "VECTOR_MAPPING",
      tag: "02_INITIALIZE",
      desc: "Every agent is assigned a unique behavioral vector—Trust, Risk-Aversion, and Social Conformity—derived from 1,499 real-world respondents.",
      console: [
        "> MAPPING_BEHAVIORAL_VECTORS",
        "> AGENT_402: TRUST_0.12 | RISK_AV_0.82",
        "> AGENT_119: TRUST_0.78 | RISK_AV_0.22",
        "> NORMALIZING_COGNITIVE_BIAS...",
        "> DATA_FIDELITY: 98.2%"
      ]
    },
    {
      id: "SIMULATE",
      title: "DYNAMIC_CASCADES",
      tag: "03_SIMULATE",
      desc: "The model runs the strategic input through the social graph. Agents negotiate with peers and observe clusters, revealing non-linear tipping points.",
      console: [
        "> DEPLOYING_WATTS_STROGATZ_NETWORK",
        "> ITERATION_10: SOCIAL_CONTAGION_IDLE",
        "> ITERATION_40: LOCALIZED_CASCADE_START",
        "> ITERATION_85: TIPPING_POINT_REACHED",
        "> CONVERGENCE_STABILITY: 0.94"
      ]
    },
    {
      id: "ANALYZE",
      title: "STRUCTURAL_INSIGHTS",
      tag: "04_ANALYZE",
      desc: "We extract the structural bottlenecks and tipping points from the resulting data, providing actionable intelligence on where your strategy will succeed or stall.",
      console: [
        "> EXTRACTING_GRAPH_METRICS",
        "> BOTTLENECK_DETECTED: CLUSTER_B_REJECTION",
        "> ADOPTION_RATE_PROJECTED: 64.2%",
        "> GENERATING_STRATEGIC_REPORT...",
        "> READY: DOWNLOAD_INSIGHTS_JSON"
      ]
    }
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", background: "var(--panel)", padding: "40px", border: "1px solid var(--border)", borderRadius: "4px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {steps.map((step, idx) => (
          <div 
            key={step.id}
            onMouseEnter={() => setActiveStep(idx)}
            onClick={() => setActiveStep(idx)}
            style={{ 
              padding: "24px", 
              border: `1px solid ${activeStep === idx ? "var(--orange)" : "var(--border)"}`, 
              borderRadius: "4px", 
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeStep === idx ? "rgba(255, 107, 53, 0.03)" : "transparent"
            }}
          >
            <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: activeStep === idx ? "var(--orange)" : "var(--muted)", letterSpacing: "0.1em" }}>
              {step.tag}
            </span>
            <h3 style={{ color: activeStep === idx ? "var(--bright)" : "var(--text)", fontSize: "16px", marginTop: "8px", fontFamily: "var(--mono)" }}>
              {step.title}
            </h3>
            {activeStep === idx && (
              <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "12px", lineHeight: "1.6" }}>
                {step.desc}
              </p>
            )}
          </div>
        ))}
      </div>

      <div style={{ 
        background: "var(--bg-darker)", 
        borderRadius: "4px", 
        border: "1px solid var(--border)",
        padding: "32px",
        fontFamily: "var(--mono)",
        fontSize: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, var(--orange), transparent)", animation: "scanning 2s linear infinite" }} />
        <span style={{ color: "var(--orange)", opacity: 0.5, marginBottom: "8px" }}>[SIMULATED_CONSOLE_OUTPUT]</span>
        {steps[activeStep].console.map((line, i) => (
          <div key={i} style={{ color: line.startsWith("> SUCCESS") ? "var(--support)" : line.includes("DETECTED") ? "var(--oppose)" : "var(--text)", borderLeft: "2px solid rgba(255,107,53,0.3)", paddingLeft: "12px" }}>
            {line}
          </div>
        ))}
        <div style={{ marginTop: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          <div className="generating-spinner" style={{ width: "12px", height: "12px" }} />
          <span style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: "10px" }}>Awaiting_Signal...</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes scanning {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function TechnologyPage() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="landing-v2-container">
      <Squares 
        direction="diagonal"
        speed={0.3}
        squareSize={40}
        borderColor="rgba(255, 107, 53, 0.05)"
        hoverFillColor="rgba(255, 107, 53, 0.1)"
      />
      
      <section className="hero-v2" style={{ padding: "160px 0 100px 0" }}>
        <span className="section-label">[THE_STACK]</span>
        <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", marginBottom: "40px" }}>THE TRINITY <br/>ENGINE.</h1>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "60px", marginTop: "40px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--mono)", color: "var(--bright)", marginBottom: "24px", fontSize: "14px" }}>01. BEHAVIORAL DATA</h2>
            <p style={{ color: "var(--muted)", lineHeight: "1.8", fontSize: "15px" }}>
              Our foundation is the General Social Survey (GSS) 2024. We extract multi-dimensional 
              vectors representing trust, risk aversion, social conformity, and economic outlook. 
              These aren't static profiles—they are living mathematical distributions.
            </p>
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--mono)", color: "var(--bright)", marginBottom: "24px", fontSize: "14px" }}>02. AGENT ARCHITECTURE</h2>
            <p style={{ color: "var(--muted)", lineHeight: "1.8", fontSize: "15px" }}>
              Each agent is an autonomous reasoning unit. We utilize state-of-the-art LLMs 
              to interpret narratives, apply behavioral vectors, and make decisions that 
              align with their specific sociological profile.
            </p>
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--mono)", color: "var(--bright)", marginBottom: "24px", fontSize: "14px" }}>03. NETWORK TOPOLOGY</h2>
            <p style={{ color: "var(--muted)", lineHeight: "1.8", fontSize: "15px" }}>
              Simulations run on high-fidelity social graphs. We model "The Strength of Weak Ties" 
              and small-world phenomena to accurately predict how a localized trend becomes 
              a global contagion.
            </p>
          </div>
          <div className="glass" style={{ padding: "32px", borderRadius: "4px" }}>
            <span style={{ color: "var(--orange)", display: "block", marginBottom: "16px", fontFamily: "var(--mono)", fontSize: "10px" }}>// LIVE_STATUS</span>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontFamily: "var(--mono)", fontSize: "12px" }}>
              <span>COMPUTE_NODES</span>
              <span style={{ color: "var(--bright)" }}>1,499_ACTIVE</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontFamily: "var(--mono)", fontSize: "12px" }}>
              <span>AVG_LATENCY</span>
              <span style={{ color: "var(--bright)" }}>12ms</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: "12px" }}>
              <span>MODEL_VERSION</span>
              <span style={{ color: "var(--bright)" }}>v3.4.2_LATEST</span>
            </div>
          </div>
        </div>

        {/* ── Interactive Workflow ── */}
        <div style={{ marginTop: "120px", borderTop: "1px solid var(--border)", paddingTop: "80px" }}>
          <span className="section-label">[METHODOLOGY]</span>
          <h2 style={{ color: "var(--bright)", fontSize: "48px", marginBottom: "60px", letterSpacing: "-0.04em" }}>THE PRECISION WORKFLOW.</h2>
          
          <WorkflowExplorer />
        </div>

        {/* ── Why Population Simulation? ── */}
        <div style={{ marginTop: "120px", background: "rgba(255, 107, 53, 0.02)", padding: "80px 40px", border: "1px solid var(--border)", borderRadius: "4px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "60px", alignItems: "center" }}>
            <div>
              <span className="section-label" style={{ textAlign: "left" }}>[THE_REASONING]</span>
              <h2 style={{ color: "var(--bright)", fontSize: "32px", marginBottom: "24px" }}>WHY SIMULATE THE POPULATION?</h2>
              <p style={{ color: "var(--muted)", lineHeight: "1.6", fontSize: "16px", marginBottom: "32px" }}>
                Traditional focus groups are limited by small sample sizes and observer bias. 
                They tell you what a handful of people say they will do—not how a population 
                system will actually react.
              </p>
              <div style={{ display: "grid", gap: "24px" }}>
                <div style={{ display: "flex", gap: "16px" }}>
                  <span style={{ color: "var(--orange)", fontWeight: 700 }}>→</span>
                  <p style={{ color: "var(--text)" }}><strong>Systemic Response:</strong> Capture the non-linear "tipping points" where local movements become global phenomena.</p>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <span style={{ color: "var(--orange)", fontWeight: 700 }}>→</span>
                  <p style={{ color: "var(--text)" }}><strong>Diversity of Thought:</strong> Model the irrationality, hesitation, and complex trust-chains of 1,499+ unique data vectors simultaneously.</p>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <span style={{ color: "var(--orange)", fontWeight: 700 }}>→</span>
                  <p style={{ color: "var(--text)" }}><strong>Risk Prediction:</strong> Identify structural bottlenecks and narratives that stall adoption before they manifest in reality.</p>
                </div>
              </div>
            </div>
            
            <DemoNetworkGraph />
          </div>
        </div>
      </section>
    </div>
  );
}
