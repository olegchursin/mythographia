import { writeFile } from "node:fs/promises";
import { entities } from "../data";
import registry from "../data/art/character-prompts.json";

const EXPECTED_TOTAL = 323;
const REQUIRED_FIELDS = [
  "slug", "name", "kind", "subtype", "description", "accent", "pose", "attributes", "composition",
  "interpretationNotes", "masterStyle", "negativePrompt", "prompt", "outputFilename",
] as const;

type Row = (typeof registry.entries)[number];
const problems: string[] = [];
const eligible = entities.filter((entity) => ["character", "creature", "group"].includes(entity.kind));
const expected = new Map(eligible.map((entity) => [entity.slug, entity]));
const seen = new Set<string>();
const descriptions = new Set<string>();
const prompts = new Set<string>();

if (registry.entries.length !== EXPECTED_TOTAL) problems.push(`expected ${EXPECTED_TOTAL} entries, found ${registry.entries.length}`);
if (eligible.length !== EXPECTED_TOTAL) problems.push(`repository currently has ${eligible.length} eligible entities; update the registry and expected total`);

for (const entry of registry.entries) {
  if (seen.has(entry.slug)) problems.push(`duplicate slug: ${entry.slug}`);
  seen.add(entry.slug);
  if (descriptions.has(entry.description)) problems.push(`duplicate description: ${entry.slug}`);
  descriptions.add(entry.description);
  if (prompts.has(entry.prompt)) problems.push(`duplicate complete prompt: ${entry.slug}`);
  prompts.add(entry.prompt);
  const source = expected.get(entry.slug);
  if (!source) problems.push(`ineligible or unknown slug: ${entry.slug}`);
  else {
    if (entry.name !== source.name) problems.push(`name mismatch for ${entry.slug}: ${entry.name} != ${source.name}`);
    if (entry.kind !== source.kind) problems.push(`kind mismatch for ${entry.slug}`);
    if (entry.subtype !== source.subtype) problems.push(`subtype mismatch for ${entry.slug}`);
  }
  for (const field of REQUIRED_FIELDS) {
    const value = entry[field];
    if (Array.isArray(value) ? value.length === 0 : typeof value !== "string" || !value.trim()) problems.push(`missing ${field}: ${entry.slug}`);
  }
  if (!entry.prompt.includes(registry.masterStyles.MYTHOS_REALISM_V1.styleBlock)) problems.push(`prompt does not contain exact shared style: ${entry.slug}`);
  if (!entry.prompt.includes("true RGBA transparent alpha")) problems.push(`prompt lacks transparent output requirement: ${entry.slug}`);
  if (entry.masterStyle !== "MYTHOS_REALISM_V1") problems.push(`wrong masterStyle: ${entry.slug}`);
  if (entry.negativePrompt !== registry.masterStyles.MYTHOS_REALISM_V1.negativePrompt) problems.push(`negative prompt drift: ${entry.slug}`);
  if (entry.outputFilename !== `${entry.slug}.png`) problems.push(`wrong outputFilename: ${entry.slug}`);
  if (/\[[A-Z][A-Z _-]+\]|\{\{[^}]+\}\}|<[^>]+>|TODO|TBD/.test(entry.prompt)) problems.push(`unresolved placeholder: ${entry.slug}`);
}

for (const slug of expected.keys()) if (!seen.has(slug)) problems.push(`missing eligible slug: ${slug}`);

function csvCell(value: string | string[]) {
  const text = Array.isArray(value) ? JSON.stringify(value) : value;
  return `"${text.replaceAll('"', '""')}"`;
}

const columns = [...REQUIRED_FIELDS];
const lines = [
  columns.map(csvCell).join(","),
  ...registry.entries.map((entry: Row) => columns.map((column) => csvCell(entry[column])).join(",")),
];
const csv = `${lines.join("\n")}\n`;

// Parse the emitted CSV with a small RFC 4180 state machine to verify quoting,
// embedded newlines, Unicode names and the exact number of records.
function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(cell); cell = ""; }
    else if (char === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (char !== "\r") cell += char;
  }
  if (quoted) problems.push("CSV ended inside a quoted field");
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const parsed = parseCsv(csv);
if (parsed.length !== registry.entries.length + 1) problems.push(`CSV record mismatch: found ${parsed.length}`);
if (parsed.some((row) => row.length !== columns.length)) problems.push("CSV contains a row with the wrong number of columns");
for (let i = 0; i < registry.entries.length; i++) {
  if (parsed[i + 1]?.[1] !== registry.entries[i].name) problems.push(`CSV Unicode/name round-trip failed: ${registry.entries[i].slug}`);
  if (parsed[i + 1]?.[12] !== registry.entries[i].prompt) problems.push(`CSV multiline prompt round-trip failed: ${registry.entries[i].slug}`);
}

if (problems.length) {
  console.error(`Character prompt registry has ${problems.length} problem(s):\n${problems.map((problem) => `  - ${problem}`).join("\n")}`);
  process.exit(1);
}

await writeFile(new URL("../data/art/character-prompts.csv", import.meta.url), csv, "utf8");
console.log(`✓ ${registry.entries.length} character prompts validated; CSV exported`);
