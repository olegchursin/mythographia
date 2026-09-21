import { mkdir, writeFile } from "node:fs/promises";
import { entities } from "../data";

const STYLE_ID = "MYTHOS_REALISM_V1";
const STYLE_BLOCK = `Render in a consistent dark mythological realism aesthetic: premium cinematic Greek mythology character and creature design, photorealistic fantasy CGI, physically believable anatomy and materials, imposing ancient presence, majestic but dangerous, grounded realism with restrained supernatural elements. Use extremely detailed PBR materials and realistic micro-textures: pores, wrinkles, scars and natural imperfections in skin; individually resolved fur and hair; organic feathers, scales, horn and bone; hand-forged metal with scratches, oxidation, hammer marks, dents and age; thick, worn, hand-crafted leather. Use a restrained ancient Mediterranean palette dominated by charcoal, obsidian, iron gray, weathered bronze, ancient gold, dark brown and bone ivory, with the specified accent occupying less than fifteen percent of the subject. Illuminate with dark-to-neutral cinematic studio key light, warm amber-bronze rim light, deep detailed shadows, strong silhouette separation, realistic specular reflections and restrained internal illumination without excessive bloom. Use premium character-photography optics near an 85 mm equivalent perspective, a subtle low angle where appropriate, sharp facial or defining-feature detail, controlled depth of field, global illumination, ray-traced reflections, realistic subsurface scattering and displacement-level surface detail. Premium AAA game cinematic character quality with 8K-quality source detail.`;

const NEGATIVE_PROMPT = `cartoon, anime, comic-book art, children's fantasy, superhero styling, pin-up styling, plastic CGI, clean factory-made materials, modern clothing, modern weapons, sci-fi technology, excessive neon, excessive bloom, fantasy fog, scenery, environment, landscape, architecture, floor, ground plane, pedestal, gradient, halo, checkerboard pattern, cropped body, cropped limbs, cropped wings, cropped horns, cropped tail, cropped weapon, duplicate subject, accidental extra limbs, malformed anatomy, illegible silhouette, text, typography, border, frame, watermark, logo`;

type Eligible = (typeof entities)[number];

const signature: Record<string, string> = {
  chaos: "an androgynous humanoid boundary formed from a dark primeval rift, drifting mineral fragments and sparse star-like matter; avoid presenting Chaos as a modern space nebula",
  gaia: "a monumental mature woman whose weathered olive skin subtly becomes strata, roots and living earth, with an archaic stone-and-bronze mantle",
  uranus: "a colossal mature sky father with wind-swept silver hair, cloud-dark skin and a celestial bronze mantle curved like the vault of heaven",
  tartarus: "a severe masculine personification of the cosmic abyss, black volcanic skin split by dim ember fissures, bound in ancient bronze gate motifs",
  eros: "an idealized adult winged god, athletic rather than childlike, with weathered gold bow and arrows and anatomically credible pale wings",
  nyx: "a majestic mature goddess in layered black drapery that dissolves into a sparse field of stars, with vast raven-dark wings",
  chronos: "an ageless Orphic primordial with a serpentine lower body coiling around a cosmic egg, weathered male face and subtle time-ring motifs; clearly distinct from Cronus and carrying no sickle",
  phanes: "an androgynous radiant first-born deity emerging from a cracked cosmic egg, with golden wings, a serpent coil and restrained animal-head motifs drawn from Orphic imagery",
  cronus: "a grim mature Titan king in archaic bronze armor, gripping an adamantine harvest sickle, with no clock, hourglass or serpentine cosmic-egg imagery",
  atlas: "a colossal scarred Titan kneeling under the physical weight of a bronze-rimmed celestial sphere held across his shoulders",
  prometheus: "a powerful weathered Titan with broken chains, a concealed ember of stolen fire cupped in one hand and an expression of defiant intelligence",
  zeus: "a towering mature bearded king in storm-dark drapery and weathered bronze armor, raising a physically convincing forked thunderbolt",
  hera: "a commanding mature queen in layered ivory robes, a hammered gold polos crown and peacock-eye ornaments, holding a royal scepter",
  poseidon: "a broad, sea-weathered mature god with wet dark hair, oxidized bronze scale armor and a massive three-pronged trident",
  athena: "a tall athletic warrior goddess in weathered bronze armor and crested helmet, carrying spear and round aegis shield with restrained Gorgon imagery and owl details",
  apollo: "a radiant athletic young adult god with believable golden curls, laurel crown, refined bow and lyre, dressed in ivory-and-gold Greek drapery",
  artemis: "a lean athletic adult huntress with tied-back dark hair, practical short hunting chiton, worn leather bracers, silver bow, quiver and a small crescent ornament",
  ares: "a scarred, heavily muscular war god in battle-damaged dark bronze cuirass and Corinthian helmet, carrying a long spear and battered round shield",
  aphrodite: "an idealized adult Mediterranean goddess with flowing dark-gold hair, dignified ivory drapery, ancient jewelry and restrained sea-foam and shell motifs",
  hephaestus: "a powerfully built mature smith god with a visible leg impairment, soot-marked skin, leather forge apron, bronze bracing and an enormous hand-worn hammer",
  hermes: "a lean athletic young adult messenger in a traveler's chlamys, winged ancient sandals, broad-brimmed petasos and serpent-entwined herald's staff",
  demeter: "a strong mature grain goddess in heavy earth-toned robes, holding sheaves of wheat and a bronze torch, with a grave maternal expression",
  hestia: "a composed mature goddess in modest layered robes, sheltering a small smokeless sacred flame in a weathered bronze brazier",
  dionysus: "an androgynously beautiful adult god with dark curls, leopard skin over deep wine robes, ivy-wrapped thyrsus and an unsettling ecstatic calm",
  hades: "a severe mature underworld king in blackened bronze armor and dark royal robes, holding a two-pronged bident and wearing the shadowy helm of invisibility",
  persephone: "a mature underworld queen in charcoal royal drapery, holding a split pomegranate, with living spring growth on one side and chthonic bronze on the other",
  hecate: "a three-formed adult goddess with three distinct faces oriented outward, carrying paired torches, keys and a ritual dagger; keep the joined anatomy solemn and believable",
  pan: "a rugged adult rustic god with a muscular human torso, goat hindquarters, cloven hooves, curled horns, weathered fur and reed pipes",
  charon: "an ancient gaunt ferryman with deeply lined skin, dark hooded wool, a long punt pole and a single worn obol held between bony fingers",
  thanatos: "a solemn adult winged personification of peaceful death in black archaic armor, carrying an inverted extinguished torch rather than a scythe",
  hypnos: "a serene youthful adult sleep god with small dark wings at his temples, a poppy stem and soft charcoal drapery",
  morpheus: "an elegant dream spirit whose adult human form subtly fragments into convincing alternate faces and feathered shadow shapes",
  nike: "an athletic adult winged goddess in wind-driven Greek drapery, landing with a bronze victory wreath held forward",
  calliope: "a dignified adult Muse with writing tablet and stylus, wearing richly folded but historically inspired robes suited to epic poetry",
  thalia: "a lively adult Muse of comedy holding an ancient comic mask and shepherd's staff; clearly distinct from Thalia the Grace",
  "thalia-grace": "an elegant adult Grace of festivity with flower garland and flowing dance drapery; no theatrical mask or shepherd's staff",
  clotho: "a focused adult Fate drawing luminous life-thread from an archaic spindle",
  lachesis: "a mature Fate measuring luminous life-thread against a carved bronze rod",
  atropos: "an elderly formidable Fate closing weathered bronze shears around a taut luminous life-thread",
  amalthea: "a nurturing adult nymph with subtle caprine horns, pastoral Cretan garments and a cornucopia; preserve the repository's nymph interpretation while acknowledging the goat tradition",
  heracles: "an exceptionally muscular mature hero with lion-skin cloak, olive-wood club, bow and battered bronze gear, showing labor-worn scars rather than superhero polish",
  perseus: "an athletic young hero in practical bronze armor, winged sandals and the helm of invisibility, holding a curved harpe and a closed reflective shield; keep Medusa's head contained in a worn leather kibisis",
  theseus: "a lean mature Athenian hero with short sword, worn bronze armor and a coil of crimson thread, posed as an alert labyrinth fighter",
  jason: "a charismatic but weathered young captain in seafaring Greek armor and cloak, one hand on a spear and a small fold of golden fleece at his shoulder",
  achilles: "a physically exceptional young Myrmidon warrior with long sun-gold hair, magnificent battle-worn bronze armor, round shield and spear, poised for explosive movement",
  odysseus: "a compact, battle-worn mature warrior with intelligent watchful eyes, salt-dark curls, travel cloak, bow and practical scarred bronze equipment",
  argus: "a muscular adult shipwright and Argonaut with a practical linen tunic, worn leather apron, bronze woodworking tools, timber dust and subtle nautical fittings; give him two normal eyes and no all-seeing motifs",
  atalanta: "an elite adult huntress with a powerful runner's build, practical short chiton, worn leather gear, bow and short hunting spear",
  orpheus: "a slender Thracian musician in patterned travel robes, holding an exquisitely made ancient lyre with a focused, grief-marked expression",
  oedipus: "a mature Theban king in torn royal robes, using a staff, with old ankle scars and a grave face; depict him before self-blinding and show no graphic injury",
  icarus: "a late-adolescent youth wearing hand-built feather-and-wax wings strapped to a simple tunic, testing their weight with vulnerable excitement",
  narcissus: "a beautiful but naturalistic young hunter in simple Greek clothing, studying his reflection in a small polished bronze disk rather than an environmental pool",
  actaeon: "an athletic young hunter mid-transformation with branching antlers emerging from his head, human anatomy shifting subtly toward a stag and a spear slipping from his hand",
  arachne: "a gifted young Lydian weaver mid-transformation, with richly patterned textile garments and anatomically coherent spider limbs emerging behind and below her human torso",
  medea: "a formidable Colchian sorceress in eastern Greek royal dress, holding a small bronze vessel of herbs and poison while a restrained serpent motif coils through her jewelry",
  andromeda: "a courageous young Aethiopian princess with Northeast African features, wind-torn ceremonial cloth and broken bronze shackles at her wrists",
  astyanax: "a small Trojan child with dark curls and a historically inspired royal tunic, standing solemnly with a miniature horse toy; dignified and entirely nonviolent",
  medusa: "a powerful adult Gorgon with athletic human upper anatomy, living serpents in place of hair, small golden wings, bronze hands, restrained tusks and battered archaic armor; her gaze is dangerous rather than seductive",
  typhon: "a colossal storm giant with a powerful humanoid core, two immense serpentine legs and a controlled crown of many distinct serpent heads, with wings and volcanic fissures; preserve intentional multiplicity without visual clutter",
  echidna: "a formidable mature monster with a regal human female upper body transitioning anatomically into an immense speckled serpent tail, framed by subtle cave-viper spines",
  cerberus: "a colossal three-headed black hound with three distinct canine skulls, individually resolved weathered fur, a muscular shared body, a living serpent tail and restrained snakes along the back",
  orthrus: "a massive two-headed cattle hound with two distinct canine necks on one muscular body, coarse dark fur and a serpent tail",
  hydra: "an immense swamp serpent with nine clearly readable long-necked heads, one central immortal head protected by heavier bone plating, wet scales and cauterized battle scars",
  chimera: "a single anatomically coherent quadruped with lion forequarters and head, a goat head rising naturally from the back, goatlike hind anatomy and a venomous serpent for a tail",
  sphinx: "a monumental female monster with a lioness body, adult woman's head and chest, large eagle wings and archaic Egyptian-Greek jewelry, posed with patient predatory intelligence",
  "nemean-lion": "an enormous mature lion with physically credible mass, scarred invulnerable hide, broken arrows caught harmlessly in its mane and no armor",
  ladon: "a sleepless serpentine dragon with a long coiling body and many watchful heads arranged in a readable crown, guarding a single golden apple held within its coils without showing a garden",
  scylla: "a terrifying sea monster with an adult female torso above a ring of six long canine-headed necks and twelve lower tentacular limbs, all joined in physically coherent mythic anatomy",
  charybdis: "an abstract female sea-monster interpretation: a vast circular maw formed from muscular oceanic anatomy and inward-coiling fins, isolated as a self-contained vortex with no surrounding sea",
  stheno: "an immortal, heavily armored adult Gorgon with living serpent hair, powerful bronze hands, golden wings and boar tusks, visually more martial than Medusa",
  euryale: "an immortal far-roaming adult Gorgon with living serpent hair, broad golden wings, bronze hands and a terrifying open-mouthed cry suggested in her pose",
  minotaur: "a towering bull-headed male humanoid with massive but believable anatomy, scarred hide, broken labyrinth shackles, worn loincloth and a heavy Minoan bronze axe",
  polyphemus: "a colossal rugged shepherd with one anatomically centered eye, weathered skin, matted hair, crude wool clothing, a giant olive-wood staff and a ram fleece",
  talos: "a towering fully bronze guardian built as an archaic cast statue come alive, with hammered repairs, verdigris, a single sealed vein at the ankle and internal heat visible only through narrow seams",
  geryon: "a giant warrior composed of three complete armored torsos joined at the waist above one stable pair of legs, carrying three shields and spears with intentional symmetrical anatomy",
  pegasus: "a powerful white stallion with realistic equine anatomy, two enormous feathered wings rooted credibly at the shoulders and restrained divine sheen",
  chiron: "a wise mature centaur with a bearded human torso joined naturally to a strong bay horse body, carrying a physician's satchel, bow and teaching staff",
  phoenix: "a large eagle-like fire-bird with anatomically credible plumage, charred outer feathers and restrained ember light between deep crimson and gold flight feathers",
};

const creatureSignatures: Record<string, string> = {
  python: "an immense archaic serpent with mineral-dark scales, a broad draconic skull and old wounds from Apollo's arrows",
  "crommyonian-sow": "a gigantic scarred wild sow with coarse black bristles, broken tusks and mud-weathered hide",
  "calydonian-boar": "a colossal supernatural boar with dense iron-gray bristles, enormous chipped tusks and multiple old spear scars",
  "erymanthian-boar": "a massive mountain boar with frost-clumped bristles, powerful shoulders and snow-worn tusks",
  "ceryneian-hind": "a graceful doe with realistic anatomy, golden antlers, bronze hooves and a restrained moonlit sheen",
  "stymphalian-birds": "a coordinated trio of predatory marsh birds with bronze beaks, metallic flight feathers and razor-edged pinions",
  chrysaor: "a formidable adult warrior born from Medusa, wearing archaic armor and wielding a weathered golden sword; keep him humanoid rather than horse-shaped",
  cetus: "an immense serpentine sea beast with whale-like mass, armored scales, finned limbs and a cavernous toothed jaw",
  "colchian-dragon": "a vast sleepless serpent-dragon with lidless amber eyes, tree-bark scales and coils arranged around the implied space of a treasured object without scenery",
  alcyoneus: "a colossal earth-born armored giant with stone-veined skin, serpentlike lower limbs and a huge spear",
  porphyrion: "a towering king of the Giants with massive human upper anatomy, serpent legs, a cracked bronze crown and an enormous war club",
  enceladus: "a colossal armored giant with serpent legs and volcanic stone embedded in his skin, twisting as if under immense buried pressure",
  antaeus: "a gigantic Libyan wrestler with earth-stained skin, leather bindings and bare feet that visually root into compacted stone fragments",
  nessus: "a powerful dark centaur with a weathered male torso, river-worn horse body, rough bow and concealed poisoned cloth",
  arion: "an immortal black stallion with realistic anatomy, wind-tossed mane, ancient bronze tack and a subtle ocean-blue sheen",
  "cretan-bull": "a colossal white bull with realistic anatomy, scarred shoulders, gilded Minoan horn caps and restrained sea-born power",
  "golden-ram": "a strong flying ram with dense individually resolved golden fleece, anatomically credible feathered wings and weathered bronze horn ornaments",
};

const groupCounts: Record<string, number> = {
  muses: 9, horae: 3, moirai: 3, charites: 3, erinyes: 3, graeae: 3, gorgons: 3,
  pleiades: 7, harpies: 3, sirens: 3, hecatoncheires: 3, "judges-of-the-dead": 3,
};

const groupSignature: Record<string, string> = {
  olympians: "three representative Olympians—Zeus with thunderbolt, Athena with spear and aegis, and Apollo with bow and lyre—standing as a unified pantheon",
  titans: "three representative elder gods—Cronus with sickle, Rhea in maternal royal regalia, and Atlas bearing a small celestial sphere—scaled as ancient predecessors to Olympus",
  muses: "all nine distinct adult Muses in a compact layered ensemble, each carrying her historically recognizable attribute and none duplicated",
  horae: "all three Horae—Eunomia, Dike and Eirene—as distinct adult women with symbols of good order, justice and peace",
  moirai: "all three Fates in age-progressive form: Clotho spinning, Lachesis measuring and Atropos cutting one continuous luminous life-thread",
  charites: "all three adult Graces—Aglaea, Euphrosyne and Thalia—in a dignified circular dance with distinct ornaments for splendour, joy and festivity",
  erinyes: "all three severe winged Furies—Alecto, Megaera and Tisiphone—with serpent-bound hair, black archaic robes and instruments of oath-bound vengeance",
  keres: "three representative female spirits of violent death with clawed hands, dark wings, blood-marked archaic garments and distinct battlefield scavenger silhouettes",
  oneiroi: "three representative dream spirits—Morpheus with shifting human faces, Phobetor with bestial dream anatomy and Phantasos with mineral and plant-like forms—emerging as a coherent triad",
  graeae: "all three ancient gray-haired sisters arranged around the single eye and single tooth they share, with no duplicated eye in hand",
  gorgons: "all three Gorgon sisters—Medusa, Stheno and Euryale—with consistent serpent hair, bronze hands and golden wings while preserving their individual designs",
  hesperides: "three representative evening nymphs carrying a single golden apple between them, with dusk-colored drapery and no garden scenery",
  pleiades: "all seven starry sisters as distinct adult nymphs in a tight ascending formation, each marked by one subtle point of starlight",
  nereids: "three representative sea nymphs with distinct faces, practical flowing ancient drapery and restrained shell-and-bronze ornaments",
  oceanids: "three representative freshwater nymphs with distinct faces and drapery shaped by spring, cloud and river motifs",
  harpies: "three complete bird-women—Aello, Ocypete and Celaeno—with adult female heads and torsos integrated into powerful raptor bodies and wings",
  sirens: "three complete archaic bird-women singers with distinct faces, human heads and torsos integrated into predatory avian bodies; do not depict mermaids",
  satyrs: "three representative adult satyrs of different ages with horse ears and tails in the early Greek form, carrying pipes, wineskin and thyrsus",
  centaurs: "three representative adult centaurs in a compact charge, with human torsos naturally joined to varied realistic horse bodies",
  cyclopes: "three representative one-eyed giants: an archaic divine smith, a cave shepherd and a wall builder, each with one centered eye",
  hecatoncheires: "all three Hundred-Handers—Briareus, Cottus and Gyges—as colossal giants; use layered fans of many readable arms and multiple heads to imply the canonical hundred hands and fifty heads without random malformed anatomy",
  giants: "three representative earth-born Giants in archaic armor with human upper bodies and serpent legs, led by a crowned Porphyrion",
  amazons: "three representative adult Amazon warriors in historically inspired Black Sea and Greek equipment, using bow, spear and axe",
  maenads: "three representative adult devotees in fawnskins and wind-torn Greek dress, carrying ivy-tipped thyrsoi in controlled ecstatic motion",
  argonauts: "three representative heroes—Jason with spear and golden fleece, Orpheus with lyre, and Heracles with lion skin and club—composed as a seafaring company without a ship backdrop",
  achaeans: "three representative Achaean warriors—Agamemnon as commander, Achilles as spear fighter and Odysseus as watchful strategist—in coherent Mycenaean equipment",
  trojans: "three representative Trojan defenders—Priam as aged king, Hector as armored champion and Aeneas as determined survivor—in coherent Trojan visual language",
  "judges-of-the-dead": "all three judges—Minos, Rhadamanthus and Aeacus—as distinct mature or elderly kings seated or standing around one black-stone judgment tablet",
};

const ageExceptions = new Set(["astyanax"]);
const youth = new Set(["achilles", "apollo", "artemis", "ganymede", "icarus", "telemachus", "neoptolemus", "hippolytus", "hylas", "troilus"]);

function hash(value: string) {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return result >>> 0;
}

function humanForm(entity: Eligible) {
  const age = ageExceptions.has(entity.slug) ? "child" : youth.has(entity.slug) ? "young adult" : ["king", "seer"].includes(entity.subtype) ? "mature adult" : "adult";
  const person = entity.gender === "f" ? "woman" : entity.gender === "m" ? "man" : "androgynous figure";
  const role: Record<string, string> = {
    primordial: "primordial divinity", titan: "elder Titan", olympian: "Olympian deity", "underworld god": "chthonic deity",
    "rustic god": "rustic deity", god: "divinity", "sea god": "sea divinity", spirit: "personified spirit", "wind god": "wind divinity",
    "deified mortal": "deified mortal", muse: "Muse", hora: "Hora", fate: "Fate", grace: "Grace", nymph: "nymph",
    "river god": "river divinity", hero: "Greek hero", heroine: "Greek heroine", king: "ancient king", mortal: "mortal figure", queen: "ancient queen", seer: "seer",
  };
  const attire = ["hero", "king"].includes(entity.subtype)
    ? "battle-worn Mycenaean bronze, layered linen and hand-tooled leather appropriate to the figure"
    : ["mortal", "queen", "heroine", "seer"].includes(entity.subtype)
      ? "historically inspired ancient Mediterranean woven clothing, aged jewelry and practical leather details appropriate to status"
      : "archaic Greek drapery, weathered bronze fittings and tactile symbolic materials appropriate to the divine domain";
  const article = age === "adult" ? "an" : "a";
  return `${article} ${age} ${person} interpreted as a ${role[entity.subtype] ?? entity.subtype}, with physically believable anatomy, culturally grounded Mediterranean features, ${attire}`;
}

function genericCreature(entity: Eligible) {
  const shape: Record<string, string> = {
    cyclops: "a colossal one-eyed humanoid with one anatomically centered eye, scarred skin and crude ancient equipment",
    giant: "a colossal earth-born humanoid with physically believable mass, weathered skin and damaged archaic armor",
    centaur: "an adult human torso joined naturally to a powerful realistic horse body, with era-appropriate weapons and tack",
    creature: "a supernatural animal with physically credible anatomy, tactile hide or plumage and restrained divine ornament",
    monster: "a mature mythic monster with coherent hybrid anatomy, tactile organic materials and a strong readable silhouette",
  };
  return shape[entity.subtype] ?? shape.monster;
}

function domainText(entity: Eligible) {
  return entity.domains?.length ? ` Subtly embody ${entity.domains.join(", ")} through the regalia, surface motifs and expression.` : "";
}

function attributes(entity: Eligible) {
  const result = [entity.epithet];
  if (entity.domains) result.push(...entity.domains);
  const cue = (signature[entity.slug] ?? creatureSignatures[entity.slug])?.split(/[;,]/)[0];
  if (cue) result.push(cue.trim());
  return [...new Set(result)].slice(0, 6);
}

const accents = [
  "burnished gold", "deep turquoise", "ember red", "moon silver", "storm blue-white", "poisonous emerald",
  "cold violet", "blood crimson", "sea-glass blue", "honey amber", "iron blue", "wine purple", "bone white", "laurel green",
];

function accentFor(entity: Eligible) {
  const words = `${entity.slug} ${(entity.domains ?? []).join(" ")} ${entity.epithet}`.toLowerCase();
  if (/sea|ocean|river|spring|water|wave/.test(words)) return "deep turquoise";
  if (/sun|bright|light|dawn|gold/.test(words)) return "solar gold";
  if (/moon|night|star|dream|sleep/.test(words)) return "moon silver";
  if (/death|underworld|doom|abyss/.test(words)) return "ember violet";
  if (/war|blood|strife|fear|force/.test(words)) return "deep crimson";
  if (/earth|grain|harvest|wild|hunt|forest/.test(words)) return "muted laurel green";
  return accents[hash(entity.slug) % accents.length];
}

const poses = [
  "advancing one measured step in a powerful three-quarter view",
  "turning toward the viewer in a controlled moment of action",
  "braced in a wide, balanced three-quarter stance",
  "caught at the beginning of a deliberate gesture associated with the figure's myth",
  "holding a tense but readable diagonal silhouette with realistic weight distribution",
  "standing with restrained authority as garments, hair or extremities carry the motion",
];

function poseFor(entity: Eligible) {
  const special: Record<string, string> = {
    astyanax: "standing calmly in a natural child's posture, holding the toy close and looking slightly toward the viewer",
    atlas: "kneeling under immense weight with one foot planted, spine and shoulders visibly bearing the celestial sphere",
    chaos: "unfolding upward as a self-contained rift with a legible humanoid boundary and no environment",
    charybdis: "curling inward as a self-contained suspended vortex, with the circular maw and fins forming one readable silhouette",
    hydra: "coiling low with all nine necks separated into a readable crown and no head hidden behind another",
    scylla: "twisting through a controlled swimming motion with all six canine heads and twelve lower limbs readable",
    typhon: "rearing in a wide low-angle composition while the serpent heads fan outward without tangling",
    hecatoncheires: "forming a stable triangular ensemble while the intentional arrays of heads and arms remain ordered and readable",
  };
  if (special[entity.slug]) return special[entity.slug];
  if (entity.kind === "group") return "arranged in a compact, layered three-quarter ensemble with every represented member fully visible and no floating portrait heads";
  if (entity.kind === "creature") return "moving with grounded animal weight in a wide three-quarter view, head and defining anatomy turned clearly toward the viewer";
  return poses[hash(entity.slug) % poses.length];
}

function groupComposition(entity: Eligible) {
  const count = groupCounts[entity.slug];
  if (count) return `Complete compact ensemble of all ${count} canonical members; use a wider full-body frame and keep every member and attribute inside the safe area.`;
  return "Large collective represented by exactly three distinct archetypal members; this is an editorial representative composition, not a claim that the group has only three members.";
}

function descriptionFor(entity: Eligible) {
  if (entity.kind === "group") return `Depict ${entity.name}, ${entity.epithet}, as ${groupSignature[entity.slug] ?? "three distinct representative members whose equipment and anatomy express the collective's repository description"}.`;
  const specific = signature[entity.slug] ?? creatureSignatures[entity.slug];
  if (specific) return `Depict ${entity.name}, ${entity.epithet}, as ${specific}.`;
  const form = entity.kind === "creature" ? genericCreature(entity) : humanForm(entity);
  return `Depict ${entity.name}, ${entity.epithet}, as ${form}.${domainText(entity)}`;
}

function interpretationNotes(entity: Eligible) {
  const sourceCue = (entity.summary ?? "")
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .split(/(?<=[.!?])\s/)[0]
    .trim();
  let note: string;
  if (entity.kind === "group") note = groupCounts[entity.slug]
    ? `The complete named ensemble is shown because the repository presents a stable group of ${groupCounts[entity.slug]}; individual designs must remain consistent with their entries.`
    : "The repository describes a collective larger than a practical thumbnail ensemble, so three members represent the group without implying a canonical total.";
  else if (entity.slug === "chronos") note = "Use the Orphic personification of Time. Do not conflate him with the sickle-bearing Titan Cronus.";
  else if (entity.slug === "cronus") note = "Use the Titan king and harvest association. Do not add clocks, hourglasses or the serpentine body of Orphic Chronos.";
  else if (entity.slug === "thalia") note = "This is the Muse of comedy, identified by the comic mask.";
  else if (entity.slug === "thalia-grace") note = "This is the Grace of festivity, identified by dance and garland rather than theatrical attributes.";
  else if (["chaos", "tartarus", "charybdis"].includes(entity.slug)) note = "No single canonical humanoid appearance exists; this is an isolated personification designed to remain legible as encyclopedia character art.";
  else if (entity.slug === "amalthea") note = "Sources alternate between a goat and a nymph; the registry follows the repository's nymph classification while preserving subtle caprine cues.";
  else note = "Visual interpretation follows the repository subtype, epithet and domains; symbolic elements remain secondary to a readable full-body silhouette.";
  return sourceCue ? `${note} Repository basis: ${sourceCue}` : note;
}

function composePrompt(entry: {
  name: string; description: string; accent: string; pose: string; attributes: string[]; composition: string; interpretationNotes: string;
}) {
  return `Create a full-body isolated character portrait of ${entry.name} from Greek mythology.\n\nCharacter design: ${entry.description}\nRecognizable attributes: ${entry.attributes.join("; ")}.\nIdentity guidance: ${entry.interpretationNotes}\nPose: ${entry.pose}.\nComposition: ${entry.composition}\nControlled supernatural accent: ${entry.accent}; keep it below fifteen percent of the subject.\n\n${STYLE_BLOCK}\n\nOutput requirement: 2048 × 2048 square PNG with true RGBA transparent alpha. Keep the entire subject inside an approximately ninety-percent safe area. Do not crop feet, hands, weapons, wings, horns, tails, heads or accessories. Isolate the subject completely: no scenery, environment, floor, ground shadow, pedestal, landscape, smoke backdrop, gradient, halo or checkerboard pattern. No text, typography, border, frame, watermark or logo.\n\nNegative prompt (avoid only unintended features; preserve all canonical heads, limbs, wings and hybrid anatomy specified above): ${NEGATIVE_PROMPT}.`;
}

const eligible = entities.filter((entity) => ["character", "creature", "group"].includes(entity.kind));
const entries = eligible.map((entity) => {
  const description = descriptionFor(entity);
  const accent = accentFor(entity);
  const pose = poseFor(entity);
  const attrs = attributes(entity);
  const composition = entity.kind === "group"
    ? groupComposition(entity)
    : "One complete isolated subject occupying roughly eighty to ninety percent of the square canvas, with every extremity and attribute visible; use wider framing for broad or multi-part anatomy.";
  const notes = interpretationNotes(entity);
  return {
    slug: entity.slug,
    name: entity.name,
    kind: entity.kind,
    subtype: entity.subtype,
    description,
    accent,
    pose,
    attributes: attrs,
    composition,
    interpretationNotes: notes,
    masterStyle: STYLE_ID,
    negativePrompt: NEGATIVE_PROMPT,
    prompt: composePrompt({ name: entity.name, description, accent, pose, attributes: attrs, composition, interpretationNotes: notes }),
    outputFilename: `${entity.slug}.png`,
  };
});

const registry = {
  schemaVersion: 1,
  masterStyles: {
    [STYLE_ID]: {
      label: "Mythographia dark mythological realism",
      styleBlock: STYLE_BLOCK,
      negativePrompt: NEGATIVE_PROMPT,
    },
  },
  outputSettings: {
    width: 2048,
    height: 2048,
    format: "PNG",
    colorMode: "RGBA",
    transparentAlpha: true,
    safeAreaPercent: 90,
    note: "Dimensions and transparency are output requirements and must be enforced by the generation/export pipeline; prompt wording alone cannot guarantee them.",
  },
  entries,
};

await mkdir(new URL("../data/art/", import.meta.url), { recursive: true });
await writeFile(new URL("../data/art/character-prompts.json", import.meta.url), `${JSON.stringify(registry, null, 2)}\n`, "utf8");
console.log(`Generated ${entries.length} prompts in data/art/character-prompts.json`);
