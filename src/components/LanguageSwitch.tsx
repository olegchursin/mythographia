"use client";

import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, locales, switchLocale } from "@/i18n/config";
import { useLocale } from "./Link";

const SHORT = { en: "EN", ru: "RU" } as const;
const NAME = { en: "English", ru: "Русский" } as const;

/** EN | RU. Same page in the other language; the choice is remembered for bare URLs. */
export function LanguageSwitch({ label, className = "" }: { label: string; className?: string }) {
  const pathname = usePathname();
  const current = useLocale();

  return (
    <nav aria-label={label} className={`flex h-10 items-center rounded-full border border-line bg-glass p-1 font-sans text-xs tracking-wide ${className}`}>
      {locales.map((l) => (
        <a
          key={l}
          href={switchLocale(pathname, l)}
          hrefLang={l}
          lang={l}
          title={NAME[l]}
          aria-current={l === current ? "true" : undefined}
          onClick={(e) => {
            document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
            // Keep filters and the section being read.
            e.currentTarget.search = location.search;
            e.currentTarget.hash = location.hash;
          }}
          className={`grid h-full place-items-center rounded-full px-2.5 transition-colors ${l === current ? "bg-gold/15 text-gold" : "text-muted hover:text-ink"}`}
        >
          {SHORT[l]}
        </a>
      ))}
    </nav>
  );
}
