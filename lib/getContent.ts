import contents from "../data/contents.ts";
import type { BookName, Reference } from "../types.ts";

/**
 * Retrieves the content of a specified scripture reference.
 * It extracts the relevant text based on the given book, chapter, and verse range.
 *
 * @param {Reference} reference - The scripture reference details.
 * @param {BookRef} reference.book - The book of scripture being accessed.
 * @param {number} [reference.chapter] - The chapter number (optional).
 * @param {VerseRange} reference.verses - The range of verses to retrieve.
 * @returns {string | undefined} - The extracted scripture content, or undefined if not found.
 */
export function getContent({
  book,
  chapter,
  verses,
}: Reference): string | undefined {
  if (!chapter) {
    return undefined;
  }

  if (!verses.length) {
    const chapterContent = contents[book.name as BookName][chapter - 1];
    return chapterContent.join(" ");
  }

  let content = "";

  for (const vs of verses) {
    if (Array.isArray(vs)) {
      for (const v of vs) {
        content +=
          contents[book.name as BookName][(chapter as number) - 1][v - 1];
        content += " ";
      }
    } else {
      content +=
        contents[book.name as BookName][(chapter as number) - 1][vs - 1];

      content += " ";
    }
  }

  return content.trim();
}
