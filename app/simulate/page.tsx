"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SCENARIOS, getScenario } from "@/lib/scenarios";
import { buildSnapshot } from "@/lib/simulation";
import { generateAgents, buildWattsStrogatz } from "@/lib/agentGeneration";
import { useSimulation } from "@/lib/SimulationContext";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import type {
    Agent,
    AgentState,
    AgentHistoryEntry,
    AgentHistories,
    SimulationStates,
    StepSnapshot,
    LogEntry,
    RunStepResponse,
    DecisionType,
    PersonaType,
    Scenario,
} from "@/lib/types";

import TopBar from "@/components/dashboard/TopBar";
import AgentGrid from "@/components/dashboard/AgentGrid";
import GlobalNetworkGraph from "@/components/dashboard/GlobalNetworkGraph";
import AgentDetail from "@/components/dashboard/AgentDetail";
import AdoptionChart from "@/components/dashboard/AdoptionChart";
import PersonaBreakdown from "@/components/dashboard/PersonaBreakdown";
import ScenarioPicker from "@/components/dashboard/ScenarioPicker";
import StepLog from "@/components/dashboard/StepLog";
import ProductBrief from "@/components/dashboard/ProductBrief";
import ConfigScreen from "@/components/dashboard/ConfigScreen";
import CustomScenarioForm, { loadSavedCustomScenario } from "@/components/dashboard/CustomScenarioForm";
import AgentListFilter from "@/components/dashboard/AgentListFilter";
import InterventionPanel from "@/components/dashboard/InterventionPanel";
import { deriveSimParams } from "@/lib/productParams";


// ─── Step insight generator ────────────────────────────────────────────────────

function generateStepInsight(counts: StepSnapshot, stepNum: number, prevCounts?: StepSnapshot): string {
    const total = counts.support + counts.neutral + counts.oppose + counts.pending;
    if (total === 0) return "";
    const adoptionPct = Math.round((counts.support / total) * 100);
    const delta = prevCounts ? counts.support - prevCounts.support : 0;

    if (stepNum === 1) {
        if (adoptionPct >= 50) return `Strong early signal — ${adoptionPct}% support on first exposure`;
        if (adoptionPct >= 25) return `Moderate interest — ${adoptionPct}% support, social cascade may build`;
        return `Resistance detected — only ${adoptionPct}% support. Check which personas are blocking.`;
    }
    if (Math.abs(delta) <= 1) return `Consensus stabilizing — change of ${delta > 0 ? "+" : ""}${delta} agents this step`;
    if (delta > 0) return `Cascade building — ${delta} more agents moved to support this step`;
    return `Resistance holding — ${Math.abs(delta)} agents moved away from support`;
}

// ─── Batch size scaling ────────────────────────────────────────────────────────

function getBatchSize(agentCount: number): number {
    if (agentCount <= 25) return 4;
    if (agentCount <= 50) return 6;
    if (agentCount <= 100) return 8;
    return 10;
}

// ─── Batch helper ──────────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
}

// ─── State machine ─────────────────────────────────────────────────────────────

type SimPhase = "UNCONFIGURED" | "CONFIGURED" | "RUNNING" | "DONE";

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SimulatePage() {
    const simCtx = useSimulation();
    const router = useRouter();

    const [phase, setPhase] = useState<SimPhase>("UNCONFIGURED");
    const [isGenerating, setIsGenerating] = useState(false);

    const [agents, setAgents] = useState<Agent[]>([]);
    const [edges, setEdges] = useState<[number, number][]>([]);
    const [states, setStates] = useState<SimulationStates>({});
    const [agentHistories, setAgentHistories] = useState<AgentHistories>({});

    const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
    const [customScenario, setCustomScenario] = useState<Scenario | null>(null);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [history, setHistory] = useState<StepSnapshot[]>([]);
    const [log, setLog] = useState<LogEntry[]>([]);
    const [step, setStep] = useState(0);
    const [running, setRunning] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
    const [activePanel, setActivePanel] = useState<"log" | "chart" | "snapshots">("chart");
    const [mainView, setMainView] = useState<"grid" | "network">("network");

    // Filtering
    const [filterSearch, setFilterSearch] = useState("");
    const [filterPersona, setFilterPersona] = useState<PersonaType | "all">("all");
    const [filterDecision, setFilterDecision] = useState<DecisionType | "all" | "null">("all");
    const [isAISearch, setIsAISearch] = useState(false);
    const [isSearchingAI, setIsSearchingAI] = useState(false);

    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
    const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [stepInsight, setStepInsight] = useState<string | null>(null);

    const abortRef = useRef(false);
    const scenario: Scenario = customScenario || getScenario(scenarioId);

    const [isLoadingDb, setIsLoadingDb] = useState(!!simCtx.dbSimulationId);

    // ─── Initializer (Context Sync) ───
    useEffect(() => {
        // If we have an existing simulation in the context (from Setup page) and it's not in the local state yet
        if (!simCtx.dbSimulationId && simCtx.agents.length > 0 && agents.length === 0) {
            setAgents(simCtx.agents);
            setEdges(simCtx.edges);
            setStates(simCtx.agentStates);
            setStep(simCtx.step);
            setHistory(simCtx.adoptionCurve);
            setLog(simCtx.log);
            
            if (simCtx.scenario) {
                setCustomScenario(simCtx.scenario);
                setScenarioId(simCtx.scenario.id);
            }
            
            setPhase(simCtx.step > 0 ? "DONE" : "CONFIGURED");
        }
    }, [simCtx]);

    // ─── DB Simulation Loading ──────────────────────────────────────────────────
    useEffect(() => {
        if (!simCtx.dbSimulationId) {
            setIsLoadingDb(false);
            return;
        }

        async function loadSim() {
            try {
                const { data, error } = await supabase
                    .from("simulations")
                    .select("*")
                    .eq("id", simCtx.dbSimulationId)
                    .single();

                if (error) throw error;
                if (!data) return;

                const config = data.config || {};
                const results = data.results || {};

                // Map data back to state
                if (config.agents) setAgents(config.agents);
                if (config.edges) setEdges(config.edges);
                if (config.scenario_id) setScenarioId(config.scenario_id);
                if (config.custom_scenario) setCustomScenario(config.custom_scenario);

                if (results.states) setStates(results.states);
                if (results.history) setHistory(results.history);
                if (results.log) setLog(results.log);
                if (results.agent_histories) setAgentHistories(results.agent_histories);
                if (results.step !== undefined) setStep(results.step);

                setPhase(results.step > 0 ? "DONE" : "CONFIGURED");
            } catch (err) {
                console.error("Failed to load simulation from DB:", err);
            } finally {
                setIsLoadingDb(false);
            }
        }

        loadSim();
    }, [simCtx.dbSimulationId]);

    // ─── Persistence to DB ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!simCtx.dbSimulationId || isLoadingDb || agents.length === 0) return;

        const timer = setTimeout(async () => {
            try {
                await supabase
                    .from("simulations")
                    .update({
                        results: {
                            states,
                            history,
                            log,
                            agent_histories: agentHistories,
                            step
                        }
                    })
                    .eq("id", simCtx.dbSimulationId);
            } catch (err) {
                console.warn("Auto-save failed:", err);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [states, history, log, agentHistories, step, simCtx.dbSimulationId, isLoadingDb, agents.length]);


    // ─── Initial states factory ────────────────────────────────────────────────

    function makeInitialStates(agentList: Agent[]): SimulationStates {
        return Object.fromEntries(
            agentList.map((a) => [
                a.id,
                { decision: null, reasoning: null, step: null, pending: false } as AgentState,
            ])
        );
    }

    // ─── Generate population ───────────────────────────────────────────────────

    const handleGenerate = useCallback(
        async (count: number) => {
            setIsGenerating(true);
            try {
                const newAgents = await generateAgents(count);
                const newEdges = buildWattsStrogatz(newAgents.length, 6, 0.15);
                const newStates = makeInitialStates(newAgents);

                setAgents(newAgents);
                setEdges(newEdges);
                setStates(newStates);
                setAgentHistories({});
                setHistory([]);
                setLog([]);
                setStep(0);
                setSelectedAgentId(null);
                setPhase("CONFIGURED");

                // If associated with a DB record, update config
                if (simCtx.dbSimulationId) {
                    await supabase
                        .from("simulations")
                        .update({
                            config: {
                                agents: newAgents,
                                edges: newEdges,
                                scenario_id: scenarioId,
                                custom_scenario: customScenario
                            }
                        })
                        .eq("id", simCtx.dbSimulationId);
                }
            } catch (err) {
                console.error("Failed to generate agents:", err);
                alert("Failed to load GSS agent pool.");
            } finally {
                setIsGenerating(false);
            }
        },
        [simCtx.dbSimulationId, scenarioId, customScenario]
    );

    // ─── Reset simulation ──────────────────────────────────────────────────────

    const handleReset = useCallback(() => {
        abortRef.current = true;
        setRunning(false);
        setStates(makeInitialStates(agents));
        setAgentHistories({});
        setHistory([]);
        setLog([]);
        setStep(0);
        setSelectedAgentId(null);
        setProgress(null);
        setPhase("CONFIGURED");
        setTimeout(() => {
            abortRef.current = false;
        }, 100);
    }, [agents]);

    const handleFullReset = useCallback(() => {
        abortRef.current = true;
        setRunning(false);
        setAgents([]);
        setEdges([]);
        setStates({});
        setAgentHistories({});
        setHistory([]);
        setLog([]);
        setStep(0);
        setSelectedAgentId(null);
        setProgress(null);
        setPhase("UNCONFIGURED");
        setTimeout(() => {
            abortRef.current = false;
        }, 100);
    }, []);

    const handleToggleSeed = useCallback((id: number) => {
        if (step !== 0) return;
        setStates((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                isSeeded: !prev[id].isSeeded,
            },
        }));
    }, [step]);

    // ─── Run one simulation step ───────────────────────────────────────────────

    const runStep = useCallback(
        async (currentStep: number, currentStates: SimulationStates) => {
            setRunning(true);
            setPhase("RUNNING");

            const newStates = { ...currentStates };
            const batchSize = getBatchSize(agents.length);

            for (const agent of agents) {
                newStates[agent.id] = { ...newStates[agent.id], pending: true };
            }
            setStates({ ...newStates });

            const neighborSnapshot = { ...currentStates };
            const batches = chunk(agents, batchSize);

            // Calculate previous params for Delta-Aware logic
            const previousParams = simCtx.previousProduct ? deriveSimParams(simCtx.previousProduct) : undefined;

            let doneCount = 0;
            setProgress({ done: 0, total: agents.length });

            for (const batch of batches) {
                if (abortRef.current) break;

                const results = await Promise.allSettled(
                    batch.map(async (agent) => {
                        if (currentStep === 1 && currentStates[agent.id]?.isSeeded) {
                            await new Promise((res) => setTimeout(res, 400));
                            return {
                                agentId: agent.id,
                                decision: "support" as DecisionType,
                                reasoning: "I am supporting this product as an early partner.",
                            } as RunStepResponse;
                        }

                        const neighborIds = edges
                            .filter(([a, b]) => a === agent.id || b === agent.id)
                            .map(([a, b]) => (a === agent.id ? b : a));

                        const neighborStates = Object.fromEntries(
                            neighborIds.map((nid) => [
                                nid,
                                {
                                    decision: neighborSnapshot[nid]?.decision ?? null,
                                    reasoning: neighborSnapshot[nid]?.reasoning ?? null,
                                },
                            ])
                        );

                        const neighborAgents = neighborIds
                            .map((id) => agents.find((a) => a.id === id))
                            .filter(Boolean) as Agent[];

                        const res = await fetch("/api/run-step", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                agentId: agent.id,
                                agent,
                                scenarioId,
                                customScenario: scenarioId === "custom" ? customScenario : undefined,
                                neighborStates,
                                neighborAgents,
                                previousParams,
                            }),
                        });

                        if (!res.ok) throw new Error(`Agent ${agent.id} failed`);
                        return (await res.json()) as RunStepResponse;
                    })
                );

                for (let i = 0; i < batch.length; i++) {
                    const agent = batch[i];
                    const result = results[i];

                    if (result.status === "fulfilled") {
                        const { decision, reasoning } = result.value;
                        newStates[agent.id] = {
                            decision,
                            reasoning,
                            step: currentStep,
                            pending: false,
                        };

                        setAgentHistories((prev) => ({
                            ...prev,
                            [agent.id]: [
                                ...(prev[agent.id] ?? []),
                                { step: currentStep, decision } as AgentHistoryEntry,
                            ],
                        }));

                        setLog((prev) => [
                            ...prev,
                            {
                                step: currentStep,
                                agentId: agent.id,
                                agentName: agent.name,
                                persona: agent.persona,
                                decision,
                                reasoning,
                                timestamp: Date.now(),
                            },
                        ]);
                    } else {
                        newStates[agent.id] = { ...newStates[agent.id], pending: false };
                    }

                    doneCount++;
                    setProgress({ done: doneCount, total: agents.length });
                    setStates({ ...newStates });
                }
            }

            const snap = buildSnapshot(currentStep, newStates);
            setHistory((prev) => {
                const newHist = [...prev, snap];
                const prevSnap = prev.length > 0 ? prev[prev.length - 1] : undefined;
                setStepInsight(generateStepInsight(snap, currentStep, prevSnap));
                return newHist;
            });
            setStep(currentStep + 1);
            setRunning(false);
            setPhase("DONE");
            setProgress(null);

            return newStates;
        },
        [agents, edges, scenarioId]
    );

    const handleRunStep = useCallback(async () => {
        if (running || phase === "UNCONFIGURED") return;
        await runStep(step, states);
    }, [running, runStep, step, states, phase]);

    const handleAutoRun = useCallback(async () => {
        if (running || phase === "UNCONFIGURED") return;
        abortRef.current = false;
        let currentStates = { ...states };
        let currentStep = step;

        for (let i = 0; i < 3; i++) {
            if (abortRef.current) break;
            currentStates = await runStep(currentStep, currentStates);
            currentStep += 1;
            await new Promise((r) => setTimeout(r, 400));
        }
    }, [running, runStep, states, step, phase]);

    // ─── Keyboard Shortcuts ───
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.code === "Space") {
                e.preventDefault();
                handleRunStep();
            } else if (e.code === "Enter" && e.shiftKey) {
                e.preventDefault();
                handleAutoRun();
            } else if (e.code === "Escape") {
                abortRef.current = true;
                setRunning(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleRunStep, handleAutoRun]);

    const handleScenarioChange = useCallback(
        (id: string) => {
            setScenarioId(id);
            if (agents.length > 0) handleReset();
        },
        [agents.length, handleReset]
    );

    const handleApplyCustom = useCallback((scen: Scenario) => {
        setCustomScenario(scen);
        setScenarioId("custom");
        if (agents.length > 0) handleReset();
    }, [agents.length, handleReset]);


    const handleViewResults = useCallback(() => {
        // Sync everything to context so results page is hydrated immediately
        simCtx.setAgents(agents);
        simCtx.setEdges(edges);
        simCtx.setAgentStates(states);
        simCtx.setStep(step);
        simCtx.setAdoptionCurve(history);
        simCtx.setLog(log);
        simCtx.setScenario(scenario);
        simCtx.setFlowStep("complete");
        
        const url = simCtx.dbSimulationId ? `/results?id=${simCtx.dbSimulationId}` : "/results";
        router.push(url);
    }, [agents, edges, states, step, history, log, scenario, simCtx, router]);


    const handleStrategicSweep = useCallback(async () => {
        if (step === 0 || isAnalyzing) return;
        setIsAnalyzing(true);
        try {
            const res = await fetch("/api/analyze-resistance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    logs: log,
                    currentStep: step - 1,
                    scenarioLabel: scenario.label
                })
            });
            if (res.ok) {
                const data = await res.json();
                setStepInsight(data.insight);
            }
        } catch (err) {
            console.error("Strategic sweep failed:", err);
        } finally {
            setIsAnalyzing(false);
        }
    }, [step, isAnalyzing, log, scenario.label]);


    // ─── Filtering Logic ────────────────────────────────────────────────────────

    const filteredAgents = useMemo(() => {
        return agents.filter((ag) => {
            const st = states[ag.id];
            
            let matchesSearch = false;
            if (isAISearch && filterSearch !== "") {
                // Behavioral/Semantic Search
                const query = filterSearch.toLowerCase();
                const persona = ag.persona.toLowerCase();
                const job = ag.job.toLowerCase();
                
                // Matches "Stubborn" -> High Risk/StatusQuo
                if (query.includes("stubborn") && (ag.risk > 0.7 || (ag.statusQuoBias || 0.5) > 0.7)) matchesSearch = true;
                // Matches "Follower" -> High Social
                else if (query.includes("follower") && ag.social > 0.7) matchesSearch = true;
                // Matches "Rich" -> High Income
                else if (query.includes("rich") && ag.income > 0.8) matchesSearch = true;
                // Default to persona/job match
                else if (persona.includes(query) || job.includes(query)) matchesSearch = true;
            } else {
                matchesSearch = filterSearch === "" || 
                    ag.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
                    ag.job.toLowerCase().includes(filterSearch.toLowerCase());
            }
            
            const matchesPersona = filterPersona === "all" || ag.persona === filterPersona;
            const matchesDecision = filterDecision === "all" || (st && (st.decision === filterDecision || (filterDecision === "null" && st.decision === null)));

            return matchesSearch && matchesPersona && matchesDecision;
        });
    }, [agents, states, filterSearch, filterPersona, filterDecision, isAISearch]);


    // ─── Derived state ─────────────────────────────────────────────────────────

    const selectedAgent =
        selectedAgentId !== null ? agents.find((a) => a.id === selectedAgentId) ?? null : null;
    const selectedState =
        selectedAgentId !== null ? states[selectedAgentId] ?? null : null;
    const selectedHistory =
        selectedAgentId !== null ? agentHistories[selectedAgentId] ?? [] : [];

    const isConfigured = phase !== "UNCONFIGURED";

    // ─── Render ────────────────────────────────────────────────────────────────

    if (isLoadingDb) {
        return (
            <div style={{ height: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px" }}>
                <div className="live-dot" style={{ width: 40, height: 40 }} />
                <p style={{ color: "var(--orange)", fontFamily: "var(--mono)", letterSpacing: "0.2em" }}>RECONSTRUCTING_SIMULATION_STATE...</p>
            </div>
        );
    }

    return (
        <div className="sim-container" style={{ 
            position: "fixed", inset: 0, width: "100%", height: "100%", 
            overflow: "hidden", zIndex: 100, display: "flex", flexDirection: "column",
            background: "radial-gradient(circle at 50% 0%, #111a24 0%, var(--bg) 70%)"
        }}>
            {/* ── PREMIUM MISSION CONTROL BACKGROUND ── */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", zIndex: 0, pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: "150%", height: "150%", background: "radial-gradient(ellipse, rgba(255,107,53,0.03) 0%, rgba(0,208,132,0.01) 40%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
            <style jsx global>{`
                html, body {
                    overflow: hidden !important;
                    height: 100% !important;
                    width: 100% !important;
                    margin: 0;
                    padding: 0;
                    position: fixed;
                }
            `}</style>

            {/* ── TOP: Simulation Ticker ── */}
            <TopBar
                step={step}
                running={running}
                states={states}
                history={history}
                scenarioLabel={scenario.label}
                agentCount={agents.length}
            />

            {/* ── Control bar ── */}
            <div className="control-bar" style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px", height: "44px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(8, 12, 16, 0.6)", backdropFilter: "blur(24px)", flexShrink: 0, zIndex: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--orange)", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 800, marginRight: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--orange)", boxShadow: "0 0 12px 2px var(--orange)" }} />
                    TRINITY_ENGINE
                </div>

                <ScenarioPicker
                    value={scenarioId}
                    onChange={handleScenarioChange}
                    onCustom={() => setShowCustomForm(true)}
                    disabled={running}
                />

                <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                    {progress && (
                        <>
                            <div className="step-progress-bar">
                                <div className="step-progress-fill" style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} />
                            </div>
                            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--orange)" }}>
                                {progress.done}/{progress.total}
                            </span>
                        </>
                    )}

                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>
                        STEP {step} / ∞
                    </span>

                    {(step >= 1 || phase === "DONE") && (
                        <button 
                            onClick={handleViewResults}
                            className="btn btn-primary" 
                            style={{ textDecoration: "none", border: "none", cursor: "pointer" }}
                        >
                            View Results →
                        </button>
                    )}

                    {isConfigured && (
                        <>
                            <button id="btn-autorun" className="btn btn-ghost" onClick={handleAutoRun} disabled={running} title="Run 3 steps automatically" style={{ letterSpacing: "0.05em", fontSize: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
                                ▶▶ AUTO ×3
                            </button>

                            <button id="btn-step" className="btn btn-primary" onClick={handleRunStep} disabled={running} style={{ outline: "none", boxShadow: "0 0 15px rgba(0,208,132,0.2)", letterSpacing: "0.05em", fontSize: 10, background: "linear-gradient(to right, var(--support), #00e696)", color: "#000", border: "none" }}>
                                {running ? (
                                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                                        <span className="live-dot" style={{ width: 6, height: 6, background: "#000" }} />
                                        COMPUTING
                                    </span>
                                ) : (
                                    <span style={{ fontWeight: 700 }}>▶ RUN STEP {step + 1}</span>
                                )}
                            </button>

                            <button id="btn-reset" className="btn btn-ghost" onClick={handleReset} disabled={running} title="Reset simulation (keep population)" style={{ letterSpacing: "0.05em", fontSize: 10 }}>
                                ⟳ RESET
                            </button>
                        </>
                    )}

                    <button id="btn-reconfigure" className="btn btn-ghost" onClick={handleFullReset} disabled={running} title="Re-configure population">
                        ◈ CONFIG
                    </button>
                </div>
            </div>

            <div className="sim-main-content" style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0, position: "relative", zIndex: 10 }}>
                {/* ── LEFT SIDEBAR ── */}
                <div className="sidebar-left" style={{ 
                    display: "flex", flexDirection: "column", 
                    width: leftSidebarCollapsed ? "40px" : "300px", 
                    transition: "width 0.4s cubic-bezier(0.19, 1, 0.22, 1)",
                    borderRight: "1px solid rgba(255,255,255,0.05)", 
                    background: "rgba(10, 15, 22, 0.65)",
                    backdropFilter: "blur(24px)",
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: "5px 0 30px rgba(0,0,0,0.2)"
                }}>
                    <button 
                        onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
                        style={{ position: "absolute", top: 8, right: 8, zIndex: 50, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 10, fontFamily: "var(--mono)" }}
                    >
                        {leftSidebarCollapsed ? "[+]" : "[-]"}
                    </button>

                    {!leftSidebarCollapsed && (
                        <>
                            <div className="panel" style={{ flexShrink: 0, borderRadius: 0, border: "none", background: "transparent", display: "flex", flexDirection: "column" }}>
                                <div className="panel-header" style={{ borderTop: "none", background: "transparent" }}>
                                    <span className="label">STRATEGIC_BRIEF</span>
                                    <span style={{ fontSize: 9 }}>{scenario.tag}</span>
                                </div>
                                <ProductBrief scenario={scenario} />
                                <div style={{ padding: "10px", borderTop: "1px solid var(--border)" }}>
                                    <InterventionPanel />
                                </div>
                            </div>
                            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", borderTop: "1px solid var(--border)" }}>
                                <div className="panel-header" style={{ borderTop: "none", background: "transparent" }}>
                                    <span className="label">PERSONA_DISTRIBUTION</span>
                                    <span style={{ fontSize: 9 }}>N={agents.length || "—"}</span>
                                </div>
                                <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
                                    {agents.length > 0 && <PersonaBreakdown agents={agents} states={states} />}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ── MAIN VIEWPORT ── */}
                <div className="sim-viewport" style={{ flex: 1, display: "flex", flexDirection: "column", background: "transparent", position: "relative", overflow: "hidden", height: "100%" }}>
                    {isConfigured && (
                        <div className="panel-header" style={{ borderTop: "none", borderLeft: "none", borderRight: "none", display: "flex", justifyContent: "space-between", flexShrink: 0, background: "linear-gradient(to right, rgba(0,0,0,0.4), transparent)", padding: "0 20px" }}>
                            <span className="label" style={{ letterSpacing: "0.2em", color: "var(--bright)", textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>AGENT POPULATION ({filteredAgents.length})</span>
                             <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <button onClick={() => setMainView("network")} className="btn btn-ghost" style={{ border: "none", color: mainView === "network" ? "var(--support)" : "var(--muted)", fontSize: 10, background: mainView === "network" ? "rgba(0,208,132,0.1)" : "transparent", borderRadius: "100px", padding: "4px 12px", transition: "all 0.2s" }}>🕸️ NETWORK</button>
                                <button onClick={() => setMainView("grid")} className="btn btn-ghost" style={{ border: "none", color: mainView === "grid" ? "var(--support)" : "var(--muted)", fontSize: 10, background: mainView === "grid" ? "rgba(0,208,132,0.1)" : "transparent", borderRadius: "100px", padding: "4px 12px", transition: "all 0.2s" }}>📦 GRID</button>
                             </div>
                        </div>
                    )}

                    {isConfigured && (
                       <AgentListFilter
                          search={filterSearch} onSearchChange={setFilterSearch}
                          persona={filterPersona} onPersonaChange={setFilterPersona}
                          decision={filterDecision} onDecisionChange={setFilterDecision}
                          isAISearch={isAISearch} onToggleAI={() => setIsAISearch(!isAISearch)}
                          isSearching={isSearchingAI} resultsCount={filteredAgents.length}
                       />
                    )}

                    <div className="sim-viewport-inner" style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
                        {!isConfigured ? (
                            <ConfigScreen onGenerate={handleGenerate} isGenerating={isGenerating} />
                        ) : (
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
                                {mainView === "grid" ? (
                                    <AgentGrid agents={filteredAgents} states={states} selectedId={selectedAgentId} onSelect={setSelectedAgentId} />
                                ) : (
                                    <GlobalNetworkGraph agents={filteredAgents} edges={edges} states={states} selectedId={selectedAgentId} onSelect={setSelectedAgentId} />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT SIDEBAR ── */}
                <div className="sidebar-right" style={{ 
                    display: "flex", flexDirection: "column", 
                    width: rightSidebarCollapsed ? "40px" : "380px", 
                    transition: "width 0.4s cubic-bezier(0.19, 1, 0.22, 1)",
                    background: "rgba(10, 15, 22, 0.65)",
                    backdropFilter: "blur(24px)",
                    borderLeft: "1px solid rgba(255,255,255,0.05)", 
                    boxShadow: "-5px 0 30px rgba(0,0,0,0.2)",
                    overflow: "hidden",
                    position: "relative"
                }}>
                    <button
                        onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
                        style={{ position: "absolute", top: 8, left: 8, zIndex: 50, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 10, fontFamily: "var(--mono)" }}
                    >
                        {rightSidebarCollapsed ? "[-]" : "[+]"}
                    </button>

                    {!rightSidebarCollapsed && (
                        <>
                            <div style={{ display: "flex", background: "transparent", borderBottom: "1px solid var(--border)", height: "36px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>
                                <div onClick={() => setActivePanel("chart")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: activePanel === "chart" ? "var(--orange)" : "var(--muted)", borderRight: "1px solid var(--border)", background: activePanel === "chart" ? "rgba(255,255,255,0.03)" : "transparent" }}>CASCADES</div>
                                <div onClick={() => setActivePanel("log")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: activePanel === "log" ? "var(--orange)" : "var(--muted)", borderRight: "1px solid var(--border)", background: activePanel === "log" ? "rgba(255,255,255,0.03)" : "transparent" }}>LIVE_LOG</div>
                                <div onClick={() => setActivePanel("snapshots")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: activePanel === "snapshots" ? "var(--orange)" : "var(--muted)", background: activePanel === "snapshots" ? "rgba(255,255,255,0.03)" : "transparent" }}>BRANCHES</div>
                            </div>
                            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                                {activePanel === "chart" ? (
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                        <div style={{ flex: 1, minHeight: 0 }}>
                                        <AdoptionChart history={history} total={agents.length} />
                                        </div>
                                        <div className="insight-panel" style={{ padding: "16px", background: "rgba(255,107,53,0.03)", borderTop: "1px solid var(--border)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                                <div className="label" style={{ fontSize: "10px", color: "var(--orange)", fontWeight: 800, fontFamily: "var(--mono)" }}>STEP_{step}_INSIGHT</div>
                                                <button 
                                                    onClick={handleStrategicSweep} 
                                                    disabled={isAnalyzing || step === 0}
                                                    className="btn btn-ghost" 
                                                    style={{ fontSize: 9, padding: "2px 8px", border: "1px solid rgba(255,107,53,0.3)", color: "var(--orange)" }}
                                                >
                                                    {isAnalyzing ? "ANALYZING..." : "✨ STRATEGIC_SWEEP"}
                                                </button>
                                            </div>
                                            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--bright)" }}>{stepInsight || "Awaiting population synthesis..."}</p>
                                        </div>
                                    </div>
                                ) : activePanel === "log" ? (
                                    <StepLog entries={log} />
                                ) : (
                                    <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
                                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--orange)", fontWeight: 700 }}>SIMULATION_SNAPSHOTS</div>
                                            <button 
                                                onClick={() => {
                                                    const name = prompt("Enter branch name:", `Branch at Step ${step}`);
                                                    if (name) simCtx.saveSnapshot(name);
                                                }}
                                                className="btn btn-primary" style={{ fontSize: 9, padding: "4px 10px" }}
                                            >
                                                + SAVE_BRANCH
                                            </button>
                                         </div>

                                         <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {simCtx.snapshots.length === 0 ? (
                                                <div style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic", textAlign: "center", padding: "40px 0" }}>No branches saved yet.</div>
                                            ) : (
                                                simCtx.snapshots.map((snap, idx) => (
                                                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "4px" }}>
                                                        <div>
                                                            <div style={{ fontSize: 11, color: "var(--bright)", fontWeight: 600 }}>{snap.name}</div>
                                                            <div style={{ fontSize: 9, color: "var(--muted)" }}>Step {snap.state.step} · {snap.state.agents.length} Agents</div>
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                if (confirm("Restore this branch? Current unsaved progress will be lost.")) {
                                                                    simCtx.restoreSnapshot(snap.name);
                                                                    // Update local state from restored context
                                                                    setAgents(snap.state.agents);
                                                                    setEdges(snap.state.edges);
                                                                    setStates(snap.state.agentStates);
                                                                    setStep(snap.state.step);
                                                                    setHistory(snap.state.adoptionCurve);
                                                                    setLog(snap.state.log);
                                                                }
                                                            }}
                                                            className="btn btn-ghost" style={{ fontSize: 9, color: "var(--orange)", border: "1px solid rgba(255,107,53,0.3)" }}
                                                        >
                                                            LOAD
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                         </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── AGENT HIGHLIGHT ── */}
            {selectedAgentId !== null && selectedAgent && selectedState && (
                <div style={{ position: "fixed", top: 0, right: 0, width: "420px", height: "100%", background: "rgba(14, 20, 28, 0.85)", backdropFilter: "blur(32px)", borderLeft: "1px solid rgba(255,255,255,0.1)", zIndex: 1000, boxShadow: "-20px 0 80px rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(to right, rgba(0,208,132,0.05), transparent)" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--support)", letterSpacing: "0.2em" }}>AGENT_TELEMETRY</span>
                        <button onClick={() => setSelectedAgentId(null)} className="btn btn-ghost" style={{ fontSize: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", borderRadius: "4px" }}>CLOSE [×]</button>
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                        <AgentDetail agent={selectedAgent} state={selectedState} agentHistory={selectedHistory} allStates={states} agents={agents} edges={edges} onSelectAgent={setSelectedAgentId} onToggleSeed={handleToggleSeed} isConfigPhase={step === 0} />
                    </div>
                </div>
            )}

            {showCustomForm && (
                <CustomScenarioForm
                    onApply={handleApplyCustom}
                    onClose={() => setShowCustomForm(false)}
                    existing={null}
                />
            )}
        </div>
    );
}
