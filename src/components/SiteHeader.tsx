"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CommandSearch } from "./CommandSearch";
import { ThemeToggle } from "./ThemeToggle";

type NavItem = { href: string; label: string; match: string };
type SearchIndex = React.ComponentProps<typeof CommandSearch>["index"];

export function SiteHeader({ nav, index }: { nav: NavItem[]; index: SearchIndex }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 320 && y > prev);
  });

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  return (
    <>
      <div className="status-veil" aria-hidden />
      <motion.header
        className="fixed inset-x-0 top-0 z-50 pl-[calc(var(--safe-l)+0.75rem)] pr-[calc(var(--safe-r)+0.75rem)] pt-[calc(var(--safe-t)+0.75rem)] sm:pl-[calc(var(--safe-l)+1.25rem)] sm:pr-[calc(var(--safe-r)+1.25rem)]"
        style={{ viewTransitionName: "site-header" }}
        animate={{ y: hidden && !menu ? "-120%" : "0%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={`mx-auto flex max-w-6xl items-center gap-2 rounded-full border py-2 pl-4 pr-2 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 sm:gap-3 sm:pl-5 sm:pr-3 ${
            scrolled ? "border-line bg-[var(--glass-strong)] shadow-[0_18px_50px_-24px_rgb(0_0_0/0.8)] backdrop-blur-xl" : "border-transparent bg-transparent"
          }`}
        >
          <Link href="/" className="shrink-0 whitespace-nowrap font-display text-[0.9rem] font-bold tracking-[0.16em] transition-colors sm:text-[1.05rem] sm:tracking-[0.22em] hover:text-gold" aria-label="Mythographia — front page">
            MYTHO<span className="text-gold">GRAPHIA</span>
          </Link>

          <nav className="ml-4 hidden items-center lg:flex" aria-label="Main">
            {nav.map((n) => {
              const active = pathname.startsWith(n.match);
              return (
                <Link key={n.href} href={n.href} transitionTypes={["nav-forward"]} aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-3.5 py-2 font-sans text-[0.84rem] transition-colors ${active ? "text-ink" : "text-muted hover:text-ink"}`}>
                  {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full border border-gold/30 bg-gold/10" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="relative">{n.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <CommandSearch index={index} />
            {/* below 360px the toggle moves into the menu so the header fits */}
            <div className="contents max-[359px]:hidden"><ThemeToggle /></div>
            <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Menu" className="grid size-10 place-items-center rounded-full border border-line bg-glass lg:hidden">
              <span className="relative block h-3 w-4">
                <span className={`absolute inset-x-0 top-0 h-px bg-ink transition-transform duration-300 ${menu ? "translate-y-[6px] rotate-45" : ""}`} />
                <span className={`absolute inset-x-0 bottom-0 h-px bg-ink transition-transform duration-300 ${menu ? "-translate-y-[5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {menu && (
            <motion.div key="menu" className="fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-[var(--glass-strong)] pb-[calc(var(--safe-b)+2rem)] pl-[calc(var(--safe-l)+2rem)] pr-[calc(var(--safe-r)+2rem)] pt-[calc(var(--safe-t)+6rem)] backdrop-blur-2xl lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <nav aria-label="Main (mobile)" className="my-auto">
                <ul className="space-y-2">
                  {nav.map((n, i) => (
                    <motion.li key={n.href} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.05 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                      <Link href={n.href} onClick={() => setMenu(false)} className={`block py-2 font-display text-3xl font-bold tracking-wide ${pathname.startsWith(n.match) ? "text-gilded" : ""}`}>{n.label}</Link>
                    </motion.li>
                  ))}
                </ul>
                <motion.div className="mt-8 flex items-center gap-3 border-t border-line pt-6 font-sans text-sm text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <ThemeToggle /> Theme
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
