"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Squares from "@/components/marketing/InteractiveBackground";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/* ── Data ─────────────────────────────────────────────────────────── */

const SCOREBOARD = [
  { label: "Capital raised", value: "$1.75B", note: "Before a single subscriber" },
  { label: "Year-one target", value: "7.4M", note: "Projected paid subscribers" },
  { label: "Actually delivered", value: "~500K", note: "6.8% of target", emphasis: true },
  { label: "Lifespan", value: "6 mo", note: "Apr 6 → Oct 21, 2020" },
];

const TIMELINE = [
  { date: "AUG 2018", title: "Founded as NewTV", desc: "Katzenberg (ex-Disney, DreamWorks) starts the project; Whitman (ex-eBay, HPE) joins as CEO. Renamed Quibi that October." },
  { date: "APR 2019 – MAR 2020", title: "$1.75B Raised", desc: "Disney, Fox, NBCUniversal, Sony, WarnerMedia, Goldman Sachs, JPMorgan and Alibaba fund the round." },
  { date: "APR 6 2020", title: "Public Launch", desc: "iOS/Android only, subscription-only, ~2 weeks into US COVID lockdowns." },
  { date: "OCT 21 2020", title: "Shutdown Announced", desc: "Six months in. ~$350M of the $1.75B left; ~$1.4B already spent." },
  { date: "DEC 1 2020", title: "Service Ends", desc: "Library sold to Roku for under $100M, against ~$500M in production spend." },
];

const FLAWS = [
  {
    tag: "PLATFORM",
    title: "Mobile-only, no TV at launch",
    desc: "iOS/Android app only, no casting, no desktop, no smart-TV apps. A deliberate “mobile-first” bet that inverted the moment lockdown put everyone home, on the couch, in front of a TV.",
    source: "IESE Blog",
  },
  {
    tag: "TIMING",
    title: "Launched into a pandemic",
    desc: "The whole value prop was commute-and-transit viewing. COVID erased that behavior in the launch window. Katzenberg later called it a mix of “the idea being less than perfect… and the environment we found ourselves in.”",
    source: "Deadline",
  },
  {
    tag: "DISCOVERY",
    title: "No screenshots, no sharing, no clips",
    desc: "Quibi explicitly blocked sharing to social. In a market where discovery runs on shareable clips, this cut the primary adoption loop at the root.",
    source: "IESE Blog / Slashgear",
  },
  {
    tag: "PRICING",
    title: "No free tier: a hard paywall",
    desc: "90-day trial, then $4.99 (ads) or $7.99 (none). No permanent free option, competing head-on with YouTube and TikTok, both free and infinite.",
    source: "NBC News",
  },
  {
    tag: "PRODUCT",
    title: "Turnstyle: a feature nobody asked for",
    desc: "Auto-reframing portrait↔landscape burned real R&D and drew IP litigation with Eko, money that could have funded sharing or a free tier.",
    source: "Mynameiskalam",
  },
  {
    tag: "BUDGET",
    title: "$600M content, no organic loop",
    desc: "A-list production (Hart, J.Lo, Spielberg) with no viral mechanism to amplify it. Only $63M of marketing ran before shutdown, paid reach with nowhere to compound.",
    source: "Forbes / Digiday",
  },
  {
    tag: "LEADERSHIP",
    title: "Institutional overconfidence",
    desc: "Analyst Peter Csathy said pre-launch he was “always skeptical about Quibi's chance.” The $1.75B raise was read as validation of the strategy, not runway to test it.",
    source: "NBC News",
  },
  {
    tag: "CONVERSION",
    title: "The trial cliff",
    desc: "~910K signed up in the first 72 hours; only ~8% converted to paid per Sensor Tower (Quibi disputed a higher 27% from Antenna). Either way, most tried it and walked.",
    source: "Variety",
  },
];

type Persona = {
  name: string;
  color: string;
  nRange: string;
  stanceMin: number;
  stanceMax: number;
  decision: string;
  note: string;
};

const PERSONAS: Persona[] = [
  { name: "Influencer", color: "#E91E63", nRange: "2.5–4%", stanceMin: 0.15, stanceMax: 0.35, decision: "Weak support", note: "High centrality overrides constraints, but with no seeded stance, starts neutral and slow to move." },
  { name: "Early Adopter", color: "#00BCD4", nRange: "7.5–10%", stanceMin: 0.1, stanceMax: 0.25, decision: "Marginal support", note: "Low risk aversion and prior-adoption history help, but the loss term keeps utility thin." },
  { name: "Price Hawk", color: "#FFEB3B", nRange: "6–9%", stanceMin: -0.15, stanceMax: 0.05, decision: "Neutral / mild oppose", note: "Waits for a discount that never comes; risk_exposure and perceived_loss dominate value_delta." },
  { name: "Pragmatist", color: "#4CAF50", nRange: "20–30%", stanceMin: -0.25, stanceMax: 0.0, decision: "Oppose / neutral", note: "The balanced-trait middle of the population. Utility nets negative once loss and risk are summed." },
  { name: "Social Follower", color: "#FF9800", nRange: "10–15%", stanceMin: -0.3, stanceMax: -0.1, decision: "Oppose / neutral", note: "Their entire adoption mechanism, peer cascade, is severed by the no-sharing constraint." },
  { name: "Herd Member", color: "#9C27B0", nRange: "12.5–17.5%", stanceMin: -0.5, stanceMax: -0.2, decision: "Oppose", note: "Requires broad consensus to flip. Consensus never forms, so they stay opposed the whole run." },
  { name: "Skeptic", color: "#F44336", nRange: "10–15%", stanceMin: -0.6, stanceMax: -0.3, decision: "Oppose", note: "Low institutional trust discounts the value claim by up to 48% before loss and risk even apply." },
  { name: "Laggard", color: "#607D8B", nRange: "5–7.5%", stanceMin: -0.7, stanceMax: -0.4, decision: "Strong oppose", note: "Extreme risk aversion plus high status-quo bias. Structurally immovable within the window." },
];

const AXIS_MIN = -0.8;
const AXIS_MAX = 0.4;
const AXIS_SPAN = AXIS_MAX - AXIS_MIN;
const posPct = (v: number) => ((v - AXIS_MIN) / AXIS_SPAN) * 100;

const AGGREGATE = [
  { name: "Support", pct: 7.5, range: "5–10%", color: "var(--support)" },
  { name: "Neutral", pct: 35, range: "30–40%", color: "var(--neutral)" },
  { name: "Oppose", pct: 57.5, range: "50–65%", color: "var(--oppose)" },
];

const REALITY_ROWS = [
  { metric: "Adoption rate", model: "5–10% of population reaches support", actual: "6.8% of target (500K / 7.4M subs)", strength: "strong" as const },
  { metric: "Opposition dominance", model: "50–65% of agents land oppose", actual: "~93% never converted past trial", strength: "strong" as const },
  { metric: "Trial-to-paid conversion", model: "Weak cascade, no sustained support signal", actual: "8–27% converted, then plateaued", strength: "strong" as const },
  { metric: "Dominant stance cluster", model: "Pragmatists, Social Followers, Herd Members: neutral-to-oppose", actual: "Most “adopters” were one-time trial takers", strength: "moderate" as const },
  { metric: "Cascade / seeding boost", model: "Minimal: no seeded personas, cold start", actual: "No KOL launch; mass TV ads only", strength: "moderate" as const },
];

const MECHANISMS = [
  {
    n: "01",
    chip: "−λ · loss_aversion · perceived_loss",
    title: "Loss aversion outweighs value, by design",
    desc: "With λ≈2.25 (the median agent, per Tversky & Kahneman) and perceived_loss≈0.50, the loss penalty alone is ≈ −0.56, bigger than the entire value term (≈0.23). Losses loom ~2.4× larger than gains. Prospect theory operating exactly as documented, not a special case invented for Quibi.",
  },
  {
    n: "02",
    chip: "value_delta × (0.4 + 0.6·trust)",
    title: "The trust discount hits at the worst moment",
    desc: "Even a high-trust agent (0.8) credits just 88% of Quibi's stated value; a skeptic (0.2) credits 52%. The loss term has no equivalent discount, so eroding trust shrinks the one thing working in Quibi's favor while leaving the thing working against it untouched.",
  },
  {
    n: "03",
    chip: "social_signal = Σ w·neighbor_stance",
    title: "Social signal collapses without a sharing channel",
    desc: "The signal is a weighted average of a neighbor's stances. If every neighbor is independently computing negative utility, the average stays near zero, no positive feedback loop forms. TikTok and YouTube have that loop by default; Quibi's no-screenshot policy removed it at the source.",
  },
  {
    n: "04",
    chip: "threshold = status_quo × adoption_discount",
    title: "The decision threshold is a structural trap",
    desc: "With most agents not “practiced adopters,” threshold lands near 0.54–0.65; stance must clear ≈±0.19 to register as support or oppose. Weak signals in both directions stay trapped in a wide neutral band, matching the observed pattern: many trial signups, little conviction.",
  },
];

const COUNTERFACTUALS = [
  { param: "value_delta", from: "0.35", to: "0.70", change: "Content perceived as clearly superior to free YouTube/Netflix originals, which didn't materialize." },
  { param: "perceived_loss", from: "0.50", to: "0.10", change: "A permanent free / ad-supported tier or money-back guarantee, instead of a hard 90-day wall." },
  { param: "effective_social_weight", from: "0.05", to: "0.60", change: "Clips, screenshots, in-app sharing: the discovery loop Quibi explicitly disabled." },
  { param: "risk_exposure", from: "0.65", to: "0.30", change: "TV / casting support shipped before launch, resolving the COVID context mismatch." },
  { param: "seed_personas", from: "none", to: "Influencer + EA", change: "A KOL / creator seeding strategy pre-launch, instead of relying on mass marketing spend." },
];

const REFERENCES = [
  "Wikipedia: Quibi",
  "CNBC: Quibi to shut down after 6 months",
  "NBC News: Why Quibi failed so soon",
  "Variety: Year-one subscriber goal pace",
  "Variety: Free trial 8% conversion",
  "Deadline: Katzenberg / Whitman interview",
  "IESE Blog: The death of a six-month-old app",
  "Slashgear: Why Quibi was such a failure",
  "Forbes: Quibi ad spend",
  "Digiday: Content strategy budget",
  "ANTENNA Analytics: Trial conversion rates",
  "Mynameiskalam: Quibi launch failure case study",
];

/* ── Agent network visualization (deterministic, seeded; no hydration drift) ── */

function seededRng(seed: number) {
  let t = seed;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

type NetNode = { x: number; y: number; r: number; color: string; group: number };
type NetEdge = [number, number];

function buildNetwork(): { nodes: NetNode[]; edges: NetEdge[] } {
  const rng = seededRng(20200406); // Quibi's launch date, as the seed
  const groups = [
    { color: "var(--oppose)", count: 81, cx: 138, cy: 232, spread: 100 },
    { color: "var(--neutral)", count: 49, cx: 300, cy: 108, spread: 84 },
    { color: "var(--support)", count: 10, cx: 322, cy: 300, spread: 52 },
  ];
  const nodes: NetNode[] = [];
  groups.forEach((g, gi) => {
    for (let i = 0; i < g.count; i++) {
      const angle = rng() * Math.PI * 2;
      const radius = Math.pow(rng(), 0.6) * g.spread;
      nodes.push({
        x: Math.round((g.cx + Math.cos(angle) * radius) * 10000) / 10000,
        y: Math.round((g.cy + Math.sin(angle) * radius) * 10000) / 10000,
        r: Math.round((2.2 + rng() * 2.4) * 10000) / 10000,
        color: g.color,
        group: gi,
      });
    }
  });
  const edges: NetEdge[] = [];
  nodes.forEach((a, i) => {
    const nearest = nodes
      .map((b, j) => ({ j, d: i !== j && a.group === b.group ? Math.hypot(a.x - b.x, a.y - b.y) : Infinity }))
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    nearest.forEach((c) => c.d < Infinity && edges.push([i, c.j]));
  });
  for (let k = 0; k < 10; k++) {
    const a = Math.floor(rng() * nodes.length);
    const b = Math.floor(rng() * nodes.length);
    if (nodes[a].group !== nodes[b].group) edges.push([a, b]);
  }
  return { nodes, edges };
}

const NETWORK = buildNetwork();
const NET_COUNTS = { support: 10, neutral: 49, oppose: 81 };

// Degree-rank the graph once so the handful of highest-connectivity "hub"
// nodes can carry a quiet ambient pulse, and their edges an animated signal-flow dash.
const NET_HUB_INDICES: number[] = (() => {
  const degree = new Array(NETWORK.nodes.length).fill(0);
  NETWORK.edges.forEach(([a, b]) => {
    degree[a] += 1;
    degree[b] += 1;
  });
  return degree
    .map((d, i) => ({ i, d }))
    .sort((a, b) => b.d - a.d)
    .slice(0, 6)
    .map((x) => x.i);
})();
const NET_HUB_SET = new Set(NET_HUB_INDICES);

function AgentNetworkGraph() {
  return (
    <div className="qb-net-outer reveal">
      <div className="qb-net-core">
        <div className="qb-net-head">
          <span className="qb-net-title">Population structure</span>
          <span className="qb-net-n">n = 140 agents</span>
        </div>
        <svg viewBox="0 0 420 360" className="qb-net-svg" role="img" aria-label="Agent network graph, colored by decision">
          {NETWORK.edges.map(([a, b], i) => {
            const n1 = NETWORK.nodes[a];
            const n2 = NETWORK.nodes[b];
            const isHubEdge = NET_HUB_SET.has(a) || NET_HUB_SET.has(b);
            const len = Math.round(Math.hypot(n2.x - n1.x, n2.y - n1.y));
            return (
              <line
                key={i}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke={n1.color}
                strokeOpacity={isHubEdge ? 0.4 : 0.13}
                strokeWidth={isHubEdge ? 1.1 : 1}
                className={isHubEdge ? "qb-hub-edge" : undefined}
                style={isHubEdge ? ({ strokeDasharray: `4 5`, strokeDashoffset: len % 9, animationDelay: `${(i % 7) * -0.6}s` } as React.CSSProperties) : undefined}
              />
            );
          })}
          {NETWORK.nodes.map((n, i) => {
            const isHub = NET_HUB_SET.has(i);
            return (
              <circle
                key={i}
                cx={n.x}
                cy={n.y}
                r={isHub ? n.r + 0.8 : n.r}
                fill={n.color}
                opacity={0.9}
                className={isHub ? "qb-hub-node" : "qb-net-node"}
                style={{ color: n.color, animationDelay: `${(i % 12) * 0.28}s` } as React.CSSProperties}
              />
            );
          })}
        </svg>
        <div className="qb-net-stats">
          <div className="qb-net-stat">
            <i style={{ background: "var(--oppose)" }} />
            <b>{NET_COUNTS.oppose}</b>
            <span>Oppose</span>
          </div>
          <div className="qb-net-stat">
            <i style={{ background: "var(--neutral)" }} />
            <b>{NET_COUNTS.neutral}</b>
            <span>Neutral</span>
          </div>
          <div className="qb-net-stat">
            <i style={{ background: "var(--support)" }} />
            <b>{NET_COUNTS.support}</b>
            <span>Support</span>
          </div>
        </div>
      </div>
      <p className="qb-net-caption">
        Representative population structure: color is decision, clustering reflects the social graph&apos;s
        small-world topology. Illustrative layout; proportions track the directional ranges below.
      </p>
    </div>
  );
}

/* ── Small building blocks ───────────────────────────────────────── */

function Source({ children }: { children: string }) {
  return <span className="qb-source">[Source: {children}]</span>;
}

/** Numbered dossier-style kicker that precedes every analytical H2. */
function Kicker({ n, label }: { n: string; label: string }) {
  return (
    <span className="qb-kicker">
      <span className="qb-kicker-n">{n}</span>
      <span className="qb-kicker-sep" aria-hidden="true">/</span>
      <span className="qb-kicker-label">{label}</span>
    </span>
  );
}

/** Mid-sentence thesis highlight, never a whole sentence, always the 2–4 word argument. */
function Hi({ children, solid = false }: { children: React.ReactNode; solid?: boolean }) {
  return <span className={solid ? "qb-hi qb-hi-solid" : "qb-hi"}>{children}</span>;
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default function QuibiCaseStudyClient() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));

    let ticking = false;
    const updateProgress = () => {
      ticking = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
      if (progressRef.current) progressRef.current.style.width = `${pct}%`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateProgress);
      }
    };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="qb-root">
      <div ref={progressRef} className="qb-progress-bar" aria-hidden="true" />

      <style jsx>{`
        .qb-root {
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
        }

        /* ── Scroll reveal ── */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.in {
          opacity: 1;
          transform: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
        }

        /* ── Fixed scroll progress ── */
        .qb-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          width: 0%;
          height: 3px;
          background: var(--accent);
          z-index: 200;
          mix-blend-mode: difference;
          pointer-events: none;
        }

        /* ── Shared editorial primitives ──
           NOTE: Kicker / Hi / AgentNetworkGraph are separate function components.
           styled-jsx only auto-scopes className selectors on DOM elements written
           directly inside *this* component's JSX; it can't see inside a child
           component's own return tree, so those classNames never receive the
           scoping attribute. Every selector styling their output must be :global(). */
        .qb-wrap { max-width: 1240px; margin: 0 auto; }
        :global(.qb-kicker) {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin-bottom: 26px;
        }
        :global(.qb-kicker-n) { color: var(--accent); font-weight: 700; }
        :global(.qb-kicker-sep) { color: var(--accent); opacity: 0.4; }
        :global(.qb-kicker-label) { color: var(--muted); }

        .qb-h2 {
          font-family: var(--heading);
          font-size: clamp(30px, 4.4vw, 56px);
          font-weight: 800;
          line-height: 1.02;
          letter-spacing: -0.04em;
          color: var(--bright);
          margin: 0;
          text-wrap: balance;
        }
        .qb-lead {
          color: var(--muted);
          font-size: 17px;
          line-height: 1.75;
          margin-top: 22px;
          max-width: 58ch;
        }

        :global(.qb-hi) {
          background: rgba(0, 82, 255, 0.12);
          padding: 0.02em 0.32em;
          border-radius: 6px;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
        }
        :global(.qb-hi-solid) {
          background: var(--accent);
          color: #fff;
          padding: 0.02em 0.36em;
          border-radius: 8px;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
        }
        .qb-source {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--accent);
          opacity: 0.7;
          letter-spacing: 0.04em;
        }

        /* ── 1. HERO ── */
        .qb-hero-shell {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 150px 4vw 90px;
          overflow: hidden;
        }
        .qb-hero-grid {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(340px, 0.95fr);
          gap: 60px;
          align-items: center;
        }
        .qb-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 30px;
        }
        .qb-hero-eyebrow::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 0 4px rgba(0, 82, 255, 0.16);
          animation: qbDot 2.4s ease-in-out infinite;
        }
        @keyframes qbDot {
          0%, 100% { box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.18); }
          50% { box-shadow: 0 0 0 6px rgba(0, 82, 255, 0.05); }
        }
        @media (prefers-reduced-motion: reduce) { .qb-hero-eyebrow::before { animation: none; } }

        .qb-hero-title {
          font-family: var(--heading);
          font-weight: 800;
          font-size: clamp(52px, 8.4vw, 118px);
          line-height: 0.9;
          letter-spacing: -0.05em;
          color: var(--bright);
          margin: 0;
        }
        .qb-hero-title .l2 {
          display: block;
          color: var(--accent);
          margin-top: 0.06em;
        }
        .qb-hero-deck {
          color: var(--muted);
          font-size: 18px;
          line-height: 1.7;
          max-width: 44ch;
          margin: 34px 0 0;
        }
        .qb-hero-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 30px;
        }
        .qb-badge {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          padding: 7px 13px;
          border-radius: 999px;
          border: 1px solid rgba(0, 82, 255, 0.16);
          background: rgba(0, 82, 255, 0.04);
          color: var(--accent);
        }
        .qb-scrollcue {
          position: absolute;
          left: 50%;
          bottom: 30px;
          transform: translateX(-50%);
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.3em;
          color: var(--muted);
          text-transform: uppercase;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 1;
        }
        .qb-scrollcue span {
          width: 1px;
          height: 34px;
          background: linear-gradient(var(--accent), transparent);
        }

        /* ── 2. SCOREBOARD BAND ── */
        .qb-scoreboard {
          background: #0a0a0d;
          color: #e8e2d9;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          overflow: hidden;
        }
        .qb-scoreboard::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(120% 140% at 74% 0%, rgba(0, 82, 255, 0.22) 0%, transparent 55%);
          pointer-events: none;
        }
        .qb-score-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          max-width: 1240px;
          margin: 0 auto;
        }
        .qb-score-cell {
          padding: 62px 34px;
          border-left: 1px solid rgba(255, 255, 255, 0.08);
        }
        .qb-score-cell:first-child { border-left: none; }
        .qb-score-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8a857c;
          margin-bottom: 18px;
        }
        .qb-score-num {
          font-family: var(--heading);
          font-weight: 800;
          font-size: clamp(40px, 5vw, 68px);
          line-height: 0.92;
          letter-spacing: -0.045em;
          color: #ffffff;
          font-variant-numeric: tabular-nums;
        }
        .qb-score-cell.emph .qb-score-num {
          color: var(--accent);
          filter: drop-shadow(0 0 24px rgba(0, 82, 255, 0.45));
        }
        .qb-score-note {
          margin-top: 14px;
          font-size: 13px;
          color: #a19c92;
          line-height: 1.5;
        }

        /* ── Section frame ── */
        .qb-section { padding: clamp(88px, 12vw, 150px) 4vw; }
        .qb-section.tint { background: var(--bg-darker); border-top: 1px solid var(--border); }
        .qb-section-head { max-width: 720px; margin-bottom: 60px; }

        /* ── 3. SETUP ── */
        .qb-setup-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 64px;
          align-items: start;
          margin-bottom: 74px;
        }
        .qb-setup-body {
          font-size: 17px;
          line-height: 1.85;
          color: var(--text);
        }
        .qb-setup-body .lg { color: var(--bright); font-weight: 600; }
        .qb-burn {
          border: 1px solid var(--border);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.5);
          padding: 30px 30px 26px;
        }
        .qb-burn-num {
          font-family: var(--heading);
          font-weight: 800;
          font-size: clamp(46px, 6vw, 72px);
          line-height: 0.9;
          letter-spacing: -0.045em;
          color: var(--bright);
        }
        .qb-burn-num em {
          font-style: normal;
          color: var(--accent);
        }
        .qb-burn-cap {
          margin-top: 16px;
          font-size: 13.5px;
          color: var(--muted);
          line-height: 1.6;
        }
        .qb-burn-rule { height: 1px; background: var(--border); margin: 22px 0; }

        /* Timeline strip */
        .qb-timeline-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
          position: relative;
        }
        .qb-timeline-line {
          position: absolute;
          top: 21px;
          left: 8%;
          right: 8%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border) 10%, var(--border) 90%, transparent);
        }
        .qb-timeline-item {
          padding: 0 20px 8px;
          position: relative;
          z-index: 1;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .qb-timeline-item:hover { transform: translateY(-5px); }
        .qb-tl-dot {
          width: 42px; height: 42px; border-radius: 50%;
          background: var(--bg); border: 1px solid rgba(0, 82, 255, 0.28);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 22px; box-shadow: 0 0 20px rgba(0, 82, 255, 0.1);
        }
        .qb-tl-dot i { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); display: block; }
        .qb-tl-date { font-family: var(--mono); font-size: 9px; color: var(--accent); letter-spacing: 0.1em; display: block; margin-bottom: 9px; }
        .qb-tl-title { font-family: var(--heading); font-size: 15px; font-weight: 700; color: var(--bright); margin-bottom: 9px; letter-spacing: -0.02em; }
        .qb-tl-desc { font-size: 12.5px; color: var(--muted); line-height: 1.6; }

        /* ── 4. AUTOPSY (flaws) ── */
        .qb-flaws-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }
        .qb-flaw-card {
          position: relative;
          padding: 32px 30px 30px;
          border: 1px solid var(--border);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.55);
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .qb-flaw-card:hover {
          transform: translateY(-6px);
          border-color: rgba(0, 82, 255, 0.3);
          box-shadow: 0 22px 60px rgba(0, 82, 255, 0.1);
        }
        .qb-flaw-idx {
          position: absolute;
          top: 6px;
          right: 20px;
          font-family: var(--heading);
          font-weight: 800;
          font-size: 86px;
          line-height: 1;
          letter-spacing: -0.05em;
          color: var(--accent);
          opacity: 0.07;
          pointer-events: none;
        }
        .qb-flaw-tag {
          font-family: var(--mono);
          font-size: 9px;
          color: var(--accent);
          letter-spacing: 0.18em;
          display: inline-block;
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(0, 82, 255, 0.06);
          border: 1px solid rgba(0, 82, 255, 0.12);
          margin-bottom: 16px;
        }
        .qb-flaw-title { font-family: var(--heading); font-size: 19px; font-weight: 700; color: var(--bright); margin-bottom: 11px; letter-spacing: -0.02em; }
        .qb-flaw-desc { font-size: 13.5px; color: var(--muted); line-height: 1.72; margin-bottom: 15px; }

        /* ── 5. MECHANICS / EDITOR ── */
        .qb-editor {
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          background: #0a0a0d;
          box-shadow: 0 30px 80px rgba(0, 82, 255, 0.1);
        }
        .qb-editor-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 13px 18px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .qb-editor-bar i { width: 11px; height: 11px; border-radius: 50%; display: block; }
        .qb-editor-file { margin-left: 10px; font-family: var(--mono); font-size: 11px; color: #8a857c; letter-spacing: 0.05em; }
        .qb-editor-body { padding: 30px 30px 32px; font-family: var(--mono); overflow-x: auto; }
        .qb-editor-comment { color: var(--accent); font-size: 11px; letter-spacing: 0.08em; margin-bottom: 18px; }
        .qb-editor-eq { color: #ffffff; font-size: clamp(14px, 1.6vw, 19px); line-height: 1.9; letter-spacing: -0.01em; }
        .qb-editor-sub { color: #a19c92; font-size: 12.5px; margin-top: 20px; line-height: 2; }

        .qb-mech-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: start;
          margin-top: 60px;
        }
        .qb-trans-title { font-family: var(--heading); font-size: 20px; font-weight: 700; color: var(--bright); margin-bottom: 14px; letter-spacing: -0.02em; }
        .qb-trans-lead { font-size: 14px; color: var(--muted); line-height: 1.75; margin-bottom: 26px; }
        .qb-trans-item { display: flex; gap: 16px; padding: 16px 0; border-top: 1px solid var(--border); }
        .qb-trans-item:first-of-type { border-top: none; }
        .qb-trans-arrow { color: var(--accent); font-weight: 700; flex-shrink: 0; font-family: var(--mono); font-size: 13px; margin-top: 2px; }
        .qb-trans-item p { font-size: 13.5px; line-height: 1.68; color: var(--muted); }
        .qb-trans-item strong { color: var(--bright); }

        .qb-param-card {
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.55);
          border-radius: 22px;
          padding: 30px;
          box-shadow: 0 24px 60px rgba(0, 82, 255, 0.05);
        }
        .qb-param-tag {
          display: inline-block;
          font-family: var(--mono); font-size: 9px; letter-spacing: 0.18em;
          color: var(--accent); padding: 7px 13px; border-radius: 999px;
          border: 1px solid rgba(0, 82, 255, 0.14); background: rgba(0, 82, 255, 0.04);
          margin-bottom: 22px;
        }
        .qb-param-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .qb-param-row {
          display: flex; flex-direction: column; gap: 6px;
          padding: 14px 15px; border-radius: 12px;
          border: 1px solid rgba(0, 82, 255, 0.08);
          background: rgba(0, 82, 255, 0.02);
          font-family: var(--mono);
          transition: border-color 0.3s ease, background 0.3s ease;
        }
        .qb-param-row:hover { border-color: rgba(0, 82, 255, 0.28); background: rgba(0, 82, 255, 0.06); }
        .qb-param-k { font-size: 10.5px; color: var(--muted); }
        .qb-param-v { font-size: 13px; color: var(--bright); font-weight: 700; }
        .qb-persona-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 14px; }
        .qb-persona-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 10px; border-radius: 999px;
          border: 1px solid var(--border); background: rgba(255,255,255,0.5);
          font-family: var(--mono); font-size: 10px; color: var(--text);
        }
        .qb-persona-chip i { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }

        /* ── 6. REVEAL (dark) ── */
        .qb-reveal-sec {
          background: #08080b;
          color: #e8e2d9;
          --text: #cfc9bf;
          --bright: #ffffff;
          --muted: #9a958c;
          --border: rgba(255, 255, 255, 0.1);
          --panel: rgba(255, 255, 255, 0.04);
          padding: clamp(88px, 12vw, 150px) 4vw;
          position: relative;
          overflow: hidden;
        }
        .qb-reveal-sec::before {
          content: "";
          position: absolute; top: -30%; left: 50%; transform: translateX(-50%);
          width: 80vw; height: 80vw; max-width: 1000px; max-height: 1000px;
          background: radial-gradient(circle, rgba(0, 82, 255, 0.2) 0%, rgba(0, 82, 255, 0.05) 42%, transparent 70%);
          filter: blur(60px); pointer-events: none;
        }
        .qb-reveal-inner { position: relative; z-index: 1; max-width: 1240px; margin: 0 auto; }
        .qb-reveal-versus {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 40px;
          margin: 54px 0 20px;
          padding: 46px 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.03);
        }
        .qb-rv-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8a857c; margin-bottom: 16px; }
        .qb-rv-num {
          font-family: var(--heading); font-weight: 800;
          font-size: clamp(56px, 9vw, 112px); line-height: 0.86;
          letter-spacing: -0.05em; font-variant-numeric: tabular-nums;
        }
        .qb-rv-num.pred { color: #ffffff; }
        .qb-rv-num.real { color: var(--accent); filter: drop-shadow(0 0 34px rgba(0, 82, 255, 0.5)); }
        .qb-rv-sub { margin-top: 14px; font-size: 13px; color: #9a958c; line-height: 1.5; }
        .qb-rv-eq {
          font-family: var(--heading); font-weight: 800;
          font-size: clamp(30px, 3.4vw, 44px); color: #4a4954; letter-spacing: -0.03em;
        }

        .qb-dark-panel {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          border-radius: 22px;
          padding: 32px;
          margin-top: 24px;
        }
        .qb-panel-label { font-family: var(--mono); font-size: 9px; color: var(--accent); letter-spacing: 0.16em; display: block; margin-bottom: 22px; }
        .qb-agg-foot { display: flex; gap: 26px; flex-wrap: wrap; margin-top: 12px; font-family: var(--mono); font-size: 11px; color: #9a958c; }
        .qb-agg-foot strong { color: #fff; }

        .qb-persona-list { display: flex; flex-direction: column; gap: 6px; }
        .qb-persona-row {
          display: grid; grid-template-columns: 150px 1fr 158px;
          align-items: center; gap: 16px; padding: 11px 12px; border-radius: 12px;
          transition: background 0.3s ease;
        }
        .qb-persona-row:hover { background: rgba(0, 82, 255, 0.1); }
        .qb-persona-name { display: flex; align-items: center; gap: 9px; }
        .qb-persona-name i { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .qb-persona-name span { font-family: var(--mono); font-size: 12px; color: #e8e2d9; font-weight: 600; }
        .qb-persona-track { position: relative; height: 9px; border-radius: 999px; background: rgba(255, 255, 255, 0.08); }
        .qb-persona-zero { position: absolute; top: -4px; bottom: -4px; width: 1px; background: rgba(255, 255, 255, 0.28); }
        .qb-persona-fill { position: absolute; top: 0; bottom: 0; border-radius: 999px; }
        .qb-persona-note { font-size: 11px; color: #9a958c; line-height: 1.5; margin-top: 8px; }
        .qb-persona-dec { text-align: right; }
        .qb-persona-dec b { font-family: var(--mono); font-size: 11px; color: #fff; font-weight: 700; display: block; }
        .qb-persona-dec span { font-family: var(--mono); font-size: 10px; color: #9a958c; }

        /* ── 7. RECEIPTS (table) ── */
        .qb-receipts-head {
          display: flex; align-items: flex-end; justify-content: space-between; gap: 30px;
          flex-wrap: wrap; margin-bottom: 44px;
        }
        .qb-score-badge {
          font-family: var(--heading); font-weight: 800;
          font-size: clamp(56px, 7vw, 92px); line-height: 0.86; letter-spacing: -0.05em;
          color: var(--accent); white-space: nowrap;
        }
        .qb-score-badge span { color: var(--muted); }
        .qb-table-shell { border: 1px solid var(--border); border-radius: 20px; overflow: hidden; background: rgba(255, 255, 255, 0.5); }
        .qb-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .qb-table th {
          text-align: left; font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--accent); padding: 18px 20px; border-bottom: 1px solid var(--border);
          background: rgba(0, 82, 255, 0.03);
        }
        .qb-table td { padding: 20px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: top; line-height: 1.55; }
        .qb-table tbody tr:last-child td { border-bottom: none; }
        .qb-table tbody tr { transition: background 0.25s ease; }
        .qb-table tbody tr:hover { background: rgba(0, 82, 255, 0.045); }
        .qb-metric { font-family: var(--mono); font-size: 11.5px; color: var(--bright); font-weight: 700; }
        .qb-metric.strong { border-left: 4px solid var(--accent); padding-left: 16px; }
        .qb-metric.moderate { border-left: 2px solid rgba(0, 82, 255, 0.4); padding-left: 18px; }
        .qb-check { color: var(--support); font-family: var(--mono); font-size: 12px; font-weight: 700; }

        /* ── 8. MECHANISM (why) ── */
        .qb-mech-list { display: flex; flex-direction: column; gap: 0; }
        .qb-mech-row {
          display: grid; grid-template-columns: 88px 1fr; gap: 34px;
          padding: 40px 0; border-top: 1px solid var(--border);
        }
        .qb-mech-row:first-child { border-top: none; }
        .qb-mech-n { font-family: var(--heading); font-weight: 800; font-size: 46px; line-height: 1; letter-spacing: -0.04em; color: var(--accent); opacity: 0.85; }
        .qb-mech-chip {
          display: inline-block; font-family: var(--mono); font-size: 12px;
          color: var(--accent); background: rgba(0, 82, 255, 0.06);
          border: 1px solid rgba(0, 82, 255, 0.14); border-radius: 8px;
          padding: 6px 12px; margin-bottom: 16px;
        }
        .qb-mech-title { font-family: var(--heading); font-size: clamp(18px, 2.2vw, 24px); font-weight: 700; color: var(--bright); margin-bottom: 12px; letter-spacing: -0.02em; }
        .qb-mech-desc { font-size: 14.5px; color: var(--muted); line-height: 1.8; max-width: 62ch; }

        /* ── 9. COUNTERFACTUAL ── */
        .qb-cf-head { display: grid; grid-template-columns: 1.4fr 1fr; gap: 50px; align-items: center; margin-bottom: 52px; }
        .qb-cf-callout {
          border: 1px solid var(--border); border-radius: 22px;
          background: rgba(0, 82, 255, 0.03); padding: 34px;
        }
        .qb-cf-callout-num {
          font-family: var(--heading); font-weight: 800; font-size: clamp(44px, 5.4vw, 66px);
          line-height: 0.9; letter-spacing: -0.045em; color: var(--accent);
        }
        .qb-cf-callout-cap { margin-top: 14px; font-size: 13.5px; color: var(--muted); line-height: 1.6; }
        .qb-cf-grid { display: flex; flex-direction: column; gap: 12px; }
        .qb-cf-row {
          display: grid; grid-template-columns: 210px 1fr 2.2fr; gap: 24px; align-items: center;
          padding: 22px 26px; border: 1px solid var(--border); border-radius: 16px;
          background: rgba(255, 255, 255, 0.5);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s ease, box-shadow 0.35s ease;
        }
        .qb-cf-row:hover { transform: translateX(6px); border-color: rgba(0, 82, 255, 0.26); box-shadow: 0 16px 44px rgba(0, 82, 255, 0.08); }
        .qb-cf-param { font-family: var(--mono); font-size: 12.5px; color: var(--bright); font-weight: 700; }
        .qb-cf-pills { display: flex; align-items: center; gap: 9px; }
        .qb-pill { display: inline-flex; align-items: center; padding: 5px 13px; border-radius: 999px; font-family: var(--mono); font-size: 12px; white-space: nowrap; }
        .qb-pill-from { background: rgba(98, 101, 117, 0.1); border: 1px solid rgba(98, 101, 117, 0.24); color: var(--muted); text-decoration: line-through; text-decoration-color: rgba(98,101,117,0.5); }
        .qb-pill-to { background: rgba(0, 82, 255, 0.09); border: 1px solid rgba(0, 82, 255, 0.32); color: var(--accent); font-weight: 700; }
        .qb-cf-arrow { color: var(--accent); font-size: 13px; opacity: 0.75; }
        .qb-cf-change { font-size: 13.5px; color: var(--muted); line-height: 1.62; }

        /* ── 10. QUOTE ── */
        .qb-quote-sec { padding: clamp(88px, 12vw, 140px) 4vw; border-top: 1px solid var(--border); text-align: center; position: relative; }
        .qb-quote-mark {
          font-family: Georgia, serif; font-size: 200px; line-height: 1;
          color: var(--accent); opacity: 0.07; position: absolute; top: 40px; left: 50%;
          transform: translateX(-50%); user-select: none; pointer-events: none;
        }
        .qb-quote {
          max-width: 940px; margin: 0 auto 32px; position: relative;
          font-family: var(--heading); font-weight: 700;
          font-size: clamp(28px, 4vw, 52px); line-height: 1.22;
          letter-spacing: -0.03em; color: var(--bright);
        }
        .qb-quote-by { font-family: var(--mono); font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: var(--accent); }

        /* ── 11. CTA ── */
        .qb-cta {
          padding: clamp(96px, 13vw, 150px) 4vw;
          background: radial-gradient(ellipse at 50% 0%, rgba(0, 82, 255, 0.1) 0%, transparent 58%), var(--bg-darker);
          border-top: 1px solid var(--border);
          text-align: center;
          position: relative;
        }
        .qb-cta::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 82, 255, 0.55), transparent);
        }
        .qb-cta-eyebrow { font-family: var(--mono); font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); }
        .qb-cta-title {
          font-family: var(--heading); font-weight: 800;
          font-size: clamp(36px, 5.4vw, 74px); line-height: 1.0; letter-spacing: -0.045em;
          color: var(--bright); margin: 22px 0;
        }
        .qb-cta-title .accent { color: var(--accent); }
        .qb-cta-sub { color: var(--muted); font-size: 17px; line-height: 1.65; max-width: 560px; margin: 0 auto 44px; }
        .qb-cta-row { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .qb-cta-ghost {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          height: 54px; padding: 0 30px; font-family: var(--sans); font-size: 13px; font-weight: 600;
          letter-spacing: 0.02em; text-transform: uppercase; text-decoration: none; border-radius: 999px;
          color: var(--text); border: 1px solid var(--border); background: rgba(255, 255, 255, 0.55);
          transition: color 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }
        .qb-cta-ghost:hover { color: var(--bright); border-color: var(--accent); background: rgba(0, 82, 255, 0.05); }

        /* ── References ── */
        .qb-refs { padding: 56px 4vw 100px; max-width: 1000px; margin: 0 auto; }
        .qb-refs-label { font-family: var(--mono); font-size: 9px; color: var(--accent); letter-spacing: 0.16em; display: block; margin-bottom: 18px; }
        .qb-refs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 40px; font-size: 11.5px; color: var(--muted); font-family: var(--mono); line-height: 2; }

        /* Network graph panel (hero): AgentNetworkGraph is a separate component,
           so every selector below targeting its output must be :global(). */
        :global(.qb-net-outer) {
          padding: 8px;
          border-radius: 30px;
          background: linear-gradient(160deg, rgba(0, 82, 255, 0.1), rgba(0, 82, 255, 0.02));
          border: 1px solid rgba(0, 82, 255, 0.1);
          box-shadow: 0 40px 100px rgba(0, 82, 255, 0.12);
        }
        :global(.qb-net-core) {
          position: relative;
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.7);
          border-radius: 24px;
          padding: 22px 22px 18px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s ease;
          overflow: hidden;
        }
        :global(.qb-net-outer:hover .qb-net-core) { transform: translateY(-6px); border-color: rgba(0, 82, 255, 0.3); }
        :global(.qb-net-head) { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
        :global(.qb-net-title) { font-family: var(--heading); font-size: 14px; font-weight: 700; letter-spacing: -0.01em; color: var(--bright); }
        :global(.qb-net-n) { font-family: var(--mono); font-size: 10px; color: var(--accent); letter-spacing: 0.06em; }
        :global(.qb-net-svg) {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 16px;
          background:
            radial-gradient(ellipse 70% 60% at 22% 68%, rgba(255, 68, 68, 0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 76% 24%, rgba(240, 180, 41, 0.08) 0%, transparent 62%),
            radial-gradient(ellipse 45% 40% at 82% 82%, rgba(0, 82, 255, 0.09) 0%, transparent 62%),
            var(--bg-darker);
        }
        :global(.qb-net-node) {
          animation: qbNodeDrift 5.5s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        @keyframes qbNodeDrift {
          0%, 100% { opacity: 0.82; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.12); }
        }
        :global(.qb-hub-node) {
          animation: qbNodePulse 2.6s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        @keyframes qbNodePulse {
          0%, 100% { opacity: 0.88; filter: drop-shadow(0 0 0px currentColor); }
          50% { opacity: 1; filter: drop-shadow(0 0 6px currentColor); }
        }
        :global(.qb-hub-edge) { animation: qbEdgeFlow 3.2s linear infinite; }
        @keyframes qbEdgeFlow { to { stroke-dashoffset: -18; } }
        @media (prefers-reduced-motion: reduce) {
          :global(.qb-hub-node), :global(.qb-net-node), :global(.qb-hub-edge) { animation: none; }
        }
        :global(.qb-net-stats) {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        :global(.qb-net-stat) {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid var(--border);
        }
        :global(.qb-net-stat i) { width: 8px; height: 8px; border-radius: 50%; display: block; margin-bottom: 2px; }
        :global(.qb-net-stat b) { font-family: var(--heading); font-size: 20px; font-weight: 800; letter-spacing: -0.03em; color: var(--bright); line-height: 1; }
        :global(.qb-net-stat span) { font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
        :global(.qb-net-caption) { margin-top: 16px; padding: 0 4px; font-size: 11px; color: var(--muted); line-height: 1.6; }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .qb-hero-grid { grid-template-columns: 1fr; gap: 44px; }
          :global(.qb-net-outer) { max-width: 460px; }
          .qb-score-grid { grid-template-columns: 1fr 1fr; }
          .qb-score-cell:nth-child(3), .qb-score-cell:nth-child(4) { border-top: 1px solid rgba(255,255,255,0.08); }
          .qb-score-cell:nth-child(3) { border-left: none; }
          .qb-setup-grid { grid-template-columns: 1fr; gap: 40px; }
          .qb-timeline-grid { grid-template-columns: repeat(3, 1fr); row-gap: 40px; }
          .qb-flaws-grid { grid-template-columns: 1fr; }
          .qb-mech-split { grid-template-columns: 1fr; gap: 44px; }
          .qb-reveal-versus { grid-template-columns: 1fr; gap: 24px; text-align: center; padding: 40px 30px; }
          .qb-rv-eq { transform: rotate(90deg); }
          .qb-cf-head { grid-template-columns: 1fr; gap: 32px; }
          .qb-cf-row { grid-template-columns: 1fr; gap: 12px; }
          .qb-persona-row { grid-template-columns: 130px 1fr 140px; }
        }
        @media (max-width: 768px) {
          .qb-hero-shell { min-height: auto; padding: 120px 5vw 70px; }
          .qb-hero-title { font-size: clamp(46px, 15vw, 76px); }
          .qb-score-grid { grid-template-columns: 1fr; }
          .qb-score-cell { border-left: none !important; border-top: 1px solid rgba(255,255,255,0.08); padding: 40px 26px; }
          .qb-score-cell:first-child { border-top: none; }
          .qb-param-grid { grid-template-columns: 1fr; }
          .qb-timeline-grid { grid-template-columns: 1fr 1fr; }
          .qb-timeline-line { display: none; }
          .qb-mech-row { grid-template-columns: 1fr; gap: 14px; }
          .qb-persona-row { grid-template-columns: 1fr; gap: 6px; }
          .qb-table { font-size: 12px; }
          .qb-table th, .qb-table td { padding: 13px; }
          .qb-scrollcue { display: none; }
        }
        @media (max-width: 480px) {
          .qb-timeline-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── 1. HERO ── */}
      <section className="qb-hero-shell">
        <Squares direction="diagonal" speed={0.25} squareSize={40} borderColor="rgba(0, 82, 255, 0.03)" hoverFillColor="rgba(0, 82, 255, 0.06)" />
        <div style={{ position: "absolute", top: "0%", right: "-8%", width: "38vw", height: "38vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 82, 255, 0.1) 0%, rgba(0, 82, 255, 0.03) 40%, transparent 72%)", filter: "blur(90px)", pointerEvents: "none" }} />

        <div className="qb-hero-grid">
          <div>
            <span className="qb-hero-eyebrow">Case Study / Retrospective Validation</span>
            <h1 className="qb-hero-title">
              $1.75B in.
              <span className="l2">500K out.</span>
            </h1>
            <p className="qb-hero-deck">
              Quibi is the cleanest product failure in modern streaming: fully funded, professionally run,
              dead in six months. We ran its real launch parameters through the notaprompt.in engine, cold,
              with <Hi>zero outcome data</Hi>. This is what it saw coming.
            </p>
            <div className="qb-hero-badges">
              <span className="qb-badge">NO HINDSIGHT FED IN</span>
              <span className="qb-badge">REAL LAUNCH PARAMETERS</span>
              <span className="qb-badge">MECHANISM-LEVEL</span>
            </div>
          </div>
          <AgentNetworkGraph />
        </div>

        <div className="qb-scrollcue" aria-hidden="true">
          Scroll
          <span />
        </div>
      </section>

      {/* ── 2. SCOREBOARD BAND ── */}
      <section className="qb-scoreboard">
        <div className="qb-score-grid">
          {SCOREBOARD.map((s) => (
            <div key={s.label} className={`qb-score-cell${s.emphasis ? " emph" : ""}`}>
              <div className="qb-score-label">{s.label}</div>
              <div className="qb-score-num">{s.value}</div>
              <div className="qb-score-note">{s.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. SETUP ── */}
      <section className="qb-section">
        <div className="qb-wrap">
          <div className="qb-setup-grid">
            <div className="reveal">
              <Kicker n="01" label="The Setup" />
              <h2 className="qb-h2">
                Fully funded. Professionally run. <Hi>Failed anyway.</Hi>
              </h2>
              <p className="qb-setup-body" style={{ marginTop: 24 }}>
                <span className="lg">Quibi (&ldquo;quick bites&rdquo;) was a mobile-only, short-form streaming service,</span>{" "}
                7&ndash;10 minute episodes for on-the-go viewing. Founded by ex-Disney chairman Jeffrey Katzenberg,
                led by ex-eBay CEO Meg Whitman, backed with $1.75B from Disney, Sony, WarnerMedia, Goldman Sachs and
                Alibaba before a single subscriber signed up. <Source>Wikipedia</Source> Not a startup swinging blind,
                a professionally-run, fully-capitalized bet that still launched April 6, 2020 and announced shutdown
                exactly six months later. The library sold to Roku for under $100M, against ~$500M in production spend.{" "}
                <Source>CNBC</Source> <Source>Deadline</Source>
              </p>
            </div>

            <div className="qb-burn reveal" style={{ transitionDelay: "120ms" }}>
              <div className="qb-burn-num">~$1.4B</div>
              <div className="qb-burn-cap">burned in six months, roughly <strong style={{ color: "var(--bright)" }}>$233M a month</strong> across content, marketing and tech.</div>
              <div className="qb-burn-rule" />
              <div className="qb-burn-num"><em>63</em> days</div>
              <div className="qb-burn-cap">from &ldquo;we&apos;re shutting down&rdquo; back to the ~910K who signed up in the first 72 hours and mostly left.</div>
            </div>
          </div>

          <div className="qb-timeline-grid reveal">
            <div className="qb-timeline-line" />
            {TIMELINE.map((m, i) => (
              <div key={m.title} className="qb-timeline-item" style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="qb-tl-dot"><i /></div>
                <span className="qb-tl-date">{m.date}</span>
                <h3 className="qb-tl-title">{m.title}</h3>
                <p className="qb-tl-desc">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. AUTOPSY ── */}
      <section className="qb-section tint">
        <div className="qb-wrap">
          <div className="qb-section-head reveal">
            <Kicker n="02" label="What The Market Already Knew" />
            <h2 className="qb-h2">Eight flaws. <Hi>Zero hindsight required.</Hi></h2>
            <p className="qb-lead">
              None of these are retrospective. Every one was visible pre-launch or in the first weeks, and none
              required predicting a pandemic to see.
            </p>
          </div>
          <div className="qb-flaws-grid">
            {FLAWS.map((f, i) => (
              <div key={f.title} className="qb-flaw-card reveal" style={{ transitionDelay: `${(i % 2) * 90}ms` }}>
                <span className="qb-flaw-idx">{String(i + 1).padStart(2, "0")}</span>
                <span className="qb-flaw-tag">{f.tag}</span>
                <h3 className="qb-flaw-title">{f.title}</h3>
                <p className="qb-flaw-desc">{f.desc}</p>
                <Source>{f.source}</Source>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. MECHANICS ── */}
      <section className="qb-section">
        <div className="qb-wrap">
          <div className="qb-section-head reveal" style={{ maxWidth: 800 }}>
            <Kicker n="03" label="How We Fed It Into The Engine" />
            <h2 className="qb-h2">A utility function, <Hi>not a vibe check.</Hi></h2>
            <p className="qb-lead">
              Every agent evaluates the decision through the same function. Personas aren&apos;t assigned: they emerge
              bottom-up from eight empirically grounded trait distributions (risk &amp; loss aversion, social conformity,
              collectivism, institutional trust, status-quo bias, budget sensitivity, information processing), each
              calibrated against published behavioral research (Barsky 1997; Tversky &amp; Kahneman 1992; Hofstede WVS; Cialdini).
            </p>
          </div>

          <div className="qb-editor reveal">
            <div className="qb-editor-bar">
              <i style={{ background: "#ff5f57" }} />
              <i style={{ background: "#febc2e" }} />
              <i style={{ background: "#28c840" }} />
              <span className="qb-editor-file">simulation_v3.py / compute_utility()</span>
            </div>
            <div className="qb-editor-body">
              <div className="qb-editor-comment"># the single equation every one of the 200 agents runs each step</div>
              <div className="qb-editor-eq">
                U&nbsp;=&nbsp;&alpha;<sub>eff</sub>&middot;trust_adjusted_value&nbsp;&minus;&nbsp;&beta;<sub>eff</sub>&middot;risk_exposure
                &nbsp;&minus;&nbsp;&lambda;&middot;loss_aversion&middot;perceived_loss&nbsp;+&nbsp;&gamma;<sub>eff</sub>&middot;social_signal
              </div>
              <div className="qb-editor-sub">
                trust_adjusted_value = value_delta &times; (0.4 + 0.6 &times; institutional_trust)
                <br />
                effective_social_weight = social_conformity &times; (1.0 + collectivism &times; 0.3)
                <br />
                stance_new = (1 &minus; dampening) &times; tanh(U) + dampening &times; stance_old
              </div>
            </div>
          </div>

          <div className="qb-mech-split">
            <div className="reveal">
              <h3 className="qb-trans-title">Quibi&apos;s constraints → parameters</h3>
              <p className="qb-trans-lead">
                We didn&apos;t hand-tune numbers to force a failure. Each parameter is a direct translation of a documented,
                real-world constraint: the same translation an analyst would do for any product before launch.
              </p>
              {[
                { label: "No sharing / screenshots disabled", text: "effective_social_weight collapses to 0.05–0.10 for non-Influencers: the peer-cascade mechanism has no channel to run through." },
                { label: "90-day trial, hard paywall, no free tier", text: "perceived_loss ≈ 0.50, risk_exposure ≈ 0.65: paying for an unproven habit feels like a loss users can dodge by not converting." },
                { label: "Mobile-only during household lockdown", text: "risk_exposure compounds: the product is built for a context (commuting) that temporarily doesn't exist." },
                { label: "No creator seeding, mass-ad launch", text: "no seed personas: all 200 agents start near-zero stance. The cascade needs a spark; Quibi provided none." },
                { label: "New platform vs. free incumbents", text: "institutional_trust floor lowered to 0.25: even trusting agents credit only ~73% of the stated value." },
              ].map((r) => (
                <div key={r.label} className="qb-trans-item">
                  <span className="qb-trans-arrow">&rarr;</span>
                  <p><strong>{r.label}.</strong> {r.text}</p>
                </div>
              ))}
            </div>

            <div className="qb-param-card reveal" style={{ transitionDelay: "120ms" }}>
              <span className="qb-param-tag">SCENARIO_PARAMETERS</span>
              <div className="qb-param-grid">
                {[
                  ["value_delta", "≈ 0.35"],
                  ["risk_exposure", "≈ 0.65"],
                  ["perceived_loss", "≈ 0.50"],
                  ["trust_floor", "0.25"],
                  ["social_weight", "0.05–0.10"],
                  ["seed_personas", "none"],
                  ["network", "WS · n=200 · k=8"],
                  ["run length", "30–60 steps"],
                ].map(([k, v]) => (
                  <div key={k} className="qb-param-row">
                    <span className="qb-param-k">{k}</span>
                    <span className="qb-param-v">{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                <span className="qb-param-tag" style={{ marginBottom: 12 }}>PERSONAS IN POPULATION</span>
                <div className="qb-persona-chips">
                  {PERSONAS.map((p) => (
                    <span key={p.name} className="qb-persona-chip">
                      <i style={{ background: p.color }} />
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. THE REVEAL ── */}
      <section className="qb-reveal-sec">
        <div className="qb-reveal-inner">
          <div className="reveal" style={{ maxWidth: 760 }}>
            <Kicker n="04" label="What The Model Structurally Predicted" />
            <h2 className="qb-h2">Opposition wins, <Hi solid>structurally, not by chance.</Hi></h2>
            <p className="qb-lead">
              These are directional ranges from applying Quibi&apos;s real constraints to the engine&apos;s formulas,
              not a single logged run we&apos;re citing as fact. We show the range honestly, then line it up against
              what actually happened.
            </p>
          </div>

          <div className="qb-reveal-versus reveal">
            <div>
              <div className="qb-rv-label">Model predicted adoption</div>
              <div className="qb-rv-num pred">5–10%</div>
              <div className="qb-rv-sub">of the population ever reaches a support stance</div>
            </div>
            <div className="qb-rv-eq">≈</div>
            <div>
              <div className="qb-rv-label">Quibi actually delivered</div>
              <div className="qb-rv-num real">6.8%</div>
              <div className="qb-rv-sub">of the 7.4M year-one target (~500K subs)</div>
            </div>
          </div>

          <div className="qb-dark-panel reveal">
            <span className="qb-panel-label">AGGREGATE DISTRIBUTION · STEP 30–60 · DIRECTIONAL RANGE</span>
            <div style={{ width: "100%", height: 130 }}>
              <ResponsiveContainer>
                <BarChart data={AGGREGATE} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }} barCategoryGap={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                  <XAxis type="number" domain={[0, 70]} tick={{ fill: "#9a958c", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} unit="%" />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#e8e2d9", fontSize: 12, fontFamily: "var(--mono)" }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} width={70} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    formatter={(_value: unknown, _n: unknown, entry: { payload?: { range?: string } }) => [entry?.payload?.range ?? "", "Predicted range"]}
                    contentStyle={{ background: "#141419", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontFamily: "var(--mono)", fontSize: 11, color: "#e8e2d9" }}
                  />
                  <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                    {AGGREGATE.map((a) => (
                      <Cell key={a.name} fill={a.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="qb-agg-foot">
              <span>Consensus: <strong style={{ color: "var(--oppose)" }}>−0.30 to −0.50</strong></span>
              <span>Support: <strong>~5–10%</strong></span>
              <span>Oppose: <strong>50–65%</strong></span>
            </div>
          </div>

          <div className="qb-dark-panel reveal">
            <span className="qb-panel-label">PERSONA-LEVEL DIRECTIONAL STANCE · RANGE ON −1 … +1</span>
            <div className="qb-persona-list">
              {PERSONAS.map((p) => {
                const left = posPct(p.stanceMin);
                const width = posPct(p.stanceMax) - left;
                return (
                  <div key={p.name} className="qb-persona-row">
                    <div className="qb-persona-name">
                      <i style={{ background: p.color }} />
                      <span>{p.name}</span>
                    </div>
                    <div>
                      <div className="qb-persona-track">
                        <div className="qb-persona-zero" style={{ left: `${posPct(0)}%` }} />
                        <div className="qb-persona-fill" style={{ left: `${left}%`, width: `${width}%`, background: p.color, opacity: 0.8 }} />
                      </div>
                      <p className="qb-persona-note">{p.note}</p>
                    </div>
                    <div className="qb-persona-dec">
                      <b>{p.decision}</b>
                      <span>n &asymp; {p.nRange}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. RECEIPTS ── */}
      <section className="qb-section">
        <div className="qb-wrap" style={{ maxWidth: 1180 }}>
          <div className="qb-receipts-head reveal">
            <div>
              <Kicker n="05" label="Reality Check" />
              <h2 className="qb-h2">The model matched, <Hi>every row.</Hi></h2>
            </div>
            <div className="qb-score-badge">5<span>/5</span></div>
          </div>
          <div className="qb-table-shell reveal">
            <table className="qb-table">
              <thead>
                <tr>
                  <th style={{ width: "22%" }}>Metric</th>
                  <th style={{ width: "36%" }}>Model&apos;s directional prediction</th>
                  <th style={{ width: "32%" }}>Quibi&apos;s actual outcome</th>
                  <th style={{ width: "10%" }}>Match</th>
                </tr>
              </thead>
              <tbody>
                {REALITY_ROWS.map((r) => (
                  <tr key={r.metric}>
                    <td><span className={`qb-metric ${r.strength}`}>{r.metric}</span></td>
                    <td>{r.model}</td>
                    <td>{r.actual}</td>
                    <td><span className="qb-check">MATCH</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginTop: 18, lineHeight: 1.7 }}>
            Directional ranges, not point estimates from a single logged run, derived from applying Quibi&apos;s documented
            launch constraints to the engine&apos;s formulas. <Source>Variety</Source> <Source>CNBC</Source>
          </p>
        </div>
      </section>

      {/* ── 8. MECHANISM ── */}
      <section className="qb-section tint">
        <div className="qb-wrap" style={{ maxWidth: 980 }}>
          <div className="qb-section-head reveal">
            <Kicker n="06" label="The Mechanism, Explained Simply" />
            <h2 className="qb-h2"><Hi>Loss aversion</Hi> did the heavy lifting.</h2>
          </div>
          <div className="qb-mech-list">
            {MECHANISMS.map((m, i) => (
              <div key={m.n} className="qb-mech-row reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="qb-mech-n">{m.n}</div>
                <div>
                  <span className="qb-mech-chip">{m.chip}</span>
                  <h3 className="qb-mech-title">{m.title}</h3>
                  <p className="qb-mech-desc">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. COUNTERFACTUAL ── */}
      <section className="qb-section">
        <div className="qb-wrap" style={{ maxWidth: 1180 }}>
          <div className="qb-cf-head reveal">
            <div>
              <Kicker n="07" label="What Would Have Had To Change" />
              <h2 className="qb-h2">Five levers. <Hi>Quibi pulled none.</Hi></h2>
            </div>
            <div className="qb-cf-callout">
              <div className="qb-cf-callout-num">30–40%</div>
              <div className="qb-cf-callout-cap">
                Flip these five parameters to a different set of launch decisions and the model&apos;s output moves
                from opposition-dominant to a projected 30–40% adoption with positive consensus.
              </div>
            </div>
          </div>
          <div className="qb-cf-grid">
            {COUNTERFACTUALS.map((c, i) => (
              <div key={c.param} className="qb-cf-row reveal" style={{ transitionDelay: `${i * 55}ms` }}>
                <span className="qb-cf-param">{c.param}</span>
                <span className="qb-cf-pills">
                  <span className="qb-pill qb-pill-from">{c.from}</span>
                  <span className="qb-cf-arrow">&rarr;</span>
                  <span className="qb-pill qb-pill-to">{c.to}</span>
                </span>
                <span className="qb-cf-change">{c.change}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. QUOTE ── */}
      <section className="qb-quote-sec">
        <span className="qb-quote-mark" aria-hidden="true">&ldquo;</span>
        <blockquote className="qb-quote reveal">
          We asked people to pay for it <Hi>before they understood what it was.</Hi>
        </blockquote>
        <p style={{ maxWidth: 620, margin: "0 auto 26px", color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          &ldquo;I think we thought there would be easier adoption by people to it.&rdquo; The engine priced that
          gap in before launch, as a loss term, not a marketing problem.
        </p>
        <span className="qb-quote-by">JEFFREY KATZENBERG · CO-FOUNDER · OCT 2020</span>
        <div style={{ marginTop: 10 }}><Source>CNBC</Source></div>
      </section>

      {/* ── 11. CTA ── */}
      <div className="qb-cta">
        <span className="qb-cta-eyebrow">You already know how this one ends</span>
        <h2 className="qb-cta-title">
          Now run the one
          <br />
          <span className="accent">you don&apos;t.</span>
        </h2>
        <p className="qb-cta-sub">
          Feed in your real launch parameters: pricing, platform, discovery, seeding, and see where the utility
          mechanics land before you spend the budget.
        </p>
        <div className="qb-cta-row">
          <Link href="/register" className="btn-hero-primary">RUN YOUR OWN SIMULATION &rarr;</Link>
          <Link href="/contact" className="qb-cta-ghost">TALK TO THE TEAM</Link>
        </div>
      </div>

      {/* ── References ── */}
      <section className="qb-refs">
        <span className="qb-refs-label">[ REFERENCES ]</span>
        <div className="qb-refs-grid">
          {REFERENCES.map((r) => (
            <span key={r}>{r}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
