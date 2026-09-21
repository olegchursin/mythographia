// Renders the PWA icon set into public/icons. Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const BG = "#0a0908";
const GOLD = "#e3c16f";

// A meander (Greek key) spiral framing a capital M; `inset` shrinks the art into the maskable safe zone.
const svg = (inset = 0) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BG}"/>
  <g transform="translate(256 256) scale(${1 - inset}) translate(-256 -256)" fill="none" stroke="${GOLD}" stroke-linecap="square" stroke-linejoin="miter">
    <path d="M60 452H452V60H60V396H396V116H116V340" stroke-width="22" stroke-opacity=".55"/>
    <path d="M186 330V190L256 274L326 190V330" stroke-width="30"/>
  </g>
</svg>`;

await mkdir("public/icons", { recursive: true });
await writeFile("public/icons/icon.svg", svg());
const out = [
  ["icon-192.png", 192, 0],
  ["icon-512.png", 512, 0],
  ["icon-maskable-512.png", 512, 0.22],
  ["apple-touch-icon.png", 180, 0.08],
];
for (const [name, size, inset] of out) {
  await sharp(Buffer.from(svg(inset))).resize(size, size).png().toFile(`public/icons/${name}`);
}
