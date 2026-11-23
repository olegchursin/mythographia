"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { plural } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { searchItems, type SearchItem } from "@/lib/search";
import { Icon } from "./icons";
import { useLocale, useLocalize } from "./Link";

/** The part of the screen actually visible — on phones this shrinks when the on-screen keyboard opens. */
function useVisibleViewport(active: boolean) {
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  useLayoutEffect(() => {
    if (!active) return;
    const vv = window.visualViewport;
    const update = () => setBox(vv ? { top: vv.offsetTop, height: vv.height } : { top: 0, height: window.innerHeight });
    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [active]);
  return active ? box : null;
}

/** Anything on the page can open the palette: window.dispatchEvent(new Event(OPEN_PALETTE)). */
export const OPEN_PALETTE = "mythographia:open-palette";

const SHORTCUTS = [
  { key: "index", href: "/a-z", glyph: "☰" },
  { key: "graph", href: "/graph", glyph: "✳" },
  { key: "tree", href: "/tree/zeus", glyph: "⑂" },
  { key: "kinship", href: "/kinship", glyph: "⟷" },
  { key: "traditions", href: "/traditions", glyph: "❦" },
  { key: "sources", href: "/sources", glyph: "§" },
] as const;

export function CommandSearch({ index, t }: { index: SearchItem[]; t: Dictionary["search"] }) {
  const router = useRouter();
  const locale = useLocale();
  const localize = useLocalize();
  const input = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const viewport = useVisibleViewport(open);
  const results = useMemo(() => searchItems(index, query, Infinity, locale), [index, query, locale]);
  const rows = query.trim()
    ? results.map((r) => ({ key: r.slug, href: `/wiki/${r.slug}`, name: r.name, hint: r.hint, glyph: r.glyph ?? "·" }))
    : SHORTCUTS.map((s) => ({ key: s.href, href: s.href, glyph: s.glyph, ...t.shortcuts[s.key] }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // A new query starts at the top of the list.
  useEffect(() => {
    list.current?.scrollTo({ top: 0 });
  }, [query]);

  // Keyboard navigation drags the list along with the highlight (hover doesn't, so wheel scrolling never fights it).
  const moveTo = (i: number) => {
    setActive(i);
    document.getElementById(`palette-${i}`)?.scrollIntoView({ block: "nearest" });
  };

  const close = () => {
    setOpen(false);
    setQuery("");
    setActive(0);
    returnFocus.current?.focus?.();
  };

  const go = (href: string) => {
    close();
    router.push(localize(href), { transitionTypes: ["nav-forward"] });
  };

  return (
    <>
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              key="palette"
              className="fixed inset-x-0 top-0 z-[80] flex h-dvh items-start justify-center pb-[calc(var(--safe-b)+0.75rem)] pl-[calc(var(--safe-l)+1rem)] pr-[calc(var(--safe-r)+1rem)] pt-[calc(var(--safe-t)+0.75rem)] sm:pb-[8vh] sm:pt-[14vh]"
              style={viewport ? { top: viewport.top, height: viewport.height } : undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" onClick={close} aria-hidden />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={t.open}
                className="relative flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-[var(--r-panel)] border border-line bg-card shadow-[var(--shadow-pop)]"
                initial={{ opacity: 0, y: -18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              >
                <div className="m-2.5 mb-0 flex shrink-0 items-center gap-3 rounded-full bg-surface px-4">
                  <Icon name="search" className="size-[18px] shrink-0 text-muted" />
                  <input
                    ref={input}
                    autoFocus
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActive(0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") moveTo(Math.min(active + 1, rows.length - 1));
                      else if (e.key === "ArrowUp") moveTo(Math.max(active - 1, 0));
                      else if (e.key === "Enter" && rows[active]) go(rows[active].href);
                      else if (e.key === "Escape") close();
                      else if (e.key !== "Tab") return; // Tab is swallowed: focus stays in the dialog
                      e.preventDefault();
                    }}
                    role="combobox"
                    aria-expanded="true"
                    aria-controls="palette-list"
                    aria-activedescendant={rows[active] ? `palette-${active}` : undefined}
                    aria-autocomplete="list"
                    placeholder={t.placeholder}
                    className="h-12 w-full bg-transparent text-base outline-none placeholder:text-muted focus-visible:outline-none"
                  />
                  <kbd className="rounded-md border border-line bg-card px-1.5 py-0.5 font-sans text-[0.68rem] text-muted pointer-coarse:hidden">esc</kbd>
                  <button type="button" onClick={close} className="hidden shrink-0 py-2 font-sans text-sm font-medium text-brand pointer-coarse:inline">{t.closeShort}</button>
                </div>

                <p className="label shrink-0 px-5 pb-1 pt-3.5">{query.trim() ? plural(locale, results.length, t.entries) : t.jumpTo}</p>
                <ul ref={list} id="palette-list" role="listbox" className="palette-list min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
                  {rows.length === 0 && <li className="px-4 py-6 text-center text-muted">{t.empty}</li>}
                  {rows.map((r, i) => (
                    <li key={r.key} id={`palette-${i}`} role="option" aria-selected={i === active}>
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => go(r.href)}
                        onMouseMove={() => setActive(i)}
                        className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left"
                      >
                        {i === active && <motion.span layoutId="palette-active" className="absolute inset-0 rounded-xl bg-surface" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                        <span className="glyph-tile relative size-9 text-base" aria-hidden>{r.glyph}</span>
                        <span className="relative min-w-0 flex-1">
                          <span className="block truncate text-[0.95rem] font-medium">{r.name}</span>
                          <span className="block truncate font-sans text-xs text-muted first-letter:uppercase">{r.hint}</span>
                        </span>
                        {i === active && <span className="relative font-sans text-xs font-medium text-brand" aria-hidden>↵</span>}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="flex shrink-0 gap-4 border-t border-line px-5 py-2.5 font-sans text-[0.7rem] text-muted pointer-coarse:hidden"><span>{t.navigate}</span><span>{t.choose}</span><span>{t.close}</span></p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
