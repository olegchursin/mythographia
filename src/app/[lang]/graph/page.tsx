import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { EgoGraph, type GraphNode } from "@/components/EgoGraph";
import { EntityLink } from "@/components/Entity";
import { PageTransition } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { ChipLink } from "@/components/NavLink";
import { connectionsOf, egoLayout, type Category } from "@/lib/graph";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { toLocale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { getDictionary, getI18n } from "@/i18n/server";
import { getGraph } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return { title: getDictionary(toLocale((await params).lang)).graph.title };
}

const CATEGORIES: { key: Category & keyof Dictionary["graph"]["categories"] }[] = [{ key: "family" }, { key: "romance" }, { key: "conflict" }, { key: "alliance" }, { key: "association" }];
const DEFAULT_CATS: Category[] = ["family", "romance", "conflict", "alliance"];
const STARTERS = ["zeus", "achilles", "medusa", "odysseus", "heracles", "helen", "nyx", "trojan-war"];

export default async function GraphPage({ searchParams }: PageProps<"/[lang]/graph">) {
  const params = await searchParams;
  const focusSlug = typeof params.focus === "string" ? params.focus : "zeus";
  const cats = typeof params.cats === "string" ? (params.cats.split(",").filter((c) => CATEGORIES.some((k) => k.key === c)) as Category[]) : DEFAULT_CATS;
  const tradition = typeof params.t === "string" ? params.t : null;

  const { locale, t } = await getI18n();
  const { entities, edges, types, traditions } = await getGraph(locale);
  const focus = entities.get(focusSlug);
  if (!focus) notFound();

  const href = (next: { focus?: string; cats?: Category[]; t?: string | null }) => {
    const q = new URLSearchParams({ focus: next.focus ?? focusSlug });
    const c = next.cats ?? cats;
    if (c.join() !== DEFAULT_CATS.join()) q.set("cats", c.join(","));
    const t = next.t === undefined ? tradition : next.t;
    if (t) q.set("t", t);
    return `/graph?${q}`;
  };

  // A tradition filter hides edges that belong to a *different* tradition; unattributed edges stay.
  const visible = edges.filter((e) => !tradition || !e.tradition || e.tradition === tradition);
  const connections = connectionsOf(focusSlug, visible, types).filter((c) => cats.includes(c.category) && entities.has(c.other));

  // One node per neighbour, filed under its first category in display order.
  const neighbours = [...Map.groupBy(connections, (c) => c.other).entries()].map(([slug, cs]) => ({
    slug,
    category: CATEGORIES.find((k) => cs.some((c) => c.category === k.key))!.key,
    label: [...new Set(cs.map((c) => c.label))].join(" · "),
    contested: cs.every((c) => c.edge.certainty !== "canonical"),
  }));
  const layout = egoLayout(CATEGORIES.map((k) => ({ category: k.key, slugs: neighbours.filter((n) => n.category === k.key).map((n) => n.slug) })));
  const pos = new Map(layout.map((p) => [p.slug, p]));

  const nodes: GraphNode[] = [
    { slug: focusSlug, name: focus.name, x: 0, y: 0, category: "focus", label: "", contested: false },
    ...neighbours.map((n) => ({ slug: n.slug, name: entities.get(n.slug)!.name, x: pos.get(n.slug)!.x, y: pos.get(n.slug)!.y, category: n.category, label: n.label, contested: n.contested })),
  ];
  const hrefFor = Object.fromEntries(nodes.map((n) => [n.slug, n.slug === focusSlug ? `/wiki/${n.slug}` : href({ focus: n.slug })]));
  const usedTraditions = [...new Set(connectionsOf(focusSlug, edges, types).map((c) => c.edge.tradition).filter((k): k is string => !!k))];

  return (
    <PageTransition>
      <header>
        <p className="label kicker">{t.graph.title}</p>
        <h1 className="display mt-4 text-gilded">{focus.name}</h1>
        <p className="lede mt-4">
          {fill(t.graph.lede, { count: t.graph.figures(neighbours.length), focus: <EntityLink entity={focus} slug={focusSlug} /> })}
        </p>
      </header>

      <div className="mt-9 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label mr-2 w-24">{t.graph.show}</span>
          {CATEGORIES.map((k) => {
            const on = cats.includes(k.key);
            const next = on ? cats.filter((c) => c !== k.key) : CATEGORIES.map((c) => c.key).filter((c) => cats.includes(c) || c === k.key);
            return (
              <ChipLink key={k.key} href={href({ cats: next })} active={on} className={`cat-${k.key}`}>
                <span className={`inline-block size-2 rounded-full ${on ? "bg-(--cat) shadow-[0_0_8px_var(--cat)]" : "border border-(--cat)"}`} />
                {t.graph.categories[k.key]}
              </ChipLink>
            );
          })}
        </div>
        {usedTraditions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="label mr-2 w-24">{t.graph.accordingTo}</span>
            <ChipLink href={href({ t: null })} active={!tradition}>{t.graph.allSources}</ChipLink>
            {usedTraditions.map((k) => traditions[k] && <ChipLink key={k} href={href({ t: k })} active={tradition === k}>{traditions[k].name}</ChipLink>)}
          </div>
        )}
      </div>

      <Reveal className="stage mt-7 p-2 sm:p-4" y={40}>
        {neighbours.length ? <EgoGraph nodes={nodes} focusName={focus.name} hrefFor={hrefFor} t={t.ego} /> : <p className="p-16 text-center text-muted">{t.graph.empty}</p>}
      </Reveal>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="label mr-2">{t.graph.otherStarts}</span>
        {STARTERS.filter((s) => s !== focusSlug && entities.get(s)).map((s) => <ChipLink key={s} href={href({ focus: s })}>{entities.get(s)!.emoji} {entities.get(s)!.name}</ChipLink>)}
        <Link href={`/kinship?from=${focusSlug}`} className="chip">{t.graph.kinshipFinder}</Link>
        <Link href={`/tree/${focusSlug}`} className="chip">{t.graph.familyTree}</Link>
      </div>
    </PageTransition>
  );
}
