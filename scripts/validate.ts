import { entities, relationships } from "../data";
import { overlays } from "../data/i18n";
import { validateOverlay, validateSeed } from "../data/validate";

const problems = [...validateSeed(), ...Object.entries(overlays).flatMap(([locale, o]) => (o ? validateOverlay(locale, o) : []))];
if (problems.length) {
  console.error(`✗ data/ has ${problems.length} problem(s):\n` + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${entities.length} entities, ${relationships.length} relationships and ${Object.keys(overlays).length} translation(s) — no problems`);
