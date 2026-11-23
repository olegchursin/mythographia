import Image from "next/image";
import type { ReactNode } from "react";

export function Infobox({ title, label, subtitle, glyph, image, rows }: { title: string; label: string; subtitle?: string | null; glyph?: string; image?: string | null; rows: { label: string; value: ReactNode }[] }) {
  const shown = rows.filter((r) => r.value !== null && r.value !== undefined && r.value !== false);
  return (
    <aside className="card text-[0.9rem]" aria-label={label}>
      <div className="relative border-b border-line px-5 py-5 text-center">
        {image ? (
          <Image src={image} alt={title} width={640} height={600} sizes="320px" preload className="relative mx-auto mb-3 h-auto max-h-64 w-auto" />
        ) : glyph ? (
          <div className="glyph-tile relative mx-auto mb-3 size-14 text-[1.75rem]" aria-hidden>{glyph}</div>
        ) : null}
        <div className="relative font-serif text-lg font-semibold">{title}</div>
        {subtitle && <div className="relative font-serif text-sm italic text-muted">{subtitle}</div>}
      </div>
      <dl>
        {shown.map((r) => (
          <div key={r.label} className="grid grid-cols-[6.5rem_1fr] gap-2 border-b border-line px-5 py-2.5 last:border-b-0">
            <dt className="label pt-0.5">{r.label}</dt>
            <dd className="leading-snug">{r.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
