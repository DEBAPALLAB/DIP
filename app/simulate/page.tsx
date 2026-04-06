"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SCENARIOS, getScenario } from "@/lib/scenarios";
import { buildSnapshot } from "@/lib/simulation";
import { generateAgents, buildWattsStrogatz } from "@/lib/agentGeneration";
import { useSimulation } from "@/lib/SimulationContext";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import InterventionPanel from "@/components/dashboard/InterventionPanel";
import LiveSignalTicker from "@/components/dashboard/LiveSignalTicker";

import type {
    Agent,
    AgentState,
    AgentHistoryEntry,
    AgentHistories,
    SimulationStates,
    StepSnapshot,
    LogEntry,
    RunStepResponse,
    RunStepBatchRequest,
    RunStepBatchResponse,
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
    return agentCount >= 30 ? 10 : 5;
}

// ─── Batch helper ──────────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
}

function buildSimulationTitle(productName: string | undefined, scenarioLabel: string | undefined) {
    const cleanProduct = productName?.trim() || "Simulation";
    const cleanScenario = scenarioLabel?.trim() || "Scenario";
    return `${cleanProduct} — ${cleanScenario}`;
}

// ─── State machine ─────────────────────────────────────────────────────────────

type SimPhase = "UNCONFIGURED" | "CONFIGURED" | "RUNNING" | "DONE";

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SimulatePage() {
    const simCtx = useSimulation();
    const router = useRouter();

    const [phase, setPhase] = useState<SimPhase>("UNCONFIGURED");
    const [isGenerating, setIsGenerating] = useState(false);

    // Redundant local states replaced by context:
    const agents = simCtx.agents;
    const edges = simCtx.edges;
    const states = simCtx.agentStates;
    const step = simCtx.step;
    const history = simCtx.adoptionCurve;
    const log = simCtx.log;
    const mainView = simCtx.mainView;
    const setMainView = simCtx.setMainView;
    const agentHistories = simCtx.agentHistories;
    const setAgentHistories = simCtx.setAgentHistories;

    const [running, setRunning] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
    const [activePanel, setActivePanel] = useState<"log" | "chart" | "snapshots">("chart");

    const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
    const [customScenario, setCustomScenario] = useState<Scenario | null>(null);
    const [showCustomForm, setShowCustomForm] = useState(false);

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
    const controllerRef = useRef<AbortController | null>(null);
    const [isLoadingDb, setIsLoadingDb] = useState(false);
    const lastSavedStepRef = useRef<number>(-1);

    // ─── Lifecycle: Cleanup on unmount ───
    const persistSimulation = useCallback(async (status: "Pending" | "Running" | "Completed") => {
        if (!simCtx.dbSimulationId || agents.length === 0) return;
        const persistScenario = customScenario ?? simCtx.scenario ?? getScenario(scenarioId);

        await supabase
            .from("simulations")
            .update({
                status,
                total_agents: agents.length,
                agents,
                edges,
                configuration: {
                    title: buildSimulationTitle(simCtx.product?.name, persistScenario.label),
                    product: simCtx.product,
                    filters: simCtx.marketFilters,
                    scenario: persistScenario,
                    mainView,
                    branches: simCtx.branches,
                },
                results: {
                    states,
                    history,
                    log,
                    agent_histories: agentHistories,
                    step,
                    main_view: mainView,
                    insights: simCtx.insights,
                },
            })
            .eq("id", simCtx.dbSimulationId);
    }, [simCtx.dbSimulationId, agents, edges, customScenario, simCtx.scenario, scenarioId, simCtx.product, simCtx.marketFilters, mainView, states, history, log, agentHistories, step, simCtx.insights]);

    useEffect(() => {
        return () => {
            abortRef.current = true;
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, []);

    // Derived scenario from context
    const scenario = useMemo(
        () => customScenario ?? simCtx.scenario ?? getScenario(scenarioId),
        [customScenario, simCtx.scenario, scenarioId]
    );

    // Keep the local selector state aligned with the hydrated/global scenario.
    useEffect(() => {
        if (!simCtx.scenario) return;
        setScenarioId(simCtx.scenario.id);
        setCustomScenario(simCtx.scenario.id === "custom" ? simCtx.scenario : null);
    }, [simCtx.scenario]);

    // ─── Initializer (URL Param & Context Sync) ───
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const urlId = searchParams.get('id');

        async function hydrate() {
            if (urlId && urlId !== simCtx.dbSimulationId) {
                setIsLoadingDb(true);
                await simCtx.loadSimulationFromDb(urlId);
                setIsLoadingDb(false);
            }
        }
        hydrate();
    }, [simCtx.dbSimulationId]);

    // Update phase based on state
    useEffect(() => {
        if (agents.length > 0) {
            setPhase(step > 0 ? "DONE" : "CONFIGURED");
        } else {
            setPhase("UNCONFIGURED");
        }
    }, [agents.length, step]);

    // ─── Persistence to DB ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!simCtx.dbSimulationId || isLoadingDb || agents.length === 0) return;

        const timer = setTimeout(async () => {
            try {
                await persistSimulation(step > 0 ? "Running" : "Pending");
            } catch (err) {
                console.warn("Auto-save failed:", err);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [states, history, log, agentHistories, step, mainView, simCtx.dbSimulationId, isLoadingDb, agents.length, agents, edges, scenario, simCtx.product, simCtx.marketFilters, simCtx.insights, persistSimulation]);

    useEffect(() => {
        if (!simCtx.dbSimulationId || isLoadingDb || agents.length === 0) return;
        if (step <= 0) return;
        if (lastSavedStepRef.current === step) return;

        lastSavedStepRef.current = step;

        void persistSimulation("Running").catch((err) => {
            console.warn("Immediate step save failed:", err);
        });
    }, [step, persistSimulation, isLoadingDb, agents.length, simCtx.dbSimulationId]);


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

                simCtx.setAgents(newAgents);
                simCtx.setEdges(newEdges);
                simCtx.setAgentStates(newStates);
                simCtx.setAgentHistories({});
                simCtx.setAdoptionCurve([]);
                simCtx.setLog([]);
                simCtx.setStep(0);
                setSelectedAgentId(null);
                setPhase("CONFIGURED");

                // If associated with a DB record, update config
                if (simCtx.dbSimulationId) {
                    await supabase
                        .from("simulations")
                    .update({
                        configuration: {
                            title: buildSimulationTitle(simCtx.product?.name, scenario.label),
                            agents: newAgents,
                            edges: newEdges,
                            scenario_id: scenarioId,
                            custom_scenario: customScenario,
                            branches: simCtx.branches,
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
        [simCtx, scenarioId, customScenario]
    );

    // ─── Reset simulation ──────────────────────────────────────────────────────

    const handleReset = useCallback(() => {
        abortRef.current = true;
        setRunning(false);
        lastSavedStepRef.current = -1;
        simCtx.setAgentStates(makeInitialStates(agents));
        simCtx.setAgentHistories({});
        simCtx.setAdoptionCurve([]);
        simCtx.setLog([]);
        simCtx.setStep(0);
        setSelectedAgentId(null);
        setProgress(null);
        setPhase("CONFIGURED");
        setTimeout(() => {
            abortRef.current = false;
        }, 100);
    }, [agents, simCtx]);

    const handleFullReset = useCallback(() => {
        abortRef.current = true;
        setRunning(false);
        lastSavedStepRef.current = -1;
        simCtx.setAgents([]);
        simCtx.setEdges([]);
        simCtx.setAgentStates({});
        simCtx.setAgentHistories({});
        simCtx.setAdoptionCurve([]);
        simCtx.setLog([]);
        simCtx.setStep(0);
        setSelectedAgentId(null);
        setPhase("UNCONFIGURED");
        setStepInsight(null);
        setProgress(null);
        setTimeout(() => {
            abortRef.current = false;
        }, 100);
    }, [simCtx]);

    const handleToggleSeed = useCallback((id: number) => {
        if (step !== 0) return;
        simCtx.setAgentStates({
            ...states,
            [id]: {
                ...states[id],
                decision: states[id]?.decision === "support" ? "neutral" : "support",
                reasoning: states[id]?.decision === "support" ? null : "Seed enthusiast (manual)",
                isSeeded: states[id]?.decision === "support" ? false : true,
            },
        });
    }, [step, states, simCtx]);

    // ─── Run one simulation step ───────────────────────────────────────────────

    const runStep = useCallback(
        async (currentStep: number, currentStates: SimulationStates) => {
            setRunning(true);
            setPhase("RUNNING");

            const newStates = { ...currentStates };
            const batchSize = getBatchSize(agents.length);

            // Mark everyone as pending initially
            for (const agent of agents) {
                newStates[agent.id] = { ...newStates[agent.id], pending: true };
            }
            simCtx.setAgentStates({ ...newStates });

            const neighborSnapshot = { ...currentStates };
            const batches = chunk(agents, batchSize);

            // Create a fresh AbortController for this step
            if (controllerRef.current) controllerRef.current.abort();
            const controller = new AbortController();
            controllerRef.current = controller;

            // Calculate previous params for Delta-Aware logic
            const previousParams = simCtx.previousProduct ? deriveSimParams(simCtx.previousProduct) : undefined;

            let doneCount = 0;
            setProgress({ done: 0, total: agents.length });
            abortRef.current = false; // Reset on start
            
            simCtx.clearTicker();
            simCtx.addTickerMsg(`INITIATING_STEP_${currentStep + 1}_PROCEDURES`, "info");

            for (const batch of batches) {
                if (abortRef.current || controller.signal.aborted) break;
                
                const batchIndex = batches.indexOf(batch) + 1;
                simCtx.addTickerMsg(`PROCESSING_BATCH_${batchIndex}/${batches.length}...`, "info");

                // ─── Phase 2: Batch API Execution ──────────────────────────────────────
                const payload: RunStepBatchRequest = {
                    batch: batch.map(agent => {
                        // Seed logic: handle first step partners (Simulated inside the batch for legacy support)
                        const isSeeded = currentStep === 0 && currentStates[agent.id]?.isSeeded;
                        
                        const neighborIds = edges
                            .filter(([a, b]) => a === agent.id || b === agent.id)
                            .map(([a, b]) => (a === agent.id ? b : a));
                        
                        return {
                            agentId: agent.id,
                            agent: agent,
                            neighborStates: Object.fromEntries(
                                neighborIds.map(nid => [
                                    nid,
                                    { 
                                        decision: neighborSnapshot[nid]?.decision ?? "neutral", 
                                        reasoning: neighborSnapshot[nid]?.reasoning ?? "" 
                                    }
                                ])
                            ),
                            neighborAgents: neighborIds
                                .map(id => agents.find(ag => ag.id === id))
                                .filter(Boolean) as Agent[]
                        };
                    }),
                    scenarioId: scenario.id,
                    customScenario: scenario.id === "custom" ? scenario : undefined,
                    previousParams
                };

                const res = await fetch("/api/run-step", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || `Batch failure (HTTP ${res.status})`);
                }

                const data: RunStepBatchResponse = await res.json();

                // ─── Phase 3: State Integration ──────────────────────────────────────
                data.results.forEach((resItem: RunStepResponse) => {
                    const agent = agents.find(a => a.id === resItem.agentId)!;
                    
                    // Special case for seeded agents in step 0
                    const finalDecision = (currentStep === 0 && currentStates[agent.id]?.isSeeded) ? "support" as DecisionType : resItem.decision;
                    const finalReasoning = (currentStep === 0 && currentStates[agent.id]?.isSeeded) ? "I am supporting this product as an early partner." : resItem.reasoning;

                    newStates[resItem.agentId] = {
                        ...newStates[resItem.agentId],
                        decision: finalDecision,
                        reasoning: finalReasoning,
                        model: resItem.model,
                        step: currentStep,
                        pending: false,
                    };

                    simCtx.addAgentHistoryPoint(resItem.agentId, {
                        step: currentStep,
                        decision: finalDecision
                    });

                    simCtx.addLogEntry({
                        step: currentStep,
                        agentId: resItem.agentId,
                        agentName: agent.name,
                        persona: agent.persona,
                        decision: finalDecision,
                        reasoning: finalReasoning,
                        timestamp: Date.now(),
                    });

                    doneCount++;
                });

                setProgress({ done: doneCount, total: agents.length });

                // Update local context state at end of batch for live feedback
                simCtx.setAgentStates({ ...newStates });
                
                // Real-time Analyst Alert
                const batchSupport = data.results.filter((r: RunStepResponse) => r.decision === 'support').length;
                if (batchSupport / batch.length < 0.3) {
                    simCtx.addTickerMsg(`ALERT: RESISTANCE_CRITICAL_IN_LATENT_GROUPS`, "alert");
                } else if (batchSupport / batch.length > 0.7) {
                    simCtx.addTickerMsg(`SIGNAL: STRONG_MOMENTUM_DETECTED`, "success");
                }

                // SAFE MODE DELAY: 1.5s pause (Optimized for multiple account rotation)
                if (batches.length > 1) {
                    const jitter = Math.floor(Math.random() * 300);
                    await new Promise(resolve => setTimeout(resolve, 1200 + jitter));
                }
            }

            // ─── FINALIZATION: Only finalize step AFTER all batches complete ───
            if (abortRef.current || controller.signal.aborted) {
                setRunning(false);
                setProgress(null);
                setPhase("DONE");
                return currentStates;
            }

            const snap = buildSnapshot(currentStep, newStates);
            simCtx.addAdoptionPoint(snap);
            const prevSnap = simCtx.adoptionCurve.length > 0 ? simCtx.adoptionCurve[simCtx.adoptionCurve.length - 1] : undefined;
            setStepInsight(generateStepInsight(snap, currentStep + 1, prevSnap));

            simCtx.setStep(currentStep + 1);
            setRunning(false);
            setPhase("DONE");
            setProgress(null);
            
            simCtx.addTickerMsg(`STEP_${currentStep + 1}_ANALYSIS_COMPLETE`, "success");

            return newStates;
        },
        [agents, edges, scenario, simCtx]
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


    const handleViewResults = useCallback(async () => {
        // Kill simulation immediately
        abortRef.current = true;
        if (controllerRef.current) controllerRef.current.abort();
        setRunning(false);

        if (simCtx.dbSimulationId && agents.length > 0) {
            try {
                await supabase
                    .from("simulations")
                    .update({
                        status: "Completed",
                        total_agents: agents.length,
                        agents,
                        edges,
                        configuration: {
                            title: buildSimulationTitle(simCtx.product?.name, scenario.label),
                            product: simCtx.product,
                            filters: simCtx.marketFilters,
                            scenario,
                            mainView,
                            branches: simCtx.branches,
                        },
                        results: {
                            states,
                            history,
                            log,
                            agent_histories: agentHistories,
                            step,
                            main_view: mainView,
                            insights: simCtx.insights,
                        },
                    })
                    .eq("id", simCtx.dbSimulationId);
            } catch (err) {
                console.warn("Final save before results failed:", err);
            }
        }

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
    }, [agents, edges, states, step, history, log, scenario, mainView, agentHistories, simCtx, router]);


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
        <div className="sim-container results-root" style={{ 
            position: "fixed", inset: 0, width: "100%", height: "100%", 
            overflow: "hidden", zIndex: 100, display: "flex", flexDirection: "column",
            background: "radial-gradient(circle at 50% 50%, rgba(20, 24, 30, 1) 0%, rgba(8, 10, 12, 1) 100%)",
            animation: "ambient-pulse 12s infinite alternate ease-in-out"
        }}>
            <style jsx global>{`
                @keyframes ambient-pulse {
                    0% { filter: brightness(1); }
                    100% { filter: brightness(1.2); }
                }
                .telemetry-label {
                    position: absolute;
                    font-family: var(--mono);
                    font-size: 8px;
                    color: rgba(255,255,255,0.06);
                    pointer-events: none;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    z-index: 5;
                }
            `}</style>

            {/* Tactical Telemetry Overlays */}
            <div className="telemetry-label" style={{ top: 80, left: 24 }}>TRINITY_SYS_LVL: 0.94</div>
            <div className="telemetry-label" style={{ top: 80, right: 24 }}>SIM_ID_HASH: {simCtx.dbSimulationId?.slice(0,12) || "LOCAL_CACHE"}</div>
            <div className="telemetry-label" style={{ bottom: 24, left: 24 }}>COORDS: 40.7128°N | 74.0060°W</div>
            <div className="telemetry-label" style={{ bottom: 24, right: 24 }}>MEM_FLOW: {agents.length || 0}P / {new Date().toLocaleTimeString()}</div>

            {/* ── PREMIUM MISSION CONTROL BACKGROUND (MATCH RESULTS ROOT) ── */}
            <div style={{ position: "absolute", top: "0%", left: "50%", transform: "translateX(-50%)", width: "100%", height: "100%", background: "radial-gradient(circle at top left, rgba(0, 208, 178, 0.08), transparent 40%), radial-gradient(circle at top right, rgba(255, 107, 53, 0.06), transparent 35%)", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", zIndex: 0, pointerEvents: "none", opacity: 0.5 }} />
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

            {/* ── Control bar (MATCH RESULTS NAV) ── */}
            <div className="control-bar" style={{ 
                display: "flex", alignItems: "center", gap: 12, padding: "0 24px", height: "56px", 
                borderBottom: "1px solid rgba(255,255,255,0.06)", 
                background: "rgba(8, 8, 8, 0.8)", backdropFilter: "blur(24px)", 
                flexShrink: 0, zIndex: 20, boxShadow: "0 4px 30px rgba(0,0,0,0.3)" 
            }}>
                <Link href="/dashboard" className="btn-ghost-setup" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", marginRight: "12px" }}>
                    <span style={{ fontSize: "14px" }}>←</span> DASHBOARD
                </Link>

                <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--bright)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginRight: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="landing-nav-dot" style={{ width: 8, height: 8, boxShadow: "0 0 10px var(--orange)" }}>◉</div>
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
                            className="btn-cta" 
                            style={{ padding: "8px 16px", height: "32px" }}
                        >
                            View Results →
                        </button>
                    )}

                    {isConfigured && (
                        <>
                            <button id="btn-autorun" className="btn-ghost-setup" onClick={handleAutoRun} disabled={running} title="Run 3 steps automatically" style={{ height: "32px", padding: "0 12px" }}>
                                ▶▶ AUTO ×3
                            </button>

                            <button 
                                id="btn-step" 
                                className="btn-cta" 
                                onClick={handleRunStep} 
                                disabled={running} 
                                style={{ 
                                    height: "32px", 
                                    padding: "0 16px", 
                                    background: running ? "rgba(255,255,255,0.1)" : "linear-gradient(180deg, var(--support), #13b19a)",
                                    color: running ? "rgba(255,255,255,0.4)" : "white",
                                    border: running ? "1px solid rgba(255,255,255,0.1)" : "none",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                {running ? (
                                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: "10px", letterSpacing: "0.05em" }}>
                                        <div className="loading-spinner-tiny" style={{ width: 8, height: 8, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "var(--support)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                                        COMPUTING...
                                    </span>
                                ) : (
                                    <span style={{ fontWeight: 700 }}>▶ RUN STEP {step + 1}</span>
                                )}
                            </button>

                            <button id="btn-reset" className="btn-ghost-setup" onClick={handleReset} disabled={running} title="Reset simulation (keep population)" style={{ height: "32px", padding: "0 12px" }}>
                                ⟳ RESET
                            </button>
                        </>
                    )}

                    <button id="btn-reconfigure" className="btn-ghost-setup" onClick={handleFullReset} disabled={running} title="Re-configure population" style={{ height: "32px", padding: "0 12px" }}>
                        ◈ CONFIG
                    </button>
                </div>
            </div>

            <div className="sim-main-content" style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0, position: "relative", zIndex: 10 }}>
                {/* ── LEFT SIDEBAR (MATCH RESULTS RAIL) ── */}
                <div className="sidebar-left results-card" style={{ 
                    display: "flex", flexDirection: "column", 
                    width: leftSidebarCollapsed ? "40px" : "320px", 
                    transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    margin: "12px 0 12px 12px",
                    background: "rgba(12, 12, 12, 0.8)",
                    backdropFilter: "blur(32px)",
                    overflow: "hidden",
                    position: "relative",
                    borderRadius: leftSidebarCollapsed ? "12px" : "18px",
                    border: "1px solid rgba(255,255,255,0.07)"
                }}>
                    <button 
                        onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
                        style={{ position: "absolute", top: 12, right: 12, zIndex: 50, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 10, fontFamily: "var(--mono)" }}
                    >
                        {leftSidebarCollapsed ? "[+]" : "[-]"}
                    </button>

                    {!leftSidebarCollapsed && (
                        <div className="no-scrollbar" style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", padding: "12px" }}>
                            <div style={{ flexShrink: 0, marginBottom: "16px" }}>
                                <div className="results-side-label" style={{ fontSize: "9px", marginBottom: "8px", paddingLeft: "4px" }}>STRATEGIC_BRIEF</div>
                                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px", padding: "4px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <ProductBrief scenario={scenario} />
                                </div>
                            </div>

                            <div style={{ flexShrink: 0, marginBottom: "16px" }}>
                                <InterventionPanel />
                            </div>

                            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                <div className="results-side-label" style={{ fontSize: "9px", marginBottom: "8px", paddingLeft: "4px" }}>PERSONA_DISTRIBUTION</div>
                                <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    {agents.length > 0 && <PersonaBreakdown agents={agents} states={states} />}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── MAIN VIEWPORT (MATCH RESULTS CONTENT) ── */}
                <div className="sim-viewport results-card" style={{ 
                    flex: 1, display: "flex", flexDirection: "column", 
                    background: "rgba(10, 10, 10, 0.4)", 
                    margin: "12px", 
                    borderRadius: "18px",
                    border: "1px solid rgba(255,255,255,0.07)",
                    position: "relative", overflow: "hidden", height: "calc(100% - 24px)" 
                }}>
                    {isConfigured && (
                        <div className="results-hero-top" style={{ 
                            padding: "16px 20px", 
                            background: "linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            alignItems: "center"
                        }}>
                             <div className="results-side-label" style={{ marginBottom: 0, color: "var(--bright)", opacity: 0.9 }}>AGENT_FIELD · {filteredAgents.length} MATCHES</div>
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

                {/* ── RIGHT SIDEBAR (MATCH RESULTS RAIL) ── */}
                <div className="sidebar-right results-card" style={{ 
                    display: "flex", flexDirection: "column", 
                    width: rightSidebarCollapsed ? "40px" : "380px", 
                    transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    margin: "12px 12px 12px 0",
                    background: "rgba(12, 12, 12, 0.8)",
                    backdropFilter: "blur(32px)",
                    border: "1px solid rgba(255,255,255,0.07)", 
                    borderRadius: rightSidebarCollapsed ? "12px" : "18px",
                    overflow: "hidden",
                    position: "relative"
                }}>
                    <button
                        onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
                        style={{ position: "absolute", top: 12, left: 12, zIndex: 50, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 10, fontFamily: "var(--mono)" }}
                    >
                        {rightSidebarCollapsed ? "[-]" : "[+]"}
                    </button>

                    {!rightSidebarCollapsed && (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                            <div style={{ 
                                display: "flex", 
                                background: "rgba(255,255,255,0.02)", 
                                borderBottom: "1px solid rgba(255,255,255,0.06)", 
                                height: "40px", 
                                flexShrink: 0 
                            }}>
                                <div onClick={() => setActivePanel("chart")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "10px", fontWeight: "700", fontFamily: "var(--mono)", letterSpacing: "0.1em", color: activePanel === "chart" ? "var(--orange)" : "var(--muted)", borderRight: "1px solid rgba(255,255,255,0.06)", background: activePanel === "chart" ? "rgba(255,107,53,0.05)" : "transparent", transition: "all 0.2s" }}>CASCADES</div>
                                <div onClick={() => setActivePanel("log")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "10px", fontWeight: "700", fontFamily: "var(--mono)", letterSpacing: "0.1em", color: activePanel === "log" ? "var(--orange)" : "var(--muted)", borderRight: "1px solid rgba(255,255,255,0.06)", background: activePanel === "log" ? "rgba(255,107,53,0.05)" : "transparent", transition: "all 0.2s" }}>LIVE_LOG</div>
                                <div onClick={() => setActivePanel("snapshots")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "10px", fontWeight: "700", fontFamily: "var(--mono)", letterSpacing: "0.1em", color: activePanel === "snapshots" ? "var(--orange)" : "var(--muted)", background: activePanel === "snapshots" ? "rgba(255,107,53,0.05)" : "transparent", transition: "all 0.2s" }}>BRANCHES</div>
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
                                                    if (name) void simCtx.saveSnapshot(name);
                                                }}
                                                className="btn btn-primary" style={{ fontSize: 9, padding: "4px 10px" }}
                                            >
                                                + SAVE_BRANCH
                                            </button>
                                         </div>

                                         <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {simCtx.branches.length === 0 ? (
                                                <div style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic", textAlign: "center", padding: "40px 0" }}>No branches saved yet.</div>
                                            ) : (
                                                simCtx.branches.map((snap) => (
                                                    <div key={snap.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "4px" }}>
                                                        <div>
                                                            <div style={{ fontSize: 11, color: "var(--bright)", fontWeight: 600 }}>{snap.name}</div>
                                                            <div style={{ fontSize: 9, color: "var(--muted)" }}>Step {snap.step} - {snap.adoption}% adoption</div>
                                                        </div>
                                                        <button
                                                            disabled={!snap.simulationId}
                                                            onClick={() => {
                                                                const branchId = snap.simulationId || snap.id;
                                                                if (branchId) router.push(`/simulate?id=${branchId}`);
                                                            }}
                                                            className="btn btn-ghost" style={{ fontSize: 9, color: "var(--orange)", border: "1px solid rgba(255,107,53,0.3)", opacity: snap.simulationId ? 1 : 0.5 }}
                                                        >
                                                            {snap.simulationId ? "OPEN" : "SAVING..."}
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                         </div>
                                    </div>
                                )}
                        </div>
                    </div>
                )}
            </div>
        </div>

            {/* ── AGENT HIGHLIGHT (MATCH RESULTS SIDE CARD / DRAWER) ── */}
            {selectedAgentId !== null && selectedAgent && selectedState && (
                <div style={{ 
                    position: "fixed", top: "12px", right: "12px", width: "440px", height: "calc(100% - 24px)", 
                    background: "rgba(8, 10, 12, 0.92)", backdropFilter: "blur(40px)", 
                    border: "1px solid rgba(255,255,255,0.12)", zIndex: 1000, 
                    boxShadow: "-20px 0 100px rgba(0,0,0,0.9)", 
                    display: "flex", flexDirection: "column", 
                    borderRadius: "24px",
                    animation: "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)" 
                }}>
                    <div style={{ 
                        padding: "16px 20px", 
                        borderBottom: "1px solid rgba(255,255,255,0.08)", 
                        display: "flex", justifyContent: "space-between", alignItems: "center", 
                        background: "linear-gradient(to right, rgba(0,208,132,0.08), transparent)" 
                    }}>
                        <div className="results-side-label" style={{ marginBottom: 0, color: "var(--bright)", letterSpacing: "0.2em" }}>AGENT_TELEMETRY</div>
                        <button onClick={() => setSelectedAgentId(null)} className="btn-ghost-setup" style={{ fontSize: 9, padding: "4px 10px", borderRadius: "100px" }}>CLOSE [×]</button>
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

