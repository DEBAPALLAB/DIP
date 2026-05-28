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
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, #12100f 0%, #060505 100%)", display: "flex", flexDirection: "column" }}>
      {/* Dynamic Styling Overrides for Cyberpunk Dashboard theme */}
      <style>
        {`
          .btn-v2-primary {
              background: linear-gradient(135deg, var(--orange) 0%, #ff8b45 100%);
              color: #000 !important;
              border: 1px solid var(--orange);
              font-family: var(--mono);
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.08em;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
              box-shadow: 0 4px 15px rgba(255, 107, 53, 0.15);
              text-transform: uppercase;
          }
          .btn-v2-primary:hover {
              background: #fff;
              border-color: #fff;
              box-shadow: 0 8px 25px rgba(255, 255, 255, 0.25);
              transform: translateY(-2px);
          }
          .btn-v2-primary:active {
              transform: translateY(0);
          }

          .btn-v2-ghost {
              background: rgba(255, 255, 255, 0.01);
              color: var(--muted);
              border: 1px solid var(--border);
              font-family: var(--mono);
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.06em;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
              text-transform: uppercase;
          }
          .btn-v2-ghost:hover:not(:disabled) {
              color: var(--bright);
              border-color: var(--border-bright);
              background: rgba(255, 255, 255, 0.04);
              box-shadow: 0 6px 20px rgba(255, 255, 255, 0.03);
              transform: translateY(-2px);
          }
          .btn-v2-ghost:active {
              transform: translateY(0);
          }

          .nav-link {
              font-size: 11px;
              color: var(--muted);
              text-decoration: none;
              font-family: var(--mono);
              letter-spacing: 0.1em;
              font-weight: 700;
              transition: all 0.25s ease;
              position: relative;
              padding: 4px 0;
          }
          .nav-link::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 0;
              height: 1px;
              background: var(--orange);
              transition: width 0.25s ease;
          }
          .nav-link:hover {
              color: var(--bright);
          }
          .nav-link:hover::after {
              width: 100%;
          }

          @keyframes line-pulse {
              0% { opacity: 0.05; }
              100% { opacity: 0.18; }
          }
          .tactical-line {
              animation: line-pulse 4s infinite alternate ease-in-out;
          }
        `}
      </style>

      {/* Decorative Grid Lines */}
      <div className="tactical-line" style={{ position: "fixed", top: 0, left: "40px", width: "1px", height: "100%", background: "var(--border)", opacity: 0.1, zIndex: 0 }} />
      <div className="tactical-line" style={{ position: "fixed", top: 0, right: "40px", width: "1px", height: "100%", background: "var(--border)", opacity: 0.1, zIndex: 0 }} />

      {/* Nav (Premium Glassmorphic Cyber-Nav with Full Feature Metrics) */}
      <nav style={{ 
          height: "72px", 
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)", 
          display: "flex", alignItems: "center", justifyContent: "space-between", 
          padding: "0 40px", 
          background: "rgba(6, 7, 9, 0.88)", 
          backdropFilter: "blur(28px)", 
          WebkitBackdropFilter: "blur(28px)",
          position: "sticky", top: 0, zIndex: 10,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.55)"
      }}>
        {/* Brand Block */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "var(--orange)", fontWeight: 900, textShadow: "0 0 12px var(--orange)", fontSize: "18px" }}>◉</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "14px", fontWeight: 800, letterSpacing: "0.18em", color: "var(--bright)" }}>DI//SANDBOX</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: "8px", color: "var(--orange)", letterSpacing: "0.12em", marginTop: "2px" }}>QUANTUM_ENGINE_v7.2</span>
          </div>
        </div>

        {/* Feature-Rich Dashboard Navigation Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <Link href="/dashboard" className="nav-link" style={{ color: "var(--bright)", borderBottom: "1px solid var(--orange)" }}>
               // EXPERIMENTS
            </Link>
            <Link href="/setup" className="nav-link">
               // NEW_CASCADE
            </Link>
            <Link href="/pricing" className="nav-link">
               // SUBSCRIPTION
            </Link>
            <Link href="/technology" className="nav-link">
               // METHODOLOGY
            </Link>
        </div>

        {/* Status Widgets & User Profile Block */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* Live Ticker Status Widget */}
            <div style={{ 
                display: "flex", alignItems: "center", gap: "8px", 
                borderLeft: "1px solid rgba(255,255,255,0.08)", 
                paddingLeft: "24px", fontFamily: "var(--mono)", fontSize: "9px" 
            }}>
                <span className="live-dot" style={{ width: 6, height: 6, background: "var(--support)", boxShadow: "0 0 8px var(--support)" }} />
                <span style={{ color: "var(--muted)" }}>SYS_LATENCY:</span>
                <span style={{ color: "var(--support)", fontWeight: 700 }}>12ms</span>
            </div>

            {/* License Level Badge */}
            <span style={{
                fontFamily: "var(--mono)",
                fontSize: "9px",
                padding: "3px 8px",
                borderRadius: "2px",
                fontWeight: 700,
                color: "var(--orange)",
                background: "rgba(255,107,53,0.08)",
                border: "1px solid rgba(255,107,53,0.25)",
                letterSpacing: "0.08em"
            }}>
                {tier.toUpperCase()}_NODE
            </span>

            {/* Profile Avatar */}
            <div style={{ 
                width: "36px", height: "36px", borderRadius: "50%", 
                background: "rgba(255,107,53,0.08)", 
                border: "1.5px solid var(--orange)", 
                display: "flex", alignItems: "center", justifyContent: "center", 
                fontSize: "12px", fontWeight: 900, color: "var(--orange)",
                boxShadow: "0 0 12px rgba(255,107,53,0.2)",
                fontFamily: "var(--mono)",
                cursor: "pointer",
                transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.boxShadow = "0 0 18px rgba(255,107,53,0.45)";
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 0 12px rgba(255,107,53,0.2)";
            }}
            >
              {(displayName.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()}
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: "1400px", margin: "0 auto", width: "100%", padding: "64px 40px", position: "relative", zIndex: 1 }}>
        
        <header style={{ marginBottom: "56px" }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
              <div>
                 <span style={{ fontFamily: "var(--mono)", color: "var(--orange)", fontSize: "11px", letterSpacing: "0.45em", marginBottom: "16px", display: "block", textShadow: "0 0 8px rgba(255,107,53,0.2)" }}>[USER_DASHBOARD_v7.2]</span>
                 <h1 style={{ fontSize: "52px", fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.04em", margin: 0, fontFamily: "var(--heading)", lineHeight: 1.05 }}>
                  HELLO, {displayName.toUpperCase()}.
                 </h1>
              </div>
              <button 
                onClick={() => router.push("/setup")}
                className="btn-v2-primary"
                style={{ padding: "15px 32px", height: "auto" }}
              >
                + NEW_SIMULATION
              </button>
           </div>
        </header>

        {/* Vital Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "64px" }}>
          
          {/* Level Card */}
          <div style={{ 
              background: "linear-gradient(135deg, rgba(255,107,53,0.06) 0%, rgba(255,107,53,0.01) 100%)", 
              border: "1.5px solid var(--orange)", 
              padding: "32px", position: "relative",
              boxShadow: "0 10px 30px rgba(255,107,53,0.04)"
          }}>
            <div style={{ position: "absolute", top: 0, right: 0, padding: "6px 12px", background: "var(--orange)", color: "var(--bg)", fontSize: "9px", fontWeight: 900, fontFamily: "var(--mono)", letterSpacing: "0.08em" }}>PLAN</div>
            <div style={{ color: "var(--orange)", fontSize: "10px", fontWeight: 700, marginBottom: "10px", fontFamily: "var(--mono)", letterSpacing: "0.12em" }}>TIER_LEVEL</div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--bright)", marginBottom: "14px", letterSpacing: "-0.03em" }}>{tier.toUpperCase()}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "12px", color: "var(--muted)", fontFamily: "var(--mono)" }}>CAPACITY: <strong style={{ color: "var(--bright)" }}>{limits.maxAgents === 99999 ? "UNLIMITED" : limits.maxAgents}</strong> UNITS</div>
                {!isAtLeast("strategic") && (
                    <Link href="/pricing" style={{ fontSize: "11px", color: "var(--orange)", fontWeight: 700, textDecoration: "none", fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>→ UPGRADE_SYSTEM</Link>
                )}
            </div>
          </div>

          {/* Stats Box 1 */}
          <div style={{ 
              background: "var(--panel)", 
              border: "1px solid rgba(255,255,255,0.06)", 
              padding: "32px",
              boxShadow: "inset 0 0 20px rgba(255,255,255,0.01), 0 8px 24px rgba(0,0,0,0.2)"
          }}>
            <div style={{ color: "var(--muted)", fontSize: "10px", fontWeight: 700, marginBottom: "10px", fontFamily: "var(--mono)", letterSpacing: "0.12em" }}>TOTAL_VALIDATIONS</div>
            <div style={{ fontSize: "52px", fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.05em", fontFamily: "var(--mono)" }}>{totalSims}</div>
          </div>
          
          {/* Stats Box 2 */}
          <div style={{ 
              background: "var(--panel)", 
              border: "1px solid rgba(255,255,255,0.06)", 
              padding: "32px",
              boxShadow: "inset 0 0 20px rgba(255,255,255,0.01), 0 8px 24px rgba(0,0,0,0.2)"
          }}>
            <div style={{ color: "var(--muted)", fontSize: "10px", fontWeight: 700, marginBottom: "10px", fontFamily: "var(--mono)", letterSpacing: "0.12em" }}>POPULATION_COUNT</div>
            <div style={{ fontSize: "52px", fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.05em", fontFamily: "var(--mono)" }}>{totalAgents.toLocaleString()}</div>
          </div>
          
          {/* Stats Box 3 */}
          <div style={{ 
              background: "var(--panel)", 
              border: "1px solid rgba(255,255,255,0.06)", 
              padding: "32px",
              boxShadow: "inset 0 0 20px rgba(255,255,255,0.01), 0 8px 24px rgba(0,0,0,0.2)"
          }}>
            <div style={{ color: "var(--muted)", fontSize: "10px", fontWeight: 700, marginBottom: "10px", fontFamily: "var(--mono)", letterSpacing: "0.12em" }}>SYS_AVAILABILITY</div>
            <div style={{ fontSize: "52px", fontWeight: 800, color: "var(--support)", letterSpacing: "-0.05em", textShadow: "0 0 20px rgba(200,241,53,0.15)", fontFamily: "var(--mono)" }}>99.9%</div>
          </div>
        </div>

        {/* History Table/Grid */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.02em", fontFamily: "var(--mono)" }}>// EXECUTION_LOG</h2>
            <div style={{ width: "200px", height: "1px", background: "rgba(255,255,255,0.06)", marginLeft: "20px", flex: 1 }} />
          </div>
          
          {loadingSims ? (
            <div style={{ color: "var(--muted)", padding: "48px", textAlign: "center", background: "var(--bg-darker)", border: "1px dashed var(--border)", fontFamily: "var(--mono)", fontSize: "11px" }}>SYNCHRONIZING_HISTORY...</div>
          ) : pastSimulations.length === 0 ? (
            <div style={{ color: "var(--muted)", padding: "48px", textAlign: "center", background: "var(--bg-darker)", border: "1px dashed var(--border)", fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "0.08em" }}>
               NO_DATA_FOUND. START_FIRST_SIMULATION_TO_GENERATE_ANALYTICS.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "24px" }}>
              {pastSimulations.map((sim) => (
                <div 
                  key={sim.id} 
                  style={{ 
                    background: "rgba(255,255,255,0.015)", 
                    border: "1px solid rgba(255,255,255,0.06)", 
                    padding: "32px", display: "flex", flexDirection: "column", gap: "24px",
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    borderRadius: "6px",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                    position: "relative"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "var(--orange)";
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.backgroundColor = "rgba(255,107,53,0.015)";
                    e.currentTarget.style.boxShadow = "0 15px 40px rgba(255,107,53,0.06)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.015)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <div style={{ fontFamily: "var(--mono)", color: "var(--orange)", fontSize: "10px", marginBottom: "8px", letterSpacing: "0.22em" }}>ID//SIM_{sim.id.substring(0,8).toUpperCase()}</div>
                      <h3 style={{ fontSize: "19px", fontWeight: 700, color: "var(--bright)", margin: 0, letterSpacing: "-0.01em" }}>{getSimulationTitle(sim)}</h3>
                    </div>
                    <span style={{ 
                      fontSize: "9px", fontWeight: 800, padding: "5px 10px", borderRadius: "3px", fontFamily: "var(--mono)",
                      background: sim.status === "Completed" ? "rgba(200, 241, 53, 0.15)" : "rgba(255, 107, 53, 0.15)",
                      color: sim.status === "Completed" ? "var(--support)" : "var(--orange)",
                      border: sim.status === "Completed" ? "1px solid rgba(200, 241, 53, 0.3)" : "1px solid rgba(255, 107, 53, 0.3)",
                      letterSpacing: "0.06em"
                    }}>
                      {sim.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px" }}>
                    <div>
                      <span style={{ fontSize: "9px", color: "var(--muted)", textTransform: "uppercase", fontFamily: "var(--mono)", display: "block", marginBottom: "4px", letterSpacing: "0.08em" }}>Execution_Date</span>
                      <span style={{ fontSize: "14px", color: "var(--bright)", fontWeight: 600 }}>{new Date(sim.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "9px", color: "var(--muted)", textTransform: "uppercase", fontFamily: "var(--mono)", display: "block", marginBottom: "4px", letterSpacing: "0.08em" }}>Agents_Count</span>
                      <span style={{ fontSize: "14px", color: "var(--bright)", fontWeight: 600 }}>{sim.total_agents} UNITS</span>
                    </div>
                  </div>

                  <div style={{ marginTop: "8px" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
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
                          borderColor: "rgba(255,68,68,0.25)",
                          color: "var(--oppose)",
                          background: "rgba(255,68,68,0.01)"
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(255,68,68,0.08)";
                            e.currentTarget.style.borderColor = "var(--oppose)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(255,68,68,0.01)";
                            e.currentTarget.style.borderColor = "rgba(255,68,68,0.25)";
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

      <footer style={{ marginTop: "120px", textAlign: "center", padding: "64px 0", borderTop: "1px solid rgba(255,255,255,0.06)", opacity: 0.5 }}>
         <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.55em" }}>STRAWBERRY // BUILT_BY_LUCIDE_TECH</span>
      </footer>
    </div>
  );
}
