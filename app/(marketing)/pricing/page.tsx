"use client";

import React, { useState } from "react";
import Link from "next/link";

const TIERS = [
  {
    id: "explorer",
    name: "EXPLORER",
    tag: "[UNIT_ZERO]",
    price: { monthly: 0, annual: 0 },
    description: "Understand how populations behave before using it for real decisions.",
    features: [
      "Up to 100 agents / simulation",
      "1 active scenario",
      "Limited runs/day (5–10)",
      "Basic behavior model (fixed priors)",
      "Fixed social network",
      "No export / no API"
    ],
    purpose: "Acquisition + onboarding + curiosity",
    cta: "GET_STARTED",
    link: "/register"
  },
  {
    id: "research",
    name: "RESEARCH",
    tag: "[UNIT_ALPHA]",
    price: { monthly: 199, annual: 159 },
    description: "Move from intuition to structured experimentation.",
    features: [
      "Up to 500 agents / simulation",
      "3 parallel scenarios",
      "Editable behavioral parameters",
      "Standard network models",
      "CSV export",
      "Email support"
    ],
    purpose: "First serious usage for indie builders & startups",
    cta: "SELECT_DEPLOYMENT",
    link: "/register",
    highlight: false
  },
  {
    id: "strategic",
    name: "STRATEGIC",
    tag: "[UNIT_SIGMA]",
    price: { monthly: 999, annual: 799 },
    description: "Test decisions before committing in the real world.",
    features: [
      "Up to 5,000 agents",
      "Unlimited scenarios",
      "Advanced priors (custom weighting)",
      "Complex social graphs",
      "Segmentation & filtering",
      "API access",
      "Priority support"
    ],
    purpose: "Main revenue tier for strategic teams",
    cta: "SELECT_DEPLOYMENT",
    link: "/register",
    highlight: true
  },
  {
    id: "agency",
    name: "AGENCY / ENTERPRISE",
    tag: "[UNIT_OMEGA]",
    price: { monthly: "Custom", annual: "Custom" },
    description: "For organizations making high-stakes decisions.",
    features: [
      "Unlimited agents",
      "Custom population modeling",
      "Real-world data integration",
      "Dedicated compute",
      "White-labeled reports",
      "Strategic advisory",
      "SSO + SLA"
    ],
    purpose: "High-margin revenue with consulting hybrid",
    cta: "CONTACT_LUCIDE",
    link: "/contact"
  }
];

const FAQS = [
  {
    q: "HOW ARE AGENTS GENERATED?",
    a: "Agents are synthesized from a pool of 20,000+ real-world respondents from the General Social Survey (GSS) 2024. We inject these vectors into LLM persona bridges to create hyper-realistic avatars."
  },
  {
    q: "CAN I UPGRADE MY TIER LATER?",
    a: "Yes. All subscriptions can be upgraded instantly from your dashboard. Moving from Explorer to Strategic unlocks historical data analysis and API access immediately."
  },
  {
    q: "WHAT IS THE TRINITY ENGINE?",
    a: "The Trinity Engine is our proprietary calculation layer that balances Prospect Theory, Social Contagion networks, and LLM-based reasoning to predict non-linear tipping points."
  },
  {
    q: "DO YOU OFFER VOLUME DISCOUNTS?",
    a: "For organizations running >10,000 parallel agents, we offer dedicated high-performance clusters. Contact our technical advisory team for custom quotes."
  }
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="landing-v2-container" style={{ paddingBottom: "120px" }}>
      {/* Decorative Grid Lines */}
      <div style={{ position: "fixed", top: 0, left: "25%", width: "1px", height: "100%", background: "linear-gradient(to bottom, transparent, var(--border), transparent)", opacity: 0.2, zIndex: 0 }} />
      <div style={{ position: "fixed", top: 0, right: "25%", width: "1px", height: "100%", background: "linear-gradient(to bottom, transparent, var(--border), transparent)", opacity: 0.2, zIndex: 0 }} />

      <section className="hero-v2" style={{ paddingTop: "100px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <span className="section-label" style={{ letterSpacing: "0.4em", marginBottom: "24px" }}>[COMMERCIAL_MODELS_v3.0]</span>
        <h1 style={{ fontSize: "clamp(48px, 8vw, 110px)", lineHeight: "0.85", marginBottom: "32px", letterSpacing: "-0.04em" }}>
          PRICED FOR <br /> <span style={{ color: "var(--orange)", fontStyle: "italic" }}>STRATEGY.</span>
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: "700px", margin: "0 auto 60px auto", lineHeight: "1.6", fontSize: "17px" }}>
          Move from static focus groups to dynamic population simulations. 
          Select the unit that matches your strategic scale.
        </p>

        {/* Toggle */}
        <div style={{ display: "inline-flex", background: "var(--bg-darker)", padding: "4px", borderRadius: "4px", border: "1px solid var(--border)", marginBottom: "80px" }}>
          <button 
            onClick={() => setIsAnnual(false)}
            style={{ 
              padding: "10px 24px", 
              background: !isAnnual ? "var(--dim)" : "transparent",
              color: !isAnnual ? "var(--bright)" : "var(--muted)",
              border: "none",
              fontFamily: "var(--mono)",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              borderRadius: "2px",
              transition: "all 0.2s ease"
            }}
          >
            MONTHLY
          </button>
          <button 
            onClick={() => setIsAnnual(true)}
            style={{ 
              padding: "10px 24px", 
              background: isAnnual ? "var(--dim)" : "transparent",
              color: isAnnual ? "var(--bright)" : "var(--muted)",
              border: "none",
              fontFamily: "var(--mono)",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              borderRadius: "2px",
              transition: "all 0.2s ease"
            }}
          >
            ANNUAL (-20%)
          </button>
        </div>

        {/* Pricing Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", maxWidth: "1400px", margin: "0 auto" }}>
          {TIERS.map((tier) => (
            <div 
              key={tier.id} 
              className="glass" 
              style={{ 
                padding: "48px 32px", 
                textAlign: "left", 
                display: "flex", 
                flexDirection: "column",
                border: tier.highlight ? "1px solid var(--orange)" : "1px solid var(--border)",
                position: "relative",
                transition: "transform 0.3s ease",
                backgroundColor: tier.highlight ? "rgba(255,107,53,0.02)" : "rgba(255,255,255,0.01)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              {tier.highlight && (
                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translate(-50%, -50%)", background: "var(--orange)", color: "var(--bg)", padding: "4px 16px", fontFamily: "var(--mono)", fontSize: "10px", fontWeight: "bold", borderRadius: "2px" }}>
                  CORE_REVENUE_TIER
                </div>
              )}
              
              <div style={{ marginBottom: "32px" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: tier.highlight ? "var(--orange)" : "var(--muted)", letterSpacing: "0.2em" }}>{tier.tag}</span>
                <h2 style={{ fontSize: "28px", color: "var(--bright)", marginTop: "12px", marginBottom: "8px" }}>{tier.name}</h2>
                <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: "1.4", height: "40px" }}>{tier.description}</p>
              </div>
              
              <div style={{ marginBottom: "40px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "52px", fontWeight: "800", color: "var(--bright)", letterSpacing: "-0.04em" }}>
                    {typeof tier.price.monthly === 'number' ? 
                      (tier.price.monthly === 0 ? "FREE" : `$${isAnnual ? (typeof tier.price.annual === 'number' ? tier.price.annual : 0) : tier.price.monthly}`) : 
                      tier.price.monthly}
                  </span>
                  {typeof tier.price.monthly === 'number' && tier.price.monthly > 0 && (
                    <span style={{ color: "var(--muted)", fontSize: "14px", fontFamily: "var(--mono)" }}>/MO</span>
                  )}
                </div>
                {isAnnual && typeof tier.price.annual === 'number' && tier.price.annual > 0 && (
                   <div style={{ color: "var(--support)", fontSize: "11px", fontFamily: "var(--mono)", marginTop: "8px" }}>
                     Billed ${tier.price.annual * 12} Annually
                   </div>
                )}
              </div>

              <div style={{ flex: 1, borderTop: "1px solid var(--border)", paddingTop: "32px", marginBottom: "48px" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)", display: "block", marginBottom: "24px", letterSpacing: "0.1em" }}>[INCLUDES]</span>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                  {tier.features.map((feature, i) => (
                    <li key={i} style={{ fontSize: "13px", color: "var(--text)", display: "flex", gap: "12px", alignItems: "start" }}>
                      <span style={{ color: tier.highlight ? "var(--orange)" : "var(--muted)", flexShrink: 0 }}>✦</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px dashed var(--border)" }}>
                   <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)", display: "block", marginBottom: "12px" }}>[PURPOSE]</span>
                   <p style={{ fontSize: "13px", fontStyle: "italic", color: "var(--muted)" }}>→ {tier.purpose}</p>
                </div>
              </div>

              <Link 
                href={tier.link} 
                className={tier.highlight ? "btn-v2-primary" : "btn-v2-ghost"} 
                style={{ width: "100%", textAlign: "center", textDecoration: "none", height: "54px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Strategic Value Section */}
      <section style={{ marginTop: "160px", maxWidth: "1200px", margin: "160px auto 0 auto", padding: "80px", background: "var(--bg-darker)", border: "1px solid var(--border)", borderRadius: "4px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
           <div>
             <span className="section-label" style={{ textAlign: "left" }}>[BEYOND_SUBSCRIPTION]</span>
             <h2 style={{ fontSize: "40px", color: "var(--bright)", marginTop: "20px", marginBottom: "32px", letterSpacing: "-0.02em" }}>PROJECT-BASED <br /> <span style={{ color: "var(--orange)" }}>INTELLIGENCE.</span></h2>
             <p style={{ color: "var(--muted)", fontSize: "16px", lineHeight: "1.8", marginBottom: "32px" }}>
               Don't have the time to build your own scenarios? Lucide Tech offers project-based simulation services. We handle scenario setup, parameter tuning, and insight generation for you.
             </p>
             <div style={{ display: "grid", gap: "20px" }}>
                <div style={{ display: "flex", gap: "16px", padding: "20px", background: "var(--bg)", border: "1px solid var(--border)" }}>
                   <span style={{ color: "var(--orange)", fontWeight: 800 }}>01</span>
                   <div>
                     <strong style={{ display: "block", color: "var(--bright)", fontSize: "14px", marginBottom: "4px" }}>SIMULATION PROJECTS</strong>
                     <p style={{ color: "var(--muted)", fontSize: "13px" }}>Starting at $1k per project. Full scenario setup & insight summary.</p>
                   </div>
                </div>
                <div style={{ display: "flex", gap: "16px", padding: "20px", background: "var(--bg)", border: "1px solid var(--border)" }}>
                   <span style={{ color: "var(--orange)", fontWeight: 800 }}>02</span>
                   <div>
                     <strong style={{ display: "block", color: "var(--bright)", fontSize: "14px", marginBottom: "4px" }}>HIGH-STAKES SIMULATION</strong>
                     <p style={{ color: "var(--muted)", fontSize: "13px" }}>Custom market entry or policy testing models. $5k–$25k contracts.</p>
                   </div>
                </div>
             </div>
           </div>
           <div style={{ position: "relative" }}>
              <div style={{ aspectRatio: "1/1", background: "rgba(255,107,53,0.02)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                 <div style={{ width: "60%", height: "60%", border: "1px dashed var(--orange)", borderRadius: "50%", opacity: 0.2, animation: "spin 20s linear infinite" }} />
                 <div style={{ position: "absolute", fontFamily: "var(--mono)", fontSize: "10px", color: "var(--orange)" }}>[SIGNAL_PROCESSING]</div>
              </div>
           </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ marginTop: "160px", maxWidth: "1000px", margin: "160px auto 0 auto" }}>
         <div style={{ textAlign: "center", marginBottom: "80px" }}>
           <span className="section-label">[FREQUENTLY_ASKED]</span>
           <h2 style={{ fontSize: "48px", color: "var(--bright)", letterSpacing: "-0.04em", marginTop: "16px" }}>SYSTEM SPECIFICATIONS.</h2>
         </div>
         <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "48px" }}>
            {FAQS.map((faq, i) => (
              <div key={i}>
                 <h4 style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--orange)", marginBottom: "16px", textTransform: "uppercase" }}>{faq.q}</h4>
                 <p style={{ color: "var(--muted)", fontSize: "15px", lineHeight: "1.7" }}>{faq.a}</p>
              </div>
            ))}
         </div>
      </section>

      <footer style={{ marginTop: "160px", textAlign: "center", paddingTop: "80px", borderTop: "1px solid var(--border)" }}>
         <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.5em" }}>STRAWBERRY // BUILT_BY_LUCIDE_TECH</span>
      </footer>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
