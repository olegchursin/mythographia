import { articles, entities as entitySeeds, relationships, relationshipTypes, sources as sourceSeeds, timelines, traditions as traditionSeeds } from "../../data";
import type { Kind } from "../../data/types";
import type { Edge, RelTypes } from "./graph";

/**
 * The encyclopedia is read-only, so the typed modules in data/ are the database. Everything is
 * shaped once at module load; the getters stay async so callers don't care where rows come from.
 */

export interface Entity {
  slug: string;
  name: string;
  kind: Kind;
  subtype: string;
  gender: string | null;
  emoji: string;
  epithet: string | null;
  domains: string[];
  aliases: string[];
  summary: string | null;
  article: string | null;
  image: string | null;
}
export type EntityLite = Pick<Entity, "slug" | "name" | "emoji" | "kind" | "subtype" | "epithet" | "aliases" | "gender" | "summary">;

export interface Tradition {
  key: string;
  name: string;
  emoji: string;
  period: string | null;
  description: string | null;
}

export interface Source {
  slug: string;
  author: string;
  work: string;
  period: string | null;
  summary: string | null;
  entity_slug: string | null;
}

export interface TimelineEntry {
  id: number;
  entity_slug: string;
  ordinal: number;
  label: string;
  event_slug: string | null;
}

const ENTITIES = new Map<string, Entity>(
  entitySeeds
    .map((e): Entity => ({
      slug: e.slug,
      name: e.name,
      kind: e.kind,
      subtype: e.subtype,
      gender: e.gender ?? null,
      emoji: e.emoji,
      epithet: e.epithet,
      domains: e.domains ?? [],
      aliases: e.aliases ?? [],
      summary: e.summary ?? null,
      article: articles[e.slug] ?? null,
      image: e.image ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => [e.slug, e]),
);

const EDGES: Edge[] = relationships.map((r, i) => ({
  id: i + 1,
  source: r.from,
  target: r.to,
  type: r.type,
  tradition: r.t ?? null,
  sourceRef: r.s ?? null,
  citation: r.cite ?? null,
  certainty: r.cert ?? "canonical",
  notes: r.note ?? null,
}));

const REL_TYPES: RelTypes = Object.fromEntries(
  relationshipTypes.map((t) => [t.key, { key: t.key, label: t.label, inverse_label: t.inverse, category: t.category, is_symmetric: !!t.symmetric, emoji: t.emoji }]),
);

const TRADITIONS: Record<string, Tradition> = Object.fromEntries(traditionSeeds.map((t) => [t.key, t]));

const SOURCES: Record<string, Source> = Object.fromEntries(
  sourceSeeds.map((s) => [s.slug, { slug: s.slug, author: s.author, work: s.work, period: s.period, summary: s.summary, entity_slug: s.entity ?? null }]),
);

let timelineId = 0;
const TIMELINES: Record<string, TimelineEntry[]> = Object.fromEntries(
  Object.entries(timelines).map(([slug, steps]) => [
    slug,
    steps.map(([label, ev], i) => ({ id: ++timelineId, entity_slug: slug, ordinal: i + 1, label, event_slug: ev ?? null })),
  ]),
);

const ARTICLE_SLUGS = [...ENTITIES.values()].filter((e) => e.article).map((e) => e.slug).sort();

export const getEntities = async (): Promise<Map<string, EntityLite>> => ENTITIES;
export const getEdges = async (): Promise<Edge[]> => EDGES;
export const getRelTypes = async (): Promise<RelTypes> => REL_TYPES;
export const getTraditions = async (): Promise<Record<string, Tradition>> => TRADITIONS;
export const getSources = async (): Promise<Record<string, Source>> => SOURCES;
export const getEntity = async (slug: string): Promise<Entity | null> => ENTITIES.get(slug) ?? null;
export const getTimeline = async (slug: string): Promise<TimelineEntry[]> => TIMELINES[slug] ?? [];

/** Slugs of entities that have a long-form article, for the front page. */
export const getArticleSlugs = async (): Promise<string[]> => ARTICLE_SLUGS;

/** Everything the graph-backed pages need, in one go. */
export async function getGraph() {
  return { entities: ENTITIES as Map<string, EntityLite>, edges: EDGES, types: REL_TYPES, traditions: TRADITIONS, sources: SOURCES };
}
