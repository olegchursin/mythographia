import type { Metadata, Viewport } from "next";
import { Geist, Source_Serif_4 } from "next/font/google";
import { notFound } from "next/navigation";
import { AppShell, type NavItem } from "@/components/AppShell";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ServiceWorker } from "@/components/ServiceWorker";
import { SiteFooter } from "@/components/SiteFooter";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary, getI18n } from "@/i18n/server";
import { getEntities, getSources, getTraditions } from "@/lib/queries";
import { THEME_COLORS } from "@/lib/theme";
import "../globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
const sourceSerif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin", "cyrillic"], weight: ["400", "600"], style: ["normal", "italic"] });

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
  viewportFit: "cover",
};

// Before first paint: an explicit theme choice (otherwise the OS decides via CSS) and a collapsed sidebar.
const BOOT_SCRIPT = `try{var d=document.documentElement,t=localStorage.getItem("theme");if(t==="light"||t==="dark"){d.dataset.theme=t;document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.setAttribute("content",t==="dark"?"${THEME_COLORS.dark}":"${THEME_COLORS.light}")})}if(localStorage.getItem("sidebar")==="collapsed")d.dataset.sidebar="collapsed"}catch(e){}`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  if (!hasLocale((await params).lang)) notFound();
  const { locale, t } = await getI18n();
  const [entities, traditions, sources] = await Promise.all([getEntities(locale), getTraditions(locale), getSources(locale)]);
  const searchIndex = [...entities.values()].map((e) => ({
    slug: e.slug,
    name: e.name,
    hint: e.epithet ?? t.subtype[e.subtype] ?? e.subtype,
    aliases: [...e.aliases, ...e.altNames],
    glyph: e.emoji,
  }));
  const names = {
    ...Object.fromEntries(Object.values(traditions).map((tr) => [`traditions/${tr.key}`, tr.name])),
    ...Object.fromEntries(Object.values(sources).map((s) => [`sources/${s.slug}`, s.work])),
  };
  const nav: NavItem[] = [
    { href: "/", label: t.shell.home, match: "/", icon: "home", group: "browse" },
    { href: "/a-z", label: t.nav.index, match: "/a-z", icon: "index", group: "browse" },
    { href: "/tree/zeus", label: t.nav.trees, match: "/tree", icon: "tree", group: "tools" },
    { href: "/graph", label: t.nav.relations, match: "/graph", icon: "graph", group: "tools" },
    { href: "/kinship", label: t.nav.kinship, match: "/kinship", icon: "kinship", group: "tools" },
    { href: "/traditions", label: t.nav.traditions, match: "/traditions", icon: "traditions", group: "reference" },
    { href: "/sources", label: t.nav.sources, match: "/sources", icon: "sources", group: "reference" },
  ];

  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning className={`${geist.variable} ${sourceSerif.variable} antialiased`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <ServiceWorker />
        <MotionProvider>
          <AppShell
            nav={nav}
            index={searchIndex}
            names={names}
            t={{ brand: t.brand, header: t.header, theme: t.theme, search: t.search, language: t.language, shell: t.shell, nav: t.nav }}
            footer={<SiteFooter nav={nav.slice(1)} t={t.footer} />}
          >
            {children}
          </AppShell>
        </MotionProvider>
      </body>
    </html>
  );
}
