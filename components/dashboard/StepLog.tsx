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
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: "0.08em"
                }}
            >
                AWAITING FIRST STEP SEQUENCE
            </div>
        );
    }

    return (
        <div className="no-scrollbar" style={{ overflowY: "auto", height: "100%", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {[...entries].reverse().map((entry, i) => {
                const dcColor =
                    entry.decision === "support" ? "var(--support)"
                        : entry.decision === "neutral" ? "var(--neutral)"
                            : entry.decision === "oppose" ? "var(--oppose)"
                                : "var(--muted)";

                const bgTint =
                    entry.decision === "support" ? "var(--chip-bg)"
                        : entry.decision === "neutral" ? "rgba(0, 0, 0, 0.01)"
                            : "rgba(255, 68, 68, 0.02)";

                const borderTint = "var(--border)";

                const ts = new Date(entry.timestamp).toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                });

                return (
                    <div key={`${entry.agentId}-${entry.step}-${i}`} style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                        {/* 1. USER/SYSTEM PROMPT BLOB */}
                        <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                            <div style={{ 
                                maxWidth: "90%",
                                padding: "10px 14px",
                                background: "var(--chip-bg)",
                                border: "1px solid var(--chip-border)",
                                borderRadius: "4px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--orange)", fontWeight: 700 }}>[SYSTEM_QUERY]</span>
                                    <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)" }}>• STEP_0{entry.step}</span>
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--text)", lineHeight: "1.4" }}>
                                    Evaluate decision for <strong style={{ color: "var(--bright)" }}>{entry.agentName}</strong> ({entry.persona}) under custom parameters.
                                </div>
                            </div>
                        </div>

                        {/* 2. AGENT RESPONSE BLOB */}
                        <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
                            <div style={{ 
                                maxWidth: "90%",
                                padding: "12px 16px",
                                background: bgTint,
                                border: `1px solid ${borderTint}`,
                                borderRadius: "4px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--bright)" }}>
                                            {entry.agentName}
                                        </span>
                                        <span style={{ fontSize: "8px", fontFamily: "var(--mono)", color: "var(--muted)", background: "var(--chip-bg)", border: "1px solid var(--chip-border)", padding: "1px 4px", borderRadius: "2px" }}>
                                            {entry.persona.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ 
                                            fontSize: "9px", 
                                            fontWeight: 900, 
                                            color: dcColor, 
                                            textTransform: "uppercase", 
                                            letterSpacing: "0.05em",
                                            fontFamily: "var(--mono)"
                                        }}>
                                            {entry.decision}
                                        </span>
                                        <span style={{ fontSize: "8px", color: "var(--muted)", fontFamily: "var(--mono)" }}>{ts}</span>
                                    </div>
                                </div>
                                <div style={{ 
                                    fontSize: "12px", 
                                    color: "var(--text)", 
                                    lineHeight: "1.5",
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
