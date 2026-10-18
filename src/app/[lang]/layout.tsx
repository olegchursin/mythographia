import type { Metadata, Viewport } from "next";
import { Cormorant_SC, Geist, Source_Serif_4 } from "next/font/google";
import { notFound } from "next/navigation";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ScrollProgress } from "@/components/motion/Scroll";
import { ServiceWorker } from "@/components/ServiceWorker";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary, getI18n } from "@/i18n/server";
import { getEntities } from "@/lib/queries";
import "../globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
// Inscriptional small caps that cover both Latin and Cyrillic.
const cormorant = Cormorant_SC({ variable: "--font-cormorant", subsets: ["latin", "cyrillic"], weight: ["500", "700"] });
const sourceSerif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin", "cyrillic"], style: ["normal", "italic"] });

export const generateStaticParams = () => locales.map((lang) => ({ lang }));

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: { default: t.meta.title, template: lang === "ru" ? "%s — Мифография" : "%s — Mythographia" },
    description: t.meta.description,
    applicationName: "Mythographia",
    appleWebApp: { capable: true, title: "Mythographia", statusBarStyle: "black-translucent" },
    icons: { apple: "/icons/apple-touch-icon.png" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0908",
  viewportFit: "cover",
};

// Dark is the default; only an explicit choice of light is restored, before first paint.
const THEME_SCRIPT = `try{if(localStorage.getItem("theme")==="light"){document.documentElement.dataset.theme="light";document.querySelector('meta[name="theme-color"]')?.setAttribute("content","#f7f3ea")}}catch(e){}`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  if (!hasLocale((await params).lang)) notFound();
  const { locale, t } = await getI18n();
  const entities = await getEntities(locale);
  const searchIndex = [...entities.values()].map((e) => ({
    slug: e.slug,
    name: e.name,
    hint: e.epithet ?? t.subtype[e.subtype] ?? e.subtype,
    aliases: [...e.aliases, ...e.altNames],
    glyph: e.emoji,
  }));
  const nav = [
    { href: "/a-z", label: t.nav.index, match: "/a-z" },
    { href: "/tree/zeus", label: t.nav.trees, match: "/tree" },
    { href: "/graph", label: t.nav.relations, match: "/graph" },
    { href: "/kinship", label: t.nav.kinship, match: "/kinship" },
    { href: "/traditions", label: t.nav.traditions, match: "/traditions" },
    { href: "/sources", label: t.nav.sources, match: "/sources" },
  ];

  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning className={`${geist.variable} ${cormorant.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <ServiceWorker />
        <MotionProvider>
          <ScrollProgress />
          <SiteHeader nav={nav} index={searchIndex} t={{ brand: t.brand, header: t.header, theme: t.theme, search: t.search, language: t.language }} />
          <main className="flex-1">{children}</main>
          <SiteFooter nav={nav} t={t.footer} brand={t.brand.start + t.brand.end} />
        </MotionProvider>
      </body>
    </html>
  );
}
