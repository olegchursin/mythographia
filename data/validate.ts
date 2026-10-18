import type { Overlay } from "./i18n/types";
import { articles, entities, relationships, relationshipTypes, sources, timelines, traditions, wikiLinks } from "./index";

/** Returns a list of human-readable problems with the seed data. Empty = good. */
export function validateSeed(): string[] {
  const problems: string[] = [];
  const slugs = new Set<string>();
  for (const e of entities) {
    if (slugs.has(e.slug)) problems.push(`duplicate entity slug: ${e.slug}`);
    if (!/^[a-z0-9-]+$/.test(e.slug)) problems.push(`bad slug: ${e.slug}`);
    slugs.add(e.slug);
  }
  const types = new Set(relationshipTypes.map((t) => t.key));
  const trads = new Set(traditions.map((t) => t.key));
  const srcs = new Set(sources.map((s) => s.slug));
  const need = (slug: string | undefined, where: string) => {
    if (slug !== undefined && !slugs.has(slug)) problems.push(`unknown entity "${slug}" in ${where}`);
  };

  for (const s of sources) need(s.entity, `source ${s.slug}`);
  for (const r of relationships) {
    const where = `${r.from} -${r.type}-> ${r.to}`;
    need(r.from, where);
    need(r.to, where);
    if (r.from === r.to) problems.push(`self edge: ${where}`);
    if (!types.has(r.type)) problems.push(`unknown type in ${where}`);
    if (r.t && !trads.has(r.t)) problems.push(`unknown tradition "${r.t}" in ${where}`);
    if (r.s && !srcs.has(r.s)) problems.push(`unknown source "${r.s}" in ${where}`);
  }
  for (const [slug, steps] of Object.entries(timelines)) {
    need(slug, "timeline");
    for (const [, ev] of steps) need(ev, `timeline of ${slug}`);
  }
  for (const e of entities) {
    if (!e.summary?.trim()) problems.push(`missing summary: ${e.slug}`);
    for (const target of wikiLinks(e.summary ?? "")) need(target, `summary of ${e.slug}`);
  }
  for (const [slug, body] of Object.entries(articles)) {
    need(slug, "articles");
    for (const target of wikiLinks(body)) need(target, `article "${slug}"`);
  }

  const connected = new Set(relationships.flatMap((r) => [r.from, r.to]));
  for (const e of entities) if (!connected.has(e.slug)) problems.push(`orphan entity (no edges): ${e.slug}`);

  return problems;
}

const sorted = (xs: string[]) => [...xs].sort().join(",");
const headings = (body: string) => body.split("\n").filter((l) => /^##\s/.test(l)).length;

/** Problems with one locale's translation overlay: missing or orphaned keys, broken or mismatched links. Empty = good. */
export function validateOverlay(locale: string, o: Overlay): string[] {
  const problems: string[] = [];
  const slugs = new Set(entities.map((e) => e.slug));
  const coverage = (what: string, expected: Iterable<string>, actual: Record<string, unknown>) => {
    const want = new Set(expected);
    for (const k of want) if (!(k in actual)) problems.push(`[${locale}] missing ${what}: ${k}`);
    for (const k of Object.keys(actual)) if (!want.has(k)) problems.push(`[${locale}] unknown ${what}: ${k}`);
  };
  const sameLinks = (where: string, en: string, tr: string) => {
    for (const target of wikiLinks(tr)) if (!slugs.has(target)) problems.push(`[${locale}] unknown entity "${target}" in ${where}`);
    if (sorted(wikiLinks(en)) !== sorted(wikiLinks(tr))) problems.push(`[${locale}] links differ from English in ${where}`);
  };

  coverage("entity", slugs, o.entities);
  for (const e of entities) {
    const t = o.entities[e.slug];
    if (!t) continue;
    if (!t.name.trim() || !t.summary.trim()) problems.push(`[${locale}] empty name or summary: ${e.slug}`);
    sameLinks(`summary of ${e.slug}`, e.summary ?? "", t.summary);
  }

  coverage("article", Object.keys(articles), o.articles);
  for (const [slug, body] of Object.entries(o.articles)) {
    if (!articles[slug]) continue;
    sameLinks(`article "${slug}"`, articles[slug], body);
    if (headings(articles[slug]) !== headings(body)) problems.push(`[${locale}] heading count differs in article "${slug}"`);
  }

  const relStrings = new Set(relationships.flatMap((r) => [r.cite, r.note]).filter((s): s is string => !!s));
  coverage("relationship string", relStrings, o.relStrings);
  for (const s of relStrings) if (o.relStrings[s] !== undefined) sameLinks(`relationship string "${s.slice(0, 40)}"`, s, o.relStrings[s]);

  coverage("relationship type", relationshipTypes.map((t) => t.key), o.relTypes);
  coverage("tradition", traditions.map((t) => t.key), o.traditions);
  coverage("source", sources.map((s) => s.slug), o.sources);
  coverage("timeline", Object.keys(timelines), o.timelines);
  for (const [slug, steps] of Object.entries(timelines))
    if (o.timelines[slug] && o.timelines[slug].length !== steps.length) problems.push(`[${locale}] timeline of ${slug} has ${o.timelines[slug].length} steps, English has ${steps.length}`);

  return problems;
}
