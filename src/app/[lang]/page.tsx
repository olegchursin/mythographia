import Link from "@/components/Link";
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
import type { Metadata } from "next";
import { alternates } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { getI18n } from "@/i18n/server";
import { dayIndex } from "@/lib/today";

// Static, but re-rendered hourly so the featured entry still turns over each day.
export const revalidate = 3600;

export const metadata: Metadata = { alternates: alternates("/") };

type SectionKey = keyof Dictionary["home"]["sections"];
const SECTIONS: { key: SectionKey; glyph: string; span: string; href: string; match: (kind: string, subtype: string) => boolean }[] = [
  { key: "primordial", glyph: "🌌", span: "sm:col-span-2", href: "/a-z?kind=character&subtype=primordial", match: (_, s) => s === "primordial" },
  { key: "titan", glyph: "⛰️", span: "", href: "/a-z?kind=character&subtype=titan", match: (_, s) => s === "titan" },
  { key: "olympian", glyph: "⚡", span: "sm:col-span-2 lg:row-span-2", href: "/a-z?kind=character&subtype=olympian", match: (_, s) => s === "olympian" },
  { key: "hero", glyph: "🗡️", span: "", href: "/a-z?kind=character&subtype=hero", match: (_, s) => s === "hero" || s === "heroine" },
  { key: "creature", glyph: "🐍", span: "", href: "/a-z?kind=creature", match: (k) => k === "creature" },
  { key: "group", glyph: "🎭", span: "", href: "/a-z?kind=group", match: (k) => k === "group" },
  { key: "place", glyph: "🏛️", span: "", href: "/a-z?kind=place", match: (k) => k === "place" },
  { key: "event", glyph: "🔥", span: "sm:col-span-2", href: "/a-z?kind=event", match: (k) => k === "event" },
  { key: "artifact", glyph: "🏺", span: "", href: "/a-z?kind=artifact", match: (k) => k === "artifact" },
  { key: "story", glyph: "📜", span: "", href: "/a-z?kind=story", match: (k) => k === "story" },
];

export default async function FrontPage() {
  const { locale, t } = await getI18n();
  const [{ entities, edges, traditions, sources }, articleSlugs] = await Promise.all([getGraph(locale), getArticleSlugs(locale)]);
  const all = [...entities.values()];
  const featured = articleSlugs.length ? entities.get(articleSlugs[dayIndex() % articleSlugs.length]) : undefined;

  const contested = all
    .map((e) => ({ e, versions: parentageVersions(e.slug, edges) }))
    .filter(({ versions }) => new Set(versions.map((v) => v.parents.slice().sort().join("+"))).size > 1)
    .sort((a, b) => b.versions.length - a.versions.length || a.e.name.localeCompare(b.e.name, locale));

  const constellation = ["zeus", "athena", "apollo", "artemis", "hera", "poseidon", "hades", "heracles", "achilles", "odysseus", "medusa", "perseus", "gaia", "nyx", "cronus", "helen", "orpheus", "theseus", "prometheus", "aphrodite", "hermes", "dionysus"]
    .map((s) => entities.get(s)?.name)
    .filter((n): n is string => !!n);
  const stats = [
    { value: all.length, label: t.home.stats.entries },
    { value: edges.length, label: t.home.stats.relationships },
    { value: Object.keys(traditions).length, label: t.home.stats.traditions },
    { value: Object.keys(sources).length, label: t.home.stats.sources },
  ];
  const tools = [
    { href: "/graph", ...t.home.tools.graph, cat: "cat-alliance", glyph: "✳" },
    { href: "/tree/zeus", ...t.home.tools.tree, cat: "cat-family", glyph: "⑂" },
    { href: "/kinship", ...t.home.tools.kinship, cat: "cat-romance", glyph: "⟷" },
    { href: "/traditions", ...t.home.tools.traditions, cat: "cat-association", glyph: "§" },
  ];

  return (
    <PageTransition className="">
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
        <HeroConstellation names={constellation} />
        <HeroFade className="relative mx-auto w-full max-w-5xl px-5 pb-24 pt-36 text-center">
          <p className="label kicker mb-7 inline-block">{t.home.kicker}</p>
          <h1 className="display">
            <SplitWords text={t.home.headline} gild={t.home.headlineGild} />
          </h1>
          <Reveal delay={0.7} y={16}>
            <p className="lede mx-auto mt-8">
              {t.home.lede}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Magnetic><Link href="/graph" transitionTypes={["nav-forward"]} className="btn btn-primary">{t.home.explore} <span aria-hidden>→</span></Link></Magnetic>
              <PaletteButton className="btn btn-ghost">{t.home.search} <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[0.68rem] text-muted">⌘K</kbd></PaletteButton>
            </div>
          </Reveal>
        </HeroFade>
        <div className="absolute inset-x-0 bottom-7 flex flex-col items-center gap-2 text-muted" aria-hidden>
          <span className="label">{t.home.scroll}</span>
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-28 px-5 pb-24">
        <Stagger className="grid grid-cols-2 overflow-hidden rounded-[var(--r-card)] border border-line bg-line [gap:1px] lg:grid-cols-4">
          {stats.map((s) => (
            <StaggerItem key={s.label} className="bg-paper px-6 py-8 text-center">
              <CountUp value={s.value} locale={locale} className="font-display text-4xl font-bold text-gilded sm:text-5xl" />
              <p className="label mt-2">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>

        {featured && (
          <Reveal as="section">
            <SpotlightCard tilt={2} className="p-7 sm:p-12">
              <div className="pointer-events-none absolute -right-10 -top-16 select-none text-[15rem] leading-none opacity-[0.08] blur-[1px]" aria-hidden>{featured.emoji}</div>
              <p className="label kicker mb-5">{t.home.featured}</p>
              <ViewTransition name={`entity-${featured.slug}`} share="morph" default="none">
                <h2 className="display display-sm inline-block">{featured.name}</h2>
              </ViewTransition>
              {featured.epithet && <p className="mt-2 text-xl italic text-muted">{featured.epithet}</p>}
              {featured.summary && <p className="mt-5 max-w-3xl text-[1.15rem] leading-relaxed"><RichText text={featured.summary} entities={entities} /></p>}
              <p className="mt-8"><Link href={`/wiki/${featured.slug}`} transitionTypes={["nav-forward"]} className="btn btn-ghost">{t.home.readEntry} <span aria-hidden>→</span></Link></p>
            </SpotlightCard>
          </Reveal>
        )}

        <section>
          <Reveal>
            <p className="label kicker mb-3">{t.home.browseKicker}</p>
            <h2 className="display display-sm mb-10">{t.home.browseTitle}</h2>
          </Reveal>
          <Stagger as="ul" className="grid auto-rows-[minmax(10.5rem,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SECTIONS.map((s) => (
              <StaggerItem as="li" key={s.key} className={s.span}>
                <Link href={s.href} transitionTypes={["nav-forward"]} className="group block h-full rounded-[var(--r-card)]">
                  <SpotlightCard className="flex h-full flex-col p-6">
                    <div className="flex items-start justify-between">
                      <span className="text-3xl transition-transform duration-500 ease-expo group-hover:-translate-y-1 group-hover:scale-125" aria-hidden>{s.glyph}</span>
                      <span className="rounded-full border border-line px-2.5 py-0.5 font-sans text-xs text-muted">{all.filter((e) => s.match(e.kind, e.subtype)).length}</span>
                    </div>
                    <h3 className="mt-auto pt-8 text-xl font-semibold transition-colors group-hover:text-gold">{t.home.sections[s.key].title}</h3>
                    <p className="mt-1 text-sm text-muted">{t.home.sections[s.key].blurb}</p>
                  </SpotlightCard>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section>
          <Reveal>
            <p className="label kicker mb-3">{t.home.toolsKicker}</p>
            <h2 className="display display-sm mb-10">{t.home.toolsTitle}</h2>
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
              <p className="label kicker mb-3">{t.home.contestedKicker}</p>
              <h2 className="display display-sm">{t.home.contestedTitle}</h2>
              <p className="lede mb-10 mt-3">{t.home.contestedLede}</p>
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
                    <span className="mt-2 font-sans text-xs text-muted">{t.home.rivalAccounts(versions.length)}</span>
                  </div>
                </Link>
              ))}
            </Reveal>
          </section>
        )}

        {articleSlugs.length > 0 && (
          <section>
            <Reveal>
              <p className="label kicker mb-3">{t.home.articlesKicker}</p>
              <h2 className="display display-sm mb-10">{t.home.articlesTitle}</h2>
            </Reveal>
            <Stagger as="ul" className="flex flex-wrap gap-2.5">
              {articleSlugs.map((s) => entities.get(s)).filter((e) => !!e).sort((a, b) => a.name.localeCompare(b.name, locale)).map((e) => (
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
