import type { Metadata } from "next";
import { EntityEntry } from "@/components/Entity";
import { PageTransition, SwapTransition } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { ChipLink } from "@/components/NavLink";
import { toLocale } from "@/i18n/config";
import { getDictionary, getI18n } from "@/i18n/server";
import { getEntities } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/[lang]/a-z">): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(toLocale(lang)).aToZ.title };
}

const KINDS = ["all", "character", "creature", "group", "place", "event", "artifact", "story"] as const;

// "The Fates" files under F and «Теогония» under Т.
const initial = (name: string) => name.replace(/^The /, "").replace(/^[^\p{L}\p{N}]+/u, "").normalize("NFD")[0].toUpperCase();

export default async function IndexPage({ searchParams }: PageProps<"/[lang]/a-z">) {
  const { locale, t } = await getI18n();
  const params = await searchParams;
  const kind = typeof params.kind === "string" ? params.kind : "all";
  const subtype = typeof params.subtype === "string" ? params.subtype : null;
  const all = [...(await getEntities(locale)).values()];

  const ofKind = all.filter((e) => kind === "all" || e.kind === kind);
  const subtypes = [...Map.groupBy(ofKind, (e) => e.subtype).entries()].sort((a, b) => b[1].length - a[1].length);
  const shown = ofKind.filter((e) => !subtype || e.subtype === subtype).sort((a, b) => initial(a.name).localeCompare(initial(b.name), locale) || a.name.localeCompare(b.name, locale));
  const letters = [...Map.groupBy(shown, (e) => initial(e.name)).entries()];

  return (
    <PageTransition>
      <header>
        <h1 className="display">{t.aToZ.title}</h1>
        <p className="lede mt-2">{t.aToZ.count(shown.length)}{subtype ? t.aToZ.ofType(t.subtype[subtype] ?? subtype) : ""}.</p>
      </header>

      {/* Magnific-style filter bar: sticks under the top bar */}
      <div className="sticky top-[calc(3.5rem+1px+var(--safe-t))] z-30 -mx-5 mt-6 space-y-2 border-b border-line bg-[color-mix(in_srgb,var(--paper)_92%,transparent)] px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <nav className="-mx-5 flex gap-1.5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" aria-label={t.aToZ.filterKind}>
          {KINDS.map((k) => <ChipLink key={k} href={k === "all" ? "/a-z" : `/a-z?kind=${k}`} active={k === kind}>{t.aToZ.kinds[k]}</ChipLink>)}
        </nav>
        {kind !== "all" && subtypes.length > 1 && (
          <nav className="-mx-5 flex gap-1.5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" aria-label={t.aToZ.filterType}>
            <ChipLink href={`/a-z?kind=${kind}`} active={!subtype}>{t.aToZ.all}</ChipLink>
            {subtypes.map(([s, list]) => (
              <ChipLink key={s} href={`/a-z?kind=${kind}&subtype=${encodeURIComponent(s)}`} active={subtype === s} className="capitalize">
                {t.subtype[s] ?? s} <span className="text-xs opacity-60">{list.length}</span>
              </ChipLink>
            ))}
          </nav>
        )}
        <nav className="-mx-5 flex gap-0.5 overflow-x-auto px-5 font-serif text-[0.95rem] [scrollbar-width:none] sm:mx-0 sm:px-0" aria-label={t.aToZ.jump}>
          {letters.map(([l]) => <a key={l} href={`#${l}`} className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-ink">{l}</a>)}
        </nav>
      </div>

      <SwapTransition key={`${kind}:${subtype}`} className="mt-8 space-y-10">
        {letters.map(([letter, list]) => (
          <Reveal as="section" key={letter}>
            <h2 id={letter} className="mb-2 scroll-mt-[calc(var(--safe-t)+11rem)] font-serif text-3xl font-semibold">{letter}</h2>
            <ul className="grid gap-x-3 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3">{list.map((e) => <EntityEntry key={e.slug} entity={e} />)}</ul>
          </Reveal>
        ))}
      </SwapTransition>
    </PageTransition>
  );
}
