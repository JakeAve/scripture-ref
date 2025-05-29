# Scripture Lib

Fast scripture functions based on the publicly available volumes from the canon
of the Church of Jesus Christ of Latter-day Saints.

Includes:

- New Testament
- Old Testament
- Book of Mormon
- Doctrine and Covenants
- Pearl of Great Price

## types.ts

Example:

```typescript
import type { BookName } from "@jakeave/scripture-ref/types.ts";
import { findRef } from "@jakeave/scripture-ref/server.ts";

const book = someFunction() as BookName;

const results = findRef("and it came to pass", { books: [book] });
```

## server.ts

Server exports contain all of the contents within the runtime: ~ 7 megabytes.
They shouldn't be used directly on the client to avoid this large download. The
references includes the actual text from scripture passages in the `content`
field.

### `findRef(input: string, options): ReferenceMatch[]`

Given an input string, finds a list of `ReferenceMatch` objects. The matched
substring is contained the `match` field. Leveraging the "volume" or "books"
options greatly enhances the efficiency.

```typescript
const ref0 = findRef("I am not ashamed", { maxResults: 1 });

/*
[
    {
      book: {
        name: "Romans",
        abbr: "Rom.",
      },
      chapter: 1,
      verses: [16],
      reference: "Romans 1:16",
      abbr: "Rom. 1:16",
      link: "https://www.churchofjesuschrist.org/study/scriptures/nt/rom/1?lang=eng&id=p16#p16",
      content:
        "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth; to the Jew first, and also to the Greek.",
      match: "I AM NOT ASHAMED",
    },
]
*/

const ref1 = findRef("art thou greater than he?", {
  maxResults: 1,
  volume: "dc",
});

/*
[
    {
      book: {
        name: "Doctrine and Covenants",
        abbr: "D&C",
      },
      chapter: 122,
      verses: [8],
      reference: "Doctrine and Covenants 122:8",
      abbr: "D&C 122:8",
      link: "https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/122?lang=eng&id=p8#p8",
      content:
        "The Son of Man hath descended below them all. Art thou greater than he?",
      match: "ART THOU GREATER THAN HE",
    },
]
*/
```

### `getContent(reference: Reference): string`

Given a reference, returns the content as a plain string. Will join all defined
verses or return full chapter.

```typescript
const ref = {
  abbr: "John 1:1",
  book: { name: "John", abbr: "John" },
  chapter: 1,
  link:
    "https://www.churchofjesuschrist.org/study/scriptures/nt/john/1?lang=eng&id=p1#p1",
  reference: "John 1:1",
  verses: [1],
};

const content = getContent(ref);

"In the beginning was the Word, and the Word was with God, and the Word was God.";
```

### `parseRef(input: string): Reference`

Given a fuzzy string, parses it into a `Reference`. Includes the text in the
`content` field.

```typescript
const ref0 = parseRef("1 nephi 3:7");

/*
{
    book: {
      name: "1 Nephi",
      abbr: "1 Ne.",
    },
    chapter: 3,
    verses: [7],
    reference: "1 Nephi 3:7",
    abbr: "1 Ne. 3:7",
    link: "https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/3?lang=eng&id=p7#p7",
    content:
      "And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.",
}
*/

const ref1 = parseRef("duet 12:32");

/*
{
  "abbr": "Deut. 12:32",
  "book": {
    "name": "Deuteronomy",
    "abbr": "Deut."
  },
  "chapter": 12,
  "content": "What thing soever I command you, observe to do it: thou shalt not add thereto, nor diminish from it.",
  "link": "https://www.churchofjesuschrist.org/study/scriptures/ot/deut/12?lang=eng&id=p32#p32",
  "reference": "Deuteronomy 12:32",
  "verses": [
    32
  ]
}
*/
```

## client.ts

### client `parseRef(input: string): Reference`

The same as [parseRef server function](#parserefinput-string-reference) but does
NOT include the content.
