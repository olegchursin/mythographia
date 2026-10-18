import Link from "@/components/Link";
import { PageTransition } from "@/components/motion/PageTransition";
import { SplitWords } from "@/components/motion/SplitWords";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <PageTransition className="page grid min-h-[80svh] place-items-center text-center">
      <div>
        <p className="font-display text-[clamp(6rem,22vw,14rem)] font-bold leading-none text-gilded opacity-90">404</p>
        <div className="meander meander-march mx-auto my-6 max-w-sm" />
        <h1 className="display display-sm"><SplitWords text={t.notFound.title} /></h1>
        <p className="lede mx-auto mt-4">{t.notFound.lede}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/a-z" className="btn btn-primary">{t.notFound.browse}</Link>
          <Link href="/" className="btn btn-ghost">{t.notFound.home}</Link>
        </div>
      </div>
    </PageTransition>
  );
}
