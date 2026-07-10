# Go-To-Market Sequencing
## The exact next move to earn the right to hype

*Last updated: June 2026*

---

## The core insight you need before anything else

You asked for the "most optimal next thing so I can start hyping and put up a waitlist." The honest answer is that **the bottleneck to hype is not features — it's a single believable demonstration.**

You can open a waitlist tomorrow. The question is whether the waitlist *converts attention into belief* or whether it leaks credibility every time a smart person looks closely. Right now, a smart person looking closely finds a problem, and it's not the math. It's this:

**Your homepage already makes falsifiable claims you cannot currently back.**

The live marketing site shows:
- "ADOPTION_PEAK — 78.4% DETECTED"
- "86.4% / Cascade Contagion Confidence"
- "0% ACCURACY → 100% STABLE"

These are presented as if the system *measured* something real. But there is no calibration anchor anywhere in the product. The number 86.4% confidence is confidence in nothing — it's a model's internal consistency, not its agreement with reality. The first technically literate visitor (an investor's analyst, a skeptical founder, a journalist) who asks "confidence relative to what?" gets no answer. That single unanswerable question deflates the entire pitch.

So the most optimal next move is not a feature. **It's manufacturing one piece of external proof — and then letting the hype machine point at that proof instead of at vibes.**

---

## The sequencing, in order

### Move 0 — The thing you do THIS WEEK (before any waitlist)

**Build one calibrated "ghost case."**

Pick one product whose real adoption trajectory is publicly documented. Candidates where data is gettable:
- **Slack** — team count over time is widely published (0 → 8,000 → 500,000 teams, with dates)
- **Notion** — user milestones are public and the social-virality story is well-known
- **Dropbox** — the referral-driven adoption curve is a textbook case
- **Robinhood / a fintech** — if you want to show the "loss aversion" dimension working
- **A failed product** — even better. Quibi, Google+, Juicero. Showing your sim *predicts a failure* is more credible than predicting a success, because successes have survivorship bias baked in.

The exercise: feed the sim the product's real launch context, set the scalar params from the actual pricing/positioning, run it, and show the simulated adoption curve next to the real one. Tune until they overlap within a believable band.

This produces your single most valuable asset: a side-by-side chart captioned *"We ran [Product] through the simulation before knowing the outcome. Here's the curve it produced vs. what actually happened."* That image is your entire hype campaign. It is worth more than 10 features.

> **Why this and not features:** A waitlist with no proof converts on novelty, and novelty decays. A waitlist anchored to "it predicted Slack's curve" converts on belief, and belief compounds. You are choosing what your earliest, loudest advocates will say about you. Make them say "it actually works," not "it looks cool."

**Effort: 3–5 days of research + parameter tuning. Zero new architecture.**

---

### Move 1 — Make the homepage numbers honest (same week)

Once you have the ghost case, the homepage numbers stop being vibes and start being claims you can defend.

Two options, in order of preference:

1. **Replace the fabricated dashboard numbers with the calibrated case.** Instead of "86.4% Cascade Contagion Confidence" (meaningless), show "Backtested against Slack's first 18 months — 91% curve fit." That's a number that *means* something and *invites* the skeptical question instead of dreading it.

2. **If you keep illustrative numbers, label them illustrative.** A tiny "simulated preview" tag under the dashboard mockup. This costs you nothing and removes the single biggest credibility landmine. Right now those numbers read as measured results.

The most dangerous version of this product is the one that looks more certain than it is. A waitlist built on numbers that evaporate under scrutiny is a liability — every sophisticated person who signs up and then sees through it becomes a quiet detractor.

---

### Move 2 — The one feature that makes the demo undeniable

You don't need all of Tier 1 from the reality analysis. You need the **single feature that makes a live demo produce an "oh, that's not just a chart" moment.**

That feature is **the awareness funnel (staged exposure)** — Tier 1B from the analysis.

Why this one over conviction-scoring or competitive baseline:
- It's the most *visually* dramatic. Watching adoption start with 3 lit-up influencer nodes and cascade outward across the network over ticks is the screenshot/GIF that sells the product. A static 62% number is not shareable. A spreading contagion animation is.
- It's the feature that most viscerally answers "why not just ask 10 people" — because you can *see* the network effect that no interview captures.
- It directly produces the S-curve shape that matches your ghost case, reinforcing Move 0.

Build this, record a 15-second screen capture of the cascade spreading, and that GIF becomes your second hype asset.

**Effort: ~3 days. Detailed in the reality analysis, Tier 1B.**

---

### Move 3 — THEN open the waitlist

Now the waitlist has something to point at:
- **Proof:** "It predicted [Product]'s adoption curve" (Move 0)
- **Honesty:** numbers on the site mean something (Move 1)
- **Spectacle:** the cascade animation (Move 2)

The waitlist copy writes itself: *"We built a behavioral simulation that backtested [Product]'s real adoption to within 9%. Now you can run your own launch through it. Join the waitlist."*

Compare that to what you'd have today: *"Simulate adoption with AI agents. Join the waitlist."* — which is indistinguishable from 50 other AI tools and converts on hope.

---

## The waitlist mechanics (do these right)

A waitlist is not a signup form. It's a pre-launch engine. The optimal structure:

1. **Capture the use case, not just the email.** One field: "What product would you run through it first?" This does three things — qualifies the lead, gives you a corpus of real test scenarios to calibrate against (free training data for your next ghost cases), and makes the signup feel like the product already started working for them.

2. **Position-based referral.** Show people their position ("You're #247"). Let them move up by referring. This is the single highest-leverage growth mechanic for pre-launch and it's a half-day of engineering. Robinhood's entire early growth was this.

3. **Tiered early access by use case quality.** Tell people the most interesting use cases get in first. This filters for engaged users and gives you the right early cohort — people testing real products, not tire-kickers. Your first 50 users determine whether your testimonials say "fascinating" or "we used this to make a real decision."

4. **Drip the ghost cases.** You have one calibrated case for launch. Build a second and third *during* the waitlist period and email them to the list. Each one is a re-engagement touchpoint and a fresh proof point. The waitlist period is when you manufacture the body of evidence — "we've now backtested 5 products, average curve fit 88%."

---

## What NOT to do right now (the traps)

**Don't build Tier 2 and Tier 3 before launch.** Adversarial agents, real-world signal ingestion, temporal arcs — these are real and on the roadmap, but they're invisible to a waitlist visitor and they delay the only thing that matters: one believable demo. Ship the proof, open the list, build the depth while people wait.

**Don't fix the GSS data problem before launch — but don't hide it either.** You cannot replace the GSS data in the timeframe that matters. What you CAN do is be the one company in this space honest about it: a "Methodology" page that says plainly "our population is modeled on GSS 2024 US data; here's what that means and doesn't mean." Sophisticated buyers trust the tool that states its limits over the tool that pretends it has none. This honesty is itself a marketing asset in a category drowning in AI-slop overclaims.

**Don't let the reasoning text be the hero.** The LLM-generated agent quotes are the most "AI slop"-vulnerable part of the product — they're post-hoc rationalizations, and a skeptic will sense that. Lead the demo with the *cascade dynamics and the calibrated curve*, not the quotes. The quotes are flavor, not proof.

**Don't open the waitlist on the strength of the visual polish alone.** The marketing redo is genuinely good — but polish raises expectations, it doesn't meet them. A beautiful site making unbackable claims falls harder than an ugly one. The polish is a multiplier on the proof, and a multiplier on zero is zero.

---

## The exact next action, in one sentence

**Pick one product with public adoption data, backtest it through the simulation, and produce a single side-by-side chart of predicted vs. actual — because that chart is the asset every other go-to-market move points at, and you cannot honestly hype or open a waitlist without it.**

Everything else — the awareness funnel, the waitlist referral mechanics, the methodology page — is sequenced behind that one proof. Get the proof first.

---

## Sequencing summary

> **Status (July 10, 2026):** Move 0 done (Quibi, 97.1% fit); Move 1 intentionally held; Tier 1A conviction live. Next: Tier 1B awareness funnel. See progress notes below.

| Order | Move | Effort | Produces | Status |
|---|---|---|---|---|
| 0 | Calibrated ghost case (backtest one real product) | 3–5 days | The proof chart — your entire pitch | ✅ **Done — Quibi**, 97.1% curve fit (1 case), chart published |
| 1 | Make homepage numbers honest / labeled | 1 day | Removes the credibility landmine | ⏸ **Held** — chart kept standalone; marketing page untouched by choice |
| 1A | Conviction scoring + reversible decisions | 2 days | Retention Risk metric live | ✅ **Done (July 7)** — conviction scoring live, `< 0.3` churn indicator on results |
| 2 | Awareness funnel + cascade animation capture | 3 days | The shareable spectacle GIF | ⏳ **Next eng unit (Tier 1B)** — highest priority for post #6 |
| 3 | Open waitlist with use-case capture + referral | 2 days | The pre-launch growth engine | Pending |
| 4 | Drip 2–3 more ghost cases during waitlist | ongoing | Compounding proof, re-engagement | Runner ready (`scripts/ghost-cases/`) |
| — | Methodology / honest-limits page | 1 day | Trust moat vs. overclaiming competitors | Pending |

Total to credible launch-ready waitlist: **~2 weeks**, almost none of it on net-new simulation architecture.

### Move 0 — completed (Quibi), July 7, 2026
A headless runner (`scripts/ghost-cases/quibi.ts`) drives the real production decision engine. Quibi's launch economics (value=0.24, risk=0.34, loss=0.44) produce an emergent adoption **collapse to ~0.08%** that tracks the real decline within **2.9 pts** normalized (97.1% curve fit, 25-run average). **Public framing = qualitative-led** ("the sim predicted Quibi's collapse"); the % is stated as one calibrated case with explicit caveats (the collapse is emergent — conviction drops to 0.103; only decay *rate* was tuned), deliberately **not** a headline "97%," to avoid the "confidence in what?" takedown this doc warns about. The single case is a signal, not proof — Move 4 (more cases) is what makes the number defensible.

---

*This document is a living plan. Update it as ghost cases are completed and waitlist metrics come in.*
