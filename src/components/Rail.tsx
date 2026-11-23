"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

/** Horizontal snap rail with previous/next buttons for mouse users; touch users just swipe. */
export function Rail({ children, className = "", prev, next }: { children: React.ReactNode; className?: string; prev: string; next: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const page = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8 });
  const btn = "absolute top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-card text-ink shadow-[var(--shadow)] transition-opacity pointer-coarse:hidden";

  return (
    <div className="relative">
      <div ref={ref} className={`rail ${className}`}>{children}</div>
      <button type="button" onClick={() => page(-1)} aria-label={prev} tabIndex={-1} className={`${btn} -left-3 ${edge.start ? "pointer-events-none opacity-0" : ""}`}>
        <Icon name="chevronLeft" className="size-4" />
      </button>
      <button type="button" onClick={() => page(1)} aria-label={next} tabIndex={-1} className={`${btn} -right-3 ${edge.end ? "pointer-events-none opacity-0" : ""}`}>
        <Icon name="chevronRight" className="size-4" />
      </button>
    </div>
  );
}
