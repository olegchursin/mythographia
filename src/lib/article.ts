// A deliberately tiny article dialect: paragraphs, "## Headings", [[slug]] / [[slug|label]] links, *italic*.

export type Inline = { type: "text"; text: string } | { type: "em"; children: Inline[] } | { type: "link"; slug: string; label: string | null };

export type Block = { type: "heading"; id: string; text: string } | { type: "paragraph"; inlines: Inline[] };

// Unicode-aware so Cyrillic headings get usable anchors too.
export const slugify = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  // an italic run may itself contain links: *[[iliad|Iliad]]*
  const re = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]|\*((?:\[\[[^\]]*\]\]|[^*\n])+)\*/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({ type: "text", text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ type: "link", slug: m[1].trim(), label: m[2]?.trim() || null });
    else out.push({ type: "em", children: parseInline(m[3]) });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out;
}

export function parseArticle(body: string): Block[] {
  return body
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk): Block => {
      const heading = chunk.match(/^##\s+(.+)$/);
      return heading ? { type: "heading", id: slugify(heading[1]), text: heading[1] } : { type: "paragraph", inlines: parseInline(chunk.replace(/\s*\n\s*/g, " ")) };
    });
}

type NameOf = (slug: string) => string | undefined;

const inlineText = (nodes: Inline[], nameOf?: NameOf): string =>
  nodes.map((i) => (i.type === "link" ? (i.label ?? nameOf?.(i.slug) ?? i.slug.replace(/-/g, " ")) : i.type === "em" ? inlineText(i.children, nameOf) : i.text)).join("");

/** Plain text of a summary/article fragment, for meta descriptions and previews. */
export const plainText = (text: string, nameOf?: NameOf) => inlineText(parseInline(text), nameOf);
