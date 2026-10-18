import type { Metadata } from "next";
import Link from "@/components/Link";
import { EntityLink } from "@/components/Entity";
import { PageTransition } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { PathChain } from "@/components/PathChain";
import { kinshipTerm, kinships, lineage, shortestPath } from "@/lib/graph";
import { href as localeHref, toLocale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { getDictionary, getI18n } from "@/i18n/server";
import { getGraph, type EntityLite } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return { title: getDictionary(toLocale((await params).lang)).kinship.title };
}

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
  // Names, aliases and (on translated pages) the English names all resolve.
  return entities.get(q) ?? all.find((e) => norm(e.name) === q) ?? all.find((e) => [...e.aliases, ...e.altNames].some((a) => norm(a) === q)) ?? all.find((e) => norm(e.name).startsWith(q)) ?? null;
}

export default async function KinshipPage({ searchParams }: PageProps<"/[lang]/kinship">) {
  const params = await searchParams;
  const { locale, t } = await getI18n();
  const k = t.kinship;
  const { entities, edges, types, traditions } = await getGraph(locale);
  const a = resolve(params.from, entities);
  const b = resolve(params.to, entities);
  const missing = [params.from, params.to].filter((v, i) => typeof v === "string" && v.trim() && ![a, b][i]) as string[];

  const kin = a && b ? kinships(a.slug, b.slug, edges) : [];
  // Prefer a path through kin, consorts, conflicts and alliances; fall back to any connection at all.
  const path = a && b ? shortestPath(a.slug, b.slug, edges, types, { categories: ["family", "romance", "conflict", "alliance"] }) ?? shortestPath(a.slug, b.slug, edges, types) : null;
  const options = [...entities.values()].filter((e) => e.kind === "character" || e.kind === "creature" || e.kind === "group");

  return (
    <PageTransition className="page page-narrow space-y-10">
      <header className="text-center">
        <p className="label kicker inline-block">{k.kicker}</p>
        <h1 className="display mt-4">{k.titleStart}<span className="text-gilded">{k.titleGild}</span></h1>
        <p className="lede mx-auto mt-4">{k.lede}</p>
      </header>

      <form action={localeHref(locale, "/kinship")} className="card p-5 sm:p-7">
        <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
          {(["from", "to"] as const).map((name, i) => (
            <label key={name} className={`label block ${i === 1 ? "sm:order-3" : ""}`}>
              {i === 0 ? k.first : k.second}
              <input name={name} list="figures" required defaultValue={[a, b][i]?.name ?? (typeof params[name] === "string" ? (params[name] as string) : "")} placeholder={i === 0 ? k.firstPlaceholder : k.secondPlaceholder} autoComplete="off"
                className="input mt-2 normal-case tracking-normal" />
            </label>
          ))}
          <span className="hidden pb-3 text-2xl text-gold sm:order-2 sm:block" aria-hidden>⟷</span>
        </div>
        <datalist id="figures">{options.map((e) => <option key={e.slug} value={e.name} />)}</datalist>
        <button className="btn btn-primary mt-5 w-full">{k.submit}</button>
      </form>

      {missing.map((m) => <p key={m} className="callout cat-conflict">{k.noMatch(m)}</p>)}
      {a && b && a.slug === b.slug && <p className="callout text-muted">{k.same}</p>}

      {a && b && a.slug !== b.slug && (
        <>
          {kin.map((kn) => {
            const direct = kn.slug === a.slug || kn.slug === b.slug;
            const ancestor = entities.get(kn.slug)!;
            return (
              <Reveal as="section" key={kn.slug}>
                <h2 className="section-title">{direct ? k.lineOfDescent : k.commonAncestor}</h2>
                <p className="mb-6 text-[1.15rem]">
                  {direct
                    ? fill(k.direct, {
                        desc: <EntityLink entity={kn.slug === a.slug ? b : a} slug={kn.slug === a.slug ? b.slug : a.slug} />,
                        anc: <EntityLink entity={ancestor} slug={kn.slug} />,
                        gens: k.gens(Math.max(kn.depthA, kn.depthB)),
                      })
                    : fill(k.shared, {
                        a: <EntityLink entity={a} slug={a.slug} />,
                        b: <EntityLink entity={b} slug={b.slug} />,
                        term: <strong className="text-gilded">{kinshipTerm(kn.depthA, kn.depthB, locale)}</strong>,
                        anc: <EntityLink entity={ancestor} slug={kn.slug} />,
                        ga: k.gens(kn.depthA),
                        gb: k.gens(kn.depthB),
                      })}
                </p>
                {direct ? (
                  <PathChain start={kn.slug} steps={lineage(kn.slug, kn.slug === a.slug ? b.slug : a.slug, edges, types)} entities={entities} traditions={traditions} />
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <PathChain start={kn.slug} steps={lineage(kn.slug, a.slug, edges, types)} entities={entities} traditions={traditions} />
                    <PathChain start={kn.slug} steps={lineage(kn.slug, b.slug, edges, types)} entities={entities} traditions={traditions} />
                  </div>
                )}
              </Reveal>
            );
          })}
          {kin.length === 0 && <p className="callout text-muted">{fill(k.noBlood, { a: a.name, b: b.name })}</p>}

          <Reveal as="section">
            <h2 className="section-title">{k.shortest}</h2>
            {path ? (
              <>
                <p className="mb-4 text-muted">{k.steps(path.length)}</p>
                <PathChain start={a.slug} steps={path} entities={entities} traditions={traditions} />
              </>
            ) : <p className="text-muted">{k.noChain}</p>}
          </Reveal>

          <div className="flex flex-wrap gap-2">
            <Link href={`/kinship?from=${b.slug}&to=${a.slug}`} className="chip">{k.reverse}</Link>
            <Link href={`/tree/${a.slug}`} className="chip">{k.treeOf(a.name)}</Link>
            <Link href={`/tree/${b.slug}`} className="chip">{k.treeOf(b.name)}</Link>
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="label mr-2">{k.try}</span>
        {EXAMPLES.map(([x, y]) => <Link key={x + y} href={`/kinship?from=${x}&to=${y}`} className="chip">{entities.get(x)?.name} ⟷ {entities.get(y)?.name}</Link>)}
      </div>
    </PageTransition>
  );
}
