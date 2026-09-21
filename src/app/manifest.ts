import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mythographia — An Encyclopedia of Greek Myth",
    short_name: "Mythographia",
    description: "A sourced encyclopedia of Greek mythology: gods, heroes, monsters, places and texts, with rival ancient traditions kept side by side.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0a0908",
    theme_color: "#0a0908",
    categories: ["education", "books", "reference"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    shortcuts: [
      { name: "Index", url: "/a-z" },
      { name: "Relations", url: "/graph" },
      { name: "Kinship", url: "/kinship" },
    ],
  };
}
