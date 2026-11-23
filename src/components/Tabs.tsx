"use client";

import { useId, useState } from "react";

/** Pill tabs over server-rendered panels; inactive panels stay in the DOM, hidden. */
export function Tabs({ tabs, panels, label }: { tabs: string[]; panels: React.ReactNode[]; label: string }) {
  const [active, setActive] = useState(0);
  const id = useId();
  return (
    <div>
      <div role="tablist" aria-label={label} className="mb-4 flex flex-wrap gap-1">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const next = (active + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
              setActive(next);
              document.getElementById(`${id}-tab-${next}`)?.focus();
            }}
            className={`rounded-full px-3.5 py-1.5 text-[0.88rem] transition-colors ${i === active ? "bg-surface font-medium text-ink" : "text-muted hover:text-ink"}`}
          >
            {tab}
          </button>
        ))}
      </div>
      {panels.map((p, i) => (
        <div key={i} role="tabpanel" id={`${id}-panel-${i}`} aria-labelledby={`${id}-tab-${i}`} hidden={i !== active}>
          {p}
        </div>
      ))}
    </div>
  );
}
