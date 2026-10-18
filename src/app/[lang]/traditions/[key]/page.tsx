import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { ClaimsTable } from "@/components/ClaimsTable";
import { EntityLink, EntityList } from "@/components/Entity";
import { PageTransition } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { parentageVersions } from "@/lib/profile";
import { toLocale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getGraph, getTraditions } from "@/lib/queries";

export const generateStaticParams = async () => Object.keys(await getTraditions("en")).map((key) => ({ key }));

export async function generateMetadata({ params }: PageProps<"/[lang]/traditions/[key]">): Promise<Metadata> {
  const { lang, key } = await params;
  const traditions = await getTraditions(toLocale(lang));
  return { title: traditions[key]?.name };
}

export default async function TraditionPage({ params }: PageProps<"/[lang]/traditions/[key]">) {
  const { key } = await params;
  const { locale, t } = await getI18n();
  const { entities, edges, types, traditions, sources } = await getGraph(locale);
  const tradition = traditions[key];
  if (!tradition) notFound();

  const claims = edges.filter((e) => e.tradition === key);
  const usedSources = [...new Set(claims.map((e) => e.sourceRef).filter((s): s is string => !!s))].map((s) => sources[s]).filter(Boolean);

  // Where this tradition's account of someone's parents differs from another tradition's.
  const disagreements = [...new Set(claims.filter((e) => e.type === "parent").map((e) => e.target))]
    .map((slug) => {
      const versions = parentageVersions(slug, edges);
      const mine = versions.filter((v) => v.tradition === key);
      const sig = (p: string[]) => p.slice().sort().join("+");
      const others = versions.filter((v) => v.tradition !== key && !mine.some((m) => sig(m.parents) === sig(v.parents)));
      return { slug, mine, others };
    })
    .filter((d) => d.others.length > 0)
    .sort((a, b) => (entities.get(a.slug)?.name ?? "").localeCompare(entities.get(b.slug)?.name ?? "", locale));

  const byCategory = Map.groupBy(claims, (e) => types[e.type]?.category ?? "association");

  return (
    <PageTransition className="page max-w-[60rem]">
      <p className="label kicker"><Link href="/traditions" className="hover:text-ink">{t.traditions.title}</Link></p>
      <h1 className="display display-sm mt-4 text-gilded">{tradition.name}</h1>
      <p className="label mt-3">{tradition.period} · {t.traditions.claims(claims.length)}</p>
      <p className="mt-5 text-[1.25rem] leading-relaxed">{tradition.description}</p>
      {usedSources.length > 0 && (
        <p className="mt-3 text-muted">
          {t.traditions.principalTexts}
          {usedSources.map((s, i) => <span key={s.slug}>{i > 0 && "; "}{s.author}, <Link href={`/sources/${s.slug}`} className="wikilink italic">{s.work}</Link></span>)}.
        </p>
      )}

      {disagreements.length > 0 && (
        <Reveal as="section" className="mt-16">
          <h2 className="section-title">{t.traditions.differs}</h2>
          <div className="table-wrap"><table className="ref">
            <thead><tr><th className="label">{t.traditions.figure}</th><th className="label">{t.traditions.parentsHere}</th><th className="label">{t.traditions.elsewhere}</th></tr></thead>
            <tbody>
              {disagreements.map((d) => (
                <tr key={d.slug}>
                  <td><EntityLink entity={entities.get(d.slug)} slug={d.slug} /></td>
                  <td>{d.mine.map((v) => <div key={v.key}><EntityList slugs={v.parents} entities={entities} />{v.parents.length === 1 && <span className="text-muted">{t.wiki.alone}</span>}</div>)}</td>
                  <td>
                    {d.others.map((v) => (
                      <div key={v.key}>
                        <EntityList slugs={v.parents} entities={entities} />
                        <span className="font-sans text-xs text-muted"> — {v.tradition && traditions[v.tradition] ? traditions[v.tradition].name : (v.citation ?? t.traditions.otherSources)}</span>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </Reveal>
      )}

      {(["family", "romance", "conflict", "alliance", "association"] as const).map((c) => byCategory.get(c)?.length ? (
        <Reveal as="section" key={c} className="mt-16">
          <h2 className="section-title">{t.traditions.sections[c]}</h2>
          <ClaimsTable edges={byCategory.get(c)!} entities={entities} types={types} />
        </Reveal>
      ) : null)}
    </PageTransition>
  );
}
