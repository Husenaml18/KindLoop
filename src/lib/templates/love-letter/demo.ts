import { loveLetterContentSchema, type LoveLetterContent } from "./schema";

const img = (seed: string) => `https://picsum.photos/seed/kindloop-letter-${seed}/900/900`;

/**
 * The public walkthrough at /demo/love-letter. Written as a real letter, since
 * the whole experience rests on the words actually being worth reading slowly.
 */
export const loveLetterDemo: LoveLetterContent = loveLetterContentSchema.parse({
  paperStyle: "aged",
  paperColor: "cream",
  envelope: "vintage",
  sealColor: "burgundy",
  sealIcon: "heart",
  hand: "elegant",
  ink: "darkBrown",
  scent: "lavender",

  recipient: "For Ana",
  dateLine: "a Tuesday in March",
  greeting: "My dearest,",

  blocks: [
    {
      id: "b1",
      kind: "paragraph",
      text: "There are things I've been meaning to say properly, and a screen never felt like the right place for them.\nSo I'm writing them down instead, slowly, the way they deserve.",
    },
    {
      id: "b2",
      kind: "paragraph",
      text: "I keep thinking about the kitchen in Lisbon. You burned the rice and we ate it on the floor because there were no chairs, and you laughed so hard you had to put the plate down.\nI don't know why that's the one I keep. It just is.",
    },
    { id: "b3", kind: "photo", imageUrl: img("kitchen"), caption: "the rice, before" },
    {
      id: "b4",
      kind: "quote",
      text: "You'd already made me laugh twice before I knew your last name.",
    },
    {
      id: "b5",
      kind: "highlight",
      text: "I don't need the big moments. I already have the small ones.",
    },
    {
      id: "b6",
      kind: "paragraph",
      text: "People talk about love like it arrives all at once. Mine came in instalments — a hundred ordinary Tuesdays, one after another, none of them remarkable on their own.",
    },
    {
      id: "b7",
      kind: "folded",
      foldLabel: "this part I almost didn't write",
      text: "I was frightened of how much it mattered.\nI'm less frightened now. That's mostly your doing.",
    },
    {
      id: "b8",
      kind: "ps",
      text: "I still have the receipt from the first coffee. It's in a book somewhere, and I'm not going to look for it, because I like knowing it's there.",
    },
  ],

  closing: "Yours, always",
  signature: "S",
  finalLine: "I hope you keep this forever.",

  decorations: [
    { id: "d1", kind: "pressedFlower", x: 88, y: 12, w: 11, rotate: 18 },
    { id: "d2", kind: "leaf", x: 6, y: 78, w: 7, rotate: -28 },
    { id: "d3", kind: "coffeeStain", x: 82, y: 62, w: 16, rotate: 0 },
    { id: "d4", kind: "heart", x: 12, y: 22, w: 4, rotate: -12 },
    { id: "d5", kind: "petal", x: 22, y: 94, w: 5, rotate: 40 },
    { id: "d6", kind: "botanical", x: 70, y: 90, w: 22, rotate: -4 },
    { id: "d7", kind: "star", x: 94, y: 42, w: 3, rotate: 0 },
  ],

  marginNotes: [
    { id: "m1", text: "you'd hate how long this took me", y: 22, side: "right" },
    { id: "m2", text: "I rewrote this line four times", y: 58, side: "left" },
  ],

  writingSpeed: 140,
});
