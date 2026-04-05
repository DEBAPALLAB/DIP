"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Agent, AgentState, SimulationStates, StepSnapshot, LogEntry, Scenario, ScenarioParams } from "./types";
import { supabase } from "./supabase";

// ─── Product Input ──────────────────────────────────────────────────────────────

export interface ProductInput {
    name: string;
    price: string;
    benefits: string[];
    riskLevel: "low" | "medium" | "high";
    valueProp: "weak" | "moderate" | "strong";
    aiParamOverrides?: Partial<ScenarioParams>;
    category: string;
    competitorDensity: "low" | "medium" | "high";
    switchingCost: "low" | "medium" | "high";
    marketingBudget: "low" | "medium" | "high";
    primaryChannel: "social" | "enterprise_sales" | "retail" | "word_of_mouth";
    painPoints: string[];
    regulatoryRisk: "low" | "medium" | "high";
}

// ─── Market Filters ─────────────────────────────────────────────────────────────

export interface MarketFilters {
    ageMin: number;
    ageMax: number;
    incomeMin: number;
    incomeMax: number;
    education: string;
    wrkstat: string;
}

// ─── Adoption Point ─────────────────────────────────────────────────────────────

export interface AdoptionPoint {
    step: number;
    support: number;
    neutral: number;
    oppose: number;
}

// ─── Flow Step ──────────────────────────────────────────────────────────────────

export type FlowStep = "idle" | "configured" | "populated" | "simulating" | "complete";

// ─── Full State ─────────────────────────────────────────────────────────────────

export interface SimulationState {
    product: ProductInput | null;
    marketFilters: MarketFilters;
    agentCount: number;
    agents: Agent[];
    edges: [number, number][];
    scenario: Scenario | null;
    agentStates: SimulationStates;
    step: number;
    adoptionCurve: StepSnapshot[];
    log: LogEntry[];
    insights: string | null;
    flowStep: FlowStep;
    dbSimulationId: string | null;
    previousProduct: ProductInput | null;
    snapshots: { name: string; state: SimulationState }[];
    mainView: "grid" | "network";
    agentHistories: Record<number, any[]>;
    branches: { id: string; name: string; adoption: number; step: number }[];
    activeBranchId: string | null;
    liveTicker: { msg: string; type: "alert" | "info" | "success" }[];
    user: any | null;
}

const DEFAULT_MARKET_FILTERS: MarketFilters = {
    ageMin: 18,
    ageMax: 89,
    incomeMin: 0,
    incomeMax: 100,
    education: "any",
    wrkstat: "any",
};

const INITIAL_STATE: SimulationState = {
    product: null,
    marketFilters: DEFAULT_MARKET_FILTERS,
    agentCount: 50,
    agents: [],
    edges: [],
    scenario: null,
    agentStates: {},
    step: 0,
    adoptionCurve: [],
    log: [],
    insights: null,
    flowStep: "idle",
    user: null,
    dbSimulationId: null,
    previousProduct: null,
    snapshots: [],
    mainView: "network",
    agentHistories: {},
    branches: [],
    activeBranchId: null,
    liveTicker: [],
};

// ─── Context Shape ──────────────────────────────────────────────────────────────

interface SimulationContextValue extends SimulationState {
    setProduct: (p: ProductInput) => void;
    setMarketFilters: (f: MarketFilters) => void;
    setAgentCount: (n: number) => void;
    setMainView: (v: "grid" | "network") => void;
    setAgentHistories: (h: Record<number, any[]>) => void;
    addAgentHistoryPoint: (agentId: number, point: any) => void;
    setAgents: (agents: Agent[]) => void;
    setEdges: (edges: [number, number][]) => void;
    setScenario: (s: Scenario) => void;
    setAgentStates: (states: SimulationStates) => void;
    updateAgentState: (id: number, state: AgentState) => void;
    setStep: (step: number) => void;
    setAdoptionCurve: (curve: StepSnapshot[]) => void;
    addAdoptionPoint: (point: StepSnapshot) => void;
    setLog: (log: LogEntry[]) => void;
    addLogEntry: (entry: LogEntry) => void;
    setInsights: (text: string | null) => void;
    setFlowStep: (fs: FlowStep) => void;
    setDbSimulationId: (id: string | null) => void;
    updateProduct: (p: ProductInput) => void;
    saveSnapshot: (name: string) => void;
    restoreSnapshot: (name: string) => void;
    loadSimulationFromDb: (id: string) => Promise<boolean>;
    resetFlow: () => void;
    setBranches: (b: { id: string; name: string; adoption: number; step: number }[]) => void;
    addBranch: (b: { id: string; name: string; adoption: number; step: number }) => void;
    addTickerMsg: (msg: string, type?: "alert" | "info" | "success") => void;
    clearTicker: () => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

// ─── Storage Key ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "di_simulation_state";

function loadState(): SimulationState {
    if (typeof window === "undefined") return INITIAL_STATE;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return INITIAL_STATE;
        const parsed = JSON.parse(raw);
        return { ...INITIAL_STATE, ...parsed };
    } catch {
        return INITIAL_STATE;
    }
}

function saveState(state: SimulationState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // storage full or unavailable
    }
}

// ─── Provider ───────────────────────────────────────────────────────────────────

export function SimulationProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<SimulationState>(INITIAL_STATE);
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const s = loadState();
        setState(s);
        setHydrated(true);

        // Sync initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setState(prev => ({ ...prev, user: session.user }));
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setState(prev => ({ ...prev, user: session?.user ?? null }));
        });

        return () => subscription.unsubscribe();
    }, []);

    // Persist on every state change (after hydration)
    useEffect(() => {
        if (hydrated) {
            // Don't persist user object to localStorage to keep it fresh
            const { user, ...toSave } = state;
            saveState(toSave as SimulationState);
        }
    }, [state, hydrated]);

    const setProduct = useCallback((p: ProductInput) => {
        setState((s) => ({ ...s, product: p }));
    }, []);

    const setMarketFilters = useCallback((f: MarketFilters) => {
        setState((s) => ({ ...s, marketFilters: f }));
    }, []);

    const setAgentCount = useCallback((n: number) => {
        setState((s) => ({ ...s, agentCount: n }));
    }, []);

    const setAgents = useCallback((agents: Agent[]) => {
        setState((s) => ({ ...s, agents }));
    }, []);

    const setEdges = useCallback((edges: [number, number][]) => {
        setState((s) => ({ ...s, edges }));
    }, []);

    const setScenario = useCallback((scenario: Scenario) => {
        setState((s) => ({ ...s, scenario }));
    }, []);

    const setAgentStates = useCallback((agentStates: SimulationStates) => {
        setState((s) => ({ ...s, agentStates }));
    }, []);

    const updateAgentState = useCallback((id: number, agState: AgentState) => {
        setState((s) => ({
            ...s,
            agentStates: { ...s.agentStates, [id]: agState },
        }));
    }, []);

    const setStep = useCallback((step: number) => {
        setState((s) => ({ ...s, step }));
    }, []);

    const setAdoptionCurve = useCallback((adoptionCurve: StepSnapshot[]) => {
        setState((s) => ({ ...s, adoptionCurve }));
    }, []);

    const addAdoptionPoint = useCallback((point: StepSnapshot) => {
        setState((s) => ({ ...s, adoptionCurve: [...s.adoptionCurve, point] }));
    }, []);

    const setLog = useCallback((log: LogEntry[]) => {
        setState((s) => ({ ...s, log }));
    }, []);

    const addLogEntry = useCallback((entry: LogEntry) => {
        setState((s) => ({ ...s, log: [...s.log, entry] }));
    }, []);

    const setInsights = useCallback((insights: string | null) => {
        setState((s) => ({ ...s, insights }));
    }, []);

    const setFlowStep = useCallback((flowStep: FlowStep) => {
        setState((s) => ({ ...s, flowStep }));
    }, []);

    const setDbSimulationId = useCallback((id: string | null) => {
        setState((s) => ({ ...s, dbSimulationId: id }));
    }, []);

    const updateProduct = useCallback((p: ProductInput) => {
        setState((s) => ({ ...s, previousProduct: s.product, product: p }));
    }, []);

    const setMainView = useCallback((v: "grid" | "network") => {
        setState((s) => ({ ...s, mainView: v }));
    }, []);

    const setAgentHistories = useCallback((h: Record<number, any[]>) => {
        setState((s) => ({ ...s, agentHistories: h }));
    }, []);

    const addAgentHistoryPoint = useCallback((agentId: number, point: any) => {
        setState((s) => ({
            ...s,
            agentHistories: {
                ...(s.agentHistories || {}),
                [agentId]: [...((s.agentHistories?.[agentId]) || []), point]
            }
        }));
    }, []);

    const saveSnapshot = useCallback((name: string) => {
        setState((s) => ({
            ...s,
            snapshots: [...s.snapshots, { name, state: JSON.parse(JSON.stringify(s)) }]
        }));
    }, []);

    const restoreSnapshot = useCallback((name: string) => {
        setState((s) => {
            const found = s.snapshots.find(snap => snap.name === name);
            if (!found) return s;
            return { ...found.state, snapshots: s.snapshots };
        });
    }, []);

    const setBranches = useCallback((branches: { id: string; name: string; adoption: number; step: number }[]) => {
        setState((s) => ({ ...s, branches }));
    }, []);

    const addBranch = useCallback((branch: { id: string; name: string; adoption: number; step: number }) => {
        setState((s) => ({ ...s, branches: [...s.branches, branch] }));
    }, []);

    const addTickerMsg = useCallback((msg: string, type: "alert" | "info" | "success" = "info") => {
        setState((s) => ({
            ...s,
            liveTicker: [{ msg, type }, ...s.liveTicker].slice(0, 50)
        }));
    }, []);

    const clearTicker = useCallback(() => {
        setState((s) => ({ ...s, liveTicker: [] }));
    }, []);

    const loadSimulationFromDb = useCallback(async (id: string) => {
        try {
            const { data: sim, error } = await supabase
                .from('simulations')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !sim) return false;

            const { data: snapshots } = await supabase.from('simulation_snapshots').select('*').eq('simulation_id', id).order('step', { ascending: true });
            const { data: logs } = await supabase.from('simulation_logs').select('*').eq('simulation_id', id).order('timestamp', { ascending: true });

            const configuration = sim.configuration || sim.config || {};
            const results = sim.results || {};
            const agents = sim.agents || configuration.agents || [];
            const agentStates: SimulationStates = {};
            const resultStates = results.states || results.agent_states || {};
            const resultHistory = results.history || results.adoption_curve || [];
            const resultLog = results.log || [];
            const storedAgentHistories = results.agent_histories || {};
            const storedMainView = results.main_view || configuration.mainView || "network";

            if (resultStates && Object.keys(resultStates).length > 0) {
                Object.entries(resultStates).forEach(([idKey, value]: any) => {
                    const agentId = Number(idKey);
                    if (Number.isNaN(agentId)) return;
                    agentStates[agentId] = {
                        decision: value?.decision ?? null,
                        reasoning: value?.reasoning ?? null,
                        step: value?.step ?? null,
                        pending: Boolean(value?.pending),
                        isSeeded: value?.isSeeded,
                        model: value?.model,
                    };
                });
            } else {
                agents.forEach((a: Agent) => {
                    agentStates[a.id] = { decision: "neutral", reasoning: "", step: 0, pending: false };
                });
                if (logs) {
                    logs.forEach(l => {
                        agentStates[l.agent_id] = {
                            decision: l.decision,
                            reasoning: l.reasoning,
                            step: l.step,
                            pending: false
                        };
                    });
                }
            }

            const normalizedHistory = Array.isArray(resultHistory) ? resultHistory : [];
            const normalizedLog = Array.isArray(resultLog) ? resultLog : [];
            const resolvedStep = typeof results.step === "number" ? results.step : (normalizedHistory.length > 0 ? normalizedHistory[normalizedHistory.length - 1].step : (snapshots ? snapshots.length : 0));

            setState(prev => ({
                ...prev,
                product: configuration.product || null,
                marketFilters: configuration.filters || DEFAULT_MARKET_FILTERS,
                agentCount: sim.total_agents || agents.length,
                agents,
                edges: sim.edges || configuration.edges || [],
                scenario: configuration.scenario || null,
                agentStates,
                step: resolvedStep,
                adoptionCurve: normalizedHistory.map((s: any) => ({ ...s })),
                log: normalizedLog.map((l: any) => ({ ...l })),
                insights: results.insights || sim.insights || null,
                flowStep: sim.status === 'Completed' ? 'complete' : (resolvedStep > 0 ? 'populated' : 'configured'),
                dbSimulationId: id,
                previousProduct: null,
                snapshots: [],
                mainView: storedMainView,
                agentHistories: storedAgentHistories,
                branches: sim.branches || [],
                activeBranchId: id,
                liveTicker: []
            }));
            return true;
        } catch (e) {
            console.error("Failed to load simulation from DB:", e);
            return false;
        }
    }, []);

    const resetFlow = useCallback(() => {
        setState(prev => ({ ...INITIAL_STATE, user: prev.user }));
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch { /* ignore */ }
    }, []);

    const value: SimulationContextValue = {
        ...state,
        setProduct,
        setMarketFilters,
        setAgentCount,
        setAgents,
        setEdges,
        setScenario,
        setAgentStates,
        updateAgentState,
        setStep,
        setAdoptionCurve,
        addAdoptionPoint,
        setLog,
        addLogEntry,
        setInsights,
        setFlowStep,
        setDbSimulationId,
        updateProduct,
        setMainView,
        setAgentHistories,
        addAgentHistoryPoint,
        saveSnapshot,
        restoreSnapshot,
        loadSimulationFromDb,
        resetFlow,
        setBranches,
        addBranch,
        addTickerMsg,
        clearTicker
    };

    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    );
}

export function useSimulation(): SimulationContextValue {
    const ctx = useContext(SimulationContext);
    if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
    return ctx;
}
