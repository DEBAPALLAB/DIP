"use client";

import type { SimulationStates, StepSnapshot } from "@/lib/types";

import { pct, consensusLabel } from "@/lib/simulation";

interface TopBarProps {
    step: number;
    running: boolean;
    states: SimulationStates;
    history: StepSnapshot[];
    scenarioLabel: string;
    agentCount: number;
}

export default function TopBar({ step, running, states, history, scenarioLabel, agentCount }: TopBarProps) {
    const total = agentCount;
    const support = Object.values(states).filter((s) => s.decision === "support").length;
    const neutral = Object.values(states).filter((s) => s.decision === "neutral").length;
    const oppose = Object.values(states).filter((s) => s.decision === "oppose").length;
    const pending = Object.values(states).filter((s) => s.decision === null).length;

    const lastSnapshot = history[history.length - 1];
    const prevSnapshot = history[history.length - 2];

    const delta = lastSnapshot && prevSnapshot
        ? lastSnapshot.support - prevSnapshot.support
        : 0;

    return (
        <div className="ticker-bar" style={{ 
            height: 48, 
            background: "rgba(13, 12, 11, 0.8)", 
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: "0 24px"
        }}>
            {/* Live indicator */}
            <div className="ticker-item" style={{ padding: "0 20px 0 0", gap: 10, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                {running && <div className="landing-nav-dot" style={{ width: 8, height: 8, background: "var(--support)", boxShadow: "0 0 15px var(--support)" }} />}
                {!running && <div style={{ width: 6, height: 6, borderRadius: "50%", background: step === 0 ? "var(--support)" : "var(--muted)", opacity: 0.6 }} />}
                <span className="ticker-label" style={{ 
                    color: running ? "var(--support)" : "var(--muted)",
                    fontSize: "9px",
                    fontWeight: 800,
                    letterSpacing: "0.2em"
                }}>
                    {running ? "LIVE_COMPUTE" : "SYS_STABLE"}
                </span>
            </div>

            {/* Scenario - THE EDITORIAL TOUCH */}
            <div className="ticker-item" style={{ borderRight: "1px solid rgba(255,255,255,0.06)", padding: "0 24px" }}>
                <span className="ticker-label" style={{ marginRight: 12 }}>STRATEGY</span>
                <span style={{ 
                    fontFamily: "'Plus Jakarta Sans', sans-serif", 
                    color: "var(--bright)", 
                    fontSize: "14px", 
                    fontWeight: 700,
                    letterSpacing: "-0.01em"
                }}>
                    {scenarioLabel}
                </span>
            </div>

            {/* Stats Group */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, height: "100%" }}>
                <div className="ticker-item">
                    <span className="ticker-label">EPOCH</span>
                    <span className="ticker-val" style={{ color: "var(--bright)", fontWeight: 700 }}>{step}</span>
                </div>

                <div className="ticker-item">
                    <span className="ticker-label">ADOPTION</span>
                    <span className="ticker-val" style={{ color: "var(--support)", fontSize: "14px", fontWeight: 800 }}>
                        {pct(support, total)}
                    </span>
                </div>

                <div className="ticker-item">
                    <span className="ticker-label">FRICTION</span>
                    <span className="ticker-val" style={{ color: "var(--neutral)" }}>
                        {pct(neutral, total)}
                    </span>
                </div>

                <div className="ticker-item">
                    <span className="ticker-label">RESISTANCE</span>
                    <span className="ticker-val" style={{ color: "var(--oppose)" }}>
                        {pct(oppose, total)}
                    </span>
                </div>
            </div>

            {/* Consensus */}
            <div className="ticker-item" style={{ marginLeft: "auto", borderRight: "none", borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: "32px" }}>
                <span className="ticker-label" style={{ marginRight: 12 }}>MARKET_STATE</span>
                <span style={{ 
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    fontWeight: 900,
                    color: "var(--support)", 
                    letterSpacing: "0.15em",
                    textTransform: "uppercase"
                }}>
                    {consensusLabel(states)}
                </span>
            </div>
        </div>
    );
}
