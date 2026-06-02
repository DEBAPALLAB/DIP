"use client";

import type { LogEntry } from "@/lib/types";
import { useRef } from "react";

interface StepLogProps {
    entries: LogEntry[];
}

export default function StepLog({ entries }: StepLogProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    if (entries.length === 0) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "var(--muted)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 12,
                    letterSpacing: "0.05em"
                }}
            >
                AWAITING FIRST STEP SEQUENCE
            </div>
        );
    }

    return (
        <div className="no-scrollbar" style={{ overflowY: "auto", height: "100%", padding: "16px", display: "flex", flexDirection: "column", gap: "28px" }}>
            {[...entries].reverse().map((entry, i) => {
                const dcColor =
                    entry.decision === "support" ? "#c8f135"
                        : entry.decision === "neutral" ? "#a0aec0"
                            : entry.decision === "oppose" ? "#ff4444"
                                : "var(--muted)";

                const bgTint =
                    entry.decision === "support" ? "rgba(200, 241, 53, 0.04)"
                        : entry.decision === "neutral" ? "rgba(255, 255, 255, 0.02)"
                            : entry.decision === "oppose" ? "rgba(255, 68, 68, 0.04)"
                                : "rgba(255, 255, 255, 0.01)";

                const borderTint =
                    entry.decision === "support" ? "rgba(200, 241, 53, 0.15)"
                        : entry.decision === "neutral" ? "rgba(255, 255, 255, 0.06)"
                            : entry.decision === "oppose" ? "rgba(255, 68, 68, 0.15)"
                                : "rgba(255, 255, 255, 0.04)";

                const ts = new Date(entry.timestamp).toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                });

                return (
                    <div key={`${entry.agentId}-${entry.step}-${i}`} style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                        {/* 1. USER/SYSTEM PROMPT BLOB */}
                        <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                            <div style={{ 
                                maxWidth: "85%",
                                padding: "12px 18px",
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.05)",
                                borderRadius: "18px 18px 4px 18px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--orange)", fontWeight: 700 }}>[SYSTEM_QUERY]</span>
                                    <span style={{ fontSize: "10px", color: "var(--muted)" }}>• STEP_0{entry.step}</span>
                                </div>
                                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: "1.5" }}>
                                    Evaluate decision for <strong style={{ color: "var(--bright)" }}>{entry.agentName}</strong> ({entry.persona}) under custom parameters.
                                </div>
                            </div>
                        </div>

                        {/* 2. AGENT RESPONSE BLOB */}
                        <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
                            <div style={{ 
                                maxWidth: "85%",
                                padding: "16px 20px",
                                background: bgTint,
                                border: `1px solid ${borderTint}`,
                                borderRadius: "18px 18px 18px 4px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--bright)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                            {entry.agentName}
                                        </span>
                                        <span style={{ fontSize: "9px", fontFamily: "var(--mono)", color: "var(--muted)", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px" }}>
                                            {entry.persona.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ 
                                            fontSize: "10px", 
                                            fontWeight: 900, 
                                            color: dcColor, 
                                            textTransform: "uppercase", 
                                            letterSpacing: "0.08em",
                                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                                        }}>
                                            {entry.decision}
                                        </span>
                                        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)" }}>{ts}</span>
                                    </div>
                                </div>
                                <div style={{ 
                                    fontSize: "13px", 
                                    color: "rgba(255,255,255,0.85)", 
                                    lineHeight: "1.6", 
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    fontWeight: 400
                                }}>
                                    {entry.reasoning}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
}
