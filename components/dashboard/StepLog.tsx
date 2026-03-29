"use client";

import type { LogEntry } from "@/lib/types";
import { useEffect, useRef } from "react";

interface StepLogProps {
    entries: LogEntry[];
}

export default function StepLog({ entries }: StepLogProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll removed as it causes layout jumps and is incorrect for reversed lists (newest at top)

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
                }}
            >
                AWAITING FIRST STEP
            </div>
        );
    }

    return (
        <div className="no-scrollbar" style={{ overflowY: "auto", height: "100%" }}>
            {[...entries].reverse().map((entry, i) => {
                const dc =
                    entry.decision === "support" ? "var(--support)"
                        : entry.decision === "neutral" ? "var(--neutral)"
                            : entry.decision === "oppose" ? "var(--oppose)"
                                : "var(--muted)";

                const ts = new Date(entry.timestamp).toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                });

                return (
                    <div key={`${entry.agentId}-${entry.step}-${i}`} className="log-entry">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>
                                    S{entry.step}
                                </span>
                                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--bright)", fontWeight: 600 }}>
                                    {entry.agentName}
                                </span>
                                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>
                                    {entry.persona}
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: dc, fontWeight: 700, textTransform: "uppercase" }}>
                                    {entry.decision}
                                </span>
                                <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--muted)" }}>
                                    {ts}
                                </span>
                            </div>
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.4 }}>
                            {entry.reasoning}
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
}
