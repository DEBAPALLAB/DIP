"use client";

import { useState, useEffect, useRef } from "react";

interface Node {
  id: number;
  x: number;
  y: number;
  state: "undecided" | "adopted" | "opposed";
  size: number;
  label: string;
  influence: number;
}

interface Edge {
  from: number;
  to: number;
}

// Highly dynamic prompt options showcasing "Not a Prompt, but a compiled simulation"
interface SubOption {
  label: string;
  resistanceRatio: number;
  adoptionThreshold: number;
  seedCount: number;
  targetAdoption: string;
  tippingPointDay: number;
  bottleneck: string;
  networkStyle: "tight" | "sparse" | "hierarchical";
  compileLog: string[];
}

const PROMPT_TEMPLATES = [
  {
    id: 1,
    baseTextBefore: "Stress-test a caffeinated chewing gum subscription targeting ",
    baseTextAfter: " pulling all-nighters.",
    activeTokenKey: "demographic",
    tokens: [
      {
        label: "college students",
        resistanceRatio: 0.15,
        adoptionThreshold: 0.33,
        seedCount: 3,
        targetAdoption: "78.4%",
        tippingPointDay: 7,
        bottleneck: "Price-sensitive juniors holding out on off-campus networks.",
        networkStyle: "tight",
        compileLog: [
          "Parsing demographic: COLLEGE_STUDENTS...",
          "Sociological database: fitting 1,499 GSS-2024 student distribution vectors.",
          "Parameters loaded: Risk aversion = 0.28, Peer conformity = 0.82",
          "Topological compiler: generating Watts-Strogatz close-knit dorm graph.",
          "Prospect Theory parameters active: Alpha=0.88, Loss Aversion=1.65",
          "COMPILE SUCCESSFUL: 1,499 living student agents compiled."
        ]
      },
      {
        label: "senior citizens",
        resistanceRatio: 0.85,
        adoptionThreshold: 0.75,
        seedCount: 1,
        targetAdoption: "8.2%",
        tippingPointDay: 28,
        bottleneck: "Widespread aversion to subscription models and high caffeine dosages.",
        networkStyle: "sparse",
        compileLog: [
          "Parsing demographic: SENIOR_CITIZENS...",
          "Sociological database: fitting GSS vectors for age cohort 65+.",
          "Parameters loaded: Risk aversion = 0.91, Tech familiarity = 0.12",
          "Topological compiler: generating sparse, disconnected peer-to-peer graph.",
          "Prospect Theory parameters active: Alpha=0.62, Loss Aversion=3.10",
          "COMPILE SUCCESSFUL: 1,499 senior vectors compiled."
        ]
      },
      {
        label: "corporate executives",
        resistanceRatio: 0.38,
        adoptionThreshold: 0.48,
        seedCount: 4,
        targetAdoption: "48.6%",
        tippingPointDay: 14,
        bottleneck: "Strict brand loyalty barriers and high sensitivity to time-valuation.",
        networkStyle: "hierarchical",
        compileLog: [
          "Parsing demographic: CORPORATE_EXECS...",
          "Sociological database: loading income > $250k behavioral distributions.",
          "Parameters loaded: Risk aversion = 0.45, Budget sensitivity = 0.15",
          "Topological compiler: generating tree-structured hierarchical network.",
          "Prospect Theory parameters active: Alpha=0.92, Loss Aversion=2.40",
          "COMPILE SUCCESSFUL: 1,499 executive minds compiled."
        ]
      }
    ] as SubOption[]
  },
  {
    id: 2,
    baseTextBefore: "Validate launching an organic, zero-waste grocery delivery service in a ",
    baseTextAfter: ".",
    activeTokenKey: "location",
    tokens: [
      {
        label: "premium suburb",
        resistanceRatio: 0.22,
        adoptionThreshold: 0.38,
        seedCount: 3,
        targetAdoption: "68.2%",
        tippingPointDay: 12,
        bottleneck: "High local social conformity around luxury organic supermarket chains.",
        networkStyle: "tight",
        compileLog: [
          "Parsing location: PREMIUM_SUBURB...",
          "Fitting GSS demographic layers: high disposable income, high eco-conformity.",
          "Parameters loaded: Sustainability vector = 0.88, Price sensitivity = 0.18",
          "Topological compiler: mapping Watts-Strogatz neighborhood small-world graphs.",
          "Cascade parameters initialized: Peer influence coefficient = 0.72",
          "COMPILE SUCCESSFUL: Suburban community sandbox constructed."
        ]
      },
      {
        label: "industrial blue-collar town",
        resistanceRatio: 0.72,
        adoptionThreshold: 0.68,
        seedCount: 2,
        targetAdoption: "14.5%",
        tippingPointDay: 25,
        bottleneck: "Extreme price sensitivity and low utility valuation of organic packaging.",
        networkStyle: "sparse",
        compileLog: [
          "Parsing location: BLUE_COLLAR_TOWN...",
          "Fitting GSS demographic layers: medium/low income, utility-driven buyers.",
          "Parameters loaded: Budget sensitivity = 0.94, Eco-conformity = 0.22",
          "Topological compiler: sparse local cluster layout.",
          "Cascade parameters initialized: Peer influence coefficient = 0.34",
          "COMPILE SUCCESSFUL: Industrial town sandbox compiled."
        ]
      },
      {
        label: "off-grid commune",
        resistanceRatio: 0.12,
        adoptionThreshold: 0.28,
        seedCount: 5,
        targetAdoption: "91.8%",
        tippingPointDay: 4,
        bottleneck: "Logistical and supply chain constraints reaching decentralized off-grid hubs.",
        networkStyle: "hierarchical",
        compileLog: [
          "Parsing location: OFF_GRID_COMMUNE...",
          "Fitting GSS demographic layers: hyper-focused sustainability, alternative buyers.",
          "Parameters loaded: Trust vector = 0.95, Tech skepticism = 0.65",
          "Topological compiler: decentralized core-periphery graph.",
          "Cascade parameters initialized: Peer influence coefficient = 0.92",
          "COMPILE SUCCESSFUL: Decentralized commune sandbox compiled."
        ]
      }
    ] as SubOption[]
  }
];

export function PromptComparison() {
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0);
  const [activeTokenIdx, setActiveTokenIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simDay, setSimDay] = useState(0);
  const [adoptionRate, setAdoptionRate] = useState(0);
  const [resistorsRate, setResistorsRate] = useState(0);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [compilerLineIdx, setCompilerLineIdx] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);

  const currentTemplate = PROMPT_TEMPLATES[selectedTemplateIdx];
  const currentToken = currentTemplate.tokens[activeTokenIdx];
  const simInterval = useRef<NodeJS.Timeout | null>(null);
  const compileTimeout = useRef<NodeJS.Timeout | null>(null);

  // Trigger compilation simulation whenever prompt/token changes
  useEffect(() => {
    setIsPlaying(false);
    if (simInterval.current) clearInterval(simInterval.current);
    
    // Animate Compile Logs
    setIsCompiling(true);
    setCompilerLineIdx(0);
    
    let currentLine = 0;
    const logInterval = setInterval(() => {
      currentLine += 1;
      setCompilerLineIdx(currentLine);
      if (currentLine >= currentToken.compileLog.length) {
        clearInterval(logInterval);
        setIsCompiling(false);
      }
    }, 120);

    // Generate topology based on selected network style
    const nodeCount = 35;
    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];
    const center = { x: 220, y: 150 };

    for (let i = 0; i < nodeCount; i++) {
      let x = center.x;
      let y = center.y;

      if (currentToken.networkStyle === "tight") {
        // Tight clustered small-world
        const clusterIdx = i % 3;
        const angle = (i / nodeCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
        let cx = center.x;
        let cy = center.y;
        if (clusterIdx === 0) { cx -= 55; cy -= 45; }
        else if (clusterIdx === 1) { cx += 65; cy -= 20; }
        else { cx -= 10; cy += 55; }
        x = cx + Math.cos(angle) * (25 + Math.random() * 35);
        y = cy + Math.sin(angle) * (25 + Math.random() * 35);
      } 
      else if (currentToken.networkStyle === "sparse") {
        // Sparse widely distributed nodes
        const angle = (i / nodeCount) * Math.PI * 2;
        const radius = 70 + Math.random() * 60;
        x = center.x + Math.cos(angle) * radius;
        y = center.y + Math.sin(angle) * radius * 0.85;
      } 
      else {
        // Hierarchical tree/core-periphery
        const tier = i === 0 ? 0 : i < 6 ? 1 : i < 18 ? 2 : 3;
        if (tier === 0) {
          x = center.x;
          y = center.y;
        } else {
          const angle = (i / (nodeCount - 1)) * Math.PI * 2;
          const radius = tier * 45 + Math.random() * 15;
          x = center.x + Math.cos(angle) * radius;
          y = center.y + Math.sin(angle) * radius * 0.85;
        }
      }

      const isOpposed = Math.random() < currentToken.resistanceRatio;

      generatedNodes.push({
        id: i,
        x,
        y,
        state: isOpposed ? "opposed" : "undecided",
        size: 5 + Math.random() * 4,
        label: `AG-${String(i).padStart(3, "0")}`,
        influence: parseFloat((0.4 + Math.random() * 0.6).toFixed(2))
      });
    }

    // Connect edges based on topology
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = Math.hypot(generatedNodes[i].x - generatedNodes[j].x, generatedNodes[i].y - generatedNodes[j].y);
        
        if (currentToken.networkStyle === "tight" && dist < 45) {
          if (Math.random() < 0.85) generatedEdges.push({ from: i, to: j });
        } 
        else if (currentToken.networkStyle === "sparse" && dist < 32) {
          if (Math.random() < 0.35) generatedEdges.push({ from: i, to: j });
        } 
        else if (currentToken.networkStyle === "hierarchical") {
          // Parent-child linkage
          if (i === 0 && j < 6) generatedEdges.push({ from: i, to: j });
          else if (i > 0 && i < 6 && j >= 6 && j < 18 && j % 5 === i) generatedEdges.push({ from: i, to: j });
          else if (dist < 40 && Math.random() < 0.25) generatedEdges.push({ from: i, to: j });
        }
      }
      
      // Watts-Strogatz shortcuts for tight network
      if (currentToken.networkStyle === "tight" && i % 6 === 0) {
        generatedEdges.push({ from: i, to: (i + 12) % nodeCount });
      }
    }

    setNodes(generatedNodes);
    setEdges(generatedEdges);
    setSimDay(0);
    setAdoptionRate(0);
    setResistorsRate(Math.round(currentToken.resistanceRatio * 100));

    return () => {
      clearInterval(logInterval);
    };
  }, [selectedTemplateIdx, activeTokenIdx]);

  const handleStartSimulation = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (simInterval.current) clearInterval(simInterval.current);
      return;
    }

    setIsPlaying(true);
    let day = simDay;

    simInterval.current = setInterval(() => {
      day += 1;
      setSimDay(day);

      setNodes(prevNodes => {
        const nextNodes = prevNodes.map(n => ({ ...n }));
        let changes = false;

        if (day === 1) {
          // Synchronous seed
          const seeds = nextNodes
            .filter(n => n.state !== "opposed")
            .slice(0, currentToken.seedCount);
          
          seeds.forEach(s => {
            s.state = "adopted";
          });
          changes = true;
        } else {
          // Cascade algorithm
          prevNodes.forEach((node, i) => {
            if (node.state === "undecided") {
              const connections = edges.filter(e => e.from === i || e.to === i);
              const neighborIndices = connections.map(e => e.from === i ? e.to : e.from);
              
              const adoptedNeighbors = neighborIndices.filter(idx => prevNodes[idx].state === "adopted").length;
              const totalNeighbors = neighborIndices.length;

              if (totalNeighbors > 0) {
                const pressure = adoptedNeighbors / totalNeighbors;
                if (pressure > currentToken.adoptionThreshold - (node.influence * 0.12)) {
                  nextNodes[i].state = "adopted";
                  changes = true;
                }
              }
            }
          });
        }

        const adoptedCount = nextNodes.filter(n => n.state === "adopted").length;
        const opposedCount = nextNodes.filter(n => n.state === "opposed").length;
        
        const nextAdoption = Math.round((adoptedCount / prevNodes.length) * 100);
        const nextResist = Math.round((opposedCount / prevNodes.length) * 100);
        
        setAdoptionRate(nextAdoption);
        setResistorsRate(nextResist);

        if (day >= 30 || !changes) {
          setIsPlaying(false);
          if (simInterval.current) clearInterval(simInterval.current);
        }

        return nextNodes;
      });
    }, 200);
  };

  const handleResetSimulation = () => {
    setIsPlaying(false);
    if (simInterval.current) clearInterval(simInterval.current);
    setSimDay(0);
    setAdoptionRate(0);
    setResistorsRate(Math.round(currentToken.resistanceRatio * 100));
    setNodes(prev => prev.map(n => ({
      ...n,
      state: Math.random() < currentToken.resistanceRatio ? "opposed" : "undecided"
    })));
  };

  useEffect(() => {
    return () => {
      if (simInterval.current) clearInterval(simInterval.current);
    };
  }, []);

  return (
    <div className="ab-comparison-wrapper" style={{ margin: "4vh 0", width: "100%", maxWidth: "100%" }}>
      
      {/* Interactive Prompt Compiler Bar */}
      <div className="prompt-selector-container" style={{ borderLeft: "3px solid var(--accent)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="prompt-bar-label">
            <span className="live-dot-glow" style={{ background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }}></span>
            COMPILABLE_STRATEGIC_BLUEPRINT
          </div>
          <div className="prompt-choices">
            {PROMPT_TEMPLATES.map((t, idx) => (
              <button
                key={t.id}
                className={`prompt-choice-btn ${selectedTemplateIdx === idx ? "active" : ""}`}
                onClick={() => { setSelectedTemplateIdx(idx); setActiveTokenIdx(0); }}
                style={{
                  color: selectedTemplateIdx === idx ? "var(--accent)" : "var(--muted)",
                  borderColor: selectedTemplateIdx === idx ? "rgba(200, 241, 53, 0.4)" : "var(--border)"
                }}
              >
                TEMPLATE_{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* The blueprint text with active click-to-swap demographic tokens */}
        <div className="prompt-input-display" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 2px", borderLeft: "none", background: "rgba(0,0,0,0.5)", padding: "16px 20px", lineHeight: "1.6" }}>
          <span className="prompt-cursor" style={{ color: "var(--accent)" }}>&gt;</span>
          <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "13px" }}>"</span>
          <span style={{ fontSize: "15px", fontWeight: 500 }}>{currentTemplate.baseTextBefore}</span>
          
          {/* Interactive Token Switcher */}
          <span style={{ display: "inline-flex", gap: "6px", margin: "0 8px", background: "rgba(200, 241, 53, 0.08)", border: "1px dashed rgba(200, 241, 53, 0.3)", borderRadius: "6px", padding: "4px 8px" }}>
            {currentTemplate.tokens.map((tok, tIdx) => (
              <button
                key={tIdx}
                onClick={() => { setActiveTokenIdx(tIdx); }}
                style={{
                  background: activeTokenIdx === tIdx ? "var(--accent)" : "transparent",
                  color: activeTokenIdx === tIdx ? "#000" : "var(--accent)",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  fontSize: "13.5px",
                  fontWeight: activeTokenIdx === tIdx ? 800 : 600,
                  cursor: "pointer",
                  fontFamily: "var(--sans)",
                  transition: "all 0.15s ease"
                }}
              >
                {tok.label}
              </button>
            ))}
          </span>

          <span style={{ fontSize: "15px", fontWeight: 500 }}>{currentTemplate.baseTextAfter}</span>
          <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "13px" }}>"</span>
        </div>
      </div>

      {/* Side-by-Side A/B Screen */}
      <div className="ab-grid">
        
        {/* Left Side: A - Standard LLM response */}
        <div className="ab-card side-a">
          <div className="ab-card-header">
            <span className="ab-badge badge-red">STREAM_A // BORING TEXT CHATBOT</span>
            <div className="window-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
          <div className="ab-card-body">
            <div className="chatbot-avatar-row">
              <div className="chatbot-avatar">💬</div>
              <div className="chatbot-meta">
                <span className="chatbot-name">ChatGPT / Claude / Gemini API</span>
                <span className="chatbot-status">STATIC_WORD_PREDICTION</span>
              </div>
            </div>
            
            {/* Realistic premium chat interface */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, padding: "12px 0" }}>
              
              {/* User Message Bubble (Right-aligned) */}
              <div style={{ 
                alignSelf: "flex-end", 
                maxWidth: "85%", 
                background: "rgba(147, 51, 234, 0.12)", 
                border: "1px solid rgba(147, 51, 234, 0.25)", 
                borderRadius: "16px 16px 2px 16px", 
                padding: "14px 18px",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: "15px",
                lineHeight: 1.5,
                color: "var(--bright)"
              }}>
                <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "rgba(167, 139, 250, 0.95)", marginBottom: "6px", letterSpacing: "0.08em", fontWeight: 700 }}>[PROMPT_INPUT]</div>
                "{currentTemplate.baseTextBefore.trim()} {currentToken.label} {currentTemplate.baseTextAfter.trim()}"
              </div>

              {/* AI Response Bubble (Left-aligned) */}
              <div style={{ 
                alignSelf: "flex-start", 
                maxWidth: "85%", 
                background: "rgba(255, 255, 255, 0.04)", 
                border: "1px solid rgba(255, 255, 255, 0.08)", 
                borderRadius: "16px 16px 16px 2px", 
                padding: "14px 18px",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: "15px",
                lineHeight: 1.5,
                color: "rgba(255, 255, 255, 0.95)"
              }}>
                <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "var(--muted)", marginBottom: "6px", letterSpacing: "0.08em", fontWeight: 700 }}>[LLM_RESPONSE]</div>
                "Yes, targeting {currentToken.label} is highly viable! To validate this, you should set up social ads and track landing page clicks. Since {currentToken.label} typically have specific study/purchasing patterns, we predict a strong response with minimal friction..."
              </div>

              {/* Critical Flaw Alert Bubble */}
              <div style={{ 
                background: "rgba(255, 68, 68, 0.08)", 
                border: "1px solid rgba(255, 68, 68, 0.2)", 
                borderRadius: "10px", 
                padding: "14px 18px",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: "13px",
                lineHeight: 1.5,
                color: "#ff8888"
              }}>
                <strong style={{ color: "#ff4444" }}>CRITICAL FLAW:</strong> This is a language model predicting the most probable words. It has no network science, does not calculate actual small-world contagion, and cannot project exact peer resistance.
              </div>

            </div>

            <div className="a-footer-alert" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: "12px", lineHeight: "1.5" }}>
              <div className="alert-icon">⚠️</div>
              <div>
                <strong>The Prompt Flaw:</strong> Chatbots represent uniform, linear reasoning. In reality, human societies are complex small-world topologies that resist or adopt dynamically.
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: B - Notaprompt Simulation Hub */}
        <div className="ab-card side-b">
          <div className="ab-card-header">
            <span className="ab-badge badge-green">STREAM_B // NOTAPROMPT DEEP COMPILATION</span>
            <div className="window-dots">
              <span className="dot active-lime"></span>
              <span className="dot active-lime"></span>
              <span className="dot active-lime"></span>
            </div>
          </div>
          <div className="ab-card-body">
            
            {/* Dynamic Compilation Status Terminal */}
            <div style={{ background: "rgba(0,0,0,0.6)", borderRadius: "8px", padding: "14px 18px", border: "1px solid rgba(200, 241, 53, 0.15)", fontFamily: "var(--mono)", fontSize: "12px", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ color: "var(--accent)", borderBottom: "1px solid rgba(200, 241, 53, 0.1)", paddingBottom: "6px", display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold" }}>
                <span>[PROMPT_COMPILER_V4.2]</span>
                <span>{isCompiling ? "COMPILING..." : "READY"}</span>
              </div>
              {currentToken.compileLog.slice(0, compilerLineIdx).map((log, lIdx) => (
                <div key={lIdx} style={{ color: lIdx === currentToken.compileLog.length - 1 ? "var(--accent)" : "#999" }}>
                  {lIdx === currentToken.compileLog.length - 1 ? "✓ " : "&gt; "} {log}
                </div>
              ))}
            </div>

            {/* Visual Simulator SVG */}
            <div className="simulator-viz-panel" style={{ opacity: isCompiling ? 0.3 : 1, transition: "opacity 0.2s ease" }}>
              <svg width="100%" height="230" viewBox="0 0 440 280" style={{ background: "rgba(0,0,0,0.5)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(200,241,53,0.015)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Edges */}
                {edges.map((e, idx) => {
                  const fromNode = nodes[e.from];
                  const toNode = nodes[e.to];
                  if (!fromNode || !toNode) return null;
                  
                  const isAdoptedEdge = fromNode.state === "adopted" && toNode.state === "adopted";
                  const strokeColor = isAdoptedEdge 
                    ? "rgba(200, 241, 53, 0.55)" 
                    : "rgba(255, 255, 255, 0.08)";
                  const strokeWidth = isAdoptedEdge ? 1.5 : 1;

                  return (
                    <line
                      key={idx}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                    />
                  );
                })}

                {/* Nodes */}
                {nodes.map(n => {
                  let fillColor = "rgba(100, 100, 100, 0.3)";
                  let strokeColor = "rgba(255,255,255,0.15)";
                  let filterGlow = "none";

                  if (n.state === "adopted") {
                    fillColor = "#C8F135";
                    strokeColor = "#C8F135";
                    filterGlow = "drop-shadow(0px 0px 6px rgba(200, 241, 53, 0.8))";
                  } else if (n.state === "opposed") {
                    fillColor = "#ff4444";
                    strokeColor = "#ff4444";
                    filterGlow = "drop-shadow(0px 0px 4px rgba(255, 68, 68, 0.5))";
                  }

                  return (
                    <circle
                      key={n.id}
                      cx={n.x}
                      cy={n.y}
                      r={n.state === "adopted" ? n.size + 1 : n.size}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={1}
                      style={{ filter: filterGlow, transition: "all 0.3s ease" }}
                    />
                  );
                })}
              </svg>

              {/* Floating Telemetry HUD */}
              <div className="sim-hud-overlay">
                <div className="hud-metric">
                  <span className="hud-label">SIM_DAY</span>
                  <span className="hud-value font-mono text-orange">{String(simDay).padStart(2, "0")} / 30</span>
                </div>
                <div className="hud-metric">
                  <span className="hud-label">ADOPTION_RATE</span>
                  <span className="hud-value font-mono text-green" style={{ color: "var(--accent)" }}>{adoptionRate}%</span>
                </div>
                <div className="hud-metric">
                  <span className="hud-label">OPPOSITION</span>
                  <span className="hud-value font-mono text-red">{resistorsRate}%</span>
                </div>
              </div>
            </div>

            {/* Sim Control Bar */}
            <div className="sim-controls">
              <button 
                className="btn-sim-play" 
                onClick={handleStartSimulation}
                disabled={isCompiling}
                style={{ 
                  background: "var(--accent)", 
                  opacity: isCompiling ? 0.3 : 1,
                  boxShadow: "0 4px 14px rgba(200, 241, 53, 0.15)"
                }}
              >
                {isPlaying ? "⏸ PAUSE SIMULATION" : "▶ RUN LIVE CONTAGION CASCADES"}
              </button>
              <button className="btn-sim-reset" onClick={handleResetSimulation} disabled={isCompiling}>
                ↺ RESET
              </button>
            </div>

            {/* Real-time Compiled Insights */}
            <div className="sim-analytics-output" style={{ border: "1px solid rgba(200, 241, 53, 0.12)" }}>
              <div className="sim-insight-title" style={{ color: "var(--accent)" }}>// DYNAMICALLY EXTRAPOLATED SIMULATOR HUD</div>
              <div className="insight-grid">
                <div className="insight-box">
                  <span className="ins-lbl">Calculated Tipping Point</span>
                  <span className="ins-val">{simDay >= currentToken.tippingPointDay ? `DETECTED (Day ${currentToken.tippingPointDay})` : "MONITORING..."}</span>
                </div>
                <div className="insight-box">
                  <span className="ins-lbl">Bottleneck Profile</span>
                  <span className="ins-val-desc" style={{ fontSize: "9px" }}>{currentToken.bottleneck}</span>
                </div>
                <div className="insight-box">
                  <span className="ins-lbl">Est. Peak Saturation</span>
                  <span className="ins-val" style={{ color: "var(--accent)" }}>{currentToken.targetAdoption}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
