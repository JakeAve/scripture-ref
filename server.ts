/**
 * Scripture reference functions. Contains ~7 megabytes of scripture contents.
 * @module
 */

import { findRef } from "./lib/findRef.ts";
import { getContent } from "./lib/getContent.ts";
import contents from "./data/contents.ts";
import { parseRef as parseRefWOutContent } from "./lib/parseRef.ts";
import type { Reference } from "./types.ts";
import books from "./data/books.ts";

/**
 * Server version includes content
 * Takes a fuzzy string scripture references and returns a structured reference object.
 * @param input A string representing a reference, e.g. "gen 1:1-3,5"
 * @returns Reference object containing parsed information
 * @example
 * parseRef("Gen 1:1-3, 5");
 * // Returns:
 * // {
 * //   "book": {
 * //     "name": "Genesis",
 * //     "abbr": "Gen."
 * //   },
 * //   "chapter": 1,
 * //   "verses": [
 * //     [1, 3], [5]
 * //   ],
 * //   "reference": "Genesis 1:1-3, 5",
 * //   "abbr": "Gen. 1:1-3, 5",
 * //   "link": "https://www.churchofjesuschrist.org/study/scriptures/ot/gen/1?lang=eng&id=p1-p3,p5#p1",
 * //   "content": "In the beginning God created the heaven and the earth...",
 * // },
 */
function parseRef(input: string): Reference {
  const ref = parseRefWOutContent(input);
  const content = getContent(ref);

  return { ...ref, content };
}

export { books, contents, findRef, getContent, parseRef };
