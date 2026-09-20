import type { Edge, RelTypes } from "@/lib/graph";
import type { EntityLite } from "@/lib/queries";
import { RichText } from "./ArticleBody";
import { EntityLink, EntityList } from "./Entity";

interface Props {
  edges: Edge[];
  entities: Map<string, EntityLite>;
  types: RelTypes;
}

/** Relationship claims as sentences ("Zeus — parent of — Athena, Apollo"), merged where subject, relation and citation agree. */
export function ClaimsTable({ edges, entities, types }: Props) {
  const rows = [...Map.groupBy(edges, (e) => [e.source, e.type, e.citation, e.notes].join("|")).values()];
  rows.sort((a, b) => (entities.get(a[0].source)?.name ?? "").localeCompare(entities.get(b[0].source)?.name ?? "") || a[0].type.localeCompare(b[0].type));
  return (
    <div className="table-wrap"><table className="ref">
      <thead><tr><th className="label">Claim</th><th className="label w-[13rem]">Passage</th></tr></thead>
      <tbody>
        {rows.map((group) => {
          const e = group[0];
          return (
            <tr key={e.id}>
              <td>
                <EntityLink entity={entities.get(e.source)} slug={e.source} /> <span className="italic text-muted">{types[e.type]?.label}</span>{" "}
                <EntityList slugs={[...new Set(group.map((g) => g.target))]} entities={entities} />
                {e.certainty !== "canonical" && <span className="ml-1.5 font-sans text-xs text-gold">({e.certainty})</span>}
                {e.notes && <div className="text-sm text-muted"><RichText text={e.notes} entities={entities} /></div>}
              </td>
              <td className="text-sm">{e.citation ?? <span className="text-muted">—</span>}</td>
            </tr>
          );
        })}
      </tbody>
    </table></div>
  );
}
