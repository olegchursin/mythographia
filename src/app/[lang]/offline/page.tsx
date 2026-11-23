import type { Metadata } from "next";
import Link from "@/components/Link";
import { PageTransition } from "@/components/motion/PageTransition";
import { toLocale } from "@/i18n/config";
import { getDictionary, getI18n } from "@/i18n/server";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return { title: getDictionary(toLocale((await params).lang)).offline.meta, robots: { index: false } };
}

export default async function Offline() {
  const { t } = await getI18n();
  return (
    <PageTransition className="page grid min-h-[70svh] place-items-center text-center">
      <div className="max-w-md">
        <span className="glyph-tile mx-auto size-14 rounded-full text-2xl" aria-hidden>⛵</span>
        <h1 className="mt-5 font-serif text-2xl font-semibold">{t.offline.title}</h1>
        <p className="mt-2 text-muted">{t.offline.lede}</p>
        <div className="mt-6 flex justify-center">
          <Link href="/" className="btn btn-ink">{t.offline.home}</Link>
        </div>
        <div className="meander meander-march mx-auto mt-10 max-w-[12rem] text-[var(--line-strong)]" aria-hidden />
      </div>
    </PageTransition>
  );
}
