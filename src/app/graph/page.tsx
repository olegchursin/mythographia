import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EgoGraph, type GraphNode } from "@/components/EgoGraph";
import { EntityLink } from "@/components/Entity";
import { PageTransition } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { ChipLink } from "@/components/NavLink";
import { connectionsOf, egoLayout, type Category } from "@/lib/graph";
import { getGraph } from "@/lib/queries";

export const metadata: Metadata = { title: "Relations diagram" };

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "family", label: "Kin" },
  { key: "romance", label: "Consorts and loves" },
  { key: "conflict", label: "Conflicts" },
  { key: "alliance", label: "Allies and patrons" },
  { key: "association", label: "Groups, places, objects" },
];
const DEFAULT_CATS: Category[] = ["family", "romance", "conflict", "alliance"];
const STARTERS = ["zeus", "achilles", "medusa", "odysseus", "heracles", "helen", "nyx", "trojan-war"];

export default async function GraphPage({ searchParams }: PageProps<"/graph">) {
  const params = await searchParams;
  const focusSlug = typeof params.focus === "string" ? params.focus : "zeus";
  const cats = typeof params.cats === "string" ? (params.cats.split(",").filter((c) => CATEGORIES.some((k) => k.key === c)) as Category[]) : DEFAULT_CATS;
  const tradition = typeof params.t === "string" ? params.t : null;

  const { entities, edges, types, traditions } = await getGraph();
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
  const usedTraditions = [...new Set(connectionsOf(focusSlug, edges, types).map((c) => c.edge.tradition).filter((t): t is string => !!t))];

  return (
    <PageTransition>
      <header>
        <p className="label kicker">Relations diagram</p>
        <h1 className="display mt-4 text-gilded">{focus.name}</h1>
        <p className="lede mt-4">
          {neighbours.length} figures directly connected to <EntityLink entity={focus} slug={focusSlug} />, grouped by kind of relation. Dashed lines are disputed.
        </p>
      </header>

      <div className="mt-9 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label mr-2 w-24">Show</span>
          {CATEGORIES.map((k) => {
            const on = cats.includes(k.key);
            const next = on ? cats.filter((c) => c !== k.key) : CATEGORIES.map((c) => c.key).filter((c) => cats.includes(c) || c === k.key);
            return (
              <ChipLink key={k.key} href={href({ cats: next })} active={on} className={`cat-${k.key}`}>
                <span className={`inline-block size-2 rounded-full ${on ? "bg-(--cat) shadow-[0_0_8px_var(--cat)]" : "border border-(--cat)"}`} />
                {k.label}
              </ChipLink>
            );
          })}
        </div>
        {usedTraditions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="label mr-2 w-24">According to</span>
            <ChipLink href={href({ t: null })} active={!tradition}>all sources</ChipLink>
            {usedTraditions.map((t) => traditions[t] && <ChipLink key={t} href={href({ t })} active={tradition === t}>{traditions[t].name}</ChipLink>)}
          </div>
        )}
      </div>

      <Reveal className="stage mt-7 p-2 sm:p-4" y={40}>
        {neighbours.length ? <EgoGraph nodes={nodes} focusName={focus.name} hrefFor={hrefFor} /> : <p className="p-16 text-center text-muted">No recorded relations match these filters.</p>}
      </Reveal>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="label mr-2">Other starting points</span>
        {STARTERS.filter((s) => s !== focusSlug && entities.get(s)).map((s) => <ChipLink key={s} href={href({ focus: s })}>{entities.get(s)!.emoji} {entities.get(s)!.name}</ChipLink>)}
        <Link href={`/kinship?from=${focusSlug}`} className="chip">⟷ Kinship finder</Link>
        <Link href={`/tree/${focusSlug}`} className="chip">⑂ Family tree</Link>
      </div>
    </PageTransition>
  );
}
