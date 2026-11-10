import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRefs, label } from "../src/parse.ts";
import { BOOKS } from "../src/books.ts";
import { relLink, summaryOrder, pageTitle, chapterRanges, buildIndex } from "../src/build.ts";

const refs = (s: string) => parseRefs(s).map((r) => `${BOOKS[r.book].name} ${label(r)}`);

test("full names, abbreviations, ranges", () => {
  assert.deepEqual(refs("See Romans 8:28 and Rom. 3:23a, then 1 Cor. 2:9."), ["Romans 8:28", "Romans 3:23", "1 Corinthians 2:9"]);
  assert.deepEqual(refs("Genesis 22:1-14 and Gen 1:1–2:3"), ["Genesis 22:1–14", "Genesis 1:1–2:3"]);
  assert.deepEqual(refs("Mt. 5:3 Jn. 3:16 Ps. 23:1 Is. 53:5 Matt. 5.3"), ["Matthew 5:3", "John 3:16", "Psalms 23:1", "Isaiah 53:5", "Matthew 5:3"]);
});

test("numbered books", () => {
  assert.deepEqual(refs("1 John 4:8, I John 1:9, 2 Tim 3:16, First Corinthians 13"), ["1 John 4:8", "1 John 1:9", "2 Timothy 3:16", "1 Corinthians 13"]);
  assert.deepEqual(refs("John 3:16"), ["John 3:16"]);
});

test("continuations", () => {
  assert.deepEqual(refs("John 3:16-18, 22"), ["John 3:16–18", "John 3:22"]);
  assert.deepEqual(refs("Romans 8:28; 9:1, 5"), ["Romans 8:28", "Romans 9:1", "Romans 9:5"]);
  assert.deepEqual(refs("Romans 8:28, 1 Corinthians 2:9"), ["Romans 8:28", "1 Corinthians 2:9"]);
  assert.deepEqual(refs("Psalms 1, 2; 23"), ["Psalms 1", "Psalms 2", "Psalms 23"]);
});

test("whole chapters only for full names", () => {
  assert.deepEqual(refs("Psalm 23 and Genesis 1-11"), ["Psalms 23", "Genesis 1–11"]);
  assert.deepEqual(refs("Is 3 Ex 4 Am 5"), []);
  assert.deepEqual(refs(">Genesis 22 \n><sup>1</sup> After these things"), ["Genesis 22"]);
});

test("single-chapter books and validation", () => {
  assert.deepEqual(refs("Jude 3 and Jude 24-25 and Philemon 1:6"), ["Jude 1:3", "Jude 1:24–25", "Philemon 1:6"]);
  assert.deepEqual(refs("Genesis 51:1 Psalm 200 Romans 2017"), []);
});

test("ignores code, tags, links, comments", () => {
  assert.deepEqual(refs("`John 3:16` <!-- Rom 8:1 --> [x](../romans/Romans 8:1) <img alt=\"John 1:1\">"), []);
  assert.deepEqual(refs("[Romans 8](../romans/romans08.md)"), ["Romans 8"]);
});

test("helpers", () => {
  assert.equal(relLink("Theologicus/scripture-index.md", "Theologicus/genesis/genesis22.md"), "genesis/genesis22.md");
  assert.equal(relLink("Theologicus/scripture-index.md", "Theologicus/New Page (draft).md"), "New%20Page%20%28draft%29.md");
  assert.deepEqual(summaryOrder("- [A](a/b.md)\n  - [B](./c.md)\n- [Rev]()"), ["a/b.md", "c.md"]);
  assert.equal(pageTitle('<img class="x">\n\n# **Genesis 22** [The](x.md) Sacrifice\n', "g.md"), "Genesis 22 The Sacrifice");
});

test("coverage", () => {
  assert.equal(chapterRanges([1, 2, 3, 5, 7, 8]), "1\u20133, 5, 7\u20138");
  const r = buildIndex(
    [{ path: "b/a.md", content: "# A\nRuth 1:1, Ruth 2, Genesis 1-3 and Jude 3" }],
    null,
    { outputPath: "b/i.md", title: "I", headerImage: "", includeChapters: false },
  );
  assert.equal(r.chaptersCited, 3 + 2 + 1);
  assert.equal(r.chaptersTotal, 1189);
  assert.match(r.coverage, /\| Ruth \| 2\/4 \(50%\) \| 3\u20134 \|/);
  assert.match(r.coverage, /## Never cited\n\nExodus · Leviticus/);
  assert.doesNotMatch(r.markdown, /Coverage/);
  assert.match(buildIndex([], null, { outputPath: "i.md", title: "I", headerImage: "", includeChapters: true, coverageOnIndex: true }).markdown, /^## Coverage$/m);
});
