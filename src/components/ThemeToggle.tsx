"use client";

import { useSyncExternalStore } from "react";
import { THEME_COLORS } from "@/lib/theme";
import { Icon } from "./icons";

const DARK_QUERY = "(prefers-color-scheme: dark)";

const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const mq = matchMedia(DARK_QUERY);
  mq.addEventListener("change", cb);
  return () => {
    mo.disconnect();
    mq.removeEventListener("change", cb);
  };
};

/** The theme actually showing: an explicit choice, otherwise the OS setting. */
const effective = () => {
  const set = document.documentElement.dataset.theme;
  return set === "dark" || set === "light" ? set : matchMedia(DARK_QUERY).matches ? "dark" : "light";
};

export function ThemeToggle({ t, className = "" }: { t: { toDark: string; toLight: string }; className?: string }) {
  const theme = useSyncExternalStore(subscribe, effective, () => "light" as const);
  const dark = theme === "dark";

  const toggle = () => {
    const next = dark ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      // Keep the installed app's title/status bar in step with the page.
      document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", THEME_COLORS[next]));
    };
    try {
      localStorage.setItem("theme", next);
    } catch {}
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) document.startViewTransition(apply);
    else apply();
  };

  return (
    <button type="button" onClick={toggle} aria-label={dark ? t.toLight : t.toDark} title={dark ? t.toLight : t.toDark}
      className={`grid size-9 place-items-center rounded-[var(--r-ctl)] text-muted transition-colors hover:bg-hover hover:text-ink ${className}`}>
      <Icon name={dark ? "sun" : "moon"} />
    </button>
  );
}
