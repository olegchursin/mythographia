import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityLink } from "@/components/Entity";
import { FamilyTree } from "@/components/FamilyTree";
import { PageTransition, SwapTransition } from "@/components/motion/PageTransition";
import { ChipLink } from "@/components/NavLink";
import { familyTree } from "@/lib/graph";
import { getGraph } from "@/lib/queries";

export const metadata: Metadata = { title: "Family tree" };

const STARTERS = ["zeus", "gaia", "nyx", "heracles", "achilles", "helen", "agamemnon", "oedipus", "cerberus", "aphrodite"];

export default async function TreePage({ params, searchParams }: PageProps<"/tree/[slug]">) {
  const { slug } = await params;
  const t = (await searchParams).t;
  const tradition = typeof t === "string" ? t : null;
  const { entities, edges, traditions } = await getGraph();
  const subject = entities.get(slug);
  if (!subject) notFound();

  const tree = familyTree(slug, edges, { tradition });
  const href = (s: string, trad: string | null = tradition) => `/tree/${s}${trad ? `?t=${trad}` : ""}`;

  // Offer only traditions that actually say something about this tree's people.
  const inTree = new Set(tree.nodes.map((n) => n.slug));
  const relevant = [...new Set(edges.filter((e) => e.type === "parent" && e.tradition && (inTree.has(e.target) || inTree.has(e.source))).map((e) => e.tradition!))];

  return (
    <PageTransition>
      <header>
        <p className="label kicker">Family tree</p>
        <h1 className="display mt-4 text-gilded">{subject.name}</h1>
        <p className="lede mt-4">
          Three generations of ancestors and two of descendants. Select any name to re-centre the tree; dashed lines mark parentage attested only as a variant.{" "}
          <EntityLink entity={subject} slug={slug}>Read the entry on {subject.name}</EntityLink>.
        </p>
      </header>

      <nav className="mt-9 flex flex-wrap items-center gap-2" aria-label="Tradition">
        <span className="label mr-2">According to</span>
        <ChipLink href={href(slug, null)} active={!tradition}>the prevailing account</ChipLink>
        {relevant.map((k) => traditions[k] && <ChipLink key={k} href={href(slug, k)} title={traditions[k].description ?? undefined} active={tradition === k}>{traditions[k].name}</ChipLink>)}
      </nav>

      <SwapTransition key={`${slug}:${tradition}`} className="mt-7">
        {tree.nodes.length > 1 ? <FamilyTree tree={tree} entities={entities} hrefFor={(s) => (s === slug ? `/wiki/${s}` : href(s))} /> : (
          <p className="stage p-10 text-center text-muted">No parents or offspring are recorded for {subject.name}.</p>
        )}
      </SwapTransition>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="label mr-2">Other trees</span>
        {STARTERS.filter((s) => s !== slug && entities.get(s)).map((s) => <Link key={s} href={href(s)} className="chip">{entities.get(s)!.emoji} {entities.get(s)!.name}</Link>)}
      </div>
    </PageTransition>
  );
}
