import { parseInline, type Block, type Inline } from "@/lib/article";
import type { EntityLite } from "@/lib/queries";
import { EntityLink } from "./Entity";

type Entities = Map<string, EntityLite>;

export function Inlines({ inlines, entities }: { inlines: Inline[]; entities: Entities }) {
  return (
    <>
      {inlines.map((n, i) =>
        n.type === "text" ? n.text : n.type === "em" ? <em key={i}><Inlines inlines={n.children} entities={entities} /></em> : (
          <EntityLink key={i} entity={entities.get(n.slug)} slug={n.slug}>{n.label ?? entities.get(n.slug)?.name ?? n.slug}</EntityLink>
        ),
      )}
    </>
  );
}

/** One-liner for summaries and notes that may contain [[links]]. */
export function RichText({ text, entities }: { text: string; entities: Entities }) {
  return <Inlines inlines={parseInline(text)} entities={entities} />;
}

export function ArticleBody({ blocks, entities }: { blocks: Block[]; entities: Entities }) {
  return (
    <div className="prose-myth">
      {blocks.map((b, i) =>
        b.type === "heading" ? <h2 key={i} id={b.id}>{b.text}</h2> : <p key={i}><Inlines inlines={b.inlines} entities={entities} /></p>,
      )}
    </div>
  );
}
