import books from "../data/books.ts";
import { distance } from "fastest-levenshtein";
import { formatRef } from "./formatRef.ts";
import type { Book, Reference, VerseRange } from "../types.ts";

/**
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
 * // },
 */
export function parseRef(input: string): Reference {
  input = input.trim();
  const digits = [...input.matchAll(/\d+/g)];

  // get chapter
  let chapter: undefined | number;

  if (digits.length) {
    if (digits[0].index === 0) {
      chapter = Number(digits[1]);
    } else {
      chapter = Number(digits[0]);
    }
  }

  // get verses
  const colonIdx = /:/.exec(input)?.index;
  const verses: VerseRange = [];

  if (colonIdx && colonIdx > 0) {
    const vStrings = input.slice(colonIdx + 1);
    const vs = vStrings.split(",");

    for (const v of vs) {
      if (v.match(/-|–/)) {
        const vNums = v.match(/\d+/g);
        if (vNums?.length && vNums.length === 2) {
          const range: number[] = [];
          for (const vn of vNums) {
            range.push(Number(vn));
          }
          verses.push(range.toSorted((a, b) => a - b) as [number, number]);
        } else if (vNums?.length && vNums.length === 1) {
          verses.push(Number(vNums[0]));
        } else if (vNums?.length && vNums.length > 2) {
          for (const n of vNums) {
            verses.push(Number(n));
          }
        }
      } else if (v) {
        const vNum = v.match(/\d+/);
        verses.push(Number(vNum));
      }
    }
  }

  const bookEndIdx = digits.length ? digits[1]?.index : undefined;
  const bookText = input.slice(0, bookEndIdx).toLocaleLowerCase();
  const book = parseBook(bookText);

  return formatRef({
    book,
    chapter,
    verses,
  });
}

/**
 * A function to parse a fuzzy string return the corresponding Book object
 * @param bookText A fuzzy string representing a book name or abbreviation, e.g. "genesis", "gen", "1 nefi"
 * @returns Book object containing the name, path, abbreviation, and chapters
 */
function parseBook(bookText: string): Book {
  const sorted = (Object.values(books) as Book[]).toSorted((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    const abbrA = a.abbr.toLocaleLowerCase();
    const nameA = a.name.toLocaleLowerCase();

    const minA = Math.min(distance(abbrA, bookText), distance(nameA, bookText));

    const abbrB = b.abbr.toLocaleLowerCase();
    const nameB = b.name.toLocaleLowerCase();

    const minB = Math.min(distance(abbrB, bookText), distance(nameB, bookText));

    if (minA < minB) {
      scoreA += 50;
    }

    if (minB < minA) {
      scoreB += 50;
    }

    if (nameA[0] === bookText[0]) {
      scoreA += 10;
      if (nameA[1] === bookText[1]) {
        scoreA += 20;
        if (nameA[2] === bookText[2]) {
          scoreA += 50;
        }
      }
    }

    if (nameB[0] === bookText[0]) {
      scoreB += 15;
      if (nameB[1] === bookText[1]) {
        scoreB += 20;
        if (nameB[2] === bookText[2]) {
          scoreB += 50;
        }
      }
    }

    const dA = Math.min(
      Math.abs(abbrA.length - bookText.length),
      Math.abs(nameA.length - bookText.length),
    );

    const dB = Math.min(
      Math.abs(abbrB.length - bookText.length),
      Math.abs(nameB.length - bookText.length),
    );

    if (dA < dB) {
      scoreA += 5;
    }

    if (dB < dA) {
      scoreB += 5;
    }

    if (scoreA < scoreB) {
      return 1;
    }

    if (scoreB < scoreA) {
      return -1;
    }

    return 0;
  });

  return sorted[0];
}
