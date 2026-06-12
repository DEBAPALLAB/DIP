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
          
          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", margin: "8px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(0, 0, 0, 0.05)" }} />
            <span style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "var(--sans)", fontWeight: 500 }}>Or sign in with</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(0, 0, 0, 0.05)" }} />
          </div>
 
          {/* Social login buttons */}
          <div style={{ display: "flex", gap: "10px", width: "100%" }}>
            {/* Google */}
            <button 
              type="button" 
              style={{
                flex: 1,
                height: "38px",
                borderRadius: "10px",
                border: "1px solid rgba(0, 0, 0, 0.04)",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.15s ease",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.01)"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#fafafa"}
              onMouseOut={(e) => e.currentTarget.style.background = "#ffffff"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </button>
            
            {/* Facebook */}
            <button 
              type="button" 
              style={{
                flex: 1,
                height: "38px",
                borderRadius: "10px",
                border: "1px solid rgba(0, 0, 0, 0.04)",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.15s ease",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.01)"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#fafafa"}
              onMouseOut={(e) => e.currentTarget.style.background = "#ffffff"}
            >
              <svg width="18" height="18" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
 
            {/* Apple */}
            <button 
              type="button" 
              style={{
                flex: 1,
                height: "38px",
                borderRadius: "10px",
                border: "1px solid rgba(0, 0, 0, 0.04)",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.15s ease",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.01)"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#fafafa"}
              onMouseOut={(e) => e.currentTarget.style.background = "#ffffff"}
            >
              <svg width="16" height="16" fill="#000000" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z"/>
              </svg>
            </button>
          </div>
          
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
