"use client";
 
import { useState, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
 
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    
    const { error: loginError } = await login(email, password);
    if (!loginError) {
      router.push(redirect);
    } else {
      setError(loginError);
    }
  };
 
  return (
    <div 
      className="login-page-container" 
      style={{ 
        display: "flex", 
        alignItems: "flex-start", 
        justifyContent: "center",
        minHeight: "100vh",
        position: "relative",
        zIndex: 1,
        padding: "180px 20px 120px 20px",
        overflow: "hidden"
      }}
    >
      {/* Hide the layout's top gradient and footer */}
      <style dangerouslySetInnerHTML={{ __html: `
        .layout-header-gradient { display: none !important; }
        footer { display: none !important; }
        .login-page-container input::placeholder { color: #94a3b8 !important; }
        .login-page-container input:focus {
          border-color: rgba(0, 82, 255, 0.25) !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.05) !important;
        }
      `}} />
 
      {/* Volumetric background gradient coming from the bottom */}
      <div 
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "800px",
          background: `
            radial-gradient(650px circle at 0% 100%, rgba(0, 82, 255, 0.28) 0%, transparent 100%),
            radial-gradient(650px circle at 100% 100%, rgba(0, 82, 255, 0.28) 0%, transparent 100%),
            radial-gradient(600px 320px ellipse at 50% 100%, rgba(0, 82, 255, 0.15) 0%, transparent 100%)
          `,
          pointerEvents: "none",
          zIndex: 0
        }}
      />
 
      {/* Centered Login Card */}
      <div 
        style={{ 
          width: "100%", 
          maxWidth: "420px", 
          padding: "40px 32px", 
          borderRadius: "28px", 
          border: "1px solid rgba(0, 82, 255, 0.08)", 
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(30px)",
          boxShadow: "0 30px 80px rgba(0, 82, 255, 0.04), 0 4px 24px rgba(0, 0, 0, 0.01), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2,
          position: "relative"
        }}
      >
        {/* Rounded Square Header Icon */}
        <div 
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "#ffffff",
            border: "1px solid rgba(0, 82, 255, 0.08)",
            boxShadow: "0 8px 20px rgba(0, 82, 255, 0.03), inset 0 1px 0 #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px"
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </div>
 
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 
            style={{ 
              fontFamily: "var(--sans)", 
              fontSize: "22px", 
              fontWeight: 700, 
              color: "#0f172a", 
              letterSpacing: "-0.01em" 
            }}
          >
            Sign in with email
          </h1>
          <p 
            style={{ 
              fontSize: "13px", 
              color: "#64748b", 
              marginTop: "8px", 
              lineHeight: 1.5,
              maxWidth: "310px" 
            }}
          >
            Make a new simulation to bring your strategies, network, and teams together. For free
          </p>
        </div>
 
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
          {error && (
            <div style={{ color: "#dc2626", fontSize: "12px", padding: "10px 12px", background: "rgba(220, 38, 38, 0.05)", border: "1px solid rgba(220, 38, 38, 0.12)", borderRadius: "8px" }}>
              {error}
            </div>
          )}
          
          {/* Email input field */}
          <div style={{ position: "relative", width: "100%" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", color: "#94a3b8" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%", 
                height: "44px", 
                padding: "0 16px 0 42px", 
                background: "rgba(248, 250, 252, 0.65)",
                border: "1px solid rgba(0, 0, 0, 0.04)", 
                borderRadius: "12px", 
                color: "#0f172a",
                fontFamily: "var(--sans)", 
                fontSize: "14px", 
                outline: "none",
                transition: "all 0.18s ease-in-out"
              }}
            />
          </div>
          
          {/* Password input field */}
          <div style={{ position: "relative", width: "100%" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", color: "#94a3b8" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%", 
                height: "44px", 
                padding: "0 42px 0 42px", 
                background: "rgba(248, 250, 252, 0.65)",
                border: "1px solid rgba(0, 0, 0, 0.04)", 
                borderRadius: "12px", 
                color: "#0f172a",
                fontFamily: "var(--sans)", 
                fontSize: "14px", 
                outline: "none",
                transition: "all 0.18s ease-in-out"
              }}
            />
            {/* Show/Hide password toggle */}
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
                width: "auto"
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
 
          {/* Forgot password */}
          <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginTop: "-4px" }}>
            <Link href="#" style={{ fontSize: "12px", color: "#64748b", textDecoration: "none", fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>
          
          {/* Submit button */}
          <button 
            type="submit"
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
              cursor: "pointer", 
              transition: "all 0.18s ease-in-out",
              boxShadow: "0 4px 14px rgba(30, 30, 36, 0.18)" 
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#0f172a"}
            onMouseOut={(e) => e.currentTarget.style.background = "#1e1e24"}
          >
            Get Started
          </button>
          

          
          <div style={{ textAlign: "center", marginTop: "12px", width: "100%" }}>
            <span style={{ fontSize: "13px", color: "#64748b" }}>Don't have an account? </span>
            <Link href="/register" style={{ fontSize: "13px", color: "#0f172a", textDecoration: "none", fontWeight: 600 }}>
              Create one here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
 
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="login-page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 120px)" }}>
        <p style={{ color: "var(--muted)" }}>Loading components...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
