import type { Category } from "./types";

export interface RelTypeSeed {
  key: string;
  label: string;
  inverse: string;
  category: Category;
  symmetric?: boolean;
  emoji: string;
}

export const relationshipTypes: RelTypeSeed[] = [
  { key: "parent", label: "parent of", inverse: "child of", category: "family", emoji: "👶" },

  { key: "spouse", label: "married to", inverse: "married to", category: "romance", symmetric: true, emoji: "💍" },
  { key: "lover", label: "lover of", inverse: "lover of", category: "romance", symmetric: true, emoji: "❤️" },
  { key: "pursued", label: "pursued", inverse: "pursued by", category: "romance", emoji: "🏃" },

  { key: "enemy", label: "enemy of", inverse: "enemy of", category: "conflict", symmetric: true, emoji: "⚔️" },
  { key: "killed", label: "killed", inverse: "killed by", category: "conflict", emoji: "💀" },
  { key: "punished", label: "punished", inverse: "punished by", category: "conflict", emoji: "⛓️" },
  { key: "cursed", label: "cursed", inverse: "cursed by", category: "conflict", emoji: "🧿" },
  { key: "abducted", label: "abducted", inverse: "abducted by", category: "conflict", emoji: "🌀" },
  { key: "overthrew", label: "overthrew", inverse: "overthrown by", category: "conflict", emoji: "👑" },
  { key: "tricked", label: "tricked", inverse: "tricked by", category: "conflict", emoji: "🃏" },
  { key: "transformed", label: "transformed", inverse: "transformed by", category: "conflict", emoji: "✨" },
  { key: "defeated", label: "defeated", inverse: "defeated by", category: "conflict", emoji: "🥊" },

  { key: "ally", label: "ally of", inverse: "ally of", category: "alliance", symmetric: true, emoji: "🤝" },
  { key: "companion", label: "companion of", inverse: "companion of", category: "alliance", symmetric: true, emoji: "🫂" },
  { key: "mentor", label: "mentor of", inverse: "student of", category: "alliance", emoji: "🎓" },
  { key: "patron", label: "divine patron of", inverse: "protected by", category: "alliance", emoji: "🛡️" },
  { key: "freed", label: "freed", inverse: "freed by", category: "alliance", emoji: "🔓" },
  { key: "served", label: "served", inverse: "served by", category: "alliance", emoji: "🙇" },
  { key: "raised", label: "raised", inverse: "raised by", category: "alliance", emoji: "🍼" },

  { key: "member_of", label: "member of", inverse: "includes", category: "association", emoji: "👥" },
  { key: "took_part_in", label: "took part in", inverse: "featured", category: "association", emoji: "📅" },
  { key: "appears_in", label: "appears in", inverse: "features", category: "association", emoji: "📜" },
  { key: "associated_place", label: "associated with", inverse: "home of", category: "association", emoji: "📍" },
  { key: "rules", label: "ruler of", inverse: "ruled by", category: "association", emoji: "🏛️" },
  { key: "wields", label: "wields", inverse: "wielded by", category: "association", emoji: "🗡️" },
  { key: "guards", label: "guards", inverse: "guarded by", category: "association", emoji: "🚧" },
  { key: "created", label: "created", inverse: "created by", category: "association", emoji: "🔨" },
  { key: "located_in", label: "located in", inverse: "contains", category: "association", emoji: "🗺️" },
];

export interface TraditionSeed {
  key: string;
  name: string;
  emoji: string;
  period: string;
  description: string;
}

export const traditions: TraditionSeed[] = [
  { key: "hesiodic", name: "Hesiodic tradition", emoji: "🌊", period: "c. 700 BCE", description: "The systematic genealogy of the gods set out in Hesiod's Theogony and Works and Days: Chaos, Gaia and Uranus, the Titans, and the rise of Zeus. It became the closest thing Greek myth has to an official family tree, and most later handbooks start from it." },
  { key: "homeric", name: "Homeric tradition", emoji: "⚡", period: "c. 750–550 BCE", description: "The Iliad, the Odyssey and the Homeric Hymns. Homer is interested in heroes rather than cosmogony, and his passing remarks on divine parentage often differ from Hesiod's: Aphrodite is a daughter of Zeus and Dione, Hephaestus a son of Zeus and Hera, Oceanus and Tethys the origin of the gods." },
  { key: "orphic", name: "Orphic tradition", emoji: "🥚", period: "6th century BCE onwards", description: "Theogonies attributed to Orpheus and used in mystery cult. They open with Chronos (Time) and Ananke, a cosmic egg and the radiant first-born Phanes, and give Dionysus-Zagreus, son of Zeus and Persephone, a central role. Known mostly from fragments and late summaries." },
  { key: "apollodoran", name: "Apollodoran tradition", emoji: "📚", period: "1st–2nd century CE", description: "The Bibliotheca ascribed to Apollodorus: a plain, comprehensive handbook that arranges myth by family from the birth of the gods to the death of Odysseus. It draws heavily on lost early mythographers such as Pherecydes and Acusilaus and is the single most useful ancient reference work." },
  { key: "hyginian", name: "Hyginian tradition", emoji: "🗂️", period: "c. 2nd century CE", description: "The Fabulae and Astronomica transmitted under the name of Hyginus: terse Latin summaries of Greek myths, often preserving odd variants and the plots of lost tragedies, not always accurately." },
  { key: "tragic", name: "Tragic tradition", emoji: "🎭", period: "5th century BCE", description: "Aeschylus, Sophocles and Euripides reshaped inherited stories for the Athenian stage, frequently inventing or fixing the version that later became standard: Clytemnestra as Agamemnon's killer, Medea as the murderer of her children, Oedipus's self-blinding." },
  { key: "epic-cycle", name: "Epic Cycle", emoji: "🏺", period: "7th–6th century BCE", description: "The lost epics that told the rest of the Trojan story around the Iliad and Odyssey: the Cypria, Aethiopis, Little Iliad, Sack of Ilium, Returns and Telegony. They survive only in fragments and in the prose summaries of Proclus." },
  { key: "roman", name: "Roman tradition", emoji: "🦅", period: "1st century BCE – 2nd century CE", description: "Latin retellings, above all Ovid's Metamorphoses and Virgil's Aeneid, with Apuleius and Statius. Often the fullest surviving versions of a story, and the ones that shaped later European art, but coloured by Roman tastes and sometimes by the poets' own invention." },
  { key: "local", name: "Local and lyric tradition", emoji: "⛰️", period: "various", description: "Regional cult legends and the lyric poets: Pindar, Bacchylides, and the local stories collected by Pausanias and Diodorus. These preserve versions tied to particular sanctuaries and cities that never entered the mainstream handbooks." },
];

export interface SourceSeed {
  slug: string;
  author: string;
  work: string;
  period: string;
  summary: string;
  /** slug of the entity page for this text, if it has one */
  entity?: string;
}

export const sources: SourceSeed[] = [
  { slug: "theogony", author: "Hesiod", work: "Theogony", period: "c. 700 BCE", entity: "theogony", summary: "A 1,000-line hexameter poem on the origin of the cosmos and the genealogy of the gods, from Chaos to the reign of Zeus. The foundational text for divine family trees." },
  { slug: "works-and-days", author: "Hesiod", work: "Works and Days", period: "c. 700 BCE", summary: "A didactic poem on farming and justice that includes the myths of Prometheus, Pandora and the Five Ages of Man." },
  { slug: "catalogue-of-women", author: "Hesiod (attributed)", work: "Catalogue of Women", period: "6th century BCE", summary: "A fragmentary continuation of the Theogony listing the mortal women loved by gods and the heroic families descended from them." },
  { slug: "iliad", author: "Homer", work: "Iliad", period: "c. 750–700 BCE", entity: "iliad", summary: "The epic of the wrath of Achilles during a few weeks of the tenth year of the Trojan War. The oldest and most authoritative source for the heroes at Troy and for the Olympians as characters." },
  { slug: "odyssey", author: "Homer", work: "Odyssey", period: "c. 725–675 BCE", entity: "odyssey", summary: "The epic of Odysseus's ten-year return from Troy and the recovery of his household on Ithaca, with a visit to the dead that doubles as a catalogue of earlier heroes and heroines." },
  { slug: "homeric-hymns", author: "Anonymous", work: "Homeric Hymns", period: "7th–5th century BCE", entity: "homeric-hymns", summary: "Thirty-three hexameter hymns to individual gods. The long hymns to Demeter, Apollo, Hermes and Aphrodite are the principal narrative sources for those deities' central myths." },
  { slug: "bibliotheca", author: "Pseudo-Apollodorus", work: "Bibliotheca (Library)", period: "1st–2nd century CE", entity: "bibliotheca", summary: "A prose handbook of Greek myth organised by genealogy, with an Epitome covering the Trojan cycle. Indispensable for heroic saga and for variants it records from lost early authors." },
  { slug: "fabulae", author: "Hyginus", work: "Fabulae", period: "c. 2nd century CE", summary: "Some 270 brief Latin summaries of myths and genealogies, valuable for rare variants and for the plots of lost Greek tragedies." },
  { slug: "argonautica", author: "Apollonius Rhodius", work: "Argonautica", period: "3rd century BCE", entity: "argonautica", summary: "The Hellenistic epic of Jason's voyage to Colchis and Medea's love, in four books; the only complete ancient narrative of the Argonauts." },
  { slug: "metamorphoses", author: "Ovid", work: "Metamorphoses", period: "8 CE", entity: "metamorphoses", summary: "A Latin epic of some 250 transformation myths running from the creation to Julius Caesar. For many stories (Daphne, Arachne, Narcissus, Medusa's origin) it is the earliest or only full account." },
  { slug: "aeneid", author: "Virgil", work: "Aeneid", period: "29–19 BCE", entity: "aeneid", summary: "The Roman national epic: Aeneas's flight from Troy and arrival in Italy. Book 2 is the fullest surviving narrative of the fall of Troy; Book 6 the most influential ancient description of the Underworld." },
  { slug: "pindar", author: "Pindar", work: "Victory Odes", period: "498–446 BCE", summary: "Choral odes for athletic victors, each built around a myth. Pindar often corrects stories he finds impious, and preserves early versions of Pelops, Asclepius, Jason and the Dioscuri." },
  { slug: "oresteia", author: "Aeschylus", work: "Oresteia", period: "458 BCE", entity: "oresteia", summary: "The trilogy Agamemnon, Libation Bearers and Eumenides: the murder of Agamemnon, Orestes's revenge and his acquittal at Athens." },
  { slug: "myrmidons", author: "Aeschylus", work: "Myrmidons (fragments)", period: "c. 490–470 BCE", summary: "A lost tragedy on the death of Patroclus, surviving in fragments; the earliest text to present Achilles and Patroclus explicitly as lovers." },
  { slug: "prometheus-bound", author: "Aeschylus (attributed)", work: "Prometheus Bound", period: "c. 450–430 BCE", entity: "prometheus-bound", summary: "A tragedy presenting the chained Titan as humanity's benefactor and Zeus as a new tyrant; its authorship is disputed." },
  { slug: "oedipus-rex", author: "Sophocles", work: "Oedipus Rex", period: "c. 429 BCE", entity: "oedipus-rex", summary: "The tragedy of Oedipus's discovery that he has killed his father and married his mother; the canonical version of the Theban legend." },
  { slug: "sophocles", author: "Sophocles", work: "Ajax, Antigone, Trachiniae, Philoctetes", period: "c. 450–409 BCE", summary: "The other surviving plays, covering the suicide of Ajax, Antigone's defiance of Creon, the death of Heracles and the recall of Philoctetes to Troy." },
  { slug: "euripides", author: "Euripides", work: "Medea, Hippolytus, Bacchae, Iphigenia plays and others", period: "438–405 BCE", entity: "bacchae", summary: "Nineteen surviving plays, frequently innovating on the received story: Medea's infanticide, Iphigenia's rescue to Tauris, Helen's phantom double, the destruction of Pentheus." },
  { slug: "orphic-fragments", author: "Orphic poets", work: "Orphic Theogonies and Hymns", period: "6th century BCE – 3rd century CE", summary: "Fragments of several theogonies (the Derveni, Eudemian and Rhapsodic) and a collection of 87 hymns, reconstructed largely from Neoplatonist quotations." },
  { slug: "pausanias", author: "Pausanias", work: "Description of Greece", period: "c. 150–180 CE", summary: "A traveller's guide to mainland Greece in ten books, recording the monuments, cults and local legends of each region." },
  { slug: "diodorus", author: "Diodorus Siculus", work: "Library of History", period: "c. 60–30 BCE", summary: "A universal history whose early books retell Greek myth as rationalised ancient history, drawing on lost Hellenistic mythographers." },
  { slug: "epic-cycle", author: "Various (via Proclus)", work: "Epic Cycle", period: "7th–6th century BCE", summary: "Lost epics of the Trojan War known from fragments and Proclus's summaries: Cypria, Aethiopis, Little Iliad, Sack of Ilium, Returns, Telegony." },
  { slug: "golden-ass", author: "Apuleius", work: "Metamorphoses (The Golden Ass)", period: "c. 160–180 CE", summary: "A Latin novel containing the only ancient telling of the tale of Cupid and Psyche." },
  { slug: "plato", author: "Plato", work: "Dialogues", period: "c. 399–347 BCE", summary: "Philosophical dialogues that quote, criticise and invent myths; important for the judges of the dead, the Fates as daughters of Necessity, and Atlantis." },
];
