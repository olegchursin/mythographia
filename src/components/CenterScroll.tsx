"use client";

import { useEffect, useRef } from "react";

/** Horizontal scroller that opens centred, so a wide diagram shows its subject rather than its left edge. */
export function CenterScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
