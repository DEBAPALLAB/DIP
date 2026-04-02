"use client";

import { useAuth, useEntitlements } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface SimulationRecord {
  id: string;
  scenario_id: string;
  title?: string;
  total_agents: number;
  status: string;
  created_at: string;
  configuration?: {
    title?: string;
    [key: string]: unknown;
  } | null;
}

function getSimulationTitle(sim: SimulationRecord) {
  return sim.title?.trim() || sim.configuration?.title?.trim() || sim.scenario_id.replace(/_/g, " ");
}

function getDisplayName(user: { email?: string; metadata?: any } | null) {
  const raw =
    user?.metadata?.full_name ||
    user?.metadata?.name ||
    user?.metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "Scenario Builder";

  return String(raw)
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { tier, limits, isAtLeast } = useEntitlements();
  const router = useRouter();
  
  const [pastSimulations, setPastSimulations] = useState<SimulationRecord[]>([]);
  const [loadingSims, setLoadingSims] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const displayName = getDisplayName(user);

  const totalAgents = pastSimulations.reduce((acc, sim) => acc + (sim.total_agents || 0), 0);
  const totalSims = pastSimulations.length;

  useEffect(() => {
    async function loadSimulations() {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPastSimulations(data);
      }
      setLoadingSims(false);
    }
    loadSimulations();
  }, [user]);

  const handleDeleteSimulation = async (simId: string) => {
    const confirmed = window.confirm("Delete this simulation permanently?");
    if (!confirmed) return;

    setDeletingId(simId);
    try {
      const { error } = await supabase.from("simulations").delete().eq("id", simId);
      if (error) throw error;
      setPastSimulations((current) => current.filter((sim) => sim.id !== simId));
    } catch (err) {
      console.error("Failed to delete simulation:", err);
      alert("Could not delete that simulation. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Decorative Grid Lines */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "1px", height: "100%", background: "var(--border)", opacity: 0.1, zIndex: 0 }} />
      <div style={{ position: "fixed", top: 0, right: 0, width: "1px", height: "100%", background: "var(--border)", opacity: 0.1, zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ height: "64px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", background: "rgba(10,10,10,0.8)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "var(--orange)", fontWeight: 900 }}>◉</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "14px", fontWeight: 700, letterSpacing: "0.1em" }}>DI//SANDBOX</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <Link href="/" style={{ fontSize: "12px", color: "var(--muted)", textDecoration: "none", fontWeight: 600 }}>HOME</Link>
            <Link href="/pricing" style={{ fontSize: "12px", color: "var(--muted)", textDecoration: "none", fontWeight: 600 }}>BILLING</Link>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--dim)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 900, color: "var(--orange)" }}>
              {(displayName.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()}
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: "1400px", margin: "0 auto", width: "100%", padding: "64px 40px", position: "relative", zIndex: 1 }}>
        
        <header style={{ marginBottom: "64px" }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                 <span style={{ fontFamily: "var(--mono)", color: "var(--orange)", fontSize: "11px", letterSpacing: "0.4em", marginBottom: "16px", display: "block" }}>[USER_DASHBOARD_v2.0]</span>
                 <h1 style={{ fontSize: "48px", fontWeight: 700, color: "var(--bright)", letterSpacing: "-0.04em", margin: 0 }}>
                  HELLO, {displayName.toUpperCase()}.
                 </h1>
              </div>
              <button 
                onClick={() => router.push("/setup")}
                className="btn-v2-primary"
                style={{ padding: "14px 28px", height: "auto" }}
              >
                + NEW_SIMULATION
              </button>
           </div>
        </header>

        {/* Vital Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "64px" }}>
          
          {/* Level Card */}
          <div style={{ background: "rgba(255,107,53,0.03)", border: "1px solid var(--orange)", padding: "32px", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, right: 0, padding: "8px 12px", background: "var(--orange)", color: "var(--bg)", fontSize: "10px", fontWeight: 900, fontFamily: "var(--mono)" }}>PLAN</div>
            <div style={{ color: "var(--orange)", fontSize: "10px", fontWeight: 700, marginBottom: "8px", fontFamily: "var(--mono)", letterSpacing: "0.1em" }}>TIER_LEVEL</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--bright)", marginBottom: "12px", letterSpacing: "-0.03em" }}>{tier.toUpperCase()}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>CAPACITY: <strong>{limits.maxAgents === 99999 ? "UNLIMITED" : limits.maxAgents}</strong> AGENTS/RUN</div>
                {!isAtLeast("strategic") && (
                    <Link href="/pricing" style={{ fontSize: "12px", color: "var(--orange)", fontWeight: 700, textDecoration: "none" }}>→ UPGRADE_SYSTEM</Link>
                )}
            </div>
          </div>

          <div style={{ background: "var(--panel)", border: "1px solid var(--border)", padding: "32px" }}>
            <div style={{ color: "var(--muted)", fontSize: "10px", fontWeight: 700, marginBottom: "8px", fontFamily: "var(--mono)", letterSpacing: "0.1em" }}>TOTAL_VALIDATIONS</div>
            <div style={{ fontSize: "48px", fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.05em" }}>{totalSims}</div>
          </div>
          
          <div style={{ background: "var(--panel)", border: "1px solid var(--border)", padding: "32px" }}>
            <div style={{ color: "var(--muted)", fontSize: "10px", fontWeight: 700, marginBottom: "8px", fontFamily: "var(--mono)", letterSpacing: "0.1em" }}>POPULATION_COUNT</div>
            <div style={{ fontSize: "48px", fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.05em" }}>{totalAgents.toLocaleString()}</div>
          </div>
          
          <div style={{ background: "var(--panel)", border: "1px solid var(--border)", padding: "32px" }}>
            <div style={{ color: "var(--muted)", fontSize: "10px", fontWeight: 700, marginBottom: "8px", fontFamily: "var(--mono)", letterSpacing: "0.1em" }}>SYS_AVAILABILITY</div>
            <div style={{ fontSize: "48px", fontWeight: 800, color: "var(--support)", letterSpacing: "-0.05em" }}>99.9%</div>
          </div>
        </div>

        {/* History Table/Grid */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--bright)", letterSpacing: "-0.02em" }}>EXECUTION_LOG.</h2>
            <div style={{ width: "200px", height: "1px", background: "var(--border)", marginLeft: "20px", flex: 1, opacity: 0.5 }} />
          </div>
          
          {loadingSims ? (
            <div style={{ color: "var(--muted)", padding: "48px", textAlign: "center", background: "var(--bg-darker)", border: "1px dashed var(--border)" }}>SYNCHRONIZING_HISTORY...</div>
          ) : pastSimulations.length === 0 ? (
            <div style={{ color: "var(--muted)", padding: "48px", textAlign: "center", background: "var(--bg-darker)", border: "1px dashed var(--border)" }}>
               NO_DATA_FOUND. START_FIRST_SIMULATION_TO_GENERATE_ANALYTICS.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "24px" }}>
              {pastSimulations.map((sim) => (
                <div 
                  key={sim.id} 
                  style={{ 
                    background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", 
                    padding: "32px", display: "flex", flexDirection: "column", gap: "24px",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    position: "relative"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "var(--orange)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.backgroundColor = "rgba(255,107,53,0.01)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.01)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontFamily: "var(--mono)", color: "var(--orange)", fontSize: "10px", marginBottom: "8px", letterSpacing: "0.2em" }}>ID//SIM_{sim.id.substring(0,8).toUpperCase()}</div>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--bright)", margin: 0 }}>{getSimulationTitle(sim)}</h3>
                    </div>
                    <span style={{ 
                      fontSize: "10px", fontWeight: 900, padding: "4px 8px", borderRadius: "2px", fontFamily: "var(--mono)",
                      background: sim.status === "Completed" ? "var(--support)" : "var(--neutral)",
                      color: "#000"
                    }}>
                      {sim.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
                    <div>
                      <span style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", fontFamily: "var(--mono)", display: "block", marginBottom: "4px" }}>Execution_Date</span>
                      <span style={{ fontSize: "14px", color: "var(--bright)", fontWeight: 600 }}>{new Date(sim.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", fontFamily: "var(--mono)", display: "block", marginBottom: "4px" }}>Agents_Count</span>
                      <span style={{ fontSize: "14px", color: "var(--bright)", fontWeight: 600 }}>{sim.total_agents} UNITS</span>
                    </div>
                  </div>

                  <div style={{ marginTop: "8px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button 
                        onClick={() => router.push(`/results?id=${sim.id}`)}
                        className="btn-v2-ghost"
                        style={{ width: "100%", height: "48px", fontSize: "11px", fontWeight: 800 }}
                      >
                        VIEW_ANALYTICS_REPORT →
                      </button>
                      <button
                        onClick={() => handleDeleteSimulation(sim.id)}
                        className="btn-v2-ghost"
                        disabled={deletingId === sim.id}
                        style={{
                          minWidth: "104px",
                          height: "48px",
                          fontSize: "11px",
                          fontWeight: 800,
                          borderColor: "rgba(255,68,68,0.35)",
                          color: "var(--oppose)"
                        }}
                      >
                        {deletingId === sim.id ? "DELETING..." : "DELETE"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </main>

      <footer style={{ marginTop: "120px", textAlign: "center", padding: "64px 0", borderTop: "1px solid var(--border)", opacity: 0.5 }}>
         <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.5em" }}>STRAWBERRY // BUILT_BY_LUCIDE_TECH</span>
      </footer>
    </div>
  );
}
