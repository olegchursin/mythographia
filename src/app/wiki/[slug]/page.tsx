import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { ArticleBody, RichText } from "@/components/ArticleBody";
import { EntityLink, EntityList } from "@/components/Entity";
import { Infobox } from "@/components/Infobox";
import { PageTransition } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { TocSpy } from "@/components/TocSpy";
import { parseArticle, plainText } from "@/lib/article";
import type { Category } from "@/lib/graph";
import { causeOfDeath, connectionsOf, groupConnections, infoboxFacts, parentageVersions, type RoleGroup } from "@/lib/profile";
import { getEntities, getEntity, getGraph, getTimeline } from "@/lib/queries";

export const generateStaticParams = async () => [...(await getEntities()).keys()].map((slug) => ({ slug }));

export async function generateMetadata({ params }: PageProps<"/wiki/[slug]">): Promise<Metadata> {
  const entity = await getEntity((await params).slug);
  return entity ? { title: entity.name, description: entity.summary ? plainText(entity.summary) : (entity.epithet ?? undefined) } : {};
}

const CATEGORY_TITLES: Record<Category, string> = {
  family: "Family",
  romance: "Consorts and loves",
  conflict: "Conflicts",
  alliance: "Allies, patrons and companions",
  association: "Associations",
};
const RELATION_CATEGORIES: Category[] = ["romance", "conflict", "alliance", "association"];
const GENDER: Record<string, string> = { m: "Male", f: "Female" };

type Graph = Awaited<ReturnType<typeof getGraph>>;

export default async function ArticlePage({ params }: PageProps<"/wiki/[slug]">) {
  const { slug } = await params;
  const entity = await getEntity(slug);
  if (!entity) notFound();

  const [graph, timeline] = await Promise.all([getGraph(), getTimeline(slug)]);
  const { entities, edges, types, traditions, sources } = graph;
  const connections = connectionsOf(slug, edges, types);
  const groups = groupConnections(connections, entities);
  const facts = infoboxFacts(slug, connections, edges);
  const parentage = parentageVersions(slug, edges);
  const fate = causeOfDeath(connections, entities);
  const blocks = entity.article ? parseArticle(entity.article) : [];
  const isPerson = entity.kind === "character" || entity.kind === "creature";

  const citedSources = [...new Set(connections.map((c) => c.edge.sourceRef).filter((s): s is string => !!s))]
    .map((s) => sources[s])
    .filter(Boolean)
    .sort((a, b) => a.author.localeCompare(b.author));

  const factions = entity.kind === "event"
    ? facts.participants
        .map((s) => entities.get(s))
        .filter((e) => e?.kind === "group" && e.subtype === "faction")
        .map((f) => ({ faction: f!, members: edges.filter((e) => e.type === "member_of" && e.target === f!.slug).map((e) => e.source) }))
    : [];

  // "See also": the neighbours most densely tied to this entry.
  const tieStrength = new Map<string, number>();
  for (const c of connections) tieStrength.set(c.other, (tieStrength.get(c.other) ?? 0) + (c.category === "association" ? 1 : 2));
  const seeAlso = [...tieStrength.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([s]) => s);

  const relationSections = RELATION_CATEGORIES.map((category) => ({ category, groups: groups.filter((g) => g.category === category) })).filter((s) => s.groups.length);
  const hasGenealogy = parentage.length > 0 || facts.children.length > 0 || facts.siblings.length > 0;

  const toc = [
    ...blocks.filter((b) => b.type === "heading").map((b) => ({ id: b.id, text: b.text })),
    ...(hasGenealogy ? [{ id: "genealogy", text: "Genealogy" }] : []),
    ...(factions.length > 1 ? [{ id: "sides", text: "Sides" }] : []),
    ...relationSections.map((s) => ({ id: s.category, text: CATEGORY_TITLES[s.category] })),
    ...(timeline.length ? [{ id: "chronology", text: "Chronology" }] : []),
    ...(citedSources.length ? [{ id: "sources", text: "Ancient sources" }] : []),
  ];

  const list = (slugs: string[], limit = 8) => (slugs.length ? <EntityList slugs={slugs} entities={entities} limit={limit} /> : null);

  return (
    <PageTransition>
    <article>
      <header className="relative mb-12 pb-10">
        {entity.image ? (
          <Image src={entity.image} alt="" width={640} height={600} sizes="(min-width: 640px) 420px, 260px" className="hero-art pointer-events-none absolute -top-6 right-0 h-[15rem] w-auto select-none sm:h-[21rem]" aria-hidden />
        ) : (
          <div className="pointer-events-none absolute -top-10 right-0 select-none text-[13rem] leading-none opacity-[0.07] sm:text-[18rem]" aria-hidden>{entity.emoji}</div>
        )}
        <p className="label kicker">{entity.subtype} · {entity.kind}</p>
        <ViewTransition name={`entity-${slug}`} share="morph" default="none">
          <h1 className="display mt-4 inline-block text-gilded">{entity.name}</h1>
        </ViewTransition>
        {entity.epithet && <p className="mt-3 text-2xl italic text-muted">{entity.epithet}</p>}
        <div className="mt-7 flex flex-wrap gap-2">
          <Link href={`/graph?focus=${slug}`} className="chip">✳ Relations</Link>
          {isPerson && <Link href={`/tree/${slug}`} className="chip">⑂ Family tree</Link>}
          <Link href={`/kinship?from=${slug}`} className="chip">⟷ Kinship</Link>
        </div>
        <div className="meander absolute inset-x-0 bottom-0 opacity-60" />
      </header>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 lg:order-1">
          {entity.summary && <p className="mb-8 text-[1.35rem] leading-relaxed"><RichText text={entity.summary} entities={entities} /></p>}

          {blocks.length > 0 ? (
            <ArticleBody blocks={blocks} entities={entities} />
          ) : (
            <p className="callout mb-6 font-sans text-sm text-muted">This entry is a stub: a summary with its recorded relationships and sources below.</p>
          )}

          {hasGenealogy && (
            <Reveal as="section" className="mt-16">
              <h2 id="genealogy" className="section-title">Genealogy</h2>
              {parentage.length > 1 && <p className="mb-3">Ancient authors give {parentage.length} different accounts of {entity.name}&apos;s parentage.</p>}
              {parentage.length > 0 && (
                <div className="table-wrap mb-5"><table className="ref">
                  <thead><tr><th className="label">Parents</th><th className="label">Tradition</th><th className="label">Source</th></tr></thead>
                  <tbody>
                    {parentage.map((v) => {
                      const t = v.tradition ? traditions[v.tradition] : null;
                      return (
                        <tr key={v.key}>
                          <td>
                            <EntityList slugs={v.parents} entities={entities} />
                            {v.parents.length === 1 && <span className="text-muted"> (alone)</span>}
                            {v.note && <div className="mt-0.5 text-sm text-muted"><RichText text={v.note} entities={entities} /></div>}
                          </td>
                          <td>
                            {t ? <Link href={`/traditions/${t.key}`} className="wikilink">{t.name}</Link> : <span className="text-muted">General</span>}
                            {v.certainty !== "canonical" && <span className="ml-1.5 font-sans text-xs text-gold">({v.certainty})</span>}
                          </td>
                          <td className="text-sm">{v.citation ?? (v.sourceRef && sources[v.sourceRef] ? `${sources[v.sourceRef].author}, ${sources[v.sourceRef].work}` : "—")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table></div>
              )}
              <dl className="space-y-2">
                {facts.siblings.length > 0 && <div><dt className="label">Siblings and half-siblings ({facts.siblings.length})</dt><dd><EntityList slugs={facts.siblings} entities={entities} limit={30} /></dd></div>}
                {facts.children.length > 0 && <div><dt className="label">Offspring ({facts.children.length})</dt><dd><EntityList slugs={facts.children} entities={entities} limit={60} /></dd></div>}
              </dl>
              {isPerson && <p className="mt-3 font-sans text-sm"><Link href={`/tree/${slug}`} className="wikilink">View family tree →</Link></p>}
            </Reveal>
          )}

          {factions.length > 1 && (
            <Reveal as="section" className="mt-16">
              <h2 id="sides" className="section-title">Sides</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {factions.map(({ faction, members }) => (
                  <div key={faction.slug} className="card p-5">
                    <h3 className="mb-2 text-lg font-semibold"><EntityLink entity={faction} slug={faction.slug} /></h3>
                    <p><EntityList slugs={members} entities={entities} /></p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {relationSections.map(({ category, groups: roleGroups }) => (
            <Reveal as="section" key={category} className={`mt-16 cat-${category}`}>
              <h2 id={category} className="section-title">{CATEGORY_TITLES[category]}</h2>
              {category === "association" ? <AssociationLists groups={roleGroups} graph={graph} /> : <RelationsTable groups={roleGroups} graph={graph} />}
            </Reveal>
          ))}

          {timeline.length > 0 && (
            <Reveal as="section" className="mt-16">
              <h2 id="chronology" className="section-title">Chronology</h2>
              <ol className="ml-2 space-y-4 border-l border-line">
                {timeline.map((t) => (
                  <li key={t.id} className="relative pl-7 before:absolute before:-left-[4.5px] before:top-[0.7em] before:size-2 before:rounded-full before:bg-gold before:shadow-[0_0_10px_var(--gold)]">
                    {t.label}
                    {t.event_slug && entities.get(t.event_slug) && <> (<EntityLink entity={entities.get(t.event_slug)} slug={t.event_slug} />)</>}
                  </li>
                ))}
              </ol>
            </Reveal>
          )}

          {citedSources.length > 0 && (
            <Reveal as="section" className="mt-16">
              <h2 id="sources" className="section-title">Ancient sources</h2>
              <ul className="space-y-1">
                {citedSources.map((s) => (
                  <li key={s.slug}>
                    {s.author}, <Link href={`/sources/${s.slug}`} className="wikilink italic">{s.work}</Link>
                    {s.period && <span className="text-muted"> ({s.period})</span>}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {seeAlso.length > 0 && (
            <Reveal as="section" className="mt-16">
              <h2 className="section-title">See also</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {seeAlso.map((s) => entities.get(s)).filter((e) => !!e).map((e) => (
                  <li key={e.slug}>
                    <Link href={`/wiki/${e.slug}`} transitionTypes={["nav-forward"]} className="card card-hover group flex items-center gap-4 p-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-glass text-xl" aria-hidden>{e.emoji ?? "·"}</span>
                      <span className="min-w-0">
                        <span className="block font-semibold transition-colors group-hover:text-gold">{e.name}</span>
                        <span className="block truncate text-sm text-muted">{e.epithet ?? e.subtype}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>

        <div className="space-y-6 lg:order-2">
          <Infobox
            title={entity.name}
            subtitle={entity.epithet}
            glyph={entity.emoji}
            image={entity.image}
            rows={[
              { label: "Type", value: <span className="capitalize">{entity.subtype}</span> },
              { label: "Also called", value: entity.aliases.length ? entity.aliases.join(", ") : null },
              { label: "Sex", value: isPerson && entity.gender ? (GENDER[entity.gender] ?? null) : null },
              { label: "Domains", value: entity.domains.length ? entity.domains.join(", ") : null },
              { label: "Parents", value: parentage.length ? (
                  <>
                    <EntityList slugs={parentage[0].parents} entities={entities} />
                    {parentage.length > 1 && <span className="text-muted"> — <a href="#genealogy" className="wikilink">{parentage.length - 1} other account{parentage.length > 2 ? "s" : ""}</a></span>}
                  </>
                ) : null },
              { label: "Consorts", value: list(facts.consorts) },
              { label: "Offspring", value: list(facts.children, 6) },
              { label: "Member of", value: list(facts.memberOf) },
              { label: "Members", value: list(facts.members, 12) },
              { label: entity.kind === "place" ? "Located in" : "Places", value: list(facts.abodes, 6) },
              { label: "Rulers", value: list(facts.rulers) },
              { label: "Attributes", value: list(facts.attributes) },
              { label: "Made by", value: list(facts.makers) },
              { label: "Held by", value: list(facts.holders) },
              { label: "Fate", value: fate },
            ]}
          />

          {toc.length > 2 && (
            <div className="hidden lg:sticky lg:top-28 lg:block"><TocSpy items={toc} /></div>
          )}
        </div>
      </div>
    </article>
    </PageTransition>
  );
}

function RelationsTable({ groups, graph }: { groups: RoleGroup[]; graph: Graph }) {
  const { entities, traditions, sources } = graph;
  return (
    <div className="table-wrap"><table className="ref">
      <thead><tr><th className="label w-[9.5rem]">Relation</th><th className="label">Figure</th><th className="label w-[14rem]">Source</th></tr></thead>
      <tbody>
        {groups.flatMap((g) =>
          g.items.map((item, i) => {
            const cites = [...new Set(item.edges.map((e) => e.citation ?? (e.sourceRef && sources[e.sourceRef] ? `${sources[e.sourceRef].author}, ${sources[e.sourceRef].work}` : null)).filter((c): c is string => !!c))];
            const trads = [...new Set(item.edges.map((e) => e.tradition).filter((t): t is string => !!t))];
            return (
              <tr key={g.role + item.other}>
                <td className="text-muted">{i === 0 ? <span className="first-letter:uppercase inline-block">{g.label}</span> : ""}</td>
                <td>
                  <EntityLink entity={entities.get(item.other)} slug={item.other} />
                  {item.contested && <span className="ml-1.5 font-sans text-xs text-gold">(disputed)</span>}
                  {item.note && <div className="text-sm text-muted"><RichText text={item.note} entities={entities} /></div>}
                </td>
                <td className="text-sm">
                  {cites.join("; ") || <span className="text-muted">—</span>}
                  {trads.length > 0 && <div className="font-sans text-xs text-muted">{trads.map((t) => traditions[t]?.name).filter(Boolean).join(", ")}</div>}
                </td>
              </tr>
            );
          }),
        )}
      </tbody>
    </table></div>
  );
}

function AssociationLists({ groups, graph }: { groups: RoleGroup[]; graph: Graph }) {
  return (
    <dl className="space-y-3">
      {groups.map((g) => (
        <div key={g.role}>
          <dt className="label">{g.label} ({g.items.length})</dt>
          <dd><EntityList slugs={g.items.map((i) => i.other)} entities={graph.entities} /></dd>
        </div>
      ))}
    </dl>
  );
}
