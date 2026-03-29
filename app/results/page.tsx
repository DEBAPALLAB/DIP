"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSimulation } from "@/lib/SimulationContext";
import ResultsHeader from "@/components/results/ResultsHeader";
import AdoptionCurveSection from "@/components/results/AdoptionCurveSection";
import PersonaBreakdownSection from "@/components/results/PersonaBreakdownSection";
import KeyVoices from "@/components/results/KeyVoices";
import StrategicInsights from "@/components/results/StrategicInsights";
import ExportBar from "@/components/results/ExportBar";

export default function ResultsPage() {
    const router = useRouter();
    const sim = useSimulation();
    const [insightsLoading, setInsightsLoading] = useState(false);

    // Route guard & DB Loader
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const simId = searchParams.get('id');

        async function init() {
            if (simId) {
                setInsightsLoading(true);
                const success = await sim.loadSimulationFromDb(simId);
                setInsightsLoading(false);
                if (!success) router.push("/dashboard");
                return;
            }

            if (sim.flowStep !== "complete" && sim.agents.length === 0) {
                router.push("/simulate");
            }
        }
        init();
    }, [sim.flowStep, sim.agents.length, router, sim]);

    // Generate insights on mount if not already present
    useEffect(() => {
        if (sim.agents.length > 0 && !sim.insights && !insightsLoading) {
            generateInsights();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sim.agents.length, sim.insights]);

    const generateInsights = async () => {
        setInsightsLoading(true);
        try {
            const total = sim.agents.length;
            const supportCount = Object.values(sim.agentStates).filter(
                (s) => s.decision === "support"
            ).length;
            const opposeCount = Object.values(sim.agentStates).filter(
                (s) => s.decision === "oppose"
            ).length;
            const adoptionPct = total > 0 ? Math.round((supportCount / total) * 100) : 0;
            const consensusScore = total > 0 ? (supportCount - opposeCount) / total : 0;

            // Persona breakdown
            const personaBreakdown: Record<string, { total: number; support: number }> = {};
            for (const a of sim.agents) {
                if (!personaBreakdown[a.persona]) personaBreakdown[a.persona] = { total: 0, support: 0 };
                personaBreakdown[a.persona].total++;
                if (sim.agentStates[a.id]?.decision === "support") personaBreakdown[a.persona].support++;
            }

            // Top quotes
            const supportAgents = sim.agents
                .filter((a) => sim.agentStates[a.id]?.decision === "support" && sim.agentStates[a.id]?.reasoning)
                .sort((a, b) => b.influence_score - a.influence_score)
                .slice(0, 3);

            const opposeAgents = sim.agents
                .filter((a) => sim.agentStates[a.id]?.decision === "oppose" && sim.agentStates[a.id]?.reasoning)
                .sort((a, b) => b.influence_score - a.influence_score)
                .slice(0, 3);

            const res = await fetch("/api/generate-insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productName: sim.scenario?.label || "Product",
                    productBrief: sim.scenario?.brief || "",
                    adoptionPct,
                    consensusScore: consensusScore.toFixed(2),
                    personaBreakdown,
                    topSupportQuotes: supportAgents.map((a) => ({
                        agent: a.name,
                        persona: a.persona,
                        reasoning: sim.agentStates[a.id]?.reasoning || "",
                    })),
                    topOpposeQuotes: opposeAgents.map((a) => ({
                        agent: a.name,
                        persona: a.persona,
                        reasoning: sim.agentStates[a.id]?.reasoning || "",
                    })),
                }),
            });

            if (res.ok) {
                const data = await res.json();
                sim.setInsights(data.insights);
            }
        } catch (err) {
            console.error("Failed to generate insights:", err);
        } finally {
            setInsightsLoading(false);
        }
    };

    // Compute stats
    const total = sim.agents.length;
    const supportCount = Object.values(sim.agentStates).filter((s) => s.decision === "support").length;
    const opposeCount = Object.values(sim.agentStates).filter((s) => s.decision === "oppose").length;
    const adoptionPct = total > 0 ? Math.round((supportCount / total) * 100) : 0;
    const oppositionPct = total > 0 ? Math.round((opposeCount / total) * 100) : 0;
    const consensusScore = total > 0 ? (supportCount - opposeCount) / total : 0;

    if (sim.agents.length === 0) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
                <p style={{ color: "var(--muted)", fontFamily: "var(--mono)" }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="results-root">
            {/* Nav */}
            <nav className="results-nav no-print">
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Link href="/" className="landing-nav-brand" style={{ textDecoration: "none" }}>
                        <span className="landing-nav-dot">◉</span> DI//PLATFORM
                    </Link>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)" }}>
                        {sim.scenario?.label || "Result"} · {total} agents
                    </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-ghost-setup" onClick={() => window.print()}>
                        Export PDF
                    </button>
                    <Link 
                        href={sim.dbSimulationId ? `/simulate?id=${sim.dbSimulationId}` : "/simulate"} 
                        className="btn-ghost-setup" style={{ textDecoration: "none" }}
                    >
                        ← Sim
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <div className="results-content">
                <ResultsHeader
                    adoptionPct={adoptionPct}
                    consensusScore={consensusScore}
                    oppositionPct={oppositionPct}
                    stepCount={sim.step}
                    agentCount={total}
                    productName={sim.scenario?.label || "Product"}
                />

                <div className="results-two-col">
                    <AdoptionCurveSection history={sim.adoptionCurve} total={total} />
                    <PersonaBreakdownSection agents={sim.agents} states={sim.agentStates} />
                </div>

                <KeyVoices agents={sim.agents} states={sim.agentStates} />

                <StrategicInsights insights={sim.insights} loading={insightsLoading} />

                <ExportBar
                    agents={sim.agents}
                    states={sim.agentStates}
                    productName={sim.scenario?.label || "product"}
                />
            </div>
        </div>
    );
}
