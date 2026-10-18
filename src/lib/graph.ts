// Pure graph helpers over the relationship edge list. No I/O — unit-tested in graph.test.ts.

export type Category = "family" | "romance" | "conflict" | "alliance" | "association";

export interface Edge {
  id: number;
  source: string;
  target: string;
  type: string;
  tradition: string | null;
  sourceRef: string | null;
  citation: string | null;
  certainty: "canonical" | "variant" | "disputed";
  notes: string | null;
}

export interface RelType {
  key: string;
  label: string;
  inverse_label: string;
  category: Category;
  is_symmetric: boolean;
  emoji: string;
}

export type RelTypes = Record<string, RelType>;

/** An edge seen from one entity's point of view. */
export interface Connection {
  edge: Edge;
  other: string;
  /** e.g. "child of", "killed by", "married to" — reads "<me> <label> <other>" */
  label: string;
  /** stable key for grouping: type + direction */
  role: string;
  category: Category;
  emoji: string;
}

export function connectionsOf(slug: string, edges: Edge[], types: RelTypes): Connection[] {
  const out: Connection[] = [];
  for (const edge of edges) {
    if (edge.source !== slug && edge.target !== slug) continue;
    const t = types[edge.type];
    if (!t) continue;
    const outgoing = edge.source === slug;
    out.push({
      edge,
      other: outgoing ? edge.target : edge.source,
      label: outgoing ? t.label : t.inverse_label,
      role: t.is_symmetric || outgoing ? t.key : `${t.key}:in`,
      category: t.category,
      emoji: t.emoji,
    });
  }
  return out;
}

export const parentsOf = (slug: string, edges: Edge[]) => edges.filter((e) => e.type === "parent" && e.target === slug);
export const childrenOf = (slug: string, edges: Edge[]) => edges.filter((e) => e.type === "parent" && e.source === slug);

/** Siblings = anyone sharing at least one parent (in any tradition). Returns slug → shared parents. */
export function siblingsOf(slug: string, edges: Edge[]): Map<string, string[]> {
  const parents = new Set(parentsOf(slug, edges).map((e) => e.source));
  const sibs = new Map<string, string[]>();
  for (const e of edges) {
    if (e.type !== "parent" || !parents.has(e.source) || e.target === slug) continue;
    const shared = sibs.get(e.target) ?? [];
    if (!shared.includes(e.source)) shared.push(e.source);
    sibs.set(e.target, shared);
  }
  return sibs;
}

export interface PathStep {
  from: string;
  to: string;
  edge: Edge;
  /** reads "<from> <label> <to>" */
  label: string;
  emoji: string;
  category: Category;
}

interface PathOptions {
  /** restrict to these categories (default: all) */
  categories?: Category[];
  /** skip hub-like kinds of edges that make every path trivially short */
  excludeTypes?: string[];
}

/** Breadth-first shortest path, treating every edge as walkable in both directions. */
export function shortestPath(from: string, to: string, edges: Edge[], types: RelTypes, opts: PathOptions = {}): PathStep[] | null {
  if (from === to) return [];
  const adj = new Map<string, { next: string; edge: Edge }[]>();
  for (const edge of edges) {
    const t = types[edge.type];
    if (!t) continue;
    if (opts.categories && !opts.categories.includes(t.category)) continue;
    if (opts.excludeTypes?.includes(edge.type)) continue;
    (adj.get(edge.source) ?? adj.set(edge.source, []).get(edge.source)!).push({ next: edge.target, edge });
    (adj.get(edge.target) ?? adj.set(edge.target, []).get(edge.target)!).push({ next: edge.source, edge });
  }

  const prev = new Map<string, { node: string; edge: Edge }>();
  const seen = new Set([from]);
  let frontier = [from];
  while (frontier.length && !seen.has(to)) {
    const nextFrontier: string[] = [];
    for (const node of frontier) {
      for (const { next, edge } of adj.get(node) ?? []) {
        if (seen.has(next)) continue;
        seen.add(next);
        prev.set(next, { node, edge });
        nextFrontier.push(next);
      }
    }
    frontier = nextFrontier;
  }
  if (!seen.has(to)) return null;

  const steps: PathStep[] = [];
  for (let node = to; node !== from; ) {
    const { node: before, edge } = prev.get(node)!;
    const t = types[edge.type];
    steps.unshift({
      from: before,
      to: node,
      edge,
      label: edge.source === before ? t.label : t.inverse_label,
      emoji: t.emoji,
      category: t.category,
    });
    node = before;
  }
  return steps;
}

/** All ancestors with their generation distance, following parent edges upward. */
export function ancestorsOf(slug: string, edges: Edge[]): Map<string, number> {
  const up = new Map<string, string[]>();
  for (const e of edges) if (e.type === "parent") (up.get(e.target) ?? up.set(e.target, []).get(e.target)!).push(e.source);
  const depth = new Map<string, number>([[slug, 0]]);
  let frontier = [slug];
  while (frontier.length) {
    const next: string[] = [];
    for (const node of frontier)
      for (const p of up.get(node) ?? [])
        if (!depth.has(p)) {
          depth.set(p, depth.get(node)! + 1);
          next.push(p);
        }
    frontier = next;
  }
  return depth;
}

export interface Kinship {
  slug: string;
  depthA: number;
  depthB: number;
}

/**
 * How two entities are related by blood. Myth being myth, there can be two honest answers:
 * Perseus is Heracles's ancestor AND his half-brother. So this returns the direct line (if one
 * descends from the other) and the nearest shared ancestor who is neither of them.
 */
export function kinships(a: string, b: string, edges: Edge[]): Kinship[] {
  const da = ancestorsOf(a, edges);
  const db = ancestorsOf(b, edges);
  let direct: Kinship | null = null;
  let shared: Kinship | null = null;
  for (const [slug, depthA] of da) {
    const depthB = db.get(slug);
    if (depthB === undefined) continue;
    const k = { slug, depthA, depthB };
    if (slug === a || slug === b) direct = k;
    else if (!shared || depthA + depthB < shared.depthA + shared.depthB) shared = k;
  }
  // A shared ancestor who is merely the direct ancestor's own ancestor adds nothing.
  if (direct && shared && shared.depthA + shared.depthB > direct.depthA + direct.depthB + 1) shared = null;
  return [direct, shared].filter((k): k is Kinship => k !== null);
}

/** The chain of parents from an ancestor down to a descendant. */
export function lineage(ancestor: string, descendant: string, edges: Edge[], types: RelTypes): PathStep[] {
  const down = edges.filter((e) => e.type === "parent");
  const prev = new Map<string, Edge>();
  let frontier = [ancestor];
  const seen = new Set(frontier);
  while (frontier.length && !seen.has(descendant)) {
    const next: string[] = [];
    for (const node of frontier)
      for (const e of down)
        if (e.source === node && !seen.has(e.target)) {
          seen.add(e.target);
          prev.set(e.target, e);
          next.push(e.target);
        }
    frontier = next;
  }
  const steps: PathStep[] = [];
  for (let node = descendant; node !== ancestor; ) {
    const edge = prev.get(node);
    if (!edge) return [];
    const t = types[edge.type];
    steps.unshift({ from: edge.source, to: node, edge, label: t.label, emoji: t.emoji, category: t.category });
    node = edge.source;
  }
  return steps;
}

/** "grandparent / ancestor", "siblings", "first cousins once removed"… in English or Russian. */
export function kinshipTerm(depthA: number, depthB: number, locale: "en" | "ru" = "en"): string {
  if (locale === "ru") return kinshipTermRu(depthA, depthB);
  const greats = (n: number, base: string) => (n <= 1 ? base : n === 2 ? `grand${base}` : `${"great-".repeat(n - 2)}grand${base}`);
  if (depthA === 0 && depthB === 0) return "the same person";
  if (depthA === 0) return greats(depthB, "parent") + " / ancestor";
  if (depthB === 0) return greats(depthA, "child") + " / descendant";
  if (depthA === 1 && depthB === 1) return "siblings (at least by one parent)";
  if (depthA === 1 || depthB === 1) {
    const n = Math.max(depthA, depthB) - 1;
    return n === 1 ? "aunt/uncle and niece/nephew" : `${"great-".repeat(n - 1)}aunt/uncle and niece/nephew`;
  }
  const degree = Math.min(depthA, depthB) - 1;
  const removed = Math.abs(depthA - depthB);
  const ord = ["", "first", "second", "third", "fourth", "fifth", "sixth"][degree] ?? `${degree}th`;
  return `${ord} cousins${removed ? ` ${removed === 1 ? "once" : removed === 2 ? "twice" : `${removed}×`} removed` : ""}`;
}

const RU_COUSINS = ["", "двоюродные", "троюродные", "четвероюродные", "пятиюродные", "шестиюродные", "семиюродные"];
const ruGenerations = (n: number) => {
  const rule = new Intl.PluralRules("ru").select(n);
  return `${n} ${rule === "one" ? "поколение" : rule === "few" ? "поколения" : "поколений"}`;
};

/** Russian kinship terms. Gender-neutral pairs, like the English, since either figure may be male or female. */
function kinshipTermRu(depthA: number, depthB: number): string {
  const pra = (n: number) => "пра".repeat(Math.max(0, n - 2));
  const up = (n: number) => (n <= 1 ? "родитель" : `${pra(n)}дед или ${pra(n)}бабка`);
  const down = (n: number) => (n <= 1 ? "ребёнок" : `${pra(n)}внук или ${pra(n)}внучка`);
  if (depthA === 0 && depthB === 0) return "одно и то же лицо";
  if (depthA === 0) return `${up(depthB)} / предок`;
  if (depthB === 0) return `${down(depthA)} / потомок`;
  if (depthA === 1 && depthB === 1) return "братья или сёстры (хотя бы по одному из родителей)";
  if (depthA === 1 || depthB === 1) {
    const n = Math.max(depthA, depthB) - 1;
    return n === 1 ? "дядя или тётя и племянник или племянница" : `двоюродные ${pra(n)}дед или ${pra(n)}бабка и ${pra(n)}внучатые племянник или племянница`;
  }
  const degree = Math.min(depthA, depthB) - 1;
  const removed = Math.abs(depthA - depthB);
  const ord = RU_COUSINS[degree] ?? `${degree + 1}-юродные`;
  return `${ord} братья или сёстры${removed ? ` (с разницей в ${ruGenerations(removed)})` : ""}`;
}

export interface Placed {
  slug: string;
  x: number;
  y: number;
  ring: number;
}

/**
 * Radial ego layout. Each category gets an angular sector sized by how many neighbours it holds;
 * a sector fills its inner ring first and spills outward, so crowded profiles (hi, Zeus) grow
 * more rings instead of overlapping. Focus sits at (0, 0); ring 0 is at radius ~0.42.
 */
export function egoLayout(groups: { category: Category; slugs: string[] }[], spacing = 0.21): Placed[] {
  const live = groups.filter((g) => g.slugs.length);
  const total = live.reduce((n, g) => n + g.slugs.length, 0);
  if (!total) return [];
  const MIN_SWEEP = 0.5;
  const raw = live.map((g) => Math.max(MIN_SWEEP, (g.slugs.length / total) * Math.PI * 2));
  const scale = (Math.PI * 2) / raw.reduce((a, b) => a + b, 0);

  const placed: Placed[] = [];
  let start = -Math.PI / 2;
  live.forEach((g, gi) => {
    const sweep = raw[gi] * scale;
    const pad = Math.min(0.12, sweep * 0.1);
    const rest = [...g.slugs];
    for (let ring = 0; rest.length; ring++) {
      const r = 0.42 + ring * 0.2;
      const capacity = Math.max(1, Math.floor(((sweep - pad * 2) * r) / spacing));
      const row = rest.splice(0, capacity);
      row.forEach((slug, i) => {
        const a = start + pad + ((i + 0.5) / row.length) * (sweep - pad * 2);
        placed.push({ slug, x: Math.cos(a) * r, y: Math.sin(a) * r, ring });
      });
    }
    start += sweep;
  });
  return placed;
}

export interface TreeNode {
  slug: string;
  /** 0 = the subject, negative = ancestors, positive = descendants */
  gen: number;
  /** position within its generation row, 0-based */
  index: number;
}

export interface TreeLink {
  parent: string;
  child: string;
  contested: boolean;
}

export interface FamilyTree {
  nodes: TreeNode[];
  links: TreeLink[];
  /** generation → how many relatives were left out of that row */
  hidden: Record<number, number>;
}

/**
 * Parent edges to use for a tree. With a tradition selected, edges from rival traditions are dropped;
 * without one, only canonical edges are used. Either way a child whose parents would all vanish keeps
 * every attested parent, so nobody is orphaned by a filter.
 */
export function parentEdgesFor(edges: Edge[], tradition?: string | null): Edge[] {
  const all = edges.filter((e) => e.type === "parent");
  const keep = (e: Edge) => (tradition ? !e.tradition || e.tradition === tradition : e.certainty === "canonical");
  const kept = all.filter(keep);
  const covered = new Set(kept.map((e) => e.target));
  return [...kept, ...all.filter((e) => !covered.has(e.target))];
}

/** Ancestors above, descendants below, laid out in generation rows ordered to keep lines short. */
export function familyTree(slug: string, edges: Edge[], opts: { up?: number; down?: number; tradition?: string | null; maxPerRow?: number } = {}): FamilyTree {
  const { up = 3, down = 2, tradition = null, maxPerRow = 12 } = opts;
  const parentEdges = parentEdgesFor(edges, tradition);
  const gen = new Map<string, number>([[slug, 0]]);
  const rows = new Map<number, string[]>([[0, [slug]]]);
  const hidden: Record<number, number> = {};

  const grow = (dir: -1 | 1, limit: number) => {
    for (let g = dir; Math.abs(g) <= limit; g += dir) {
      const prevRow = rows.get(g - dir) ?? [];
      const found: string[] = [];
      for (const node of prevRow)
        for (const e of parentEdges) {
          const next = dir === -1 ? (e.target === node ? e.source : null) : e.source === node ? e.target : null;
          if (next && !gen.has(next) && !found.includes(next)) found.push(next);
        }
      if (!found.length) break;
      const shown = found.slice(0, maxPerRow);
      if (found.length > shown.length) hidden[g] = found.length - shown.length;
      for (const s of shown) gen.set(s, g);
      rows.set(g, shown);
    }
  };
  grow(-1, up);
  grow(1, down);

  const nodes = [...rows.entries()].flatMap(([g, row]) => row.map((s, index) => ({ slug: s, gen: g, index })));
  const links = parentEdges
    .filter((e) => gen.has(e.source) && gen.has(e.target) && gen.get(e.target)! - gen.get(e.source)! === 1)
    .map((e) => ({ parent: e.source, child: e.target, contested: e.certainty !== "canonical" }));
  // de-duplicate (the same parentage can be attested by several sources)
  const seen = new Set<string>();
  return { nodes, links: links.filter((l) => !seen.has(l.parent + ">" + l.child) && seen.add(l.parent + ">" + l.child)), hidden };
}
