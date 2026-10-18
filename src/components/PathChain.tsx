import type { PathStep } from "@/lib/graph";
import { getI18n } from "@/i18n/server";
import type { EntityLite, Tradition } from "@/lib/queries";
import { RichText } from "./ArticleBody";
import { EntityLink } from "./Entity";
import { Stagger, StaggerItem } from "./motion/Reveal";

interface Props {
  start: string;
  steps: PathStep[];
  entities: Map<string, EntityLite>;
  traditions: Record<string, Tradition>;
}

/** A vertical chain: Zeus — parent of → Aeacus — parent of → Peleus … with the citation for every link. */
export async function PathChain({ start, steps, entities, traditions }: Props) {
  const { t: dict } = await getI18n();
  return (
    <Stagger as="ol">
      <StaggerItem as="li"><Name slug={start} entities={entities} /></StaggerItem>
      {steps.map((s, i) => {
        const t = s.edge.tradition ? traditions[s.edge.tradition] : null;
        return (
          <StaggerItem as="li" key={i} className={`cat-${s.category}`}>
            <div className="relative my-1 ml-[1.35rem] border-l border-dashed border-(--cat) py-3 pl-7 text-[0.95rem]">
              <span className="absolute -left-[4.5px] top-1/2 size-2 -translate-y-1/2 rounded-full bg-(--cat) shadow-[0_0_12px_var(--cat)]" aria-hidden />
              <span className="italic text-(--cat)">{s.label}</span>
              {s.edge.certainty !== "canonical" && <span className="ml-2 font-sans text-xs text-gold">({dict.certainty[s.edge.certainty]})</span>}
              {(s.edge.citation || t) && <span className="ml-2 font-sans text-xs text-muted">{[s.edge.citation, t?.name].filter(Boolean).join(" · ")}</span>}
              {s.edge.notes && <span className="block text-sm text-muted"><RichText text={s.edge.notes} entities={entities} /></span>}
            </div>
            <Name slug={s.to} entities={entities} />
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

function Name({ slug, entities }: { slug: string; entities: Map<string, EntityLite> }) {
  const e = entities.get(slug);
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-glass text-lg" aria-hidden>{e?.emoji ?? "·"}</span>
      <div className="leading-tight">
        <EntityLink entity={e} slug={slug} className="text-lg font-semibold" />
        {e?.epithet && <span className="block text-sm text-muted">{e.epithet}</span>}
      </div>
    </div>
  );
}
