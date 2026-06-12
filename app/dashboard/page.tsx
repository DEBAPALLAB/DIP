"use client";

import { useAuth, useEntitlements } from "@/lib/AuthContext";
import { SCENARIOS } from "@/lib/scenarios";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/marketing/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type DashboardStatus = "ALL" | "COMPLETED" | "RUNNING" | "FAILED";
type SimulationStatus = Exclude<DashboardStatus, "ALL">;
type SortBy = "created_at" | "total_agents" | "title";
type SortOrder = "asc" | "desc";

interface SimulationRecord {
  id: string;
  scenario_id: string;
  title?: string;
  total_agents: number;
  status: string;
  created_at: string;
  configuration?: {
    title?: string;
    product?: {
      name?: string;
      description?: string;
    };
    scenario?: {
      label?: string;
      tag?: string;
      brief?: string;
    };
    [key: string]: unknown;
  } | null;
}

const STATUS_FILTERS: DashboardStatus[] = ["ALL", "COMPLETED", "RUNNING", "FAILED"];
const SORT_OPTIONS: Array<{ value: SortBy; label: string }> = [
  { value: "created_at", label: "Date" },
  { value: "total_agents", label: "Agent Size" },
  { value: "title", label: "Title" },
];

function getSimulationTitle(sim: SimulationRecord) {
  return sim.title?.trim() || sim.configuration?.title?.trim() || sim.configuration?.product?.name?.trim() || sim.scenario_id.replace(/_/g, " ");
}

function getSimulationScenario(sim: SimulationRecord) {
  return sim.configuration?.scenario?.label?.trim() || SCENARIOS.find((scenario) => scenario.id === sim.scenario_id)?.label || sim.scenario_id.replace(/_/g, " ");
}

function getSimulationDescription(sim: SimulationRecord) {
  return (
    sim.configuration?.product?.description?.trim() ||
    sim.configuration?.scenario?.brief?.split("\n")[0]?.trim() ||
    "No scenario summary stored for this execution."
  );
}

function getDisplayName(user: { email?: string; metadata?: any } | null) {
  const raw =
    user?.metadata?.full_name ||
    user?.metadata?.name ||
    user?.metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "Scenario Builder";

  return String(raw).replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeStatus(status: string | undefined): SimulationStatus {
  const value = String(status || "").toUpperCase();
  if (value.includes("FAIL") || value.includes("ERROR")) return "FAILED";
  if (value.includes("COMPLETE") || value.includes("DONE")) return "COMPLETED";
  return "RUNNING";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

function formatAgents(value: number) {
  return `${Number(value || 0).toLocaleString()} Units`;
}

function getQuotaLabel(maxAgents: number) {
  return maxAgents >= 99999 ? "Agency capacity" : `${maxAgents.toLocaleString()} agents`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { tier, limits, isAtLeast } = useEntitlements();
  const router = useRouter();

  const [pastSimulations, setPastSimulations] = useState<SimulationRecord[]>([]);
  const [loadingSims, setLoadingSims] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DashboardStatus>("ALL");
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [now, setNow] = useState(() => new Date());
  const [latency, setLatency] = useState(140);
  const [mounted, setMounted] = useState(false);

  const displayName = getDisplayName(user);
  const totalAgents = pastSimulations.reduce((acc, sim) => acc + (sim.total_agents || 0), 0);
  const totalSims = pastSimulations.length;
  const runningSims = pastSimulations.filter((sim) => normalizeStatus(sim.status) === "RUNNING").length;
  const maxQuickAgents = limits.maxAgents >= 99999 ? 10000 : limits.maxAgents;
  const quotaBase = limits.maxAgents >= 99999 ? Math.max(totalAgents, maxQuickAgents, 1) : limits.maxAgents;
  const quotaPercent = clamp(Math.round((totalAgents / Math.max(quotaBase, 1)) * 100), 0, 100);
  const circumference = 2 * Math.PI * 42;
  const quotaDashOffset = circumference - (quotaPercent / 100) * circumference;
  const quotaTone = quotaPercent >= 85 ? "critical" : quotaPercent >= 70 ? "warning" : "healthy";

  useEffect(() => {
    async function loadSimulations() {
      if (!user?.id) {
        setLoadingSims(false);
        return;
      }

      const { data, error } = await supabase
        .from("simulations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPastSimulations(data);
      }

      setLoadingSims(false);
    }

    loadSimulations();
  }, [user?.id]);

  useEffect(() => {
    setMounted(true);
    const timer = window.setInterval(() => {
      setNow(new Date());
      setLatency(132 + Math.floor(Math.random() * 28));
    }, 3500);

    return () => window.clearInterval(timer);
  }, []);



  const filteredSimulations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return pastSimulations
      .filter((sim) => {
        const status = normalizeStatus(sim.status);
        if (statusFilter !== "ALL" && status !== statusFilter) return false;
        if (!query) return true;

        const searchable = [
          sim.id,
          sim.scenario_id,
          getSimulationTitle(sim),
          getSimulationScenario(sim),
          getSimulationDescription(sim),
          sim.configuration?.scenario?.tag,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
      .sort((a, b) => {
        let result = 0;
        if (sortBy === "created_at") {
          result = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else if (sortBy === "total_agents") {
          result = (a.total_agents || 0) - (b.total_agents || 0);
        } else {
          result = getSimulationTitle(a).localeCompare(getSimulationTitle(b));
        }

        return sortOrder === "asc" ? result : -result;
      });
  }, [pastSimulations, searchQuery, sortBy, sortOrder, statusFilter]);

  const handleSort = (key: SortBy) => {
    if (sortBy === key) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(key);
    setSortOrder(key === "title" ? "asc" : "desc");
  };

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
    <div className="marketing-theme dashboard-page">
      <Navbar />

      <main className="dashboard-shell">
        <section className="dashboard-command">
          <div>
            <span className="eyebrow">Workspace Control</span>
            <h1>Decision Operations</h1>
            <p>
              {displayName} / {user?.email || "active operator"} / {tier.toUpperCase()} tier
            </p>
          </div>

          <div className="command-actions">
            <div className="timestamp">
              <span>System Time</span>
              <strong>{mounted ? formatTime(now) : "--:--:--"}</strong>
            </div>
            <button className="btn-v2-ghost dashboard-button" onClick={() => router.push("/pricing")}>
              Manage Plan
            </button>
            <button className="btn-v2-primary dashboard-button" onClick={() => router.push("/setup")}>
              New Simulation
            </button>
          </div>
        </section>

        <section className="metrics-grid" aria-label="Dashboard metrics">
          <article className="metric-panel tier-panel">
            <span>Tier / Capacity</span>
            <strong>{tier.toUpperCase()}</strong>
            <p>{getQuotaLabel(limits.maxAgents)}</p>
          </article>
          <article className="metric-panel">
            <span>Total Simulations</span>
            <strong>{totalSims.toLocaleString()}</strong>
            <p>{runningSims} currently running</p>
          </article>
          <article className="metric-panel">
            <span>Agents Deployed</span>
            <strong>{totalAgents.toLocaleString()}</strong>
            <p>{quotaPercent}% of available compute</p>
          </article>
          <article className="metric-panel">
            <span>System Status</span>
            <strong>{latency}ms</strong>
            <p>API latency / 99.98% uptime</p>
          </article>
        </section>

        <section className="workspace-grid">
          <div className="workspace-main">
            <div className="dashboard-panel-header">
              <div>
                <span className="eyebrow">Execution Log</span>
                <h2>Simulation Runs</h2>
              </div>
            </div>

            <div className="controls-bar">
              <label className="search-control">
                <span>Search</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="ID, title, scenario, or tag"
                />
              </label>

              <div className="filter-pills" aria-label="Filter simulations by status">
                {STATUS_FILTERS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={statusFilter === status ? "active" : ""}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <label className="sort-control">
                <span>Sort</span>
                <select value={sortBy} onChange={(event) => handleSort(event.target.value as SortBy)}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <button className="sort-order" type="button" onClick={() => setSortOrder((current) => (current === "asc" ? "desc" : "asc"))}>
                {sortOrder.toUpperCase()}
              </button>

              <div className="result-count">{filteredSimulations.length} records</div>
            </div>

            <div className="table-wrap">
              {loadingSims ? (
                <div className="table-empty">Synchronizing simulation history...</div>
              ) : filteredSimulations.length === 0 ? (
                <div className="table-empty">
                  <strong>No matching records.</strong>
                  <span>Adjust filters or start a new simulation to populate this workspace.</span>
                </div>
              ) : (
                <table className="simulation-table">
                  <thead>
                    <tr>
                      <th>
                        <button type="button" onClick={() => handleSort("title")}>
                          Simulation Details
                        </button>
                      </th>
                      <th>Status</th>
                      <th>
                        <button type="button" onClick={() => handleSort("total_agents")}>
                          Agent Size
                        </button>
                      </th>
                      <th>
                        <button type="button" onClick={() => handleSort("created_at")}>
                          Date / Time
                        </button>
                      </th>
                      <th>Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSimulations.map((sim) => {
                      const status = normalizeStatus(sim.status);
                      const launchCount = clamp(sim.total_agents || 250, 10, maxQuickAgents);

                      return (
                        <tr key={sim.id}>
                          <td>
                            <div className="sim-title">{getSimulationTitle(sim)}</div>
                            <div className="sim-meta">
                              {getSimulationScenario(sim)} / SIM_{sim.id.slice(0, 8).toUpperCase()}
                            </div>
                            <p>{getSimulationDescription(sim)}</p>
                          </td>
                          <td>
                            <span className={`status-chip ${status.toLowerCase()}`}>
                              <span />
                              {status}
                            </span>
                          </td>
                          <td className="agent-cell">{formatAgents(sim.total_agents)}</td>
                          <td>
                            <div className="date-cell">{formatDate(sim.created_at)}</div>
                            <span>{new Date(sim.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </td>
                          <td>
                            <div className="operation-row">
                              <button type="button" onClick={() => router.push(`/results?id=${sim.id}`)}>
                                View Report
                              </button>
                              <button type="button" onClick={() => router.push(`/simulate?scenario=${encodeURIComponent(sim.scenario_id)}&count=${launchCount}`)}>
                                Retry
                              </button>
                              <button
                                type="button"
                                className="danger"
                                disabled={deletingId === sim.id}
                                onClick={() => handleDeleteSimulation(sim.id)}
                              >
                                {deletingId === sim.id ? "Deleting" : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <aside className="control-rail" aria-label="Dashboard control center">
            <section className="rail-panel quota-panel">
              <div className="dashboard-panel-header compact">
                <div>
                  <span className="eyebrow">Compute Quota</span>
                  <h2>Agent Capacity</h2>
                </div>
                <span className={`quota-state ${quotaTone}`}>{quotaTone}</span>
              </div>

              <div className="quota-body">
                <svg viewBox="0 0 110 110" className="quota-gauge" aria-hidden="true">
                  <circle cx="55" cy="55" r="42" />
                  <circle
                    cx="55"
                    cy="55"
                    r="42"
                    style={{
                      strokeDasharray: circumference,
                      strokeDashoffset: quotaDashOffset,
                    }}
                  />
                </svg>
                <div>
                  <strong>{quotaPercent}%</strong>
                  <span>{totalAgents.toLocaleString()} agents deployed</span>
                  <p>Limit: {getQuotaLabel(limits.maxAgents)}</p>
                </div>
              </div>

              {!isAtLeast("strategic") && (
                <Link href="/pricing" className="rail-link">
                  Increase workspace capacity
                </Link>
              )}
            </section>

            <section className="rail-panel telemetry-panel">
              <div className="dashboard-panel-header compact">
                <div>
                  <span className="eyebrow">Telemetry</span>
                  <h2>Live System</h2>
                </div>
              </div>
              <div className="telemetry-list">
                <div>
                  <span>API Uptime</span>
                  <strong>99.98%</strong>
                </div>
                <div>
                  <span>Model Latency</span>
                  <strong>{latency}ms</strong>
                </div>
                <div>
                  <span>Simulation Accuracy</span>
                  <strong>98.6%</strong>
                </div>
                <div>
                  <span>Cache Hit Rate</span>
                  <strong>92.4%</strong>
                </div>
              </div>
            </section>


          </aside>
        </section>
      </main>

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background:
            radial-gradient(620px circle at 0% 0%, rgba(0, 82, 255, 0.16), transparent 68%),
            radial-gradient(620px circle at 100% 0%, rgba(0, 82, 255, 0.16), transparent 68%),
            var(--bg);
          color: var(--text);
          font-family: var(--sans);
        }

        .dashboard-shell {
          position: relative;
          z-index: 1;
          width: min(1460px, calc(100% - 48px));
          margin: 0 auto;
          padding: 128px 0 64px;
        }

        .dashboard-command {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
        }

        .eyebrow {
          display: block;
          margin-bottom: 8px;
          color: var(--accent);
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        h1,
        h2,
        p {
          margin: 0;
        }

        h1 {
          color: var(--bright);
          font-family: var(--heading);
          font-size: 44px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: 0;
        }

        .dashboard-command p {
          margin-top: 10px;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.5;
        }

        .command-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .timestamp {
          min-width: 132px;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.68);
        }

        .timestamp span,
        .timestamp strong {
          display: block;
        }

        .timestamp span {
          color: var(--muted);
          font-family: var(--mono);
          font-size: 10px;
        }

        .timestamp strong {
          margin-top: 2px;
          color: var(--bright);
          font-family: var(--mono);
          font-size: 13px;
        }

        .dashboard-button {
          height: 42px;
          padding: 0 18px;
          border-radius: 8px;
          font-size: 12px;
          letter-spacing: 0;
          text-transform: none;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 16px;
        }

        .metric-panel,
        .workspace-main,
        .rail-panel {
          border: 1px solid rgba(0, 82, 255, 0.14);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.74);
          box-shadow: 0 18px 54px rgba(0, 82, 255, 0.05);
          backdrop-filter: blur(22px);
        }

        .metric-panel {
          min-height: 126px;
          padding: 18px;
        }

        .metric-panel span,
        .metric-panel p {
          color: var(--muted);
          font-family: var(--mono);
          font-size: 11px;
          line-height: 1.4;
        }

        .metric-panel strong {
          display: block;
          margin: 16px 0 6px;
          color: var(--bright);
          font-family: var(--mono);
          font-size: 31px;
          line-height: 1;
          letter-spacing: 0;
        }

        .tier-panel {
          background: linear-gradient(135deg, rgba(0, 82, 255, 0.11), rgba(255, 255, 255, 0.78));
        }

        .workspace-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          gap: 16px;
          align-items: start;
          margin-top: 18px;
        }

        .workspace-main {
          min-width: 0;
          overflow: hidden;
        }

        .dashboard-panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 20px 12px;
          border-bottom: 1px solid var(--border);
        }

        .dashboard-panel-header.compact {
          padding: 0 0 12px;
          border-bottom: 0;
        }

        .dashboard-panel-header h2 {
          color: var(--bright);
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 0;
        }

        .result-count {
          padding: 7px 10px;
          border: 1px solid var(--border);
          border-radius: 999px;
          color: var(--muted);
          background: rgba(255, 255, 255, 0.66);
          font-family: var(--mono);
          font-size: 11px;
          white-space: nowrap;
        }

        .controls-bar {
          display: grid;
          grid-template-columns: minmax(220px, 1fr) auto 150px 72px auto;
          gap: 10px;
          align-items: center;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.42);
        }

        .search-control,
        .sort-control,
        .launch-panel label {
          display: grid;
          gap: 7px;
          color: var(--muted);
          font-family: var(--mono);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }

        input,
        select {
          width: 100%;
          height: 40px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.72);
          color: var(--bright);
          font-family: var(--sans);
          font-size: 13px;
          outline: none;
          padding: 0 12px;
        }

        input:focus,
        select:focus {
          border-color: rgba(0, 82, 255, 0.42);
          box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.08);
        }

        .filter-pills {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .filter-pills button,
        .sort-order,
        .operation-row button {
          height: 40px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.62);
          color: var(--muted);
          cursor: pointer;
          font-family: var(--mono);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0;
          transition: border-color 180ms ease, color 180ms ease, background 180ms ease;
        }

        .filter-pills button {
          padding: 0 10px;
        }

        .filter-pills button.active,
        .sort-order:hover,
        .operation-row button:hover {
          border-color: rgba(0, 82, 255, 0.34);
          background: rgba(0, 82, 255, 0.07);
          color: var(--accent);
        }

        .table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .simulation-table {
          width: 100%;
          min-width: 960px;
          border-collapse: collapse;
        }

        th {
          padding: 11px 20px;
          color: var(--muted);
          background: rgba(248, 250, 255, 0.86);
          border-bottom: 1px solid var(--border);
          font-family: var(--mono);
          font-size: 10px;
          font-weight: 800;
          text-align: left;
          text-transform: uppercase;
        }

        th button {
          padding: 0;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          font: inherit;
          text-transform: inherit;
        }

        td {
          padding: 18px 20px;
          border-bottom: 1px solid rgba(0, 82, 255, 0.08);
          color: var(--text);
          font-size: 13px;
          vertical-align: middle;
        }

        tbody tr:hover {
          background: rgba(0, 82, 255, 0.025);
        }

        .sim-title,
        .date-cell,
        .agent-cell {
          color: var(--bright);
          font-weight: 800;
        }

        .sim-meta {
          margin-top: 5px;
          color: var(--accent);
          font-family: var(--mono);
          font-size: 10px;
        }

        td p {
          max-width: 420px;
          margin-top: 9px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.5;
        }

        td span {
          color: var(--muted);
          font-family: var(--mono);
          font-size: 11px;
        }

        .status-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-width: 104px;
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.62);
          color: var(--muted);
          font-family: var(--mono);
          font-size: 10px;
          font-weight: 800;
        }

        .status-chip span {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: currentColor;
        }

        .status-chip.completed {
          color: var(--accent);
          border-color: rgba(0, 82, 255, 0.2);
        }

        .status-chip.running {
          color: #d77900;
          border-color: rgba(215, 121, 0, 0.24);
        }

        .status-chip.failed {
          color: #d63737;
          border-color: rgba(214, 55, 55, 0.24);
        }

        .status-chip.running span {
          animation: status-pulse 1.2s ease-in-out infinite;
        }

        .operation-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .operation-row button {
          padding: 0 10px;
        }

        .operation-row button.danger {
          color: #c62828;
        }

        .operation-row button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .table-empty {
          display: grid;
          gap: 8px;
          place-items: center;
          min-height: 320px;
          padding: 40px 20px;
          color: var(--muted);
          text-align: center;
          font-family: var(--mono);
          font-size: 12px;
        }

        .table-empty strong {
          color: var(--bright);
          font-family: var(--sans);
          font-size: 18px;
        }

        .control-rail {
          display: grid;
          gap: 14px;
        }

        .rail-panel {
          padding: 16px 18px 18px;
        }

        .quota-state {
          align-self: start;
          padding: 6px 8px;
          border: 1px solid var(--border);
          border-radius: 999px;
          color: var(--muted);
          background: rgba(255, 255, 255, 0.7);
          font-family: var(--mono);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .quota-state.healthy {
          color: var(--accent);
        }

        .quota-state.warning {
          color: #d77900;
        }

        .quota-state.critical {
          color: #c62828;
        }

        .quota-body {
          display: grid;
          grid-template-columns: 104px 1fr;
          gap: 16px;
          align-items: center;
          margin-top: 4px;
        }

        .quota-gauge {
          width: 104px;
          height: 104px;
          transform: rotate(-90deg);
        }

        .quota-gauge circle {
          fill: none;
          stroke: rgba(0, 82, 255, 0.12);
          stroke-width: 10;
        }

        .quota-gauge circle:last-child {
          stroke: var(--accent);
          stroke-linecap: round;
          transition: stroke-dashoffset 260ms ease;
        }

        .quota-body strong {
          display: block;
          color: var(--bright);
          font-family: var(--mono);
          font-size: 30px;
          line-height: 1;
        }

        .quota-body span,
        .quota-body p {
          display: block;
          margin-top: 6px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.45;
        }

        .rail-link {
          display: inline-flex;
          margin-top: 16px;
          color: var(--accent);
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
        }

        .telemetry-list {
          display: grid;
          gap: 1px;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .telemetry-list div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.55);
        }

        .telemetry-list span {
          color: var(--muted);
          font-family: var(--mono);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .telemetry-list strong {
          color: var(--bright);
          font-family: var(--mono);
          font-size: 13px;
        }

        .launch-panel {
          display: grid;
          gap: 16px;
        }

        .slider-head {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 10px;
          margin-bottom: 7px;
        }

        .slider-head span,
        .slider-head strong {
          color: var(--muted);
          font-family: var(--mono);
          font-size: 11px;
        }

        .slider-head strong {
          color: var(--bright);
          text-align: center;
        }

        input[type="range"] {
          height: 5px;
          padding: 0;
          accent-color: var(--accent);
        }

        .dashboard-button.full {
          width: 100%;
        }

        .signout-button {
          height: 40px;
          border: 0;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 800;
        }

        .signout-button:hover {
          color: var(--bright);
        }

        @keyframes status-pulse {
          0%,
          100% {
            opacity: 0.38;
          }
          50% {
            opacity: 1;
          }
        }

        @media (max-width: 1180px) {
          .metrics-grid,
          .workspace-grid {
            grid-template-columns: 1fr 1fr;
          }

          .workspace-main {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 820px) {
          .dashboard-shell {
            width: min(100% - 28px, 1460px);
            padding-top: 104px;
          }

          .dashboard-command,
          .command-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .metrics-grid,
          .workspace-grid,
          .controls-bar {
            grid-template-columns: 1fr;
          }

          h1 {
            font-size: 34px;
          }

          .dashboard-button,
          .timestamp {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
