import Link from "@/components/Link";
import { getI18n } from "@/i18n/server";
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
export async function EntityList({ slugs, entities, limit }: { slugs: string[]; entities: Map<string, EntityLite>; limit?: number }) {
  const { t } = await getI18n();
  const shown = limit ? slugs.slice(0, limit) : slugs;
  return (
    <>
      {shown.map((s, i) => (
        <span key={s}>
          {i > 0 && ", "}
          <EntityLink entity={entities.get(s)} slug={s} />
        </span>
      ))}
      {limit && slugs.length > limit && <span className="text-muted">{t.entity.more(slugs.length - limit)}</span>}
    </>
  );
}

/** Index-style entry: a glyph tile, the name, and a one-line descriptor. */
export function EntityEntry({ entity }: { entity: EntityLite }) {
  return (
    <li>
      <Link href={`/wiki/${entity.slug}`} transitionTypes={["nav-forward"]} className="group flex h-full items-center gap-3 rounded-[var(--r-ctl)] p-2 transition-colors hover:bg-hover">
        <span className="glyph-tile size-10 text-lg" aria-hidden>{entity.emoji ?? "·"}</span>
        <span className="min-w-0 leading-snug">
          <span className="block truncate font-medium transition-colors group-hover:text-brand">{entity.name}</span>
          {entity.epithet && <span className="block truncate text-[0.82rem] text-muted">{entity.epithet}</span>}
        </span>
      </Link>
    </li>
  );
}
