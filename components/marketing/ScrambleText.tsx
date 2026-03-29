"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ScrambleTextProps {
  text: string;
  duration?: number;
  revealSpeed?: number;
  scrambleSpeed?: number;
  characters?: string;
  className?: string;
  triggerOnHover?: boolean;
}

const DEFAULT_CHARS = "0123456789ABCDEF!@#$%^&*";

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  duration = 600, // Faster default
  revealSpeed = 40,
  scrambleSpeed = 30,
  characters = DEFAULT_CHARS,
  className = "",
  triggerOnHover = true
}) => {
  const [displayText, setDisplayText] = useState(text); 
  const isAnimating = useRef(false);

  const startScramble = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text.split("").map((char, index) => {
          if (index < iteration) return text[index];
          if (char === " ") return " ";
          return characters[Math.floor(Math.random() * characters.length)];
        }).join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        isAnimating.current = false;
      }

      iteration += text.length / (duration / revealSpeed);
    }, scrambleSpeed);
    
    return () => clearInterval(interval);
  }, [text, duration, revealSpeed, scrambleSpeed, characters]);

  useEffect(() => {
    const unsub = startScramble();
    return () => { if (unsub) unsub(); };
  }, [startScramble]);

  return (
    <span 
      className={className} 
      style={{ display: "inline-block", minWidth: `${text.length}ch` }} // Lock width
      onMouseEnter={() => triggerOnHover && startScramble()}
    >
      {displayText}
    </span>
  );
};
