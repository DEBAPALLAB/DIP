# Master Plan: Hype + Product Depth
## Building in public, where the roadmap IS the content

*Last updated: June 2026*

> Read alongside [SIMULATION_REALITY_ANALYSIS.md](SIMULATION_REALITY_ANALYSIS.md) (the technical audit) and [GO_TO_MARKET_SEQUENCING.md](GO_TO_MARKET_SEQUENCING.md) (the launch sequence). This document fuses them into one timeline.

---

## The central idea

Don't run "marketing" and "product" as two tracks. Run **one loop**: every product improvement from the reality analysis becomes a LinkedIn post, and every post tells you whether that improvement was worth doing. This is the only sustainable way for a solo/small founder to create hype — you're not inventing content, you're narrating real work.

The reality analysis gave you a Reality Score of 54/100 and a ranked roadmap. **That roadmap is your content calendar.** Each fix moves the score AND gives you a post. The score going 54 → 68 → 80 is itself the story arc people follow.

```
  Build a fix (from the reality analysis roadmap)
        │
        ▼
  Post the before/after on LinkedIn (the honest version sells)
        │
        ▼
  Engagement tells you what resonates → reprioritize roadmap
        │
        └──────────── loop ────────────┘
```

---

## Why "build in public" beats polished launch hype (for you specifically)

You already wrote the most powerful marketing asset you have: a brutally honest self-audit that scores your own product 54/100. **That document is more compelling than any feature announcement**, because:

- It signals you understand the problem deeper than competitors who only post wins
- "Here's why my own simulation is only 54% real, and here's me fixing it" is a story people follow. "My product is amazing" is a story people scroll past.
- It pre-empts the skeptic. When you say the hard things first, no one can use them against you.
- In a feed drowning in AI-slop overclaims, the founder publicly stress-testing their own AI is pattern-breaking.

The "ask 10 people vs simulation" tension and the "is the GSS data even relevant" question from the reality analysis aren't weaknesses to hide — **they are your best three posts.** Founders, PMs, and researchers will argue in your comments, and that argument IS the reach.

---

## PART A — The LinkedIn Hype Engine

### The narrative spine (what your feed is "about")

Pick ONE throughline so every post compounds instead of scattering. Yours, based on what you've built:

> **"I'm building a simulation that predicts how products spread through real social networks — and I'm doing it in public, including the parts that don't work yet."**

Everything posts under that banner. The honesty is the brand.

### The four post archetypes (rotate these)

1. **The Teardown** — "I scored my own product 54/100. Here's the brutal breakdown." (You already wrote this. It's post #1.)
2. **The Build** — "I just made agent decisions reversible. Here's the before/after adoption curve." (Each roadmap item = one of these.)
3. **The Provocation** — "Why would you simulate 50,000 customers instead of asking 10 real ones? Here's my honest answer." (The hard product questions = debate bait.)
4. **The Reveal** — "I backtested [Slack/Quibi] through my sim before checking the real outcome. Here's the chart." (The calibration ghost cases = your highest-impact posts.)

### The first 10 posts, in order

| # | Archetype | Hook | Asset needed |
|---|---|---|---|
| 1 | Teardown | "I built an adoption simulator, then scored it 54/100 myself. Thread." | The reality analysis (done) |
| 2 | Provocation | "Why not just ask 10 real people? The honest case for and against simulation." | Part 2 of reality analysis (done) |
| 3 | Reveal | "I fed [a failed product] into my sim before looking at what really happened." | One ghost case (see Part B, Move 0) |
| 4 | Build | "Made my agents change their minds. Watch the adoption curve go from a ratchet to a real market." | Conviction scoring (Tier 1A) |
| 5 | Provocation | "My training data is a 2024 survey of 3,000 Americans. Is that even relevant in 2026? Let's talk." | GSS section of reality analysis (done) |
| 6 | Build | "Adoption doesn't start with everyone informed. I added an awareness funnel. Here's the cascade." | Awareness funnel (Tier 1B) + the GIF |
| 7 | Reveal | "Backtest #2: [Slack]. The curve fit surprised me." | Ghost case #2 |
| 8 | Build | "People don't ask 'is this good' — they ask 'is this better than what I have.' Added competitive switching." | Competitive baseline (Tier 1C) |
| 9 | Teardown | "Reality Score update: 54 → 71. What changed, what's still broken." | Re-audit after Tier 1 |
| 10 | Reveal/CTA | "I've backtested 3 products to ~88% curve fit. Opening early access. Comment your product." | Waitlist live |

> Posts 1, 2, and 5 require **zero new engineering** — they're already written in your analysis doc. You can start the hype engine THIS WEEK while building Tier 1 in parallel.

### Cadence and mechanics

- **2–3 posts/week.** Consistency beats volume. The algorithm rewards showing up.
- **Every post ends with a question.** Comments are reach. "Would you trust this over a focus group? Why?" outperforms any CTA.
- **The chart/GIF is the post.** LinkedIn surfaces native visual media. A cascade animation or a predicted-vs-actual chart stops the scroll; a wall of text doesn't.
- **Reply to every comment in the first 90 minutes.** Early engagement velocity determines distribution.
- **Post #10 is the only hard CTA.** Earn the waitlist ask across 9 posts of value first.

---

## PART B — The Product Depth Roadmap (sequenced to feed the posts)

This is the reality analysis roadmap, re-ordered so each build lands exactly when a post needs it.

### Phase 0 — This week (unblocks posts 1, 2, 5 immediately)

These posts need **no code** — the content already exists in your analysis. Ship the hype engine now.

Simultaneously, start the one thing that unlocks the highest-value posts:

**Move 0 — Build one calibrated ghost case** (feeds post #3)
Pick a product with public adoption data. Best choice: a **documented failure** (Quibi, Google+, Juicero) — predicting a flop beats predicting a hit because hits have survivorship bias, and "my sim called the failure" is a stronger flex. Feed it the real launch context, run it, chart predicted vs. actual.
*Effort: 3–5 days research + tuning. No architecture.*

### Phase 1 — Weeks 2–4 (the Tier 1 fixes, each = a post)

Do these in this exact order — it's the order that produces the best posts AND the fastest score gains.

**1A. Reversible decisions + conviction scoring** → feeds post #4
Remove the "already decided" guard. Add `conviction = |utility − threshold|`. Low conviction = flip/churn candidate. Surface a "retention risk %" in results. *Effort: ~2 days. Score: 54 → ~60.*

**1B. Awareness funnel (staged exposure)** → feeds post #6, produces THE GIF
Stop exposing all agents on step 1. Influencers/early adopters first → neighbors hear secondhand → mass-market reach later. Produces real S-curves and the single most shareable visual in the whole product. *Effort: ~3 days. Score: 60 → ~66.*

**1C. Competitive baseline (switching, not buying)** → feeds post #8
`utility = U(new) − U(current) − switching_cost`. Add a status-quo scenario. Matches how every real decision actually works. *Effort: ~1 day. Score: 66 → ~71.*

> **Cleanup to do during Phase 1:** the reality analysis flagged two divergent utility functions (`simulation.ts` dead code vs. `prompts.ts` live). Delete the dead one while you're in there — it's a correctness landmine and a bad look if a sharp follower reads your code.

### Phase 2 — Weeks 5–8 (the differentiators, each = a strong post)

**2D. Calibration anchor system** → feeds posts #7, #9, #10
Formalize the ghost-case process. Backtest 2–3 more products. Publish the average curve-fit. **This is what converts the waitlist from novelty to belief.** *Effort: ongoing, ~1 week/case.*

**2E. Structured objection extraction** → strong standalone post
Direct readout of WHICH params and WHICH network signals drove `oppose` decisions, grouped by persona. "Your barrier is Price Hawk resistance amplified by hub centrality" — zero focus-group equivalent. *Effort: ~3 days.*

**2F. Information degradation over network hops** → "why mass markets undervalue" post
Value perception decays across word-of-mouth hops. Produces realistic late-majority flattening. *Effort: ~2 days.*

### Phase 3 — Post-waitlist (the platform plays)

These make it a platform, not a tool. Build once you have waitlist signal telling you which matters most.

- **3G. Adversarial agent layer** — ~5% Claude-driven agents that generate genuine novel objections that spread through the network. Directly answers the "AI slop" critique. (Biggest "wow," highest effort.)
- **3H. Real-world signal ingestion** — paste competitor reviews / Reddit / pricing pages → LLM extracts trait priors. Params from evidence, not vibes.
- **3I. Temporal scenario arcs** — model a launch as a sequence of quarters with shifting params. Same population, evolving market.

---

## PART C — The honest-positioning guardrails (non-negotiable)

These run through BOTH tracks. Break them and the hype becomes a liability.

1. **Fix the homepage numbers first.** The live site shows "86.4% Cascade Contagion Confidence" — confidence in nothing. Before you drive ANY LinkedIn traffic there, either replace it with a real backtest number or label it "illustrative." Driving skeptics to unbackable numbers converts curiosity into doubt. *(Detailed in GO_TO_MARKET_SEQUENCING.md, Move 1.)*

2. **Ship a Methodology page that states the limits.** GSS-2024-proxied, US-population, no error bars yet. Being the one tool honest about its assumptions is a moat in a category of overclaimers. It's also post-worthy.

3. **Never let the LLM quotes be the hero.** They're post-hoc rationalizations — the most "AI slop"-vulnerable surface. Lead every demo with cascade dynamics and calibrated curves, not agent quotes.

4. **Lead with failure as often as success.** "My sim predicted Quibi would flop" is more credible than any success story and is on-brand for the build-in-public honesty.

---

## The timeline at a glance

| Week | Product | LinkedIn | Score |
|---|---|---|---|
| 1 | Start ghost case #1; fix homepage numbers | Post 1 (Teardown), Post 2 (Provocation) | 54 |
| 2 | 1A conviction; finish ghost case #1 | Post 3 (Reveal), Post 4 (Build) | 60 |
| 3 | 1B awareness funnel | Post 5 (Provocation/GSS) | 66 |
| 4 | 1C competitive baseline; delete dead code | Post 6 (Build + GIF) | 71 |
| 5–6 | 2D calibration (cases #2, #3); Methodology page | Post 7 (Reveal), Post 8 (Build) | 73 |
| 7 | 2E objection extraction | Post 9 (Teardown: 54→73 recap) | 76 |
| 8 | Waitlist live with use-case capture + referral | **Post 10 (CTA: open early access)** | 76 |
| 9+ | 2F, then Phase 3 driven by waitlist signal | Sustained build-in-public | 80+ |

**~8 weeks from today to: a credible waitlist, a public proof track record, a Reality Score in the high 70s, and a content engine that runs on real work instead of invented hype.**

---

## The one thing to internalize

Your unfair advantage is not the simulation — competitors can copy Prospect Theory and Watts-Strogatz. Your unfair advantage is that **you are willing to publicly audit your own product at 54/100 and fix it in the open.** That honesty, sustained across 10+ posts while the score climbs, is a story no competitor with a "we're amazing" feed can compete with. The product depth and the hype are the same motion: build the fix, show the work, ask the hard question, repeat.

---

*Living document. Update the score column and post log as you ship.*
