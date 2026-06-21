"use client";

import { useState } from "react";
import Squares from "@/components/marketing/InteractiveBackground";

const INQUIRY_TYPES = [
  { value: "enterprise", label: "Enterprise Sales" },
  { value: "simulation", label: "Custom Simulation" },
  { value: "support", label: "Technical Support" },
  { value: "partnership", label: "Partnership" },
  { value: "research", label: "Research Collaboration" },
];

type FormState = "idle" | "submitting" | "success";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiry, setInquiry] = useState("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("submitting");
    await new Promise((r) => setTimeout(r, 1200));
    setFormState("success");
  };

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", overflowX: "hidden" }}>
      <style jsx>{`
        .contact-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 140px 4vw 96px;
          overflow: hidden;
        }
        .contact-title {
          font-family: var(--heading);
          font-size: clamp(52px, 6.5vw, 88px);
          font-weight: 800;
          line-height: 0.94;
          letter-spacing: -0.05em;
          color: var(--bright);
          margin: 0;
        }
        .contact-title .accent {
          background: linear-gradient(135deg, var(--accent) 0%, #2a76ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .contact-panel {
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.66);
          backdrop-filter: blur(24px);
          border-radius: 28px;
          box-shadow: 0 28px 70px rgba(0, 82, 255, 0.05);
        }
        .contact-input {
          width: 100%;
          height: 48px;
          padding: 0 16px 0 44px;
          background: rgba(248, 250, 252, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          color: #0f172a;
          font-family: var(--sans);
          font-size: 14px;
          outline: none;
          transition: all 0.18s ease-in-out;
          box-sizing: border-box;
        }
        .contact-input:focus {
          border-color: rgba(0, 82, 255, 0.25);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.05);
        }
        .contact-input::placeholder { color: #94a3b8; }
        .contact-textarea {
          width: 100%;
          padding: 14px 16px;
          background: rgba(248, 250, 252, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          color: #0f172a;
          font-family: var(--sans);
          font-size: 14px;
          outline: none;
          resize: none;
          transition: all 0.18s ease-in-out;
          box-sizing: border-box;
        }
        .contact-textarea:focus {
          border-color: rgba(0, 82, 255, 0.25);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.05);
        }
        .contact-textarea::placeholder { color: #94a3b8; }
        .contact-select {
          width: 100%;
          height: 48px;
          padding: 0 16px 0 44px;
          background: rgba(248, 250, 252, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          color: #0f172a;
          font-family: var(--sans);
          font-size: 14px;
          outline: none;
          cursor: pointer;
          appearance: none;
          transition: all 0.18s ease-in-out;
        }
        .contact-select:focus {
          border-color: rgba(0, 82, 255, 0.25);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.05);
        }
        .field-label {
          font-size: 12px;
          color: #475569;
          font-weight: 500;
          margin-bottom: 6px;
          display: block;
        }
        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          color: #94a3b8;
          pointer-events: none;
        }
        .contact-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 0.9fr);
          gap: 64px;
          align-items: start;
        }
        .contact-name-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 1024px) {
          .contact-hero-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .contact-hero { min-height: auto; padding: 100px 5vw 64px; }
          .contact-title { font-size: clamp(38px, 12vw, 60px); }
          .contact-name-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .contact-hero { padding: 90px 5vw 56px; }
          .contact-title { font-size: clamp(32px, 13vw, 52px); }
        }
      `}</style>

      <section className="contact-hero">
        <Squares
          direction="diagonal"
          speed={0.2}
          squareSize={40}
          borderColor="rgba(0, 82, 255, 0.03)"
          hoverFillColor="rgba(0, 82, 255, 0.05)"
        />

        {/* Atmospheric glows */}
        <div style={{ position: "absolute", top: "6%", right: "-10%", width: "30vw", height: "30vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 82, 255, 0.08) 0%, transparent 72%)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "-8%", width: "26vw", height: "26vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 82, 255, 0.05) 0%, transparent 72%)", filter: "blur(80px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1400, margin: "0 auto" }}>
          <div className="contact-hero-grid">

            {/* ── Left column ── */}
            <div style={{ paddingTop: "12px" }}>
              <span className="mkt-eyebrow">[INQUIRY_DESK]</span>
              <h1 className="contact-title" style={{ marginTop: 18 }}>
                Start a
                <br />
                <span className="accent">Partnership.</span>
              </h1>
              <p style={{ color: "var(--muted)", fontSize: "18px", lineHeight: 1.75, marginTop: 26, maxWidth: 520 }}>
                Looking for custom simulation models, bespoke behavioral analysis,
                or enterprise integrations? Our team is ready to scope your project.
              </p>

              {/* Contact meta cards */}
              <div style={{ display: "grid", gap: 12, marginTop: 44 }}>
                {[
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    ),
                    label: "EMAIL",
                    value: "agency@notaprompt.in",
                    note: "Response within 24 hours",
                  },
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    ),
                    label: "AVAILABILITY",
                    value: "Mon – Fri, 09:00–18:00 GST",
                    note: "Dubai timezone (UTC+4)",
                  },
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    ),
                    label: "STUDIO",
                    value: "Dubai, UAE",
                    note: "Remote-first, global delivery",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 16,
                      padding: "18px 20px",
                      borderRadius: 18,
                      border: "1px solid var(--border)",
                      background: "rgba(255, 255, 255, 0.55)",
                      backdropFilter: "blur(14px)",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: "rgba(0, 82, 255, 0.06)",
                        border: "1px solid rgba(0, 82, 255, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#0052ff",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", color: "var(--accent)", display: "block", marginBottom: 4 }}>
                        {item.label}
                      </span>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--bright)", letterSpacing: "-0.01em" }}>{item.value}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{item.note}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Project scale hint */}
              <div
                style={{
                  marginTop: 16,
                  padding: "16px 20px",
                  borderRadius: 18,
                  border: "1px solid rgba(0, 82, 255, 0.1)",
                  background: "rgba(0, 82, 255, 0.04)",
                }}
              >
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", color: "var(--accent)", display: "block", marginBottom: 8 }}>// PROJECT_SCALE</span>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {[["$1k–$5k", "Discovery"], ["$5k–$15k", "Custom Build"], ["$15k+", "Enterprise"]].map(([range, label]) => (
                    <div key={label}>
                      <div style={{ fontFamily: "var(--heading)", fontSize: 16, fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.03em" }}>{range}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right column: form ── */}
            <div className="contact-panel" style={{ padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", color: "var(--accent)" }}>// INQUIRY_FORM</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", color: "var(--muted)" }}>SECURE_CHANNEL</span>
              </div>

              {formState === "success" ? (
                <div style={{ textAlign: "center", padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(0, 82, 255, 0.06)", border: "1px solid rgba(0, 82, 255, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0052ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--heading)", fontSize: 20, fontWeight: 700, color: "var(--bright)", letterSpacing: "-0.02em", marginBottom: 8 }}>Inquiry received</h3>
                    <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
                      We&apos;ll review your message and get back to you within 24 hours.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Name + Email row */}
                  <div className="contact-name-row">
                    <div>
                      <label className="field-label">Full name</label>
                      <div style={{ position: "relative" }}>
                        <span className="field-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          placeholder="Jane Smith"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="contact-input"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="field-label">Work email</label>
                      <div style={{ position: "relative" }}>
                        <span className="field-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </span>
                        <input
                          type="email"
                          placeholder="jane@company.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="contact-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inquiry type */}
                  <div>
                    <label className="field-label">Inquiry type</label>
                    <div style={{ position: "relative" }}>
                      <span className="field-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.07 4.93a10 10 0 1 0 .01 14.14" />
                        </svg>
                      </span>
                      <select
                        required
                        value={inquiry}
                        onChange={(e) => setInquiry(e.target.value)}
                        className="contact-select"
                      >
                        <option value="">Select inquiry type</option>
                        {INQUIRY_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      {/* Dropdown chevron */}
                      <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="field-label">Message</label>
                    <textarea
                      placeholder="Describe your project, goals, and timeline…"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="contact-textarea"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={formState === "submitting"}
                    style={{
                      height: "48px",
                      width: "100%",
                      background: "#1e1e24",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: formState === "submitting" ? "not-allowed" : "pointer",
                      transition: "all 0.18s ease-in-out",
                      opacity: formState === "submitting" ? 0.7 : 1,
                      boxShadow: "0 4px 14px rgba(30, 30, 36, 0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                    onMouseOver={(e) => {
                      if (formState !== "submitting") e.currentTarget.style.background = "#0f172a";
                    }}
                    onMouseOut={(e) => {
                      if (formState !== "submitting") e.currentTarget.style.background = "#1e1e24";
                    }}
                  >
                    {formState === "submitting" ? (
                      <>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffffff", opacity: 0.8, animation: "pulse 1s infinite" }} />
                        Sending…
                      </>
                    ) : (
                      "Send Inquiry →"
                    )}
                  </button>

                  <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", lineHeight: 1.5 }}>
                    By submitting, you agree to our privacy policy. We never share your data.
                  </p>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
