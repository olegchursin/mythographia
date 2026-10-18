import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, LOCALE_COOKIE, locales, type Locale } from "./i18n/config";

/** Best match from Accept-Language, by quality then order: "ru-RU,ru;q=0.9,en;q=0.8" → "ru". */
function negotiate(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { base: tag.toLowerCase().split("-")[0], q: q ? Number(q.trim().slice(2)) || 0 : 1, i };
    })
    .sort((a, b) => b.q - a.q || a.i - b.i);
  return ranked.map((r) => r.base).find((b): b is Locale => locales.includes(b as Locale)) ?? null;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (hasLocale(pathname.split("/")[1])) return;

  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = hasLocale(cookie) ? cookie : (negotiate(request.headers.get("accept-language")) ?? defaultLocale);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except Next internals, the service worker, the manifest and files in public/.
  matcher: ["/((?!_next/|api/|sw\\.js|manifest\\.webmanifest|favicon\\.ico|icons/|images/|.*\\.[a-z0-9]+$).*)"],
};
