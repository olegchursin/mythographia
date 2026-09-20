# Mythographia

**An encyclopedia of Greek myth**, built on a sourced relationship graph. Every god, hero, monster,
place, event, artifact and text is an *entry*; every connection between them is a typed edge that
records its tradition and citation. Greek myth has no canon, so when the ancients disagree
(Aphrodite's parents, who killed Agamemnon, whether Atalanta sailed on the Argo) every version is
kept side by side.

- **Entries** (`/wiki/zeus`) — lead summary, long-form article, infobox, genealogy by tradition, relations with citations, chronology, ancient sources, see-also
- **Index** (`/a-z`) — A–Z with kind and type filters; ⌘K search over names and aliases (try "Jupiter")
- **Family trees** (`/tree/achilles?t=homeric`) — three generations up, two down, switchable by tradition
- **Relations diagram** (`/graph?focus=achilles`) — kin, consorts, conflicts and allies around one figure
- **Kinship finder** (`/kinship?from=perseus&to=heracles`) — kinship term, lines of descent, shortest connection
- **Traditions** and **Ancient sources** — every claim grouped by who made it, and where a tradition differs from the rest

Stack: Next.js 16 (App Router, server components, statically prerendered), Tailwind 4, Motion, Bun. No database: the content is read-only, so the typed modules in `data/` are the data layer.

## Run it

Needs Node 20+ and [Bun](https://bun.sh). No services, no env vars.

```bash
bun install
bun dev
```

## Editing the content

The dataset lives in `data/` as plain TypeScript (≈400 entries, ≈1,300 relationships, ≈80 long articles):

| File | What |
| --- | --- |
| `data/entities/*.ts` | every entry: name, type, epithet, aliases, domains, `summary` |
| `data/articles/*.ts` | long-form article bodies keyed by slug |
| `data/relationships/family.ts` | parentage, with rival traditions |
| `data/relationships/relations.ts` | marriages and loves, conflicts, alliances |
| `data/relationships/world.ts` | memberships, events, places, artifacts, texts |
| `data/timelines.ts` | chronologies shown on entries |
| `data/meta.ts` | relationship types, traditions, ancient sources |

Article bodies use a tiny dialect: paragraphs separated by blank lines, `## Headings`,
`[[slug]]` / `[[slug|label]]` links and `*italic*`. Summaries and relationship notes accept the same links.

```bash
bun run validate   # check data/ for broken slugs, links, traditions and sources
bun run test       # data integrity + graph/tree/parser tests (vitest — plain `bun test` would use Bun's own runner)
```

The validator rejects unknown slugs (including inside `[[links]]`), missing summaries, duplicate or
orphaned entries, and unknown traditions or sources.

To record a rival account, add another edge with a different `t` (tradition), `s` (source) and
`cert: "variant"`. `relationships` is deliberately not unique on (source, target, type).

## Layout

- `src/lib/graph.ts` — pure graph code: perspective labels, shortest paths, kinship, family trees, radial layout
- `src/lib/article.ts` — article dialect parser · `src/lib/profile.ts` — infobox and genealogy derivations · `src/lib/queries.ts` — shapes `data/` into the rows the pages read
- `src/app/` — routes · `src/components/` — ArticleBody, Infobox, FamilyTree, EgoGraph, PathChain, ClaimsTable, CommandSearch

To deploy: `bun run build` on any Next.js host. Entries, traditions and sources are prerendered; the index, diagram, tree and kinship tools render on demand from memory.
