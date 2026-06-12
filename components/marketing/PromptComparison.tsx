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
  const [hoveredSection, setHoveredSection] = useState<"side-a" | "side-b" | null>(null);

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
      <style dangerouslySetInnerHTML={{ __html: `
        .ab-playground-window {
          display: flex;
          flex-direction: column;
          width: 100%;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(8, 8, 8, 0.85);
          border: 1px solid var(--border);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
          transition: all 0.3s ease;
        }
        .ab-playground-header {
          height: 48px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          background: rgba(5, 5, 5, 0.6);
        }
        .window-controls {
          display: flex;
          gap: 8px;
        }
        .window-controls .control-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
        .window-controls .control-dot.red { background: #ff5f56; }
        .window-controls .control-dot.yellow { background: #ffbd2e; }
        .window-controls .control-dot.green { background: #27c93f; }
        .window-title {
          font-family: var(--mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .window-meta {
          font-family: var(--mono);
          font-size: 9px;
          color: var(--muted);
          letter-spacing: 0.05em;
        }
        .ab-playground-control-pane {
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.3);
        }
        .control-pane-header {
          height: 38px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
        }
        .editor-tab-row {
          display: flex;
          gap: 4px;
          height: 100%;
          align-items: flex-end;
        }
        .editor-tab {
          height: 32px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          border-radius: 6px 6px 0 0;
          font-family: var(--mono);
          font-size: 10.5px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          border-bottom: none;
          background: transparent;
          color: var(--muted);
          transition: all 0.2s ease;
        }
        .editor-tab:hover {
          color: var(--bright);
        }
        .editor-tab.active {
          background: rgba(8, 8, 8, 0.85);
          border-color: var(--border);
          color: var(--accent);
        }
        .compiler-badge {
          font-family: var(--mono);
          font-size: 8px;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(200, 241, 53, 0.1);
          color: var(--accent);
          border: 1px solid rgba(200, 241, 53, 0.15);
        }
        .editor-body {
          padding: 16px 20px;
          display: flex;
          gap: 16px;
          line-height: 1.6;
          align-items: flex-start;
        }
        .editor-line-numbers {
          display: flex;
          flex-direction: column;
          font-family: var(--mono);
          font-size: 13px;
          color: var(--muted);
          text-align: right;
          user-select: none;
          padding-top: 2px;
          gap: 4px;
        }
        .editor-content {
          font-family: var(--sans);
          font-size: 15px;
          font-weight: 500;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px 2px;
          flex: 1;
        }
        .editor-prompt-symbol {
          color: var(--accent);
          font-family: var(--mono);
          font-weight: 700;
          margin-right: 6px;
        }
        .editor-text-muted {
          color: var(--muted);
          font-family: var(--mono);
          font-size: 13px;
        }
        .editor-text-content {
          color: var(--bright);
        }
        .editor-token-pill-container {
          display: inline-flex;
          gap: 6px;
          margin: 0 8px;
          border-radius: 8px;
          padding: 4px 8px;
          background: rgba(200, 241, 53, 0.08);
          border: 1px dashed rgba(200, 241, 53, 0.3);
        }
        .editor-token-btn {
          border: none;
          border-radius: 4px;
          padding: 4px 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--sans);
          transition: all 0.15s ease;
          background: transparent;
          color: var(--accent);
        }
        .editor-token-btn.active {
          background: var(--accent);
          color: #000;
          font-weight: 800;
        }
        .ab-playground-workspace {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          border-top: none;
        }
        .workspace-column {
          display: flex;
          flex-direction: column;
          transition: opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1), filter 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .workspace-column.side-a {
          border-right: 1px solid var(--border);
        }
        .workspace-column.side-b {
          background: rgba(255, 255, 255, 0.01);
        }
        .column-header {
          height: 42px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.15);
        }
        .column-header .header-status {
          font-family: var(--mono);
          font-size: 8.5px;
          color: var(--muted);
          letter-spacing: 0.05em;
        }
        .workspace-badge {
          font-family: var(--mono);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .workspace-badge.badge-red {
          color: #ff5f56;
          background: rgba(255, 95, 86, 0.1);
          border: 1px solid rgba(255, 95, 86, 0.2);
        }
        .workspace-badge.badge-green {
          color: var(--accent);
          background: rgba(200, 241, 53, 0.1);
          border: 1px solid rgba(200, 241, 53, 0.2);
        }
        .column-body {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .chatbot-avatar-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }
        .chatbot-avatar {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .chatbot-meta {
          display: flex;
          flex-direction: column;
        }
        .chatbot-name {
          color: var(--bright);
          font-weight: 600;
          font-size: 13px;
        }
        .chatbot-status {
          font-family: var(--sans);
          font-size: 9.5px;
          color: var(--muted);
          letter-spacing: 0.05em;
        }
        .a-footer-alert {
          background: rgba(255, 68, 68, 0.05);
          border: 1px solid rgba(255, 68, 68, 0.15);
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-size: 12px;
          color: #ffcccc;
          line-height: 1.5;
        }
        .alert-icon {
          font-size: 16px;
        }
        .simulator-viz-panel {
          position: relative;
          width: 100%;
        }
        .sim-hud-overlay {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(5, 5, 5, 0.92);
          border: 1px solid var(--border-bright);
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          backdrop-filter: blur(8px);
        }
        .hud-metric {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
        }
        .hud-label {
          font-family: var(--sans);
          font-size: 10px;
          font-weight: 600;
          color: var(--muted);
          letter-spacing: 0.06em;
        }
        .hud-value {
          font-size: 13px;
          font-weight: 700;
        }
        .text-orange { color: var(--orange); }
        .text-green { color: var(--accent); }
        .text-red { color: #ff4444; }
        .sim-controls {
          display: flex;
          gap: 10px;
        }
        .btn-sim-play {
          flex: 1;
          background: var(--accent);
          color: #000;
          border: none;
          font-family: var(--sans);
          font-size: 12px;
          font-weight: 700;
          padding: 12px 18px;
          border-radius: 6px;
          cursor: pointer;
          letter-spacing: 0.03em;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(200, 241, 53, 0.2);
        }
        .btn-sim-play:hover {
          background: var(--bright);
          box-shadow: 0 6px 20px rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }
        .btn-sim-reset {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          color: var(--muted);
          font-family: var(--sans);
          font-size: 12px;
          font-weight: 600;
          padding: 12px 18px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-sim-reset:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--bright);
        }
        .sim-analytics-output {
          background: rgba(200, 241, 53, 0.015);
          border: 1px solid rgba(200, 241, 53, 0.08);
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sim-insight-title {
          font-family: var(--sans);
          font-size: 11px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 0.08em;
        }
        .insight-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .insight-box {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ins-lbl {
          font-size: 10px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-family: var(--sans);
          font-weight: 600;
        }
        .ins-val {
          font-family: var(--mono);
          font-size: 12.5px;
          font-weight: 700;
          color: var(--bright);
        }
        .ins-val-desc {
          font-size: 11px;
          color: var(--bright);
          line-height: 1.45;
        }
        @media (max-width: 900px) {
          .ab-playground-workspace {
            grid-template-columns: 1fr;
          }
          .workspace-column.side-a {
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
        }

        /* Light theme overrides */
        .marketing-theme .ab-playground-window {
          background: rgba(255, 255, 255, 0.45);
          border: 1px solid rgba(0, 82, 255, 0.08);
          box-shadow: 0 40px 100px rgba(0, 82, 255, 0.06), 0 0 40px rgba(0, 82, 255, 0.02);
          backdrop-filter: blur(24px);
        }
        .marketing-theme .ab-playground-header {
          background: rgba(255, 255, 255, 0.6);
          border-bottom: 1px solid rgba(0, 82, 255, 0.06);
        }
        .marketing-theme .window-title {
          color: rgba(0, 82, 255, 0.85);
        }
        .marketing-theme .ab-playground-control-pane {
          background: rgba(255, 255, 255, 0.5);
          border-bottom: 1px solid rgba(0, 82, 255, 0.06);
        }
        .marketing-theme .control-pane-header {
          border-bottom: 1px solid rgba(0, 82, 255, 0.05);
        }
        .marketing-theme .editor-tab.active {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(0, 82, 255, 0.06);
          color: var(--accent);
        }
        .marketing-theme .compiler-badge {
          background: rgba(0, 82, 255, 0.05);
          color: var(--accent);
          border: 1px solid rgba(0, 82, 255, 0.15);
        }
        .marketing-theme .workspace-column.side-a {
          border-right: 1px solid rgba(0, 82, 255, 0.06);
        }
        .marketing-theme .workspace-column.side-b {
          background: rgba(0, 82, 255, 0.005);
        }
        .marketing-theme .column-header {
          background: rgba(255, 255, 255, 0.4);
          border-bottom: 1px solid rgba(0, 82, 255, 0.05);
        }
        .marketing-theme .workspace-badge.badge-red {
          color: #dc2626;
          background: rgba(220, 38, 38, 0.06);
          border: 1px solid rgba(220, 38, 38, 0.12);
        }
        .marketing-theme .workspace-badge.badge-green {
          color: var(--accent);
          background: rgba(0, 82, 255, 0.06);
          border: 1px solid rgba(0, 82, 255, 0.15);
        }
        .marketing-theme .chatbot-avatar-row {
          border-bottom: 1px solid rgba(0, 82, 255, 0.05);
        }
        .marketing-theme .chatbot-avatar {
          background: rgba(0, 82, 255, 0.04);
          border: 1px solid rgba(0, 82, 255, 0.08);
          color: var(--text);
        }
        .marketing-theme .a-footer-alert {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.12);
          color: #dc2626;
        }
        .marketing-theme .sim-hud-overlay {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(0, 82, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 82, 255, 0.03);
        }
        .marketing-theme .btn-sim-reset {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 82, 255, 0.08);
          color: var(--muted);
        }
        .marketing-theme .btn-sim-reset:hover {
          background: rgba(255, 255, 255, 0.9);
          color: var(--bright);
          border-color: rgba(0, 82, 255, 0.18);
        }
        .marketing-theme .sim-analytics-output {
          background: rgba(0, 82, 255, 0.01);
          border: 1px solid rgba(0, 82, 255, 0.08);
        }
        .marketing-theme .insight-box {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 82, 255, 0.05);
        }
        @media (max-width: 900px) {
          .marketing-theme .workspace-column.side-a {
            border-right: none;
            border-bottom: 1px solid rgba(0, 82, 255, 0.06);
          }
        }
      ` }} />
      
      {/* Unified IDE Workspace Window */}
      <div className="ab-playground-window">
        {/* IDE Header Bar */}
        <div className="ab-playground-header">
          <div className="window-controls">
            <span className="control-dot red"></span>
            <span className="control-dot yellow"></span>
            <span className="control-dot green"></span>
          </div>
          <div className="window-title">
            NOTAPROMPT // STRATEGIC_LAUNCH_COMPILER // PLAYGROUND
          </div>
          <div className="window-meta">
            ENGINE_V4.2 // STATUS: ONLINE
          </div>
        </div>

        {/* Top Control Pane / YAML Editor Tab bar */}
        <div className="ab-playground-control-pane">
          <div className="control-pane-header">
            <div className="editor-tab-row">
              {PROMPT_TEMPLATES.map((t, idx) => (
                <button
                  key={t.id}
                  className={`editor-tab ${selectedTemplateIdx === idx ? "active" : ""}`}
                  onClick={() => { setSelectedTemplateIdx(idx); setActiveTokenIdx(0); }}
                >
                  template_{idx + 1}.yaml
                </button>
              ))}
            </div>
            <div className="compiler-badge">
              {isCompiling ? "COMPILING_SCENARIO" : "SCENARIO_LOADED"}
            </div>
          </div>

          {/* Prompt Editor body pane */}
          <div className="editor-body">
            <div className="editor-line-numbers">
              <span>01</span>
              <span>02</span>
            </div>
            <div className="editor-content">
              <span className="editor-prompt-symbol">&gt;</span>
              <span className="editor-text-muted">"</span>
              <span className="editor-text-content">{currentTemplate.baseTextBefore}</span>
              
              {/* Token switcher */}
              <span className="editor-token-pill-container">
                {currentTemplate.tokens.map((tok, tIdx) => (
                  <button
                    key={tIdx}
                    onClick={() => { setActiveTokenIdx(tIdx); }}
                    className={`editor-token-btn ${activeTokenIdx === tIdx ? "active" : ""}`}
                  >
                    {tok.label}
                  </button>
                ))}
              </span>

              <span className="editor-text-content">{currentTemplate.baseTextAfter}</span>
              <span className="editor-text-muted">"</span>
            </div>
          </div>
        </div>

        {/* Splitted Workspace View */}
        <div className="ab-playground-workspace">
          {/* Stream A Column */}
          <div 
            className="workspace-column side-a"
            onMouseEnter={() => setHoveredSection("side-a")}
            onMouseLeave={() => setHoveredSection(null)}
            style={{
              opacity: hoveredSection === "side-b" ? 0.35 : 1,
              filter: hoveredSection === "side-b" ? "blur(1.5px)" : "none",
            }}
          >
            <div className="column-header">
              <span className="workspace-badge badge-red">STREAM_A // BORING TEXT CHATBOT</span>
              <div className="header-status">
                STATIC_WORD_PREDICTOR
              </div>
            </div>

            <div className="column-body">
              <div className="chatbot-avatar-row">
                <div className="chatbot-avatar">💬</div>
                <div className="chatbot-meta">
                  <span className="chatbot-name">ChatGPT / Claude / Gemini API</span>
                  <span className="chatbot-status">STATIC_WORD_PREDICT_MODE</span>
                </div>
              </div>

              {/* Realistic chat list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, padding: "12px 0" }}>
                
                {/* User Message Bubble */}
                <div style={{ 
                  alignSelf: "flex-end", 
                  maxWidth: "85%", 
                  background: "var(--bubble-user-bg)", 
                  border: "1px solid var(--bubble-user-border)", 
                  borderRadius: "16px 16px 2px 16px", 
                  padding: "14px 18px",
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontSize: "15px",
                  lineHeight: 1.5,
                  color: "var(--bright)"
                }}>
                  <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "var(--bubble-user-text-label)", marginBottom: "6px", letterSpacing: "0.08em", fontWeight: 700 }}>[PROMPT_INPUT]</div>
                  "{currentTemplate.baseTextBefore.trim()} {currentToken.label} {currentTemplate.baseTextAfter.trim()}"
                </div>

                {/* AI Response Bubble */}
                <div style={{ 
                  alignSelf: "flex-start", 
                  maxWidth: "85%", 
                  background: "var(--bubble-ai-bg)", 
                  border: "1px solid var(--bubble-ai-border)", 
                  borderRadius: "16px 16px 16px 2px", 
                  padding: "14px 18px",
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontSize: "15px",
                  lineHeight: 1.5,
                  color: "var(--bubble-ai-text)"
                }}>
                  <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "var(--muted)", marginBottom: "6px", letterSpacing: "0.08em", fontWeight: 700 }}>[LLM_RESPONSE]</div>
                  "Yes, targeting {currentToken.label} is highly viable! To validate this, you should set up social ads and track landing page clicks. Since {currentToken.label} typically have specific study/purchasing patterns, we predict a strong response with minimal friction..."
                </div>

                {/* Critical Flaw Alert Bubble */}
                <div style={{ 
                  background: "var(--bubble-flaw-bg)", 
                  border: "1px solid var(--bubble-flaw-border)", 
                  borderRadius: "10px", 
                  padding: "14px 18px",
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  color: "var(--bubble-flaw-text)"
                }}>
                  <strong style={{ color: "var(--bubble-flaw-title)" }}>CRITICAL FLAW:</strong> This is a language model predicting the most probable words. It has no network science, does not calculate actual small-world contagion, and cannot project exact peer resistance.
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

          {/* Stream B Column */}
          <div 
            className="workspace-column side-b"
            onMouseEnter={() => setHoveredSection("side-b")}
            onMouseLeave={() => setHoveredSection(null)}
            style={{
              opacity: hoveredSection === "side-a" ? 0.35 : 1,
              filter: hoveredSection === "side-a" ? "blur(1.5px)" : "none",
            }}
          >
            <div className="column-header">
              <span className="workspace-badge badge-green">STREAM_B // NOTAPROMPT DEEP COMPILATION</span>
              <div className="header-status">
                ACTIVE_CONTAGION_CASCADE
              </div>
            </div>

            <div className="column-body">
              {/* Dynamic Compilation Status Terminal */}
              <div style={{ background: "var(--terminal-bg)", borderRadius: "8px", padding: "14px 18px", border: "1px solid var(--terminal-border)", fontFamily: "var(--mono)", fontSize: "12px", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ color: "var(--accent)", borderBottom: "1px solid var(--terminal-header-border)", paddingBottom: "6px", display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold" }}>
                  <span>[PROMPT_COMPILER_V4.2]</span>
                  <span>{isCompiling ? "COMPILING..." : "READY"}</span>
                </div>
                {currentToken.compileLog.slice(0, compilerLineIdx).map((log, lIdx) => (
                  <div key={lIdx} style={{ color: lIdx === currentToken.compileLog.length - 1 ? "var(--accent)" : "var(--terminal-text-dim)" }}>
                    {lIdx === currentToken.compileLog.length - 1 ? "✓ " : "&gt; "} {log}
                  </div>
                ))}
              </div>

              {/* Visual Simulator SVG */}
              <div className="simulator-viz-panel" style={{ opacity: isCompiling ? 0.3 : 1, transition: "opacity 0.2s ease" }}>
                <svg width="100%" height="230" viewBox="0 0 440 280" style={{ background: "var(--svg-bg)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--svg-grid)" strokeWidth="1" />
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
                      ? "var(--accent)" 
                      : "var(--svg-edge)";
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
                    let fillColor = "var(--svg-node-fill)";
                    let strokeColor = "var(--svg-node-stroke)";
                    let filterGlow = "none";

                    if (n.state === "adopted") {
                      fillColor = "var(--accent)";
                      strokeColor = "var(--accent)";
                      filterGlow = "drop-shadow(0px 0px 6px var(--accent))";
                    } else if (n.state === "opposed") {
                      fillColor = "var(--oppose)";
                      strokeColor = "var(--oppose)";
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
                    boxShadow: "0 4px 14px var(--accent-glow)"
                  }}
                >
                  {isPlaying ? "⏸ PAUSE SIMULATION" : "▶ RUN LIVE CONTAGION CASCADES"}
                </button>
                <button className="btn-sim-reset" onClick={handleResetSimulation} disabled={isCompiling}>
                  ↺ RESET
                </button>
              </div>

              {/* Real-time Compiled Insights */}
              <div className="sim-analytics-output" style={{ border: "1px solid var(--terminal-border)" }}>
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
    </div>
  );
}
