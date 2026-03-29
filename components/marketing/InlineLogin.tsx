"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function InlineLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please input email and password");
      return;
    }
    setIsSubmitting(true);
    const { error: loginError } = await login(email, password);
    setIsSubmitting(false);

    if (!loginError) {
      router.push("/dashboard");
    } else {
      setError(loginError);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="glass" style={{ textAlign: "center", padding: "48px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--panel)" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(0, 208, 132, 0.1)", color: "var(--support)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", fontSize: "24px" }}>
          ✓
        </div>
        <span style={{ fontSize: "12px", color: "var(--support)", fontWeight: 600 }}>[ Active Session ]</span>
        <h3 style={{ margin: "12px 0 24px 0", color: "var(--bright)", fontSize: "20px" }}>Welcome back, {user?.email || "User"}</h3>
        <Link href="/dashboard" style={{
          display: "flex", alignItems: "center", justifyContent: "center", background: "var(--orange)", 
          color: "#000", borderRadius: "6px", height: "48px", width: "100%", fontWeight: 600, 
          textDecoration: "none", transition: "all 0.2s"
        }}>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="glass" style={{ padding: "40px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--panel)" }}>
      <h3 style={{ fontSize: "22px", fontWeight: 600, color: "var(--bright)", marginBottom: "8px", textAlign: "center" }}>Sign In</h3>
      <p style={{ fontSize: "14px", color: "var(--muted)", textAlign: "center", marginBottom: "24px" }}>Access your workspaces</p>
      
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {error && (
          <div style={{ color: "var(--oppose)", fontSize: "12px", padding: "10px", background: "rgba(255, 68, 68, 0.1)", border: "1px solid rgba(255, 68, 68, 0.2)", borderRadius: "6px" }}>
            {error}
          </div>
        )}
        
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%", height: "44px", padding: "0 16px", background: "var(--bg-darker)",
            border: "1px solid var(--border)", borderRadius: "6px", color: "var(--bright)",
            fontFamily: "var(--sans)", fontSize: "14px", outline: "none"
          }}
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%", height: "44px", padding: "0 16px", background: "var(--bg-darker)",
            border: "1px solid var(--border)", borderRadius: "6px", color: "var(--bright)",
            fontFamily: "var(--sans)", fontSize: "14px", outline: "none"
          }}
        />
        
        <button 
          type="submit"
          disabled={isSubmitting}
          style={{ 
            height: "48px", width: "100%", background: "var(--orange)", color: "#000", 
            border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 600, 
            cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1,
            marginTop: "8px"
          }}
        >
          {isSubmitting ? "Authenticating..." : "Sign In"}
        </button>
      </form>
      
      <p style={{ textAlign: "center", fontSize: "13px", color: "var(--muted)", marginTop: "24px" }}>
        Don't have an account? <Link href="/register" style={{ color: "var(--bright)", textDecoration: "none", fontWeight: 500 }}>Create one</Link>
      </p>

    </div>
  );
}
