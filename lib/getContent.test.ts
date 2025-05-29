import { assertEquals } from "@std/assert";
import { getContent } from "./getContent.ts";
import type { Reference } from "../types.ts";

Deno.test("Can get a single verse", () => {
  const ref = {
    abbr: "John 1:1",
    book: { name: "John", abbr: "John" },
    chapter: 1,
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/nt/john/1?lang=eng&id=p1#p1",
    reference: "John 1:1",
    verses: [1],
  } as Reference;

  const expected =
    "In the beginning was the Word, and the Word was with God, and the Word was God.";

  assertEquals(getContent(ref), expected);
});

Deno.test("Can get a mix of single verses and ranges", () => {
  const ref = {
    abbr: "John 17:3-6, 9, 15-23",
    book: { name: "John", abbr: "John" },
    chapter: 17,
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/nt/john/17?lang=eng&id=p3-p6,p9,p15-p23#p3",
    reference: "John 17:3-6, 9, 15-23",
    verses: [[3, 6], 9, [15, 23]],
  } as Reference;

  const expected =
    "And this is life eternal, that they might know thee the only true God, and Jesus Christ, whom thou hast sent. I have manifested thy name unto the men which thou gavest me out of the world: thine they were, and thou gavest them me; and they have kept thy word. I pray for them: I pray not for the world, but for them which thou hast given me; for they are thine. I pray not that thou shouldest take them out of the world, but that thou shouldest keep them from the evil. I in them, and thou in me, that they may be made perfect in one; and that the world may know that thou hast sent me, and hast loved them, as thou hast loved me.";

  assertEquals(getContent(ref), expected);
});

Deno.test("Will get a single full chapter if no verses", () => {
  const ref = {
    abbr: "A of F 1",
    book: { name: "Articles of Faith", abbr: "A of F" },
    chapter: 1,
    link:
      "https://www.churchofjesuschrist.org/study/scriptures/pgp/a-of-f/1?lang=eng",
    reference: "Articles of Faith 1",
    verses: [],
  } as Reference;

  const expected =
    "We believe in God, the Eternal Father, and in His Son, Jesus Christ, and in the Holy Ghost. We believe that men will be punished for their own sins, and not for Adam's transgression. We believe that through the Atonement of Christ, all mankind may be saved, by obedience to the laws and ordinances of the Gospel. We believe that the first principles and ordinances of the Gospel are: first, Faith in the Lord Jesus Christ; second, Repentance; third, Baptism by immersion for the remission of sins; fourth, Laying on of hands for the gift of the Holy Ghost. We believe that a man must be called of God, by prophecy, and by the laying on of hands by those who are in authority, to preach the Gospel and administer in the ordinances thereof. We believe in the same organization that existed in the Primitive Church, namely, apostles, prophets, pastors, teachers, evangelists, and so forth. We believe in the gift of tongues, prophecy, revelation, visions, healing, interpretation of tongues, and so forth. We believe the Bible to be the word of God as far as it is translated correctly; we also believe the Book of Mormon to be the word of God. We believe all that God has revealed, all that He does now reveal, and we believe that He will yet reveal many great and important things pertaining to the Kingdom of God. We believe in the literal gathering of Israel and in the restoration of the Ten Tribes; that Zion (the New Jerusalem) will be built upon the American continent; that Christ will reign personally upon the earth; and, that the earth will be renewed and receive its paradisiacal glory. We claim the privilege of worshiping Almighty God according to the dictates of our own conscience, and allow all men the same privilege, let them worship how, where, or what they may. We believe in being subject to kings, presidents, rulers, and magistrates, in obeying, honoring, and sustaining the law. We believe in being honest, true, chaste, benevolent, virtuous, and in doing good to all men; indeed, we may say that we follow the admonition of Paul--We believe all things, we hope all things, we have endured many things, and hope to be able to endure all things. If there is anything virtuous, lovely, or of good report or praiseworthy, we seek after these things.";

  assertEquals(getContent(ref), expected);
});

Deno.test("Will return undefined if getting a full book", () => {
  const ref = {
    abbr: "Ex.",
    book: { name: "Exodus", abbr: "Ex." },
    chapter: undefined,
    link: "https://www.churchofjesuschrist.org/study/scriptures/ot/ex?lang=eng",
    reference: "Exodus",
    verses: [],
  } as Reference;

  const expected = undefined;

  assertEquals(getContent(ref), expected);
});
