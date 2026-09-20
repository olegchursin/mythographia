import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClaimsTable } from "@/components/ClaimsTable";
import { EntityLink } from "@/components/Entity";
import { PageTransition } from "@/components/motion/PageTransition";
import { getGraph, getSources } from "@/lib/queries";

export const generateStaticParams = async () => Object.keys(await getSources()).map((slug) => ({ slug }));

export async function generateMetadata({ params }: PageProps<"/sources/[slug]">): Promise<Metadata> {
  const { sources } = await getGraph();
  const s = sources[(await params).slug];
  return { title: s ? `${s.author}, ${s.work}` : undefined };
}

export default async function SourcePage({ params }: PageProps<"/sources/[slug]">) {
  const { slug } = await params;
  const { entities, edges, types, sources, traditions } = await getGraph();
  const source = sources[slug];
  if (!source) notFound();

  const claims = edges.filter((e) => e.sourceRef === slug);
  const trads = [...new Set(claims.map((e) => e.tradition).filter((t): t is string => !!t))];
  const entry = source.entity_slug ? entities.get(source.entity_slug) : undefined;

  return (
    <PageTransition className="page max-w-[60rem]">
      <p className="label kicker"><Link href="/sources" className="hover:text-ink">Ancient sources</Link></p>
      <h1 className="display display-sm mt-4 text-gilded"><span className="italic">{source.work}</span></h1>
      <p className="mt-3 text-xl text-muted">{source.author}{source.period && ` · ${source.period}`}</p>
      {source.summary && <p className="mt-5 text-[1.25rem] leading-relaxed">{source.summary}</p>}
      <p className="mt-3 font-sans text-sm text-muted">
        {entry && <>Encyclopedia entry: <EntityLink entity={entry} slug={entry.slug} /> · </>}
        {trads.length > 0 && <>Tradition: {trads.map((t, i) => <span key={t}>{i > 0 && ", "}<Link href={`/traditions/${t}`} className="wikilink">{traditions[t]?.name}</Link></span>)}</>}
      </p>

      <section className="mt-16">
        <h2 className="section-title">Relationships attested ({claims.length})</h2>
        {claims.length ? <ClaimsTable edges={claims} entities={entities} types={types} /> : <p className="text-muted">No relationships are cited from this text yet.</p>}
      </section>
    </PageTransition>
  );
}
