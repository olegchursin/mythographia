"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/** Contents list that tracks the section currently being read. */
export function TocSpy({ items, label }: { items: { id: string; text: string }[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label={label}>
      <p className="label mb-3">{label}</p>
      <ol className="border-l border-line font-sans text-sm">
        {items.map((t) => (
          <li key={t.id} className="relative">
            {active === t.id && <motion.span layoutId="toc-marker" className="absolute -left-px top-0 h-full w-px bg-gold shadow-[0_0_10px_var(--gold)]" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            <a href={`#${t.id}`} aria-current={active === t.id ? "location" : undefined} className={`block py-1.5 pl-4 transition-colors ${active === t.id ? "text-ink" : "text-muted hover:text-ink"}`}>{t.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
