import contents from "../data/contents.ts";
import type { BookName, Reference } from "../types.ts";

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
