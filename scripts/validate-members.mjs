// Checks src/data/members.ts before a PR is merged.
// Run: npm run validate
import { readFileSync, existsSync, readdirSync } from "node:fs";

// Transpile members.ts with the TypeScript compiler so we validate real data.
const ts = (await import("typescript")).default;
const src = readFileSync("src/data/members.ts", "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { rawMembers: members, TAG_OPTIONS, FACULTIES } = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

const errors = [];
const ids = new Set();
const sites = new Set();
const photos = new Set(existsSync("public/photos") ? readdirSync("public/photos") : []);
const tags = new Set(TAG_OPTIONS);
const isUrl = (u) => { try { return ["https:", "http:"].includes(new URL(u).protocol); } catch { return false; } };

for (const [i, m] of members.entries()) {
  const who = m.id || `entry #${i + 1}`;
  if (!m.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.id)) errors.push(`${who}: id must be lowercase-with-hyphens`);
  if (ids.has(m.id)) errors.push(`${who}: duplicate id`);
  ids.add(m.id);
  if (!m.name?.trim()) errors.push(`${who}: name is required`);
  if (!(m.faculty in FACULTIES)) errors.push(`${who}: faculty must be one of ${Object.keys(FACULTIES).join(", ")}`);
  if (m.building !== undefined && (typeof m.building !== "string" || m.building.length > 80))
    errors.push(`${who}: building must be one line of 80 characters or less`);
  if (typeof m.building === "string" && /[\r\n]/.test(m.building)) errors.push(`${who}: building must be one line`);
  if (m.description !== undefined && (typeof m.description !== "string" || m.description.length > 80))
    errors.push(`${who}: description must be 80 characters or less`);
  if (!isUrl(m.website)) errors.push(`${who}: website must be a full http(s) URL`);
  const site = m.website?.replace(/\/$/, "").toLowerCase();
  if (sites.has(site)) errors.push(`${who}: website already used by another member`);
  sites.add(site);
  for (const k of ["github", "linkedin", "twitter", "instagram"]) if (m[k] && !isUrl(m[k])) errors.push(`${who}: ${k} must be a full URL`);
  for (const t of m.tags ?? []) if (!tags.has(t)) errors.push(`${who}: unknown tag "${t}"`);
  if (m.photo) {
    const file = m.photo.replace(/^\/photos\//, "");
    if (!/\.(jpe?g|png|webp)$/i.test(file)) errors.push(`${who}: photo must be .jpg, .png or .webp`);
    if (!m.photo.startsWith("/photos/") || !photos.has(file)) errors.push(`${who}: photo ${m.photo} not found in public/photos (check filename case)`);
  }
}
for (const f of photos) if (f !== ".gitkeep" && !/\.(jpe?g|png|webp)$/i.test(f)) errors.push(`public/photos/${f}: only .jpg, .png or .webp allowed`);
for (const m of members) for (const f of m.friends ?? []) if (!ids.has(f)) errors.push(`${m.id}: friend "${f}" is not a member`);

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  - ` + errors.join("\n  - "));
  process.exit(1);
}
console.log(`✓ ${members.length} member(s) look good`);
