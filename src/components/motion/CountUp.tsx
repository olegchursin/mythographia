"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/** Counts from zero to `value` once visible. Renders the final value on the server so it is never blank. */
export function CountUp({ value, className, locale = "en" }: { value: number; className?: string; locale?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || reduce || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = Math.round(v).toLocaleString(locale)),
    });
    return () => controls.stop();
  }, [inView, reduce, value, locale]);

  return <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>{value.toLocaleString(locale)}</span>;
}
