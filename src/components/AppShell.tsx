"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { SearchItem } from "@/lib/search";
import { CommandSearch, OPEN_PALETTE } from "./CommandSearch";
import { BrandMark, Icon, type IconName } from "./icons";
import { LanguageSwitch } from "./LanguageSwitch";
import Link from "./Link";
import { ThemeToggle } from "./ThemeToggle";

export type NavGroup = "browse" | "tools" | "reference";
export type NavItem = { href: string; label: string; match: string; icon: IconName; group: NavGroup };
type Strings = Pick<Dictionary, "brand" | "header" | "theme" | "search" | "language" | "shell" | "nav">;

const GROUPS: NavGroup[] = ["browse", "tools", "reference"];
const openPalette = () => window.dispatchEvent(new Event(OPEN_PALETTE));

/** Magnific-style app frame: sidebar on the canvas, content in an inset panel with a slim top bar. */
export function AppShell({ nav, index, names, t, footer, children }: {
  nav: NavItem[];
  index: SearchItem[];
  /** display names for breadcrumb tails, keyed "traditions/<key>" and "sources/<slug>" */
  names: Record<string, string>;
  t: Strings;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  // Matched against nav paths, which carry no locale.
  const pathname = usePathname().replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const [drawer, setDrawer] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setDrawer(false);
  }

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawer]);

  const brand = (t.brand.start + t.brand.end).toLowerCase();

  return (
    <>
      <div className="status-veil" aria-hidden />
      <div className="lg:grid lg:grid-cols-[var(--sidebar-w)_minmax(0,1fr)]">
        <aside className="sb-desktop sticky top-0 hidden h-dvh overflow-y-auto pl-[var(--safe-l)] [scrollbar-width:none] lg:block">
          <SidebarBody nav={nav} t={t} pathname={pathname} brand={brand} desktop />
        </aside>
        <div className="panel">
          <TopBar t={t} nav={nav} pathname={pathname} index={index} names={names} brand={brand} onMenu={() => setDrawer(true)} />
          <main className="flex-1">{children}</main>
          {footer}
        </div>
      </div>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {drawer && (
            <motion.div key="drawer" className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawer(false)} aria-hidden />
              <motion.aside
                role="dialog"
                aria-modal="true"
                aria-label={t.header.mainMobile}
                className="absolute inset-y-0 left-0 w-[min(18rem,85vw)] overflow-y-auto overscroll-contain bg-canvas pl-[var(--safe-l)] shadow-[var(--shadow-pop)]"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 420, damping: 40 }}
              >
                <SidebarBody nav={nav} t={t} pathname={pathname} brand={brand} onClose={() => setDrawer(false)} />
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      <CommandSearch index={index} t={t.search} />
    </>
  );
}

function SidebarBody({ nav, t, pathname, brand, desktop, onClose }: { nav: NavItem[]; t: Strings; pathname: string; brand: string; desktop?: boolean; onClose?: () => void }) {
  // Entries live under /wiki but belong to the Index.
  const active = (n: NavItem) => (n.match === "/" ? pathname === "/" : pathname.startsWith(n.match) || (n.match === "/a-z" && pathname.startsWith("/wiki")));
  const toggleCollapsed = () => {
    const root = document.documentElement;
    const collapsed = root.dataset.sidebar !== "collapsed";
    if (collapsed) root.dataset.sidebar = "collapsed";
    else delete root.dataset.sidebar;
    try {
      localStorage.setItem("sidebar", collapsed ? "collapsed" : "open");
    } catch {}
  };

  return (
    <div className="flex h-full min-h-full flex-col gap-1 px-3 pb-[calc(var(--safe-b)+0.75rem)] pt-[calc(var(--safe-t)+0.75rem)]">
      <div className="sb-center flex h-11 items-center gap-2.5 px-1.5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label={t.header.home} onClick={onClose}>
          <BrandMark />
          <span className="sb-label truncate text-[1.02rem] font-semibold capitalize tracking-tight">{brand}</span>
        </Link>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={t.search.close} className="ml-auto grid size-9 place-items-center rounded-[var(--r-ctl)] text-muted hover:bg-hover hover:text-ink">
            <Icon name="close" />
          </button>
        )}
      </div>

      <button type="button" onClick={() => { onClose?.(); openPalette(); }} title={t.shell.search}
        className="sb-center mb-2 mt-2 flex h-10 items-center gap-2.5 rounded-[var(--r-ctl)] bg-brand px-3 font-medium text-on-brand transition-colors hover:bg-[var(--brand-hover)]">
        <Icon name="search" className="size-[18px] shrink-0" strokeWidth={2} />
        <span className="sb-label flex-1 text-left text-[0.9rem]">{t.shell.search}</span>
        <kbd className="sb-label rounded-md bg-black/15 px-1.5 py-0.5 text-[0.68rem] font-medium pointer-coarse:hidden">⌘K</kbd>
      </button>

      <nav aria-label={desktop ? t.header.main : t.header.mainMobile} className="flex flex-col gap-0.5">
        {GROUPS.map((g, gi) => (
          <Fragment key={g}>
            {gi > 0 && <hr className="mx-2 my-2.5 border-line" />}
            {gi > 0 && <p className="sb-label label px-3 pb-1">{t.shell.groups[g]}</p>}
            {nav.filter((n) => n.group === g).map((n) => (
              <Link key={n.href} href={n.href} transitionTypes={["nav-forward"]} onClick={onClose} aria-current={active(n) ? "page" : undefined} title={n.label} className="nav-item">
                <Icon name={n.icon} />
                <span className="sb-label truncate">{n.label}</span>
              </Link>
            ))}
          </Fragment>
        ))}
      </nav>

      <div className="sb-stack mt-auto flex items-center gap-1.5 pt-4">
        <LanguageSwitch label={t.language.label} className="sb-label flex-1" />
        <ThemeToggle t={t.theme} />
        {desktop && (
          <button type="button" onClick={toggleCollapsed} aria-label={t.shell.collapse} title={t.shell.collapse}
            className="grid size-9 place-items-center rounded-[var(--r-ctl)] text-muted transition-colors hover:bg-hover hover:text-ink">
            <Icon name="sidebar" />
          </button>
        )}
      </div>
    </div>
  );
}

function TopBar({ t, nav, pathname, index, names, brand, onMenu }: { t: Strings; nav: NavItem[]; pathname: string; index: SearchItem[]; names: Record<string, string>; brand: string; onMenu: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const crumbs = breadcrumbs(pathname, nav, index, names, t.shell.home);
  const home = pathname === "/";

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className={`sticky top-0 z-40 border-b pt-[var(--safe-t)] backdrop-blur-xl transition-colors duration-300 lg:rounded-t-[var(--r-panel)] ${scrolled ? "border-line bg-[color-mix(in_srgb,var(--paper)_88%,transparent)]" : "border-transparent bg-paper"}`}
    >
      <div className="grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 sm:px-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)_minmax(0,1fr)]">
        <div className="flex min-w-0 items-center gap-1.5">
          <button type="button" onClick={onMenu} aria-label={t.header.menu} className="grid size-9 shrink-0 place-items-center rounded-[var(--r-ctl)] text-ink hover:bg-hover lg:hidden">
            <Icon name="menu" />
          </button>
          <Link href="/" aria-label={t.header.home} className="mr-1 shrink-0 lg:hidden"><BrandMark className="size-7" /></Link>
          <span className="sr-only">{brand}</span>
          <nav aria-label={t.shell.breadcrumb} className="min-w-0">
            <ol className="flex min-w-0 items-center gap-1 text-[0.85rem]">
              {crumbs.map((c, i) => {
                const last = i === crumbs.length - 1;
                return (
                  <li key={i} className={`flex items-center gap-1 ${last ? "min-w-0" : "shrink-0 max-sm:hidden"}`}>
                    {i > 0 && <Icon name="chevronRight" className="size-3.5 shrink-0 text-muted max-sm:hidden" />}
                    {last || !c.href ? (
                      <span aria-current={last ? "page" : undefined} className={`truncate ${last ? "font-medium text-ink" : "text-muted"}`}>{c.label}</span>
                    ) : (
                      <Link href={c.href} className="truncate text-muted transition-colors hover:text-ink">{c.label}</Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        <button type="button" onClick={openPalette} aria-haspopup="dialog" aria-label={t.search.open}
          className={`hidden h-10 w-full items-center gap-2.5 rounded-full bg-surface pl-4 pr-2 text-[0.88rem] text-muted transition-colors hover:bg-hover hover:text-ink lg:flex ${home ? "invisible" : ""}`}>
          <Icon name="search" className="size-4" />
          <span className="flex-1 truncate text-left">{t.search.placeholder}</span>
          <kbd className="rounded-md border border-line bg-card px-1.5 py-0.5 text-[0.68rem] text-muted">⌘K</kbd>
        </button>

        <div className="flex justify-end">
          <button type="button" onClick={openPalette} aria-haspopup="dialog" aria-label={t.search.open} className="grid size-9 place-items-center rounded-[var(--r-ctl)] text-ink hover:bg-hover lg:hidden">
            <Icon name="search" />
          </button>
        </div>
      </div>
    </header>
  );
}

type Crumb = { label: string; href?: string };

function breadcrumbs(pathname: string, nav: NavItem[], index: SearchItem[], names: Record<string, string>, homeLabel: string): Crumb[] {
  const [section, slug] = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ label: homeLabel, href: "/" }];
  if (!section) return crumbs;
  const item = nav.find((n) => n.match !== "/" && n.match.slice(1) === section);
  const entityName = (s: string) => index.find((e) => e.slug === s)?.name ?? s;
  if (section === "wiki") {
    const idx = nav.find((n) => n.match === "/a-z");
    if (idx) crumbs.push({ label: idx.label, href: idx.href });
    if (slug) crumbs.push({ label: entityName(decodeURIComponent(slug)) });
    return crumbs;
  }
  if (item) crumbs.push({ label: item.label, href: item.href });
  if (slug) crumbs.push({ label: section === "tree" ? entityName(decodeURIComponent(slug)) : (names[`${section}/${decodeURIComponent(slug)}`] ?? decodeURIComponent(slug)) });
  return crumbs;
}
