"use client";

import { useEffect, useRef, useState } from "react";

interface WordItem {
  text: string;
  isAccent?: boolean;
  isMuted?: boolean;
}

export function ManifestoTextReveal() {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect(); // One-sided: only animate once on appear
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const rawWords: WordItem[] = [
    { text: "Built" },
    { text: "on" },
    { text: "clear", isAccent: true },
    { text: "intention", isAccent: true },
    { text: "and" },
    { text: "rigorous" },
    { text: "mathematical" },
    { text: "craft," },
    { text: "we" },
    { text: "model" },
    { text: "buyer," },
    { text: "community," },
    { text: "and" },
    { text: "citizen" },
    { text: "mindsets" },
    { text: "to" },
    { text: "simulate" },
    { text: "propagation" },
    { text: "cascades." },
    { text: "Watch" },
    { text: "cascade" },
    { text: "contagions" },
    { text: "spread" },
    { text: "through" },
    { text: "small-world" },
    { text: "graphs" },
    { text: "so" },
    { text: "every" },
    { text: "strategic" },
    { text: "launch" },
    { text: "feels" },
    { text: "calm,", isMuted: true },
    { text: "predictable,", isMuted: true },
    { text: "and", isMuted: true },
    { text: "fully", isMuted: true },
    { text: "within", isMuted: true },
    { text: "your", isMuted: true },
    { text: "control.", isMuted: true },
  ];

  return (
    <p
      ref={containerRef}
      style={{
        fontFamily: "var(--sans)",
        fontSize: "clamp(26px, 3.8vw, 48px)",
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: "-0.04em",
        color: "var(--bright)",
        margin: 0,
      }}
    >
      {rawWords.map((word, idx) => {
        let color = "var(--bright)";
        let fontWeight: string | number = 700;
        let fontFamily = "var(--sans)";

        if (word.isAccent) {
          color = "var(--accent)";
          fontFamily = "'Plus Jakarta Sans', 'Inter', sans-serif";
          fontWeight = 300;
        } else if (word.isMuted) {
          color = "var(--muted)";
        }

        return (
          <span
            key={idx}
            style={{
              display: "inline-block",
              marginRight: "0.24em",
              color: color,
              fontFamily: fontFamily,
              fontWeight: fontWeight,
              opacity: revealed ? 1 : 0.08,
              transform: revealed ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: `${idx * 0.035}s`,
              willChange: "opacity, transform",
            }}
          >
            {word.text}
          </span>
        );
      })}
    </p>
  );
}
