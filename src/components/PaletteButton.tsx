"use client";

import { OPEN_PALETTE } from "./CommandSearch";

export function PaletteButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE))}>{children}</button>;
}
