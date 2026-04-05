"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSimulation, type ProductInput, type MarketFilters } from "@/lib/SimulationContext";
import { buildScenarioFromProduct } from "@/lib/productParams";
import { generateAgents, buildWattsStrogatz, type GSSRespondent } from "@/lib/agentGeneration";
import Link from "next/link";
import { useAuth, useEntitlements } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

const DEFAULT_PRODUCT: ProductInput = {
    name: "NovaDrive EV",
    price: "$399/mo",
    benefits: ["No dealership visits", "Includes insurance and charging"],
    riskLevel: "medium",
    valueProp: "strong",
    category: "Consumer Auto",
    competitorDensity: "high",
    switchingCost: "medium",
    marketingBudget: "high",
    primaryChannel: "social",
    painPoints: [],
    regulatoryRisk: "medium",
};

const EDU_MAP: Record<string, number> = {
    any: 0, "high school": 12, "some college": 14, bachelors: 16, graduate: 18,
};

function buildSimulationTitle(product: ProductInput, scenarioLabel: string) {
    const cleanProduct = product.name?.trim() || "Untitled Simulation";
    const cleanScenario = scenarioLabel?.trim() || "Custom Scenario";
    return `${cleanProduct} — ${cleanScenario}`;
}

const TEMPLATES = [
    {
        icon: "📱", label: "Consumer App", 
        product: { name: "HabitLoop", price: "$5/mo", benefits: ["Gamified UI", "Cloud sync"], riskLevel: "low", valueProp: "moderate", category: "Consumer Tech", competitorDensity: "high", switchingCost: "low", marketingBudget: "medium", primaryChannel: "social", painPoints: ["Hard to stick to habits"], regulatoryRisk: "low" } as ProductInput,
        filters: { ageMin: 18, ageMax: 45, incomeMin: 20, incomeMax: 100, education: "any", wrkstat: "any" } as MarketFilters
    },
    {
        icon: "🏢", label: "B2B Enterprise",
        product: { name: "ComplianceOS", price: "$2000/mo", benefits: ["Automated reporting", "SOC2 certified"], riskLevel: "high", valueProp: "strong", category: "Enterprise SaaS", competitorDensity: "low", switchingCost: "high", marketingBudget: "high", primaryChannel: "enterprise_sales", painPoints: ["Manual compliance checks"], regulatoryRisk: "high" } as ProductInput,
        filters: { ageMin: 25, ageMax: 89, incomeMin: 40, incomeMax: 100, education: "some college", wrkstat: "full-time" } as MarketFilters
    },
    {
        icon: "🏥", label: "Public Health",
        product: { name: "SilverCare Init.", price: "Free", benefits: ["State sponsored", "Local clinics"], riskLevel: "low", valueProp: "strong", category: "Healthcare", competitorDensity: "low", switchingCost: "medium", marketingBudget: "low", primaryChannel: "word_of_mouth", painPoints: ["Lack of accessibility"], regulatoryRisk: "high" } as ProductInput,
        filters: { ageMin: 60, ageMax: 89, incomeMin: 0, incomeMax: 100, education: "any", wrkstat: "retired" } as MarketFilters
    }
];

export default function SetupPage() {
    const router = useRouter();
    const sim = useSimulation();
    const { user } = useAuth();
    const { tier, limits, isAtLeast } = useEntitlements();

    // ─── Local State for Live Editing ───
    const [product, setProduct] = useState<ProductInput>(sim.product || DEFAULT_PRODUCT);
    const [filters, setFilters] = useState<MarketFilters>(sim.marketFilters);
    const [agentCount, setAgentCount] = useState<number>(Math.min(sim.agentCount || 150, limits.maxAgents));
    
    const [aiPrompt, setAiPrompt] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const [rawPool, setRawPool] = useState<GSSRespondent[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const [launchStage, setLaunchStage] = useState(0);

    // Sync agent count if tier changes
    useEffect(() => {
        if (agentCount > limits.maxAgents) {
            setAgentCount(limits.maxAgents);
        }
    }, [limits.maxAgents]);

    // Load pool once on mount
    useEffect(() => {
        fetch("/gss_agent_pool.json", { cache: "force-cache" })
            .then(res => res.text())
            .then(text => {
                const sanitized = text.replace(/:\s*NaN/g, ": null");
                const data = JSON.parse(sanitized);
                setRawPool(data);
            })
            .catch(err => console.error("Failed to load GSS pool", err));
    }, []);

    // ─── Live Generator (Debounced) ───
    useEffect(() => {
        if (rawPool.length === 0) return;

        const timer = setTimeout(async () => {
            setIsGenerating(true);
            try {
                const filteredPool = rawPool.filter((r) => {
                    if (r.age < filters.ageMin || r.age > filters.ageMax) return false;
                    if (r.income_percentile * 100 < filters.incomeMin || r.income_percentile * 100 > filters.incomeMax) return false;
                    if (filters.education !== "any" && r.educ < (EDU_MAP[filters.education] ?? 0)) return false;
                    if (filters.wrkstat !== "any" && r.wrkstat !== filters.wrkstat) return false;
                    return true;
                });

                const count = Math.min(agentCount, limits.maxAgents);
                const generatedAgents = await generateAgents(count, filteredPool);
                
                sim.setAgents(generatedAgents);
                sim.setAgentCount(count);
                
                const initialStates: Record<number, any> = {};
                for (const a of generatedAgents) {
                    initialStates[a.id] = { decision: null, reasoning: null, step: null, pending: false };
                }
                sim.setAgentStates(initialStates);

            } catch (err) {
                console.error("Live generation failed:", err);
            } finally {
                setIsGenerating(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [filters, agentCount, rawPool]);

    const handleAiGenerate = async () => {
        if (!aiPrompt) return;
        setIsAiLoading(true);
        try {
            const res = await fetch("/api/parse-scenario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: aiPrompt })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.details || data?.error || "Failed to parse scenario");
            }
            if (data.product) {
                const parsedProduct = { ...product, ...data.product };
                setProduct(parsedProduct);
                sim.setProduct(parsedProduct);

                const precisionRes = await fetch("/api/auto-params", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        brief: [
                            `Name: ${parsedProduct.name}`,
                            `Price: ${parsedProduct.price}`,
                            `Category: ${parsedProduct.category || "General"}`,
                            "Benefits:",
                            ...(parsedProduct.benefits || []).map((b: string) => `- ${b}`),
                        ].join("\n"),
                    }),
                });

                if (precisionRes.ok) {
                    const precision = await precisionRes.json();
                    const preciseProduct = {
                        ...parsedProduct,
                        aiParamOverrides: {
                            value: typeof precision.value === "number" ? precision.value : undefined,
                            risk: typeof precision.risk === "number" ? precision.risk : undefined,
                            loss: typeof precision.loss === "number" ? precision.loss : undefined,
                            justification: precision.justification || undefined,
                        },
                    };
                    setProduct(preciseProduct);
                    sim.setProduct(preciseProduct);
                }
            }
            if (data.marketFilters) {
                setFilters({ ...filters, ...data.marketFilters });
                sim.setMarketFilters({ ...filters, ...data.marketFilters });
            }
            setAiPrompt("");
        } catch (e) {
            console.error("AI Parse failed", e);
            alert(e instanceof Error ? e.message : "Failed to parse scenario");
        }
        finally { setIsAiLoading(false); }
    };

    const handleAutoFilter = async () => {
        if (!product.name) return;
        setIsAiLoading(true);
        try {
            const res = await fetch("/api/auto-params", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    brief: `${product.name} - ${product.category}\nBenefits:\n${product.benefits.join("\n")}`
                }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.market) {
                    const f = { ...filters, ...data.market };
                    setFilters(f);
                    sim.setMarketFilters(f);
                }
                if (data.justification || typeof data.value === "number") {
                    const p = {
                        ...product,
                        aiParamOverrides: {
                            value: typeof data.value === "number" ? data.value : product.aiParamOverrides?.value,
                            risk: typeof data.risk === "number" ? data.risk : product.aiParamOverrides?.risk,
                            loss: typeof data.loss === "number" ? data.loss : product.aiParamOverrides?.loss,
                            justification: data.justification || product.aiParamOverrides?.justification,
                        }
                    };
                    setProduct(p);
                    sim.setProduct(p);
                }
            }
        } catch (err) {
            console.error("Auto-filter failed:", err);
        } finally {
            setIsAiLoading(false);
        }
    };

    const updateProduct = (key: keyof ProductInput, val: any) => {
        const p = { ...product, [key]: val, aiParamOverrides: undefined };
        setProduct(p);
        sim.setProduct(p);
    };

    const updateFilter = (key: keyof MarketFilters, val: any) => {
        const f = { ...filters, [key]: val };
        setFilters(f);
        sim.setMarketFilters(f);
    };

    const executeLaunch = async () => {
        try {
            const finalCount = Math.min(agentCount, limits.maxAgents);
            sim.setProduct(product);
            sim.setMarketFilters(filters);
            sim.setAgentCount(finalCount);
            const scenario = buildScenarioFromProduct(product);
            const title = buildSimulationTitle(product, scenario.label);
            const agents = sim.agents;
            const edges = buildWattsStrogatz(agents.length, 6, 0.15);
            sim.setScenario(scenario);
            sim.setEdges(edges);
            sim.setStep(0);
            sim.setLog([]);
            sim.setAdoptionCurve([]);
            sim.setInsights(null);
            sim.setDbSimulationId(null);
            sim.setFlowStep("populated");

            let targetUrl = "/simulate";

            if (user) {
                const { data, error } = await supabase.from('simulations').insert({
                    user_id: user.id,
                    scenario_id: scenario.id || 'custom',
                    total_agents: agents.length,
                    status: 'Pending',
                    agents,
                    edges,
                    configuration: { title, product, filters, scenario, mainView: sim.mainView }
                }).select().single();
                
                if (!error && data) {
                    sim.setDbSimulationId(data.id);
                    targetUrl = `/simulate?id=${data.id}`;
                }
            }

            setLaunchStage(2);
            await new Promise((resolve) => setTimeout(resolve, 850));
            setLaunchStage(3);
            await new Promise((resolve) => setTimeout(resolve, 650));
            router.push(targetUrl);
        } catch (err) {
            console.error("Failed to launch simulation:", err);
            setIsLaunching(false);
            setLaunchStage(0);
        }
    };

    const handleLaunch = () => {
        if (isLaunching) return;
        setIsLaunching(true);
        setLaunchStage(1);
        window.setTimeout(() => {
            void executeLaunch();
        }, 50);
    };

    const loadingOverlay =
        (isGenerating || isLaunching) && typeof document !== "undefined"
            ? createPortal(
                  <div className="setup-loading-overlay" aria-live="polite" aria-busy="true">
                      <div className="setup-loading-orbit setup-loading-orbit-a" />
                      <div className="setup-loading-orbit setup-loading-orbit-b" />
                      <div className="setup-loading-orbit setup-loading-orbit-c" />
                      <div className="setup-loading-grid" />
                      <div className="setup-loading-panel">
                          <div className="setup-loading-kicker">
                              {isLaunching ? "SIMULATION_BOOT_SEQUENCE" : "POPULATION_ASSEMBLY"}
                          </div>
                          <div className="setup-loading-title">
                              {isLaunching ? "SPINNING UP THE RUN" : "MAPPING THE AGENT FIELD"}
                          </div>
                          <div className="setup-loading-subtitle">
                              {isLaunching
                                  ? ["LOCKING SCENARIO", "SEALING NETWORK", "ALLOCATING CONTEXT", "LAUNCHING"][launchStage - 1] || "LAUNCHING"
                                  : "Generating the synthetic population and wiring the network..."}
                          </div>
                          <div className="setup-loading-progress">
                              <span style={{ width: `${Math.min(launchStage, 4) * 25}%` }} />
                          </div>
                          <div className="setup-loading-stats">
                              <div>
                                  <span>AGENTS</span>
                                  <strong>{sim.agents.length.toString().padStart(3, "0")}</strong>
                              </div>
                              <div>
                                  <span>NETWORK</span>
                                  <strong>{isLaunching ? "LOCKED" : "BUILDING"}</strong>
                              </div>
                              <div>
                                  <span>PHASE</span>
                                  <strong>{isLaunching ? `BOOT ${launchStage}/4` : "ASSEMBLY"}</strong>
                              </div>
                          </div>
                      </div>
                  </div>,
                  document.body
              )
            : null;

    useEffect(() => {
        if (!isLaunching) return;
        const stages = window.setInterval(() => {
            setLaunchStage((prev) => Math.min(prev + 1, 4));
        }, 700);
        return () => window.clearInterval(stages);
    }, [isLaunching]);

    return (
        <div style={{ 
            position: "fixed", 
            inset: 0, 
            width: "100%", 
            height: "100%", 
            background: "#050507", 
            overflow: "hidden", 
            fontFamily: "var(--sans)", 
            color: "var(--text)",
            zIndex: 100
        }}>
            <style jsx global>{`
                html, body { 
                    overflow: hidden !important; 
                    height: 100%; 
                    width: 100%;
                    margin: 0;
                    padding: 0;
                }
            `}</style>

            {/* ── BACKGROUND VISUALIZATION ── */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", zIndex: 0, pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "120%", height: "120%", background: "radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

            {/* ── TOP NAVIGATION ── */}
            <div style={{ position: "absolute", top: 24, left: 32, zIndex: 40, display: "flex", alignItems: "center", gap: "24px" }}>
                <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: 14, height: 14, background: "var(--orange)", boxShadow: "0 0 15px var(--orange)" }} />
                    <span style={{ color: "var(--bright)", fontWeight: 800, letterSpacing: "0.2em", fontSize: "14px", fontFamily: "var(--mono)" }}>DI//MISSION CONTROL</span>
                    <span style={{ background: "rgba(255,107,53,0.15)", color: "var(--orange)", padding: "3px 10px", borderRadius: "2px", fontSize: "10px", fontWeight: 900, fontFamily: "var(--mono)", border: "1px solid rgba(255,107,53,0.3)" }}>{tier.toUpperCase()}</span>
                </Link>
            </div>

            {/* ── PERSONA LEGEND (FOOLPROOF HTML) ── */}
            <div style={{ 
                position: "absolute", top: "64px", left: "50%", transform: "translateX(-50%)", 
                zIndex: 40, display: "flex", gap: "16px", padding: "8px 24px", 
                background: "rgba(0,0,0,0.5)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)",
                backdropFilter: "blur(8px)", pointerEvents: "none"
            }}>
                {[
                    { l: "INF", c: "#E91E63" }, { l: "ADOPT", c: "#00BCD4" }, 
                    { l: "HAWK", c: "#F9A825" }, { l: "PRAG", c: "#4CAF50" }, 
                    { l: "FOLLOW", c: "#FF9800" }, { l: "HERD", c: "#9C27B0" },
                    { l: "SKEP", c: "#F44336" }, { l: "LAG", c: "#607D8B" }
                ].map((p) => (
                    <div key={p.l} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ 
                            width: "8px", height: "8px", borderRadius: "50%", background: p.c,
                            boxShadow: `0 0 10px ${p.c}88`
                        }} />
                        <span style={{ 
                            fontFamily: "var(--mono)", fontSize: "10px", fontWeight: 800, 
                            color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" 
                        }}>
                            {p.l}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── CENTRAL AGENT CANVAS ── */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}>
                <defs>
                   <filter id="depthGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2.8" result="blur"/>
                      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                   </filter>
                </defs>

                <text x="30%" y="22%" fill="var(--bright)" fontSize="14" fontFamily="var(--mono)" opacity="0.15" pointerEvents="none" fontWeight="700">VOLATILE_SKEPTICS</text>
                <text x="70%" y="22%" fill="var(--bright)" fontSize="14" fontFamily="var(--mono)" textAnchor="end" opacity="0.15" pointerEvents="none" fontWeight="700">EARLY_ADOPTERS</text>
                <text x="30%" y="78%" fill="var(--bright)" fontSize="14" fontFamily="var(--mono)" opacity="0.15" pointerEvents="none" fontWeight="700">STAGNANT_RESISTANCE</text>
                <text x="70%" y="78%" fill="var(--bright)" fontSize="14" fontFamily="var(--mono)" textAnchor="end" opacity="0.15" pointerEvents="none" fontWeight="700">LOYAL_PRAGMATISTS</text>
                <line x1="25%" y1="50%" x2="75%" y2="50%" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="10 10" />
                <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="10 10" />

                {sim.agents.map((ag, idx) => {
                    // Central spread (35% to 65% width, 25% to 75% height)
                    const jitterX = ((idx % 7) - 3.5) * 2; 
                    const jitterY = ((idx % 11) - 5.5) * 2;
                    
                    const cx = 35 + (ag.trust * 30) + (jitterX / 10); 
                    const cy = 75 - (ag.risk * 50) + (jitterY / 10); 
                    const radius = isGenerating ? 3 : 4 + (ag.income * 12);
                    return (
                        <circle 
                           key={ag.id} cx={`${cx}%`} cy={`${cy}%`} r={radius} 
                           fill={ag.color || "var(--orange)"} 
                           fillOpacity={isGenerating ? 0.35 : 0.85} 
                           style={{ 
                             transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                             filter: "url(#depthGlow)"
                           }}
                        >
                            <title>{`${ag.name} • ${ag.persona}`}</title>
                        </circle>
                    );
                })}

                {/* ── LIVE STATUS COUNTER ── */}
                <g style={{ transform: "translate(50%, 90%)" }}>
                    <text x="0" y="0" textAnchor="middle" fill="var(--orange)" fontFamily="var(--mono)" fontSize="11" fontWeight="800" opacity="0.6">
                        ACTIVE_AGENTS: {sim.agents.length.toString().padStart(3, '0')} / {agentCount} PROTOTYPES
                    </text>
                </g>
            </svg>

            {/* ── LEFT PANEL: CONFIGURATION ── */}
            <div style={{ position: "absolute", top: 80, left: 32, bottom: 32, width: "380px", background: "rgba(10, 12, 16, 0.7)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", display: "flex", flexDirection: "column", zIndex: 10, boxShadow: "0 40px 100px rgba(0,0,0,0.4)" }}>
                {/* AI ARCHITECT HEADER */}
                <div style={{ padding: "32px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(to bottom, rgba(255,107,53,0.08), transparent)", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                        <span style={{ color: "var(--orange)", fontSize: "14px" }}>✦</span>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800, color: "var(--bright)", letterSpacing: "0.2em" }}>PARSING_ENGINE</span>
                    </div>
                    <textarea 
                        value={aiPrompt} 
                        onChange={(e) => setAiPrompt(e.target.value)} 
                        placeholder="Describe a product scenario or market shift..." 
                        style={{ ...textareaStyle, height: "80px", marginBottom: "16px" }} 
                    />
                    <button 
                        onClick={handleAiGenerate} 
                        disabled={isAiLoading || !aiPrompt} 
                        className={isAiLoading ? "" : "btn-v2-primary"}
                        style={{ width: "100%", height: "44px", borderRadius: "6px", fontSize: "12px", fontWeight: 800, letterSpacing: "0.1em", border: isAiLoading ? "1px solid var(--border)" : "none", color: isAiLoading ? "var(--muted)" : "#000", background: isAiLoading ? "transparent" : "var(--orange)" }}
                    >
                        {isAiLoading ? "SYNTHESIZING..." : "GENERATE SCENARIO"}
                    </button>
                    
                    <div style={{ display: "flex", gap: "8px", marginTop: "20px", overflowX: "auto" }} className="no-scrollbar">
                        {TEMPLATES.map((t) => (
                            <div 
                                key={t.label} 
                                onClick={() => { setProduct({ ...product, ...t.product, aiParamOverrides: undefined }); setFilters({ ...filters, ...t.filters }); }}
                                style={{ 
                                    padding: "6px 12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", fontSize: "10px", 
                                    whiteSpace: "nowrap", cursor: "pointer", background: "rgba(255,255,255,0.03)", color: "var(--muted)",
                                    transition: "all 0.2s"
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--orange)"; e.currentTarget.style.color = "var(--bright)"; }}
                                onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--muted)"; }}
                            >
                                {t.icon} {t.label.toUpperCase()}
                            </div>
                        ))}
                    </div>
                </div>

                {/* FORM CONTENT */}
                <div className="no-scrollbar" style={{ flex: 1, padding: "32px 24px", overflowY: "auto" }}>
                    <div style={{ marginBottom: "40px" }}>
                        <h3 style={sectionLabel}>Product Parameters</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={fieldWrapper}>
                                <label style={miniLabel}>PROJECT_NAME</label>
                                <input type="text" value={product.name} onChange={e => updateProduct("name", e.target.value)} placeholder="e.g. Project Nova" style={inputStyle} />
                            </div>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <div style={{ ...fieldWrapper, flex: 1 }}>
                                    <label style={miniLabel}>PRICE_POINT</label>
                                    <input type="text" value={product.price} onChange={e => updateProduct("price", e.target.value)} style={inputStyle} placeholder="$0.00" />
                                </div>
                                <div style={{ ...fieldWrapper, flex: 1 }}>
                                    <label style={miniLabel}>INDUSTRY</label>
                                    <input type="text" value={product.category} onChange={e => updateProduct("category", e.target.value)} style={inputStyle} placeholder="Sector" />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <div style={{ ...fieldWrapper, flex: 1 }}>
                                    <label style={miniLabel}>VALUE_PROP</label>
                                    <select value={product.valueProp} onChange={e => updateProduct("valueProp", e.target.value)} style={selectStyle}>
                                        <option value="strong">Strong Advantage</option>
                                        <option value="moderate">Moderate</option>
                                        <option value="weak">Market Parity</option>
                                    </select>
                                </div>
                                <div style={{ ...fieldWrapper, flex: 1 }}>
                                    <label style={miniLabel}>RISK_PROFILE</label>
                                    <select value={product.riskLevel} onChange={e => updateProduct("riskLevel", e.target.value)} style={selectStyle}>
                                        <option value="low">Conservative</option>
                                        <option value="medium">Balanced</option>
                                        <option value="high">High Velocity</option>
                                    </select>
                                </div>
                            </div>
                            <div style={fieldWrapper}>
                                <label style={miniLabel}>CORE_BENEFITS (NEW LINE PER ITEM)</label>
                                <textarea 
                                    value={(product.benefits || []).join('\n')} 
                                    onChange={e => updateProduct("benefits", e.target.value.split('\n'))} 
                                    placeholder="Enter key features..." 
                                    style={{ ...textareaStyle, height: "100px" }} 
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 style={sectionLabel}>External Dynamics</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={fieldWrapper}>
                                <label style={miniLabel}>MARKET_DENSITY</label>
                                <select value={product.competitorDensity} onChange={e => updateProduct("competitorDensity", e.target.value)} style={selectStyle}>
                                    <option value="low">Blue Ocean (Low)</option>
                                    <option value="medium">Fragmented (Med)</option>
                                    <option value="high">Hyper-Competitive</option>
                                </select>
                            </div>
                            <div style={fieldWrapper}>
                                <label style={miniLabel}>REGULATORY_EXPOSURE</label>
                                <select value={product.regulatoryRisk} onChange={e => updateProduct("regulatoryRisk", e.target.value)} style={selectStyle}>
                                    <option value="low">Unregulated</option>
                                    <option value="medium">Standard oversight</option>
                                    <option value="high">Strict compliance</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL: AUDIENCE & GTM ── */}
            <div style={{ position: "absolute", top: 80, right: 32, bottom: 32, width: "380px", background: "rgba(10, 12, 16, 0.7)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", display: "flex", flexDirection: "column", zIndex: 10, boxShadow: "0 40px 100px rgba(0,0,0,0.4)" }}>
                <div className="no-scrollbar" style={{ flex: 1, padding: "32px 24px", overflowY: "auto" }}>
                    
                    {/* STRATEGIC AI AUDIT CARD */}
                    {product.aiParamOverrides?.justification && (
                        <div style={{ 
                            marginBottom: "40px", 
                            padding: "20px", 
                            background: "linear-gradient(135deg, rgba(255,107,53,0.1) 0%, transparent 100%)",
                            border: "1px solid rgba(255,107,53,0.2)",
                            borderRadius: "8px",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            <div style={{ position: "absolute", top: -10, right: -10, fontStyle: "italic", fontSize: "40px", color: "rgba(255,107,53,0.05)", fontWeight: 900, pointerEvents: "none" }}>AI</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                <div style={{ width: 8, height: 8, background: "var(--orange)", borderRadius: "2px", boxShadow: "0 0 10px var(--orange)" }} />
                                <h3 style={{ ...sectionLabel, marginBottom: 0, color: "var(--orange)" }}>Strategic Audit Result</h3>
                            </div>
                            <p style={{ fontSize: "12px", color: "var(--bright)", lineHeight: "1.6", margin: 0, fontStyle: "italic", opacity: 0.9 }}>
                                "{product.aiParamOverrides.justification}"
                            </p>
                            <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "8px", color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: "4px" }}>VAL_EFFICIENCY</div>
                                    <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                                        <div style={{ height: "100%", background: "#00d084", width: `${(product.aiParamOverrides.value || 0.5) * 100}%`, borderRadius: "2px" }} />
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "8px", color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: "4px" }}>RISK_CALIB</div>
                                    <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                                        <div style={{ height: "100%", background: "#ff4444", width: `${(product.aiParamOverrides.risk || 0.5) * 100}%`, borderRadius: "2px" }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: "40px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ ...sectionLabel, marginBottom: 0 }}>Target Micro-Demographics</h3>
                            <button
                                onClick={handleAutoFilter}
                                disabled={isAiLoading || !product.name}
                                style={{
                                    background: "none",
                                    border: "1px solid var(--orange)",
                                    color: "var(--orange)",
                                    borderRadius: "3px",
                                    padding: "4px 8px",
                                    fontSize: "9px",
                                    fontFamily: "var(--mono)",
                                    cursor: "pointer",
                                    opacity: (isAiLoading || !product.name) ? 0.5 : 1,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em"
                                }}
                            >
                                {isAiLoading ? "DETECTING..." : "✨ AI AUTO-FILTER"}
                            </button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <div style={{ ...fieldWrapper, flex: 1 }}>
                                    <label style={miniLabel}>AGE_FLOOR</label>
                                    <input type="number" value={filters.ageMin} onChange={e => updateFilter("ageMin", Number(e.target.value))} style={inputStyle} />
                                </div>
                                <div style={{ ...fieldWrapper, flex: 1 }}>
                                    <label style={miniLabel}>AGE_CEILING</label>
                                    <input type="number" value={filters.ageMax} onChange={e => updateFilter("ageMax", Number(e.target.value))} style={inputStyle} />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <div style={{ ...fieldWrapper, flex: 1 }}>
                                    <label style={miniLabel}>MIN_INCOME_PCT</label>
                                    <input type="number" value={filters.incomeMin} onChange={e => updateFilter("incomeMin", Number(e.target.value))} style={inputStyle} />
                                </div>
                                <div style={{ ...fieldWrapper, flex: 1 }}>
                                    <label style={miniLabel}>MAX_INCOME_PCT</label>
                                    <input type="number" value={filters.incomeMax} onChange={e => updateFilter("incomeMax", Number(e.target.value))} style={inputStyle} />
                                </div>
                            </div>
                            <div style={fieldWrapper}>
                                <label style={miniLabel}>EDUCATION_THRESHOLD</label>
                                <select value={filters.education} onChange={e => updateFilter("education", e.target.value)} style={selectStyle}>
                                    <option value="any">Any Level</option>
                                    <option value="high school">High School+</option>
                                    <option value="some college">College Credits+</option>
                                    <option value="bachelors">Bachelor's+</option>
                                    <option value="graduate">Graduate Degree+</option>
                                </select>
                            </div>
                            <div style={fieldWrapper}>
                                <label style={miniLabel}>ECONOMIC_STATUS</label>
                                <select value={filters.wrkstat} onChange={e => updateFilter("wrkstat", e.target.value)} style={selectStyle}>
                                    <option value="any">Any Workforce Status</option>
                                    <option value="full-time">Full-Time Only</option>
                                    <option value="part-time">Part-Time / Student</option>
                                    <option value="retired">Retired / Senior</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 style={sectionLabel}>Scale & Distribution</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={fieldWrapper}>
                                <label style={miniLabel}>ACQUISITION_BUDGET</label>
                                <select value={product.marketingBudget} onChange={e => updateProduct("marketingBudget", e.target.value)} style={selectStyle}>
                                    <option value="low">Organic / Seed ($)</option>
                                    <option value="medium">Growth Phase ($$)</option>
                                    <option value="high">Mass Market ($$$)</option>
                                </select>
                            </div>
                            <div style={fieldWrapper}>
                                <label style={miniLabel}>PRIMARY_CHANNEL</label>
                                <select value={product.primaryChannel} onChange={e => updateProduct("primaryChannel", e.target.value)} style={selectStyle}>
                                    <option value="social">Social Media Algorithm</option>
                                    <option value="enterprise_sales">Direct B2B Sales</option>
                                    <option value="word_of_mouth">Organic Referral</option>
                                </select>
                            </div>
                            
                            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "20px", borderRadius: "8px", marginTop: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "baseline" }}>
                                    <span style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--mono)", letterSpacing: "0.1em" }}>AGENT_DENSITY (N)</span>
                                    <span style={{ fontFamily: "var(--mono)", fontSize: "18px", color: "var(--orange)", fontWeight: 800 }}>{agentCount}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="10" 
                                    max={Math.max(agentCount, limits.maxAgents)} 
                                    step="10" 
                                    value={agentCount} 
                                    onChange={(e) => setAgentCount(Number(e.target.value))} 
                                    style={{ width: "100%", accentColor: "var(--orange)", cursor: "pointer" }} 
                                />
                                {agentCount >= limits.maxAgents && (
                                    <div style={{ marginTop: "16px", background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.2)", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>
                                        <Link href="/pricing" style={{ fontSize: "10px", color: "var(--orange)", textDecoration: "none", fontWeight: 800, fontFamily: "var(--mono)", letterSpacing: "0.1em" }}>[UPGRADE_CAPACITY_LIMITS]</Link>
                                    </div>
                                )}
                            </div>

                            {!isAtLeast("strategic") && (
                                <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "6px", marginTop: "12px", opacity: 0.6 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                        <div style={{ width: 6, height: 6, background: "var(--orange)", borderRadius: "50%" }} />
                                        <span style={{ fontSize: "10px", color: "var(--orange)", fontWeight: 800, fontFamily: "var(--mono)" }}>ADVANCED_NETWORK_LOCKED</span>
                                    </div>
                                    <p style={{ fontSize: "11px", color: "var(--muted)", lineHeight: "1.4", margin: 0 }}>Strategic tiers unlock custom Watts-Strogatz and Scale-Free topology controls.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── FLOATING INITIATE BUTTON ── */}
            <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", zIndex: 30, display: "flex", justifyContent: "center", width: "100%", pointerEvents: "none" }}>
                <button 
                  onClick={handleLaunch} 
                  disabled={sim.agents.length === 0 || isGenerating || isLaunching} 
                  className="btn-v2-primary"
                  style={{ 
                    height: "56px", padding: "0 64px", borderRadius: "8px", fontSize: "15px", fontWeight: 900, 
                    letterSpacing: "0.2em", boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(255,107,53,0.2)",
                    pointerEvents: "auto"
                  }}
                >
                    {isLaunching ? "BOOTING_SIMULATION_CORE..." : isGenerating ? "RECALIBRATING..." : "START_SIMULATION_SEQUENCES"}
                </button>
            </div>

            {loadingOverlay}

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}


// ── CUSTOM REUSABLE STYLES ──
const fieldWrapper = { display: "flex", flexDirection: "column" as const, gap: "6px" };

const inputStyle = { 
    width: "100%", height: "40px", padding: "0 14px", 
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", 
    borderRadius: "6px", color: "var(--bright)", fontFamily: "var(--sans)", fontSize: "13px", 
    outline: "none", transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)"
};

const selectStyle = { 
    ...inputStyle, cursor: "pointer", 
    appearance: "none" as const, 
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='none' stroke='white' stroke-width='1.5' d='M1 1l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center"
};

const textareaStyle = { 
    ...inputStyle, height: "auto", padding: "12px 14px", resize: "none" as const, lineHeight: "1.5" 
};

const sectionLabel = { 
    fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 800, color: "var(--orange)", 
    textTransform: "uppercase" as const, marginBottom: "20px", letterSpacing: "0.15em",
    display: "flex", alignItems: "center", gap: "12px"
};

const miniLabel = { 
    fontSize: "9px", fontFamily: "var(--mono)", fontWeight: 700, color: "rgba(255,255,255,0.3)", 
    letterSpacing: "0.05em", marginBottom: "2px", textTransform: "uppercase" as const
};
