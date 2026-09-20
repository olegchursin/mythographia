"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -8% 0px" } as const;

type Tag = "div" | "section" | "li" | "ul" | "ol" | "span" | "p";

interface RevealProps {
  children: React.ReactNode;
  as?: Tag;
  className?: string;
  delay?: number;
  /** travel distance in px */
  y?: number;
  id?: string;
}

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({ children, as = "div", className, delay = 0, y = 28, id }: RevealProps) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={VIEWPORT}
      transition={{ duration: 0.85, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } },
};

/** Parent for a cascade: each <StaggerItem> follows the previous by a beat. */
export function Stagger({ children, as = "div", className }: { children: React.ReactNode; as?: Tag; className?: string }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp className={className} variants={container} initial={reduce ? false : "hidden"} whileInView="show" viewport={VIEWPORT}>
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, as = "div", className }: { children: React.ReactNode; as?: Tag; className?: string }) {
  const Comp = motion[as] as typeof motion.div;
  return <Comp className={className} variants={item}>{children}</Comp>;
}
