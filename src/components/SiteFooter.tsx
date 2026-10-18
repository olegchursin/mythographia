import Link from "next/link";
import { Reveal } from "./motion/Reveal";

export function SiteFooter({ nav }: { nav: { href: string; label: string }[] }) {
  return (
    <footer className="relative mt-10 overflow-hidden border-t border-line pb-[var(--safe-b)]">
      <div className="meander meander-march mt-[-1px] opacity-70" />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-10 pt-16 md:grid-cols-[minmax(0,1fr)_auto]">
        <Reveal>
          <p className="label kicker mb-4">No canon</p>
          <blockquote className="max-w-2xl text-xl leading-relaxed sm:text-2xl">
            Greek myth has no canon. Ancient authors disagree about parentage, marriages and deaths, so every relationship here records its tradition and
            source, and <span className="text-gilded">rival versions are shown side by side</span>.
          </blockquote>
          <p className="mt-5 max-w-2xl font-sans text-sm text-muted">Genealogies follow Hesiod, Homer, the tragedians, Apollodorus, Hyginus, Ovid and others.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="label mb-4">Explore</p>
          <ul className="grid grid-cols-2 gap-x-10 gap-y-2 font-sans text-sm md:grid-cols-1">
            {nav.map((n) => <li key={n.href}><Link href={n.href} className="text-muted transition-colors hover:text-gold">{n.label}</Link></li>)}
          </ul>
        </Reveal>
      </div>
      <p aria-hidden className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[calc((100vw-var(--safe-l)-var(--safe-r))*0.1)] font-bold leading-[0.8] tracking-[0.06em] text-ink/[0.045]">
        MYTHOGRAPHIA
      </p>
    </footer>
  );
}
