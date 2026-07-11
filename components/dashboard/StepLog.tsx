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
                    fontFamily: "var(--sans)",
                    fontSize: 12.5,
                }}
            >
                No decisions yet — run a step.
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
                    <div
                        key={`${entry.agentId}-${entry.step}-${i}`}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            width: "100%",
                            padding: "12px 14px",
                            background: bgTint,
                            border: `1px solid ${borderTint}`,
                            borderRadius: "10px",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: dcColor, flexShrink: 0 }} />
                            <span style={{ fontFamily: "var(--sans)", fontSize: "12.5px", fontWeight: 700, color: "var(--bright)" }}>
                                {entry.agentName}
                            </span>
                            <span style={{ fontFamily: "var(--sans)", fontSize: "11px", color: "var(--muted)" }}>
                                {entry.persona}
                            </span>
                            <span style={{ fontFamily: "var(--sans)", fontSize: "10.5px", fontWeight: 700, color: dcColor, marginLeft: "auto", textTransform: "capitalize" }}>
                                {entry.decision}
                            </span>
                            <span style={{ fontSize: "10px", color: "var(--muted)", fontFamily: "var(--sans)" }}>{ts}</span>
                        </div>
                        <div style={{ fontFamily: "var(--sans)", fontSize: "12px", color: "var(--text)", lineHeight: "1.5" }}>
                            {entry.reasoning}
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
}
