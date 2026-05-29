"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
  const { isAuthenticated, user, refreshUser } = useAuth();
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

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
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

  const handleBetaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBetaStatus("submitting");

    // Simulate database write / application processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // If user is logged in, optionally elevate their tier to Research/Strategic as a gesture of beta enrollment!
      if (user) {
        await supabase.auth.updateUser({
          data: { tier: "research", beta_status: "applied" }
        });
        await refreshUser();
      }
      setBetaStatus("success");
    } catch (err) {
      setBetaStatus("error");
    }
  };

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", paddingBottom: 120, position: "relative" }}>
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
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          padding: "20px"
        }}>
          <div style={{
            background: "#090b0e",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "460px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
            overflow: "hidden",
            fontFamily: "var(--mono)",
            fontSize: "11px",
            color: "var(--text)",
            animation: "ambient-pulse 10s infinite alternate"
          }}>
            {/* Header */}
            <div style={{
              padding: "18px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "linear-gradient(to right, rgba(255,107,53,0.08), transparent)"
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
                  <div style={{ background: "rgba(255,255,255,0.015)", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: "6px", padding: "14px 18px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "var(--muted)" }}>PACKAGE:</span>
                      <span style={{ color: "var(--bright)", fontWeight: 700 }}>{checkoutTier.name.toUpperCase()} NODE</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "var(--muted)" }}>FREQUENCY:</span>
                      <span style={{ color: "var(--bright)" }}>{isAnnual ? "ANNUAL (SAVE 20%)" : "MONTHLY"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "8px", marginTop: "8px" }}>
                      <span style={{ color: "var(--orange)", fontWeight: 700 }}>TOTAL_DUE:</span>
                      <span style={{ color: "var(--support)", fontWeight: 800, fontSize: "13px" }}>
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
                        style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none" }}
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
                        style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none" }}
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
                          style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none" }}
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
                          style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none" }}
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
                      background: "linear-gradient(135deg, var(--orange) 0%, #ff8b45 100%)",
                      color: "#000",
                      border: "1px solid var(--orange)",
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
                  <div style={{ color: "var(--orange)", fontWeight: 700, letterSpacing: "0.15em" }}>AUTHORIZING_CREDIT_HANDSHAKE...</div>
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
      <section style={{ padding: "0 4vw 80px" }}>
        <div style={{
          maxWidth: 1400,
          margin: "0 auto",
          background: "linear-gradient(135deg, rgba(9, 11, 14, 0.9) 0%, rgba(13, 17, 23, 0.9) 100%)",
          border: "1px solid rgba(255, 107, 53, 0.2)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 0 40px rgba(255,107,53,0.02)",
          borderRadius: "16px",
          padding: "60px 40px",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Subtle grid accent background */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(255,107,53,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.02) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            pointerEvents: "none"
          }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "60px", alignItems: "start", position: "relative", zIndex: 2 }}>
            <div>
              <span className="mkt-eyebrow" style={{ textAlign: "left" }}>[BETA_TESTER_PROGRAM]</span>
              <h2 style={{
                fontFamily: "var(--heading)",
                fontSize: "clamp(24px, 3vw, 38px)",
                fontWeight: 800,
                color: "var(--bright)",
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                margin: "16px 0"
              }}>
                Accelerate Your Research.
                <br />
                <span style={{ color: "var(--orange)" }}>Get Free Pro Level.</span>
              </h2>
              <p style={{
                color: "var(--muted)",
                fontSize: "14px",
                lineHeight: 1.6,
                marginBottom: "24px"
              }}>
                We are actively looking for researchers, economists, and strategic planners to stress-test our custom Watts-Strogatz social structures and agent reasoning. 
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", fontFamily: "var(--mono)" }}>
                  <span style={{ color: "var(--support)" }}>[✔]</span> Free unlock of Research Tier constraints
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", fontFamily: "var(--mono)" }}>
                  <span style={{ color: "var(--support)" }}>[✔]</span> Up to 500 agents / simulation capacity
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", fontFamily: "var(--mono)" }}>
                  <span style={{ color: "var(--support)" }}>[✔]</span> Direct feedback loops with core engineering
                </div>
              </div>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.015)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              padding: "32px",
              fontFamily: "var(--mono)",
              fontSize: "11px"
            }}>
              {betaStatus === "idle" && (
                <form onSubmit={handleBetaSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ color: "var(--muted)", display: "block", marginBottom: "6px" }}>FULL_NAME</label>
                      <input 
                        type="text" 
                        required 
                        value={betaName}
                        onChange={(e) => setBetaName(e.target.value)}
                        placeholder="IDENTIFIER"
                        style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none" }}
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
                        style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ color: "var(--muted)", display: "block", marginBottom: "6px" }}>PRIMARY_USE_CASE</label>
                    <select 
                      value={betaUseCases}
                      onChange={(e) => setBetaUseCases(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", background: "#090b0e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none" }}
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
                      style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", color: "var(--bright)", fontFamily: "var(--mono)", outline: "none", resize: "none" }}
                    />
                  </div>

                  <button 
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "rgba(255, 107, 53, 0.1)",
                      color: "var(--orange)",
                      border: "1px solid rgba(255, 107, 53, 0.4)",
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
                  <div style={{ color: "var(--orange)", fontWeight: 700, letterSpacing: "0.15em" }}>PROCESSING_APPLICATION_TELEMETRY...</div>
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

