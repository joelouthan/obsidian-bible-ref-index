// The 66 books in canonical order.
// `full` names may stand alone with just a chapter ("Psalm 23").
// `abbr` forms must be followed by chapter:verse ("Ps. 23:1"), which keeps short
// abbreviations like "Is", "Am", "Ex" from matching ordinary words.
// Numbered books are written with a leading "1 ", "2 ", "3 ". Variants such as
// "1Cor", "1st Cor", "I Cor", "First Corinthians" are generated automatically.

export type Book = {
  name: string;
  chapters: number;
  full?: string[]; // extra full names besides `name`
  abbr: string[];
};

export const BOOKS: Book[] = [
  { name: "Genesis", chapters: 50, abbr: ["Gen", "Ge", "Gn"] },
  { name: "Exodus", chapters: 40, abbr: ["Exod", "Exo", "Ex"] },
  { name: "Leviticus", chapters: 27, abbr: ["Lev", "Lv"] },
  { name: "Numbers", chapters: 36, abbr: ["Num", "Nu", "Nm"] },
  { name: "Deuteronomy", chapters: 34, abbr: ["Deut", "Dt"] },
  { name: "Joshua", chapters: 24, abbr: ["Josh", "Jos"] },
  { name: "Judges", chapters: 21, abbr: ["Judg", "Jdg"] },
  { name: "Ruth", chapters: 4, abbr: ["Ru", "Rth"] },
  { name: "1 Samuel", chapters: 31, abbr: ["1 Sam", "1 Sa"] },
  { name: "2 Samuel", chapters: 24, abbr: ["2 Sam", "2 Sa"] },
  { name: "1 Kings", chapters: 22, abbr: ["1 Kgs", "1 Ki"] },
  { name: "2 Kings", chapters: 25, abbr: ["2 Kgs", "2 Ki"] },
  { name: "1 Chronicles", chapters: 29, abbr: ["1 Chron", "1 Chr", "1 Ch"] },
  { name: "2 Chronicles", chapters: 36, abbr: ["2 Chron", "2 Chr", "2 Ch"] },
  { name: "Ezra", chapters: 10, abbr: ["Ezr"] },
  { name: "Nehemiah", chapters: 13, abbr: ["Neh"] },
  { name: "Esther", chapters: 10, abbr: ["Esth", "Est"] },
  { name: "Job", chapters: 42, abbr: ["Jb"] },
  { name: "Psalms", chapters: 150, full: ["Psalm"], abbr: ["Pss", "Psa", "Ps"] },
  { name: "Proverbs", chapters: 31, abbr: ["Prov", "Prv", "Pro", "Pr"] },
  { name: "Ecclesiastes", chapters: 12, abbr: ["Eccles", "Eccl", "Ecc", "Qoh"] },
  { name: "Song of Solomon", chapters: 8, full: ["Song of Songs"], abbr: ["Song", "Sg"] },
  { name: "Isaiah", chapters: 66, abbr: ["Isa", "Is"] },
  { name: "Jeremiah", chapters: 52, abbr: ["Jer"] },
  { name: "Lamentations", chapters: 5, abbr: ["Lam"] },
  { name: "Ezekiel", chapters: 48, abbr: ["Ezek", "Eze", "Ezk"] },
  { name: "Daniel", chapters: 12, abbr: ["Dan", "Dn"] },
  { name: "Hosea", chapters: 14, abbr: ["Hos"] },
  { name: "Joel", chapters: 3, abbr: ["Jl"] },
  { name: "Amos", chapters: 9, abbr: ["Am"] },
  { name: "Obadiah", chapters: 1, abbr: ["Obad", "Ob"] },
  { name: "Jonah", chapters: 4, abbr: ["Jon", "Jnh"] },
  { name: "Micah", chapters: 7, abbr: ["Mic"] },
  { name: "Nahum", chapters: 3, abbr: ["Nah"] },
  { name: "Habakkuk", chapters: 3, abbr: ["Hab"] },
  { name: "Zephaniah", chapters: 3, abbr: ["Zeph", "Zep"] },
  { name: "Haggai", chapters: 2, abbr: ["Hag"] },
  { name: "Zechariah", chapters: 14, abbr: ["Zech", "Zec"] },
  { name: "Malachi", chapters: 4, abbr: ["Mal"] },
  { name: "Matthew", chapters: 28, abbr: ["Matt", "Mt"] },
  { name: "Mark", chapters: 16, abbr: ["Mrk", "Mk"] },
  { name: "Luke", chapters: 24, abbr: ["Luk", "Lk"] },
  { name: "John", chapters: 21, abbr: ["Jhn", "Jn"] },
  { name: "Acts", chapters: 28, abbr: ["Ac"] },
  { name: "Romans", chapters: 16, abbr: ["Rom", "Ro", "Rm"] },
  { name: "1 Corinthians", chapters: 16, abbr: ["1 Cor", "1 Co"] },
  { name: "2 Corinthians", chapters: 13, abbr: ["2 Cor", "2 Co"] },
  { name: "Galatians", chapters: 6, abbr: ["Gal"] },
  { name: "Ephesians", chapters: 6, abbr: ["Eph"] },
  { name: "Philippians", chapters: 4, abbr: ["Phil", "Php"] },
  { name: "Colossians", chapters: 4, abbr: ["Col"] },
  { name: "1 Thessalonians", chapters: 5, abbr: ["1 Thess", "1 Thes", "1 Th"] },
  { name: "2 Thessalonians", chapters: 3, abbr: ["2 Thess", "2 Thes", "2 Th"] },
  { name: "1 Timothy", chapters: 6, abbr: ["1 Tim", "1 Ti"] },
  { name: "2 Timothy", chapters: 4, abbr: ["2 Tim", "2 Ti"] },
  { name: "Titus", chapters: 3, abbr: ["Tit"] },
  { name: "Philemon", chapters: 1, abbr: ["Philem", "Phlm", "Phm"] },
  { name: "Hebrews", chapters: 13, abbr: ["Heb"] },
  { name: "James", chapters: 5, abbr: ["Jas", "Jm"] },
  { name: "1 Peter", chapters: 5, abbr: ["1 Pet", "1 Pe", "1 Pt"] },
  { name: "2 Peter", chapters: 3, abbr: ["2 Pet", "2 Pe", "2 Pt"] },
  { name: "1 John", chapters: 5, abbr: ["1 Jn", "1 Jhn"] },
  { name: "2 John", chapters: 1, abbr: ["2 Jn", "2 Jhn"] },
  { name: "3 John", chapters: 1, abbr: ["3 Jn", "3 Jhn"] },
  { name: "Jude", chapters: 1, abbr: ["Jud"] },
  { name: "Revelation", chapters: 22, full: ["Revelations"], abbr: ["Rev", "Re", "Rv"] },
];

const PREFIXES: Record<string, string[]> = {
  "1": ["1 ", "1", "1st ", "I ", "First "],
  "2": ["2 ", "2", "2nd ", "II ", "Second "],
  "3": ["3 ", "3", "3rd ", "III ", "Third "],
};

function expand(form: string): string[] {
  const m = /^([123]) (.+)$/.exec(form);
  if (!m) return [form];
  return PREFIXES[m[1]].map((p) => p + m[2]);
}

export type Alias = { text: string; book: number; full: boolean };

/** Every spelling of every book, longest first so the regex prefers "1 John" over "John". */
export const ALIASES: Alias[] = BOOKS.flatMap((b, i) => [
  ...[b.name, ...(b.full ?? [])].flatMap(expand).map((text) => ({ text, book: i, full: true })),
  ...b.abbr.flatMap(expand).map((text) => ({ text, book: i, full: false })),
]).sort((a, b) => b.text.length - a.text.length);

export const ALIAS_MAP = new Map(ALIASES.map((a) => [a.text, a]));
