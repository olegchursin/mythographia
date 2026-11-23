import Link from "@/components/Link";
import { PageTransition } from "@/components/motion/PageTransition";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <PageTransition className="page grid min-h-[70svh] place-items-center text-center">
      <div className="max-w-md">
        <span className="glyph-tile mx-auto size-14 rounded-full font-serif text-lg font-semibold">404</span>
        <h1 className="mt-5 font-serif text-2xl font-semibold">{t.notFound.title}</h1>
        <p className="mt-2 text-muted">{t.notFound.lede}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/a-z" className="btn btn-ink">{t.notFound.browse}</Link>
          <Link href="/" className="btn btn-ghost">{t.notFound.home}</Link>
        </div>
        <div className="meander meander-march mx-auto mt-10 max-w-[12rem] text-[var(--line-strong)]" aria-hidden />
      </div>
    </PageTransition>
  );
}
