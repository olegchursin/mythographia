export type Kind = "character" | "group" | "place" | "event" | "artifact" | "creature" | "story";
export type Category = "family" | "romance" | "conflict" | "alliance" | "association";
export type Certainty = "canonical" | "variant" | "disputed";
export type Gender = "m" | "f" | "x";

export interface EntitySeed {
  slug: string;
  name: string;
  kind: Kind;
  subtype: string;
  emoji: string;
  epithet: string;
  gender?: Gender;
  aliases?: string[];
  domains?: string[];
  /** 1–2 sentence lead, reference voice. Required for every entity. */
  summary?: string;
  /** illustration under public/, e.g. "/images/cerberus.webp" */
  image?: string;
}

export interface RelOpts {
  /** tradition key */
  t?: string;
  /** source slug */
  s?: string;
  cite?: string;
  cert?: Certainty;
  note?: string;
}

export interface RelSeed extends RelOpts {
  from: string;
  type: string;
  to: string;
}

interface Extra {
  aliases?: string[];
  domains?: string[];
  summary?: string;
  image?: string;
}

const make =
  (kind: Kind) =>
  (slug: string, name: string, subtype: string, emoji: string, epithet: string, gender?: Gender, extra: Extra = {}): EntitySeed => ({
    slug,
    name,
    kind,
    subtype,
    emoji,
    epithet,
    gender,
    ...extra,
  });

export const character = make("character");
export const creature = make("creature");
export const group = make("group");
export const place = make("place");
export const event = make("event");
export const artifact = make("artifact");
export const story = make("story");

/** One edge. Direction reads "from <label> to": rel("achilles", "killed", "hector"). */
export const rel = (from: string, type: string, to: string, opts: RelOpts = {}): RelSeed => ({ from, type, to, ...opts });

/** Parent edges from every parent to every child. */
export const children = (parents: string[], kids: string[], opts: RelOpts = {}): RelSeed[] =>
  parents.flatMap((p) => kids.map((k) => rel(p, "parent", k, opts)));

/** The same edge type from many sources to one target (members of a group, fighters in a war…). */
export const many = (froms: string[], type: string, to: string, opts: RelOpts = {}): RelSeed[] =>
  froms.map((f) => rel(f, type, to, opts));

/** The same edge type from one source to many targets. */
export const fan = (from: string, type: string, tos: string[], opts: RelOpts = {}): RelSeed[] =>
  tos.map((to) => rel(from, type, to, opts));
