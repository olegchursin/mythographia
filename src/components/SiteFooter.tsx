import Link from "@/components/Link";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function SiteFooter({ nav, t }: { nav: { href: string; label: string }[]; t: Dictionary["footer"] }) {
  return (
    <footer className="mx-auto mt-8 w-full max-w-[72rem] px-5 pb-[calc(var(--safe-b)+1.5rem)] sm:px-8">
      <div className="meander mb-6 text-line" aria-hidden />
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <p className="label kicker mb-2">{t.kicker}</p>
          <blockquote className="max-w-2xl font-serif text-[1.05rem] leading-relaxed">
            {t.quoteStart}<em className="text-brand">{t.quoteHighlight}</em>{t.quoteEnd}
          </blockquote>
          <p className="mt-2 max-w-2xl text-sm text-muted">{t.note}</p>
        </div>
        <nav aria-label={t.explore}>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm md:justify-end">
            {nav.map((n) => <li key={n.href}><Link href={n.href} className="text-muted transition-colors hover:text-ink">{n.label}</Link></li>)}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
