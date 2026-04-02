"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1500,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const { ref, isInView } = useInView();
  const [display, setDisplay] = useState(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {isInView ? display.toLocaleString() : "0"}
      {suffix}
    </span>
  );
}
