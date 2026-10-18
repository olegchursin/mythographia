"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { format } from "@/i18n/fill";
import type { Category } from "@/lib/graph";
import { useLocalize } from "./Link";

export interface GraphNode {
  slug: string;
  name: string;
  /** unit coordinates; the focus is at 0,0 */
  x: number;
  y: number;
  category: Category | "focus";
  /** "child of · enemy of" — from the focus's point of view */
  label: string;
  contested: boolean;
}

const U = 1000; // SVG units per layout unit
const COLOR: Record<GraphNode["category"], string> = {
  focus: "var(--ink)",
  family: "var(--olive)",
  romance: "var(--wine)",
  conflict: "var(--terracotta)",
  alliance: "var(--aegean)",
  association: "var(--gold)",
};

export function EgoGraph({ nodes, focusName, hrefFor, t }: { nodes: GraphNode[]; focusName: string; hrefFor: Record<string, string>; t: Dictionary["ego"] }) {
  const router = useRouter();
  const localize = useLocalize();
  const [hover, setHover] = useState<string | null>(null);
  const extent = Math.max(0.6, ...nodes.map((n) => Math.hypot(n.x, n.y))) + 0.18;
  const size = extent * U;
  const crowded = nodes.length > 60;
  const hovered = nodes.find((n) => n.slug === hover);
  const spring = { type: "spring", stiffness: 70, damping: 16 } as const;
  // Re-centring stays on /graph; only the focus node leaves for its article.
  const go = (slug: string) => router.push(localize(hrefFor[slug]), hrefFor[slug].startsWith("/wiki") ? { transitionTypes: ["nav-forward"] } : { scroll: false });

  return (
    <div className="relative">
      <svg viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`} className="mx-auto block aspect-square w-full max-w-[760px] select-none" role="img" aria-label={format(t.relationsOf, { name: focusName })}>
        <defs>
          <filter id="ego-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="9" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="ego-core">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle r={0.34 * U} fill="url(#ego-core)" />
        {[0.42, 0.62, 0.82, 1.02, 1.22].filter((ring) => ring < extent).map((ring) => (
          <circle key={ring} r={ring * U} fill="none" stroke="var(--line)" strokeWidth={1.5} strokeDasharray="3 10" />
        ))}

        <AnimatePresence initial={false}>
          {nodes.filter((n) => n.category !== "focus").map((n) => (
            <motion.line
              key={`edge-${n.slug}`}
              x1={0}
              y1={0}
              initial={{ x2: 0, y2: 0, opacity: 0 }}
              animate={{ x2: n.x * U, y2: n.y * U, opacity: hover && hover !== n.slug ? 0.1 : 0.45 }}
              exit={{ opacity: 0 }}
              transition={spring}
              stroke={COLOR[n.category]}
              strokeWidth={hover === n.slug ? 5 : 2.5}
              strokeDasharray={n.contested ? "9 9" : undefined}
            />
          ))}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {nodes.map((n) => {
            const isFocus = n.category === "focus";
            const r = isFocus ? 26 : crowded ? 11 : 14;
            return (
              <motion.g
                key={n.slug}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ x: n.x * U, y: n.y * U, opacity: hover && !isFocus && hover !== n.slug ? 0.35 : 1 }}
                exit={{ opacity: 0 }}
                transition={spring}
                onMouseEnter={() => setHover(n.slug)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(n.slug)}
                onBlur={() => setHover(null)}
                onClick={() => go(n.slug)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  go(n.slug);
                }}
                whileHover={{ scale: 1.12 }}
                style={{ cursor: "pointer", outline: "none" }}
                tabIndex={0}
                role="link"
                aria-label={isFocus ? format(t.openEntry, { name: n.name }) : `${n.name}: ${n.label}`}
              >
                <circle r={r * 2.2} fill="transparent" />
                <circle r={r} fill={isFocus ? "var(--paper)" : COLOR[n.category]} stroke={isFocus ? "var(--gold)" : "var(--paper)"} strokeWidth={isFocus ? 7 : 3} filter={isFocus || hover === n.slug ? "url(#ego-glow)" : undefined} />
                <text
                  y={r + (isFocus ? 50 : crowded ? 26 : 32)}
                  textAnchor="middle"
                  fontSize={isFocus ? 50 : crowded ? 24 : 30}
                  fontWeight={isFocus ? 700 : 500}
                  fill="var(--ink)"
                  stroke="var(--paper)"
                  strokeOpacity={0.85}
                  strokeWidth={8}
                  paintOrder="stroke"
                  style={{ fontFamily: "var(--font-source-serif), serif" }}
                >
                  {n.name}
                </text>
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>

      <p className="pointer-events-none absolute left-3 top-3 min-h-10 max-w-[80%] rounded-2xl border border-line bg-[var(--glass-strong)] px-4 py-2 text-[0.95rem] backdrop-blur-xl" aria-live="polite">
        {hovered && hovered.category !== "focus" ? (
          <>
            {focusName} — <span style={{ color: COLOR[hovered.category] }} className="font-semibold">{hovered.label}</span> — {hovered.name}
            {hovered.contested && <span className="ml-1 font-sans text-xs text-muted">{t.disputed}</span>}
          </>
        ) : (
          <span className="font-sans text-sm text-muted">{t.hint}</span>
        )}
      </p>
    </div>
  );
}
