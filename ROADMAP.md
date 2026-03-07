# Decision Intelligence Platform — Roadmap

This document tracks features and improvements that are planned but not yet in scope.

---

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
