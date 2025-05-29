import { assert, assertEquals, assertGreater } from "@std/assert";
import { findRef } from "./findRef.ts";
import contents from "../data/contents.ts";
import type { BookName } from "../types.ts";

Deno.test("Can find references", () => {
  const maxResults = 1;
  const options = { maxResults };

  assertEquals(findRef("I am not ashamed", options), [
    {
      book: {
        name: "Romans",
        abbr: "Rom.",
      },
      api: "/rom/1/16",
      chapter: 1,
      verses: [16],
      reference: "Romans 1:16",
      abbr: "Rom. 1:16",
      link:
        "https://www.churchofjesuschrist.org/study/scriptures/nt/rom/1?lang=eng&id=p16#p16",
      content:
        "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth; to the Jew first, and also to the Greek.",
      match: "I AM NOT ASHAMED",
    },
  ]);

  assertEquals(findRef("I will go and do", options), [
    {
      book: {
        name: "1 Nephi",
        abbr: "1 Ne.",
      },
      api: "/1-ne/3/7",
      chapter: 3,
      verses: [7],
      reference: "1 Nephi 3:7",
      abbr: "1 Ne. 3:7",
      link:
        "https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/3?lang=eng&id=p7#p7",
      content:
        "And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.",
      match: "I WILL GO AND DO",
    },
  ]);

  assertEquals(findRef("peace been as a river", options), [
    {
      book: {
        name: "Isaiah",
        abbr: "Isa.",
      },
      api: "/isa/48/18",
      chapter: 48,
      verses: [18],
      reference: "Isaiah 48:18",
      abbr: "Isa. 48:18",
      link:
        "https://www.churchofjesuschrist.org/study/scriptures/ot/isa/48?lang=eng&id=p18#p18",
      content:
        "O that thou hadst hearkened to my commandments! then had thy peace been as a river, and thy righteousness as the waves of the sea:",
      match: "PEACE BEEN AS A RIVER",
    },
  ]);

  assertEquals(findRef("take my yoke upon you", options), [
    {
      book: {
        name: "Matthew",
        abbr: "Matt.",
      },
      chapter: 11,
      verses: [29],
      api: "/matt/11/29",
      reference: "Matthew 11:29",
      abbr: "Matt. 11:29",
      link:
        "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/11?lang=eng&id=p29#p29",
      content:
        "Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.",
      match: "TAKE MY YOKE UPON YOU",
    },
  ]);

  assertEquals(findRef("by small and simple things", options), [
    {
      book: {
        name: "Alma",
        abbr: "Alma",
      },
      api: "/alma/37/6",
      chapter: 37,
      verses: [6],
      reference: "Alma 37:6",
      abbr: "Alma 37:6",
      link:
        "https://www.churchofjesuschrist.org/study/scriptures/bofm/alma/37?lang=eng&id=p6#p6",
      content:
        "Now ye may suppose that this is foolishness in me; but behold I say unto you, that by small and simple things are great things brought to pass; and small means in many instances doth confound the wise.",
      match: "BY SMALL AND SIMPLE THINGS",
    },
  ]);

  assertEquals(findRef("art thou greater than he?", options), [
    {
      book: {
        name: "Doctrine and Covenants",
        abbr: "D&C",
      },
      api: "/dc/122/8",
      chapter: 122,
      verses: [8],
      reference: "Doctrine and Covenants 122:8",
      abbr: "D&C 122:8",
      link:
        "https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/122?lang=eng&id=p8#p8",
      content:
        "The Son of Man hath descended below them all. Art thou greater than he?",
      match: "ART THOU GREATER THAN HE",
    },
  ]);

  assertEquals(findRef("I am more intelligent than they all", options), [
    {
      book: {
        name: "Abraham",
        abbr: "Abr.",
      },
      api: "/abr/3/19",
      chapter: 3,
      verses: [19],
      reference: "Abraham 3:19",
      abbr: "Abr. 3:19",
      link:
        "https://www.churchofjesuschrist.org/study/scriptures/pgp/abr/3?lang=eng&id=p19#p19",
      content:
        "And the Lord said unto me: These two facts do exist, that there are two spirits, one being more intelligent than the other; there shall be another more intelligent than they; I am the Lord thy God, I am more intelligent than they all.",
      match: "I AM MORE INTELLIGENT THAN THEY ALL",
    },
  ]);
});

Deno.test("Setting a volume will update results", () => {
  const maxResults = 1;
  const options = { maxResults };

  const ref0 = findRef("in the beginning was the word", {
    ...options,
    volume: "ot",
  });

  assertEquals(ref0, [
    {
      abbr: "Lam. 2:19",
      book: {
        name: "Lamentations",
        abbr: "Lam.",
      },
      api: "/lam/2/19",
      chapter: 2,
      link:
        "https://www.churchofjesuschrist.org/study/scriptures/ot/lam/2?lang=eng&id=p19#p19",
      reference: "Lamentations 2:19",
      verses: [19],
      content:
        "Arise, cry out in the night: in the beginning of the watches pour out thine heart like water before the face of the Lord: lift up thy hands toward him for the life of thy young children, that faint for hunger in the top of every street.",
      match: "IN THE BEGINNING ",
    },
  ]);

  const ref1 = findRef("by small and simple things", {
    ...options,
    volume: "nt",
  });

  assertEquals(ref1, [
    {
      abbr: "Col. 1:16",
      book: {
        name: "Colossians",
        abbr: "Col.",
      },
      api: "/col/1/16",
      chapter: 1,
      link:
        "https://www.churchofjesuschrist.org/study/scriptures/nt/col/1?lang=eng&id=p16#p16",
      reference: "Colossians 1:16",
      verses: [16],
      content:
        "For by him were all things created, that are in heaven, and that are in earth, visible and invisible, whether they be thrones, or dominions, or principalities, or powers: all things were created by him, and for him:",
      match: " THINGS",
    },
  ]);

  const ref2 = findRef("choose you this day who you will serve", {
    ...options,
    volume: "bom",
  });

  assertEquals(ref2, [
    {
      abbr: "Mosiah 2:9",
      book: {
        name: "Mosiah",
        abbr: "Mosiah",
      },
      api: "/mosiah/2/9",
      chapter: 2,
      link:
        "https://www.churchofjesuschrist.org/study/scriptures/bofm/mosiah/2?lang=eng&id=p9#p9",
      reference: "Mosiah 2:9",
      verses: [9],
      content:
        "And these are the words which he spake and caused to be written, saying: My brethren, all ye that have assembled yourselves together, you that can hear my words which I shall speak unto you this day; for I have not commanded you to come up hither to trifle with the words which I shall speak, but that you should hearken unto me, and open your ears that ye may hear, and your hearts that ye may understand, and your minds that the mysteries of God may be unfolded to your view.",
      match: " YOU THIS DAY ",
    },
  ]);

  const ref3 = findRef(
    "I would exhort you that ye would ask God, the Eternal Father",
    {
      ...options,
      volume: "dc",
    },
  );

  assertEquals(ref3, [
    {
      abbr: "D&C 128:23",
      book: {
        name: "Doctrine and Covenants",
        abbr: "D&C",
      },
      api: "/dc/128/23",
      chapter: 128,
      link:
        "https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/128?lang=eng&id=p23#p23",
      reference: "Doctrine and Covenants 128:23",
      verses: [23],
      content:
        "Let the mountains shout for joy, and all ye valleys cry aloud; and all ye seas and dry lands tell the wonders of your Eternal King! And ye rivers, and brooks, and rills, flow down with gladness. Let the woods and all the trees of the field praise the Lord; and ye solid rocks weep for joy! And let the sun, moon, and the morning stars sing together, and let all the sons of God shout for joy! And let the eternal creations declare his name forever and ever! And again I say, how glorious is the voice we hear from heaven, proclaiming in our ears, glory, and salvation, and honor, and immortality, and eternal life; kingdoms, principalities, and powers!",
      match: " THE ETERNAL ",
    },
  ]);

  const ref4 = findRef(
    "this is the testimony, last of all, which we give of him: That he lives!",
    {
      ...options,
      volume: "pgp",
    },
  );

  assertEquals(ref4, [
    {
      abbr: "Moses 7:62",
      book: {
        name: "Moses",
        abbr: "Moses",
      },
      api: "/moses/7/62",
      chapter: 7,
      link:
        "https://www.churchofjesuschrist.org/study/scriptures/pgp/moses/7?lang=eng&id=p62#p62",
      reference: "Moses 7:62",
      verses: [62],
      content:
        "And righteousness will I send down out of heaven; and truth will I send forth out of the earth, to bear testimony of mine Only Begotten; his resurrection from the dead; yea, and also the resurrection of all men; and righteousness and truth will I cause to sweep the earth as with a flood, to gather out mine elect from the four quarters of the earth, unto a place which I shall prepare, an Holy City, that my people may gird up their loins, and be looking forth for the time of my coming; for there shall be my tabernacle, and it shall be called Zion, a New Jerusalem.",
      match: " TESTIMONY ",
    },
  ]);
});

Deno.test("Setting a book will limit results", () => {
  for (const book in contents) {
    const results = findRef("And it came to pass", {
      books: [book as BookName],
    });

    assert(results.every((r) => r.book.name === book));
  }
});

Deno.test("Can do multiple books", () => {
  const results = findRef("in the beginning", { books: ["Genesis", "John"] });

  const bookCounts = new Map([
    ["Genesis", 0],
    ["John", 0],
  ]);

  for (
    const {
      book: { name },
    } of results
  ) {
    if (bookCounts.has(name)) {
      bookCounts.set(name, bookCounts.get(name) || 0 + 1);
    }
  }

  assertEquals(bookCounts.size, 2);

  assertGreater(bookCounts.get("Genesis"), 0);
  assertGreater(bookCounts.get("John"), 0);
});
