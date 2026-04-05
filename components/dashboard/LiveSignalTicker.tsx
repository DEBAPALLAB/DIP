"use client";

import { useSimulation } from "@/lib/SimulationContext";
import { useEffect, useRef } from "react";

export default function LiveSignalTicker() {
    const { liveTicker } = useSimulation();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [liveTicker]);

    if (liveTicker.length === 0) return null;

    return (
        <div className="live-ticker-root">
            <div className="live-ticker-header">
                <span className="live-ticker-dot" />
                LIVE_STRATEGIC_FEED
            </div>
            <div className="live-ticker-scroll" ref={scrollRef}>
                {liveTicker.map((item, i) => (
                    <div key={i} className={`live-ticker-item type-${item.type}`}>
                        <span className="live-ticker-time">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                        <span className="live-ticker-msg">{item.msg}</span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .live-ticker-root {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    width: 320px;
                    background: rgba(0, 0, 0, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 4px;
                    z-index: 1000;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideIn {
                    from { transform: translateX(-20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                .live-ticker-header {
                    padding: 6px 10px;
                    background: rgba(255, 255, 255, 0.05);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    font-size: 9px;
                    font-weight: 800;
                    color: var(--muted);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    letter-spacing: 0.1em;
                }

                .live-ticker-dot {
                    width: 6px;
                    height: 6px;
                    background: #ff3b3b;
                    border-radius: 50%;
                    animation: blink 1s infinite;
                }

                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }

                .live-ticker-scroll {
                    max-height: 120px;
                    overflow-y: auto;
                    padding: 8px 0;
                    display: flex;
                    flex-direction: column;
                }

                .live-ticker-scroll::-webkit-scrollbar {
                    width: 2px;
                }
                .live-ticker-scroll::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                }

                .live-ticker-item {
                    padding: 4px 10px;
                    font-size: 10px;
                    line-height: 1.4;
                    border-left: 2px solid transparent;
                    margin-bottom: 2px;
                    animation: fadeInMsg 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes fadeInMsg {
                    from { opacity: 0; transform: translateX(-4px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .type-alert { border-left-color: #ff3b3b; color: #ff8e8e; background: rgba(255, 59, 59, 0.05); }
                .type-success { border-left-color: var(--support); color: #8effb1; }
                .type-info { border-left-color: var(--muted); color: #ccc; }

                .live-ticker-time {
                    color: rgba(255, 255, 255, 0.3);
                    margin-right: 8px;
                    font-size: 8px;
                }

                .live-ticker-msg {
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }
            `}</style>
        </div>
    );
}
