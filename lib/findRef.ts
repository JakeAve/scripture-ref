import { distance } from "fastest-levenshtein";
import contents, * as volumes from "../data/contents.ts";
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
  } = {},
): ReferenceMatch[] {
  const {
    volume,
    books,
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
    data = volumes[volume];
  }

  if (books) {
    for (const b of books) {
      data[b] = contents[b];
    }
  }

  if (!volume && !books) {
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
    const book = bookRefs.find((b) => b.name === bookName) as Book;
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
