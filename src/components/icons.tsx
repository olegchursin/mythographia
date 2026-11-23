/** Inline stroke icons, 24px grid, `currentColor`. */
const PATHS = {
  home: <><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" /></>,
  index: <><path d="M5 5h3M5 12h3M5 19h3M11 5h8M11 12h8M11 19h8" /></>,
  tree: <><rect x="9" y="3.5" width="6" height="4" rx="1.2" /><rect x="3.5" y="16.5" width="6" height="4" rx="1.2" /><rect x="14.5" y="16.5" width="6" height="4" rx="1.2" /><path d="M12 7.5V12M6.5 16.5V12h11v4.5" /></>,
  graph: <><circle cx="12" cy="12" r="2.6" /><circle cx="5" cy="6" r="1.8" /><circle cx="19" cy="6" r="1.8" /><circle cx="5" cy="18" r="1.8" /><circle cx="19" cy="18" r="1.8" /><path d="m6.5 7.2 3.5 3M17.5 7.2l-3.5 3M6.5 16.8l3.5-3M17.5 16.8l-3.5-3" /></>,
  kinship: <><path d="M7 7h11l-3-3M17 17H6l3 3" /></>,
  traditions: <><path d="M5 4.5h10.5a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h10.5M9 8.5h6" /></>,
  sources: <><path d="M4 5.5c2.7-1 5.3-1 8 .8 2.7-1.8 5.3-1.8 8-.8V19c-2.7-1-5.3-1-8 .8-2.7-1.8-5.3-1.8-8-.8z" /><path d="M12 6.3v13.5" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
  moon: <><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></>,
  sidebar: <><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><path d="M9.5 4.5v15" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  chevronRight: <><path d="m9.5 6 6 6-6 6" /></>,
  chevronLeft: <><path d="m14.5 6-6 6 6 6" /></>,
  arrowRight: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "size-[18px]", strokeWidth = 1.7 }: { name: IconName; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {PATHS[name]}
    </svg>
  );
}

/** The brand mark: a terracotta tile with a Greek-key corner. */
export function BrandMark({ className = "size-8" }: { className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-[9px] bg-brand text-on-brand ${className}`} aria-hidden>
      <svg viewBox="0 0 24 24" className="size-[62%]" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="square">
        <path d="M5 19V5h14v10H9V9h6v2" />
      </svg>
    </span>
  );
}
