// ─── Core Types ────────────────────────────────────────────────────────────────

export type DecisionType = "support" | "neutral" | "oppose" | null;

export type PersonaType =
  | "Influencer"
  | "Early Adopter"
  | "Price Hawk"
  | "Pragmatist"
  | "Social Follower"
  | "Herd Member"
  | "Skeptic"
  | "Laggard";

export interface Agent {
  id: number;
  name: string;
  persona: PersonaType;
  age: number;
  risk: number;           // risk_aversion 0-1
  trust: number;          // institutional_trust 0-1
  social: number;         // social_conformity 0-1
  collectivism: number;   // collectivism 0-1
  budget: number;         // budget_sensitivity 0-1
  emotional: number;      // emotional_state 0-1
  income: number;         // income_percentile 0-1
  educ: number;           // education_years
  sex: "male" | "female";
  wrkstat: string;
  influence_score: number;
  job: string;
  color: string;
  // Psychological traits from simulation_v3.py
  lossAversion?: number;     // lambda [1, 7]
  statusQuoBias?: number;    // 0-1
  priorAdoptions?: number;   // 0-10
}

export interface AgentState {
  decision: DecisionType;
  reasoning: string | null;
  step: number | null;
  pending: boolean;
  isSeeded?: boolean;
  model?: string;
  conviction?: number; // [0,1] decisiveness of this decision; low = flip/churn candidate
  signalQuality?: number; // Tier 2F: [0,1] fidelity of the value signal that reached this agent (1 = direct/pristine)
  // ─── Live user interventions ───
  // Set by direct manipulation of the running network. Read by the step loop.
  muted?: boolean;          // silenced: forced neutral, exerts no outward influence
  influenceMult?: number;   // per-agent influence multiplier (1 = default, >1 amplified)
  locked?: boolean;         // user-forced decision that the engine should not overwrite
  removed?: boolean;        // pulled out of the network entirely
}

export type SimulationStates = Record<number, AgentState>;

// ─── Live interventions the user can apply to an agent in the running network ───
export type Intervention = "convert" | "silence" | "amplify" | "remove" | "reset";

// ─── Per-agent decision history ───────────────────────────────────────────────

export interface AgentHistoryEntry {
  step: number;
  decision: DecisionType;
  reasoning?: string;
}

export type AgentHistories = Record<number, AgentHistoryEntry[]>;

// ─── Scenario ──────────────────────────────────────────────────────────────────

export interface ScenarioParams {
  value: number;   // perceived product value
  risk: number;    // product risk level
  loss: number;    // loss aversion trigger
  justification?: string; // AI-driven strategic reasoning
  competitor?: CompetitorParams; // Tier 1C: incumbent the agent must switch away from (optional)
}

// ─── Competitive Baseline (Tier 1C) ─────────────────────────────────────────────
// When present, adoption is modeled as *switching* from an incumbent rather than
// buying in a vacuum: utility becomes U(new) − U(incumbent) − switching_cost.
// Absent → pure greenfield adoption (identical to pre-1C behavior).
export interface CompetitorParams {
  value: number;         // incumbent's perceived value [0,1] — what the agent gives up by switching
  switchingCost: number; // migration friction [0,1]: 0 = frictionless, 1 = heavy lock-in
  label?: string;        // human-readable name of the incumbent (for the brief/prompt)
}

export interface Scenario {
  id: string;
  label: string;
  tag: string;
  brief: string;
  params: ScenarioParams;
}

// ─── Simulation History ────────────────────────────────────────────────────────

export interface StepSnapshot {
  step: number;
  support: number;
  neutral: number;
  oppose: number;
  pending: number;
  unaware: number;
  timestamp: number;
}

export interface BranchSummary {
  id: string;
  name: string;
  adoption: number;
  step: number;
  simulationId?: string;
  parentId?: string | null;
  createdAt?: string;
}

export interface LogEntry {
  step: number;
  agentId: number;
  agentName: string;
  persona: PersonaType;
  decision: DecisionType;
  reasoning: string;
  timestamp: number;
}

// ─── API Payloads ──────────────────────────────────────────────────────────────

export interface RunStepRequest {
  agentId: number;
  agent: Agent;            // full agent object for dynamic resolution
  scenarioId: string;
  customScenario?: Scenario; // passed when scenarioId is 'custom' or 'custom-product'
  previousParams?: ScenarioParams; // for delta calculation
  neighborStates: Record<number, { decision: DecisionType; reasoning: string | null }>;
  neighborAgents: Agent[]; // neighbor agent objects for prompt building
}

export interface RunStepResponse {
  agentId: number;
  decision: DecisionType;
  reasoning: string | null;
  model?: string;
  conviction?: number; // [0,1] decisiveness of this decision; low = flip/churn candidate
}

export interface RunBatchItem {
  agentId: number;
  agent: Agent;
  neighborStates: Record<number, { decision: DecisionType; reasoning: string | null }>;
  neighborAgents: Agent[];
  isAware: boolean; // Tier 1B: awareness funnel gate — false means not yet exposed to the scenario
  signalQuality?: number; // Tier 2F: [0,1] fidelity of the value signal that reached this agent (1 = pristine/direct)
}

export interface RunStepBatchRequest {
  batch: RunBatchItem[];
  scenarioId: string;
  customScenario?: Scenario;
  previousParams?: ScenarioParams;
}

export interface RunStepBatchResponse {
  results: RunStepResponse[];
}

export interface GenerateAgentsRequest {
  scenarioId: string;
}

export interface GenerateAgentsResponse {
  agents: Agent[];
}
