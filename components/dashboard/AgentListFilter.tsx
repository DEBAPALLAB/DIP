"use client";

import type { PersonaType, DecisionType } from "@/lib/types";

interface AgentListFilterProps {
    search: string;
    onSearchChange: (v: string) => void;
    persona: PersonaType | "all";
    onPersonaChange: (v: PersonaType | "all") => void;
    decision: DecisionType | "all" | "null";
    onDecisionChange: (v: DecisionType | "all" | "null") => void;
    resultsCount: number;
    isAISearch: boolean;
    onToggleAI: () => void;
    isSearching: boolean;
}

const PERSONAS: PersonaType[] = [
    "Influencer", "Early Adopter", "Price Hawk", "Pragmatist",
    "Social Follower", "Herd Member", "Skeptic", "Laggard"
];

export default function AgentListFilter({
    search,
    onSearchChange,
    persona,
    onPersonaChange,
    decision,
    onDecisionChange,
    resultsCount,
    isAISearch,
    onToggleAI,
    isSearching
}: AgentListFilterProps) {
    return (
        <div 
            style={{ 
                display: "flex", 
                gap: 10, 
                padding: "12px 16px", 
                background: "rgba(255,255,255,0.02)", 
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                alignItems: "center",
                flexShrink: 0,
                backdropFilter: "blur(8px)"
            }}
        >
            <div style={{ position: "relative", flex: 1, display: "flex", gap: 4 }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <input 
                        type="text" 
                        placeholder={isAISearch ? "AI_FILTER_SEARCH (e.g. 'healthcare professionals')..." : "FILTER_POPULATION..."}
                        className="terminal-select"
                        style={{ 
                            width: "100%", 
                            paddingRight: 40,
                            borderRadius: "100px",
                            height: "32px",
                            background: "rgba(0,0,0,0.3)",
                            borderColor: isAISearch ? "var(--orange)" : "rgba(255,255,255,0.1)",
                            boxShadow: isAISearch ? "0 0 15px rgba(255, 107, 53, 0.15)" : "none",
                            fontSize: "10px",
                            letterSpacing: "0.02em"
                        }}
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && isAISearch) {
                                // Trigger AI search handled by parent
                            }
                        }}
                    />
                    {isSearching && (
                        <div style={{
                            position: "absolute",
                            right: 32,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 12,
                            height: 12,
                            border: "1px solid var(--orange)",
                            borderTopColor: "transparent",
                            borderRadius: "50%",
                            animation: "spin 0.6s linear infinite"
                        }} />
                    )}
                    {search && !isSearching && (
                        <button 
                            onClick={() => onSearchChange("")}
                            style={{
                                position: "absolute",
                                right: 32,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                color: "var(--muted)",
                                cursor: "pointer",
                                fontSize: 10
                            }}
                        >
                            ×
                        </button>
                    )}
                    <button
                        onClick={onToggleAI}
                        style={{
                            position: "absolute",
                            right: 6,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            color: isAISearch ? "var(--orange)" : "var(--muted)",
                            cursor: "pointer",
                            fontSize: 14,
                            opacity: isAISearch ? 1 : 0.5,
                            transition: "all 0.2s ease"
                        }}
                        title="TOGGLE_AI_SEMANTIC_FILTER"
                    >
                        ✦
                    </button>
                </div>
            </div>

            <select 
                className="terminal-select" 
                value={persona} 
                onChange={(e) => onPersonaChange(e.target.value as any)}
                style={{ width: 130, borderRadius: "100px", height: "32px", background: "rgba(0,0,0,0.3)", borderColor: "rgba(255,255,255,0.1)", fontSize: "9px" }}
            >
                <option value="all">ALL_PERSONAS</option>
                {PERSONAS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
            </select>

            <select 
                className="terminal-select" 
                value={decision === null ? "null" : decision} 
                onChange={(e) => {
                    const val = e.target.value;
                    onDecisionChange(val === "all" ? "all" : val === "null" ? null : val as any);
                }}
                style={{ width: 130, borderRadius: "100px", height: "32px", background: "rgba(0,0,0,0.3)", borderColor: "rgba(255,255,255,0.1)", fontSize: "9px" }}
            >
                <option value="all">ALL_DECISIONS</option>
                <option value="support">SUPPORT</option>
                <option value="neutral">NEUTRAL</option>
                <option value="oppose">OPPOSE</option>
                <option value="null">PENDING</option>
            </select>

            <div style={{ 
                fontFamily: "var(--mono)", 
                fontSize: 10, 
                color: isAISearch && search ? "var(--orange)" : "var(--muted)", 
                marginLeft: 8,
                whiteSpace: "nowrap"
            }}>
                {resultsCount} MATCHES {isAISearch && search && "✨"}
            </div>
        </div>
    );
}
