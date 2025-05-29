import type contents from "./data/contents.ts";

/**
 * Object representing a scripture book and its properties
 * @example { abbr: "Gen.", api: "/gen", "chapters": [31, 25,,,], name: "Genesis", path: "/study/scriptures/ot/gen" }
 */
export interface Book {
  abbr: string;
  api?: string;
  chapters: number[];
  name: string;
  path: string;
}

/**
 * An array of verses as numbers and verse ranges as tuples
 * @example [16]
 * @example [1, 5, [7, 9]]
 */
export type VerseRange = (number | [number, number])[];

/**
 * Compact representation of scripture book
 * @example { abbr: "Gen.", name: "Genesis" }
 */
export interface BookRef {
  abbr: string;
  name: string;
}

/**
 * Object representing a scripture reference
 * @example
 * {
  abbr: "John 3:16",
  api: "/john/3/16",
  book: {
    name: "John",
    abbr: "John"
  },
  chapter: 3,
  link: "https://www.churchofjesuschrist.org/study/scriptures/nt/john/3?lang=eng&id=p16#p16",
  reference: "John 3:16",
  verses: [
    16
  ]
}
 */
export interface Reference {
  abbr: string;
  api?: string;
  book: BookRef;
  chapter?: number;
  content?: string;
  link: string;
  reference: string;
  verses: VerseRange;
}

/**
 * Reference object with a match
 * @example { ...reference, match: "AND IT CAME TO PASS" }
 */
export interface ReferenceMatch extends Reference {
  match: string;
}

/**
 * The full list of names of scripture books
 */
export type BookName = keyof typeof contents;
