import { distance } from "fastest-levenshtein";
import contents from "../data/contents.ts";
import bookRefs from "../data/books.ts";
import { formatRef } from "./formatRef.ts";
import type { Book, BookName, ReferenceMatch } from "../types.ts";

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
    maxResults?: number;
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

  let data: Partial<typeof contents> = {};

  if (volume) {
    books?.push(...getBooks([volume]));
  }

  if (volumes?.length) {
    books?.push(...getBooks(volumes));
  }

  if (books?.length) {
    for (const b of books) {
      data[b] = contents[b];
    }
  }

  if (!books?.length) {
    data = contents;
  }

  for (const b in data) {
    const book = data[b as BookName];
    if (!book) continue;
    const iLen = book.length;

    for (let i = 0; i < iLen; i++) {
      const chapter = book[i];
      const jLen = chapter.length;
      for (let j = 0; j < jLen; j++) {
        const rawVerse = chapter[j];
        const verse = normalizeString(rawVerse);
        const d = distance(input, verse);
        const diff = verse.length - d;

        if (diff < minLev) {
          continue;
        }

        const subStr = longestCommonSubstring(input, verse);

        if (subStr.length < minSub) {
          continue;
        }

        const result: Result = {
          lev: diff,
          sub: subStr.length,
          score: diff + subStr.length,
          match: subStr,
          content: rawVerse,
          bookName: b,
          chapter: i + 1,
          verse: j + 1,
        };

        arr.push(result);
      }
    }
  }

  arr.sort((a, b) => {
    return b.score - a.score;
  });

  const results = arr.slice(0, maxResults);

  return results.map(({ bookName, chapter, content, match, verse }) => {
    // TODO: This could be done better now by looking at bookRefs object directly instead of looping
    const book = Object.values(bookRefs).find(
      (b) => b.name === bookName,
    ) as Book;
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

function longestCommonSubstring(input: string, verse: string) {
  const m = input.length,
    n = verse.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  let maxLength = 0,
    endIndex = 0;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (input[i - 1] === verse[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        if (dp[i][j] > maxLength) {
          maxLength = dp[i][j];
          endIndex = i;
        }
      }
    }
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
