import { entities, relationships } from "../data";
import { validateSeed } from "../data/validate";

const problems = validateSeed();
if (problems.length) {
  console.error(`✗ data/ has ${problems.length} problem(s):\n` + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${entities.length} entities, ${relationships.length} relationships — no problems`);
