import { ViewTransition } from "react";

/**
 * Route-level enter/exit. Lives in each page.tsx rather than the layout: layouts persist across
 * navigations, so a ViewTransition there never fires enter or exit.
 */
export function PageTransition({ children, className = "page" }: { children: React.ReactNode; className?: string }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div className={className}>{children}</div>
    </ViewTransition>
  );
}

/** Same-route swap (filters, tabs): change `key` on this to crossfade old content into new. */
export function SwapTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ViewTransition enter="swap-enter" exit="swap-exit" default="none">
      <div className={className}>{children}</div>
    </ViewTransition>
  );
}
