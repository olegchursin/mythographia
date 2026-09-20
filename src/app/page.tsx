import Link from "next/link";
import { ViewTransition } from "react";
import { RichText } from "@/components/ArticleBody";
import { HeroConstellation } from "@/components/HeroConstellation";
import { CountUp } from "@/components/motion/CountUp";
import { Magnetic } from "@/components/motion/Magnetic";
import { PageTransition } from "@/components/motion/PageTransition";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { HeroFade } from "@/components/motion/Scroll";
import { SplitWords } from "@/components/motion/SplitWords";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { PaletteButton } from "@/components/PaletteButton";
import { parentageVersions } from "@/lib/profile";
import { getArticleSlugs, getGraph } from "@/lib/queries";
import { dayIndex } from "@/lib/today";

// Static, but re-rendered hourly so the featured entry still turns over each day.
export const revalidate = 3600;

const SECTIONS: { title: string; glyph: string; span: string; blurb: string; href: string; match: (kind: string, subtype: string) => boolean }[] = [
  { title: "Primordial gods", glyph: "🌌", span: "sm:col-span-2", blurb: "Chaos, Earth, Night and the first powers", href: "/a-z?kind=character&subtype=primordial", match: (_, s) => s === "primordial" },
  { title: "Titans", glyph: "⛰️", span: "", blurb: "The elder gods and their children", href: "/a-z?kind=character&subtype=titan", match: (_, s) => s === "titan" },
  { title: "Olympians", glyph: "⚡", span: "sm:col-span-2 lg:row-span-2", blurb: "Zeus and the ruling gods of Olympus", href: "/a-z?kind=character&subtype=olympian", match: (_, s) => s === "olympian" },
  { title: "Heroes and heroines", glyph: "🗡️", span: "", blurb: "Heracles, Perseus, Atalanta, Odysseus", href: "/a-z?kind=character&subtype=hero", match: (_, s) => s === "hero" || s === "heroine" },
  { title: "Monsters and creatures", glyph: "🐍", span: "", blurb: "Typhon's brood, Gorgons, centaurs", href: "/a-z?kind=creature", match: (k) => k === "creature" },
  { title: "Groups and collectives", glyph: "🎭", span: "", blurb: "Muses, Fates, Argonauts, Achaeans", href: "/a-z?kind=group", match: (k) => k === "group" },
  { title: "Places", glyph: "🏛️", span: "", blurb: "Olympus, the Underworld, Troy, Thebes", href: "/a-z?kind=place", match: (k) => k === "place" },
  { title: "Wars, quests and events", glyph: "🔥", span: "sm:col-span-2", blurb: "From the Titanomachy to the return of Odysseus", href: "/a-z?kind=event", match: (k) => k === "event" },
  { title: "Artifacts", glyph: "🏺", span: "", blurb: "The thunderbolt, the Fleece, the Aegis", href: "/a-z?kind=artifact", match: (k) => k === "artifact" },
  { title: "Texts", glyph: "📜", span: "", blurb: "Epics, hymns, tragedies and handbooks", href: "/a-z?kind=story", match: (k) => k === "story" },
];

export default async function FrontPage() {
  const [{ entities, edges, traditions, sources }, articleSlugs] = await Promise.all([getGraph(), getArticleSlugs()]);
  const all = [...entities.values()];
  const featured = articleSlugs.length ? entities.get(articleSlugs[dayIndex() % articleSlugs.length]) : undefined;

  const contested = all
    .map((e) => ({ e, versions: parentageVersions(e.slug, edges) }))
    .filter(({ versions }) => new Set(versions.map((v) => v.parents.slice().sort().join("+"))).size > 1)
    .sort((a, b) => b.versions.length - a.versions.length || a.e.name.localeCompare(b.e.name));

  const constellation = ["zeus", "athena", "apollo", "artemis", "hera", "poseidon", "hades", "heracles", "achilles", "odysseus", "medusa", "perseus", "gaia", "nyx", "cronus", "helen", "orpheus", "theseus", "prometheus", "aphrodite", "hermes", "dionysus"]
    .map((s) => entities.get(s)?.name)
    .filter((n): n is string => !!n);
  const stats = [
    { value: all.length, label: "Entries" },
    { value: edges.length, label: "Recorded relationships" },
    { value: Object.keys(traditions).length, label: "Traditions" },
    { value: Object.keys(sources).length, label: "Ancient sources" },
  ];
  const tools = [
    { href: "/graph", title: "Relations diagram", blurb: "Kin, consorts, enemies and allies orbiting one figure.", cat: "cat-alliance", glyph: "✳" },
    { href: "/tree/zeus", title: "Family trees", blurb: "Ancestors and descendants of any figure, by tradition.", cat: "cat-family", glyph: "⑂" },
    { href: "/kinship", title: "Kinship finder", blurb: "How any two figures are related, with the line of descent.", cat: "cat-romance", glyph: "⟷" },
    { href: "/traditions", title: "Traditions & sources", blurb: "Every claim, grouped by who made it.", cat: "cat-association", glyph: "§" },
  ];

  return (
    <PageTransition className="">
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
        <HeroConstellation names={constellation} />
        <HeroFade className="relative mx-auto w-full max-w-5xl px-5 pb-24 pt-36 text-center">
          <p className="label kicker mb-7 inline-block">An encyclopedia of Greek myth</p>
          <h1 className="display">
            <SplitWords text="The myths of the Greeks, with their sources" gild={["myths", "sources"]} />
          </h1>
          <Reveal delay={0.7} y={16}>
            <p className="lede mx-auto mt-8">
              Greek myth never had a single canon. Where Hesiod, Homer and the rest disagree, every version is kept, attributed, and set side by side.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Magnetic><Link href="/graph" transitionTypes={["nav-forward"]} className="btn btn-primary">Explore the web of relations <span aria-hidden>→</span></Link></Magnetic>
              <PaletteButton className="btn btn-ghost">Search the encyclopedia <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[0.68rem] text-muted">⌘K</kbd></PaletteButton>
            </div>
          </Reveal>
        </HeroFade>
        <div className="absolute inset-x-0 bottom-7 flex flex-col items-center gap-2 text-muted" aria-hidden>
          <span className="label">Scroll</span>
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-28 px-5 pb-24">
        <Stagger className="grid grid-cols-2 overflow-hidden rounded-[var(--r-card)] border border-line bg-line [gap:1px] lg:grid-cols-4">
          {stats.map((s) => (
            <StaggerItem key={s.label} className="bg-paper px-6 py-8 text-center">
              <CountUp value={s.value} className="font-display text-4xl font-bold text-gilded sm:text-5xl" />
              <p className="label mt-2">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>

        {featured && (
          <Reveal as="section">
            <SpotlightCard tilt={2} className="p-7 sm:p-12">
              <div className="pointer-events-none absolute -right-10 -top-16 select-none text-[15rem] leading-none opacity-[0.08] blur-[1px]" aria-hidden>{featured.emoji}</div>
              <p className="label kicker mb-5">Featured entry · today</p>
              <ViewTransition name={`entity-${featured.slug}`} share="morph" default="none">
                <h2 className="display display-sm inline-block">{featured.name}</h2>
              </ViewTransition>
              {featured.epithet && <p className="mt-2 text-xl italic text-muted">{featured.epithet}</p>}
              {featured.summary && <p className="mt-5 max-w-3xl text-[1.15rem] leading-relaxed"><RichText text={featured.summary} entities={entities} /></p>}
              <p className="mt-8"><Link href={`/wiki/${featured.slug}`} transitionTypes={["nav-forward"]} className="btn btn-ghost">Read the entry <span aria-hidden>→</span></Link></p>
            </SpotlightCard>
          </Reveal>
        )}

        <section>
          <Reveal>
            <p className="label kicker mb-3">Browse</p>
            <h2 className="display display-sm mb-10">By subject</h2>
          </Reveal>
          <Stagger as="ul" className="grid auto-rows-[minmax(10.5rem,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SECTIONS.map((s) => (
              <StaggerItem as="li" key={s.title} className={s.span}>
                <Link href={s.href} transitionTypes={["nav-forward"]} className="group block h-full rounded-[var(--r-card)]">
                  <SpotlightCard className="flex h-full flex-col p-6">
                    <div className="flex items-start justify-between">
                      <span className="text-3xl transition-transform duration-500 ease-expo group-hover:-translate-y-1 group-hover:scale-125" aria-hidden>{s.glyph}</span>
                      <span className="rounded-full border border-line px-2.5 py-0.5 font-sans text-xs text-muted">{all.filter((e) => s.match(e.kind, e.subtype)).length}</span>
                    </div>
                    <h3 className="mt-auto pt-8 text-xl font-semibold transition-colors group-hover:text-gold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted">{s.blurb}</p>
                  </SpotlightCard>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section>
          <Reveal>
            <p className="label kicker mb-3">Reference tools</p>
            <h2 className="display display-sm mb-10">Follow the threads</h2>
          </Reveal>
          <Stagger as="ul" className="grid gap-4 md:grid-cols-2">
            {tools.map((t) => (
              <StaggerItem as="li" key={t.href} className={t.cat}>
                <Link href={t.href} transitionTypes={["nav-forward"]} className="group block h-full rounded-[var(--r-card)]">
                  <SpotlightCard tilt={3} className="flex h-full items-center gap-6 p-7">
                    <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-(--cat)/40 bg-(--cat)/10 text-2xl text-(--cat) transition-transform duration-500 ease-expo group-hover:rotate-6 group-hover:scale-110" aria-hidden>{t.glyph}</span>
                    <span>
                      <span className="block text-xl font-semibold">{t.title}</span>
                      <span className="mt-1 block text-[0.97rem] text-muted">{t.blurb}</span>
                    </span>
                    <span className="ml-auto text-xl text-(--cat) opacity-0 transition-all duration-500 ease-expo group-hover:translate-x-1 group-hover:opacity-100" aria-hidden>→</span>
                  </SpotlightCard>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {contested.length > 0 && (
          <section>
            <Reveal>
              <p className="label kicker mb-3">The sources disagree</p>
              <h2 className="display display-sm">Contested parentage</h2>
              <p className="lede mb-10 mt-3">Figures whose parents differ from author to author. Drag sideways.</p>
            </Reveal>
            <Reveal className="rail -mx-5 px-5" y={40}>
              {contested.slice(0, 14).map(({ e, versions }) => (
                <Link key={e.slug} href={`/wiki/${e.slug}#genealogy`} transitionTypes={["nav-forward"]} className="group w-60">
                  <div className="card card-hover flex h-full flex-col p-5">
                    <span className="text-3xl" aria-hidden>{e.emoji ?? "❖"}</span>
                    <span className="mt-6 text-xl font-semibold transition-colors group-hover:text-gold">{e.name}</span>
                    <span className="mt-1 line-clamp-2 min-h-10 text-sm text-muted">{e.epithet}</span>
                    <span className="mt-5 flex items-center gap-1.5 font-sans text-xs text-gold">
                      {versions.map((v) => <span key={v.key} className="h-1 flex-1 rounded-full bg-gold/60" />)}
                    </span>
                    <span className="mt-2 font-sans text-xs text-muted">{versions.length} rival accounts</span>
                  </div>
                </Link>
              ))}
            </Reveal>
          </section>
        )}

        {articleSlugs.length > 0 && (
          <section>
            <Reveal>
              <p className="label kicker mb-3">Long reads</p>
              <h2 className="display display-sm mb-10">Principal articles</h2>
            </Reveal>
            <Stagger as="ul" className="flex flex-wrap gap-2.5">
              {articleSlugs.map((s) => entities.get(s)).filter((e) => !!e).sort((a, b) => a.name.localeCompare(b.name)).map((e) => (
                <StaggerItem as="li" key={e.slug}>
                  <Link href={`/wiki/${e.slug}`} transitionTypes={["nav-forward"]} className="chip !px-4 !py-2 !text-[0.95rem]"><span aria-hidden>{e.emoji}</span>{e.name}</Link>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        )}
      </div>
    </PageTransition>
  );
}
