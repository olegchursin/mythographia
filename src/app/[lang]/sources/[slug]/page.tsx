import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { ClaimsTable } from "@/components/ClaimsTable";
import { EntityLink } from "@/components/Entity";
import { PageTransition } from "@/components/motion/PageTransition";
import { toLocale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getGraph, getSources } from "@/lib/queries";

export const generateStaticParams = async () => Object.keys(await getSources("en")).map((slug) => ({ slug }));

export async function generateMetadata({ params }: PageProps<"/[lang]/sources/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const s = (await getSources(toLocale(lang)))[slug];
  return { title: s ? `${s.author}, ${s.work}` : undefined };
}

export default async function SourcePage({ params }: PageProps<"/[lang]/sources/[slug]">) {
  const { slug } = await params;
  const { locale, t } = await getI18n();
  const { entities, edges, types, sources, traditions } = await getGraph(locale);
  const source = sources[slug];
  if (!source) notFound();

  const claims = edges.filter((e) => e.sourceRef === slug);
  const trads = [...new Set(claims.map((e) => e.tradition).filter((k): k is string => !!k))];
  const entry = source.entity_slug ? entities.get(source.entity_slug) : undefined;

  return (
    <PageTransition className="page max-w-[60rem]">
      <p className="label kicker"><Link href="/sources" className="hover:text-ink">{t.sources.title}</Link></p>
      <h1 className="display display-sm mt-4 text-gilded"><span className="italic">{source.work}</span></h1>
      <p className="mt-3 text-xl text-muted">{source.author}{source.period && ` · ${source.period}`}</p>
      {source.summary && <p className="mt-5 text-[1.25rem] leading-relaxed">{source.summary}</p>}
      <p className="mt-3 font-sans text-sm text-muted">
        {entry && <>{t.sources.entry}<EntityLink entity={entry} slug={entry.slug} /> · </>}
        {trads.length > 0 && <>{t.sources.tradition}{trads.map((k, i) => <span key={k}>{i > 0 && ", "}<Link href={`/traditions/${k}`} className="wikilink">{traditions[k]?.name}</Link></span>)}</>}
      </p>

      <section className="mt-16">
        <h2 className="section-title">{t.sources.attested(claims.length)}</h2>
        {claims.length ? <ClaimsTable edges={claims} entities={entities} types={types} /> : <p className="text-muted">{t.sources.none}</p>}
      </section>
    </PageTransition>
  );
}
