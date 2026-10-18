import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
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
import { alternates, toLocale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { getI18n } from "@/i18n/server";
import { getEntities, getEntity, getGraph, getTimeline } from "@/lib/queries";

export const generateStaticParams = async () => [...(await getEntities("en")).keys()].map((slug) => ({ slug }));

export async function generateMetadata({ params }: PageProps<"/[lang]/wiki/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const [entity, entities] = await Promise.all([getEntity(locale, slug), getEntities(locale)]);
  return entity ? { title: entity.name, alternates: alternates(`/wiki/${slug}`), description: entity.summary ? plainText(entity.summary, (s) => entities.get(s)?.name) : (entity.epithet ?? undefined) } : {};
}

const RELATION_CATEGORIES: Category[] = ["romance", "conflict", "alliance", "association"];

type Graph = Awaited<ReturnType<typeof getGraph>>;

export default async function ArticlePage({ params }: PageProps<"/[lang]/wiki/[slug]">) {
  const { slug } = await params;
  const { locale, t } = await getI18n();
  const entity = await getEntity(locale, slug);
  if (!entity) notFound();

  const [graph, timeline] = await Promise.all([getGraph(locale), getTimeline(locale, slug)]);
  const { entities, edges, types, traditions, sources } = graph;
  const connections = connectionsOf(slug, edges, types);
  const groups = groupConnections(connections, entities, locale);
  const facts = infoboxFacts(slug, connections, edges);
  const parentage = parentageVersions(slug, edges);
  const fate = causeOfDeath(connections, entities, t.entity.killedBy);
  const blocks = entity.article ? parseArticle(entity.article) : [];
  const isPerson = entity.kind === "character" || entity.kind === "creature";

  const citedSources = [...new Set(connections.map((c) => c.edge.sourceRef).filter((s): s is string => !!s))]
    .map((s) => sources[s])
    .filter(Boolean)
    .sort((a, b) => a.author.localeCompare(b.author, locale));

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
    ...(hasGenealogy ? [{ id: "genealogy", text: t.wiki.genealogy }] : []),
    ...(factions.length > 1 ? [{ id: "sides", text: t.wiki.sides }] : []),
    ...relationSections.map((s) => ({ id: s.category, text: t.categories[s.category] })),
    ...(timeline.length ? [{ id: "chronology", text: t.wiki.chronology }] : []),
    ...(citedSources.length ? [{ id: "sources", text: t.wiki.sources }] : []),
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
        <p className="label kicker">{t.subtype[entity.subtype] ?? entity.subtype} · {t.kind[entity.kind] ?? entity.kind}</p>
        <ViewTransition name={`entity-${slug}`} share="morph" default="none">
          <h1 className="display mt-4 inline-block text-gilded">{entity.name}</h1>
        </ViewTransition>
        {entity.epithet && <p className="mt-3 text-2xl italic text-muted">{entity.epithet}</p>}
        <div className="mt-7 flex flex-wrap gap-2">
          <Link href={`/graph?focus=${slug}`} className="chip">{t.wiki.relations}</Link>
          {isPerson && <Link href={`/tree/${slug}`} className="chip">{t.wiki.familyTree}</Link>}
          <Link href={`/kinship?from=${slug}`} className="chip">{t.wiki.kinship}</Link>
        </div>
        <div className="meander absolute inset-x-0 bottom-0 opacity-60" />
      </header>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 lg:order-1">
          {entity.summary && <p className="mb-8 text-[1.35rem] leading-relaxed"><RichText text={entity.summary} entities={entities} /></p>}

          {blocks.length > 0 ? (
            <ArticleBody blocks={blocks} entities={entities} />
          ) : (
            <p className="callout mb-6 font-sans text-sm text-muted">{t.wiki.stub}</p>
          )}

          {hasGenealogy && (
            <Reveal as="section" className="mt-16">
              <h2 id="genealogy" className="section-title">{t.wiki.genealogy}</h2>
              {parentage.length > 1 && <p className="mb-3">{t.wiki.parentageAccounts(parentage.length, entity.name)}</p>}
              {parentage.length > 0 && (
                <div className="table-wrap mb-5"><table className="ref">
                  <thead><tr><th className="label">{t.wiki.parents}</th><th className="label">{t.wiki.tradition}</th><th className="label">{t.wiki.source}</th></tr></thead>
                  <tbody>
                    {parentage.map((v) => {
                      const trad = v.tradition ? traditions[v.tradition] : null;
                      return (
                        <tr key={v.key}>
                          <td>
                            <EntityList slugs={v.parents} entities={entities} />
                            {v.parents.length === 1 && <span className="text-muted">{t.wiki.alone}</span>}
                            {v.note && <div className="mt-0.5 text-sm text-muted"><RichText text={v.note} entities={entities} /></div>}
                          </td>
                          <td>
                            {trad ? <Link href={`/traditions/${trad.key}`} className="wikilink">{trad.name}</Link> : <span className="text-muted">{t.wiki.general}</span>}
                            {v.certainty !== "canonical" && <span className="ml-1.5 font-sans text-xs text-gold">({t.certainty[v.certainty]})</span>}
                          </td>
                          <td className="text-sm">{v.citation ?? (v.sourceRef && sources[v.sourceRef] ? `${sources[v.sourceRef].author}, ${sources[v.sourceRef].work}` : "—")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table></div>
              )}
              <dl className="space-y-2">
                {facts.siblings.length > 0 && <div><dt className="label">{t.wiki.siblings} ({facts.siblings.length})</dt><dd><EntityList slugs={facts.siblings} entities={entities} limit={30} /></dd></div>}
                {facts.children.length > 0 && <div><dt className="label">{t.wiki.offspring} ({facts.children.length})</dt><dd><EntityList slugs={facts.children} entities={entities} limit={60} /></dd></div>}
              </dl>
              {isPerson && <p className="mt-3 font-sans text-sm"><Link href={`/tree/${slug}`} className="wikilink">{t.wiki.viewTree}</Link></p>}
            </Reveal>
          )}

          {factions.length > 1 && (
            <Reveal as="section" className="mt-16">
              <h2 id="sides" className="section-title">{t.wiki.sides}</h2>
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
              <h2 id={category} className="section-title">{t.categories[category]}</h2>
              {category === "association" ? <AssociationLists groups={roleGroups} graph={graph} /> : <RelationsTable groups={roleGroups} graph={graph} t={t} />}
            </Reveal>
          ))}

          {timeline.length > 0 && (
            <Reveal as="section" className="mt-16">
              <h2 id="chronology" className="section-title">{t.wiki.chronology}</h2>
              <ol className="ml-2 space-y-4 border-l border-line">
                {timeline.map((step) => (
                  <li key={step.id} className="relative pl-7 before:absolute before:-left-[4.5px] before:top-[0.7em] before:size-2 before:rounded-full before:bg-gold before:shadow-[0_0_10px_var(--gold)]">
                    {step.label}
                    {step.event_slug && entities.get(step.event_slug) && <> (<EntityLink entity={entities.get(step.event_slug)} slug={step.event_slug} />)</>}
                  </li>
                ))}
              </ol>
            </Reveal>
          )}

          {citedSources.length > 0 && (
            <Reveal as="section" className="mt-16">
              <h2 id="sources" className="section-title">{t.wiki.sources}</h2>
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
              <h2 className="section-title">{t.wiki.seeAlso}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {seeAlso.map((s) => entities.get(s)).filter((e) => !!e).map((e) => (
                  <li key={e.slug}>
                    <Link href={`/wiki/${e.slug}`} transitionTypes={["nav-forward"]} className="card card-hover group flex items-center gap-4 p-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-glass text-xl" aria-hidden>{e.emoji ?? "·"}</span>
                      <span className="min-w-0">
                        <span className="block font-semibold transition-colors group-hover:text-gold">{e.name}</span>
                        <span className="block truncate text-sm text-muted">{e.epithet ?? t.subtype[e.subtype] ?? e.subtype}</span>
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
            label={t.entity.quickFacts(entity.name)}
            subtitle={entity.epithet}
            glyph={entity.emoji}
            image={entity.image}
            rows={[
              { label: t.wiki.rows.type, value: <span className="capitalize">{t.subtype[entity.subtype] ?? entity.subtype}</span> },
              { label: t.wiki.rows.aliases, value: entity.aliases.length ? entity.aliases.join(", ") : null },
              { label: t.wiki.rows.sex, value: isPerson && entity.gender ? (t.gender[entity.gender] ?? null) : null },
              { label: t.wiki.rows.domains, value: entity.domains.length ? entity.domains.join(", ") : null },
              { label: t.wiki.rows.parents, value: parentage.length ? (
                  <>
                    <EntityList slugs={parentage[0].parents} entities={entities} />
                    {parentage.length > 1 && <span className="text-muted"> — <a href="#genealogy" className="wikilink">{t.wiki.otherAccounts(parentage.length - 1)}</a></span>}
                  </>
                ) : null },
              { label: t.wiki.rows.consorts, value: list(facts.consorts) },
              { label: t.wiki.rows.offspring, value: list(facts.children, 6) },
              { label: t.wiki.rows.memberOf, value: list(facts.memberOf) },
              { label: t.wiki.rows.members, value: list(facts.members, 12) },
              { label: entity.kind === "place" ? t.wiki.rows.locatedIn : t.wiki.rows.places, value: list(facts.abodes, 6) },
              { label: t.wiki.rows.rulers, value: list(facts.rulers) },
              { label: t.wiki.rows.attributes, value: list(facts.attributes) },
              { label: t.wiki.rows.madeBy, value: list(facts.makers) },
              { label: t.wiki.rows.heldBy, value: list(facts.holders) },
              { label: t.wiki.rows.fate, value: fate },
            ]}
          />

          {toc.length > 2 && (
            <div className="hidden lg:sticky lg:top-28 lg:block"><TocSpy items={toc} label={t.toc.contents} /></div>
          )}
        </div>
      </div>
    </article>
    </PageTransition>
  );
}

function RelationsTable({ groups, graph, t }: { groups: RoleGroup[]; graph: Graph; t: Dictionary }) {
  const { entities, traditions, sources } = graph;
  return (
    <div className="table-wrap"><table className="ref">
      <thead><tr><th className="label w-[9.5rem]">{t.wiki.relation}</th><th className="label">{t.wiki.figure}</th><th className="label w-[14rem]">{t.wiki.source}</th></tr></thead>
      <tbody>
        {groups.flatMap((g) =>
          g.items.map((item, i) => {
            const cites = [...new Set(item.edges.map((e) => e.citation ?? (e.sourceRef && sources[e.sourceRef] ? `${sources[e.sourceRef].author}, ${sources[e.sourceRef].work}` : null)).filter((c): c is string => !!c))];
            const trads = [...new Set(item.edges.map((e) => e.tradition).filter((k): k is string => !!k))];
            return (
              <tr key={g.role + item.other}>
                <td className="text-muted">{i === 0 ? <span className="first-letter:uppercase inline-block">{g.label}</span> : ""}</td>
                <td>
                  <EntityLink entity={entities.get(item.other)} slug={item.other} />
                  {item.contested && <span className="ml-1.5 font-sans text-xs text-gold">{t.wiki.disputed}</span>}
                  {item.note && <div className="text-sm text-muted"><RichText text={item.note} entities={entities} /></div>}
                </td>
                <td className="text-sm">
                  {cites.join("; ") || <span className="text-muted">—</span>}
                  {trads.length > 0 && <div className="font-sans text-xs text-muted">{trads.map((k) => traditions[k]?.name).filter(Boolean).join(", ")}</div>}
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
