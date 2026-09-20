import { nymphs, olympians, otherGods, primordials, spirits, titans } from "./entities/gods";
import { heroes, kingsAndSeers, women } from "./entities/mortals";
import { artifacts, events, groups, monsters, places, stories } from "./entities/world";
import { alliance, conflict, romance } from "./relationships/relations";
import { family } from "./relationships/family";
import { associations } from "./relationships/world";

export { relationshipTypes, sources, traditions } from "./meta";
export { articles, wikiLinks } from "./articles";
export { timelines } from "./timelines";

export const entities = [
  ...primordials,
  ...titans,
  ...olympians,
  ...otherGods,
  ...spirits,
  ...nymphs,
  ...heroes,
  ...women,
  ...kingsAndSeers,
  ...monsters,
  ...groups,
  ...places,
  ...events,
  ...artifacts,
  ...stories,
];

export const relationships = [...family, ...romance, ...conflict, ...alliance, ...associations];
