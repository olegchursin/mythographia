"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** degrees of 3D tilt toward the cursor; 0 disables */
  tilt?: number;
}

/** A .card whose highlight follows the cursor, with an optional slight 3D tilt. */
export function SpotlightCard({ children, className = "", tilt = 5 }: Props) {
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });

  return (
    <motion.div
      className={`card card-hover ${className}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", `${px * 100}%`);
        el.style.setProperty("--my", `${py * 100}%`);
        if (reduce || !tilt || e.pointerType !== "mouse") return;
        rx.set((0.5 - py) * tilt);
        ry.set((px - 0.5) * tilt);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
