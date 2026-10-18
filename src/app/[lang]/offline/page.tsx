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
    <PageTransition className="page grid min-h-[80svh] place-items-center text-center">
      <div>
        <div className="meander meander-march mx-auto my-6 max-w-sm" />
        <h1 className="display display-sm">{t.offline.title}</h1>
        <p className="lede mx-auto mt-4">{t.offline.lede}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">{t.offline.home}</Link>
        </div>
      </div>
    </PageTransition>
  );
}
