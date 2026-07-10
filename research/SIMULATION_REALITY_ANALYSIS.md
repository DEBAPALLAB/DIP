# Simulation Reality Analysis
## A Brutally Honest Product Audit

*Last updated: June 2026*

---

## Part 1: The Technical Reality Score

### What the simulation actually does well

The core architecture is not a toy. Before tearing it apart, this is worth acknowledging:

- **Prospect Theory math is correct.** Tversky-Kahneman lambda, tanh utility projection, trust-adjusted value, shock bonus — the formula is coherent and grounded in peer-reviewed behavioral economics.
- **GSS 2024 respondent pool.** Agents are sampled from real survey data. Demographics aren't invented — age, income, education, and employment status distributions reflect actual American population structure.
- **Watts-Strogatz small-world network.** The right topology for human social diffusion. Real social networks have high clustering and short path lengths, which is exactly what W-S produces. This is a legitimate modeling choice.
- **Degree centrality → influence score.** Hub agents carry more weight in the social signal. This is how real information diffusion works.
- **Multi-step cascade dynamics.** Decisions propagate across neighbors across ticks, enabling emergent diffusion curves. The S-curve shape that sometimes appears is not forced — it emerges from the network structure.

### Reality Score: 54 / 100

| Dimension | Score | What's missing |
|---|---|---|
| Behavioral math | 78/100 | ~~Two divergent utility functions exist (`simulation.ts` vs `prompts.ts`).~~ ✅ Resolved July 7, 2026 — dead `computeUtility` deleted; `calculateDecision` is now the single source of truth. |
| Agent heterogeneity | 72/100 | 8 dimensions, 8 personas, GSS-grounded. Good. But all agents receive the same scenario simultaneously with full information. |
| Social network | 60/100 | Right topology, wrong influence model. Degree centrality only. No directional influence, no weak ties for bridging, static network. |
| Decision realism | 45/100 | No habit/inertia at category level, no brand trust separate from institutional trust, no reference price anchoring, no temporal discounting. |
| Market dynamics | 30/100 | One product. No competition. No substitutes. No platform effects. No churn. No external events. |
| Scenario encoding | 40/100 | Three scalars (value, risk, loss) collapse all product complexity. B2B SaaS and consumer health insurance have fundamentally different purchase dynamics that can't be expressed in the same param space. |
| Output interpretability | 65/100 | Persona breakdown and curve are good. But insights are LLM-generated from aggregates, not derived from the simulation's causal structure. You can't tell which network event caused a plateau. |

### The three biggest context losses

**1. LLM reasoning is cosmetic, not causal.**
Every decision is made deterministically in `calculateDecision()`. The LLM is then told "you decided X, now explain why." The reasoning is post-hoc rationalization. It can never contradict the math, and the math can never learn from the reasoning. There's no persuasion layer — you can't test "what if we changed the framing" without changing the scalar params, which changes the math, not just the narrative.

**2. Simultaneous full-information reveal.**
All agents see the complete scenario brief on step 1. Real adoption starts with zero awareness and builds. Influencers hear first. Mass market hears last. Word-of-mouth carries distorted, incomplete information. Your simulation skips the entire awareness-consideration funnel and starts everyone at the decision stage simultaneously. This is why your curves converge fast — everyone starts informed.

**3. Decisions are permanent.** — ✅ *partially addressed July 7, 2026*
Once an agent decides "support" or "oppose," they never reconsider. There's no trial, evaluation, retention, churn, or re-adoption. A "support" on step 2 is treated identically to a "support" on step 8. Real adoption is leaky — early supporters churn, late skeptics convert, conviction varies. Your current model produces a ratchet, not a market.
> *Correction/update:* on closer inspection the live loop already re-decides every agent each step (decisions were never actually locked). What was missing was a *measure* of decision stability, now shipped as **conviction scoring** (Tier 1A) + a **Retention Risk** readout. Explicit trial→churn→re-adoption state transitions remain future work.

---

## Part 2: The Hard Product Questions

### "Why not just ask 10 real people?"

This is the most honest challenge to the entire premise, and it needs to be taken seriously rather than deflected.

**The case for 10 real people:**
- They have actual money, actual context, actual frustration with the status quo
- Their objections are specific and novel — things you wouldn't have thought to parameterize
- They can tell you *why* in ways that change your thinking, not just confirm your priors
- Zero setup cost, results in an afternoon, costs coffee money
- The feedback is real signal, not a model of signal

**The case against 10 real people (where simulation wins):**
- You can't run 10 people through 47 scenario variants in a day
- 10 people can't tell you what happens when 50,000 people interact with each other across a social network over time — that's not a survey question
- 10 people reflect your sampling bias (who you know, who said yes, who's being polite)
- 10 people can't simulate a price change in real-time and tell you the cascade effect
- You can't freeze a 10-person group at step 3, branch them into two realities, and compare

**The honest answer:**
For "does this idea have any traction at all" — ask 10 real people. Always. Simulation can't replace that and shouldn't try.

For "given that people are interested, how does adoption spread through a real social network under different pricing/positioning scenarios" — simulation is the only tool that scales. No amount of user interviews tells you what happens when a Price Hawk who opposes your product is a hub node connected to 8 Social Followers.

**The product positioning problem:**
Right now the tool positions itself as a validation tool ("will people buy this?"). That's the exact question 10 real people answer better. The actual moat is in *dynamics* — cascade modeling, segmented resistance mapping, scenario branching across a population. That use case has no human-interview equivalent.

---

### "Isn't the GSS data too small and possibly outdated?"

Yes, and this is a serious problem that needs to be confronted directly.

**What the GSS actually is:**
The General Social Survey runs annually with roughly 1,500–3,500 respondents. It covers the US adult population with rigorous stratified sampling. It measures attitudes, values, and behaviors — not purchase decisions or product adoption. The variables being mapped to simulation traits (risk_aversion, institutional_trust, social_conformity) are *proxies* derived from conceptually adjacent GSS items, not direct measurements.

**The staleness problem:**
- GSS 2024 data reflects pre-election, mid-inflation-cycle American attitudes
- Institutional trust collapsed significantly post-2020 and continues to shift
- Remote work (which changed risk tolerance, social conformity, income distribution, and tech adoption patterns) is still settling
- AI-native attitudes (trust in algorithmic systems, comfort with automation) are not in the GSS at all — this variable is arguably the most important for most products being tested on this platform, and it's a ghost

**The relevance problem:**
GSS captures attitudes *in general*. It does not capture:
- Category-specific risk tolerance (someone who's risk-averse about financial products might be an early adopter for health tech)
- Situational context (the same person has different risk profiles at work vs. at home)
- Product-aware priors (does the respondent already use a competitor?)
- The technology adoption curve the product is in (early market vs. mainstream vs. late market)

**The sample size problem:**
1,500–3,500 respondents mapping to potentially 500+ agent simulations means heavy synthetic augmentation. The synthesis (`synthesizeRespondent` in agentGeneration.ts) adds ±16% jitter on each trait — which is fine for diversity, but also means the agents in any given run are only ~30–40% actual GSS data by derivation. The rest is interpolated noise from a real base.

**What this means practically:**
The demographic scaffolding (age, income, education distributions) is reliable. The psychological traits (risk aversion, institutional trust) are plausible proxies, not measurements. The scenario-specific relevance of those traits to your specific product category is an assumption, not a derivation. When the model says "62% adoption," that number has no statistical error bars and no validation anchor.

---

## Part 3: What Would Make This Real

### The actual moat: things simulation can do that nothing else can

If this product is going to be worth using over just talking to people, it needs to own the problems where simulation is genuinely irreplaceable:

**1. Network cascade prediction**
"If your 3 most influential opponents in this market were converted, what happens to total adoption?" No interview can answer this. Simulation can, if the network model is trusted.

**2. Intervention targeting**
"Which 5 agents, if seeded, produce the fastest path to 50% adoption?" This is an optimization problem. You can run 1,000 seeding strategies across the same population in parallel. That's not possible with real people.

**3. Fragility analysis**
"How much does adoption change if we raise price by $10/month, reduce the loss trigger by 20%, and the economy goes into a mild recession?" Scenario branching across continuous parameter space. No focus group handles this.

**4. Segmented resistance mapping**
"The 38% who oppose — what's their actual objection structure? Is it price, risk, distrust, or peer influence?" The simulation knows, because the math is transparent. Each agent has a computed reason for their decision.

---

### The upgrade roadmap (ranked by impact-to-effort)

#### Tier 1 — Do these or the tool stays a toy

**A. Reversible decisions with conviction scoring** — ✅ **DONE (July 7, 2026)**
Remove the "already decided" guard. Add a `conviction: number` per agent = distance of utility from threshold. Low conviction = flip candidate. High conviction = sticky. Show "retention risk" in results (% of supporters with conviction < 0.3). This single change makes the simulation dynamic instead of a one-shot ratchet.
> *As-built correction:* the audit above assumed decisions were permanent, but the live client loop (`runStep`) already re-evaluates every agent each step — there was no "already decided" guard to remove. `conviction` shipped as a normalized [0,1] margin (how far `|stance|` clears the neutral band), and a **Retention Risk** stat is live on the results page. Open item: `tanh(utility)` compresses conviction toward the low end, so the fixed `< 0.3` cutoff needs recalibration (or a relative bottom-tercile rule) against real run distributions.

**B. Awareness funnel (staged information exposure)**
Don't expose all agents to the full brief on step 1. Model a diffusion of awareness:
- Step 1: seeded agents + Influencers + Early Adopters only
- Steps 2–4: their neighbors receive a "heard about this from [peer]" signal, not the full brief
- Steps 5+: mass market exposure via a controllable "reach" parameter
This produces S-curves from first principles, not from parameter tuning.

**C. Competitive baseline**
The utility function currently asks "is this product worth anything?" It should ask "is this product worth switching from what I have?" Add a `baseline` scenario representing the status quo. `utility = U(new) - U(current) - switching_cost`. This is how every real purchase decision works.

#### Tier 2 — These separate it from everything else

**D. Calibration anchor system**
For the tool to be credible, it needs at least one validated simulation. Find a product with published adoption data — Slack's 0→100k teams timeline, Zoom's COVID adoption curve, any documented case study. Tune the params to match. Publish the calibration. This one thing converts "interesting toy" into "methodology with external validity."

**E. Structured objection extraction**
After each simulation run, extract the top 5 reasons agents opposed, grouped by persona. This is not LLM-generated insight on top of aggregates — it's direct readout of which parameters drove `oppose` decisions and which social signals amplified them. A "Your main barrier is Price Hawk resistance to the $89/seat anchor, and it's amplified because your Price Hawks are network hubs" finding has zero equivalent in a focus group.

**F. Information degradation over hops**
When agent A tells agent B about the product through the social network, B's perceived `value` = `A's perceived value × (0.7 + 0.3 × trust[A→B])`. Information degrades and distorts across hops. This produces realistic late-majority undervaluation — exactly why mass-market adoption curves flatten.

#### Tier 3 — These make it a platform, not a tool

**G. Adversarial agent layer**
A small subset of agents (~5%) driven by Claude with full reasoning: they read the actual scenario brief and generate genuine novel objections the utility math would never surface. These get fed as high-weight oppose votes into neighboring agents. This bridges the "AI slop" problem — the LLM is now generating arguments, not rationalizations, and those arguments spread through the network.

**H. Real-world signal ingestion**
The `auto-params` endpoint currently uses LLM intuition to set `value/risk/loss`. Better: users paste competitor reviews, App Store comments, Reddit threads, pricing pages — LLM extracts trait priors from real market signals. Params derived from evidence rather than from model vibes.

**I. Temporal scenario arcs**
A product launch isn't a single scenario — it's a sequence. Model quarters: Q1 (limited awareness, early pricing), Q2 (press coverage, price stabilizes), Q3 (competitor enters, value perception shifts). Each quarter is a scenario with different params. The same agent population runs through all of them. This produces something no focus group can: a narrative arc of how a market evolves.

---

## Part 4: The Honest Positioning

### What this tool is right now

A behavioral economics simulation sandbox that produces internally consistent diffusion curves and persona-level breakdowns for a given set of scalar scenario parameters, running on a GSS-proxied synthetic population. It's intellectually serious, technically coherent, and visually polished.

What it isn't: validated, calibrated, or able to produce findings you'd stake a business decision on without triangulating against real user research.

### What it could be in 6 months

The only product in the market that runs parameterized social-network cascade simulations on behaviorally grounded synthetic populations, with competitive displacement modeling and calibrated external validity. That use case — "I know people want this, now show me how adoption spreads under 12 different launch strategies across a realistic social network" — has no equivalent tool, paid or free.

The gap between now and that is not architectural. The math is mostly there. The gap is:
1. ✅ ~~Conviction scoring + reversible decisions (2 days of engineering)~~ — done July 7, 2026
2. Awareness funnel (3 days)
3. Competitive baseline utility (1 day)
4. One calibration anchor (research + 1 week of parameter tuning)

Everything else is polish on top of a validated foundation.

### The real risk

The real risk isn't that the tool produces wrong numbers. It's that users take the numbers seriously without understanding the assumptions. A "62% adoption" output with no confidence interval, no calibration anchor, and no explicit statement that "this is a model of a 2024 US population that may not match your target market" will be misused. The most important UI change this product needs might not be a feature — it might be a disclaimer architecture that forces users to engage with the assumptions before they read the results.

---

*This document is a living analysis. It should be updated as calibration data is added and architectural changes are made.*
