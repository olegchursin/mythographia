import type { Metadata } from "next";
import Link from "@/components/Link";
import { PageTransition } from "@/components/motion/PageTransition";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { toLocale } from "@/i18n/config";
import { getDictionary, getI18n } from "@/i18n/server";
import { getGraph } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return { title: getDictionary(toLocale((await params).lang)).traditions.title };
}

export default async function TraditionsPage() {
  const { locale, t: dict } = await getI18n();
  const { edges, traditions } = await getGraph(locale);
  const count = (key: string) => edges.filter((e) => e.tradition === key).length;
  const ranked = Object.values(traditions).sort((a, b) => count(b.key) - count(a.key));
  const max = Math.max(1, ...ranked.map((t) => count(t.key)));
  return (
    <PageTransition>
      <p className="label kicker">{dict.traditions.kicker}</p>
      <h1 className="display mt-4">{dict.traditions.titleStart}<span className="text-gilded">{dict.traditions.titleGild}</span></h1>
      <p className="lede mt-4">
        {dict.traditions.lede}
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
                  <p className="mt-2 font-sans text-xs text-muted">{dict.traditions.claims(count(t.key))}</p>
                </div>
              </SpotlightCard>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </PageTransition>
  );
}
