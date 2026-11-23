import type { Metadata } from "next";
import Link from "@/components/Link";
import { PageTransition } from "@/components/motion/PageTransition";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
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
      <h1 className="display mt-2">{dict.traditions.titleStart}{dict.traditions.titleGild}</h1>
      <p className="lede mt-3">
        {dict.traditions.lede}
      </p>
      <Stagger as="ul" className="mt-10 grid gap-3 md:grid-cols-2">
        {ranked.map((t) => (
          <StaggerItem as="li" key={t.key}>
            <Link href={`/traditions/${t.key}`} transitionTypes={["nav-forward"]} className="tile group flex h-full flex-col p-5 sm:p-6">
                <p className="label">{t.period}</p>
                <h2 className="mt-1 font-serif text-[1.4rem] font-semibold transition-colors group-hover:text-brand">{t.name}</h2>
                <p className="mt-1.5 text-[0.9rem] text-muted">{t.description}</p>
                <div className="mt-auto pt-5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand" style={{ width: `${(count(t.key) / max) * 100}%` }} /></div>
                  <p className="mt-2 font-sans text-xs text-muted">{dict.traditions.claims(count(t.key))}</p>
                </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </PageTransition>
  );
}
