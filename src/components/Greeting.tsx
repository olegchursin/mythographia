"use client";

import { motion } from "motion/react";
import { useSyncExternalStore } from "react";

type Greetings = { morning: string; afternoon: string; evening: string; night: string };

const noop = () => () => {};
const part = (h: number): keyof Greetings => (h < 5 ? "night" : h < 12 ? "morning" : h < 18 ? "afternoon" : h < 23 ? "evening" : "night");

/** "Good evening" in the reader's local time. The page is static, so it appears after hydration. */
export function Greeting({ t, className }: { t: Greetings; className?: string }) {
  const key = useSyncExternalStore(noop, () => part(new Date().getHours()), () => null);
  return (
    <p className={className} aria-hidden={!key}>
      {key ? <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>{t[key]}</motion.span> : " "}
    </p>
  );
}
