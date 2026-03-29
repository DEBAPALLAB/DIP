"use client";

import { useState } from "react";
import { useSimulation, type ProductInput } from "@/lib/SimulationContext";
import { buildScenarioFromProduct } from "@/lib/productParams";

export default function InterventionPanel() {
    const { product, updateProduct, scenario } = useSimulation();
    const [localProduct, setLocalProduct] = useState<ProductInput | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    if (!product) return null;

    // Initialize local state when starting edit
    const startEdit = () => {
        setLocalProduct({ ...product });
        setIsEditing(true);
    };

    const handleApply = () => {
        if (localProduct) {
            updateProduct(localProduct);
            setIsEditing(false);
        }
    };

    const currentDisplay = localProduct || product;

    if (!isEditing) {
        return (
            <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--orange)", fontWeight: 700, letterSpacing: "0.1em" }}>STRATEGIC_INTERVENTION</div>
                    <button onClick={startEdit} className="btn btn-ghost" style={{ fontSize: "9px", padding: "4px 8px" }}>TWEAK_PARAMS</button>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ padding: "8px", background: "rgba(0,0,0,0.2)", borderRadius: "4px" }}>
                        <div style={{ fontSize: "8px", color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>Price</div>
                        <div style={{ fontSize: "12px", color: "var(--bright)", fontWeight: 700 }}>{product.price}</div>
                    </div>
                    <div style={{ padding: "8px", background: "rgba(0,0,0,0.2)", borderRadius: "4px" }}>
                        <div style={{ fontSize: "8px", color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>Value Prop</div>
                        <div style={{ fontSize: "12px", color: "var(--bright)", fontWeight: 700, textTransform: "capitalize" }}>{product.valueProp}</div>
                    </div>
                </div>

                <div style={{ marginTop: "12px", fontSize: "10px", color: "var(--muted)", fontStyle: "italic" }}>
                    "Modify parameters to observe localized delta effects in the next step."
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: "16px", background: "rgba(255,107,53,0.05)", border: "1px solid var(--orange)", borderRadius: "8px", animation: "glowPulse 2s infinite" }}>
             <style jsx>{`
                @keyframes glowPulse {
                    0% { box-shadow: 0 0 5px rgba(255,107,53,0.1); }
                    50% { box-shadow: 0 0 15px rgba(255,107,53,0.2); }
                    100% { box-shadow: 0 0 5px rgba(255,107,53,0.1); }
                }
            `}</style>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--orange)", fontWeight: 900 }}>LIVE_OVERRIDE_ACTIVE</div>
                <button onClick={() => setIsEditing(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "12px" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                    <label style={{ display: "block", fontSize: "9px", color: "var(--muted)", marginBottom: "4px" }}>UNIT_PRICE</label>
                    <input 
                        type="text" 
                        value={currentDisplay.price} 
                        onChange={e => setLocalProduct(p => p ? ({ ...p, price: e.target.value }) : null)}
                        style={{ width: "100%", background: "#000", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 10px", color: "var(--bright)", fontSize: "12px", outline: "none" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", fontSize: "9px", color: "var(--muted)", marginBottom: "4px" }}>VALUE_PROPOSITION</label>
                    <div style={{ display: "flex", gap: "4px" }}>
                        {["weak", "moderate", "strong"].map(v => (
                            <button 
                                key={v}
                                onClick={() => setLocalProduct(p => p ? ({ ...p, valueProp: v as any }) : null)}
                                style={{ 
                                    flex: 1, 
                                    padding: "4px 0", 
                                    fontSize: "9px", 
                                    background: currentDisplay.valueProp === v ? "var(--orange)" : "rgba(255,255,255,0.05)",
                                    color: currentDisplay.valueProp === v ? "#000" : "var(--muted)",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: 700
                                }}
                            >
                                {v.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: "4px" }}>
                    <button 
                        onClick={handleApply}
                        style={{ 
                            width: "100%", 
                            padding: "8px", 
                            background: "var(--orange)", 
                            color: "#000", 
                            border: "none", 
                            fontWeight: 800, 
                            fontSize: "10px", 
                            letterSpacing: "0.1em",
                            cursor: "pointer"
                        }}
                    >
                        APPLY_STRATEGIC_DELTA
                    </button>
                </div>
            </div>
        </div>
    );
}
