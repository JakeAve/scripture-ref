import { distance } from "fastest-levenshtein";
import contents from "../data/contents.ts";
import bookRefs from "../data/books.ts";
import { formatRef } from "./formatRef.ts";
import type { Book, BookName, ReferenceMatch } from "../types.ts";

const booksByName = new Map(
  Object.values(bookRefs).map((b) => [b.name, b as Book]),
);

interface Verse {
  bookName: BookName;
  chapter: number;
  verse: number;
  content: string;
}

// ponytail: fixed candidate cap; make it an option if recall on long inputs suffers
const MAX_CANDIDATES = 200;

let verses: Verse[] | undefined;
let wordIndex: Map<string, Uint32Array> | undefined;

/** Builds the flat verse list and word -> verse id postings once, on first search */
function getIndex() {
  if (verses && wordIndex) return { verses, wordIndex };
  verses = [];
  const postings = new Map<string, number[]>();
  for (const bookName in contents) {
    const book = contents[bookName as BookName];
    for (let c = 0; c < book.length; c++) {
      for (let v = 0; v < book[c].length; v++) {
        const content = book[c][v];
        const id = verses.push({
          bookName: bookName as BookName,
          chapter: c + 1,
          verse: v + 1,
          content,
        }) - 1;
        for (const word of new Set(normalizeString(content).split(" "))) {
          let list = postings.get(word);
          if (!list) postings.set(word, list = []);
          list.push(id);
        }
      }
    }
  }
  wordIndex = new Map();
  for (const [word, list] of postings) {
    wordIndex.set(word, Uint32Array.from(list));
  }
  return { verses, wordIndex };
}

/** Verse ids sharing words with the input, best IDF-weighted overlap first */
function candidates(
  input: string,
  allowed: Set<string> | null,
  limit: number,
): number[] {
  const { verses, wordIndex } = getIndex();
  const hits = new Map<number, number>();
  for (const word of new Set(input.split(" "))) {
    const list = wordIndex.get(word);
    if (!list) continue;
    const idf = Math.log(verses.length / list.length);
    for (const id of list) {
      if (allowed && !allowed.has(verses[id].bookName)) continue;
      hits.set(id, (hits.get(id) ?? 0) + idf);
    }
  }
  // no word in common with anything: fall back to a full scan
  if (!hits.size) {
    return verses.flatMap((v, id) =>
      allowed && !allowed.has(v.bookName) ? [] : [id]
    );
  }
  return [...hits]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

interface Result {
  bookName: string;
  chapter: number;
  content: string;
  lev: number;
  match: string;
  score: number;
  sub: number;
  verse: number;
}

/**
 * Finds and returns references based on the provided input string.
 * It filters and ranks matches according to optional parameters such as book selection,
 * maximum results, minimum Levenshtein distance, and substring matching.
 * A word index is built on the first call; verses sharing words with the input are
 * scored, so only whole-word overlaps are found.
 *
 * @param {string} rawInput - The raw string input to search for references.
 * @param {Object} [opts={}] - Optional settings to refine the reference search.
 * @param {BookName[]} [opts.books] - A list of books to narrow the search scope.
 * @param {number} [opts.maxResults=5] - Maximum number of results to return (default: 5).
 * @param {number} [opts.minLevDist=0.9] - Minimum Levenshtein distance for matches (default: 0.9).
 * @param {number} [opts.minSubstr=5] - Minimum substring length required for matches (default: 5).
 * @param {"ot" | "nt" | "bom" | "dc" | "pgp"} [opts.volume] - Specifies the volume to search within.
 * @param {("ot" | "nt" | "bom" | "dc" | "pgp")[]} [opts.volumes] - Specifies an array of volumes to search within.
 * @returns {ReferenceMatch[]} - An array of reference matches based on the input criteria.
 */
export function findRef(
  rawInput: string,
  opts: {
    books?: BookName[];
    maxResults?: number | null;
    minLevDist?: number;
    minSubstr?: number;
    volume?: "ot" | "nt" | "bom" | "dc" | "pgp";
    volumes?: ("ot" | "nt" | "bom" | "dc" | "pgp")[];
    contents?: Record<string, string[][]>;
  } = {},
): ReferenceMatch[] {
  const {
    volume,
    volumes,
    books = [],
    maxResults = 5,
    minLevDist = 0.9,
    minSubstr = 5,
  } = opts;
  const arr: Result[] = [];
  const input = normalizeString(rawInput);
  const minLev = Math.ceil(input.length * minLevDist);
  const minSub = minSubstr;

  if (volume) {
    books?.push(...getBooks([volume]));
  }

  if (volumes?.length) {
    books?.push(...getBooks(volumes));
  }

  const allowed = books?.length ? new Set<string>(books) : null;
  const limit = maxResults === null ? Infinity : MAX_CANDIDATES;
  const { verses } = getIndex();

  for (const id of candidates(input, allowed, limit)) {
    const { bookName, chapter, verse: verseNum, content } = verses[id];
    const verse = normalizeString(content);
    const d = distance(input, verse);
    const diff = verse.length - d;

    if (diff < minLev) {
      continue;
    }

    const subStr = longestCommonSubstring(input, verse);

    if (subStr.length < minSub) {
      continue;
    }

    arr.push({
      lev: diff,
      sub: subStr.length,
      score: diff + subStr.length,
      match: subStr,
      content,
      bookName,
      chapter,
      verse: verseNum,
    });
  }

  arr.sort((a, b) => {
    return b.score - a.score;
  });

  const results = arr.slice(0, maxResults === null ? undefined : maxResults);

  return results.map(({ bookName, chapter, content, match, verse }) => {
    const book = booksByName.get(bookName) as Book;
    const verses = [verse];

    const reference = formatRef({
      book,
      chapter,
      verses,
    });

    return {
      ...reference,
      content,
      match,
    };
  });
}

// Two reusable rows instead of an (m+1)x(n+1) matrix per verse
let prev = new Uint16Array(0);
let cur = new Uint16Array(0);

function longestCommonSubstring(input: string, verse: string) {
  const m = input.length, n = verse.length;
  if (prev.length < n + 1) {
    prev = new Uint16Array(n + 1);
    cur = new Uint16Array(n + 1);
  } else {
    prev.fill(0);
  }
  let maxLength = 0, endIndex = 0;

  for (let i = 1; i <= m; i++) {
    const ch = input.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const len = ch === verse.charCodeAt(j - 1) ? prev[j - 1] + 1 : 0;
      cur[j] = len;
      if (len > maxLength) {
        maxLength = len;
        endIndex = i;
      }
    }
    [prev, cur] = [cur, prev];
  }
  return input.substring(endIndex - maxLength, endIndex);
}

function normalizeString(str: string): string {
  return str.replace(/\s+/g, " ").replace(/\p{P}/gu, "").toUpperCase();
}

function getBooks(volumes: ("ot" | "nt" | "bom" | "dc" | "pgp")[]) {
  const books: BookName[] = [];

  if (volumes.includes("ot")) {
    books.push(
      "Genesis",
      "Exodus",
      "Leviticus",
      "Numbers",
      "Deuteronomy",
      "Joshua",
      "Judges",
      "Ruth",
      "1 Samuel",
      "2 Samuel",
      "1 Kings",
      "2 Kings",
      "1 Chronicles",
      "2 Chronicles",
      "Ezra",
      "Nehemiah",
      "Esther",
      "Job",
      "Psalms",
      "Proverbs",
      "Ecclesiastes",
      "Song of Solomon",
      "Isaiah",
      "Jeremiah",
      "Lamentations",
      "Ezekiel",
      "Daniel",
      "Hosea",
      "Joel",
      "Amos",
      "Obadiah",
      "Jonah",
      "Micah",
      "Nahum",
      "Habakkuk",
      "Zephaniah",
      "Haggai",
      "Zechariah",
      "Malachi",
    );
  }
  if (volumes.includes("nt")) {
    books.push(
      "Matthew",
      "Mark",
      "Luke",
      "John",
      "Acts",
      "Romans",
      "1 Corinthians",
      "2 Corinthians",
      "Galatians",
      "Ephesians",
      "Philippians",
      "Colossians",
      "1 Thessalonians",
      "2 Thessalonians",
      "1 Timothy",
      "2 Timothy",
      "Titus",
      "Philemon",
      "Hebrews",
      "James",
      "1 Peter",
      "2 Peter",
      "1 John",
      "2 John",
      "3 John",
      "Jude",
      "Revelation",
    );
  }
  if (volumes.includes("bom")) {
    books.push(
      "1 Nephi",
      "2 Nephi",
      "Jacob",
      "Enos",
      "Jarom",
      "Omni",
      "Words of Mormon",
      "Mosiah",
      "Alma",
      "Helaman",
      "3 Nephi",
      "4 Nephi",
      "Mormon",
      "Ether",
      "Moroni",
    );
  }
  if (volumes.includes("dc")) {
    books.push("Doctrine and Covenants");
  }
  if (volumes.includes("pgp")) {
    books.push(
      "Moses",
      "Abraham",
      "Joseph Smith—Matthew",
      "Joseph Smith—History",
      "Articles of Faith",
    );
  }

  return books;
}
