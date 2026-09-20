import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/motion/PageTransition";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { getGraph } from "@/lib/queries";

export const metadata: Metadata = { title: "Traditions" };

export default async function TraditionsPage() {
  const { edges, traditions } = await getGraph();
  const count = (key: string) => edges.filter((e) => e.tradition === key).length;
  const ranked = Object.values(traditions).sort((a, b) => count(b.key) - count(a.key));
  const max = Math.max(1, ...ranked.map((t) => count(t.key)));
  return (
    <PageTransition>
      <p className="label kicker">Reference</p>
      <h1 className="display mt-4">Tradi<span className="text-gilded">tions</span></h1>
      <p className="lede mt-4">
        There was never one authorised version of Greek myth. Poets, dramatists and handbook-writers each told the stories their own way, and this
        encyclopedia files every relationship under the tradition that attests it.
      </p>
      <Stagger as="ul" className="mt-12 grid gap-4 md:grid-cols-2">
        {ranked.map((t) => (
          <StaggerItem as="li" key={t.key}>
            <Link href={`/traditions/${t.key}`} transitionTypes={["nav-forward"]} className="group block h-full rounded-[var(--r-card)]">
              <SpotlightCard tilt={3} className="flex h-full flex-col p-7">
                <p className="label">{t.period}</p>
                <h2 className="mt-2 text-2xl font-semibold transition-colors group-hover:text-gold">{t.name}</h2>
                <p className="mt-2 text-[0.97rem] text-muted">{t.description}</p>
                <div className="mt-auto pt-6">
                  <div className="h-1 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-gradient-to-r from-gold to-terracotta" style={{ width: `${(count(t.key) / max) * 100}%` }} /></div>
                  <p className="mt-2 font-sans text-xs text-muted">{count(t.key)} recorded claims</p>
                </div>
              </SpotlightCard>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </PageTransition>
  );
}
