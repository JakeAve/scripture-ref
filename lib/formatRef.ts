import type { Book, Reference, VerseRange } from "../types.ts";

const DOMAIN = "https://www.churchofjesuschrist.org";
const LANG = "?lang=eng";

/**
 * Formats a scripture reference into a structured object, including a readable string,
 * abbreviation, hyperlink, and extracted text content.
 *
 * Sorts verses in chronological order
 * Checks if chapters and verses exist and fixes
 * If opts.content is passed, it will be used rather than doing a lookup
 *
 * @param {Object} opts - The options object for formatting the reference.
 * @param {Book} opts.book - The book of scripture being referenced.
 * @param {number | undefined} opts.chapter - The chapter number, if applicable.
 * @param {VerseRange} opts.verses - An array of verse numbers or ranges.
 *
 * @returns {Object} An object containing the formatted reference.
 * @returns {string} return.reference - Full reference string (e.g., "John 3:16").
 * @returns {string} return.abbr - Abbreviated reference (e.g., "Jn 3:16").
 * @returns {string} return.link - URL linking to the passage on the church website.
 * @returns {number | undefined} return.chapter - The chapter number (if applicable).
 * @returns {VerseRange} return.verses - The validated and sorted list of verse numbers.
 */
export function formatRef({
  book,
  chapter,
  verses = [],
}: {
  book: Book;
  chapter?: number;
  content?: string;
  verses?: VerseRange;
}): Reference {
  // makes sure chapter exists
  if (chapter && book?.chapters?.length && book.chapters.length < chapter) {
    chapter = undefined;
    verses.length = 0;
  }

  // When there's only one chapter
  if (!chapter && book?.chapters?.length === 1) {
    chapter = 1;
  }

  // handle verses
  verses.sort((a, b) => {
    const minA = Math.min(Array.isArray(a) ? (a[0], a[1]) : a);
    const minB = Math.min(Array.isArray(b) ? (b[0], b[1]) : b);

    if (minA > minB) {
      return 1;
    }
    if (minA < minB) {
      return -1;
    }
    return 0;
  });

  const ps: string[] = [];
  const vs: string[] = [];

  if (verses.length && chapter) {
    for (const [idx, range] of verses.entries()) {
      if (Array.isArray(range)) {
        for (const [idx2, verse] of range.entries()) {
          // If the verse doesn't exist, change it to show the highest verse
          if (verse > book.chapters[chapter - 1]) {
            (verses[idx] as [number, number])[idx2] = book.chapters[
              chapter - 1
            ] as number;
          }
        }

        ps.push(`p${range[0]}-p${range[1]}`);
        vs.push(`${range[0]}-${range[1]}`);
      } else {
        // If the verse doesn't exist, change it to show the highest verse
        if (range > book.chapters[chapter - 1]) {
          verses[idx] = book.chapters[chapter - 1] as number;
        }

        ps.push(`p${range}`);
        vs.push(range.toString());
      }
    }
  }

  const chapterPath = chapter ? "/" + chapter : "";

  const firstVerse = verses[0];
  const anchor = firstVerse
    ? "#p" +
      (Array.isArray(firstVerse)
        ? (firstVerse as [number, number])[0]
        : firstVerse)
    : "";

  const highlights = verses.length ? "&id=" + ps.join(",") : "";

  const link =
    `${DOMAIN}${book.path}${chapterPath}${LANG}${highlights}${anchor}`;

  const api = book.api && chapterPath
    ? `${book.api}${chapterPath}${vs.length ? "/" + vs.join("/") : ""}`
    : undefined;

  const numberPortion = `${chapter || ""}${vs.length ? ":" : ""}${
    vs.join(
      ", ",
    )
  }`;

  const reference = `${book.name} ${numberPortion}`.trim();
  const abbr = `${book.abbr} ${numberPortion}`.trim();

  return {
    abbr,
    api,
    book: { name: book.name, abbr: book.abbr },
    chapter,
    link,
    reference,
    verses,
  };
}
