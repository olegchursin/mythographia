import type { Metadata } from "next";
import Link from "next/link";
import { EntityLink } from "@/components/Entity";
import { PageTransition } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { PathChain } from "@/components/PathChain";
import { kinshipTerm, kinships, lineage, shortestPath } from "@/lib/graph";
import { getGraph, type EntityLite } from "@/lib/queries";

export const metadata: Metadata = { title: "Kinship finder" };

const EXAMPLES: [string, string][] = [
  ["achilles", "zeus"],
  ["perseus", "heracles"],
  ["medusa", "bellerophon"],
  ["cerberus", "gaia"],
  ["helen", "orestes"],
  ["achilles", "ajax-the-great"],
];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

function resolve(input: string | string[] | undefined, entities: Map<string, EntityLite>): EntityLite | null {
  if (typeof input !== "string" || !input.trim()) return null;
  const q = norm(input);
  const all = [...entities.values()];
  return entities.get(q) ?? all.find((e) => norm(e.name) === q) ?? all.find((e) => e.aliases.some((a) => norm(a) === q)) ?? all.find((e) => norm(e.name).startsWith(q)) ?? null;
}

export default async function KinshipPage({ searchParams }: PageProps<"/kinship">) {
  const params = await searchParams;
  const { entities, edges, types, traditions } = await getGraph();
  const a = resolve(params.from, entities);
  const b = resolve(params.to, entities);
  const missing = [params.from, params.to].filter((v, i) => typeof v === "string" && v.trim() && ![a, b][i]) as string[];

  const kin = a && b ? kinships(a.slug, b.slug, edges) : [];
  // Prefer a path through kin, consorts, conflicts and alliances; fall back to any connection at all.
  const path = a && b ? shortestPath(a.slug, b.slug, edges, types, { categories: ["family", "romance", "conflict", "alliance"] }) ?? shortestPath(a.slug, b.slug, edges, types) : null;
  const options = [...entities.values()].filter((e) => e.kind === "character" || e.kind === "creature" || e.kind === "group");
  const gens = (n: number) => `${n} generation${n === 1 ? "" : "s"}`;

  return (
    <PageTransition className="page page-narrow space-y-10">
      <header className="text-center">
        <p className="label kicker inline-block">Reference tool</p>
        <h1 className="display mt-4">Kinship <span className="text-gilded">finder</span></h1>
        <p className="lede mx-auto mt-4">Enter two figures to see their blood relationship, the lines of descent with sources, and the shortest chain of recorded relations between them.</p>
      </header>

      <form action="/kinship" className="card p-5 sm:p-7">
        <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
          {(["from", "to"] as const).map((name, i) => (
            <label key={name} className={`label block ${i === 1 ? "sm:order-3" : ""}`}>
              {i === 0 ? "First figure" : "Second figure"}
              <input name={name} list="figures" required defaultValue={[a, b][i]?.name ?? (typeof params[name] === "string" ? (params[name] as string) : "")} placeholder={i === 0 ? "Achilles" : "Zeus"} autoComplete="off"
                className="input mt-2 normal-case tracking-normal" />
            </label>
          ))}
          <span className="hidden pb-3 text-2xl text-gold sm:order-2 sm:block" aria-hidden>⟷</span>
        </div>
        <datalist id="figures">{options.map((e) => <option key={e.slug} value={e.name} />)}</datalist>
        <button className="btn btn-primary mt-5 w-full">Find relationship</button>
      </form>

      {missing.map((m) => <p key={m} className="callout cat-conflict">No entry matches “{m}”. Choose a name from the suggestions.</p>)}
      {a && b && a.slug === b.slug && <p className="callout text-muted">Those are the same figure.</p>}

      {a && b && a.slug !== b.slug && (
        <>
          {kin.map((k) => {
            const direct = k.slug === a.slug || k.slug === b.slug;
            const ancestor = entities.get(k.slug)!;
            return (
              <Reveal as="section" key={k.slug}>
                <h2 className="section-title">{direct ? "Line of descent" : "Nearest common ancestor"}</h2>
                <p className="mb-6 text-[1.15rem]">
                  {direct
                    ? <><EntityLink entity={k.slug === a.slug ? b : a} slug={k.slug === a.slug ? b.slug : a.slug} /> descends from <EntityLink entity={ancestor} slug={k.slug} />, {gens(Math.max(k.depthA, k.depthB))} removed.</>
                    : <><EntityLink entity={a} slug={a.slug} /> and <EntityLink entity={b} slug={b.slug} /> are <strong className="text-gilded">{kinshipTerm(k.depthA, k.depthB)}</strong> through <EntityLink entity={ancestor} slug={k.slug} /> ({gens(k.depthA)} and {gens(k.depthB)} removed).</>}
                </p>
                {direct ? (
                  <PathChain start={k.slug} steps={lineage(k.slug, k.slug === a.slug ? b.slug : a.slug, edges, types)} entities={entities} traditions={traditions} />
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <PathChain start={k.slug} steps={lineage(k.slug, a.slug, edges, types)} entities={entities} traditions={traditions} />
                    <PathChain start={k.slug} steps={lineage(k.slug, b.slug, edges, types)} entities={entities} traditions={traditions} />
                  </div>
                )}
              </Reveal>
            );
          })}
          {kin.length === 0 && <p className="callout text-muted">No blood relationship is recorded between {a.name} and {b.name}.</p>}

          <Reveal as="section">
            <h2 className="section-title">Shortest connection</h2>
            {path ? (
              <>
                <p className="mb-4 text-muted">{path.length} {path.length === 1 ? "step" : "steps"}, through any kind of recorded relation.</p>
                <PathChain start={a.slug} steps={path} entities={entities} traditions={traditions} />
              </>
            ) : <p className="text-muted">No chain of recorded relations links them.</p>}
          </Reveal>

          <div className="flex flex-wrap gap-2">
            <Link href={`/kinship?from=${b.slug}&to=${a.slug}`} className="chip">⇄ Reverse</Link>
            <Link href={`/tree/${a.slug}`} className="chip">⑂ Family tree of {a.name}</Link>
            <Link href={`/tree/${b.slug}`} className="chip">⑂ Family tree of {b.name}</Link>
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="label mr-2">Try</span>
        {EXAMPLES.map(([x, y]) => <Link key={x + y} href={`/kinship?from=${x}&to=${y}`} className="chip">{entities.get(x)?.name} ⟷ {entities.get(y)?.name}</Link>)}
      </div>
    </PageTransition>
  );
}
