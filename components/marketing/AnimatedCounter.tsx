"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  label: string;
}

export function AnimatedCounter({
  target,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 2000,
  label,
}: AnimatedCounterProps) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = parseFloat((eased * target).toFixed(decimals));
      setValue(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration, decimals]);

  const formatted =
    value >= 1000
      ? value.toLocaleString("en-US", { maximumFractionDigits: decimals })
      : value.toFixed(decimals);

  return (
    <div className="stat-item-new" ref={ref}>
      <div className="stat-num">
        {prefix}
        {formatted}
        {suffix && <span className="stat-unit">{suffix}</span>}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
