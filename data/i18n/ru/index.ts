import type { Overlay } from "../types";
import { godsArticlesA } from "./articles/gods-a";
import { godsArticlesB } from "./articles/gods-b";
import { heroesArticlesA } from "./articles/heroes-a";
import { heroesArticlesB } from "./articles/heroes-b";
import { worldArticlesA } from "./articles/world-a";
import { worldArticlesB } from "./articles/world-b";
import { godsRu } from "./entities/gods";
import { mortalsRu } from "./entities/mortals";
import { worldRu } from "./entities/world";
import { relTypes, sources, traditions } from "./meta";
import { relStrings } from "./relationships";
import { timelines } from "./timelines";

export const ru: Overlay = {
  entities: { ...godsRu, ...mortalsRu, ...worldRu },
  articles: { ...godsArticlesA, ...godsArticlesB, ...heroesArticlesA, ...heroesArticlesB, ...worldArticlesA, ...worldArticlesB },
  relStrings,
  relTypes,
  traditions,
  sources,
  timelines,
};
