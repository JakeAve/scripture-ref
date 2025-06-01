import { assertEquals } from "@std/assert";
import { formatRef } from "./formatRef.ts";
import books from "../data/books.ts";
import type { Book, Reference } from "../types.ts";

Deno.test("Puts verses in chronological order", () => {
  const ref = formatRef({
    book: books["1-ne"] as Book,
    chapter: 3,
    verses: [7, [1, 2], [12, 10]],
  });

  const expected = {
    abbr: "1 Ne. 3:1-2, 7, 12-10",
    api: "/1-ne/3/1-2/7/12-10",
    book: { name: "1 Nephi", abbr: "1 Ne." },
    chapter: 3,
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/3?lang=eng&id=p1-p2,p7,p12-p10#p1",
    reference: "1 Nephi 3:1-2, 7, 12-10",
    verses: [[1, 2], 7, [12, 10]],
  } as Reference;

  assertEquals(ref, expected);
});

Deno.test("Will set chapter to 1 when there's only one chapter", () => {
  const ref = formatRef({
    book: books["obad"] as Book,
  });

  const expected = {
    abbr: "Obad. 1",
    api: "/obad/1",
    book: { name: "Obadiah", abbr: "Obad." },
    chapter: 1,
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/ot/obad/1?lang=eng",
    reference: "Obadiah 1",
    verses: [],
  } as Reference;

  assertEquals(ref, expected);
});

Deno.test("Will link to book if no chapter or verses are provided", () => {
  const ref = formatRef({
    book: books["john"] as Book,
  });

  const expected = {
    abbr: "John",
    api: undefined,
    book: { name: "John", abbr: "John" },
    chapter: undefined,
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/nt/john?lang=eng",
    reference: "John",
    verses: [],
  } as Reference;

  assertEquals(ref, expected);
});

Deno.test("Will remove chapter if it doesn't exist", () => {
  const ref = formatRef({
    book: books["titus"] as Book,
    chapter: 5,
    verses: [1],
  });

  const expected = {
    abbr: "Titus",
    api: undefined,
    book: { name: "Titus", abbr: "Titus" },
    chapter: undefined,
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/nt/titus?lang=eng",
    reference: "Titus",
    verses: [],
  } as Reference;

  assertEquals(ref, expected);
});

Deno.test("Will lower verses if they do not exist in the chapter", () => {
  const ref = formatRef({
    book: books["dc"] as Book,
    chapter: 2,
    verses: [[1, 6]],
  });

  const expected = {
    abbr: "D&C 2:1-3",
    api: "/dc/2/1-3",
    book: { name: "Doctrine and Covenants", abbr: "D&C" },
    chapter: 2,
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/2?lang=eng&id=p1-p3#p1",
    reference: "Doctrine and Covenants 2:1-3",
    verses: [[1, 3]],
  } as Reference;

  assertEquals(ref, expected);
});
