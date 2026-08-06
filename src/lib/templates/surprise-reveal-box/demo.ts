import { surpriseBoxContentSchema, type SurpriseBoxContent } from "./schema";

/**
 * The public walkthrough.
 *
 * Four boxes, not eight: a visitor with no stake in the memory will lose patience
 * long before a stranger's eighth layer, and the point is to show what one layer
 * feels like. Every guard type except the map appears once, and the combination is
 * given away in its clue so nobody gets stuck on someone else's private number.
 */
export const surpriseBoxDemo: SurpriseBoxContent = surpriseBoxContentSchema.parse({
  scheme: "party",

  toLine: "you",
  fromLine: "me, obviously",
  openingLines: ["This one's got layers.", "Sorry in advance."],

  confetti: true,
  closingLine: "Told you it had layers.",

  layers: [
    {
      id: "l-1",
      wrapping: "stripes",
      ribbon: "satinRed",
      material: "kraft",
      sticker: "seal",
      tag: "Open me first",
      guard: "none",
      reward: {
        id: "l-1-r",
        kind: "text",
        title: "",
        body:
          "You're going to be annoyed with me in about four minutes.\n\nI want to say now, before you find out, that I did think about just putting it in one box.",
      },
    },
    {
      id: "l-2",
      wrapping: "dots",
      ribbon: "gold",
      material: "kraft",
      sticker: "star",
      tag: "Still not it",
      guard: "scratch",
      clue: "You know what to do with this.",
      reward: {
        id: "l-2-r",
        kind: "photo",
        title: "Evidence",
        body: "You have looked exactly like this at every birthday since 2019.",
        imageUrl: "https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=1000",
      },
    },
    {
      id: "l-3",
      wrapping: "stars",
      ribbon: "satinCream",
      material: "linen",
      sticker: "bow",
      tag: "Getting warmer",
      guard: "combination",
      clue: "Our old flat number, then the floor. It's 4, then 0, then 2.",
      code: "402",
      reward: {
        id: "l-3-r",
        kind: "quote",
        body: "You cannot keep buying furniture for a flat we are leaving in five weeks.",
        credit: "you, in the doorway, holding a lamp",
      },
    },
    {
      id: "l-4",
      wrapping: "plainGilt",
      ribbon: "blush",
      material: "velvet",
      sticker: "heart",
      tag: "Last one, promise",
      guard: "key",
      clue: "It's on the table. Drag it over.",
      reward: {
        id: "l-4-r",
        kind: "letter",
        title: "",
        body:
          "Four boxes for a sentence, which is roughly my ratio for everything.\n\nHere it is: I booked the flights. Same week as last year, same terrible hotel, because you said it had character and I have decided to believe you.\n\nHappy birthday. Recycle the paper.",
      },
    },
  ],
});
