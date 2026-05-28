"use client";

import { useRef, ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function GlowCard({ children, className = "", style = {} }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  };

  return (
    <div
      ref={cardRef}
      className={`feature-icon-card ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
}
