"use client";

import NextLink from "next/link";
import { useParams } from "next/navigation";
import { type ComponentProps, useCallback } from "react";
import { defaultLocale, hasLocale, href as withLocale, type Locale } from "@/i18n/config";

/** The current locale from the [lang] segment. */
export function useLocale(): Locale {
  const { lang } = useParams<{ lang?: string }>();
  return hasLocale(lang) ? lang : defaultLocale;
}

/** Prefix app-absolute paths ("/wiki/zeus") with the current locale; leaves anchors, external and already-prefixed URLs alone. */
export function useLocalize() {
  const locale = useLocale();
  return useCallback((path: string) => (path.startsWith("/") && !hasLocale(path.split(/[/?#]/)[1]) ? withLocale(locale, path) : path), [locale]);
}

/** next/link that keeps the reader in their language. */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const localize = useLocalize();
  return <NextLink href={typeof href === "string" ? localize(href) : href} {...props} />;
}
