import type { BookName } from "../types.ts";
import { findRef } from "./findRef.ts";

const passages = [
  "i am not ashamed",
  "small and simple things",
  "if any man will do his will he shall know the doctrine",
  "a flying roll",
  "indeed we follow the admonition of paul",
];

for (const passage of passages.slice(0, 1)) {
  Deno.bench(`Baseline search ${passage.slice(0, 10)}...`, () => {
    findRef(passage);
  });
}

const testInput = "and it came to pass";
const bookSets = [
  ["Genesis", "Exodus"],
  ["Psalms", "Proverbs"],
  ["Matthew", "John"],
  ["Alma", "Mosiah"],
  ["Doctrine and Covenants"],
  ["Moses", "Abraham"],
] as BookName[][];

Deno.bench(`All books`, { group: "books", baseline: true }, () => {
  findRef(testInput);
});

for (const books of bookSets) {
  Deno.bench(
    `findRef with books options ${books.join(",")}`,
    { group: "books" },
    () => {
      findRef(testInput, { books });
    },
  );
}

const commonInput = "and the";

const distances = [1, 0.8, 0.6, 0.4, 0.2];

Deno.bench(`minLevDist: 0.9`, { group: "minLevDist", baseline: true }, () => {
  findRef(commonInput, { minLevDist: 0.9, volume: "nt" });
});

for (const minLevDist of distances) {
  Deno.bench(`minLevDist: ${minLevDist}`, { group: "minLevDist" }, () => {
    findRef(commonInput, { minLevDist, volume: "nt" });
  });
}

const minSizes = [1, 3, 7, 9];

Deno.bench(`minSubstr: 5`, { group: "minSubstr", baseline: true }, () => {
  findRef(commonInput, { minSubstr: 5, volume: "nt" });
});

for (const minSubstr of minSizes) {
  Deno.bench(`minSubstr: ${minSubstr}`, { group: "minSubstr" }, () => {
    findRef(commonInput, { minSubstr, volume: "nt" });
  });
}

const volumes = ["ot", "nt", "bom", "dc", "pgp"] as (
  | "ot"
  | "nt"
  | "bom"
  | "dc"
  | "pgp"
)[];

Deno.bench(`All volumes`, { group: "volume", baseline: true }, () => {
  findRef(commonInput);
});

for (const volume of volumes) {
  Deno.bench(`volume: ${volume}`, { group: "volume" }, () => {
    findRef(commonInput, { volume });
  });
}
