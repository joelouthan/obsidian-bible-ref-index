import { ALIASES, ALIAS_MAP, BOOKS } from "./books.ts";

/** One reference. `v1` undefined = whole chapter(s). `c2`/`v2` = end of a range. */
export type Ref = {
  book: number;
  c1: number;
  v1?: number;
  c2: number;
  v2?: number;
};

const SP = "[ \\u00a0]";
const NUM = "(\\d{1,3})(?!\\d)";
const SUF = "[a-d]?"; // verse parts: Rom 3:23a
const DASH = `${SP}*[-–—]${SP}*`;
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ALT = ALIASES.map((a) => escape(a.text)).join("|");

// Book + chapter[:verse][-end]
const HEAD = new RegExp(
  `(^|[^A-Za-z0-9])(${ALT})\\.?${SP}*${NUM}(?:[:.]${NUM}${SUF})?(?:${DASH}${NUM}(?:[:.]${NUM})?${SUF})?(?![0-9])`,
  "g",
);
// ", 22" / "; 9:1" / ", 5-7" following a reference. Refuses to eat the "1" of "1 Cor".
const MORE = new RegExp(
  `${SP}*([,;])${SP}*(?:vv?\\.${SP}*)?${NUM}(?:[:.]${NUM})?${SUF}(?:${DASH}${NUM}(?:[:.]${NUM})?${SUF})?(?!${SP}*(?:st|nd|rd|th)?${SP}*[A-Z])(?![0-9])`,
  "y",
);

const MAX_VERSE = 176;

/** Remove things that are not prose: code, HTML comments and tags, link targets, URLs. */
export function cleanText(md: string): string {
  return md
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, " ")
    .replace(/`[^`\n]*`/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>\n]+>/g, " ")
    .replace(/\]\([^)\n]*\)/g, "] ")
    .replace(/https?:\/\/\S+/g, " ");
}

const n = (s: string | undefined) => (s === undefined ? undefined : parseInt(s, 10));

function valid(r: Ref): Ref | null {
  const max = BOOKS[r.book].chapters;
  if (r.c1 < 1 || r.c1 > max) return null;
  if (r.v1 !== undefined && (r.v1 < 1 || r.v1 > MAX_VERSE)) return null;
  // Drop a nonsensical range end, keep the start.
  const badEnd =
    r.c2 > max ||
    r.c2 < r.c1 ||
    (r.v2 !== undefined && (r.v2 < 1 || r.v2 > MAX_VERSE)) ||
    (r.c2 === r.c1 && r.v1 !== undefined && r.v2 !== undefined && r.v2 <= r.v1) ||
    (r.c2 === r.c1 && r.v1 === undefined && r.v2 !== undefined);
  if (badEnd) return { book: r.book, c1: r.c1, v1: r.v1, c2: r.c1 };
  return r;
}

export function parseRefs(md: string): Ref[] {
  const text = cleanText(md);
  const out: Ref[] = [];
  HEAD.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = HEAD.exec(text))) {
    const alias = ALIAS_MAP.get(m[2])!; // m[1] = the char before the book (no lookbehind: unsupported on older iOS)
    const book = alias.book;
    const oneChapter = BOOKS[book].chapters === 1;
    let [a, b, c, d] = [n(m[3])!, n(m[4]), n(m[5]), n(m[6])];

    // Abbreviations need chapter:verse ("Is 3" is too ambiguous); single-chapter books are verse-only anyway.
    if (b === undefined && !alias.full && !oneChapter) continue;

    let ref: Ref;
    let mode: "verse" | "chapter";
    if (b !== undefined) {
      ref = c === undefined ? { book, c1: a, v1: b, c2: a } : d !== undefined ? { book, c1: a, v1: b, c2: c, v2: d } : { book, c1: a, v1: b, c2: a, v2: c };
      mode = "verse";
    } else if (oneChapter) {
      ref = { book, c1: 1, v1: a, c2: 1, v2: c };
      mode = "verse";
    } else {
      ref = { book, c1: a, c2: c ?? a, v2: d };
      mode = "chapter";
    }
    let r = valid(ref);
    if (!r) continue;
    out.push(r);
    let chapter = r.c2;

    // Continuations: "John 3:16-18, 22" / "Romans 8:28; 9:1" / "Psalms 1, 2"
    MORE.lastIndex = HEAD.lastIndex;
    let k: RegExpExecArray | null;
    while ((k = MORE.exec(text))) {
      const sep = k[1];
      [a, b, c, d] = [n(k[2])!, n(k[3]), n(k[4]), n(k[5])];
      if (b !== undefined) {
        ref = c === undefined ? { book, c1: a, v1: b, c2: a } : d !== undefined ? { book, c1: a, v1: b, c2: c, v2: d } : { book, c1: a, v1: b, c2: a, v2: c };
        mode = "verse";
      } else if (oneChapter || (mode === "verse" && sep === ",")) {
        ref = d !== undefined ? { book, c1: chapter, v1: a, c2: c!, v2: d } : { book, c1: chapter, v1: a, c2: chapter, v2: c };
      } else {
        if (!alias.full) break; // "Rom 8:28; 9" — stay strict for abbreviations
        ref = { book, c1: a, c2: c ?? a, v2: d };
        mode = "chapter";
      }
      r = valid(ref);
      if (!r) break;
      out.push(r);
      chapter = r.c2;
      HEAD.lastIndex = MORE.lastIndex;
    }
  }
  return out;
}

/** "22", "22–23", "22:1", "22:1–14", "1:1–2:3" */
export function label(r: Ref): string {
  if (r.v1 === undefined) {
    if (r.c2 === r.c1) return `${r.c1}`;
    return r.v2 === undefined ? `${r.c1}–${r.c2}` : `${r.c1}–${r.c2}:${r.v2}`;
  }
  if (r.v2 === undefined) return `${r.c1}:${r.v1}`;
  return r.c2 === r.c1 ? `${r.c1}:${r.v1}–${r.v2}` : `${r.c1}:${r.v1}–${r.c2}:${r.v2}`;
}

export function compareRefs(x: Ref, y: Ref): number {
  return x.book - y.book || x.c1 - y.c1 || (x.v1 ?? 0) - (y.v1 ?? 0) || x.c2 - y.c2 || (x.v2 ?? 0) - (y.v2 ?? 0);
}
