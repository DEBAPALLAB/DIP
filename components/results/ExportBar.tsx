"use client";

import type { Agent, SimulationStates } from "@/lib/types";

interface ExportBarProps {
    agents: Agent[];
    states: SimulationStates;
    productName: string;
}

export default function ExportBar({ agents, states, productName }: ExportBarProps) {
    const exportPDF = () => {
        window.print();
    };

    const exportCSV = () => {
        if (agents.length === 0) return;

        const rows = agents.map((a) => {
            const s = states[a.id];
            return {
                id: a.id,
                name: a.name,
                persona: a.persona,
                age: a.age,
                job: a.job,
                decision: s?.decision ?? "none",
                reasoning: `"${(s?.reasoning ?? "").replace(/"/g, "'")}"`,
                risk: a.risk,
                trust: a.trust,
                social: a.social,
                income: a.income,
                influence: a.influence_score,
            };
        });

        const header = Object.keys(rows[0]).join(",");
        const csv = [header, ...rows.map((r) => Object.values(r).join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-results-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="results-export-bar no-print">
            <button className="btn-cta" onClick={exportPDF}>
                ↓ Export PDF
            </button>
            <button className="btn-cta" onClick={exportCSV}>
                ↓ Export CSV
            </button>
            <button className="btn-ghost-setup" disabled title="Coming soon — see ROADMAP.md">
                Run A/B Test →
            </button>
        </div>
    );
}
