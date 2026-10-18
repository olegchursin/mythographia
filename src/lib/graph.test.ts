import { describe, expect, it } from "vitest";
import { relationships, relationshipTypes } from "../../data";
import { overlays } from "../../data/i18n";
import { validateOverlay, validateSeed } from "../../data/validate";
import { parseArticle, parseInline, plainText, slugify } from "./article";
import { connectionsOf, egoLayout, familyTree, kinshipTerm, kinships, lineage, shortestPath, siblingsOf, type Edge, type RelTypes } from "./graph";

const edges: Edge[] = relationships.map((r, i) => ({
  id: i,
  source: r.from,
  target: r.to,
  type: r.type,
  tradition: r.t ?? null,
  sourceRef: r.s ?? null,
  citation: r.cite ?? null,
  certainty: r.cert ?? "canonical",
  notes: r.note ?? null,
}));
const types: RelTypes = Object.fromEntries(
  relationshipTypes.map((t) => [t.key, { key: t.key, label: t.label, inverse_label: t.inverse, category: t.category, is_symmetric: !!t.symmetric, emoji: t.emoji }]),
);

describe("seed data", () => {
  it("has no dangling references, duplicates or orphans", () => {
    expect(validateSeed()).toEqual([]);
  });

  it("keeps rival traditions side by side", () => {
    const parents = edges.filter((e) => e.type === "parent" && e.target === "aphrodite");
    expect(parents.map((e) => e.source).sort()).toEqual(["dione", "uranus", "zeus"]);
    expect(new Set(parents.map((e) => e.tradition))).toEqual(new Set(["hesiodic", "homeric"]));
  });
});

describe("graph", () => {
  it("traces Achilles back to Zeus through the male line", () => {
    const path = shortestPath("zeus", "achilles", edges, types, { categories: ["family"] })!;
    expect([path[0].from, ...path.map((s) => s.to)]).toEqual(["zeus", "aeacus", "peleus", "achilles"]);
    expect(path.every((s) => s.label === "parent of")).toBe(true);
  });

  it("knows Perseus is both Heracles's ancestor and his half-brother", () => {
    expect(kinships("perseus", "heracles", edges)).toEqual([
      { slug: "perseus", depthA: 0, depthB: 2 },
      { slug: "zeus", depthA: 1, depthB: 1 },
    ]);
  });

  it("walks a lineage downward", () => {
    expect(lineage("zeus", "achilles", edges, types).map((s) => s.to)).toEqual(["aeacus", "peleus", "achilles"]);
    expect(kinships("achilles", "zeus", edges)).toEqual([{ slug: "zeus", depthA: 3, depthB: 0 }]);
  });

  it("labels edges from the viewer's side", () => {
    const hector = connectionsOf("hector", edges, types);
    expect(hector.find((c) => c.other === "achilles" && c.edge.type === "killed")?.label).toBe("killed by");
    expect(hector.find((c) => c.other === "patroclus")?.label).toBe("killed");
  });

  it("derives siblings from shared parents", () => {
    expect([...siblingsOf("zeus", edges).keys()].sort()).toEqual(["chiron", "demeter", "hades", "hera", "hestia", "poseidon"]);
  });

  it("returns null when no path exists under a filter", () => {
    expect(shortestPath("chaos", "trojan-horse", edges, types, { categories: ["romance"] })).toBeNull();
  });

  it("names kinship", () => {
    expect(kinshipTerm(1, 1)).toMatch(/siblings/);
    expect(kinshipTerm(3, 0)).toBe("great-grandchild / descendant");
    expect(kinshipTerm(2, 2)).toBe("first cousins");
    expect(kinshipTerm(2, 3)).toBe("first cousins once removed");
  });

  it("names kinship in Russian", () => {
    expect(kinshipTerm(0, 1, "ru")).toBe("родитель / предок");
    expect(kinshipTerm(3, 0, "ru")).toBe("правнук или правнучка / потомок");
    expect(kinshipTerm(1, 1, "ru")).toMatch(/братья или сёстры/);
    expect(kinshipTerm(1, 2, "ru")).toBe("дядя или тётя и племянник или племянница");
    expect(kinshipTerm(2, 2, "ru")).toBe("двоюродные братья или сёстры");
    expect(kinshipTerm(3, 3, "ru")).toBe("троюродные братья или сёстры");
    expect(kinshipTerm(2, 3, "ru")).toBe("двоюродные братья или сёстры (с разницей в 1 поколение)");
  });

  it("lays out crowded ego graphs without overlap", () => {
    const slugs = Array.from({ length: 120 }, (_, i) => `n${i}`);
    const placed = egoLayout([{ category: "family", slugs: slugs.slice(0, 90) }, { category: "conflict", slugs: slugs.slice(90) }]);
    expect(placed).toHaveLength(120);
    let min = Infinity;
    for (let i = 0; i < placed.length; i++)
      for (let j = i + 1; j < placed.length; j++) min = Math.min(min, Math.hypot(placed[i].x - placed[j].x, placed[i].y - placed[j].y));
    expect(min).toBeGreaterThan(0.12);
  });
});

describe("family tree", () => {
  it("puts ancestors above and descendants below the subject", () => {
    const tree = familyTree("achilles", edges);
    const gen = (slug: string) => tree.nodes.find((n) => n.slug === slug)?.gen;
    expect(gen("achilles")).toBe(0);
    expect(gen("peleus")).toBe(-1);
    expect(gen("thetis")).toBe(-1);
    expect(gen("aeacus")).toBe(-2);
    expect(gen("zeus")).toBe(-3);
    expect(gen("neoptolemus")).toBe(1);
    expect(tree.links).toContainEqual({ parent: "peleus", child: "achilles", contested: false });
  });

  it("switches parents with the tradition", () => {
    const parents = (t: string | null) => familyTree("aphrodite", edges, { tradition: t }).links.filter((l) => l.child === "aphrodite").map((l) => l.parent).sort();
    expect(parents(null)).toEqual(["uranus"]);
    expect(parents("hesiodic")).toEqual(["uranus"]);
    expect(parents("homeric")).toEqual(["dione", "zeus"]);
  });

  it("never orphans a figure whose parentage is only attested as a variant", () => {
    expect(familyTree("hephaestus", edges).links.some((l) => l.child === "hephaestus" && l.contested)).toBe(true);
  });

  it("caps crowded generations and reports what it hid", () => {
    const tree = familyTree("zeus", edges, { maxPerRow: 10 });
    expect(tree.nodes.filter((n) => n.gen === 1)).toHaveLength(10);
    expect(tree.hidden[1]).toBeGreaterThan(20);
  });
});

describe("translations", () => {
  it("cover every entry, article, relationship string and timeline", () => {
    for (const [locale, o] of Object.entries(overlays)) expect(o ? validateOverlay(locale, o) : []).toEqual([]);
  });
});

describe("article dialect", () => {
  it("gives Cyrillic headings anchors", () => {
    expect(slugify("Культ и иконография")).toBe("культ-и-иконография");
  });

  it("parses headings, links and emphasis", () => {
    const blocks = parseArticle("Son of [[zeus]] in the *Iliad*.\n\n## At Troy\n\nHe fought [[hector|the Trojan prince]].");
    expect(blocks.map((b) => b.type)).toEqual(["paragraph", "heading", "paragraph"]);
    expect(blocks[1]).toEqual({ type: "heading", id: "at-troy", text: "At Troy" });
    expect(blocks[0].type === "paragraph" && blocks[0].inlines).toEqual([
      { type: "text", text: "Son of " },
      { type: "link", slug: "zeus", label: null },
      { type: "text", text: " in the " },
      { type: "em", children: [{ type: "text", text: "Iliad" }] },
      { type: "text", text: "." },
    ]);
    expect(parseInline("the *[[iliad|Iliad]]*")[1]).toEqual({ type: "em", children: [{ type: "link", slug: "iliad", label: "Iliad" }] });
    expect(plainText("Slain by [[achilles|Achilles son of Peleus]].")).toBe("Slain by Achilles son of Peleus.");
  });
});
