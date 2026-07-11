# Decision Intelligence Platform — Roadmap

This document tracks features ranked by launch priority and execution status.

> **Last Updated:** July 11, 2026 | **Current Phase:** Phases 1 & 2 complete (Tier 1A–1C + 2D–2F shipped) → Phase 3 (Platform Plays) next | **Score Trajectory:** 54 → 60 (Jul 7) → 66 (1B) → 71 (1C) → **~80 (Phase 2: calibration anchors 92.1% avg, objection map, info decay)**
>
> **Calibration headline:** 3 ghost-case anchors, **92.1% average curve fit** (Quibi 98.1%, Glass 97.7%, Slack 80.4%). See `scripts/ghost-cases/calibration.summary.json`.

---

## Phase 1 Features (In Progress — Tier 1)

### 1A. Conviction Scoring + Reversible Decisions ✅ DONE (July 7, 2026)
- **Status:** LIVE on results page (app/results/page.tsx)
- **Features:** Retention Risk % stat, conviction margin (distance from threshold), churn candidates flagged (conviction < 0.3)
- **Impact:** Enables "dynamic adoption" instead of one-shot ratchet; agents re-evaluate each step
- **Known gap:** tanh compression biases conviction low; < 0.3 cutoff needs distribution-based recalibration

### 1B. Awareness Funnel (Staged Information Exposure) ✅ DONE (July 11, 2026)
- **Scope:** Staged agent exposure — top 15% by influence_score aware at step 0 (influencers/press wave), then word-of-mouth cascade (an agent becomes aware once ≥34% of its neighbors are aware), with a mass-market awareness floor at step 4.
- **Produces:** Real S-curves from Watts-Strogatz topology, NOT parameter tuning. Verified cascade: 15% → 22% → 29% → 36% → 100% awareness with adoption tracking the wave.
- **Impact:** Score 60 → 66
- **Implementation:** `computeAwareness()` in `lib/agentGeneration.ts`; awareness gate in `calculateDecision` (`lib/prompts.ts`, `isAware` param → unaware agents return `decision: null`); `app/api/run-step/route.ts` skips the LLM for unaware agents (token savings); `app/simulate/page.tsx` computes the awareness set per step; unaware cascade visual in `AgentCard` (dimmed/greyscale + `UNAWARE` badge) and a stacked `unaware` band in `AdoptionChart`.

### 1C. Competitive Baseline (Switching, Not Buying) ✅ DONE (July 11, 2026)
- **Scope:** Optional incumbent per scenario; utility becomes U(new) − U(incumbent opportunity cost) − switching_friction. Switching cost is modeled as a barrier to *adoption* (would-be adopters become neutral non-switchers) rather than a source of active opposition — a content incumbent user is a non-adopter, not an enemy. Genuine opposition still comes only from the product's own risk/loss math.
- **Impact:** Score 66 → 71
- **Implementation:** `CompetitorParams` on `ScenarioParams` (`lib/types.ts`); switching-cost term + stance clamp in `calculateDecision` (`lib/prompts.ts`); Meridian AI Suite scenario given a legacy-stack incumbent (`lib/scenarios.ts`); `deriveSimParams` now wires the setup form's previously-unused `competitorDensity`/`switchingCost` signals into the model (`lib/productParams.ts`); switching consideration surfaced in the narrative prompt.
- **Verified:** identical product adopts ~78% less under a heavy switching cost (33/120 → 8/120 in workflow test); greenfield path byte-identical (`switchingPenalty === 0` with no competitor).

---

## Phase 2 Features (Calibration & Proof — Tier 2)

### 2D. Multi-Product Calibration Anchor System ✅ DONE (July 11, 2026)
- **Scope:** Backtest 3 products spanning failure modes; publish average curve fit.
- **Result — average fit 92.1%** across the anchor set (`scripts/ghost-cases/`, `calibration.summary.json`):
  | Product | Type | Curve fit |
  |---|---|---|
  | Quibi | Flop (low value) | 98.1% |
  | Google Glass | Flop (social/risk) | 97.7% |
  | Slack | Success (rising S-curve) | 80.4% |
- **Honest limitation (documented, not hidden):** decline-shaped cases calibrate ~98%; the rising viral S-curve (Slack) fits lower (~80%) because the engine models launch-spike + awareness-floor recovery but **not yet smooth viral acceleration** (adoption begetting adoption faster than awareness spreads). This is the next diffusion improvement — surfacing it *is* the credibility.
- **Reusable harness:** `calibrate()` / `reportCase()` in `runner.ts`; each case is a ~30-line file; `summary.ts` aggregates.

### 2E. Structured Objection Extraction ✅ DONE (July 11, 2026)
- **Scope:** Deterministic readout of *why* the market resisted — a direct decomposition of the decision math (not LLM guessing). For each non-adopter, the dominant negative utility term is identified, ranked by influence-weighted impact, and grouped by persona + network position.
- **Output (real):** *"Top barrier: Switching Cost (69 of 110 non-adopters), concentrated in Early Adopters. Loss Aversion blocks 35 Skeptics — amplified because 6 are network hubs."* Zero focus-group equivalent.
- **Implementation:** `UtilityComponents`/`DecisionResult` from `calculateDecision` (`lib/prompts.ts`); `extractObjections()` in `lib/objections.ts`; `/api/objection-map` endpoint. Excludes user-overridden (muted/locked/removed) agents so the readout reflects organic resistance. UI panel owned by frontend work.

### 2F. Information Degradation Over Hops ✅ DONE (July 11, 2026)
- **Scope:** Perceived value fades across word-of-mouth hops — each hop multiplies the signal by a decay factor scaled by messenger trust, so agents reached late/deep in the network perceive a diluted value proposition. Risk/loss travel intact (bad news doesn't fade). Produces realistic late-majority undervaluation.
- **Implementation:** `computeAwarenessQuality()` in `lib/agentGeneration.ts` (stateful per-agent `[0,1]` signal quality inherited across steps); `signalQuality` param scales perceived value in `calculateDecision`; threaded through the run-step API, client loop (persisted on `AgentState`), and ghost-case runner.
- **Verified:** Quibi calibration held at 97.5–98.1% with degradation on — the low-value product's collapse is if anything more realistic.

---

## Phase 3 Features (Platform Plays — Tier 3)

### 3G. Adversarial Agent Layer ⏳ POST-WAITLIST
- **Scope:** ~5% Claude-driven agents that generate genuine novel objections spread through network
- **Answers:** "AI slop" critique (current LLM reasoning is post-hoc rationalization)
- **Effort:** High (biggest "wow" factor)

### 3H. Real-World Signal Ingestion ⏳ POST-WAITLIST
- **Scope:** Paste competitor reviews / Reddit / pricing pages → LLM extracts trait priors
- **Benefit:** Params from evidence, not vibes
- **Effort:** Moderate

### 3I. Temporal Scenario Arcs ⏳ POST-WAITLIST
- **Scope:** Model launch as sequence of quarters (Q1 limited awareness → Q2 press → Q3 competitor enters)
- **Same population evolves through multiple scenarios**
- **Effort:** High (requires new state model)

---

## Quick Reference — Legacy Roadmap Items

### Earlier Planned (Pre-Tier-1)

## 1. Custom Scenario Input

Allow users to describe their own product and configure value/risk/loss parameters via a structured form, rather than being limited to the 3 preset scenarios (`EV Subscription`, `AI Health Monitor`, `Smart Home Bundle`).

**Scope:** New UI panel with product name, brief description, and 3 sliders for scenario params. Saves to localStorage.

---

## 2. Export / Report

Download the simulation output in portable formats:
- **CSV export** of the step log (agent ID, name, persona, step, decision, reasoning, timestamp)
- **PDF summary** of the entire run: adoption rate at each step, persona breakdown chart, key quotes from agents

**Scope:** Add an export button in the control bar that triggers download via `Blob` + `URL.createObjectURL`.

---

## 3. Scenario Comparison

Run the same population against two different scenarios simultaneously. Show side-by-side adoption curves and persona-level differences.

**Scope:** Fork the simulation state into two parallel runs; render a split adoption chart using different line colors.

---

## 4. Seeded Agents (Influencer Seeding)

Manually pin certain agents to `support` at step 0, to model influencer or seed-user campaigns. Users can select specific agents to pre-seed.

**Scope:** Add a "seed" toggle in the agent grid. Pre-seeded agents skip the LLM call in step 1.

---

## 5. FastAPI Backend

Replace the Next.js API routes with a Python backend that can:
- Run the full mathematical simulation from `simulation_v4.py` for all 200 agents without LLM calls (for rapid previewing)
- Run LLM agents asynchronously with proper rate limiting
- Store simulation history server-side for replay

**Scope:** Separate FastAPI service, Docker Compose setup, update frontend to point to new endpoints.

---

## 6. Authentication

Multi-user support with saved simulation history, named runs, and replay capability.

**Scope:** Next.js Auth.js integration, PostgreSQL for simulation storage, user dashboard.

---

## 7. Real Adoption Validation

Compare simulation output against historical real-world adoption data (e.g., EV adoption curves from the IEA, smartphone diffusion data from GSMA) to validate the GSS-based behavioral model.

**Scope:** Import IEA EV adoption CSV, overlay on Recharts adoption chart, compute RMSE vs. simulation curve.
