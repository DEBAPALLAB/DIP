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
            height: 44, 
            background: "rgba(4, 6, 8, 0.9)", 
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "0 12px"
        }}>
            {/* Live indicator */}
            <div className="ticker-item" style={{ padding: "0 16px", gap: 8, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                {running && <div className="landing-nav-dot" style={{ width: 8, height: 8, background: "var(--orange)", boxShadow: "0 0 10px var(--orange)" }} />}
                {!running && <div style={{ width: 6, height: 6, borderRadius: "50%", background: step === 0 ? "var(--support)" : "var(--muted)", opacity: 0.6 }} />}
                <span className="ticker-label" style={{ 
                    color: running ? "var(--orange)" : "var(--muted)",
                    fontSize: "9px",
                    letterSpacing: "0.15em"
                }}>
                    {running ? "COMPUTING_SIGNAL" : step === 0 ? "SYSTEM_READY" : "EXECUTION_PAUSED"}
                </span>
            </div>

            {/* Scenario */}
            <div className="ticker-item" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="ticker-label">SCENARIO</span>
                <span className="ticker-val" style={{ color: "var(--bright)", fontWeight: 500, fontSize: "11px" }}>
                    {scenarioLabel}
                </span>
            </div>

            {/* Step */}
            <div className="ticker-item" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="ticker-label">EPOCH</span>
                <span className="ticker-val" style={{ color: "var(--orange)" }}>{step}</span>
            </div>

            {/* Support */}
            <div className="ticker-item" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="ticker-label">ADOPTION</span>
                <span className="ticker-val" style={{ color: "var(--support)", fontSize: "12px" }}>
                    {pct(support, total)}
                </span>
                {delta !== 0 && (
                    <span className="results-side-chip" style={{ 
                        marginTop: 0, padding: "2px 6px", 
                        background: delta > 0 ? "rgba(0, 208, 132, 0.15)" : "rgba(255, 68, 68, 0.15)",
                        color: delta > 0 ? "var(--support)" : "var(--oppose)",
                        border: "none",
                        fontSize: "9px"
                    }}>
                        {delta > 0 ? "+" : ""}{delta}
                    </span>
                )}
            </div>

            {/* Neutral */}
            <div className="ticker-item" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="ticker-label">FRICTION</span>
                <span className="ticker-val" style={{ color: "var(--neutral)" }}>
                    {pct(neutral, total)}
                </span>
            </div>

            {/* Oppose */}
            <div className="ticker-item" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="ticker-label">RESISTANCE</span>
                <span className="ticker-val" style={{ color: "var(--oppose)" }}>
                    {pct(oppose, total)}
                </span>
            </div>

            {/* Pending */}
            <div className="ticker-item" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="ticker-label">UNEXPOSED</span>
                <span className="ticker-val" style={{ color: "var(--pending)" }}>
                    {pending}
                </span>
            </div>

            {/* Consensus */}
            <div className="ticker-item" style={{ marginLeft: "auto", borderRight: "none", borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: "24px" }}>
                <span className="ticker-label">STABILITY</span>
                <span className="ticker-val" style={{ 
                    color: "var(--orange)", 
                    textShadow: "0 0 15px rgba(255, 107, 53, 0.3)",
                    letterSpacing: "0.05em"
                }}>
                    {consensusLabel(states).toUpperCase()}
                </span>
            </div>
        </div>
    );
}
