import { type Connection, type Edge, connectionsOf, parentsOf, siblingsOf } from "./graph";
import type { EntityLite } from "./queries";

type Entities = Map<string, EntityLite>;

export interface GroupedConnection {
  other: string;
  edges: Edge[];
  /** true when every attestation is a variant/disputed one */
  contested: boolean;
  note: string | null;
}

export interface RoleGroup {
  role: string;
  label: string;
  emoji: string;
  category: Connection["category"];
  items: GroupedConnection[];
}

/** Collapse an entity's edges into "killed: A, B · killed by: C" groups, merging duplicate attestations. */
export function groupConnections(connections: Connection[], entities: Entities): RoleGroup[] {
  const groups = new Map<string, RoleGroup>();
  for (const c of connections) {
    const g = groups.get(c.role) ?? { role: c.role, label: c.label, emoji: c.emoji, category: c.category, items: [] };
    groups.set(c.role, g);
    const existing = g.items.find((i) => i.other === c.other);
    if (existing) {
      existing.edges.push(c.edge);
      existing.contested &&= c.edge.certainty !== "canonical";
      existing.note ??= c.edge.notes;
    } else g.items.push({ other: c.other, edges: [c.edge], contested: c.edge.certainty !== "canonical", note: c.edge.notes });
  }
  for (const g of groups.values()) g.items.sort((a, b) => (entities.get(a.other)?.name ?? a.other).localeCompare(entities.get(b.other)?.name ?? b.other));
  return [...groups.values()];
}

export interface ParentageVersion {
  key: string;
  tradition: string | null;
  sourceRef: string | null;
  citation: string | null;
  note: string | null;
  certainty: Edge["certainty"];
  parents: string[];
}

/** One card per distinct account of who the parents were. */
export function parentageVersions(slug: string, edges: Edge[]): ParentageVersion[] {
  const versions = new Map<string, ParentageVersion>();
  for (const e of parentsOf(slug, edges)) {
    const key = [e.tradition, e.sourceRef, e.citation].join("|");
    const v = versions.get(key) ?? { key, tradition: e.tradition, sourceRef: e.sourceRef, citation: e.citation, note: e.notes, certainty: e.certainty, parents: [] };
    if (!v.parents.includes(e.source)) v.parents.push(e.source);
    versions.set(key, v);
  }
  return [...versions.values()].sort((a, b) => Number(a.certainty !== "canonical") - Number(b.certainty !== "canonical"));
}

export interface InfoboxFacts {
  consorts: string[];
  children: string[];
  siblings: string[];
  abodes: string[];
  attributes: string[];
  memberOf: string[];
  members: string[];
  participants: string[];
  rulers: string[];
  makers: string[];
  holders: string[];
}

/** The quick facts shown beside an article, derived entirely from the edge list. */
export function infoboxFacts(slug: string, connections: Connection[], edges: Edge[]): InfoboxFacts {
  const of = (...roles: string[]) => [...new Set(connections.filter((c) => roles.includes(c.role)).map((c) => c.other))];
  return {
    consorts: of("spouse", "lover"),
    children: of("parent"),
    siblings: [...siblingsOf(slug, edges).keys()],
    abodes: of("rules", "associated_place", "located_in"),
    attributes: of("wields"),
    memberOf: of("member_of"),
    members: of("member_of:in"),
    participants: of("took_part_in:in"),
    rulers: of("rules:in"),
    makers: of("created:in"),
    holders: of("wields:in", "guards:in"),
  };
}

/** "Killed by X" — or by X or Y, where accounts differ. */
export function causeOfDeath(connections: Connection[], entities: Entities): string | null {
  const killers = [...new Set(connections.filter((c) => c.role === "killed:in").map((c) => entities.get(c.other)?.name ?? c.other))];
  if (!killers.length) return null;
  return killers.length === 1 ? `Killed by ${killers[0]}` : `Killed by ${killers.join(" or ")} (accounts differ)`;
}

export { connectionsOf };
