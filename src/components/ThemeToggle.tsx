"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};

export function ThemeToggle({ t }: { t: { toDark: string; toLight: string } }) {
  const light = useSyncExternalStore(subscribe, () => document.documentElement.dataset.theme === "light", () => false);

  const toggle = () => {
    const next = light ? "dark" : "light";
    const apply = () => {
      if (next === "light") document.documentElement.dataset.theme = "light";
      else delete document.documentElement.dataset.theme;
      // Keep the installed app's title/status bar in step with the page.
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#f7f3ea" : "#0a0908");
    };
    try {
      localStorage.setItem("theme", next);
    } catch {}
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) document.startViewTransition(apply);
    else apply();
  };

  return (
    <button type="button" onClick={toggle} aria-label={light ? t.toDark : t.toLight} className="grid size-10 place-items-center rounded-full border border-line bg-glass text-muted transition-colors hover:border-gold/50 hover:text-gold">
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
        {light ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
