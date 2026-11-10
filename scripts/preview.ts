// Run the indexer over the real book without Obsidian. Writes to /tmp, never into the vault.
// Usage: npm run preview -- /path/to/book/src
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { buildIndex, summaryOrder } from "../src/build.ts";

const root = process.argv[2];
if (!root) throw new Error("usage: npm run preview -- /path/to/book/src");
const folder = "src";
const order = summaryOrder(readFileSync(join(root, "SUMMARY.md"), "utf8")).map((p) => `${folder}/${p}`);
const listed = new Set(order);
const pages = (readdirSync(root, { recursive: true }) as string[])
  .filter((p) => p.endsWith(".md"))
  .map((p) => `${folder}/${p}`)
  .filter((p) => listed.has(p) && !p.endsWith("/CHANGELOG.md") && p !== `${folder}/scripture-index.md`)
  .map((p) => ({ path: p, content: readFileSync(join(root, relative(folder, p)), "utf8") }));

for (const includeChapters of [true, false]) {
  const r = buildIndex(pages, order, { outputPath: `${folder}/scripture-index.md`, title: "Scripture Index", headerImage: "", includeChapters });
  const out = `/tmp/scripture-index${includeChapters ? "" : "-verses-only"}.md`;
  writeFileSync(out, r.markdown);
  if (includeChapters) writeFileSync("/tmp/scripture-coverage.md", r.coverage);
  console.log(`${out}: ${r.refs} refs, ${r.passages} passages, ${r.pages} pages, ${(r.markdown.length / 1024).toFixed(0)} KB, ${r.chaptersCited}/${r.chaptersTotal} chapters cited`);
}
