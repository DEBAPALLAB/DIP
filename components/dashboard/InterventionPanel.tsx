"use client";

import { useState } from "react";
import { useSimulation, type ProductInput } from "@/lib/SimulationContext";
import { buildProductBrief, buildScenarioFromProduct } from "@/lib/productParams";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function InterventionPanel() {
    const simCtx = useSimulation();
    const { product, updateProduct, agents, edges, dbSimulationId } = simCtx;
    const [localProduct, setLocalProduct] = useState<ProductInput | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isForking, setIsForking] = useState(false);
    const router = useRouter();

    if (!product) return null;

    const startEdit = () => {
        setLocalProduct({ ...product });
        setIsEditing(true);
    };

    const handleFork = async () => {
        if (!localProduct || !simCtx.user) return;
        setIsForking(true);
        
        try {
            let branchProduct = localProduct;

            try {
                const res = await fetch("/api/auto-params", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ brief: buildProductBrief(localProduct) }),
                });

                if (res.ok) {
                    const data = await res.json();
                    branchProduct = {
                        ...localProduct,
                        aiParamOverrides: {
                            value: typeof data.value === "number" ? data.value : undefined,
                            risk: typeof data.risk === "number" ? data.risk : undefined,
                            loss: typeof data.loss === "number" ? data.loss : undefined,
                            justification: typeof data.justification === "string" ? data.justification : undefined,
                        },
                    };
                }
            } catch (autoParamsError) {
                console.warn("Failed to auto-synthesize branch params, using current product:", autoParamsError);
            }

            const branchScenario = {
                ...buildScenarioFromProduct(branchProduct),
                parent_id: dbSimulationId,
            };

            // Create a new simulation record as a branch
            const { data, error } = await supabase
                .from("simulations")
                .insert({
                    user_id: simCtx.user.id,
                    scenario_id: "custom",
                    total_agents: agents.length,
                    agents,
                    edges,
                    status: "Running",
                    configuration: {
                        title: branchProduct.name,
                        product: branchProduct,
                        scenario: branchScenario,
                        filters: simCtx.marketFilters,
                        mainView: simCtx.mainView,
                        parent_id: dbSimulationId,
                        is_branch: true,
                    }
                })
                .select()
                .single();

            if (error) throw error;
            
            // Redirect to the new branch
            router.push(`/simulate?id=${data.id}`);
            window.location.reload(); // Force context refresh for the new ID
        } catch (err) {
            console.error("Failed to fork simulation:", err);
            setIsForking(false);
        }
    };

    const currentDisplay = localProduct || product;

    if (!isEditing) {
        return (
            <div className="intervention-root">
                <div className="intervention-header">
                    <div className="intervention-label">STRATEGIC_INTERVENTION</div>
                    <button onClick={startEdit} className="btn-tweak">ADJUST_PARAMS</button>
                </div>
                
                <div className="intervention-grid">
                    <div className="intervention-stat">
                        <div className="stat-label">UNIT_PRICE</div>
                        <div className="stat-value">{product.price}</div>
                    </div>
                    <div className="intervention-stat">
                        <div className="stat-label">VALUE_PROP</div>
                        <div className="stat-value">{product.valueProp}</div>
                    </div>
                </div>

                <style jsx>{`
                    .intervention-root {
                        padding: 16px;
                        background: rgba(255, 255, 255, 0.02);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        border-radius: 12px;
                    }
                    .intervention-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 16px;
                    }
                    .intervention-label {
                        font-family: var(--mono);
                        font-size: 10px;
                        color: var(--orange);
                        font-weight: 700;
                        letter-spacing: 0.12em;
                    }
                    .btn-tweak {
                        background: rgba(255, 107, 53, 0.1);
                        border: 1px solid rgba(255, 107, 53, 0.2);
                        color: var(--orange);
                        font-size: 9px;
                        padding: 4px 10px;
                        border-radius: 4px;
                        font-family: var(--mono);
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .btn-tweak:hover {
                        background: var(--orange);
                        color: #000;
                    }
                    .intervention-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                    }
                    .intervention-stat {
                        padding: 10px;
                        background: rgba(0,0,0,0.3);
                        border: 1px solid rgba(255,255,255,0.03);
                        border-radius: 6px;
                    }
                    .stat-label {
                        font-size: 8px;
                        color: var(--muted);
                        text-transform: uppercase;
                        margin-bottom: 4px;
                        letter-spacing: 0.05em;
                    }
                    .stat-value {
                        font-size: 13px;
                        color: var(--bright);
                        font-weight: 700;
                        font-family: var(--mono);
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="intervention-edit-root">
            <div className="intervention-header">
                <div className="active-label">LIVE_OVERRIDE_ACTIVE</div>
                <button onClick={() => setIsEditing(false)} className="btn-close">✕</button>
            </div>

            <div className="edit-body">
                <div className="input-group">
                    <label>UNIT_PRICE</label>
                    <input 
                        type="text" 
                        value={currentDisplay.price} 
                        onChange={e => setLocalProduct(p => p ? ({ ...p, price: e.target.value }) : null)}
                    />
                </div>

                <div className="input-group">
                    <label>VALUE_PROPOSITION</label>
                    <div className="toggle-row">
                        {["weak", "moderate", "strong"].map(v => (
                            <button 
                                key={v}
                                onClick={() => setLocalProduct(p => p ? ({ ...p, valueProp: v as any }) : null)}
                                className={currentDisplay.valueProp === v ? "active" : ""}
                            >
                                {v.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleFork}
                    disabled={isForking}
                    className="btn-fork"
                >
                    {isForking ? "INITIATING_FORK..." : "FORK_AND_TEST_DELTA"}
                </button>
            </div>

            <style jsx>{`
                .intervention-edit-root {
                    padding: 16px;
                    background: rgba(255, 107, 53, 0.05);
                    border: 1px solid var(--orange);
                    border-radius: 12px;
                    box-shadow: 0 0 20px rgba(255, 107, 53, 0.1);
                }
                .intervention-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .active-label {
                    font-family: var(--mono);
                    font-size: 10px;
                    color: var(--orange);
                    font-weight: 900;
                    letter-spacing: 0.1em;
                }
                .btn-close {
                    background: none;
                    border: none;
                    color: var(--muted);
                    cursor: pointer;
                    font-size: 14px;
                }
                .edit-body {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .input-group label {
                    display: block;
                    font-size: 9px;
                    color: var(--muted);
                    margin-bottom: 6px;
                    font-family: var(--mono);
                }
                .input-group input {
                    width: 100%;
                    background: #000;
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 8px 12px;
                    color: var(--bright);
                    font-family: var(--mono);
                    font-size: 12px;
                    outline: none;
                    border-radius: 4px;
                }
                .toggle-row {
                    display: flex;
                    gap: 4px;
                }
                .toggle-row button {
                    flex: 1;
                    padding: 6px 0;
                    font-size: 9px;
                    font-weight: 800;
                    background: rgba(255,255,255,0.05);
                    color: var(--muted);
                    border: none;
                    cursor: pointer;
                    font-family: var(--mono);
                    border-radius: 2px;
                }
                .toggle-row button.active {
                    background: var(--orange);
                    color: #000;
                }
                .btn-fork {
                    width: 100%;
                    padding: 12px;
                    background: var(--orange);
                    color: #000;
                    border: none;
                    font-weight: 900;
                    font-size: 11px;
                    letter-spacing: 0.12em;
                    cursor: pointer;
                    margin-top: 8px;
                    border-radius: 4px;
                    transition: transform 0.2s;
                    font-family: var(--mono);
                }
                .btn-fork:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
                }
                .btn-fork:disabled {
                    opacity: 0.5;
                    cursor: wait;
                }
            `}</style>
        </div>
    );
}
