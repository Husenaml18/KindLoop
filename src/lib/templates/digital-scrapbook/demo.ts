import { digitalScrapbookContentSchema, type DigitalScrapbookContent } from "./schema";

/**
 * The public walkthrough at /demo/digital-scrapbook.
 *
 * Every spread is composed by hand and shares no layout with any other one —
 * that is the whole promise of this template, so the demo has to prove it. The
 * eight spreads deliberately vary in density, balance, palette and subject:
 * a title page, a polaroid cluster, a travel page, a cinema page, hidden notes,
 * a cassette page, a letter, and one image left almost alone.
 */
const img = (seed: string) => `https://picsum.photos/seed/kindloop-scrap-${seed}/1200/900`;

export const digitalScrapbookDemo: DigitalScrapbookContent = digitalScrapbookContentSchema.parse({
  theme: "vintage",
  title: "The Long Way Round",
  subtitle: "two years, mostly in the kitchen",
  nameTag: "for Ana",
  coverImageUrl: img("cover"),
  openingNote: "I spent a little time making this for you.",

  spreads: [
    /* 1 — title page: one big photo, lots of air, a pressed flower */
    {
      id: "sp-1",
      tab: "one",
      items: [
        { id: "a1", kind: "title", x: 25, y: 22, w: 32, rotate: -2, z: 5, text: "The long way round" },
        { id: "a2", kind: "photo", x: 27, y: 60, w: 34, rotate: -2.5, z: 3, imageUrl: img("a1"), caption: "before any of it" },
        { id: "a3", kind: "tape", x: 21, y: 42, w: 13, rotate: -9, z: 6 },
        { id: "a4", kind: "tape", x: 39, y: 79, w: 11, rotate: 6, z: 6 },
        { id: "a5", kind: "note", x: 73, y: 34, w: 26, rotate: 1.5, z: 4, text: "I kept meaning to make you something.\nThis took longer than I planned." },
        { id: "a6", kind: "flower", x: 76, y: 66, w: 11, rotate: 16, z: 4 },
        { id: "a7", kind: "leaf", x: 87, y: 74, w: 7, rotate: -24, z: 3 },
        { id: "a8", kind: "stamp", x: 70, y: 84, w: 15, rotate: -4, z: 4, meta: "SPRING 2024" },
      ],
    },

    /* 2 — a cluster of polaroids, tightly overlapped, heart doodles */
    {
      id: "sp-2",
      tab: "the good ones",
      items: [
        { id: "b1", kind: "polaroid", x: 22, y: 34, w: 19, rotate: -7, z: 3, imageUrl: img("b1"), caption: "you, laughing" },
        { id: "b2", kind: "polaroid", x: 37, y: 44, w: 19, rotate: 4, z: 4, imageUrl: img("b2"), caption: "the bad haircut" },
        { id: "b3", kind: "polaroid", x: 27, y: 68, w: 19, rotate: 9, z: 5, imageUrl: img("b3"), caption: "3am, no reason" },
        { id: "b4", kind: "clip", x: 22, y: 20, w: 4, rotate: 12, z: 7 },
        { id: "b5", kind: "doodle", x: 47, y: 24, w: 8, rotate: -12, z: 6, doodle: "heart" },
        { id: "b6", kind: "doodle", x: 55, y: 72, w: 9, rotate: 8, z: 6, doodle: "arrow" },
        { id: "b7", kind: "note", x: 74, y: 30, w: 25, rotate: -1, z: 4, text: "three that survived the camera roll" },
        { id: "b8", kind: "sticky", x: 79, y: 62, w: 15, rotate: 5, z: 5, text: "the middle one is my favourite" },
        { id: "b9", kind: "star", x: 64, y: 18, w: 4, rotate: 0, z: 6 },
        { id: "b10", kind: "star", x: 90, y: 82, w: 3, rotate: 0, z: 6 },
      ],
    },

    /* 3 — travel page: its own theme, boarding pass, route, postcard */
    {
      id: "sp-3",
      theme: "travel",
      tab: "lisbon",
      items: [
        { id: "c1", kind: "title", x: 24, y: 16, w: 26, rotate: -1.5, z: 5, text: "Lisbon" },
        { id: "c2", kind: "postcard", x: 26, y: 46, w: 34, rotate: 2, z: 3, imageUrl: img("c1"), text: "we walked until our feet hurt and then walked more", meta: "LISBOA" },
        { id: "c3", kind: "ticket", x: 14, y: 76, w: 17, rotate: -8, z: 4, text: "BOARDING", meta: "SEAT 14A" },
        { id: "c4", kind: "stamp", x: 45, y: 80, w: 16, rotate: 7, z: 4, meta: "18 JUN 2024" },
        { id: "c5", kind: "journal", x: 76, y: 44, w: 30, rotate: -1, z: 3, text: "You burned the rice in a rented kitchen with a broken extractor fan.\n\nWe ate it on the floor because there were no chairs. Best meal of the trip." },
        { id: "c6", kind: "tape", x: 63, y: 25, w: 12, rotate: 84, z: 6 },
        { id: "c7", kind: "scrap", x: 88, y: 79, w: 18, rotate: 6, z: 4, text: "kept the receipt" },
        { id: "c8", kind: "pin", x: 63, y: 62, w: 5, rotate: 0, z: 7 },
      ],
    },

    /* 4 — cinema page: film strip down one side, ticket, rating */
    {
      id: "sp-4",
      theme: "retro",
      tab: "double feature",
      items: [
        { id: "d1", kind: "filmstrip", x: 15, y: 50, w: 15, rotate: -3, z: 3, imageUrl: img("d1") },
        { id: "d2", kind: "ticket", x: 37, y: 28, w: 19, rotate: 6, z: 4, text: "CINEMA", meta: "DATE NIGHT" },
        { id: "d3", kind: "note", x: 40, y: 58, w: 22, rotate: -2, z: 4, text: "you fell asleep\nin the second half" },
        { id: "d4", kind: "doodle", x: 40, y: 78, w: 10, rotate: 0, z: 5, doodle: "burst" },
        { id: "d5", kind: "title", x: 75, y: 22, w: 26, rotate: 1, z: 5, text: "★★★★☆" },
        { id: "d6", kind: "polaroid", x: 76, y: 56, w: 20, rotate: -6, z: 3, imageUrl: img("d2"), caption: "popcorn, mostly mine" },
        { id: "d7", kind: "stain", x: 62, y: 82, w: 20, rotate: 0, z: 2 },
        { id: "d8", kind: "tape", x: 76, y: 40, w: 12, rotate: -6, z: 6 },
      ],
    },

    /* 5 — hidden notes: pockets and a gift tag, nothing to look at until touched */
    {
      id: "sp-5",
      theme: "romantic",
      tab: "for later",
      items: [
        { id: "e1", kind: "title", x: 28, y: 18, w: 30, rotate: -1, z: 5, text: "Things I didn't say" },
        { id: "e2", kind: "pocket", x: 22, y: 52, w: 22, rotate: -3, z: 3, text: "pull me out", hiddenText: "That I was already sure, months before I said anything." },
        { id: "e3", kind: "pocket", x: 48, y: 66, w: 20, rotate: 4, z: 4, text: "and this one", hiddenText: "That I kept the receipt from the first coffee. It's in a book somewhere." },
        { id: "e4", kind: "tag", x: 74, y: 32, w: 15, rotate: -7, z: 5, text: "open me", hiddenText: "You already know this one." },
        { id: "e5", kind: "sticky", x: 79, y: 60, w: 16, rotate: -4, z: 4, text: "there are three. find them all." },
        { id: "e6", kind: "flower", x: 60, y: 22, w: 9, rotate: -18, z: 4 },
        { id: "e7", kind: "doodle", x: 90, y: 80, w: 9, rotate: 10, z: 5, doodle: "swirl" },
      ],
    },

    /* 6 — cassette page: the voice note is the subject, everything else quiet */
    {
      id: "sp-6",
      tab: "side a",
      items: [
        { id: "f1", kind: "cassette", x: 34, y: 46, w: 28, rotate: -2, z: 4, caption: "side A — for the drive" },
        { id: "f2", kind: "note", x: 34, y: 74, w: 26, rotate: 1, z: 4, text: "you were singing badly\nand you knew it" },
        { id: "f3", kind: "title", x: 70, y: 26, w: 26, rotate: -1, z: 5, text: "Recorded in the car" },
        { id: "f4", kind: "photo", x: 74, y: 60, w: 26, rotate: 4, z: 3, imageUrl: img("f1"), caption: "somewhere near the coast" },
        { id: "f5", kind: "tape", x: 63, y: 47, w: 11, rotate: 88, z: 6 },
        { id: "f6", kind: "star", x: 26, y: 22, w: 4, rotate: 0, z: 5 },
        { id: "f7", kind: "leaf", x: 20, y: 82, w: 8, rotate: 32, z: 3 },
      ],
    },

    /* 7 — the letter: one folded envelope, almost nothing else */
    {
      id: "sp-7",
      theme: "academia",
      tab: "the letter",
      items: [
        { id: "g1", kind: "letter", x: 32, y: 50, w: 24, rotate: -3, z: 4, hiddenText: "Ana,\n\nI wrote this in December and never gave it to you.\n\nI wanted to say that the ordinary days are the ones I keep — the ones where nothing happens and you're just there, humming in the next room.\n\nI don't need the big moments. I already have the small ones.\n\n— always" },
        { id: "g2", kind: "note", x: 33, y: 78, w: 22, rotate: 2, z: 4, text: "go on, open it" },
        { id: "g3", kind: "journal", x: 74, y: 48, w: 28, rotate: 1, z: 3, text: "I found this in the back of a notebook while making this scrapbook.\n\nIt seemed like the right place for it, finally." },
        { id: "g4", kind: "clip", x: 62, y: 30, w: 4, rotate: -8, z: 6 },
        { id: "g5", kind: "stamp", x: 78, y: 80, w: 15, rotate: -3, z: 4, meta: "DEC 2024" },
      ],
    },

    /* 8 — one image, one sentence, and room to breathe */
    {
      id: "sp-8",
      theme: "minimal",
      tab: "",
      items: [
        { id: "h1", kind: "photo", x: 38, y: 48, w: 46, rotate: -1, z: 3, imageUrl: img("h1") },
        { id: "h2", kind: "note", x: 74, y: 74, w: 26, rotate: 1, z: 4, text: "this is the one I look at" },
      ],
    },
  ],

  closingNote: "Our scrapbook isn't finished.",
  closingSubnote: "There are still blank pages waiting for us.",
  closingImageUrl: img("closing"),
});
