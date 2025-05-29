import { parseRef } from "./parseRef.ts";

const references = [
  "Gen 1:1-3, 5",
  "Exo 20:12-17",
  "Ps 23:1-4",
  "Matt 5:14-16",
  "John 3:16",
  "Revelations 14:6",
  "2 Ne 2:25",
  "Alma 37:6-7",
  "Mosiah 2:17",
  "Ether 12:27",
  "D&C 89:18-21",
  "D&C 121:7-8",
  "Moses 1:39",
  "Abraham 3:22-23",
  "some random text",
  "John 88:99-102",
  "Genesis 3:10-1,8-2,9-4,7,7,7,9,44",
];

for (const ref of references) {
  Deno.bench(`Time to format ${ref}`, () => {
    parseRef(ref);
  });
}
