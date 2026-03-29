"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
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
      company: company
    });
    
    setIsSubmitting(false);
    
    if (regError) {
      setError(regError);
    } else {
      setStep(2);
    }
  };

  return (
    <div className="landing-v2-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="glass" style={{ width: "100%", maxWidth: "440px", marginTop: "-60px", padding: "40px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--panel)" }}>
        
        {step === 1 ? (
          <>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <h1 style={{ fontFamily: "var(--sans)", fontSize: "28px", fontWeight: 700, color: "var(--bright)", letterSpacing: "-0.02em" }}>
                Create an account
              </h1>
              <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>Start running your intelligent simulations</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {error && (
                <div style={{ color: "var(--oppose)", fontSize: "12px", padding: "10px", background: "rgba(255, 68, 68, 0.1)", border: "1px solid rgba(255, 68, 68, 0.2)", borderRadius: "6px" }}>
                  {error}
                </div>
              )}
              
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text)", fontWeight: 500 }}>First Name</label>
                  <input type="text" placeholder="John" required style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text)", fontWeight: 500 }}>Last Name</label>
                  <input type="text" placeholder="Doe" required style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: "var(--text)", fontWeight: 500 }}>Company / Organization</label>
                <input type="text" placeholder="Acme Corp" required style={inputStyle} value={company} onChange={e => setCompany(e.target.value)} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: "var(--text)", fontWeight: 500 }}>Work Email</label>
                <input type="email" placeholder="john@acmecorp.com" required style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: "var(--text)", fontWeight: 500 }}>Password</label>
                <input type="password" placeholder="Create a strong password" required style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                style={{ 
                  height: "44px", width: "100%", marginTop: "8px", background: "var(--orange)", 
                  color: "#000", border: "none", borderRadius: "6px", fontSize: "14px", 
                  fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: isSubmitting ? 0.7 : 1
                }}
                onMouseOver={(e) => { if (!isSubmitting) e.currentTarget.style.opacity = "0.9" }}
                onMouseOut={(e) => { if (!isSubmitting) e.currentTarget.style.opacity = "1" }}
              >
                {isSubmitting ? "Signing Up..." : "Sign Up"}
              </button>
              
              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <span style={{ fontSize: "13px", color: "var(--muted)" }}>Already have an account? </span>
                <Link href="/login" style={{ fontSize: "13px", color: "var(--bright)", textDecoration: "none", fontWeight: 500 }}>
                  Log in
                </Link>
              </div>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "24px", padding: "20px 0" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(0, 208, 132, 0.1)", color: "var(--support)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: "24px" }}>
              ✓
            </div>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: 600, color: "var(--bright)", marginBottom: "8px" }}>Account Created</h3>
              <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: "1.6" }}>
                Your account has been successfully created. We've sent a verification email to your inbox.
              </p>
            </div>
            <div style={{ marginTop: "8px" }}>
              <button 
                onClick={() => router.push("/login")}
                style={{ 
                  height: "40px", padding: "0 24px", background: "transparent", color: "var(--bright)", 
                  border: "1px solid var(--border)", borderRadius: "6px", fontSize: "14px", 
                  fontWeight: 500, cursor: "pointer" 
                }}
              >
                Continue to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", height: "40px", padding: "0 12px", background: "var(--bg-darker)",
  border: "1px solid var(--border)", borderRadius: "6px", color: "var(--bright)",
  fontFamily: "var(--sans)", fontSize: "14px", outline: "none"
};
