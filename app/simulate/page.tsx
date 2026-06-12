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
import { calculateDecision } from "@/lib/prompts";


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
// ─── Batch size scaling: Optimized for stability ───
function getBatchSize(agentCount: number): number {
    return 10; // Increased to 10 to reduce API call overhead and cut token usage by 5x
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
type PreviewTab = "network" | "list" | "agent";

interface ConsoleMessage {
    id: string;
    role: "user" | "system";
    title?: string;
    body: string;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SimulatePage() {
    const simCtx = useSimulation();
    const router = useRouter();

    const [phase, setPhase] = useState<SimPhase>("UNCONFIGURED");
    const [isGenerating, setIsGenerating] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
    const [rightSidebarTab, setRightSidebarTab] = useState<"agent" | "stats">("stats");
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    const [activePanel, setActivePanel] = useState<"log" | "chart" | "snapshots">("chart");
    const [previewTab, setPreviewTab] = useState<PreviewTab>("network");
    const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const chatThreadRef = useRef<HTMLDivElement>(null);
    const [leftPanelWidth, setLeftPanelWidth] = useState(420);
    const [isResizingWorkbench, setIsResizingWorkbench] = useState(false);

    const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
    const [customScenario, setCustomScenario] = useState<Scenario | null>(null);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [quickLaunchCount, setQuickLaunchCount] = useState<number | undefined>(undefined);

    // Filtering
    const [filterSearch, setFilterSearch] = useState("");
    const [filterPersona, setFilterPersona] = useState<PersonaType | "all">("all");
    const [filterDecision, setFilterDecision] = useState<DecisionType | "all" | "null">("all");
    const [isAISearch, setIsAISearch] = useState(false);
    const [isSearchingAI, setIsSearchingAI] = useState(false);

    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);
    const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [stepInsight, setStepInsight] = useState<string | null>(null);

    // Auto-scroll chat thread to bottom on message or simulation status update
    useEffect(() => {
        if (chatThreadRef.current) {
            chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
        }
    }, [consoleMessages, running, isGenerating]);

    const influenceWeightedAdoption = useMemo(() => {
        if (!agents.length) return "0%";
        let totalInfluence = 0;
        let supportInfluence = 0;
        agents.forEach(a => {
            const inf = a.influence_score ?? 0.1;
            totalInfluence += inf;
            if (states[a.id]?.decision === 'support') {
                supportInfluence += inf;
            }
        });
        return totalInfluence > 0 ? `${Math.round((supportInfluence / totalInfluence) * 100)}%` : "0%";
    }, [agents, states]);

    const consensusIndex = useMemo(() => {
        if (!agents.length) return "0.0";
        const support = Object.values(states).filter(s => s.decision === 'support').length / agents.length;
        const oppose = Object.values(states).filter(s => s.decision === 'oppose').length / agents.length;
        const polarization = 4 * support * oppose;
        return (1 - polarization).toFixed(2);
    }, [agents, states]);

    const activeLeaders = useMemo(() => {
        const leaders = agents.filter(a => (a.influence_score ?? 0) > 0.7);
        if (!leaders.length) return "0/0";
        const active = leaders.filter(a => states[a.id]?.decision && states[a.id].decision !== 'neutral').length;
        return `${active}/${leaders.length}`;
    }, [agents, states]);

    const abortRef = useRef(false);
    const controllerRef = useRef<AbortController | null>(null);
    const [isLoadingDb, setIsLoadingDb] = useState(false);
    const lastSavedStepRef = useRef<number>(-1);
    const quickLaunchAppliedRef = useRef(false);

    // ─── Lifecycle: Cleanup on unmount ───
    const persistSimulation = useCallback(async (status: "Pending" | "Completed") => {
        if (!simCtx.dbSimulationId || agents.length === 0) return;
        const persistScenario = customScenario ?? simCtx.scenario ?? getScenario(scenarioId);

        const { error } = await supabase
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
                    results: {
                        states,
                        history,
                        log,
                        agent_histories: agentHistories,
                        step,
                        main_view: mainView,
                        insights: simCtx.insights,
                    },
                },
            })
            .eq("id", simCtx.dbSimulationId);

        if (error) {
            console.error("[AUTO-SAVE] Failed to persist simulation step to Supabase. Code: " + error.code + " | Message: " + error.message + " | Details: " + error.details);
        } else {
            console.log("[AUTO-SAVE] Successfully persisted simulation step to Supabase");
        }
    }, [simCtx.dbSimulationId, agents, edges, customScenario, simCtx.scenario, scenarioId, simCtx.product, simCtx.marketFilters, mainView, states, history, log, agentHistories, step, simCtx.insights]);

    useEffect(() => {
        return () => {
            abortRef.current = true;
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        if (!isResizingWorkbench) return;

        const handlePointerMove = (event: PointerEvent) => {
            setLeftPanelWidth(Math.min(Math.max(event.clientX - 10, 360), 620));
        };

        const handlePointerUp = () => setIsResizingWorkbench(false);

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isResizingWorkbench]);

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
    const { hydrated: simHydrated, dbSimulationId, loadSimulationFromDb, setScenario, setAgentCount } = simCtx;

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const urlId = searchParams.get('id');
        const urlScenario = searchParams.get("scenario");
        const urlCount = Number(searchParams.get("count"));

        async function hydrate() {
            if (!simHydrated) return; // Wait for hydration!
            if (urlId && urlId !== dbSimulationId) {
                setIsLoadingDb(true);
                await loadSimulationFromDb(urlId);
                setIsLoadingDb(false);
            } else if (!urlId && !quickLaunchAppliedRef.current && agents.length === 0) {
                const requestedScenario = SCENARIOS.find((item) => item.id === urlScenario);
                if (requestedScenario) {
                    setScenarioId(requestedScenario.id);
                    setCustomScenario(null);
                    setScenario(requestedScenario);
                }

                if (Number.isFinite(urlCount) && urlCount >= 2) {
                    const safeCount = Math.min(Math.max(Math.round(urlCount), 2), 10000);
                    setQuickLaunchCount(safeCount);
                    setAgentCount(safeCount);
                }

                quickLaunchAppliedRef.current = true;
            }
        }
        hydrate();
    }, [agents.length, simHydrated, dbSimulationId, loadSimulationFromDb, setScenario, setAgentCount]);

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
                await persistSimulation("Pending");
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

        void persistSimulation("Pending").catch((err) => {
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

                setConsoleMessages((current) => [
                    ...current,
                    {
                        id: `${Date.now()}-${current.length}`,
                        role: "system",
                        title: "Population Configured",
                        body: `Successfully generated ${count.toLocaleString()} synthetic agents with Watts-Strogatz social connection topology.`
                    }
                ]);

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

            // ─── Resilient Batch Queue & Fallback Engine ───
            let activeQueue = batches.map((b, idx) => ({ batch: b, originalIndex: idx + 1, attempts: 0 }));
            let doneCount = 0;
            setProgress({ done: 0, total: agents.length });
            abortRef.current = false; // Reset on start

            simCtx.clearTicker();
            simCtx.addTickerMsg(`INITIATING_STEP_${currentStep + 1}_PROCEDURES`, "info");

            while (activeQueue.length > 0) {
                if (abortRef.current || controller.signal.aborted) break;

                const currentItem = activeQueue.shift()!;
                const { batch, originalIndex, attempts } = currentItem;

                simCtx.addTickerMsg(`PROCESSING_BATCH_${originalIndex}/${batches.length}...`, "info");

                // ─── Phase 2: Batch API Execution ──────────────────────────────────────
                const payload: RunStepBatchRequest = {
                    batch: batch.map(agent => {
                        // Seed logic: handle first step partners
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

                // ─── Phase 2: Batch API Execution with Retries ───
                let retries = 2;
                let data: RunStepBatchResponse | null = null;

                while (retries >= 0) {
                    try {
                        const res = await fetch("/api/run-step", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                            signal: AbortSignal.any([controller.signal, AbortSignal.timeout(35000)])
                        });

                        if (!res.ok) {
                            const errData = await res.json();
                            throw new Error(errData.error || `Batch failure (HTTP ${res.status})`);
                        }

                        data = await res.json();
                        break; // Success!
                    } catch (err: any) {
                        if (retries === 0 || abortRef.current || controller.signal.aborted) {
                            break; // out of retries, will be handled by requeue/fallback
                        }
                        console.warn(`Batch ${originalIndex} failed attempt, retrying... (${retries} left)`, err);
                        simCtx.addTickerMsg(`RETRYING_BATCH_${originalIndex}_[${retries}_REMAINING]`, "alert");
                        await new Promise(r => setTimeout(r, 1500));
                        retries--;
                    }
                }

                if (!data) {
                    // Failover 1: If attempts are less than 2, requeue to the end of the line!
                    if (attempts < 2) {
                        simCtx.addTickerMsg(`BATCH_${originalIndex}_STALLED_REQUEUING_TO_END`, "alert");
                        activeQueue.push({ batch, originalIndex, attempts: attempts + 1 });
                        await new Promise(r => setTimeout(r, 1000));
                        continue;
                    } else {
                        // Failover 2: Max attempts exceeded! Trigger deterministic local fallback to ensure zero skipped nodes
                        simCtx.addTickerMsg(`BATCH_${originalIndex}_SALVAGED_VIA_LOCAL_FALLBACK`, "info");

                        const fallbackResults = batch.map(agent => {
                            const isSeeded = currentStep === 0 && currentStates[agent.id]?.isSeeded;
                            const neighborIds = edges
                                .filter(([a, b]) => a === agent.id || b === agent.id)
                                .map(([a, b]) => (a === agent.id ? b : a));

                            const neighborStateMap: Record<number, AgentState> = Object.fromEntries(
                                neighborIds.map(nid => [
                                    nid,
                                    {
                                        decision: neighborSnapshot[nid]?.decision ?? "neutral",
                                        reasoning: neighborSnapshot[nid]?.reasoning ?? "",
                                        step: null,
                                        pending: false
                                    }
                                ])
                            );

                            const neighborAgentsList = neighborIds
                                .map(id => agents.find(ag => ag.id === id))
                                .filter(Boolean) as Agent[];

                            const { decision } = calculateDecision(
                                agent,
                                scenario,
                                neighborStateMap,
                                neighborAgentsList,
                                previousParams
                            );

                            const finalDecision = isSeeded ? "support" as DecisionType : decision;
                            const finalReasoning = isSeeded
                                ? "I am supporting this product as an early partner."
                                : `Cognitive alignment with archetype ${agent.persona} completed successfully.`;

                            return {
                                agentId: agent.id,
                                decision: finalDecision,
                                reasoning: finalReasoning,
                                model: "local-resilience-fallback"
                            };
                        });

                        data = { results: fallbackResults };
                    }
                }

                // ─── Phase 3: State Integration ──────────────────────────────────────
                data.results.forEach((resItem: RunStepResponse) => {
                    const agent = agents.find(a => a.id === resItem.agentId)!;

                    const finalDecision = resItem.decision;
                    const finalReasoning = resItem.reasoning;

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
                        decision: finalDecision,
                        reasoning: finalReasoning
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

                // Safe pacing delay
                if (activeQueue.length > 0) {
                    const jitter = Math.floor(Math.random() * 200);
                    await new Promise(resolve => setTimeout(resolve, 800 + jitter));
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
            const insightText = generateStepInsight(snap, currentStep + 1, prevSnap);
            setStepInsight(insightText);

            setConsoleMessages((current) => [
                ...current,
                {
                    id: `${Date.now()}-${current.length}`,
                    role: "system",
                    title: `Step ${currentStep + 1} Complete`,
                    body: insightText
                }
            ]);

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

    const handleStop = useCallback(() => {
        abortRef.current = true;
        if (controllerRef.current) controllerRef.current.abort();
        setRunning(false);
        simCtx.addTickerMsg("SIMULATION_TERMINATED_BY_USER", "alert");
    }, [simCtx]);

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
                const { error } = await supabase
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
                            results: {
                                states,
                                history,
                                log,
                                agent_histories: agentHistories,
                                step,
                                main_view: mainView,
                                insights: simCtx.insights,
                            },
                        },
                    })
                    .eq("id", simCtx.dbSimulationId);

                if (error) {
                    console.error("[VIEW-RESULTS-SAVE] Failed to persist final results to Supabase. Code: " + error.code + " | Message: " + error.message + " | Details: " + error.details);
                } else {
                    console.log("[VIEW-RESULTS-SAVE] Successfully persisted final results to Supabase");
                }
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

    // Tab stays active when selectedAgentId changes

    const appendConsoleMessage = (message: Omit<ConsoleMessage, "id">) => {
        setConsoleMessages((current) => [
            ...current,
            { ...message, id: `${Date.now()}-${current.length}` },
        ]);
    };

    const selectAgentForInspection = (id: number) => {
        setSelectedAgentId(id);
        setRightSidebarTab("agent");
        setIsRightSidebarOpen(true);
    };

    const handleCloseRightSidebar = useCallback(() => {
        setIsRightSidebarOpen(false);
        setSelectedAgentId(null);
    }, []);

    const handleBuildPreset = () => {
        const safeCount = Math.min(Math.max(Math.round(quickLaunchCount ?? simCtx.agentCount ?? 50), 2), 10000);
        appendConsoleMessage({ role: "user", body: `${safeCount.toLocaleString()} agents > build population` });
        void handleGenerate(safeCount);
    };

    const handleRunStepPreset = () => {
        appendConsoleMessage({ role: "user", body: `Run step ${step + 1}` });
        void handleRunStep();
    };

    const handleAutoPreset = () => {
        appendConsoleMessage({ role: "user", body: "Auto 3x" });
        void handleAutoRun();
    };

    const handleResetPreset = () => {
        appendConsoleMessage({ role: "user", body: "Reset workspace" });
        handleFullReset();
        appendConsoleMessage({
            role: "system",
            title: "Simulation update",
            body: "Workspace reset. Population and run state cleared.",
        });
    };

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        appendConsoleMessage({ role: "user", body: chatInput.trim() });
        const text = chatInput.trim();
        setChatInput("");

        // Auto trigger action based on simulation state
        if (phase === "UNCONFIGURED") {
            handleBuildPreset();
        } else {
            handleRunStepPreset();
        }
    };

    // ─── Render ────────────────────────────────────────────────────────────────

    const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const urlId = searchParams.get('id');
    const isMismatchSim = urlId && simCtx.dbSimulationId !== urlId;

    const showLoading = isLoadingDb || !simHydrated || isMismatchSim;

    return (
        <div className="sim-lovable-shell marketing-theme">
            {/* Left Sidebar Expand Floating Button */}
            {leftSidebarCollapsed && (
                <button
                    type="button"
                    className="floating-expand-btn animate-in fade-in"
                    onClick={() => setLeftSidebarCollapsed(false)}
                    title="Show sidebar panel"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            )}
            {showLoading && (
                <div style={{ position: "absolute", inset: 0, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px", zIndex: 9999 }}>
                    <div className="live-dot" style={{ width: 40, height: 40 }} />
                    <p style={{ color: "var(--orange)", fontFamily: "var(--mono)", letterSpacing: "0.2em" }}>RECONSTRUCTING_SIMULATION_STATE...</p>
                </div>
            )}
            <style jsx global>{`
                html,
                body {
                    overflow: hidden !important;
                    height: 100% !important;
                    width: 100% !important;
                    margin: 0;
                    padding: 0;
                    position: fixed;
                }
            `}</style>

            <div
                className={`sim-workbench ${leftSidebarCollapsed ? "left-collapsed" : ""}`}
                style={{
                    gridTemplateColumns: leftSidebarCollapsed
                        ? `0px 0px minmax(0, 1fr)`
                        : `${leftPanelWidth}px 14px minmax(0, 1fr)`
                }}
            >
                <aside className="conversation-panel">
                    {/* Project Switcher Overlay Drawer */}
                    {isDrawerOpen && (
                        <div
                            className="drawer-backdrop"
                            onClick={() => setIsDrawerOpen(false)}
                        />
                    )}

                    <div className={`sim-side-drawer ${isDrawerOpen ? "open" : ""}`}>
                        <div className="drawer-header">
                            <div className="drawer-brand">
                                <div className="drawer-logo">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="2" y="2" width="9" height="9" rx="2.5" fill="#0052ff" />
                                        <rect x="13" y="2" width="9" height="9" rx="2.5" fill="#0052ff" />
                                        <rect x="2" y="13" width="9" height="9" rx="2.5" fill="#0052ff" />
                                        <rect x="13" y="13" width="9" height="9" rx="2.5" fill="#0052ff" />
                                    </svg>
                                </div>
                                <span className="drawer-workspace-name">Notaprompt</span>
                            </div>
                            <button
                                type="button"
                                className="drawer-close-btn-ref"
                                onClick={() => setIsDrawerOpen(false)}
                                aria-label="Close project menu"
                                title="Close project menu"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="11 17 6 12 11 7"></polyline>
                                    <polyline points="18 17 13 12 18 7"></polyline>
                                </svg>
                            </button>
                        </div>

                        <div className="drawer-content no-scrollbar">
                            {/* Scenario Dropdown Selector Section */}
                            <div className="scenario-selector-section">
                                <span className="drawer-section-title">Scenario</span>
                                <div className="scenario-picker-container">
                                    <button
                                        type="button"
                                        className="scenario-picker-trigger"
                                        onClick={() => setIsScenarioDropdownOpen(!isScenarioDropdownOpen)}
                                    >
                                        <div className="scenario-badge">
                                            <span>{scenario.label ? scenario.label.charAt(0) : "S"}</span>
                                        </div>
                                        <span className="scenario-trigger-label">{scenario.label}</span>
                                        <svg className={`chevron-icon ${isScenarioDropdownOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>

                                    {isScenarioDropdownOpen && (
                                        <div className="scenario-dropdown-menu">
                                            {SCENARIOS.map((s) => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => {
                                                        handleScenarioChange(s.id);
                                                        setIsScenarioDropdownOpen(false);
                                                    }}
                                                    className={`scenario-dropdown-item ${scenarioId === s.id ? "active" : ""}`}
                                                >
                                                    <span className="item-dot"></span>
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* General Navigation Menu */}
                            <div className="navigation-section">
                                <span className="drawer-section-title">General</span>
                                <div className="drawer-menu-group">
                                    <Link href="/" className="drawer-menu-item">
                                        <svg className="menu-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                            <polyline points="9 22 9 12 15 12 15 22" />
                                        </svg>
                                        <span className="menu-label">Home</span>
                                    </Link>
                                    <Link href="/dashboard" className="drawer-menu-item">
                                        <svg className="menu-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="7" height="9" x="3" y="3" rx="1" />
                                            <rect width="7" height="5" x="14" y="3" rx="1" />
                                            <rect width="7" height="9" x="14" y="12" rx="1" />
                                            <rect width="7" height="5" x="3" y="16" rx="1" />
                                        </svg>
                                        <span className="menu-label">Dashboard</span>
                                    </Link>
                                    <Link href="/setup" className="drawer-menu-item">
                                        <svg className="menu-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        <span className="menu-label">Setup Settings</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Tools section */}
                            <div className="tools-section">
                                <span className="drawer-section-title">Tools</span>
                                <div className="drawer-menu-group">
                                    <div className="drawer-menu-item disabled">
                                        <svg className="menu-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                            <line x1="12" y1="22.08" x2="12" y2="12" />
                                        </svg>
                                        <span className="menu-label">Analytics</span>
                                    </div>
                                    <div className="drawer-menu-item disabled">
                                        <svg className="menu-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                        </svg>
                                        <span className="menu-label">Market Dynamics</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recents list */}
                            <div className="recents-section">
                                <span className="drawer-section-title">Recents</span>
                                <div className="drawer-menu-group">
                                    <div className="drawer-menu-item disabled">
                                        <svg className="menu-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        <span className="menu-label">{scenario.label}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="drawer-footer">
                            <div className="upgrade-promo-card">
                                <div className="promo-info">
                                    <div className="promo-title">Upgrade to Pro</div>
                                    <div className="promo-subtitle">Unlock larger population sizes</div>
                                </div>
                                <div className="promo-icon-btn">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10" />
                                    </svg>
                                </div>
                            </div>

                            <div className="user-profile-row-ref">
                                <div className="user-avatar-ref">
                                    <span>DG</span>
                                </div>
                                <div className="user-info-ref">
                                    <div className="user-name-ref">Developer Account</div>
                                    <div className="user-email-ref">admin@strawberry.ai</div>
                                </div>
                                <div className="user-chevron-ref">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="sim-left-header">
                        <div className="header-left" onClick={() => setIsDrawerOpen(true)}>
                            <button
                                type="button"
                                className="hamburger-menu-btn"
                                aria-label="Switch project"
                                title="Switch project"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="4" y1="6" x2="20" y2="6" />
                                    <line x1="4" y1="12" x2="16" y2="12" />
                                    <line x1="4" y1="18" x2="20" y2="18" />
                                </svg>
                            </button>
                            <div className="header-info">
                                <div className="project-title-row">
                                    <span className="project-name">{simCtx.product?.name || "HabitLoop"}</span>
                                    <svg className="dropdown-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                                <span className="preview-status">Previewing last saved version</span>
                            </div>
                        </div>
                        <div className="header-actions">
                            <Link href={simCtx.dbSimulationId ? `/results?id=${simCtx.dbSimulationId}` : "/results"} title="View history & report" className="header-action-btn">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </Link>
                            <button
                                type="button"
                                title="Hide panel"
                                className="header-action-btn"
                                onClick={() => setLeftSidebarCollapsed(true)}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <line x1="9" y1="3" x2="9" y2="21" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div ref={chatThreadRef} className="chat-thread no-scrollbar">
                        {consoleMessages.map((message) => (
                            <div key={message.id} className={`chat-wrapper ${message.role}`}>
                                {message.role === "system" && <div className="chat-avatar system">N</div>}
                                <div className="chat-body-group">
                                    <span className="chat-timestamp">{message.role === "system" ? "Analyst" : "User"}</span>
                                    <div className="chat-bubble">
                                        {message.title && <strong className="chat-bubble-title">{message.title}</strong>}
                                        <p>{message.body}</p>
                                        {message.role === "system" && message.title?.includes("Complete") && !running && message.id === consoleMessages.filter(m => m.role === "system" && m.title?.includes("Complete")).slice(-1)[0]?.id && (
                                            <div className="next-actions" style={{ marginTop: 10 }}>
                                                <button type="button" onClick={handleRunStepPreset} className="primary" style={{ height: 26, fontSize: 9 }}>Run next step</button>
                                                <button type="button" onClick={handleViewResults} style={{ height: 26, fontSize: 9, marginLeft: 6 }}>View report</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {message.role === "user" && <div className="chat-avatar user">U</div>}
                            </div>
                        ))}

                        {consoleMessages.length === 0 && !isGenerating && !running && (
                            <div className="chat-wrapper system">
                                <div className="chat-avatar system">N</div>
                                <div className="chat-body-group">
                                    <span className="chat-timestamp">System</span>
                                    <div className="chat-bubble">
                                        <strong className="chat-bubble-title">Setup Guidance</strong>
                                        <p>Population ready. Select a product scenario parameters and execute steps to simulate market adoption behavior.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(isGenerating || running) && (
                            <div className="chat-wrapper system">
                                <div className="chat-avatar system">N</div>
                                <div className="chat-body-group">
                                    <span className="chat-timestamp">System</span>
                                    <div className="chat-bubble shimmer-response" style={{ width: "100%", maxWidth: "340px", padding: "16px", borderRadius: "4px", border: "1px solid var(--border-bright)" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                            <strong className="chat-bubble-title" style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", color: "var(--orange)" }}>
                                                {isGenerating ? "// GENERATING_POPULATION" : `// SIMULATING_STEP_0${step + 1}`}
                                            </strong>
                                            <span className="live-dot" style={{ width: 6, height: 6, background: "var(--accent)" }} />
                                        </div>
                                        <div style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--text)", lineHeight: 1.4, marginBottom: 12 }}>
                                            {isGenerating
                                                ? `Building ${Number(quickLaunchCount || simCtx.agentCount || 50).toLocaleString()} synthetic respondents and compiling social network graph...`
                                                : `Running multi-agent step decisions across Watts-Strogatz network...`}
                                        </div>
                                        {progress ? (
                                            <div style={{ width: "100%" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: 4 }}>
                                                    <span>BATCH_INDEX: {progress.done} / {progress.total}</span>
                                                    <span>{Math.round((progress.done / progress.total) * 100)}%</span>
                                                </div>
                                                <div style={{ width: "100%", height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: `${(progress.done / progress.total) * 100}%`, background: "var(--accent)", transition: "width 0.3s ease-out" }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <div style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase" }}>CALIBRATING NETWORK NODES...</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="chat-input-container" style={{ padding: "0 12px 12px 12px", borderTop: "1px solid rgba(0, 82, 255, 0.05)", background: "rgba(255, 255, 255, 0.45)" }}>
                        <div className="chat-input-bar">
                            <input
                                type="text"
                                placeholder={isConfigured ? "Ask the analyst or type a command..." : "Type a command (e.g. 'build 100')..."}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="send-btn"
                                onClick={handleSendMessage}
                                disabled={!chatInput.trim() || isGenerating || running}
                            >
                                Send
                            </button>
                        </div>
                    </div>

                    <div className="control-dock">
                        <div 
                            className="sidebar-stats-pill clickable-stats-trigger" 
                            onClick={() => {
                                setRightSidebarTab("stats");
                                setIsRightSidebarOpen(true);
                            }}
                            title="Click to view overall stats"
                        >
                            <div className="stat-item">
                                <span>Epoch</span>
                                <strong>{step}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Adoption</span>
                                <strong>{agents.length ? `${Math.round((Object.values(states).filter((s) => s.decision === "support").length / agents.length) * 100)}%` : "0%"}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Friction</span>
                                <strong>{agents.length ? `${Math.round((Object.values(states).filter((s) => s.decision === "neutral").length / agents.length) * 100)}%` : "0%"}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Resistance</span>
                                <strong>{agents.length ? `${Math.round((Object.values(states).filter((s) => s.decision === "oppose").length / agents.length) * 100)}%` : "0%"}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Inf-Adoption</span>
                                <strong>{influenceWeightedAdoption}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Consensus</span>
                                <strong>{consensusIndex}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Active Leaders</span>
                                <strong>{activeLeaders}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Pop Size</span>
                                <strong>{agents.length}</strong>
                            </div>
                        </div>

                        <div className="quick-controls">
                            <button type="button" className="action-btn auto" onClick={handleAutoPreset} disabled={!isConfigured || running || isGenerating}>
                                Auto 3x
                            </button>
                            <button type="button" className="action-btn reset" onClick={handleResetPreset} disabled={running || isGenerating}>
                                Reset
                            </button>
                            {running ? (
                                <button type="button" className="action-btn stop danger" onClick={handleStop}>
                                    Stop
                                </button>
                            ) : (
                                <button type="button" className="action-btn run primary" onClick={isConfigured ? handleRunStepPreset : handleBuildPreset} disabled={isGenerating}>
                                    {isConfigured ? `Run Step ${step + 1}` : "Build"}
                                </button>
                            )}
                        </div>
                    </div>
                </aside>

                <button
                    type="button"
                    className={`workbench-resizer ${isResizingWorkbench ? "active" : ""}`}
                    aria-label="Resize simulation panels"
                    onPointerDown={(event) => {
                        event.preventDefault();
                        setIsResizingWorkbench(true);
                    }}
                />

                <section className="preview-panel">
                    <header className="preview-toolbar">
                        <div className="preview-tabs" role="tablist" aria-label="Simulation views">
                            <button
                                type="button"
                                className={previewTab === "network" ? "active" : ""}
                                onClick={() => setPreviewTab("network")}
                                title="Main Grid"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: previewTab === "network" ? 6 : 0, flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                                {previewTab === "network" && <span>Main Grid</span>}
                            </button>

                            <span className="tab-separator">|</span>

                            <button
                                type="button"
                                className={previewTab === "list" ? "active" : ""}
                                onClick={() => setPreviewTab("list")}
                                title="Agent List"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: previewTab === "list" ? 6 : 0, flexShrink: 0 }}>
                                    <rect x="3" y="3" width="7" height="7" />
                                    <rect x="14" y="3" width="7" height="7" />
                                    <rect x="14" y="14" width="7" height="7" />
                                    <rect x="3" y="14" width="7" height="7" />
                                </svg>
                                {previewTab === "list" && <span>Agent List</span>}
                            </button>
                        </div>

                        <div className="preview-title">
                            {/* Empty space */}
                        </div>

                        <div className="preview-tabs" role="tablist" aria-label="Inspector views">
                            <button
                                type="button"
                                className={isRightSidebarOpen && rightSidebarTab === "agent" ? "active" : ""}
                                onClick={() => {
                                    if (selectedAgentId !== null) {
                                        if (isRightSidebarOpen && rightSidebarTab === "agent") {
                                            handleCloseRightSidebar();
                                        } else {
                                            setRightSidebarTab("agent");
                                            setIsRightSidebarOpen(true);
                                        }
                                    }
                                }}
                                disabled={selectedAgentId === null}
                                title={selectedAgentId === null ? "Select an agent to inspect details" : "Agent Details"}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: (isRightSidebarOpen && rightSidebarTab === "agent") ? 6 : 0, flexShrink: 0 }}>
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                {(isRightSidebarOpen && rightSidebarTab === "agent") && <span>Agent Detail</span>}
                            </button>

                            <span className="tab-separator">|</span>

                            <button
                                type="button"
                                className={isRightSidebarOpen && rightSidebarTab === "stats" ? "active" : ""}
                                onClick={() => {
                                    if (isRightSidebarOpen && rightSidebarTab === "stats") {
                                        handleCloseRightSidebar();
                                    } else {
                                        setRightSidebarTab("stats");
                                        setIsRightSidebarOpen(true);
                                    }
                                }}
                                disabled={!isConfigured}
                                title="Overall Statistics"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: (isRightSidebarOpen && rightSidebarTab === "stats") ? 6 : 0, flexShrink: 0 }}>
                                    <line x1="18" y1="20" x2="18" y2="10" />
                                    <line x1="12" y1="20" x2="12" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                                {(isRightSidebarOpen && rightSidebarTab === "stats") && <span>Overall Stats</span>}
                            </button>
                        </div>
                    </header>

                    <div className="preview-content" style={{ padding: 0, overflow: "hidden" }}>
                        {!isConfigured ? (
                            <ConfigScreen
                                onGenerate={handleGenerate}
                                isGenerating={isGenerating}
                                initialCount={quickLaunchCount}
                                maxCount={Math.max(quickLaunchCount ?? 0, 1499)}
                            />
                        ) : (
                            <div className="preview-layout-container">
                                <div className="preview-view-main">
                                    {previewTab === "network" ? (
                                        <GlobalNetworkGraph
                                            agents={filteredAgents}
                                            edges={edges}
                                            states={states}
                                            selectedId={selectedAgentId}
                                            onSelect={selectAgentForInspection}
                                        />
                                    ) : (
                                        <div className="agent-list-view">
                                            <AgentListFilter
                                                search={filterSearch}
                                                onSearchChange={setFilterSearch}
                                                persona={filterPersona}
                                                onPersonaChange={setFilterPersona}
                                                decision={filterDecision}
                                                onDecisionChange={setFilterDecision}
                                                isAISearch={isAISearch}
                                                onToggleAI={() => setIsAISearch(!isAISearch)}
                                                isSearching={isSearchingAI}
                                                resultsCount={filteredAgents.length}
                                            />
                                            <AgentGrid agents={filteredAgents} states={states} selectedId={selectedAgentId} onSelect={selectAgentForInspection} />
                                        </div>
                                    )}
                                </div>
                                <div className={`agent-detail-sidebar-container ${isRightSidebarOpen ? "open" : ""}`}>
                                    {isRightSidebarOpen && (
                                        <div className="agent-detail-sidebar-inner">
                                            <div className="agent-detail-sidebar-header-tabs" style={{ justifyContent: "space-between", alignItems: "center", padding: "12px 18px" }}>
                                                <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 800, color: "var(--orange)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                                                    // {rightSidebarTab === "agent" ? "AGENT_INSPECTOR" : "GLOBAL_STATISTICS"}
                                                </span>
                                                
                                                <button
                                                    type="button"
                                                    className="close-btn"
                                                    onClick={handleCloseRightSidebar}
                                                    aria-label="Close panel"
                                                    style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="agent-detail-sidebar-body">
                                                {rightSidebarTab === "agent" && selectedAgent && selectedState ? (
                                                    <AgentDetail
                                                        agent={selectedAgent}
                                                        state={selectedState}
                                                        agentHistory={selectedHistory}
                                                        allStates={states}
                                                        agents={agents}
                                                        edges={edges}
                                                        onSelectAgent={selectAgentForInspection}
                                                        onToggleSeed={handleToggleSeed}
                                                        isConfigPhase={step === 0}
                                                    />
                                                ) : rightSidebarTab === "stats" ? (
                                                    <div className="overall-stats-tab-content">
                                                        <div className="stats-section-block">
                                                            <h4>Adoption Trajectory</h4>
                                                            <div className="chart-wrapper-box" style={{ height: "220px", width: "100%", position: "relative" }}>
                                                                <AdoptionChart history={history} total={agents.length} />
                                                            </div>
                                                        </div>
                                                        <div className="stats-section-block log-block">
                                                            <h4>Recent Step Logs</h4>
                                                            <div className="steplog-wrapper-box" style={{ flex: 1, minHeight: "260px" }}>
                                                                <StepLog entries={log} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="empty-tab-state">
                                                        No agent selected. Use the grid view to select a node for detailed analysis.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {showCustomForm && (
                <CustomScenarioForm
                    onApply={handleApplyCustom}
                    onClose={() => setShowCustomForm(false)}
                    existing={null}
                />
            )}

            <style jsx global>{`
                .sim-lovable-shell {
                    position: fixed;
                    inset: 0;
                    z-index: 100;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    background:
                        linear-gradient(180deg, rgba(0, 82, 255, 0.045) 0%, rgba(250, 249, 246, 0.98) 240px, var(--bg) 100%),
                        var(--bg);
                    color: var(--text);
                    font-family: var(--sans);
                }

                .sim-workbench {
                    display: grid;
                    gap: 0;
                    flex: 1;
                    min-height: 0;
                    padding: 18px 20px 20px;
                }

                /* Drawer Backdrop */
                .drawer-backdrop {
                    position: absolute;
                    inset: 0;
                    z-index: 100;
                    background: rgba(15, 23, 42, 0.08);
                    backdrop-filter: blur(1.5px);
                    border-radius: 12px;
                    animation: fadeIn 0.2s ease-out;
                }

                /* Floating Drawer Pop-Out (Slides horizontally from left to right) */
                .sim-side-drawer {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 290px;
                    max-width: 85%;
                    background: rgba(255, 255, 255, 0.90);
                    backdrop-filter: blur(20px);
                    color: #1e293b;
                    z-index: 120;
                    box-shadow: 10px 0 40px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8);
                    display: flex;
                    flex-direction: column;
                    transform: translateX(-100%);
                    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
                    border-right: 1px solid rgba(0, 82, 255, 0.08);
                    border-radius: 12px;
                }

                .sim-side-drawer.open {
                    transform: translateX(0);
                }

                .hamburger-menu-btn,
                .drawer-close-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    padding: 0;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    border-radius: 6px;
                    background: #ffffff;
                    color: var(--muted);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .hamburger-menu-btn:hover,
                .drawer-close-btn:hover {
                    color: var(--bright);
                    background: #f8fafc;
                    border-color: rgba(0, 82, 255, 0.15);
                }

                .drawer-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 56px;
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(0, 82, 255, 0.06);
                    background: rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(10px);
                }

                .drawer-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .drawer-logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    filter: drop-shadow(0 2px 6px rgba(0, 82, 255, 0.15));
                }

                .drawer-workspace-name {
                    font-size: 15px;
                    font-weight: 800;
                    font-family: var(--sans);
                    color: #0052ff;
                    letter-spacing: -0.01em;
                }

                .drawer-close-btn-ref {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    padding: 0;
                    border: 1px solid rgba(15, 23, 42, 0.06);
                    border-radius: 6px;
                    background: #ffffff;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
                }

                .drawer-close-btn-ref:hover {
                    color: #0f172a;
                    background: #f8fafc;
                    border-color: rgba(15, 23, 42, 0.12);
                    transform: translateX(-1px);
                }

                .drawer-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .scenario-selector-section {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .scenario-picker-container {
                    position: relative;
                    width: 100%;
                }

                .scenario-picker-trigger {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    padding: 10px 12px;
                    background: #ffffff;
                    border: 1px solid rgba(15, 23, 42, 0.06);
                    border-radius: 10px;
                    cursor: pointer;
                    text-align: left;
                    font-family: var(--sans);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
                    gap: 10px;
                }

                .scenario-picker-trigger:hover {
                    border-color: rgba(0, 82, 255, 0.2);
                    background: #fafbfe;
                    box-shadow: 0 4px 12px rgba(0, 82, 255, 0.04);
                }

                .scenario-badge {
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    background: linear-gradient(135deg, #0052ff 0%, #003dbb 100%);
                    color: #ffffff;
                    font-weight: 800;
                    font-size: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: var(--sans);
                    box-shadow: 0 2px 4px rgba(0, 82, 255, 0.2);
                }

                .scenario-trigger-label {
                    flex: 1;
                    font-size: 13px;
                    font-weight: 700;
                    color: #1e293b;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .scenario-picker-trigger .chevron-icon {
                    color: #94a3b8;
                    transition: transform 0.2s ease;
                }

                .scenario-picker-trigger .chevron-icon.open {
                    transform: rotate(180deg);
                    color: #0f172a;
                }

                .scenario-dropdown-menu {
                    position: absolute;
                    top: calc(100% + 6px);
                    left: 0;
                    right: 0;
                    background: #ffffff;
                    border: 1px solid rgba(15, 23, 42, 0.08);
                    border-radius: 10px;
                    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
                    z-index: 130;
                    padding: 6px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    animation: slideUpIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes slideUpIn {
                    from { transform: translateY(4px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .scenario-dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    padding: 8px 10px;
                    border-radius: 8px;
                    border: 0;
                    background: transparent;
                    font-family: var(--sans);
                    font-size: 12.5px;
                    font-weight: 600;
                    color: #475569;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.15s ease;
                }

                .scenario-dropdown-item:hover {
                    color: #0f172a;
                    background: #f1f5f9;
                }

                .scenario-dropdown-item.active {
                    color: #0052ff;
                    background: #eff6ff;
                }

                .scenario-dropdown-item .item-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: transparent;
                    transition: background 0.15s ease;
                }

                .scenario-dropdown-item.active .item-dot {
                    background: #0052ff;
                }

                .drawer-section-title {
                    font-size: 10px;
                    font-weight: 700;
                    font-family: var(--mono);
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    padding: 0 4px;
                    margin-bottom: 6px;
                }

                .drawer-menu-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .drawer-menu-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    border-radius: 10px;
                    color: #475569;
                    background: transparent;
                    border: 0;
                    width: 100%;
                    text-align: left;
                    font-size: 13px;
                    font-family: var(--sans);
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .drawer-menu-item:hover:not(.disabled) {
                    color: #0f172a;
                    background: rgba(15, 23, 42, 0.04);
                }

                .drawer-menu-item.active {
                    color: #0052ff;
                    background: rgba(0, 82, 255, 0.06);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
                }

                .drawer-menu-item.disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }

                .drawer-menu-item .menu-icon-svg {
                    color: currentColor;
                    opacity: 0.75;
                    transition: transform 0.2s ease, opacity 0.2s ease;
                }

                .drawer-menu-item:hover .menu-icon-svg {
                    opacity: 1;
                    transform: scale(1.05);
                }

                .drawer-footer {
                    padding: 18px 16px;
                    border-top: 1px solid rgba(0, 82, 255, 0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    background: rgba(248, 250, 252, 0.5);
                    border-radius: 0 0 12px 12px;
                }

                .upgrade-promo-card {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%);
                    border: 1px solid rgba(168, 85, 247, 0.12);
                    border-radius: 10px;
                    padding: 12px;
                    position: relative;
                    overflow: hidden;
                }

                .upgrade-promo-card::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    transform: translateX(-100%);
                    transition: transform 0.6s ease;
                }

                .upgrade-promo-card:hover::before {
                    transform: translateX(100%);
                }

                .promo-info {
                    display: flex;
                    flex-direction: column;
                }

                .promo-title {
                    font-size: 12px;
                    font-weight: 700;
                    color: #1e293b;
                    font-family: var(--sans);
                }

                .promo-subtitle {
                    font-size: 10px;
                    color: #64748b;
                    font-family: var(--sans);
                }

                .chat-wrapper {
                    display: flex;
                    gap: 12px;
                    max-width: 85%;
                    align-items: flex-start;
                }

                .chat-wrapper.user {
                    margin-left: auto;
                    flex-direction: row;
                    justify-content: flex-end;
                }

                .chat-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 700;
                    font-family: var(--sans);
                    flex-shrink: 0;
                }

                .chat-avatar.system {
                    background: rgba(0, 82, 255, 0.08);
                    color: #0052ff;
                    border: 1px solid rgba(0, 82, 255, 0.15);
                }

                .chat-avatar.user {
                    background: #f1f5f9;
                    color: #334155;
                    border: 1px solid #cbd5e1;
                }

                .chat-body-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .chat-wrapper.user .chat-body-group {
                    align-items: flex-end;
                }

                .chat-wrapper.system .chat-body-group {
                    align-items: flex-start;
                }

                .chat-timestamp {
                    font-size: 9px;
                    color: var(--muted);
                    font-family: var(--sans);
                    font-weight: 500;
                }

                .chat-bubble {
                    border-radius: 12px;
                    padding: 12px 14px;
                    font-size: 13px;
                    line-height: 1.5;
                    font-family: var(--sans);
                }

                .chat-wrapper.system .chat-bubble {
                    background: rgba(0, 0, 0, 0.02);
                    color: var(--text);
                    border: 1px solid var(--border);
                    border-top-left-radius: 2px;
                }

                .chat-wrapper.user .chat-bubble {
                    background: #eff6ff;
                    color: #1e40af;
                    border: 1px solid #bfdbfe;
                    border-top-right-radius: 2px;
                }

                .chat-bubble-title {
                    display: block;
                    font-size: 9px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--muted);
                    margin-bottom: 4px;
                }

                .chat-bubble p {
                    margin: 0;
                }

                .shimmer-response::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    transform: translateX(-120%);
                    background: linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.0) 35%, rgba(255, 255, 255, 0.78) 50%, rgba(255, 255, 255, 0.0) 65%, transparent 100%);
                    animation: response-shimmer 1.7s ease-in-out infinite;
                }

                .next-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                    flex-wrap: wrap;
                }

                .promo-icon-btn {
                    width: 20px;
                    height: 20px;
                    background: #f59e0b;
                    color: #000;
                    font-size: 9px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    box-shadow: 0 0 6px rgba(245, 158, 11, 0.3);
                }

                .user-profile-row-ref {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    padding: 4px 0;
                }

                .user-avatar-ref {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #0052ff 0%, #003dbb 100%);
                    color: white;
                    font-size: 12.5px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: var(--sans);
                    box-shadow: 0 2px 6px rgba(0, 82, 255, 0.15);
                    flex-shrink: 0;
                }

                .user-info-ref {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    flex: 1;
                    min-width: 0;
                }

                .user-name-ref {
                    font-size: 12.5px;
                    font-weight: 700;
                    color: #0f172a;
                    font-family: var(--sans);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .user-email-ref {
                    font-size: 10.5px;
                    color: #64748b;
                    font-family: var(--sans);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .user-chevron-ref {
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Floating Collapse Restore Button */
                .floating-expand-btn {
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 150;
                    width: 18px;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.84);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(0, 82, 255, 0.12);
                    border-left: 0;
                    border-radius: 0 8px 8px 0;
                    box-shadow: 4px 0 16px rgba(15, 23, 42, 0.08);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--bright);
                    padding: 0;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .floating-expand-btn:hover {
                    width: 22px;
                    background: #ffffff;
                    color: var(--accent);
                    box-shadow: 4px 0 20px rgba(0, 82, 255, 0.15);
                }

                /* Collapsed Panel Slide Actions */
                .conversation-panel {
                    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s, width 0.25s;
                }

                .left-collapsed .conversation-panel {
                    transform: translateX(-100%);
                    opacity: 0;
                    pointer-events: none;
                }

                .left-collapsed .workbench-resizer {
                    display: none;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .sim-workbench {
                    display: grid;
                    gap: 0;
                    flex: 1;
                    min-height: 0;
                    padding: 18px 20px 20px;
                }

                .conversation-panel,
                .preview-panel {
                    min-height: 0;
                    border: 1px solid rgba(0, 82, 255, 0.13);
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.78);
                    box-shadow: 0 18px 54px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.72);
                    backdrop-filter: blur(24px);
                    overflow: hidden;
                }

                .conversation-panel {
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    padding: 0;
                }

                .workbench-resizer {
                    align-self: stretch;
                    justify-self: center;
                    width: 14px;
                    height: auto;
                    padding: 0;
                    border: 0;
                    border-radius: 0;
                    background: transparent;
                    cursor: col-resize;
                    position: relative;
                }

                .workbench-resizer::before {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 4px;
                    height: 84px;
                    border-radius: 999px;
                    background: rgba(0, 82, 255, 0.14);
                    transform: translate(-50%, -50%);
                    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.72), 0 10px 22px rgba(0, 82, 255, 0.12);
                    transition: width 160ms ease, background 160ms ease;
                }

                .workbench-resizer:hover::before,
                .workbench-resizer.active::before {
                    width: 6px;
                    background: rgba(0, 82, 255, 0.42);
                }

                .sim-left-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 52px;
                    padding: 8px 12px;
                    border-bottom: 1px solid rgba(0, 82, 255, 0.08);
                    background: rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(10px);
                    flex-shrink: 0;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                }

                .logo-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 26px;
                    height: 26px;
                    filter: drop-shadow(0 2px 5px rgba(255, 75, 75, 0.12));
                }

                .header-info {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .project-title-row {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .project-name {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--bright);
                    font-family: var(--sans);
                    line-height: 1.2;
                }

                .dropdown-arrow {
                    color: var(--muted);
                    width: 9px;
                    height: 9px;
                    transition: transform 0.2s;
                }

                .header-left:hover .dropdown-arrow {
                    color: var(--bright);
                    transform: translateY(1px);
                }

                .preview-status {
                    font-size: 9px;
                    color: var(--muted);
                    font-family: var(--sans);
                    font-weight: 500;
                    line-height: 1.1;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .header-action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 26px;
                    height: 26px;
                    border: 1px solid transparent;
                    border-radius: 6px;
                    color: var(--muted);
                    background: transparent;
                    transition: all 0.15s ease;
                }

                .header-action-btn:hover {
                    color: var(--bright);
                    background: rgba(0, 0, 0, 0.04);
                    border-color: rgba(0, 0, 0, 0.03);
                }

                .preview-toolbar {
                    display: grid;
                    grid-template-columns: auto minmax(180px, 1fr) auto;
                    align-items: center;
                    gap: 10px;
                    min-height: 54px;
                    padding: 10px 12px 14px;
                    background: transparent;
                }

                .conversation-header span,
                .run-summary span,
                .chat-message span {
                    display: block;
                    color: var(--muted);
                    font-family: var(--mono);
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0;
                    text-transform: uppercase;
                }

                .conversation-header strong,
                .preview-title strong {
                    color: var(--bright);
                    font-size: 14px;
                    font-weight: 800;
                }

                button {
                    height: 28px;
                    border: 1px solid rgba(0, 0, 0, 0.12);
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.74);
                    color: var(--bright);
                    cursor: pointer;
                    font-family: var(--mono);
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0;
                    padding: 0 12px;
                }

                button:disabled {
                    cursor: not-allowed;
                    opacity: 0.48;
                }

                button.primary {
                    border-color: rgba(0, 82, 255, 0.45);
                    background: linear-gradient(135deg, #2f91ff 0%, var(--accent) 100%);
                    color: white;
                    box-shadow: 0 8px 18px rgba(0, 82, 255, 0.2);
                }

                button.danger {
                    border-color: rgba(214, 55, 55, 0.28);
                    color: #c62828;
                }

                .run-summary {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1px;
                    border-bottom: 1px solid var(--border);
                    background: var(--border);
                }

                .run-summary div {
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.68);
                }

                .run-summary strong {
                    display: block;
                    margin-top: 6px;
                    color: var(--bright);
                    font-family: var(--mono);
                    font-size: 16px;
                }

                .chat-thread {
                    flex: 1;
                    min-height: 0;
                    overflow-y: auto;
                    padding: 20px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .chat-input-bar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    border-radius: 12px;
                    background: #ffffff;
                    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
                }

                .chat-input-bar input {
                    flex: 1;
                    border: 0;
                    background: transparent;
                    outline: none;
                    font-size: 13px;
                    color: var(--bright);
                    font-family: var(--sans);
                }

                .chat-input-bar input::placeholder {
                    color: #a1a1aa;
                }

                .chat-input-bar .icon-btn {
                    width: 28px;
                    height: 28px;
                    border: 0;
                    background: transparent;
                    color: #71717a;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s;
                }

                .chat-input-bar .icon-btn:hover:not(:disabled) {
                    background: #f4f4f5;
                    color: #18181b;
                }

                .chat-input-bar .icon-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .chat-input-bar .send-btn {
                    height: 28px;
                    border: 0;
                    border-radius: 6px;
                    background: #0052ff;
                    color: white;
                    font-family: var(--sans);
                    font-size: 11px;
                    font-weight: 600;
                    padding: 0 12px;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0, 82, 255, 0.15);
                    transition: background 0.15s;
                }

                .chat-input-bar .send-btn:hover:not(:disabled) {
                    background: #0041cc;
                }

                .chat-input-bar .send-btn:disabled {
                    background: #e4e4e7;
                    color: #a1a1aa;
                    box-shadow: none;
                    cursor: not-allowed;
                }


                .chat-wrapper {
                    display: flex;
                    gap: 12px;
                    max-width: 85%;
                    align-items: flex-start;
                }

                .chat-wrapper.user {
                    margin-left: auto;
                    flex-direction: row;
                    justify-content: flex-end;
                }

                .chat-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 700;
                    font-family: var(--sans);
                    flex-shrink: 0;
                }

                .chat-avatar.system {
                    background: rgba(0, 82, 255, 0.08);
                    color: #0052ff;
                    border: 1px solid rgba(0, 82, 255, 0.15);
                }

                .chat-avatar.user {
                    background: #f1f5f9;
                    color: #334155;
                    border: 1px solid #cbd5e1;
                }

                .chat-body-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .chat-wrapper.user .chat-body-group {
                    align-items: flex-end;
                }

                .chat-wrapper.system .chat-body-group {
                    align-items: flex-start;
                }

                .chat-timestamp {
                    font-size: 9px;
                    color: var(--muted);
                    font-family: var(--sans);
                    font-weight: 500;
                }

                .chat-bubble {
                    border-radius: 12px;
                    padding: 12px 14px;
                    font-size: 13px;
                    line-height: 1.5;
                    font-family: var(--sans);
                }

                .chat-wrapper.system .chat-bubble {
                    background: rgba(0, 0, 0, 0.02);
                    color: var(--text);
                    border: 1px solid var(--border);
                    border-top-left-radius: 2px;
                }

                .chat-wrapper.user .chat-bubble {
                    background: #eff6ff;
                    color: #1e40af;
                    border: 1px solid #bfdbfe;
                    border-top-right-radius: 2px;
                }

                .chat-bubble-title {
                    display: block;
                    font-size: 9px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--muted);
                    margin-bottom: 4px;
                }

                .chat-bubble p {
                    margin: 0;
                }

                .shimmer-response::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    transform: translateX(-120%);
                    background: linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.0) 35%, rgba(255, 255, 255, 0.78) 50%, rgba(255, 255, 255, 0.0) 65%, transparent 100%);
                    animation: response-shimmer 1.7s ease-in-out infinite;
                }

                .next-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                    flex-wrap: wrap;
                }

                .control-dock {
                    flex-shrink: 0;
                    margin: 0 12px 12px;
                    border: 1px solid rgba(0, 82, 255, 0.12);
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.86);
                    box-shadow: 0 16px 34px rgba(15, 23, 42, 0.1);
                    padding: 12px;
                }

                .prompt-display {
                    display: none;
                    grid-template-columns: minmax(0, 1fr) auto;
                    gap: 10px;
                    align-items: center;
                    min-height: 56px;
                    padding: 0 8px 0 18px;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    border-radius: 14px;
                    background: rgba(255, 255, 255, 0.72);
                    margin-bottom: 8px;
                }

                .prompt-display span {
                    color: var(--muted);
                    font-size: 19px;
                    line-height: 1;
                }

                .prompt-display button {
                    width: 46px;
                    height: 46px;
                    padding: 0;
                    border: 0;
                    background: #b8bdc3;
                    color: white;
                    font-size: 20px;
                }

                .sidebar-stats-pill {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    grid-template-rows: auto auto;
                    row-gap: 8px;
                    column-gap: 4px;
                    padding: 10px 10px;
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.6);
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
                    margin-bottom: 12px;
                    font-family: var(--sans);
                    font-size: 8px;
                    font-weight: 500;
                    text-align: center;
                }

                .sidebar-stats-pill .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    color: var(--muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .sidebar-stats-pill .stat-item strong {
                    color: var(--bright);
                    font-size: 11px;
                    font-weight: 700;
                    margin-top: 1px;
                }

                .marketing-theme .sidebar-stats-pill {
                    background: rgba(255, 255, 255, 0.85);
                    border-color: rgba(0, 82, 255, 0.1);
                }

                .marketing-theme .sidebar-stats-pill .stat-item:nth-child(2) strong {
                    color: var(--support);
                }
                .marketing-theme .sidebar-stats-pill .stat-item:nth-child(3) strong {
                    color: var(--neutral);
                }
                .marketing-theme .sidebar-stats-pill .stat-item:nth-child(4) strong {
                    color: var(--oppose);
                }
                .marketing-theme .sidebar-stats-pill .stat-item:nth-child(5) strong {
                    color: var(--support);
                }
                .marketing-theme .sidebar-stats-pill .stat-item:nth-child(6) strong {
                    color: #3b82f6;
                }
                .marketing-theme .sidebar-stats-pill .stat-item:nth-child(7) strong {
                    color: var(--bright);
                }

                .clickable-stats-trigger {
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .clickable-stats-trigger:hover {
                    border-color: rgba(0, 82, 255, 0.25) !important;
                    background: rgba(0, 82, 255, 0.04) !important;
                    box-shadow: 0 6px 16px rgba(0, 82, 255, 0.06) !important;
                }

                .sidebar-stats-pill .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    color: var(--muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .sidebar-stats-pill .stat-item strong {
                    color: var(--bright);
                    font-size: 11px;
                    font-weight: 700;
                    margin-top: 1px;
                }

                .marketing-theme .sidebar-stats-pill {
                    background: rgba(255, 255, 255, 0.85);
                    border-color: rgba(0, 82, 255, 0.1);
                }

                .marketing-theme .sidebar-stats-pill .stat-item:nth-child(2) strong {
                    color: var(--support);
                }
                .marketing-theme .sidebar-stats-pill .stat-item:nth-child(3) strong {
                    color: var(--neutral);
                }
                .marketing-theme .sidebar-stats-pill .stat-item:nth-child(4) strong {
                    color: var(--oppose);
                }

                .quick-controls {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1.3fr;
                    gap: 8px;
                }

                .quick-controls .action-btn {
                    height: 38px;
                    font-family: var(--sans);
                    font-size: 11px;
                    font-weight: 600;
                    border-radius: 8px;
                    border: 1px solid rgba(0, 82, 255, 0.1);
                    background: #ffffff;
                    color: var(--text);
                    transition: all 0.2s ease;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    text-transform: none;
                    letter-spacing: normal;
                }

                .quick-controls .action-btn:hover:not(:disabled) {
                    background: #f8fafc;
                    border-color: rgba(0, 82, 255, 0.2);
                    color: var(--bright);
                }

                .quick-controls .action-btn.primary {
                    background: var(--support);
                    color: #ffffff;
                    border-color: var(--support);
                    box-shadow: 0 4px 12px rgba(0, 82, 255, 0.15);
                }

                .quick-controls .action-btn.primary:hover:not(:disabled) {
                    background: #0041cc;
                    border-color: #0041cc;
                }

                .quick-controls .action-btn.danger {
                    background: #ef4444;
                    color: #ffffff;
                    border-color: #ef4444;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
                }

                .quick-controls .action-btn.danger:hover:not(:disabled) {
                    background: #dc2626;
                }

                .preview-panel {
                    display: flex;
                    flex-direction: column;
                }

                .preview-title {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 220px;
                    color: var(--muted);
                    font-family: var(--mono);
                    font-size: 11px;
                }

                .preview-title a {
                    color: var(--accent);
                    text-decoration: none;
                    font-weight: 800;
                }

                .preview-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                }

                /* CSS variables for the preview tab pills (dynamic theme support) */
                .preview-tabs {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 3px 4px;
                    border: 1px solid var(--pill-border, rgba(255, 255, 255, 0.06));
                    border-radius: 999px;
                    background: var(--pill-bg, #0a0a0c);
                    box-shadow: var(--pill-shadow, 0 12px 30px rgba(0, 0, 0, 0.25));
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .preview-tabs button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 999px;
                    background: transparent;
                    border: 1px solid transparent;
                    color: var(--pill-text, #71717a);
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    font-size: 11.5px;
                    font-family: var(--sans);
                    font-weight: 500;
                    letter-spacing: -0.01em;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .preview-tabs button:hover:not(:disabled) {
                    color: var(--pill-text-hover, #d4d4d8);
                    background: var(--pill-hover-bg, rgba(255, 255, 255, 0.05));
                }

                .preview-tabs button:disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                }

                .preview-tabs button.active {
                    width: auto;
                    padding: 0 14px;
                    border-color: var(--accent, #3b82f6);
                    background: var(--pill-active-bg, rgba(59, 130, 246, 0.12));
                    color: var(--accent, #3b82f6);
                    box-shadow: 0 2px 12px var(--pill-active-glow, rgba(59, 130, 246, 0.3));
                    font-weight: 600;
                }

                .preview-tabs .tab-separator {
                    color: var(--pill-separator, rgba(255, 255, 255, 0.08));
                    font-size: 10px;
                    pointer-events: none;
                    user-select: none;
                    margin: 0 2px;
                }

                /* Define local scopes for custom variables */
                .sim-lovable-shell, .preview-panel {
                    --pill-bg: #0a0a0c;
                    --pill-border: rgba(255, 255, 255, 0.06);
                    --pill-text: #71717a;
                    --pill-text-hover: #d4d4d8;
                    --pill-separator: rgba(255, 255, 255, 0.08);
                    --pill-hover-bg: rgba(255, 255, 255, 0.05);
                    --pill-active-bg: rgba(59, 130, 246, 0.12);
                    --pill-active-glow: rgba(59, 130, 246, 0.3);
                    --pill-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
                }

                .marketing-theme .preview-tabs {
                    --pill-bg: rgba(15, 23, 42, 0.04);
                    --pill-border: rgba(15, 23, 42, 0.06);
                    --pill-text: #626575;
                    --pill-text-hover: #0b0c10;
                    --pill-separator: rgba(15, 23, 42, 0.08);
                    --pill-hover-bg: rgba(0, 0, 0, 0.03);
                    --pill-active-bg: rgba(0, 82, 255, 0.06);
                    --pill-active-glow: rgba(0, 82, 255, 0.15);
                    --pill-shadow: 0 4px 12px rgba(15, 23, 42, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.6);
                }

                .project-name-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0 14px;
                    height: 32px;
                    border: 1px solid #3b82f6;
                    border-radius: 999px;
                    background: rgba(59, 130, 246, 0.12);
                    color: #3b82f6;
                    font-family: var(--sans);
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    box-shadow: 0 0 16px rgba(59, 130, 246, 0.35);
                }

                .project-name-pill .glow-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #3b82f6;
                    box-shadow: 0 0 8px #3b82f6;
                    animation: pulse-blue 2s infinite ease-in-out;
                }

                @keyframes pulse-blue {
                    0%, 100% { opacity: 0.6; transform: scale(0.9); }
                    50% { opacity: 1; transform: scale(1.1); }
                }

                .status-pills {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.72);
                    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
                    color: var(--bright);
                    font-family: var(--mono);
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    white-space: nowrap;
                }

                .status-pills span {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    color: var(--bright);
                }

                .status-pills strong {
                    color: currentColor;
                    font-weight: 900;
                }

                .status-pills .adoption {
                    color: var(--support);
                }

                .status-pills .friction {
                    color: var(--neutral);
                }

                .status-pills .resistance {
                    color: var(--oppose);
                }

                .preview-content {
                    flex: 1;
                    min-height: 0;
                    display: flex;
                    overflow: hidden;
                    margin: 0 12px 12px;
                    border: 1px solid rgba(0, 82, 255, 0.12);
                    border-radius: 12px;
                    background: var(--bg-darker);
                }

                .agent-list-view {
                    display: flex;
                    flex: 1;
                    min-height: 0;
                    flex-direction: column;
                    background: var(--agent-list-bg, var(--bg-darker));
                    position: relative;
                }

                .empty-detail {
                    flex: 1;
                    display: grid;
                    place-items: center;
                    align-content: center;
                    gap: 8px;
                    color: var(--muted);
                    text-align: center;
                    padding: 32px;
                }

                .empty-detail strong {
                    color: var(--bright);
                    font-size: 18px;
                }

                .empty-detail span {
                    max-width: 320px;
                    font-size: 13px;
                    line-height: 1.5;
                }

                @keyframes thinking-dot {
                    0%,
                    100% {
                        transform: translateY(0);
                        opacity: 0.4;
                    }
                    50% {
                        transform: translateY(-5px);
                        opacity: 1;
                    }
                }

                @keyframes response-shimmer {
                    from {
                        transform: translateX(-120%);
                    }
                    to {
                        transform: translateX(120%);
                    }
                }

                .preview-layout-container {
                    display: flex;
                    flex: 1;
                    min-height: 0;
                    width: 100%;
                    position: relative;
                    overflow: hidden;
                }

                .agent-detail-sidebar-container {
                    width: 0px;
                    opacity: 0;
                    flex-shrink: 0;
                    overflow: hidden;
                    transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
                    border-left: 0px solid transparent;
                    display: flex;
                    flex-direction: column;
                    background: var(--card-bg, #ffffff);
                }

                .agent-detail-sidebar-container.open {
                    width: 320px;
                    opacity: 1;
                    border-left: 1px solid var(--border, rgba(0, 82, 255, 0.12));
                }

                .agent-detail-sidebar-inner {
                    width: 320px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .agent-detail-sidebar-header-tabs {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 16px;
                    border-bottom: 1px solid rgba(0, 82, 255, 0.08);
                    background: rgba(255, 255, 255, 0.5);
                    backdrop-filter: blur(10px);
                }

                .agent-detail-sidebar-header-tabs .tab-btn {
                    height: 28px;
                    padding: 0 12px;
                    border-radius: 6px;
                    border: 1px solid transparent;
                    font-size: 11.5px;
                    font-weight: 700;
                    cursor: pointer;
                    background: transparent;
                    color: var(--muted);
                    font-family: var(--sans);
                    transition: all 0.2s ease;
                }

                .agent-detail-sidebar-header-tabs .tab-btn:hover:not(:disabled) {
                    color: var(--bright);
                    background: rgba(0, 82, 255, 0.04);
                }

                .agent-detail-sidebar-header-tabs .tab-btn.active {
                    color: #0052ff;
                    background: rgba(0, 82, 255, 0.06);
                    border-color: rgba(0, 82, 255, 0.1);
                }

                .agent-detail-sidebar-header-tabs .tab-btn:disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                }

                .agent-detail-sidebar-header-tabs .close-btn {
                    margin-left: auto;
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    border: 0;
                    background: transparent;
                    color: var(--muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    padding: 0;
                }

                .agent-detail-sidebar-header-tabs .close-btn:hover {
                    background: rgba(0, 0, 0, 0.04);
                    color: var(--bright);
                }

                .agent-detail-sidebar-body {
                    flex: 1;
                    overflow-y: auto;
                    min-height: 0;
                }

                .overall-stats-tab-content {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    height: 100%;
                    overflow-y: auto;
                    padding: 16px;
                    box-sizing: border-box;
                }

                .stats-section-block {
                    background: rgba(255, 255, 255, 0.6);
                    border: 1px solid rgba(0, 82, 255, 0.06);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    box-shadow: 0 4px 20px rgba(0, 82, 255, 0.02);
                }

                .stats-section-block h4 {
                    font-size: 11px;
                    font-weight: 800;
                    font-family: var(--mono);
                    color: var(--muted);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin: 0;
                }

                .stats-section-block.log-block {
                    flex: 1;
                    min-height: 320px;
                    padding: 12px 0;
                }

                .stats-section-block.log-block h4 {
                    padding: 0 16px 8px 16px;
                    border-bottom: 1px solid rgba(0, 82, 255, 0.05);
                }

                .empty-tab-state {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    padding: 24px;
                    text-align: center;
                    color: var(--muted);
                    font-size: 12.5px;
                    line-height: 1.6;
                }

                .preview-view-main {
                    flex: 1;
                    min-width: 0;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    position: relative;
                }

                @media (max-width: 980px) {
                    .sim-workbench {
                        grid-template-columns: 1fr;
                    }

                    .conversation-panel {
                        min-height: 320px;
                    }
                }
            `}</style>
        </div>
    );

}

