"use client";

import { motion, useReducedMotion } from "motion/react";

/** Headline that rises into place word by word. `gild` names the words that take the gold gradient. */
export function SplitWords({ text, className, gild = [], delay = 0.1 }: { text: string; className?: string; gild?: string[]; delay?: number }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className={`inline-block ${gild.includes(w.replace(/[^\p{L}]/gu, "")) ? "text-gilded" : ""}`}
            initial={reduce ? false : { y: "110%", rotate: 4 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.06 }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </span>
  );
}
