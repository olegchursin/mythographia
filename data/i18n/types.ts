/**
 * Translation overlays. English in data/ is the base and is never edited for a translation; each
 * locale supplies these maps keyed by the locale-neutral IDs (entity slugs, type keys, source slugs).
 */

export interface EntityTr {
  name: string;
  epithet: string;
  /** Include the English name and the localized Roman/variant names so search works both ways. */
  aliases?: string[];
  domains?: string[];
  summary: string;
}

export interface RelTypeTr {
  label: string;
  inverse: string;
}

export interface TraditionTr {
  name: string;
  period: string;
  description: string;
}

export interface SourceTr {
  author: string;
  work: string;
  period: string;
  summary: string;
}

export interface Overlay {
  /** keyed by entity slug */
  entities: Record<string, EntityTr>;
  /** keyed by entity slug; same markup as data/articles */
  articles: Record<string, string>;
  /** relationship `cite` and `note` strings, keyed by the exact English text */
  relStrings: Record<string, string>;
  relTypes: Record<string, RelTypeTr>;
  traditions: Record<string, TraditionTr>;
  sources: Record<string, SourceTr>;
  /** keyed by entity slug; labels in the same order as data/timelines */
  timelines: Record<string, string[]>;
}
