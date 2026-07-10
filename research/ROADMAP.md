# Decision Intelligence Platform — Roadmap

This document tracks features ranked by launch priority and execution status.

> **Last Updated:** July 10, 2026 | **Current Phase:** Tier 1B (Awareness Funnel) | **Score Trajectory:** 54 → 60 (July 7) → **66 (target: Jul 21)**

---

## Phase 1 Features (In Progress — Tier 1)

### 1A. Conviction Scoring + Reversible Decisions ✅ DONE (July 7, 2026)
- **Status:** LIVE on results page (app/results/page.tsx)
- **Features:** Retention Risk % stat, conviction margin (distance from threshold), churn candidates flagged (conviction < 0.3)
- **Impact:** Enables "dynamic adoption" instead of one-shot ratchet; agents re-evaluate each step
- **Known gap:** tanh compression biases conviction low; < 0.3 cutoff needs distribution-based recalibration

### 1B. Awareness Funnel (Staged Information Exposure) ⏳ HIGHEST PRIORITY
- **Scope:** Staged agent exposure (Influencers step 1 → Early Adopters step 2–4 → mass market step 5+)
- **Produces:** Real S-curves from network topology, NOT parameter tuning; cascade animation (the "GIF" for post #6)
- **Effort:** ~3 days
- **Impact:** Score 60 → 66
- **Files to modify:** `app/api/run-step/route.ts` (awareness diffusion logic), new component for cascade visualizer
- **Why first:** Most visually dramatic feature; feeds highest-value LinkedIn post; enables credible demo

### 1C. Competitive Baseline (Switching, Not Buying) ⏳ PLANNED (Week of Jul 21)
- **Scope:** Add status-quo scenario; utility = U(new) − U(current) − switching_cost
- **Effort:** ~1 day
- **Impact:** Score 66 → 71
- **Why this order:** Requires awareness funnel insight first (market dynamics only meaningful with staged exposure)

---

## Phase 2 Features (Calibration & Proof — Tier 2)

### 2D. Multi-Product Calibration Anchor System ⏳ ONGOING
- **Scope:** Backtest 2–3 more products; publish average curve fit (targeting 85–90%)
- **Current:** Quibi done (97.1% fit). Cases #2–#3 queued (`scripts/ghost-cases/`)
- **Effort:** ~1 week per case (research + tuning)
- **Why it matters:** One case is a signal; three cases compound credibility for waitlist

### 2E. Structured Objection Extraction ⏳ PLANNED
- **Scope:** Direct readout of which utility params + network signals drove "oppose" decisions, grouped by persona
- **Output:** "Your barrier is Price Hawk resistance (param X) amplified by hub centrality" — zero focus-group equivalent
- **Effort:** ~3 days

### 2F. Information Degradation Over Hops ⏳ PLANNED
- **Scope:** Value perception decays across word-of-mouth hops (A→B→C signal fades)
- **Produces:** Realistic late-majority adoption flattening
- **Effort:** ~2 days

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
