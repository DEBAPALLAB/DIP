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
  lossAversion: number;     // lambda [1, 7]
  statusQuoBias: number;    // 0-1
  priorAdoptions: number;   // 0-10
}

export interface AgentState {
  decision: DecisionType;
  reasoning: string | null;
  step: number | null;
  pending: boolean;
  isSeeded?: boolean;
}

export type SimulationStates = Record<number, AgentState>;

// ─── Per-agent decision history ───────────────────────────────────────────────

export interface AgentHistoryEntry {
  step: number;
  decision: DecisionType;
}

export type AgentHistories = Record<number, AgentHistoryEntry[]>;

// ─── Scenario ──────────────────────────────────────────────────────────────────

export interface ScenarioParams {
  value: number;   // perceived product value
  risk: number;    // product risk level
  loss: number;    // loss aversion trigger
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
  timestamp: number;
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
  reasoning: string;
}

export interface GenerateAgentsRequest {
  scenarioId: string;
}

export interface GenerateAgentsResponse {
  agents: Agent[];
}
