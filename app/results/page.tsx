"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSimulation } from "@/lib/SimulationContext";
import { apiFetch } from "@/lib/apiClient";
import { supabase } from "@/lib/supabase";
import AdoptionCurveSection from "@/components/results/AdoptionCurveSection";
import PersonaBreakdownSection from "@/components/results/PersonaBreakdownSection";
import KeyVoices from "@/components/results/KeyVoices";
import StrategicInsights from "@/components/results/StrategicInsights";
import ExportBar from "@/components/results/ExportBar";
import { Navbar } from "@/components/marketing/Navbar";

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
            if (!sim.hydrated) return; // Wait for context hydration to finish!

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
    }, [sim.hydrated, sim.agents.length, sim.dbSimulationId, sim.loadSimulationFromDb, router]);

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

            const res = await apiFetch("/api/generate-insights", {
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

    const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const simId = searchParams.get("id");
    const isMismatch = simId && sim.dbSimulationId !== simId;

    if (sim.agents.length === 0 || isMismatch || !sim.hydrated) {
        return (
            <div className="results-empty-state">
                <div className="results-empty-glow" />
                <div className="results-empty-orb">◉</div>
                <p>{(!sim.hydrated || insightsLoading || isMismatch) ? "HYDRATING_SIMULATION..." : "FETCHING_DATA..."}</p>
            </div>
        );
    }

    return (
        <div className="marketing-theme" style={{ minHeight: "100vh", background: "radial-gradient(900px circle at 50% -120px, rgba(0, 82, 255, 0.08) 0%, transparent 62%), linear-gradient(180deg, rgba(0, 82, 255, 0.03) 0%, rgba(0, 82, 255, 0.012) 220px, rgba(250, 249, 246, 0.98) 360px, var(--bg) 540px)", display: "flex", flexDirection: "column", fontFamily: "var(--sans)", position: "relative", paddingTop: "82px" }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .marketing-theme .results-root {
                    background: var(--bg) !important;
                    color: var(--text) !important;
                    position: relative;
                    z-index: 1;
                }
                .marketing-theme .results-card {
                    background: var(--panel) !important;
                    border: 1px solid var(--border) !important;
                    box-shadow: 0 10px 30px rgba(0, 82, 255, 0.02) !important;
                    backdrop-filter: blur(18px) !important;
                    border-radius: 24px !important;
                }
                .marketing-theme .results-voice-card {
                    background: rgba(255, 255, 255, 0.45) !important;
                    border: 1px solid var(--border) !important;
                    border-radius: 16px !important;
                    box-shadow: 0 8px 24px rgba(0, 82, 255, 0.01) !important;
                    padding: 20px !important;
                }
                .marketing-theme .results-voice-quote {
                    color: var(--text) !important;
                    font-style: italic !important;
                    font-size: 13.5px !important;
                    line-height: 1.5 !important;
                }
                .marketing-theme .results-voice-name {
                    color: var(--bright) !important;
                    font-weight: 700 !important;
                    font-size: 14px !important;
                }
                .marketing-theme .results-voice-step {
                    color: var(--accent) !important;
                    background: rgba(0, 82, 255, 0.06) !important;
                    border: 1px solid rgba(0, 82, 255, 0.12) !important;
                    border-radius: 6px !important;
                    padding: 2px 8px !important;
                }
                .marketing-theme .results-voice-persona {
                    font-family: var(--mono) !important;
                    font-weight: 700 !important;
                    font-size: 10px !important;
                    letter-spacing: 0.05em;
                }
                .marketing-theme .results-persona-row {
                    border-bottom: 1px solid var(--border) !important;
                    padding: 14px 0 !important;
                }
                .marketing-theme .results-persona-name {
                    color: var(--bright) !important;
                    font-weight: 600 !important;
                }
                .marketing-theme .results-persona-bar-bg {
                    background: rgba(0, 0, 0, 0.04) !important;
                    border-radius: 99px !important;
                }
                .marketing-theme .results-persona-pct {
                    color: var(--bright) !important;
                    font-weight: 700 !important;
                    font-family: var(--mono) !important;
                }
                .marketing-theme .results-insights-card {
                    background: rgba(255, 255, 255, 0.45) !important;
                    border: 1px solid var(--border) !important;
                    border-radius: 20px !important;
                    padding: 24px !important;
                }
                .marketing-theme .results-insight-block {
                    border-bottom: 1px solid var(--border) !important;
                    padding-bottom: 18px !important;
                    margin-bottom: 18px !important;
                }
                .marketing-theme .results-insight-block:last-child {
                    border-bottom: none !important;
                    padding-bottom: 0 !important;
                    margin-bottom: 0 !important;
                }
                .marketing-theme .results-insight-label {
                    color: var(--accent) !important;
                    font-family: var(--mono) !important;
                    font-weight: 800 !important;
                    font-size: 11px !important;
                    letter-spacing: 0.1em;
                }
                .marketing-theme .results-insight-text {
                    color: var(--text) !important;
                    font-size: 14px !important;
                    line-height: 1.6 !important;
                }
                .marketing-theme .results-side-card {
                    padding: 24px !important;
                }
                .marketing-theme .results-side-fill {
                    border-radius: 99px !important;
                }
                .marketing-theme .results-side-fill.support {
                    background: var(--accent) !important;
                }
                .marketing-theme .results-side-fill.neutral {
                    background: var(--muted) !important;
                }
                .marketing-theme .results-side-fill.oppose {
                    background: #ff3b3b !important;
                }
                .marketing-theme .results-side-track {
                    background: rgba(0, 0, 0, 0.05) !important;
                    border-radius: 99px !important;
                }
                .marketing-theme .results-moment-row {
                    border-left: 2px solid var(--border) !important;
                    padding-left: 18px !important;
                }
                .marketing-theme .results-moment-dot {
                    border: 2px solid var(--bg) !important;
                    background: var(--accent) !important;
                }
                .marketing-theme .results-moment-title {
                    color: var(--bright) !important;
                }
                .marketing-theme .results-moment-text {
                    color: var(--muted) !important;
                }
                .marketing-theme .results-hero-title {
                    color: var(--bright) !important;
                }
                .marketing-theme .results-hero-subtitle {
                    color: var(--muted) !important;
                }
                .marketing-theme .results-pill-row {
                    gap: 10px;
                }
                .marketing-theme .results-pill {
                    background: rgba(0, 0, 0, 0.03) !important;
                    border: 1px solid rgba(0, 0, 0, 0.05) !important;
                    color: var(--text) !important;
                }
                .marketing-theme .results-pill-support {
                    background: rgba(0, 82, 255, 0.08) !important;
                    border-color: rgba(0, 82, 255, 0.15) !important;
                    color: var(--accent) !important;
                }
                .marketing-theme .results-pill-neutral {
                    background: rgba(0, 0, 0, 0.04) !important;
                    border-color: rgba(0, 0, 0, 0.08) !important;
                    color: var(--muted) !important;
                }
                .marketing-theme .results-pill-oppose {
                    background: rgba(255, 59, 59, 0.08) !important;
                    border-color: rgba(255, 59, 59, 0.15) !important;
                    color: #ff3b3b !important;
                }
                .marketing-theme .results-delta.pos {
                    color: var(--accent) !important;
                    background: rgba(0, 82, 255, 0.08) !important;
                    border-color: rgba(0, 82, 255, 0.15) !important;
                }
                .marketing-theme .results-delta.neg {
                    color: #ff3b3b !important;
                    background: rgba(255, 59, 59, 0.08) !important;
                    border-color: rgba(255, 59, 59, 0.15) !important;
                }
                .marketing-theme .results-section-title {
                    color: var(--bright) !important;
                }
                .marketing-theme .results-section-subtitle {
                    color: var(--muted) !important;
                }
                .marketing-theme .results-small-chip {
                    background: rgba(0, 0, 0, 0.04) !important;
                    color: var(--muted) !important;
                    border: 1px solid rgba(0, 0, 0, 0.08) !important;
                }
                .marketing-theme .results-side-label {
                    color: var(--muted) !important;
                }
                .marketing-theme .results-side-value {
                    color: var(--bright) !important;
                }
                .marketing-theme .results-side-sub {
                    color: var(--muted) !important;
                }
                .marketing-theme .results-side-chip {
                    background: rgba(0, 82, 255, 0.08) !important;
                    border-color: rgba(0, 82, 255, 0.15) !important;
                    color: var(--accent) !important;
                }
                .marketing-theme .results-side-copy {
                    color: var(--muted) !important;
                }
                .marketing-theme .results-side-copy span {
                    color: var(--bright) !important;
                }
                .marketing-theme .btn-v2-primary {
                    background: linear-gradient(135deg, var(--accent) 0%, #2a76ff 100%) !important;
                    color: #fff !important;
                    border: 1px solid var(--accent) !important;
                    font-family: var(--sans) !important;
                    font-size: 11px !important;
                    font-weight: 800 !important;
                    letter-spacing: 0.05em !important;
                    border-radius: 99px !important;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    box-shadow: 0 4px 15px rgba(0, 82, 255, 0.15) !important;
                    text-transform: uppercase !important;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .marketing-theme .btn-v2-primary:hover {
                    background: var(--bright) !important;
                    border-color: var(--bright) !important;
                    color: var(--bg) !important;
                    box-shadow: 0 8px 25px rgba(0, 82, 255, 0.25) !important;
                    transform: translateY(-2px);
                }
                .marketing-theme .btn-v2-ghost {
                    background: rgba(255, 255, 255, 0.58) !important;
                    color: var(--text) !important;
                    border: 1px solid var(--border) !important;
                    font-family: var(--sans) !important;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.04em !important;
                    border-radius: 99px !important;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    text-transform: uppercase !important;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }
                .marketing-theme .btn-v2-ghost:hover:not(:disabled) {
                    color: var(--bright) !important;
                    border-color: var(--border-bright) !important;
                    background: rgba(255, 255, 255, 0.85) !important;
                    box-shadow: 0 6px 20px rgba(0, 82, 255, 0.03) !important;
                    transform: translateY(-2px);
                }
                @keyframes line-pulse {
                    0% { opacity: 0.03; }
                    100% { opacity: 0.12; }
                }
                .tactical-line {
                    animation: line-pulse 4s infinite alternate ease-in-out;
                }
            `}} />

            {/* Volumetric blurred curtain columns & background gradients */}
            <div 
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "850px",
                    background: `
                        radial-gradient(550px circle at 0% 0%, rgba(0, 82, 255, 0.2) 0%, transparent 100%),
                        radial-gradient(550px circle at 100% 0%, rgba(0, 82, 255, 0.2) 0%, transparent 100%),
                        radial-gradient(500px 280px ellipse at 50% 0%, rgba(0, 82, 255, 0.08) 0%, transparent 100%)
                    `,
                    pointerEvents: "none",
                    zIndex: 0,
                    overflow: "hidden"
                }}
            >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "450px", display: "flex", justifyContent: "space-between", padding: "0 8vw", opacity: 0.06, overflow: "hidden" }}>
                    <div style={{ width: "65px", height: "100%", background: "linear-gradient(180deg, rgba(0, 82, 255, 0.5) 0%, transparent 100%)", filter: "blur(12px)" }} />
                    <div style={{ width: "110px", height: "100%", background: "linear-gradient(180deg, rgba(0, 82, 255, 0.4) 0%, transparent 100%)", filter: "blur(20px)" }} />
                    <div style={{ width: "85px", height: "100%", background: "linear-gradient(180deg, rgba(0, 82, 255, 0.45) 0%, transparent 100%)", filter: "blur(16px)" }} />
                    <div style={{ width: "135px", height: "100%", background: "linear-gradient(180deg, rgba(0, 82, 255, 0.35) 0%, transparent 100%)", filter: "blur(24px)" }} />
                    <div style={{ width: "75px", height: "100%", background: "linear-gradient(180deg, rgba(0, 82, 255, 0.5) 0%, transparent 100%)", filter: "blur(14px)" }} />
                    <div style={{ width: "100px", height: "100%", background: "linear-gradient(180deg, rgba(0, 82, 255, 0.4) 0%, transparent 100%)", filter: "blur(18px)" }} />
                </div>
            </div>
            <div className="noise-overlay" />

            {/* Decorative Grid Lines */}
            <div className="tactical-line" style={{ position: "fixed", top: 0, left: "40px", width: "1px", height: "100%", background: "var(--border)", zIndex: 0 }} />
            <div className="tactical-line" style={{ position: "fixed", top: 0, right: "40px", width: "1px", height: "100%", background: "var(--border)", zIndex: 0 }} />

            <Navbar />

            <div className="results-root" style={{ flex: 1, marginTop: "48px" }}>
                <div className="results-content results-content-shell" style={{ maxWidth: "1400px", margin: "0 auto", padding: "48px 40px 40px", position: "relative", zIndex: 1 }}>
                    
                    {/* Integrated Page Header / Command Section */}
                    <section className="results-command no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px", marginBottom: "28px", flexWrap: "wrap" }}>
                        <div>
                            <span className="eyebrow" style={{ display: "block", marginBottom: "8px", color: "var(--accent)", fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>
                                <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>DASHBOARD</Link> / {sim.scenario?.label?.toUpperCase() || "RESULT"}
                            </span>
                            <h1 style={{ color: "var(--bright)", fontFamily: "var(--heading)", fontSize: "44px", fontWeight: 800, lineHeight: 1, margin: 0 }}>
                                Simulation Results
                            </h1>
                            <p style={{ marginTop: "10px", color: "var(--muted)", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
                                {sim.scenario?.tag || "Scenario"} · {total} respondents · GSS 2024
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                            <button 
                                className="btn-v2-primary" 
                                onClick={handleExportCSV}
                                style={{ height: "42px", padding: "0 20px", borderRadius: "8px", fontSize: "12px", textTransform: "none", letterSpacing: 0, fontWeight: 700 }}
                            >
                                💾 Export CSV
                            </button>
                            <button 
                                className="btn-v2-ghost" 
                                onClick={() => window.print()} 
                                style={{ height: "42px", padding: "0 18px", borderRadius: "8px", fontSize: "12px", textTransform: "none", letterSpacing: 0, fontWeight: 700 }}
                            >
                                Print PDF
                            </button>
                            <Link
                                href={sim.dbSimulationId ? `/simulate?id=${sim.dbSimulationId}` : "/simulate"}
                                className="btn-v2-ghost"
                                style={{ textDecoration: "none", height: "42px", padding: "0 18px", borderRadius: "8px", fontSize: "12px", textTransform: "none", letterSpacing: 0, fontWeight: 700, display: "inline-flex", alignItems: "center" }}
                            >
                                ← Back to Workbench
                            </Link>
                        </div>
                    </section>

                    <section className="results-hero-card results-card" style={{ marginBottom: "24px" }}>
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
                                font-weight: 800 !important;
                            }
                            @media (max-width: 1000px) {
                                .military-hide { display: none; }
                            }
                        `}</style>
                    </section>

                    <div className="results-dashboard-grid" style={{ gap: "24px", display: "grid", gridTemplateColumns: "1fr 340px", alignItems: "start" }}>
                        <div className="results-dashboard-main" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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

                        <aside className="results-dashboard-rail" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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

                    <section className="results-section results-card" style={{ marginTop: "24px", padding: "24px" }}>
                        <h3 className="results-section-title">KEY MOMENTS</h3>
                        <div className="results-moment-list" style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
                            {sim.adoptionCurve.slice(-4).map((snap, idx, arr) => {
                                const prev = idx > 0 ? arr[idx - 1] : undefined;
                                const delta = prev ? snap.support - prev.support : snap.support;
                                const label = idx === 0 ? "Early signal" : idx === arr.length - 1 ? "Latest plateau" : "Cascade shift";
                                return (
                                    <div className="results-moment-row" key={`${snap.step}-${idx}`} style={{ display: "flex", gap: "16px", position: "relative" }}>
                                        <div className="results-moment-step" style={{ minWidth: "75px", textAlign: "center", alignSelf: "flex-start" }}>Step {snap.step}</div>
                                        <div className="results-moment-dot" style={{ width: "12px", height: "12px", borderRadius: "50%", marginTop: "6px", flexShrink: 0, zIndex: 2 }} />
                                        <div className="results-moment-body">
                                            <div className="results-moment-title" style={{ fontWeight: 700, fontSize: "14px" }}>{label}</div>
                                            <div className="results-moment-text" style={{ fontSize: "13px", marginTop: "4px" }}>
                                                {delta >= 0 ? `+${delta}` : delta} support shift; {snap.neutral} undecided; {snap.oppose} opposed.
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <div style={{ marginTop: "24px" }}>
                        <PersonaBreakdownSection agents={sim.agents} states={sim.agentStates} />
                    </div>

                    <div className="no-print" style={{ marginTop: "24px" }}>
                        <ExportBar
                            agents={sim.agents}
                            states={sim.agentStates}
                            productName={sim.scenario?.label || "product"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
