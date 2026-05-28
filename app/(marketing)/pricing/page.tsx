"use client";

import React, { useState } from "react";
import Link from "next/link";

const TIERS = [
  {
    id: "explorer",
    tag: "[UNIT_ZERO]",
    name: "Explorer",
    price: { monthly: 0, annual: 0 },
    description: "Understand how populations behave before using it for real decisions.",
    features: [
      { text: "Up to 100 agents / simulation", included: true },
      { text: "1 active scenario", included: true },
      { text: "5–10 simulation runs / day", included: true },
      { text: "Basic behavior model", included: true },
      { text: "Editable parameters", included: false },
      { text: "CSV export", included: false },
      { text: "API access", included: false },
    ],
    cta: "GET_STARTED",
    link: "/register",
    featured: false,
  },
  {
    id: "research",
    tag: "[UNIT_ALPHA]",
    name: "Research",
    price: { monthly: 199, annual: 159 },
    description: "Move from intuition to structured experimentation.",
    features: [
      { text: "Up to 500 agents / simulation", included: true },
      { text: "3 parallel scenarios", included: true },
      { text: "Unlimited runs / day", included: true },
      { text: "Editable behavioral parameters", included: true },
      { text: "Standard network models", included: true },
      { text: "CSV export", included: true },
      { text: "API access", included: false },
    ],
    cta: "SELECT_PLAN",
    link: "/register",
    featured: false,
  },
  {
    id: "strategic",
    tag: "[UNIT_SIGMA]",
    name: "Strategic",
    price: { monthly: 999, annual: 799 },
    description: "Test decisions before committing in the real world.",
    features: [
      { text: "Up to 5,000 agents", included: true },
      { text: "Unlimited scenarios", included: true },
      { text: "Unlimited runs / day", included: true },
      { text: "Advanced priors & custom weighting", included: true },
      { text: "Complex social graphs", included: true },
      { text: "API access + CSV export", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "SELECT_PLAN",
    link: "/register",
    featured: true,
  },
  {
    id: "agency",
    tag: "[UNIT_OMEGA]",
    name: "Enterprise",
    price: { monthly: "Custom", annual: "Custom" },
    description: "For organizations making high-stakes, large-scale decisions.",
    features: [
      { text: "Unlimited agents", included: true },
      { text: "Custom population modeling", included: true },
      { text: "Real-world data integration", included: true },
      { text: "Dedicated compute cluster", included: true },
      { text: "White-labeled reports", included: true },
      { text: "Strategic advisory", included: true },
      { text: "SSO + SLA guarantee", included: true },
    ],
    cta: "CONTACT_US",
    link: "/contact",
    featured: false,
  },
];

const COMPARISON_ROWS = [
  { feature: "Max agents per simulation", vals: ["100", "500", "5,000", "Unlimited"] },
  { feature: "Parallel scenarios", vals: ["1", "3", "Unlimited", "Unlimited"] },
  { feature: "Simulation runs / day", vals: ["5–10", "Unlimited", "Unlimited", "Unlimited"] },
  { feature: "Editable parameters", vals: [false, true, true, true] },
  { feature: "Complex network models", vals: [false, "Standard", true, true] },
  { feature: "CSV export", vals: [false, true, true, true] },
  { feature: "API access", vals: [false, false, true, true] },
  { feature: "White-labeled reports", vals: [false, false, false, true] },
  { feature: "SSO + SLA", vals: [false, false, false, true] },
];

const FAQS = [
  {
    q: "HOW ARE AGENTS GENERATED?",
    a: "Agents are synthesized from 1,499 real-world respondents from the General Social Survey (GSS) 2024. We inject these behavioral vectors into LLM persona bridges to create hyper-realistic decision-making avatars.",
  },
  {
    q: "CAN I UPGRADE MY PLAN LATER?",
    a: "Yes. All subscriptions can be upgraded instantly from your dashboard. Moving from Explorer to Strategic unlocks historical data analysis and API access immediately.",
  },
  {
    q: "WHAT IS THE TRINITY ENGINE?",
    a: "The Trinity Engine is our proprietary calculation layer that balances Prospect Theory, Social Contagion networks, and LLM-based reasoning to predict non-linear adoption tipping points.",
  },
  {
    q: "DO YOU OFFER VOLUME DISCOUNTS?",
    a: "For organizations running >10,000 parallel agents, we offer dedicated high-performance clusters. Contact our technical advisory team for custom quotes.",
  },
  {
    q: "HOW DOES BILLING WORK?",
    a: "Monthly plans are charged month-to-month with no commitment. Annual plans are billed upfront and include a 20% discount. Enterprise plans are custom-quoted and invoiced.",
  },
  {
    q: "IS MY DATA SECURE?",
    a: "All simulation inputs and outputs are encrypted at rest (AES-256) and in transit (TLS 1.3). We do not use your data to train our models. Enterprise plans include SOC 2 documentation.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? " faq-open" : ""}`}>
      <button className="faq-trigger" onClick={() => setOpen((o) => !o)}>
        <span className="faq-trigger-q">{q}</span>
        <span className="faq-chevron">▾</span>
      </button>
      <div className="faq-body">
        <p>{a}</p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", paddingBottom: 120 }}>
      {/* ── Hero ── */}
      <section
        style={{
          textAlign: "center",
          padding: "160px 4vw 80px",
          position: "relative",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255,107,53,0.08) 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,107,53,0.4), transparent)",
          }}
        />
        <span className="mkt-eyebrow">[COMMERCIAL_MODELS_v3.0]</span>
        <h1
          className="hero-h1"
          style={{ marginTop: 20, textAlign: "center" }}
        >
          Priced for <span className="accent">Strategy.</span>
        </h1>
        <p className="mkt-sub" style={{ marginTop: 20 }}>
          Move from static focus groups to dynamic population simulations.
          Select the plan that matches your strategic scale.
        </p>

        {/* Toggle */}
        <div
          style={{
            display: "inline-flex",
            background: "var(--bg-darker)",
            padding: "4px",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            marginTop: 40,
            marginBottom: 80,
            gap: 4,
          }}
        >
          {["MONTHLY", "ANNUAL (SAVE 20%)"].map((label, i) => {
            const active = i === 1 ? isAnnual : !isAnnual;
            return (
              <button
                key={label}
                onClick={() => setIsAnnual(i === 1)}
                style={{
                  padding: "10px 24px",
                  background: active ? "var(--dim)" : "transparent",
                  color: active ? "var(--bright)" : "var(--muted)",
                  border: active ? "1px solid var(--border)" : "1px solid transparent",
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <div style={{ padding: "0 4vw 80px" }}>
        <div className="pricing-grid-new">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`pricing-card-new${tier.featured ? " featured" : ""}`}
            >
              {tier.featured && (
                <div className="pricing-featured-badge">MOST POPULAR</div>
              )}
              <span className="pricing-tier-tag">{tier.tag}</span>
              <div className="pricing-tier-name">{tier.name}</div>
              <p className="pricing-tier-desc">{tier.description}</p>

              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 0 }}>
                <span className="pricing-price">
                  {typeof tier.price.monthly === "number"
                    ? tier.price.monthly === 0
                      ? "FREE"
                      : `$${isAnnual ? tier.price.annual : tier.price.monthly}`
                    : tier.price.monthly}
                </span>
                {typeof tier.price.monthly === "number" &&
                  tier.price.monthly > 0 && (
                    <span className="pricing-price-period">/mo</span>
                  )}
              </div>

              <span className="pricing-annual-note">
                {isAnnual &&
                typeof tier.price.annual === "number" &&
                tier.price.annual > 0
                  ? `Billed $${(tier.price.annual as number) * 12} annually`
                  : " "}
              </span>

              <div className="pricing-divider" />

              <ul className="pricing-features-list">
                {tier.features.map((f, fi) => (
                  <li key={fi}>
                    <span className={f.included ? "p-check" : "p-dash"}>
                      {f.included ? "✓" : "–"}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              <Link
                href={tier.link}
                className={`pricing-cta-btn ${tier.featured ? "p-primary" : "p-ghost"}`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comparison Table ── */}
      <section className="mkt-section" style={{ paddingTop: 0 }}>
        <div className="mkt-section-header">
          <span className="mkt-eyebrow">[FEATURE_COMPARISON]</span>
          <h2 className="mkt-h2">Side by Side.</h2>
        </div>
        <div className="comparison-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>FEATURE</th>
                <th>EXPLORER</th>
                <th>RESEARCH</th>
                <th className="ct-hl">STRATEGIC</th>
                <th>ENTERPRISE</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, ri) => (
                <tr key={ri}>
                  <td className="ct-feature">{row.feature}</td>
                  {row.vals.map((v, vi) => (
                    <td key={vi}>
                      {v === true ? (
                        <span className="ct-check">✓</span>
                      ) : v === false ? (
                        <span className="ct-dash">–</span>
                      ) : (
                        <span>{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mkt-section" style={{ paddingTop: 0 }}>
        <div className="mkt-section-header">
          <span className="mkt-eyebrow">[FREQUENTLY_ASKED]</span>
          <h2 className="mkt-h2">System Specifications.</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ── Enterprise CTA ── */}
      <section style={{ padding: "0 4vw" }}>
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "80px",
            background: "var(--bg-darker)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "60px",
            alignItems: "center",
          }}
        >
          <div>
            <span className="mkt-eyebrow" style={{ textAlign: "left" }}>
              [BEYOND_SUBSCRIPTION]
            </span>
            <h2
              style={{
                fontFamily: "var(--heading)",
                fontSize: "clamp(28px, 3vw, 44px)",
                fontWeight: 800,
                color: "var(--bright)",
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
                margin: "16px 0 16px",
              }}
            >
              Project-Based
              <br />
              <span style={{ color: "var(--orange)" }}>Intelligence.</span>
            </h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "15px",
                lineHeight: 1.7,
                maxWidth: 520,
              }}
            >
              Don&apos;t have the time to build scenarios yourself? Lucide Tech offers
              project-based simulation services — scenario setup, parameter
              tuning, and insight generation handled end-to-end.
              Starting at $1k per project, $5k–$25k for enterprise-scale work.
            </p>
          </div>
          <Link href="/contact" className="btn-hero-primary" style={{ whiteSpace: "nowrap" }}>
            DISCUSS A PROJECT →
          </Link>
        </div>
      </section>
    </div>
  );
}
