import type { ReactNode } from "react";

export function Infobox({ title, subtitle, glyph, rows }: { title: string; subtitle?: string | null; glyph?: string; rows: { label: string; value: ReactNode }[] }) {
  const shown = rows.filter((r) => r.value !== null && r.value !== undefined && r.value !== false);
  return (
    <aside className="card text-[0.95rem]" aria-label={`${title}: quick facts`}>
      <div className="relative border-b border-line px-5 py-6 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_50%_0%,color-mix(in_srgb,var(--gold)_16%,transparent),transparent)]" aria-hidden />
        {glyph && <div className="relative mx-auto mb-3 grid size-16 place-items-center rounded-full border border-gold/30 bg-gold/10 text-3xl shadow-[0_0_40px_-6px_color-mix(in_srgb,var(--gold)_50%,transparent)]" aria-hidden>{glyph}</div>}
        <div className="relative font-display text-lg font-bold tracking-wide">{title}</div>
        {subtitle && <div className="relative text-sm italic text-muted">{subtitle}</div>}
      </div>
      <dl>
        {shown.map((r) => (
          <div key={r.label} className="grid grid-cols-[6.5rem_1fr] gap-2 border-b border-line px-5 py-2.5 last:border-b-0">
            <dt className="label pt-1">{r.label}</dt>
            <dd className="leading-snug">{r.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
