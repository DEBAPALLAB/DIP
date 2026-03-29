"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="landing-v2-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="glass" style={{ width: "100%", maxWidth: "400px", marginTop: "-60px", padding: "40px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--panel)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "var(--sans)", fontSize: "28px", fontWeight: 700, color: "var(--bright)", letterSpacing: "-0.02em" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>Sign in to continue to your dashboard</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {error && (
            <div style={{ color: "var(--oppose)", fontSize: "12px", padding: "10px", background: "rgba(255, 68, 68, 0.1)", border: "1px solid rgba(255, 68, 68, 0.2)", borderRadius: "6px" }}>
              {error}
            </div>
          )}
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "var(--text)", fontWeight: 500 }}>Email Address</label>
            <input 
              type="email" 
              placeholder="you@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%", height: "40px", padding: "0 12px", background: "var(--bg-darker)",
                border: "1px solid var(--border)", borderRadius: "6px", color: "var(--bright)",
                fontFamily: "var(--sans)", fontSize: "14px", outline: "none"
              }}
            />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "12px", color: "var(--text)", fontWeight: 500 }}>Password</label>
              <Link href="#" style={{ fontSize: "11px", color: "var(--orange)", textDecoration: "none" }}>Forgot?</Link>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%", height: "40px", padding: "0 12px", background: "var(--bg-darker)",
                border: "1px solid var(--border)", borderRadius: "6px", color: "var(--bright)",
                fontFamily: "var(--sans)", fontSize: "14px", outline: "none"
              }}
            />
          </div>
          
          <button 
            type="submit"
            style={{ 
              height: "44px", width: "100%", marginTop: "8px", background: "var(--orange)", 
              color: "#000", border: "none", borderRadius: "6px", fontSize: "14px", 
              fontWeight: 600, cursor: "pointer", transition: "all 0.2s" 
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            Sign In
          </button>
          
          <div style={{ textAlign: "center", marginTop: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>Don't have an account? </span>
            <Link href="/register" style={{ fontSize: "13px", color: "var(--bright)", textDecoration: "none", fontWeight: 500 }}>
              Create one here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
