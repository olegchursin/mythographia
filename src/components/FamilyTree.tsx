import Link from "next/link";
import { CenterScroll } from "./CenterScroll";
import type { FamilyTree as Tree } from "@/lib/graph";
import type { EntityLite } from "@/lib/queries";

const W = 132;
const H = 42;
const GAP = 14;
const ROW = 104;
const PAD = 16;

const GEN_LABEL: Record<string, string> = { "-3": "Great-grandparents", "-2": "Grandparents", "-1": "Parents", "1": "Children", "2": "Grandchildren" };

/** Static SVG genealogy: generations as rows, the subject highlighted, every box a link that re-roots the tree. */
export function FamilyTree({ tree, entities, hrefFor }: { tree: Tree; entities: Map<string, EntityLite>; hrefFor: (slug: string) => string }) {
  const gens = [...new Set(tree.nodes.map((n) => n.gen))].sort((a, b) => a - b);
  const widest = Math.max(...gens.map((g) => tree.nodes.filter((n) => n.gen === g).length));
  const width = widest * (W + GAP) - GAP + PAD * 2 + 150;
  const height = gens.length * ROW - (ROW - H) + PAD * 2;
  const minGen = gens[0];

  const pos = new Map<string, { x: number; y: number }>();
  for (const g of gens) {
    const row = tree.nodes.filter((n) => n.gen === g);
    const rowWidth = row.length * (W + GAP) - GAP;
    const left = (width - 150 - rowWidth) / 2 + 150;
    for (const n of row) pos.set(n.slug, { x: left + n.index * (W + GAP), y: PAD + (g - minGen) * ROW });
  }

  return (
    <CenterScroll className="stage overflow-x-auto p-3">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Family tree" className="mx-auto block font-sans">
        {gens.map((g) => (
          <text key={g} x={PAD} y={PAD + (g - minGen) * ROW + H / 2 + 4} fontSize={11} fill="var(--muted)" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {g === 0 ? "" : (GEN_LABEL[String(g)] ?? `Generation ${g > 0 ? "+" : ""}${g}`)}
            {tree.hidden[g] ? ` (+${tree.hidden[g]} more)` : ""}
          </text>
        ))}

        {tree.links.map((l, i) => {
          const p = pos.get(l.parent);
          const c = pos.get(l.child);
          if (!p || !c) return null;
          const x1 = p.x + W / 2, y1 = p.y + H, x2 = c.x + W / 2, y2 = c.y;
          const my = (y1 + y2) / 2;
          return <path key={l.parent + l.child} d={`M${x1} ${y1} C${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`} fill="none" stroke={l.contested ? "var(--muted)" : "var(--gold)"} strokeOpacity={l.contested ? 0.5 : 0.45} strokeWidth={1.3} {...(l.contested ? { strokeDasharray: "5 4" } : { pathLength: 1, className: "draw", style: { "--i": i } as React.CSSProperties })} />;
        })}

        {tree.nodes.map((n, i) => {
          const p = pos.get(n.slug)!;
          const e = entities.get(n.slug);
          const name = e?.name ?? n.slug;
          const focus = n.gen === 0;
          return (
            <Link key={n.slug} href={hrefFor(n.slug)} scroll={false} className="tree-node pop" style={{ "--i": i } as React.CSSProperties}>
              <title>{e?.epithet ? `${name} — ${e.epithet}` : name}</title>
              <rect x={p.x} y={p.y} width={W} height={H} rx={H / 2} fill={focus ? "var(--gold)" : "var(--surface-2)"} stroke={focus ? "var(--gold)" : "var(--line)"} strokeWidth={1.2} />
              <text x={p.x + W / 2} y={p.y + H / 2 + 5} textAnchor="middle" fontSize={14} fontWeight={focus ? 700 : 500} fill={focus ? "#171208" : "var(--ink)"} style={{ fontFamily: "var(--font-source-serif), serif" }}>
                {name.length > 17 ? name.slice(0, 16) + "…" : name}
              </text>
            </Link>
          );
        })}
      </svg>
    </CenterScroll>
  );
}
