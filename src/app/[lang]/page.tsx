import Link from "@/components/Link";
import { ViewTransition } from "react";
import { RichText } from "@/components/ArticleBody";
import { Greeting } from "@/components/Greeting";
import { HeroConstellation } from "@/components/HeroConstellation";
import { Icon, type IconName } from "@/components/icons";
import { CountUp } from "@/components/motion/CountUp";
import { PageTransition } from "@/components/motion/PageTransition";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { PaletteButton } from "@/components/PaletteButton";
import { Rail } from "@/components/Rail";
import { Tabs } from "@/components/Tabs";
import { parentageVersions } from "@/lib/profile";
import { getArticleSlugs, getGraph, type EntityLite } from "@/lib/queries";
import type { Metadata } from "next";
import { alternates } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { getI18n } from "@/i18n/server";
import { dayIndex } from "@/lib/today";

// Static, but re-rendered hourly so the featured entry still turns over each day.
export const revalidate = 3600;

export const metadata: Metadata = { alternates: alternates("/") };

type SectionKey = keyof Dictionary["home"]["sections"];
type Cat = "family" | "romance" | "conflict" | "alliance" | "association";
const SECTIONS: { key: SectionKey; glyph: string; cat: Cat; href: string; match: (kind: string, subtype: string) => boolean }[] = [
  { key: "primordial", glyph: "🌌", cat: "alliance", href: "/a-z?kind=character&subtype=primordial", match: (_, s) => s === "primordial" },
  { key: "titan", glyph: "⛰️", cat: "family", href: "/a-z?kind=character&subtype=titan", match: (_, s) => s === "titan" },
  { key: "olympian", glyph: "⚡", cat: "association", href: "/a-z?kind=character&subtype=olympian", match: (_, s) => s === "olympian" },
  { key: "hero", glyph: "🗡️", cat: "conflict", href: "/a-z?kind=character&subtype=hero", match: (_, s) => s === "hero" || s === "heroine" },
  { key: "creature", glyph: "🐍", cat: "romance", href: "/a-z?kind=creature", match: (k) => k === "creature" },
  { key: "group", glyph: "🎭", cat: "alliance", href: "/a-z?kind=group", match: (k) => k === "group" },
  { key: "place", glyph: "🏛️", cat: "family", href: "/a-z?kind=place", match: (k) => k === "place" },
  { key: "event", glyph: "🔥", cat: "conflict", href: "/a-z?kind=event", match: (k) => k === "event" },
  { key: "artifact", glyph: "🏺", cat: "association", href: "/a-z?kind=artifact", match: (k) => k === "artifact" },
  { key: "story", glyph: "📜", cat: "romance", href: "/a-z?kind=story", match: (k) => k === "story" },
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
  const articles = articleSlugs.map((s) => entities.get(s)).filter((e) => !!e).sort((a, b) => a.name.localeCompare(b.name, locale));

  const constellation = ["zeus", "athena", "apollo", "artemis", "hera", "poseidon", "hades", "heracles", "achilles", "odysseus", "medusa", "perseus", "gaia", "nyx", "cronus", "helen", "orpheus", "theseus", "prometheus", "aphrodite", "hermes", "dionysus"]
    .map((s) => entities.get(s)?.name)
    .filter((n): n is string => !!n);
  const stats = [
    { value: all.length, label: t.home.stats.entries },
    { value: edges.length, label: t.home.stats.relationships },
    { value: Object.keys(traditions).length, label: t.home.stats.traditions },
    { value: Object.keys(sources).length, label: t.home.stats.sources },
  ];
  const s = t.search.shortcuts;
  const tools: { href: string; icon: IconName; cat: Cat; name: string; hint: string }[] = [
    { href: "/graph", icon: "graph", cat: "alliance", ...s.graph },
    { href: "/tree/zeus", icon: "tree", cat: "family", ...s.tree },
    { href: "/kinship", icon: "kinship", cat: "romance", ...s.kinship },
    { href: "/traditions", icon: "traditions", cat: "association", ...s.traditions },
    { href: "/sources", icon: "sources", cat: "conflict", ...s.sources },
  ];
  const rail = { prev: t.shell.prev, next: t.shell.next };

  return (
    <PageTransition>
      {/* greeting + search, over a faint constellation */}
      <section className="relative isolate -mx-5 -mt-8 overflow-hidden px-5 pb-10 pt-10 text-center sm:-mx-8 sm:-mt-10 sm:px-8 sm:pb-14 sm:pt-16">
        <HeroConstellation names={constellation} />
        <div className="relative">
          <Greeting t={t.home.greeting} className="label kicker text-[0.9rem]" />
          <h1 className="display mx-auto mt-3 max-w-3xl">{t.home.headline}</h1>
          <p className="lede mx-auto mt-4">{t.home.lede}</p>
          <PaletteButton className="mx-auto mt-8 flex h-14 w-full max-w-2xl items-center gap-3 rounded-full border border-line bg-card pl-5 pr-3 text-left text-muted shadow-[var(--shadow)] transition-colors hover:border-[var(--line-strong)] hover:text-ink">
            <Icon name="search" className="size-5 shrink-0" />
            <span className="flex-1 truncate">{t.search.placeholder}</span>
            <kbd className="rounded-md border border-line bg-surface px-2 py-1 text-xs pointer-coarse:hidden">⌘K</kbd>
          </PaletteButton>
        </div>
      </section>

      {/* subjects, as Magnific-style icon tiles */}
      <nav aria-label={t.home.browseTitle}>
        <Stagger as="ul" className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0 xl:grid-cols-10">
          {SECTIONS.map((sec) => (
            <StaggerItem as="li" key={sec.key} className={`cat-${sec.cat}`}>
              <Link href={sec.href} transitionTypes={["nav-forward"]} title={t.home.sections[sec.key].blurb}
                className="group flex h-full w-[5.75rem] flex-col items-center gap-2 rounded-[var(--r-card)] px-1.5 py-2.5 text-center transition-colors hover:bg-hover sm:w-auto">
                <span className="glyph-tile size-12 text-[1.45rem] transition-transform duration-300 ease-expo group-hover:-translate-y-0.5" aria-hidden>{sec.glyph}</span>
                <span className="text-[0.8rem] font-medium leading-tight">{t.home.sections[sec.key].title}</span>
                <span className="text-[0.72rem] text-muted">{all.filter((e) => sec.match(e.kind, e.subtype)).length}</span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </nav>

      {/* widgets */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.85fr)]">
        {featured && (
          <Reveal as="section" className="card flex flex-col p-5 sm:p-6">
            <WidgetHead title={t.home.featured} />
            <div className="mt-4 flex items-start gap-4">
              <span className="glyph-tile size-16 text-[2rem]" aria-hidden>{featured.emoji ?? "❖"}</span>
              <div className="min-w-0">
                <ViewTransition name={`entity-${featured.slug}`} share="morph" default="none">
                  <h2 className="inline-block font-serif text-[1.75rem] font-semibold leading-tight">{featured.name}</h2>
                </ViewTransition>
                {featured.epithet && <p className="mt-0.5 font-serif italic text-muted">{featured.epithet}</p>}
              </div>
            </div>
            {featured.summary && <p className="mt-4 line-clamp-4 font-serif text-[1.02rem] leading-relaxed"><RichText text={featured.summary} entities={entities} /></p>}
            <p className="mt-auto pt-5"><Link href={`/wiki/${featured.slug}`} transitionTypes={["nav-forward"]} className="btn btn-ink">{t.home.readEntry} <Icon name="arrowRight" className="size-4" /></Link></p>
          </Reveal>
        )}

        <Reveal as="section" delay={0.05} className="card p-5 sm:p-6">
          <WidgetHead title={t.home.toolsTitle} />
          <ul className="-mx-2 mt-3">
            {tools.map((tool) => (
              <li key={tool.href} className={`cat-${tool.cat}`}>
                <Link href={tool.href} transitionTypes={["nav-forward"]} className="group flex items-center gap-3 rounded-[var(--r-ctl)] px-2 py-2 transition-colors hover:bg-hover">
                  <span className="glyph-tile size-9"><Icon name={tool.icon} className="size-[18px]" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.92rem] font-medium">{tool.name}</span>
                    <span className="block truncate text-[0.8rem] text-muted">{tool.hint}</span>
                  </span>
                  <Icon name="chevronRight" className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal as="section" delay={0.1} className="card p-5 sm:p-6 lg:col-span-2 xl:col-span-1">
          <WidgetHead title={t.home.statsTitle} />
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
            {stats.map((st) => (
              <li key={st.label} className="tile px-4 py-3.5">
                <CountUp value={st.value} locale={locale} className="block text-2xl font-semibold tracking-tight" />
                <span className="mt-0.5 block text-[0.78rem] leading-snug text-muted">{st.label}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* tabbed rails */}
      {(contested.length > 0 || articles.length > 0) && (
        <Reveal as="section" className="mt-12">
          <Tabs
            label={t.home.browseTitle}
            tabs={[...(contested.length ? [t.home.contestedTitle] : []), ...(articles.length ? [t.home.articlesTitle] : [])]}
            panels={[
              ...(contested.length ? [
                <Rail key="contested" {...rail}>
                  {contested.slice(0, 16).map(({ e, versions }) => (
                    <MediaCard key={e.slug} entity={e} href={`/wiki/${e.slug}#genealogy`} cat="conflict">
                      <span className="mt-2 flex items-center gap-1" aria-hidden>{versions.map((v) => <span key={v.key} className="h-1 flex-1 rounded-full bg-brand/60" />)}</span>
                      <span className="mt-1.5 block text-xs text-muted">{t.home.rivalAccounts(versions.length)}</span>
                    </MediaCard>
                  ))}
                </Rail>,
              ] : []),
              ...(articles.length ? [
                <Rail key="articles" {...rail}>
                  {articles.map((e, i) => <MediaCard key={e.slug} entity={e} href={`/wiki/${e.slug}`} cat={(["alliance", "family", "association", "romance", "conflict"] as const)[i % 5]} />)}
                </Rail>,
              ] : []),
            ]}
          />
        </Reveal>
      )}
    </PageTransition>
  );
}

function WidgetHead({ title }: { title: string }) {
  return <h2 className="text-[0.95rem] font-semibold">{title}</h2>;
}

/** Magnific's "What's new" card: tinted artwork with the glyph, title underneath. */
function MediaCard({ entity, href, cat, children }: { entity: EntityLite; href: string; cat: Cat; children?: React.ReactNode }) {
  return (
    <Link href={href} transitionTypes={["nav-forward"]} className={`group block w-[13.5rem] cat-${cat}`}>
      <span className="media-tint relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[var(--r-card)] border border-line">
        <span className="text-[3.25rem] transition-transform duration-500 ease-expo group-hover:scale-110" aria-hidden>{entity.emoji ?? "❖"}</span>
      </span>
      <span className="mt-2.5 block truncate font-serif text-[1.05rem] font-semibold transition-colors group-hover:text-brand">{entity.name}</span>
      {entity.epithet && <span className="block truncate text-[0.82rem] text-muted">{entity.epithet}</span>}
      {children}
    </Link>
  );
}
