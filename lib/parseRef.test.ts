import { assertEquals } from "@std/assert";
import { parseRef } from "./parseRef.ts";

Deno.test("Is fine without an end of range", () => {
  const ref = parseRef("1 Nephi 3:7");

  assertEquals(ref, {
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
  });
});

Deno.test("Finds the end", () => {
  const ref = parseRef("1 Corinthians 15:40-46");

  assertEquals(ref, {
    book: {
      name: "1 Corinthians",
      abbr: "1 Cor.",
    },
    api: "/1-cor/15/40-46",
    chapter: 15,
    verses: [[40, 46]],
    reference: "1 Corinthians 15:40-46",
    abbr: "1 Cor. 15:40-46",
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/nt/1-cor/15?lang=eng&id=p40-p46#p40",
  });
});

Deno.test("Finds without verses", () => {
  const ref = parseRef("Jacob 5");

  assertEquals(ref, {
    book: {
      name: "Jacob",
      abbr: "Jacob",
    },
    api: "/jacob/5",
    chapter: 5,
    verses: [],
    reference: "Jacob 5",
    abbr: "Jacob 5",
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/bofm/jacob/5?lang=eng",
  });
});

Deno.test("Finds book and adds chapter 1 when there is only 1", () => {
  const ref = parseRef("Omni");

  assertEquals(ref, {
    book: {
      name: "Omni",
      abbr: "Omni",
    },
    api: "/omni/1",
    chapter: 1,
    verses: [],
    reference: "Omni 1",
    abbr: "Omni 1",
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/bofm/omni/1?lang=eng",
  });
});

Deno.test("Finds D&C", () => {
  const ref = parseRef("D&C 20:1");

  assertEquals(ref, {
    book: {
      name: "Doctrine and Covenants",
      abbr: "D&C",
    },
    api: "/dc/20/1",
    chapter: 20,
    verses: [1],
    reference: "Doctrine and Covenants 20:1",
    abbr: "D&C 20:1",
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/20?lang=eng&id=p1#p1",
  });
});

Deno.test("Finds single verse", () => {
  const ref = parseRef("Exodus 20:13");

  assertEquals(ref, {
    book: {
      name: "Exodus",
      abbr: "Ex.",
    },
    api: "/ex/20/13",
    chapter: 20,
    verses: [13],
    reference: "Exodus 20:13",
    abbr: "Ex. 20:13",
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/ot/ex/20?lang=eng&id=p13#p13",
  });
});

Deno.test("Finds range of verses", () => {
  const ref = parseRef("Mosiah 4:15-19");

  assertEquals(ref, {
    book: {
      name: "Mosiah",
      abbr: "Mosiah",
    },
    api: "/mosiah/4/15-19",
    chapter: 4,
    verses: [[15, 19]],
    reference: "Mosiah 4:15-19",
    abbr: "Mosiah 4:15-19",
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/bofm/mosiah/4?lang=eng&id=p15-p19#p15",
  });
});

Deno.test("Finds ranges of verses", () => {
  const ref = parseRef("Ether 12:4-27, 28-30, 31");

  assertEquals(ref, {
    book: {
      name: "Ether",
      abbr: "Ether",
    },
    api: "/ether/12/4-27/28-30/31",
    chapter: 12,
    verses: [[4, 27], [28, 30], 31],
    reference: "Ether 12:4-27, 28-30, 31",
    abbr: "Ether 12:4-27, 28-30, 31",
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/bofm/ether/12?lang=eng&id=p4-p27,p28-p30,p31#p4",
  });
});

Deno.test("Sorts verse ranges", () => {
  const ref = parseRef("John 17:9-10,6-1, ");

  assertEquals(ref, {
    book: {
      name: "John",
      abbr: "John",
    },
    api: "/john/17/1-6/9-10",
    chapter: 17,
    verses: [
      [1, 6],
      [9, 10],
    ],
    reference: "John 17:1-6, 9-10",
    abbr: "John 17:1-6, 9-10",
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/nt/john/17?lang=eng&id=p1-p6,p9-p10#p1",
  });
});

Deno.test("Only book", () => {
  const ref = parseRef("Mormon");

  assertEquals(ref, {
    book: {
      name: "Mormon",
      abbr: "Morm.",
    },
    api: undefined,
    chapter: undefined,
    verses: [],
    reference: "Mormon",
    abbr: "Morm.",
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/bofm/morm?lang=eng",
  });
});

Deno.test("Can pick up other symbols", () => {
  const ref = parseRef("1 Corinthians 12:12–27");

  assertEquals(ref, {
    book: {
      name: "1 Corinthians",
      abbr: "1 Cor.",
    },
    api: "/1-cor/12/12-27",
    chapter: 12,
    verses: [[12, 27]],
    reference: "1 Corinthians 12:12-27",
    abbr: "1 Cor. 12:12-27",
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/nt/1-cor/12?lang=eng&id=p12-p27#p12",
  });
});

Deno.test("Will show a single verse for an incomplete range", () => {
  const ref = parseRef("1 John 1:7-");

  assertEquals(ref, {
    book: {
      name: "1 John",
      abbr: "1 Jn.",
    },
    api: "/1-jn/1/7",
    chapter: 1,
    verses: [7],
    reference: "1 John 1:7",
    abbr: "1 Jn. 1:7",
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/nt/1-jn/1?lang=eng&id=p7#p7",
  });
});

Deno.test("Will coerce a weird range", () => {
  const ref = parseRef("1 John 1:7-8-9");

  assertEquals(ref, {
    book: {
      name: "1 John",
      abbr: "1 Jn.",
    },
    api: "/1-jn/1/7/8/9",
    chapter: 1,
    verses: [7, 8, 9],
    reference: "1 John 1:7, 8, 9",
    abbr: "1 Jn. 1:7, 8, 9",
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/nt/1-jn/1?lang=eng&id=p7,p8,p9#p7",
  });
});

Deno.test("Will use the last verse if verse numbers are too high", () => {
  const ref = parseRef("D&C 138:59-80");

  assertEquals(ref, {
    book: {
      name: "Doctrine and Covenants",
      abbr: "D&C",
    },
    api: "/dc/138/59-60",
    chapter: 138,
    verses: [[59, 60]],
    reference: "Doctrine and Covenants 138:59-60",
    abbr: "D&C 138:59-60",
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/138?lang=eng&id=p59-p60#p59",
  });
});
