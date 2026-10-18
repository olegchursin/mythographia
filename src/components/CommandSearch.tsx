"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Item {
  slug: string;
  name: string;
  hint: string;
  aliases: string[];
  glyph?: string | null;
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function searchItems(index: Item[], query: string, limit = 8): Item[] {
  const q = norm(query.trim());
  if (!q) return [];
  const scored: [number, Item][] = [];
  for (const item of index) {
    const names = [item.name, ...item.aliases].map(norm);
    const score = names.some((n) => n === q) ? 0 : names.some((n) => n.startsWith(q)) ? 1 : names.some((n) => n.includes(q)) ? 2 : norm(item.hint).includes(q) ? 3 : -1;
    if (score >= 0) scored.push([score, item]);
  }
  return scored.sort((a, b) => a[0] - b[0] || a[1].name.localeCompare(b[1].name)).slice(0, limit).map(([, item]) => item);
}

/** Anything on the page can open the palette: window.dispatchEvent(new Event(OPEN_PALETTE)). */
export const OPEN_PALETTE = "mythographia:open-palette";

const SHORTCUTS = [
  { href: "/a-z", name: "Index", hint: "Every entry, A to Z", glyph: "☰" },
  { href: "/graph", name: "Relations diagram", hint: "Kin, consorts, enemies and allies", glyph: "✳" },
  { href: "/tree/zeus", name: "Family trees", hint: "Ancestors and descendants", glyph: "⑂" },
  { href: "/kinship", name: "Kinship finder", hint: "How two figures are related", glyph: "⟷" },
  { href: "/traditions", name: "Traditions", hint: "Who tells which version", glyph: "❦" },
  { href: "/sources", name: "Ancient sources", hint: "The texts cited", glyph: "§" },
];

export function CommandSearch({ index }: { index: Item[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = useMemo(() => searchItems(index, query, 9), [index, query]);
  const rows = query.trim()
    ? results.map((r) => ({ key: r.slug, href: `/wiki/${r.slug}`, name: r.name, hint: r.hint, glyph: r.glyph ?? "·" }))
    : SHORTCUTS.map((s) => ({ key: s.href, ...s }));

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
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setActive(0);
    trigger.current?.focus();
  };

  const go = (href: string) => {
    close();
    router.push(href, { transitionTypes: ["nav-forward"] });
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Search the encyclopedia"
        className="group flex h-10 items-center gap-2.5 rounded-full border border-line bg-glass pl-3.5 pr-2 font-sans text-sm text-muted transition-colors hover:border-gold/50 hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
        <span className="hidden pr-6 sm:inline">Search…</span>
        <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[0.68rem] tracking-wide sm:inline">⌘K</kbd>
      </button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              key="palette"
              className="fixed inset-0 z-[80] flex items-start justify-center pl-[calc(var(--safe-l)+1rem)] pr-[calc(var(--safe-r)+1rem)] pt-[calc(var(--safe-t)+0.75rem)] sm:pt-[14vh]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={close} aria-hidden />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Search the encyclopedia"
                className="relative w-full max-w-xl overflow-hidden rounded-[22px] border border-line bg-[var(--glass-strong)] shadow-[0_40px_120px_-20px_rgb(0_0_0/0.8)] backdrop-blur-2xl"
                initial={{ opacity: 0, y: -18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              >
                <div className="flex items-center gap-3 border-b border-line px-5">
                  <svg viewBox="0 0 24 24" className="size-5 text-gold" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
                  <input
                    ref={input}
                    autoFocus
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActive(0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, rows.length - 1));
                      else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
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
                    placeholder="Search gods, heroes, monsters, places…"
                    className="h-16 w-full bg-transparent text-lg outline-none placeholder:text-muted focus-visible:outline-none"
                  />
                  <kbd className="rounded-md border border-line px-1.5 py-0.5 font-sans text-[0.68rem] text-muted pointer-coarse:hidden">esc</kbd>
                  <button type="button" onClick={close} className="hidden shrink-0 py-2 font-sans text-sm text-gold pointer-coarse:inline">Close</button>
                </div>

                <p className="label px-5 pb-1 pt-4">{query.trim() ? `${results.length} ${results.length === 1 ? "entry" : "entries"}` : "Jump to"}</p>
                <ul id="palette-list" role="listbox" className="max-h-[38dvh] overflow-y-auto overscroll-contain p-2 sm:max-h-[50vh]">
                  {rows.length === 0 && <li className="px-4 py-6 text-center text-muted">Nothing in the surviving sources answers to that name.</li>}
                  {rows.map((r, i) => (
                    <li key={r.key} id={`palette-${i}`} role="option" aria-selected={i === active}>
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => go(r.href)}
                        onMouseMove={() => setActive(i)}
                        className="relative flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left"
                      >
                        {i === active && <motion.span layoutId="palette-active" className="absolute inset-0 rounded-xl border border-gold/25 bg-gold/10" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                        <span className="relative grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-glass text-base" aria-hidden>{r.glyph}</span>
                        <span className="relative min-w-0 flex-1">
                          <span className="block truncate font-semibold">{r.name}</span>
                          <span className="block truncate font-sans text-xs text-muted first-letter:uppercase">{r.hint}</span>
                        </span>
                        {i === active && <span className="relative font-sans text-xs text-gold" aria-hidden>↵</span>}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="flex gap-4 border-t border-line px-5 py-2.5 font-sans text-[0.7rem] text-muted pointer-coarse:hidden"><span>↑↓ navigate</span><span>↵ open</span><span>esc close</span></p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
