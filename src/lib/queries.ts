import { articles, entities as entitySeeds, relationships, relationshipTypes, sources as sourceSeeds, timelines, traditions as traditionSeeds } from "../../data";
import { overlays } from "../../data/i18n";
import type { Kind } from "../../data/types";
import type { Locale } from "@/i18n/config";
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
  /** English name and aliases on translated entries, so search and the kinship finder accept either language */
  altNames: string[];
  summary: string | null;
  article: string | null;
  image: string | null;
}
export type EntityLite = Pick<Entity, "slug" | "name" | "emoji" | "kind" | "subtype" | "epithet" | "aliases" | "altNames" | "gender" | "summary">;

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

interface Db {
  entities: Map<string, Entity>;
  edges: Edge[];
  types: RelTypes;
  traditions: Record<string, Tradition>;
  sources: Record<string, Source>;
  timelines: Record<string, TimelineEntry[]>;
  articleSlugs: string[];
}

/** Shape the seed data for one locale: English base, with that locale's overlay merged on top. */
function build(locale: Locale): Db {
  const tr = overlays[locale];

  const entities = new Map<string, Entity>(
    entitySeeds
      .map((e): Entity => {
        const o = tr?.entities[e.slug];
        return {
          slug: e.slug,
          name: o?.name ?? e.name,
          kind: e.kind,
          subtype: e.subtype,
          gender: e.gender ?? null,
          emoji: e.emoji,
          epithet: o?.epithet ?? e.epithet,
          domains: o?.domains ?? e.domains ?? [],
          aliases: o ? (o.aliases ?? []) : (e.aliases ?? []),
          altNames: o ? [e.name, ...(e.aliases ?? [])] : [],
          summary: o?.summary ?? e.summary ?? null,
          article: tr?.articles[e.slug] ?? articles[e.slug] ?? null,
          image: e.image ?? null,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, locale))
      .map((e) => [e.slug, e]),
  );

  const str = (s: string | undefined) => (s === undefined ? null : (tr?.relStrings[s] ?? s));
  const edges: Edge[] = relationships.map((r, i) => ({
    id: i + 1,
    source: r.from,
    target: r.to,
    type: r.type,
    tradition: r.t ?? null,
    sourceRef: r.s ?? null,
    citation: str(r.cite),
    certainty: r.cert ?? "canonical",
    notes: str(r.note),
  }));

  const types: RelTypes = Object.fromEntries(
    relationshipTypes.map((t) => {
      const o = tr?.relTypes[t.key];
      return [t.key, { key: t.key, label: o?.label ?? t.label, inverse_label: o?.inverse ?? t.inverse, category: t.category, is_symmetric: !!t.symmetric, emoji: t.emoji }];
    }),
  );

  const traditions: Record<string, Tradition> = Object.fromEntries(traditionSeeds.map((t) => [t.key, { ...t, ...tr?.traditions[t.key] }]));

  const sources: Record<string, Source> = Object.fromEntries(
    sourceSeeds.map((s) => {
      const o = tr?.sources[s.slug];
      return [s.slug, { slug: s.slug, author: o?.author ?? s.author, work: o?.work ?? s.work, period: o?.period ?? s.period, summary: o?.summary ?? s.summary, entity_slug: s.entity ?? null }];
    }),
  );

  let timelineId = 0;
  const timelineMap: Record<string, TimelineEntry[]> = Object.fromEntries(
    Object.entries(timelines).map(([slug, steps]) => [
      slug,
      steps.map(([label, ev], i) => ({ id: ++timelineId, entity_slug: slug, ordinal: i + 1, label: tr?.timelines[slug]?.[i] ?? label, event_slug: ev ?? null })),
    ]),
  );

  const articleSlugs = [...entities.values()].filter((e) => e.article).map((e) => e.slug).sort();
  return { entities, edges, types, traditions, sources, timelines: timelineMap, articleSlugs };
}

const cache = new Map<Locale, Db>();
const db = (locale: Locale) => cache.get(locale) ?? cache.set(locale, build(locale)).get(locale)!;

export const getEntities = async (locale: Locale): Promise<Map<string, EntityLite>> => db(locale).entities;
export const getEdges = async (locale: Locale): Promise<Edge[]> => db(locale).edges;
export const getRelTypes = async (locale: Locale): Promise<RelTypes> => db(locale).types;
export const getTraditions = async (locale: Locale): Promise<Record<string, Tradition>> => db(locale).traditions;
export const getSources = async (locale: Locale): Promise<Record<string, Source>> => db(locale).sources;
export const getEntity = async (locale: Locale, slug: string): Promise<Entity | null> => db(locale).entities.get(slug) ?? null;
export const getTimeline = async (locale: Locale, slug: string): Promise<TimelineEntry[]> => db(locale).timelines[slug] ?? [];

/** Slugs of entities that have a long-form article, for the front page. */
export const getArticleSlugs = async (locale: Locale): Promise<string[]> => db(locale).articleSlugs;

/** Everything the graph-backed pages need, in one go. */
export async function getGraph(locale: Locale) {
  const { entities, edges, types, traditions, sources } = db(locale);
  return { entities: entities as Map<string, EntityLite>, edges, types, traditions, sources };
}
