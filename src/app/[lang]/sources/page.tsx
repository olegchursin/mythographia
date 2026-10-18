import type { Metadata } from "next";
import Link from "@/components/Link";
import { PageTransition } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { toLocale } from "@/i18n/config";
import { getDictionary, getI18n } from "@/i18n/server";
import { getGraph } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return { title: getDictionary(toLocale((await params).lang)).sources.title };
}

export default async function SourcesPage() {
  const { locale, t } = await getI18n();
  const { edges, sources } = await getGraph(locale);
  const count = (slug: string) => edges.filter((e) => e.sourceRef === slug).length;
  return (
    <PageTransition className="page max-w-[60rem]">
      <p className="label kicker">{t.sources.kicker}</p>
      <h1 className="display mt-4">{t.sources.titleStart}<span className="text-gilded">{t.sources.titleGild}</span></h1>
      <p className="lede mt-4">{t.sources.lede}</p>
      <Reveal className="table-wrap mt-12" y={40}><table className="ref">
        <thead><tr><th className="label">{t.sources.author}</th><th className="label">{t.sources.work}</th><th className="label">{t.sources.date}</th><th className="label text-right">{t.sources.citations}</th></tr></thead>
        <tbody>
          {Object.values(sources).sort((a, b) => count(b.slug) - count(a.slug)).map((s) => (
            <tr key={s.slug}>
              <td className="whitespace-nowrap">{s.author}</td>
              <td>
                <Link href={`/sources/${s.slug}`} className="wikilink italic">{s.work}</Link>
                {s.summary && <div className="text-sm text-muted">{s.summary}</div>}
              </td>
              <td className="whitespace-nowrap text-sm">{s.period}</td>
              <td className="text-right font-sans text-sm text-gold">{count(s.slug)}</td>
            </tr>
          ))}
        </tbody>
      </table></Reveal>
    </PageTransition>
  );
}
