import Link from "next/link";
import type { EntityLite } from "@/lib/queries";

/** Every name in the encyclopedia is a link. Unknown slugs degrade to plain text. */
export function EntityLink({ entity, slug, children, className = "" }: { entity?: EntityLite; slug: string; children?: React.ReactNode; className?: string }) {
  if (!entity) return <span className={className}>{children ?? slug}</span>;
  return (
    <Link href={`/wiki/${entity.slug}`} transitionTypes={["nav-forward"]} title={entity.epithet ?? undefined} className={`wikilink ${className}`}>
      {children ?? entity.name}
    </Link>
  );
}

/** Comma-separated run of entity links, for infoboxes and tables. */
export function EntityList({ slugs, entities, limit }: { slugs: string[]; entities: Map<string, EntityLite>; limit?: number }) {
  const shown = limit ? slugs.slice(0, limit) : slugs;
  return (
    <>
      {shown.map((s, i) => (
        <span key={s}>
          {i > 0 && ", "}
          <EntityLink entity={entities.get(s)} slug={s} />
        </span>
      ))}
      {limit && slugs.length > limit && <span className="text-muted"> and {slugs.length - limit} more</span>}
    </>
  );
}

/** Index-style entry: name plus a one-line descriptor. */
export function EntityEntry({ entity }: { entity: EntityLite }) {
  return (
    <li className="break-inside-avoid">
      <Link href={`/wiki/${entity.slug}`} transitionTypes={["nav-forward"]} className="group -mx-3 flex items-baseline gap-3 rounded-xl px-3 py-2 leading-snug transition-colors hover:bg-glass">
        <span className="w-6 shrink-0 text-center opacity-70 transition-transform duration-300 group-hover:scale-125" aria-hidden>{entity.emoji ?? "·"}</span>
        <span className="min-w-0">
          <span className="font-semibold text-aegean transition-colors group-hover:text-gold">{entity.name}</span>
          {entity.epithet && <span className="text-muted"> — {entity.epithet}</span>}
        </span>
        <span className="ml-auto translate-x-[-6px] font-sans text-sm text-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden>→</span>
      </Link>
    </li>
  );
}
