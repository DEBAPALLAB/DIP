"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { SCENARIOS, getScenario } from "@/lib/scenarios";
import { buildSnapshot } from "@/lib/simulation";
import { generateAgents, buildWattsStrogatz } from "@/lib/agentGeneration";

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
import type { Scenario } from "@/lib/types";

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
    const [activePanel, setActivePanel] = useState<"log" | "chart">("chart");
    const [mainView, setMainView] = useState<"grid" | "network">("network");

    // "UNCONFIGURED" -> "CONFIGURED" -> "RUNNING" -> "DONE"
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

    const abortRef = useRef(false);
    const scenario: Scenario = (scenarioId === "custom" && customScenario) ? customScenario : getScenario(scenarioId);

    // ─── localStorage persistence ──────────────────────────────────────────────

    // Restore on mount
    useEffect(() => {
        try {
            const savedCustom = loadSavedCustomScenario();
            if (savedCustom) setCustomScenario(savedCustom);

            const savedAgents = localStorage.getItem("sim_agents");
            if (savedAgents) {
                const parsedAgents: Agent[] = JSON.parse(savedAgents);
                const parsedStates: SimulationStates = JSON.parse(
                    localStorage.getItem("sim_states") || "{}"
                );
                const parsedStep = Number(localStorage.getItem("sim_step") || "0");
                const parsedCurve: StepSnapshot[] = JSON.parse(
                    localStorage.getItem("sim_curve") || "[]"
                );
                const parsedEdges: [number, number][] = JSON.parse(
                    localStorage.getItem("sim_edges") || "[]"
                );
                const parsedHistories: AgentHistories = JSON.parse(
                    localStorage.getItem("sim_histories") || "{}"
                );
                const savedScenarioId = localStorage.getItem("sim_scenario");

                setAgents(parsedAgents);
                setStates(parsedStates);
                setStep(parsedStep);
                setHistory(parsedCurve);
                setEdges(parsedEdges);
                setAgentHistories(parsedHistories);

                if (savedScenarioId) {
                    setScenarioId(savedScenarioId);
                }

                // Determine phase
                if (parsedStep > 0) {
                    setPhase("DONE");
                } else {
                    setPhase("CONFIGURED");
                }
            }
        } catch (e) {
            console.warn("Failed to restore simulation state:", e);
        }
    }, []);

    // Save on changes
    useEffect(() => {
        if (agents.length > 0) {
            try {
                localStorage.setItem("sim_agents", JSON.stringify(agents));
                localStorage.setItem("sim_states", JSON.stringify(states));
                localStorage.setItem("sim_step", String(step));
                localStorage.setItem("sim_curve", JSON.stringify(history));
                localStorage.setItem("sim_scenario", scenarioId);
                localStorage.setItem("sim_edges", JSON.stringify(edges));
                localStorage.setItem("sim_histories", JSON.stringify(agentHistories));
            } catch (e) {
                console.warn("Failed to persist simulation state:", e);
            }
        }
    }, [agents, states, step, history, scenarioId, edges, agentHistories]);

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
            } catch (err) {
                console.error("Failed to generate agents:", err);
                alert("Failed to load GSS agent pool. Check /public/gss_agent_pool.json");
            } finally {
                setIsGenerating(false);
            }
        },
        []
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

    // ─── Full reset (back to config) ───────────────────────────────────────────

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
        localStorage.clear();
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

            // Mark all agents as pending
            for (const agent of agents) {
                newStates[agent.id] = { ...newStates[agent.id], pending: true };
            }
            setStates({ ...newStates });

            const neighborSnapshot = { ...currentStates };
            const batches = chunk(agents, batchSize);

            let doneCount = 0;
            setProgress({ done: 0, total: agents.length });

            for (const batch of batches) {
                if (abortRef.current) break;

                const results = await Promise.allSettled(
                    batch.map(async (agent) => {
                        // Intercept seeded agents on their first decision
                        if (currentStep === 1 && currentStates[agent.id]?.isSeeded) {
                            // Artificial delay so UI doesn't visually snap instantly
                            await new Promise((res) => setTimeout(res, 400));
                            return {
                                agentId: agent.id,
                                decision: "support" as DecisionType,
                                reasoning: "I was engaged directly by the brand as an early partner. I am supporting this product.",
                            } as RunStepResponse;
                        }

                        // Build neighbor IDs from edges
                        const neighborIds = edges
                            .filter(([a, b]) => a === agent.id || b === agent.id)
                            .map(([a, b]) => (a === agent.id ? b : a));

                        const neighborStates: Record<
                            number,
                            { decision: DecisionType; reasoning: string | null }
                        > = Object.fromEntries(
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
                                neighborStates,
                                neighborAgents,
                            }),
                        });

                        if (!res.ok) {
                            const err = await res.text();
                            throw new Error(`Agent ${agent.id} failed: ${err}`);
                        }

                        return (await res.json()) as RunStepResponse;
                    })
                );

                // Apply results
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

                        // Update agent history
                        setAgentHistories((prev) => {
                            const prevHistory = prev[agent.id] ?? [];
                            return {
                                ...prev,
                                [agent.id]: [
                                    ...prevHistory,
                                    { step: currentStep, decision } as AgentHistoryEntry,
                                ],
                            };
                        });

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
                        console.error(result.reason);
                        newStates[agent.id] = { ...newStates[agent.id], pending: false };
                    }

                    doneCount++;
                    setProgress({ done: doneCount, total: agents.length });
                    setStates({ ...newStates });
                }
            }

            const snap = buildSnapshot(currentStep, newStates);
            setHistory((prev) => [...prev, snap]);
            setStep(currentStep + 1);
            setRunning(false);
            setPhase("DONE");
            setProgress(null);

            return newStates;
        },
        [agents, edges, scenarioId]
    );

    // ─── Button handlers ───────────────────────────────────────────────────────

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

    const handleScenarioChange = useCallback(
        (id: string) => {
            setScenarioId(id);
            // Only reset simulation state, keep agents/edges
            if (agents.length > 0) {
                setStates(makeInitialStates(agents));
                setAgentHistories({});
                setHistory([]);
                setLog([]);
                setStep(0);
                setPhase("CONFIGURED");
            }
        },
        [agents]
    );

    // ─── Derived state ─────────────────────────────────────────────────────────

    const selectedAgent =
        selectedAgentId !== null ? agents.find((a) => a.id === selectedAgentId) ?? null : null;
    const selectedState =
        selectedAgentId !== null ? states[selectedAgentId] ?? null : null;
    const selectedHistory =
        selectedAgentId !== null ? agentHistories[selectedAgentId] ?? [] : [];

    const isConfigured = phase !== "UNCONFIGURED";

    const handleApplyCustom = useCallback((scen: Scenario) => {
        setCustomScenario(scen);
        setScenarioId("custom");

        // Only reset simulation state, keep agents/edges
        if (agents.length > 0) {
            setStates(makeInitialStates(agents));
            setAgentHistories({});
            setHistory([]);
            setLog([]);
            setStep(0);
            setPhase("CONFIGURED");
        }
    }, [agents]);

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                overflow: "hidden",
                background: "var(--bg)",
            }}
        >
            {/* ── Top bar ── */}
            <TopBar
                step={step}
                running={running}
                states={states}
                history={history}
                scenarioLabel={scenario.label}
                agentCount={agents.length}
            />


            {/* ── Control bar ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--panel)",
                    flexShrink: 0,
                }}
            >
                {/* Title */}
                <div
                    style={{
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        color: "var(--orange)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        marginRight: 8,
                    }}
                >
                    DIP//v2.0
                </div>

                <ScenarioPicker
                    value={scenarioId}
                    onChange={handleScenarioChange}
                    onCustom={() => setShowCustomForm(true)}
                    disabled={running}
                />

                <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                    {/* Progress indicator */}
                    {progress && (
                        <span
                            style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--orange)" }}
                        >
                            {progress.done}/{progress.total} agents
                        </span>
                    )}

                    {/* Step info */}
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>
                        STEP {step} / ∞
                    </span>

                    {isConfigured && (
                        <>
                            {/* Auto-run */}
                            <button
                                id="btn-autorun"
                                className="btn-ghost"
                                onClick={handleAutoRun}
                                disabled={running}
                                title="Run 3 steps automatically"
                            >
                                ▶▶ AUTO ×3
                            </button>

                            {/* Single step */}
                            <button
                                id="btn-step"
                                className="btn-primary"
                                onClick={handleRunStep}
                                disabled={running}
                            >
                                {running ? (
                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <span className="live-dot" style={{ width: 6, height: 6 }} />
                                        RUNNING
                                    </span>
                                ) : (
                                    `▶ RUN STEP ${step + 1}`
                                )}
                            </button>

                            {/* Reset sim (keep agents) */}
                            <button
                                id="btn-reset"
                                className="btn-ghost"
                                onClick={handleReset}
                                disabled={running}
                                title="Reset simulation (keep population)"
                            >
                                ⟳ RESET
                            </button>
                        </>
                    )}

                    {/* Re-configure (back to config) */}
                    <button
                        id="btn-reconfigure"
                        className="btn-ghost"
                        onClick={handleFullReset}
                        disabled={running}
                        title="Re-configure population"
                    >
                        ◈ CONFIG
                    </button>
                </div>
            </div>

            {/* ── Main content ── */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* ── LEFT: Product brief + Persona breakdown ── */}
                <div
                    style={{
                        width: 220,
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        borderRight: "1px solid var(--border)",
                    }}
                >
                    <div
                        className="panel"
                        style={{
                            flex: "0 0 auto",
                            borderRadius: 0,
                            borderLeft: "none",
                            borderTop: "none",
                            borderRight: "none",
                        }}
                    >
                        <div className="panel-header">
                            <span className="label">PRODUCT</span>
                            <span>{scenario.tag}</span>
                        </div>
                        <ProductBrief scenario={scenario} />
                    </div>

                    <div style={{ borderBottom: "1px solid var(--border)" }} />

                    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div className="panel-header" style={{ borderTop: "none" }}>
                            <span className="label">PERSONAS</span>
                            <span>N={agents.length || "—"}</span>
                        </div>
                        <div style={{ flex: 1, overflowY: "auto" }}>
                            {agents.length > 0 && <PersonaBreakdown agents={agents} states={states} />}
                        </div>
                    </div>
                </div>

                {/* ── CENTER: Config screen OR Agent grid ── */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        borderRight: "1px solid var(--border)",
                    }}
                >
                    {isConfigured && (
                        <div
                            className="panel-header"
                            style={{
                                borderTop: "none",
                                borderLeft: "none",
                                borderRight: "none",
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <span className="label">AGENT POPULATION ({agents.length})</span>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <button
                                    onClick={() => setMainView("network")}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: mainView === "network" ? "var(--orange)" : "var(--muted)",
                                        fontFamily: "var(--mono)",
                                        fontSize: 10,
                                        cursor: "pointer",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    🕸️ Network
                                </button>
                                <span style={{ color: "var(--border)" }}>|</span>
                                <button
                                    onClick={() => setMainView("grid")}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: mainView === "grid" ? "var(--orange)" : "var(--muted)",
                                        fontFamily: "var(--mono)",
                                        fontSize: 10,
                                        cursor: "pointer",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    𝌆 Grid
                                </button>
                            </div>
                        </div>
                    )}

                    {!isConfigured ? (
                        <ConfigScreen onGenerate={handleGenerate} isGenerating={isGenerating} />
                    ) : mainView === "grid" ? (
                        <AgentGrid
                            agents={agents}
                            states={states}
                            selectedId={selectedAgentId}
                            onSelect={setSelectedAgentId}
                        />
                    ) : (
                        <GlobalNetworkGraph
                            agents={agents}
                            edges={edges}
                            states={states}
                            selectedId={selectedAgentId}
                            onSelect={setSelectedAgentId}
                        />
                    )}
                </div>

                {/* ── RIGHT: Detail + Charts + Log ── */}
                <div
                    style={{
                        width: 340,
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    {/* Agent detail (top half) */}
                    <div
                        style={{
                            flex: "0 0 auto",
                            height: 420,
                            borderBottom: "1px solid var(--border)",
                            overflow: "hidden",
                        }}
                    >
                        {selectedAgent && selectedState ? (
                            <AgentDetail
                                agent={selectedAgent}
                                state={selectedState}
                                allStates={states}
                                agents={agents}
                                edges={edges}
                                agentHistory={selectedHistory}
                                onSelectAgent={setSelectedAgentId}
                                isConfigPhase={phase === "CONFIGURED"}
                                onToggleSeed={handleToggleSeed}
                            />
                        ) : (
                            <div
                                style={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--muted)",
                                    fontFamily: "var(--mono)",
                                    fontSize: 10,
                                    gap: 6,
                                    padding: 16,
                                    textAlign: "center",
                                }}
                            >
                                <div style={{ fontSize: 24, opacity: 0.3, marginBottom: 4 }}>◈</div>
                                <div>SELECT AN AGENT</div>
                                <div style={{ fontSize: 9, color: "#2a3a4a", lineHeight: 1.6 }}>
                                    {isConfigured
                                        ? "Click any agent card to view their profile, ego network, reasoning, and decision history."
                                        : "Generate a population first, then select an agent."}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tab bar */}
                    <div
                        style={{
                            display: "flex",
                            borderBottom: "1px solid var(--border)",
                            background: "var(--panel)",
                            flexShrink: 0,
                        }}
                    >
                        {(["chart", "log"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActivePanel(tab)}
                                style={{
                                    flex: 1,
                                    padding: "6px 0",
                                    background: "none",
                                    border: "none",
                                    borderBottom:
                                        activePanel === tab
                                            ? "2px solid var(--orange)"
                                            : "2px solid transparent",
                                    fontFamily: "var(--mono)",
                                    fontSize: 9,
                                    color:
                                        activePanel === tab ? "var(--orange)" : "var(--muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                    cursor: "pointer",
                                    transition: "color 0.15s",
                                }}
                            >
                                {tab === "chart" ? "ADOPTION CURVE" : "DECISION LOG"}
                            </button>
                        ))}
                    </div>

                    {/* Chart or Log */}
                    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        {activePanel === "chart" ? (
                            <div style={{ flex: 1, padding: "8px 4px 4px 0" }}>
                                <AdoptionChart history={history} total={agents.length} />
                            </div>
                        ) : (
                            <div style={{ flex: 1, overflow: "hidden" }}>
                                <StepLog entries={log} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showCustomForm && (
                <CustomScenarioForm
                    existing={customScenario}
                    onApply={handleApplyCustom}
                    onClose={() => setShowCustomForm(false)}
                />
            )}
        </div>
    );
}
