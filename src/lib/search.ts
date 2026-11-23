export interface SearchItem {
  slug: string;
  name: string;
  hint: string;
  aliases: string[];
  glyph?: string | null;
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Rank entries against a query: exact name/alias → prefix → substring → hint. Returns every match unless `limit` is given. */
export function searchItems<T extends SearchItem>(index: T[], query: string, limit = Infinity, locale = "en"): T[] {
  const q = norm(query.trim());
  if (!q) return [];
  const scored: [number, T][] = [];
  for (const item of index) {
    const names = [item.name, ...item.aliases].map(norm);
    const score = names.some((n) => n === q) ? 0 : names.some((n) => n.startsWith(q)) ? 1 : names.some((n) => n.includes(q)) ? 2 : norm(item.hint).includes(q) ? 3 : -1;
    if (score >= 0) scored.push([score, item]);
  }
  return scored.sort((a, b) => a[0] - b[0] || a[1].name.localeCompare(b[1].name, locale)).slice(0, limit).map(([, item]) => item);
}
