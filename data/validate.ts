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
