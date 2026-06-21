"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

function RegisterForm() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!firstName || !lastName || !company || !email || !password) {
      setError("Please fill out all fields.");
      setIsSubmitting(false);
      return;
    }

    const { error: regError } = await register(email, password, {
      first_name: firstName,
      last_name: lastName,
      company: company,
    });

    setIsSubmitting(false);

    if (regError) {
      setError(regError);
    } else {
      setStep(2);
    }
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
          .register-card input::placeholder { color: #94a3b8 !important; }
          .register-card input:focus {
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
            .register-name-row {
              grid-template-columns: 1fr;
            }
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
        {step === 1 ? (
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
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>

            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <h1
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: "-0.01em",
                }}
              >
                Create your account
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginTop: "8px",
                  lineHeight: 1.5,
                  maxWidth: "310px",
                }}
              >
                Start running intelligent simulations. Free to begin, no credit card required.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
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
                  <label style={{ fontSize: "12px", color: "#475569", fontWeight: 500 }}>
                    First name
                  </label>
                  <input
                    type="text"
                    placeholder="Jane"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#475569", fontWeight: 500 }}>
                    Last name
                  </label>
                  <input
                    type="text"
                    placeholder="Smith"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Company */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: "#475569", fontWeight: 500 }}>
                  Company / Organization
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                      color: "#94a3b8",
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px" }}
                  />
                </div>
              </div>

              {/* Work email */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: "#475569", fontWeight: 500 }}>
                  Work email
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                      color: "#94a3b8",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    placeholder="jane@acmecorp.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: "#475569", fontWeight: 500 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                      color: "#94a3b8",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px", paddingRight: "42px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      height: "auto",
                      width: "auto",
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  height: "44px",
                  width: "100%",
                  marginTop: "8px",
                  background: "#1e1e24",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  transition: "all 0.18s ease-in-out",
                  opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: "0 4px 14px rgba(30, 30, 36, 0.18)",
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = "#0f172a";
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = "#1e1e24";
                }}
              >
                {isSubmitting ? "Creating account…" : "Create Account"}
              </button>

              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>Already have an account? </span>
                <Link
                  href="/login"
                  style={{ fontSize: "13px", color: "#0f172a", textDecoration: "none", fontWeight: 600 }}
                >
                  Sign in
                </Link>
              </div>
            </form>
          </>
        ) : (
          /* ── Success state ── */
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
            {/* Checkmark circle */}
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
                Account created
              </h2>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6, maxWidth: "320px" }}>
                We&apos;ve sent a verification email to your inbox. Click the link to activate your account.
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
              <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "#0052ff", letterSpacing: "0.18em", display: "block", marginBottom: "6px" }}>// NEXT_STEPS</span>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                Check your spam folder if you don&apos;t see the email within a few minutes.
              </p>
            </div>

            <button
              onClick={() => router.push("/login")}
              style={{
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
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#0f172a")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#1e1e24")}
            >
              Continue to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 120px)",
          }}
        >
          <p style={{ color: "var(--muted)" }}>Loading…</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

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
