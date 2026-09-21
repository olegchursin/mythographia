import type { Metadata, Viewport } from "next";
import { Cinzel, Geist, Source_Serif_4 } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ScrollProgress } from "@/components/motion/Scroll";
import { ServiceWorker } from "@/components/ServiceWorker";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getEntities } from "@/lib/queries";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["500", "700"] });
const sourceSerif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: { default: "Mythographia — An Encyclopedia of Greek Myth", template: "%s — Mythographia" },
  description: "A sourced encyclopedia of Greek mythology: gods, heroes, monsters, places and texts, with rival ancient traditions kept side by side.",
  applicationName: "Mythographia",
  appleWebApp: { capable: true, title: "Mythographia", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0a0908",
  viewportFit: "cover",
};

const NAV = [
  { href: "/a-z", label: "Index", match: "/a-z" },
  { href: "/tree/zeus", label: "Family trees", match: "/tree" },
  { href: "/graph", label: "Relations", match: "/graph" },
  { href: "/kinship", label: "Kinship", match: "/kinship" },
  { href: "/traditions", label: "Traditions", match: "/traditions" },
  { href: "/sources", label: "Sources", match: "/sources" },
];

// Dark is the default; only an explicit choice of light is restored, before first paint.
const THEME_SCRIPT = `try{if(localStorage.getItem("theme")==="light"){document.documentElement.dataset.theme="light";document.querySelector('meta[name="theme-color"]')?.setAttribute("content","#f7f3ea")}}catch(e){}`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const entities = await getEntities();
  const searchIndex = [...entities.values()].map((e) => ({ slug: e.slug, name: e.name, hint: e.epithet ?? e.subtype, aliases: e.aliases, glyph: e.emoji }));

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${geist.variable} ${cinzel.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <ServiceWorker />
        <MotionProvider>
          <ScrollProgress />
          <SiteHeader nav={NAV} index={searchIndex} />
          <main className="flex-1">{children}</main>
          <SiteFooter nav={NAV} />
        </MotionProvider>
      </body>
    </html>
  );
}
