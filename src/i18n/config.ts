export const locales = ["en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const hasLocale = (value: string | undefined | null): value is Locale => locales.includes(value as Locale);

/** Prefix an app path with its locale: href("ru", "/wiki/zeus") → "/ru/wiki/zeus". */
export const href = (locale: Locale, path: string) => (path === "/" ? `/${locale}` : `/${locale}${path}`);

/** The same page in another locale; keeps everything after the locale segment. */
export const switchLocale = (pathname: string, to: Locale) => {
  const parts = pathname.split("/");
  if (hasLocale(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/").replace(/\/$/, "") || `/${to}`;
};

/** Pick a plural form with the locale's CLDR rules (Russian has one/few/many). */
export function plural(locale: Locale, n: number, forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }) {
  const form = forms[new Intl.PluralRules(locale).select(n)] ?? forms.other;
  return form.replace("#", n.toLocaleString(locale));
}

/** hreflang links for one page: alternates("/wiki/zeus") → { en: "/en/wiki/zeus", ru: "/ru/wiki/zeus" }. */
export const alternates = (path: string) => ({ languages: Object.fromEntries(locales.map((l) => [l, href(l, path)])) });

/** Narrow a route param to a locale, falling back to the default. */
export const toLocale = (value: string | undefined | null): Locale => (hasLocale(value) ? value : defaultLocale);
