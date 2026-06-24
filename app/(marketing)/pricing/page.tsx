"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Squares from "@/components/marketing/InteractiveBackground";

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
    price: { monthly: 49, annual: 39 },
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
    price: { monthly: 199, annual: 159 },
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
  const { isAuthenticated, user, refreshUser, joinWaitlist } = useAuth();
  const router = useRouter();

  const [isAnnual, setIsAnnual] = useState(true);
  
  // Checkout Modal State
  const [checkoutTier, setCheckoutTier] = useState<any | null>(null);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("042");
  
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Beta Tester Form State
  const [betaName, setBetaName] = useState("");
  const [betaEmail, setBetaEmail] = useState("");
  const [betaFocus, setBetaFocus] = useState("");
  const [betaUseCases, setBetaUseCases] = useState("academic_research");
  const [betaStatus, setBetaStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleCheckoutSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!checkoutTier || !user) return;
    
    setCheckoutStatus("processing");
    
    // Simulate secure 1.8s payment processing gateway handshake
    await new Promise((resolve) => setTimeout(resolve, 1800));

    try {
      // Direct Supabase Metadata Tier Upgrade
      const { error } = await supabase.auth.updateUser({
        data: { tier: checkoutTier.id }
      });

      if (error) throw error;

      // Sync local frontend session
      await refreshUser();
      
      setCheckoutStatus("success");
      
      // Auto-redirect to dashboard after success visualization
      setTimeout(() => {
        setCheckoutTier(null);
        setCheckoutStatus("idle");
        router.push("/dashboard");
      }, 2500);

    } catch (err: any) {
      setCheckoutStatus("error");
      setErrorMessage(err.message || "Failed to update node level authorization.");
    }
  };

  const handleBetaSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBetaStatus("submitting");

    try {
      // Persist the application to the shared beta_waitlist table so it shows
      // up in Supabase → Table Editor → beta_waitlist alongside /register signups.
      const [firstName, ...rest] = betaName.trim().split(" ");
      const { error } = await joinWaitlist(betaEmail, {
        first_name: firstName || betaName,
        last_name: rest.join(" "),
        role: betaUseCases,
        use_case: betaFocus,
        source: "pricing_beta",
      });

      if (error) {
        setBetaStatus("error");
        return;
      }

      // Courtesy: if a logged-in user applies, flag them as applied.
      if (user) {
        await supabase.auth.updateUser({
          data: { beta_status: "applied" }
        });
        await refreshUser();
      }
      setBetaStatus("success");
    } catch (err) {
      setBetaStatus("error");
    }
  };

  return (
    <div className="pricing-page" style={{ background: "var(--bg)", color: "var(--text)", paddingBottom: 120, position: "relative", overflowX: "hidden" }}>
      <style jsx>{`
        .pricing-hero-shell {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 140px 4vw 96px;
          overflow: hidden;
        }
        .pricing-hero-title {
          font-family: var(--heading);
          font-size: clamp(56px, 7vw, 94px);
          font-weight: 800;
          line-height: 0.94;
          letter-spacing: -0.05em;
          color: var(--bright);
          margin: 0;
        }
        .pricing-hero-title .accent {
          background: linear-gradient(135deg, var(--accent) 0%, #2a76ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .pricing-hero-copy {
          max-width: 650px;
          color: var(--muted);
          font-size: 18px;
          line-height: 1.7;
          margin: 0;
        }
        .pricing-panel {
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.58);
          backdrop-filter: blur(18px);
          border-radius: 24px;
          box-shadow: 0 28px 70px rgba(0, 82, 255, 0.06);
        }
        .pricing-mini-stat {
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.58);
          backdrop-filter: blur(18px);
          border-radius: 18px;
          padding: 18px 20px;
        }
        .pricing-hero-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
          gap: 56px;
          align-items: center;
        }
        .pricing-mini-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 34px;
        }
        .pricing-btn-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 34px;
        }
        .pricing-enterprise-layout {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 60px;
          align-items: center;
        }
        .pricing-beta-layout {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 60px;
          align-items: start;
        }
        .beta-top-banner:hover {
          border-color: rgba(0, 82, 255, 0.35);
          box-shadow: 0 12px 30px rgba(0, 82, 255, 0.08);
          transform: translateY(-1px);
        }
        @media (max-width: 700px) {
          .beta-top-banner {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 14px !important;
          }
        }
        @media (max-width: 1024px) {
          .pricing-hero-layout {
            grid-template-columns: 1fr;
          }
          .pricing-enterprise-layout {
            grid-template-columns: 1fr;
          }
          .pricing-enterprise-layout a {
            align-self: flex-start;
          }
        }
        @media (max-width: 768px) {
          .pricing-hero-shell {
            min-height: auto;
            padding: 100px 5vw 64px;
          }
          .pricing-hero-title {
            font-size: clamp(40px, 12vw, 64px);
          }
          .pricing-hero-copy {
            font-size: 16px;
          }
          .pricing-mini-stat-grid {
            grid-template-columns: 1fr 1fr;
          }
          .pricing-btn-row {
            flex-direction: column;
          }
          .pricing-beta-layout {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
        @media (max-width: 480px) {
          .pricing-hero-shell {
            padding: 90px 5vw 56px;
          }
          .pricing-hero-title {
            font-size: clamp(36px, 13vw, 56px);
          }
          .pricing-mini-stat-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <section className="pricing-hero-shell">
        <Squares direction="diagonal" speed={0.25} squareSize={40} borderColor="rgba(0, 82, 255, 0.03)" hoverFillColor="rgba(0, 82, 255, 0.06)" />
        <div style={{ position: "absolute", top: "8%", right: "-12%", width: "32vw", height: "32vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 82, 255, 0.08) 0%, rgba(0, 82, 255, 0.03) 40%, transparent 72%)", filter: "blur(84px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "42%", left: "-12%", width: "30vw", height: "30vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(255, 107, 53, 0.05) 0%, rgba(255, 107, 53, 0.02) 42%, transparent 72%)", filter: "blur(84px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1400, margin: "0 auto" }}>
          <div className="pricing-hero-layout">
            <div>
              <span className="mkt-eyebrow">[COMMERCIAL_MODELS_v3.0]</span>
              <h1 className="pricing-hero-title" style={{ marginTop: 18, maxWidth: 760 }}>
                Priced for
                <br />
                <span className="accent">Strategy.</span>
              </h1>
              <p className="pricing-hero-copy" style={{ marginTop: 26 }}>
                Move from static focus groups to dynamic population simulations.
                Select the plan that matches your strategic scale.
              </p>

              <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.55)", padding: 4, borderRadius: 999, border: "1px solid var(--border)", marginTop: 34, gap: 4 }}>
                {["MONTHLY", "ANNUAL (SAVE 20%)"].map((label, i) => {
                  const active = i === 1 ? isAnnual : !isAnnual;
                  return (
                    <button
                      key={label}
                      onClick={() => setIsAnnual(i === 1)}
                      style={{
                        padding: "10px 24px",
                        background: active ? "var(--panel)" : "transparent",
                        color: active ? "var(--bright)" : "var(--muted)",
                        boxShadow: active ? "0 2px 8px rgba(0, 82, 255, 0.08)" : "none",
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

              <div className="pricing-mini-stat-grid">
                {[
                  { label: "STARTER", value: "Explorer", note: "Free sandbox" },
                  { label: "BEST VALUE", value: "Strategic", note: "Popular scaling tier" },
                  { label: "ORG SCALE", value: "Enterprise", note: "Custom support and SLA" },
                ].map((item) => (
                  <div key={item.label} className="pricing-mini-stat">
                    <span className="mkt-eyebrow" style={{ marginBottom: 10 }}>{item.label}</span>
                    <div style={{ fontFamily: "var(--heading)", fontSize: "clamp(24px, 2vw, 34px)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--bright)", lineHeight: 1 }}>{item.value}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", color: "var(--accent)", marginTop: 8, textTransform: "uppercase" }}>{item.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pricing-panel" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span style={{ display: "inline-flex", alignItems: "center", padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(0, 82, 255, 0.12)", background: "rgba(0, 82, 255, 0.04)", color: "var(--accent)", fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em" }}>// PRICING_GRID</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.16em" }}>BILLING_VIEW // LIVE</span>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  ["EXPLORER", "Up to 100 agents, free to start"],
                  ["RESEARCH", "500 agents and advanced tuning"],
                  ["STRATEGIC", "5,000 agents with API access"],
                  ["ENTERPRISE", "Dedicated compute and advisory"],
                ].map(([title, desc], idx) => (
                  <div key={title} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "14px 16px", borderRadius: 16, border: "1px solid rgba(0, 82, 255, 0.08)", background: idx === 2 ? "rgba(0, 82, 255, 0.05)" : "rgba(255,255,255,0.45)" }}>
                    <div>
                      <div style={{ fontFamily: "var(--heading)", fontSize: 16, fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.03em" }}>{title}</div>
                      <div style={{ marginTop: 4, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{desc}</div>
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.16em", color: "var(--accent)", paddingTop: 2 }}>0{idx + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Private Beta banner (top of pricing) ── */}
      <div style={{ padding: "0 4vw 56px" }}>
        <a
          href="#beta-access"
          className="beta-top-banner"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            maxWidth: 1400,
            margin: "0 auto",
            padding: "20px 28px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(0,82,255,0.06) 0%, rgba(0,82,255,0.02) 100%)",
            border: "1px solid rgba(0, 82, 255, 0.18)",
            textDecoration: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "7px 14px",
            borderRadius: "999px",
            background: "rgba(0, 82, 255, 0.08)",
            border: "1px solid rgba(0, 82, 255, 0.22)",
            fontFamily: "var(--mono)",
            fontSize: "10.5px",
            letterSpacing: "0.16em",
            color: "var(--accent)",
            fontWeight: 700,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}>
            <span className="live-dot" style={{ width: 8, height: 8 }} />
            PRIVATE BETA
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--bright)", marginBottom: "2px" }}>
              We&apos;re onboarding founders, agencies &amp; researchers first — free Pro access.
            </div>
            <div style={{ fontSize: "13px", color: "var(--muted)" }}>
              Tell us what you&apos;d run first and we&apos;ll fast-track you in.
            </div>
          </div>

          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "11px 20px",
            borderRadius: "10px",
            background: "var(--accent)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 700,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}>
            Apply for access →
          </span>
        </a>
      </div>

      {/* ── Pricing Cards ── */}
      <div style={{ padding: "0 4vw 80px" }}>
        <div className="pricing-grid-new">
          {TIERS.map((tier) => {
            const isFree = tier.price.monthly === 0;
            const isCustom = typeof tier.price.monthly === "string";
            
            return (
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

                {(() => {
                  const isActive = user?.tier === tier.id || (tier.id === "explorer" && (!user || !user?.tier));
                  
                  if (isActive) {
                    return (
                      <button
                        disabled
                        className="pricing-cta-btn"
                        style={{
                          width: "100%",
                          padding: "16px",
                          border: "1px solid var(--support)",
                          background: "rgba(200, 241, 53, 0.08)",
                          color: "var(--support)",
                          cursor: "default",
                          fontFamily: "var(--mono)",
                          fontSize: "11px",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          boxShadow: "0 0 15px rgba(200, 241, 53, 0.15)"
                        }}
                      >
                        [CURRENT_ACTIVE_PLAN]
                      </button>
                    );
                  }

                  if (isAuthenticated && !isFree && !isCustom) {
                    return (
                      <button
                        onClick={() => {
                          setCardName(displayName(user));
                          setCheckoutTier(tier);
                        }}
                        className={`pricing-cta-btn ${tier.featured ? "p-primary" : "p-ghost"}`}
                        style={{ width: "100%", padding: "16px", border: "none", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800 }}
                      >
                        UPGRADE_NOW
                      </button>
                    );
                  }

                  return (
                    <Link
                      href={tier.link}
                      className={`pricing-cta-btn ${tier.featured ? "p-primary" : "p-ghost"}`}
                    >
                      {tier.cta}
                    </Link>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Checkout Overlay Modal ── */}
      {checkoutTier && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          padding: "20px"
        }}>
          <div style={{
            background: "var(--bg-darker)",
            border: "1px solid var(--border-bright)",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "460px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
            overflow: "hidden",
            fontFamily: "var(--mono)",
            fontSize: "11px",
            color: "var(--text)",
          }}>
            {/* Header */}
            <div style={{
              padding: "18px 24px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "linear-gradient(to right, rgba(0, 82, 255, 0.08), transparent)"
            }}>
              <span style={{ color: "var(--bright)", fontWeight: 800, fontSize: "12px", letterSpacing: "0.15em" }}>SECURE_CHECKOUT</span>
              <button 
                onClick={() => setCheckoutTier(null)}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "10px" }}
              >
                [CLOSE]
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleCheckoutSubmit} style={{ padding: "24px" }}>
              {checkoutStatus === "idle" && (
                <>
                  {/* Summary */}
                  <div style={{ background: "var(--panel)", border: "1px dashed var(--border-bright)", borderRadius: "6px", padding: "14px 18px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "var(--muted)" }}>PACKAGE:</span>
                      <span style={{ color: "var(--bright)", fontWeight: 700 }}>{checkoutTier.name.toUpperCase()} NODE</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "var(--muted)" }}>FREQUENCY:</span>
                      <span style={{ color: "var(--bright)" }}>{isAnnual ? "ANNUAL (SAVE 20%)" : "MONTHLY"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "8px" }}>
                      <span style={{ color: "var(--accent)", fontWeight: 700 }}>TOTAL_DUE:</span>
                      <span style={{ color: "var(--accent)", fontWeight: 800, fontSize: "13px" }}>
                        ${isAnnual ? checkoutTier.price.annual : checkoutTier.price.monthly}/mo
                      </span>
                    </div>
                  </div>

                  {/* Fields */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
                    <div>
                      <label style={{ color: "var(--muted)", display: "block", marginBottom: "6px" }}>CARDHOLDER_NAME</label>
                      <input 
                        type="text" 
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="ENTER FULL NAME"
                        style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none" }}
                      />
                    </div>

                    <div>
                      <label style={{ color: "var(--muted)", display: "block", marginBottom: "6px" }}>CARD_NUMBER</label>
                      <input 
                        type="text" 
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none" }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <div>
                        <label style={{ color: "var(--muted)", display: "block", marginBottom: "6px" }}>EXP_DATE</label>
                        <input 
                           type="text" 
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none" }}
                        />
                      </div>
                      <div>
                        <label style={{ color: "var(--muted)", display: "block", marginBottom: "6px" }}>CVC_CODE</label>
                        <input 
                          type="password" 
                          required
                          maxLength={3}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="000"
                          style={{ width: "100%", padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "var(--accent)",
                      color: "#fff",
                      border: "1px solid var(--accent)",
                      borderRadius: "4px",
                      fontWeight: 800,
                      cursor: "pointer",
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase"
                    }}
                  >
                    Authorize Payment & Upgrade →
                  </button>
                </>
              )}

              {checkoutStatus === "processing" && (
                <div style={{ textAlign: "center", padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                  <div className="live-dot" style={{ width: 32, height: 32 }} />
                  <div style={{ color: "var(--accent)", fontWeight: 700, letterSpacing: "0.15em" }}>AUTHORIZING_CREDIT_HANDSHAKE...</div>
                  <div style={{ color: "var(--muted)", fontSize: "9px" }}>Please wait while encrypting payment metadata...</div>
                </div>
              )}

              {checkoutStatus === "success" && (
                <div style={{ textAlign: "center", padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "40px", color: "var(--support)", textShadow: "0 0 20px rgba(200,241,53,0.3)" }}>✓</span>
                  <div style={{ color: "var(--support)", fontWeight: 800, fontSize: "14px", letterSpacing: "0.15em" }}>PLAN_UPGRADE_AUTHORIZED!</div>
                  <div style={{ color: "var(--bright)", fontSize: "12px", border: "1px solid var(--support)", padding: "10px 16px", background: "rgba(200,241,53,0.05)", borderRadius: "4px", marginTop: "10px" }}>
                    {checkoutTier.name.toUpperCase()} NODE LIMITS UNLOCKED
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: "9px", marginTop: "10px" }}>SYNCHRONIZING_DATABASE... REDIRECTING NOW</div>
                </div>
              )}

              {checkoutStatus === "error" && (
                <div style={{ textAlign: "center", padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "40px", color: "var(--oppose)" }}>⚠</span>
                  <div style={{ color: "var(--oppose)", fontWeight: 800, fontSize: "12px", letterSpacing: "0.1em" }}>TRANSACTION_FAILED</div>
                  <div style={{ color: "var(--muted)", fontSize: "10px" }}>{errorMessage}</div>
                  <button 
                    type="button" 
                    onClick={() => setCheckoutStatus("idle")} 
                    style={{ background: "none", border: "1px solid var(--border)", color: "var(--bright)", padding: "6px 12px", borderRadius: "4px", fontSize: "10px", cursor: "pointer", marginTop: "10px" }}
                  >
                    RETRY TRANSACTION
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

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

      {/* ── Beta Tester / Research Sponsor Form ── */}
      <section id="beta-access" style={{ padding: "0 4vw 80px", scrollMarginTop: "100px" }}>
        <div style={{
          maxWidth: 1400,
          margin: "0 auto",
          background: "var(--panel)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(0, 82, 255, 0.15)",
          boxShadow: "0 20px 50px rgba(0, 82, 255, 0.04)",
          borderRadius: "16px",
          padding: "60px 40px",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Subtle grid accent background */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(0, 82, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 82, 255, 0.015) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            pointerEvents: "none"
          }} />

          {/* ── Centered "who it's for" beta callout header ── */}
          <div style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            maxWidth: 720,
            margin: "0 auto 52px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 16px",
              borderRadius: "999px",
              background: "rgba(0, 82, 255, 0.06)",
              border: "1px solid rgba(0, 82, 255, 0.18)",
              fontFamily: "var(--mono)",
              fontSize: "11px",
              letterSpacing: "0.16em",
              color: "var(--accent)",
              fontWeight: 700,
              marginBottom: "22px",
            }}>
              <span className="live-dot" style={{ width: 8, height: 8 }} />
              NOW IN PRIVATE BETA
            </span>

            <h2 style={{
              fontFamily: "var(--heading)",
              fontSize: "clamp(30px, 4.5vw, 52px)",
              fontWeight: 800,
              color: "var(--bright)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              margin: "0 0 18px",
            }}>
              Get early access. <span style={{ color: "var(--accent)" }}>Free Pro level.</span>
            </h2>

            <p style={{
              color: "var(--muted)",
              fontSize: "16px",
              lineHeight: 1.6,
              maxWidth: 580,
              margin: "0 0 28px",
            }}>
              We&apos;re onboarding the first wave by hand. If you&apos;re shipping something real and want
              to stress-test it against a live social-contagion simulation, this is for you.
            </p>

            {/* Who it's for — explicit audience chips */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px",
            }}>
              {[
                { label: "Founders", hint: "pre-launch validation" },
                { label: "Agencies", hint: "client go-to-market" },
                { label: "Researchers", hint: "agent-based modeling" },
                { label: "Strategists", hint: "market intelligence" },
              ].map((a) => (
                <div key={a.label} style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "2px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  textAlign: "left",
                }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--bright)" }}>{a.label}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "9.5px", letterSpacing: "0.04em", color: "var(--muted)" }}>{a.hint}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pricing-beta-layout" style={{ position: "relative", zIndex: 2 }}>
            <div>
              <span className="mkt-eyebrow" style={{ textAlign: "left" }}>[WHAT_YOU_GET]</span>
              <p style={{
                color: "var(--muted)",
                fontSize: "14px",
                lineHeight: 1.6,
                margin: "16px 0 24px"
              }}>
                Approved beta members get the full Research Tier unlocked at no cost, plus a direct
                line to the people building the engine. Tell us what you&apos;d run first and we&apos;ll
                fast-track your access.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", fontFamily: "var(--mono)" }}>
                  <span style={{ color: "var(--accent)" }}>[✔]</span> Free unlock of Research Tier constraints
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", fontFamily: "var(--mono)" }}>
                  <span style={{ color: "var(--accent)" }}>[✔]</span> Up to 500 agents / simulation capacity
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", fontFamily: "var(--mono)" }}>
                  <span style={{ color: "var(--accent)" }}>[✔]</span> Direct feedback loops with core engineering
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", fontFamily: "var(--mono)" }}>
                  <span style={{ color: "var(--accent)" }}>[✔]</span> Priority onboarding for founders &amp; agencies
                </div>
              </div>
            </div>

            <div style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "32px",
              fontFamily: "var(--mono)",
              fontSize: "11px"
            }}>
              {betaStatus === "idle" && (
                <form onSubmit={handleBetaSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
                    <div>
                      <label style={{ color: "var(--muted)", display: "block", marginBottom: "6px" }}>FULL_NAME</label>
                      <input 
                        type="text" 
                        required 
                        value={betaName}
                        onChange={(e) => setBetaName(e.target.value)}
                        placeholder="IDENTIFIER"
                        style={{ width: "100%", padding: "10px 14px", background: "var(--bg-darker)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none" }}
                      />
                    </div>
                    <div>
                      <label style={{ color: "var(--muted)", display: "block", marginBottom: "6px" }}>EMAIL_ADDRESS</label>
                      <input 
                        type="email" 
                        required 
                        value={betaEmail}
                        onChange={(e) => setBetaEmail(e.target.value)}
                        placeholder="COMMUNICATOR_URI"
                        style={{ width: "100%", padding: "10px 14px", background: "var(--bg-darker)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ color: "var(--muted)", display: "block", marginBottom: "6px" }}>PRIMARY_USE_CASE</label>
                    <select 
                      value={betaUseCases}
                      onChange={(e) => setBetaUseCases(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", background: "var(--bg-darker)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none" }}
                    >
                      <option value="academic_research">Academic / Economic Research</option>
                      <option value="public_policy">Public Policy & Social Science</option>
                      <option value="market_intelligence">Corporate Strategy & Market Intelligence</option>
                      <option value="open_source">Open-Source Persona Modeling</option>
                      <option value="curiosity">General Social Graph Curiosity</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ color: "var(--muted)", display: "block", marginBottom: "6px" }}>RESEARCH_FOCUS & HYPOTHESIS</label>
                    <textarea 
                      required 
                      rows={3}
                      value={betaFocus}
                      onChange={(e) => setBetaFocus(e.target.value)}
                      placeholder="Briefly describe the social contagion or agent-based scenario you plan to research..."
                      style={{ width: "100%", padding: "10px 14px", background: "var(--bg-darker)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none", resize: "none" }}
                    />
                  </div>

                  <button 
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "rgba(0, 82, 255, 0.05)",
                      color: "var(--accent)",
                      border: "1px solid rgba(0, 82, 255, 0.25)",
                      borderRadius: "4px",
                      fontWeight: 800,
                      cursor: "pointer",
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      transition: "all 0.2s ease"
                    }}
                  >
                    SUBMIT BETA APPLICATION →
                  </button>
                </form>
              )}

              {betaStatus === "submitting" && (
                <div style={{ textAlign: "center", padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                  <div className="live-dot" style={{ width: 24, height: 24 }} />
                  <div style={{ color: "var(--accent)", fontWeight: 700, letterSpacing: "0.15em" }}>PROCESSING_APPLICATION_TELEMETRY...</div>
                  <div style={{ color: "var(--muted)", fontSize: "9px" }}>Registering keys in the research sandbox database...</div>
                </div>
              )}

              {betaStatus === "success" && (
                <div style={{ textAlign: "center", padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "36px", color: "var(--support)", textShadow: "0 0 20px rgba(200,241,53,0.3)" }}>✓</span>
                  <div style={{ color: "var(--support)", fontWeight: 800, fontSize: "12px", letterSpacing: "0.15em" }}>APPLICATION_REGISTERED_SUCCESSFULLY</div>
                  <p style={{ color: "var(--muted)", lineHeight: 1.5, margin: "6px 0 12px", maxWidth: 360 }}>
                    Thank you for joining the program. {user ? "Since you are logged in, we have instantly upgraded your session to the Research Tier level to help you get started immediately!" : "Our core team will reach out to your communicator URI with access instructions shortly."}
                  </p>
                  {user && (
                    <Link 
                      href="/dashboard"
                      style={{
                        padding: "10px 20px",
                        background: "var(--support)",
                        color: "#000",
                        borderRadius: "4px",
                        fontWeight: 800,
                        textDecoration: "none"
                      }}
                    >
                      ENTER RESEARCH LAB →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Enterprise CTA ── */}
      <section style={{ padding: "0 4vw" }}>
        <div
          className="pricing-enterprise-layout"
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "80px 60px",
            background: "var(--bg-darker)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
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
              <span style={{ color: "var(--accent)" }}>Intelligence.</span>
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

function displayName(user: any) {
  if (!user) return "";
  const raw =
    user.metadata?.full_name ||
    user.metadata?.name ||
    user.metadata?.display_name ||
    user.email?.split("@")[0] ||
    "Scenario Builder";

  return String(raw)
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}
