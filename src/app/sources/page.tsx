import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { getGraph } from "@/lib/queries";

export const metadata: Metadata = { title: "Ancient sources" };

export default async function SourcesPage() {
  const { edges, sources } = await getGraph();
  const count = (slug: string) => edges.filter((e) => e.sourceRef === slug).length;
  return (
    <PageTransition className="page max-w-[60rem]">
      <p className="label kicker">Reference</p>
      <h1 className="display mt-4">Ancient <span className="text-gilded">sources</span></h1>
      <p className="lede mt-4">The texts cited in this encyclopedia, with the number of relationships each one attests.</p>
      <Reveal className="table-wrap mt-12" y={40}><table className="ref">
        <thead><tr><th className="label">Author</th><th className="label">Work</th><th className="label">Date</th><th className="label text-right">Citations</th></tr></thead>
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
