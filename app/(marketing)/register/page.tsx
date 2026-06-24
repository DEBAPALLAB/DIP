"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

type Mode = "waitlist" | "invite";

function RegisterForm() {
  const [mode, setMode] = useState<Mode>("waitlist");
  const [step, setStep] = useState(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [useCase, setUseCase] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { register, joinWaitlist } = useAuth();

  // ── Waitlist signup (default path) ──
  const handleWaitlist = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!firstName || !email) {
      setError("Please enter at least your name and email.");
      setIsSubmitting(false);
      return;
    }

    const { error: wlError } = await joinWaitlist(email, {
      first_name: firstName,
      last_name: lastName,
      company,
      role,
      use_case: useCase,
      source: "waitlist",
    });

    setIsSubmitting(false);
    if (wlError) setError(wlError);
    else setStep(2);
  };

  // ── Invite-code registration (founders / agencies) ──
  const handleInvite = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!firstName || !email || !password || !inviteCode) {
      setError("Name, email, password and invite code are all required.");
      setIsSubmitting(false);
      return;
    }

    const { error: regError } = await register(email, password, {
      first_name: firstName,
      last_name: lastName,
      company,
      invite_code: inviteCode,
    });

    setIsSubmitting(false);
    if (regError) setError(regError);
    else router.push("/dashboard");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        minHeight: "100vh",
        position: "relative",
        zIndex: 1,
        padding: "160px 20px 120px 20px",
        overflow: "hidden",
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          .layout-header-gradient { display: none !important; }
          footer { display: none !important; }
          .register-card input::placeholder, .register-card textarea::placeholder { color: #94a3b8 !important; }
          .register-card input:focus, .register-card textarea:focus {
            border-color: rgba(0, 82, 255, 0.25) !important;
            background: #ffffff !important;
            box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.05) !important;
            outline: none !important;
          }
          .register-name-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          @media (max-width: 480px) {
            .register-name-row { grid-template-columns: 1fr; }
          }
        `
      }} />

      {/* Volumetric background */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "800px",
          background: `
            radial-gradient(650px circle at 0% 100%, rgba(0, 82, 255, 0.22) 0%, transparent 100%),
            radial-gradient(650px circle at 100% 100%, rgba(0, 82, 255, 0.22) 0%, transparent 100%),
            radial-gradient(600px 320px ellipse at 50% 100%, rgba(0, 82, 255, 0.12) 0%, transparent 100%)
          `,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Card */}
      <div
        className="register-card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "40px 36px",
          borderRadius: "28px",
          border: "1px solid rgba(0, 82, 255, 0.08)",
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(30px)",
          boxShadow:
            "0 30px 80px rgba(0, 82, 255, 0.04), 0 4px 24px rgba(0, 0, 0, 0.01), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2,
          position: "relative",
        }}
      >
        {step === 2 ? (
          /* ── Waitlist success state ── */
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              padding: "12px 0 4px",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(0, 82, 255, 0.06)",
                border: "1px solid rgba(0, 82, 255, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0052ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div>
              <h2
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: "-0.01em",
                  marginBottom: "10px",
                }}
              >
                You&apos;re on the list
              </h2>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6, maxWidth: "320px" }}>
                Thanks, {firstName}. We&apos;re onboarding the beta in waves — you&apos;ll get an email
                the moment your access opens up.
              </p>
            </div>

            <div
              style={{
                padding: "14px 18px",
                borderRadius: "14px",
                background: "rgba(0, 82, 255, 0.04)",
                border: "1px solid rgba(0, 82, 255, 0.1)",
                width: "100%",
                textAlign: "left",
              }}
            >
              <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "#0052ff", letterSpacing: "0.18em", display: "block", marginBottom: "6px" }}>// FOUNDERS_AND_AGENCIES</span>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                Building something and want in now? Reply to the confirmation email or{" "}
                <Link href="/contact" style={{ color: "#0052ff", fontWeight: 600, textDecoration: "none" }}>reach out directly</Link>{" "}
                — we fast-track founders and agencies running real launches.
              </p>
            </div>

            <button
              onClick={() => router.push("/")}
              style={primaryButtonStyle}
              onMouseOver={(e) => (e.currentTarget.style.background = "#0f172a")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#1e1e24")}
            >
              Back to Home
            </button>
          </div>
        ) : (
          <>
            {/* Header icon */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "#ffffff",
                border: "1px solid rgba(0, 82, 255, 0.08)",
                boxShadow:
                  "0 8px 20px rgba(0, 82, 255, 0.03), inset 0 1px 0 #ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>

            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "#0052ff", letterSpacing: "0.18em" }}>// PRIVATE_BETA</span>
              <h1
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: "-0.01em",
                  marginTop: "6px",
                }}
              >
                {mode === "waitlist" ? "Request beta access" : "Redeem your invite"}
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginTop: "8px",
                  lineHeight: 1.5,
                  maxWidth: "330px",
                }}
              >
                {mode === "waitlist"
                  ? "We're onboarding in waves. Tell us what you'd run first and we'll get you in."
                  : "Founders & agencies with an invite code get instant access."}
              </p>
            </div>

            {/* Mode toggle */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                background: "rgba(0, 82, 255, 0.04)",
                padding: "4px",
                borderRadius: "12px",
                width: "100%",
                marginBottom: "22px",
              }}
            >
              {(["waitlist", "invite"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(""); }}
                  style={{
                    flex: 1,
                    height: "34px",
                    borderRadius: "9px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    fontFamily: "var(--sans)",
                    transition: "all 0.18s ease",
                    background: mode === m ? "#ffffff" : "transparent",
                    color: mode === m ? "#0f172a" : "#64748b",
                    boxShadow: mode === m ? "0 2px 8px rgba(0,82,255,0.06)" : "none",
                  }}
                >
                  {m === "waitlist" ? "Join waitlist" : "I have a code"}
                </button>
              ))}
            </div>

            <form
              onSubmit={mode === "waitlist" ? handleWaitlist : handleInvite}
              style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}
            >
              {error && (
                <div
                  style={{
                    color: "#dc2626",
                    fontSize: "12px",
                    padding: "10px 12px",
                    background: "rgba(220, 38, 38, 0.05)",
                    border: "1px solid rgba(220, 38, 38, 0.12)",
                    borderRadius: "8px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Name row */}
              <div className="register-name-row">
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>First name</label>
                  <input type="text" placeholder="Jane" required value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Last name</label>
                  <input type="text" placeholder="Smith" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
                </div>
              </div>

              {/* Company */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Company / Organization</label>
                <input type="text" placeholder="Acme Corp" value={company} onChange={(e) => setCompany(e.target.value)} style={inputStyle} />
              </div>

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Work email</label>
                <input type="email" placeholder="jane@acmecorp.com" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              </div>

              {mode === "waitlist" ? (
                <>
                  {/* Role */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle}>Your role <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
                    <input type="text" placeholder="Founder, PM, Strategist…" value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle} />
                  </div>

                  {/* Use case */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle}>What would you run first?</label>
                    <textarea
                      placeholder="e.g. Test how a $89/seat launch spreads across our target market"
                      value={useCase}
                      onChange={(e) => setUseCase(e.target.value)}
                      rows={3}
                      style={{ ...inputStyle, height: "auto", padding: "12px 16px", resize: "vertical", lineHeight: 1.5 }}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Invite code */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle}>Invite code</label>
                    <input
                      type="text"
                      placeholder="FOUNDER-XXXX"
                      required
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      style={{ ...inputStyle, fontFamily: "var(--mono)", letterSpacing: "0.05em" }}
                    />
                  </div>

                  {/* Password */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle}>Create a password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ ...inputStyle, paddingRight: "42px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                          background: "none", border: "none", cursor: "pointer", padding: 0, color: "#94a3b8",
                          display: "flex", alignItems: "center",
                        }}
                      >
                        {showPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ ...primaryButtonStyle, marginTop: "8px", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}
                onMouseOver={(e) => { if (!isSubmitting) e.currentTarget.style.background = "#0f172a"; }}
                onMouseOut={(e) => { if (!isSubmitting) e.currentTarget.style.background = "#1e1e24"; }}
              >
                {isSubmitting
                  ? (mode === "waitlist" ? "Joining…" : "Verifying…")
                  : (mode === "waitlist" ? "Request Access" : "Redeem & Enter")}
              </button>

              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>Already approved? </span>
                <Link href="/login" style={{ fontSize: "13px", color: "#0f172a", textDecoration: "none", fontWeight: 600 }}>
                  Sign in
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 120px)" }}>
          <p style={{ color: "var(--muted)" }}>Loading…</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

const labelStyle: React.CSSProperties = { fontSize: "12px", color: "#475569", fontWeight: 500 };

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "44px",
  padding: "0 16px",
  background: "rgba(248, 250, 252, 0.65)",
  border: "1px solid rgba(0, 0, 0, 0.04)",
  borderRadius: "12px",
  color: "#0f172a",
  fontFamily: "var(--sans)",
  fontSize: "14px",
  outline: "none",
  transition: "all 0.18s ease-in-out",
};

const primaryButtonStyle: React.CSSProperties = {
  height: "44px",
  width: "100%",
  background: "#1e1e24",
  color: "#ffffff",
  border: "none",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.18s ease-in-out",
  boxShadow: "0 4px 14px rgba(30, 30, 36, 0.18)",
};
