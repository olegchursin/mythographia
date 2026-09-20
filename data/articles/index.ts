import { godsArticles } from "./gods";
import { heroesArticles } from "./heroes";
import { worldArticles } from "./world";

export const articles: Record<string, string> = { ...godsArticles, ...heroesArticles, ...worldArticles };

/** Every [[slug]] / [[slug|label]] target in a body. */
export const wikiLinks = (body: string): string[] => [...body.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)].map((m) => m[1].trim());
