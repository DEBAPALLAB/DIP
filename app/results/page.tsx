"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSimulation } from "@/lib/SimulationContext";
import { supabase } from "@/lib/supabase";
import AdoptionCurveSection from "@/components/results/AdoptionCurveSection";
import PersonaBreakdownSection from "@/components/results/PersonaBreakdownSection";
import KeyVoices from "@/components/results/KeyVoices";
import StrategicInsights from "@/components/results/StrategicInsights";
import ExportBar from "@/components/results/ExportBar";

export default function ResultsPage() {
    const router = useRouter();
    const sim = useSimulation();
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [chartMode, setChartMode] = useState<"percent" | "count" | "delta">("percent");
    const [parentAdoption, setParentAdoption] = useState<number | null>(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const simId = searchParams.get("id");

        async function init() {
            if (simId) {
                // If we already have this simulation loaded, don't reload
                if (sim.dbSimulationId === simId && sim.agents.length > 0) return;

                setInsightsLoading(true);
                const success = await sim.loadSimulationFromDb(simId);
                setInsightsLoading(false);

                if (!success) {
                    console.warn("Failed to load simulation, returning to dashboard.");
                    router.push("/dashboard");
                }
                return;
            }
        }
        init();
    }, [sim.agents.length, sim.dbSimulationId, sim.loadSimulationFromDb, router]);

    // Fetch parent data for comparison
    useEffect(() => {
        const fetchParent = async () => {
             const parentId = (sim.scenario as any)?.parent_id || (sim.scenario as any)?.configuration?.parent_id;
             if (!parentId) return;

             const { data, error } = await supabase
                .from("simulations")
                .select("results")
                .eq("id", parentId)
                .single();

             if (data?.results?.states) {
                const states = data.results.states;
                const total = Object.keys(states).length;
                const support = Object.values(states).filter((s: any) => s.decision === 'support').length;
                if (total > 0) setParentAdoption(Math.round((support / total) * 100));
             }
        };
        if (sim.dbSimulationId) fetchParent();
    }, [sim.dbSimulationId, sim.scenario]);

    useEffect(() => {
        if (sim.agents.length > 0 && !sim.insights && !insightsLoading && sim.flowStep === "complete") {
            generateInsights();
        }
    }, [sim.agents.length, sim.insights, sim.flowStep]);

    const generateInsights = async () => {
        setInsightsLoading(true);
        try {
            const total = sim.agents.length;
            const supportCount = Object.values(sim.agentStates).filter((s) => s.decision === "support").length;
            const opposeCount = Object.values(sim.agentStates).filter((s) => s.decision === "oppose").length;
            const adoptionPct = total > 0 ? Math.round((supportCount / total) * 100) : 0;
            const consensusScore = total > 0 ? (supportCount - opposeCount) / total : 0;

            const personaBreakdown: Record<string, { total: number; support: number }> = {};
            for (const a of sim.agents) {
                if (!personaBreakdown[a.persona]) personaBreakdown[a.persona] = { total: 0, support: 0 };
                personaBreakdown[a.persona].total++;
                if (sim.agentStates[a.id]?.decision === "support") personaBreakdown[a.persona].support++;
            }

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

    const handleExportCSV = () => {
        if (sim.agents.length === 0) return;
        const rows = sim.agents.map((a) => {
            const s = sim.agentStates[a.id];
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
        link.download = `${(sim.scenario?.label || "product").replace(/\s+/g, "-").toLowerCase()}-results-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const total = sim.agents.length;
    const supportCount = Object.values(sim.agentStates).filter((s) => s.decision === "support").length;
    const opposeCount = Object.values(sim.agentStates).filter((s) => s.decision === "oppose").length;
    const neutralCount = Math.max(total - supportCount - opposeCount, 0);
    const adoptionPct = total > 0 ? Math.round((supportCount / total) * 100) : 0;
    const oppositionPct = total > 0 ? Math.round((opposeCount / total) * 100) : 0;
    const undecidedPct = total > 0 ? Math.max(100 - adoptionPct - oppositionPct, 0) : 0;
    const consensusScore = total > 0 ? (supportCount - opposeCount) / total : 0;

    const latestSnapshot = sim.adoptionCurve[sim.adoptionCurve.length - 1];
    const previousSnapshot = sim.adoptionCurve[sim.adoptionCurve.length - 2];
    const supportDelta = latestSnapshot && previousSnapshot ? latestSnapshot.support - previousSnapshot.support : 0;
    const stepDelta = latestSnapshot && previousSnapshot
        ? (latestSnapshot.support + latestSnapshot.oppose) - (previousSnapshot.support + previousSnapshot.oppose)
        : 0;

    const supportStreak = useMemo(() => {
        let streak = 0;
        for (let i = sim.adoptionCurve.length - 1; i > 0; i--) {
            const prev = sim.adoptionCurve[i - 1];
            const curr = sim.adoptionCurve[i];
            if (curr.support >= prev.support) streak++;
            else break;
        }
        return streak;
    }, [sim.adoptionCurve]);

    const marketSignal = useMemo(() => {
        if (sim.insights) {
            const firstLine = sim.insights.split("\n").map((l) => l.trim()).find(Boolean);
            return firstLine || sim.insights;
        }
        if (latestSnapshot && previousSnapshot) {
            if (Math.abs(supportDelta) <= 1) {
                return `Adoption has stabilized at ${adoptionPct}%. The remaining ${undecidedPct}% undecided respondents are not moving yet.`;
            }
            if (supportDelta > 0) {
                return `Adoption is still climbing. +${supportDelta} agents shifted to support in the latest step.`;
            }
            return `Support softened by ${Math.abs(supportDelta)} agents in the latest step.`;
        }
        return "Awaiting more steps before the market signal becomes clear.";
    }, [adoptionPct, latestSnapshot, previousSnapshot, sim.insights, supportDelta, undecidedPct]);

    if (sim.agents.length === 0) {
        return (
            <div className="results-empty-state">
                <div className="results-empty-glow" />
                <div className="results-empty-orb">◉</div>
                <p>{insightsLoading ? "HYDRATING_SIMULATION..." : "FETCHING_DATA..."}</p>
            </div>
        );
    }

    return (
        <div className="results-root">
            <nav className="results-nav no-print results-nav-shell">
                <div className="results-brand-block">
                    <Link href="/dashboard" className="results-brand" style={{ textDecoration: "none" }}>
                        <span className="landing-nav-dot">◉</span>
                        <span>DI//PLATFORM</span>
                    </Link>
                    <div className="results-brand-meta">
                        {sim.scenario?.label || "Result"} · {sim.scenario?.tag || "Scenario"} · {total} respondents · GSS 2024
                    </div>
                </div>

                <div className="results-nav-actions" style={{ gap: 8 }}>
                    <button 
                        className="btn-cta" 
                        onClick={handleExportCSV}
                        style={{ background: "linear-gradient(180deg, var(--support), #13b19a)", boxShadow: "0 0 15px rgba(0,208,132,0.25)", color: "white", padding: "0 18px", height: "36px", border: "none", borderRadius: "100px", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, transform: "scale(1.05)", transition: "all 0.2s" }}
                    >
                       <span style={{ fontSize: 16 }}>💾</span> EXPORT CSV
                    </button>

                    <Link href="/dashboard" className="btn-ghost-setup" style={{ textDecoration: "none" }}>
                        DASHBOARD
                    </Link>
                    <button className="btn-ghost-setup" onClick={() => window.print()}>
                        PDF
                    </button>
                    <Link
                        href={sim.dbSimulationId ? `/simulate?id=${sim.dbSimulationId}` : "/simulate"}
                        className="btn-ghost-setup"
                        style={{ textDecoration: "none" }}
                    >
                        ← RETRY
                    </Link>
                </div>
            </nav>

            <div className="results-content results-content-shell">
                <section className="results-hero-card results-card">
                    <div className="results-hero-top">
                        <div>
                            <div className="results-hero-title">{sim.scenario?.label || "Product"}</div>
                            <div className="results-hero-subtitle">{sim.scenario?.tag || "Market simulation"}</div>
                        </div>

                        <div className="results-pill-row">
                            <span className="results-pill results-pill-support">{adoptionPct}% adopted</span>
                            {parentAdoption !== null && (
                                <span className={`results-pill results-delta ${adoptionPct >= parentAdoption ? 'pos' : 'neg'}`}>
                                    {adoptionPct >= parentAdoption ? '↑' : '↓'} {Math.abs(adoptionPct - parentAdoption)}% VS BASELINE
                                </span>
                            )}
                            <span className="results-pill results-pill-neutral military-hide">{undecidedPct}% undecided</span>
                            <span className="results-pill results-pill-oppose military-hide">{oppositionPct}% opposed</span>
                        </div>
                    </div>

                    <style jsx>{`
                        .results-delta {
                            background: rgba(255,255,255,0.05);
                            border: 1px solid rgba(255,255,255,0.1);
                            font-weight: 800 !important;
                        }
                        .results-delta.pos { color: var(--support); border-color: rgba(0, 208, 132, 0.3); }
                        .results-delta.neg { color: var(--oppose); border-color: rgba(255, 59, 59, 0.3); }
                        @media (max-width: 1000px) {
                            .military-hide { display: none; }
                        }
                    `}</style>
                </section>

                <div className="results-dashboard-grid">
                    <div className="results-dashboard-main">
                        <AdoptionCurveSection
                            history={sim.adoptionCurve}
                            total={total}
                            mode={chartMode}
                            onModeChange={setChartMode}
                        />

                        <section className="results-signal-card results-card">
                            <div className="results-signal-header">
                                <div>
                                    <h3 className="results-section-title" style={{ marginBottom: 6 }}>MARKET SIGNAL · STEP {sim.step}</h3>
                                    <div className="results-section-subtitle">CURRENT ADOPTION DYNAMICS AND CONSTRAINTS</div>
                                </div>
                                <span className="results-small-chip">Plateau detected</span>
                            </div>
                            <p className="results-signal-text">{marketSignal}</p>
                        </section>

                        <KeyVoices agents={sim.agents} states={sim.agentStates} />

                        <StrategicInsights insights={sim.insights} loading={insightsLoading} />
                    </div>

                    <aside className="results-dashboard-rail">
                        <section className="results-side-card results-card">
                            <div className="results-side-label">FINAL ADOPTION</div>
                            <div className="results-side-value">{adoptionPct}%</div>
                            <div className="results-side-sub">{supportCount} of {total} respondents</div>
                            <div className="results-side-chip">{supportDelta >= 0 ? `+${supportDelta}` : supportDelta} this run</div>
                        </section>

                        <section className="results-side-card results-card">
                            <div className="results-side-label">BREAKDOWN</div>
                            <div className="results-side-bars">
                                <div className="results-side-bar">
                                    <span>Adopted</span>
                                    <div className="results-side-track"><div className="results-side-fill support" style={{ width: `${adoptionPct}%` }} /></div>
                                </div>
                                <div className="results-side-bar">
                                    <span>Undecided</span>
                                    <div className="results-side-track"><div className="results-side-fill neutral" style={{ width: `${undecidedPct}%` }} /></div>
                                </div>
                                <div className="results-side-bar">
                                    <span>Opposed</span>
                                    <div className="results-side-track"><div className="results-side-fill oppose" style={{ width: `${oppositionPct}%` }} /></div>
                                </div>
                            </div>
                        </section>

                        <section className="results-side-card results-card">
                            <div className="results-side-label">MOMENTUM</div>
                            <div className="results-side-copy">
                                Peak gain: <span>{supportDelta > 0 ? `+${supportDelta}` : supportDelta} at step {latestSnapshot?.step ?? 0}</span>
                            </div>
                            <div className="results-side-copy">Stalled since: step {previousSnapshot ? previousSnapshot.step + 1 : 0}</div>
                            <div className="results-side-copy">Conversion rate: {stepDelta >= 0 ? "+" : ""}{stepDelta}/step</div>
                        </section>

                        <section className="results-side-card results-card">
                            <div className="results-side-label">CONSENSUS</div>
                            <div className="results-side-copy">Score: {consensusScore.toFixed(2)}</div>
                            <div className="results-side-copy">Neutral count: {neutralCount}</div>
                            <div className="results-side-copy">Support streak: {supportStreak} step{supportStreak === 1 ? "" : "s"}</div>
                        </section>
                    </aside>
                </div>

                <section className="results-section results-card">
                    <h3 className="results-section-title">KEY MOMENTS</h3>
                    <div className="results-moment-list">
                        {sim.adoptionCurve.slice(-4).map((snap, idx, arr) => {
                            const prev = idx > 0 ? arr[idx - 1] : undefined;
                            const delta = prev ? snap.support - prev.support : snap.support;
                            const label = idx === 0 ? "Early signal" : idx === arr.length - 1 ? "Latest plateau" : "Cascade shift";
                            return (
                                <div className="results-moment-row" key={`${snap.step}-${idx}`}>
                                    <div className="results-moment-step">Step {snap.step}</div>
                                    <div className="results-moment-dot" />
                                    <div className="results-moment-body">
                                        <div className="results-moment-title">{label}</div>
                                        <div className="results-moment-text">
                                            {delta >= 0 ? `+${delta}` : delta} support shift; {snap.neutral} undecided; {snap.oppose} opposed.
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <PersonaBreakdownSection agents={sim.agents} states={sim.agentStates} />

                <ExportBar
                    agents={sim.agents}
                    states={sim.agentStates}
                    productName={sim.scenario?.label || "product"}
                />
            </div>
        </div>
    );
}
