import { lang } from "next/root-params";
import { defaultLocale, hasLocale, type Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { ru } from "./dictionaries/ru";

const dictionaries: Record<Locale, Dictionary> = { en, ru };

/** The locale of the current request, from the [lang] root segment. Server Components only. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return hasLocale(value) ? value : defaultLocale;
}

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

/** Locale and its dictionary in one call: `const { locale, t } = await getI18n()`. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
