import type { Overlay } from "./types";
import { ru } from "./ru";

/** Translation overlays by locale. English is the base data and has none. */
export const overlays: Record<string, Overlay | undefined> = { ru };
export type { Overlay } from "./types";
