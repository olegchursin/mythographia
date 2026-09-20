import type { Metadata } from "next";
import { EntityEntry } from "@/components/Entity";
import { PageTransition, SwapTransition } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { ChipLink } from "@/components/NavLink";
import { getEntities } from "@/lib/queries";

export const metadata: Metadata = { title: "Index" };

const KINDS = [
  { key: "all", label: "Everything" },
  { key: "character", label: "Gods and mortals" },
  { key: "creature", label: "Monsters and creatures" },
  { key: "group", label: "Groups" },
  { key: "place", label: "Places" },
  { key: "event", label: "Events" },
  { key: "artifact", label: "Artifacts" },
  { key: "story", label: "Texts" },
];

const initial = (name: string) => name.replace(/^The /, "").normalize("NFD")[0].toUpperCase();

export default async function IndexPage({ searchParams }: PageProps<"/a-z">) {
  const params = await searchParams;
  const kind = typeof params.kind === "string" ? params.kind : "all";
  const subtype = typeof params.subtype === "string" ? params.subtype : null;
  const all = [...(await getEntities()).values()];

  const ofKind = all.filter((e) => kind === "all" || e.kind === kind);
  const subtypes = [...Map.groupBy(ofKind, (e) => e.subtype).entries()].sort((a, b) => b[1].length - a[1].length);
  const shown = ofKind.filter((e) => !subtype || e.subtype === subtype).sort((a, b) => initial(a.name).localeCompare(initial(b.name)) || a.name.localeCompare(b.name));
  const letters = [...Map.groupBy(shown, (e) => initial(e.name)).entries()];

  return (
    <PageTransition>
      <p className="label kicker">The encyclopedia</p>
      <h1 className="display mt-4">Index</h1>
      <p className="lede mt-3">{shown.length} {shown.length === 1 ? "entry" : "entries"}{subtype ? ` of type “${subtype}”` : ""}.</p>

      <nav className="mt-9 flex flex-wrap gap-2" aria-label="Filter by kind">
        {KINDS.map((k) => <ChipLink key={k.key} href={k.key === "all" ? "/a-z" : `/a-z?kind=${k.key}`} active={k.key === kind}>{k.label}</ChipLink>)}
      </nav>
      {kind !== "all" && subtypes.length > 1 && (
        <nav className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3" aria-label="Filter by type">
          <ChipLink href={`/a-z?kind=${kind}`} active={!subtype}>All</ChipLink>
          {subtypes.map(([s, list]) => (
            <ChipLink key={s} href={`/a-z?kind=${kind}&subtype=${encodeURIComponent(s)}`} active={subtype === s} className="capitalize">
              {s} <span className="text-xs opacity-60">{list.length}</span>
            </ChipLink>
          ))}
        </nav>
      )}

      <SwapTransition key={`${kind}:${subtype}`} className="mt-10 grid gap-8 lg:grid-cols-[3rem_minmax(0,1fr)]">
        <nav className="flex gap-1 overflow-x-auto font-display text-base lg:sticky lg:top-28 lg:max-h-[calc(100svh-9rem)] lg:flex-col lg:self-start lg:overflow-y-auto" aria-label="Jump to letter">
          {letters.map(([l]) => <a key={l} href={`#${l}`} className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-gold/10 hover:text-gold">{l}</a>)}
        </nav>

        <div className="space-y-14">
          {letters.map(([letter, list]) => (
            <Reveal as="section" key={letter} className="grid gap-x-8 sm:grid-cols-[5rem_minmax(0,1fr)]">
              <h2 id={letter} className="font-display text-6xl font-bold leading-none text-gilded sm:sticky sm:top-28 sm:self-start">{letter}</h2>
              <ul className="mt-4 gap-10 border-t border-line pt-4 sm:mt-0 md:columns-2">{list.map((e) => <EntityEntry key={e.slug} entity={e} />)}</ul>
            </Reveal>
          ))}
        </div>
      </SwapTransition>
    </PageTransition>
  );
}
