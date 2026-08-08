import { memoryverseDemo } from "../memoryverse/demo";
import { loveLetterDemo } from "../love-letter/demo";
import { memoryPuzzleDemo } from "../memory-puzzle/demo";
import { countdownGiftDemo } from "../countdown-gift/demo";

/**
 * The sample Personalized Website.
 *
 * Its sections are the *other demos*, unchanged — the same objects `/demo/love-letter`
 * and `/demo/memoryverse` serve on their own. Writing fresh sample content here
 * would have meant a second set of samples to keep good, and the first time one
 * drifted the walkthrough would be advertising something that no longer exists.
 * This way, improving any experience's demo improves this one for free, and the
 * page is an honest claim: these are those experiences, arranged.
 *
 * Imported from each template's `demo.ts` rather than through `demos.ts`, which
 * imports this file — the direct route has no cycle in it.
 *
 * The running order is the arc a real one tends to have: where it started, how
 * it feels, something to do with your hands, and then what's coming. Memory
 * Puzzle is in there on purpose — it is a paid section, and a walkthrough that
 * quietly showed only the free ones would be selling the wrong product.
 */
/**
 * The backdrop behind the opening.
 *
 * Drawn rather than photographed, and local rather than fetched. Every stock
 * frame that fits "warm landscape" reads as a travel site, which is the wrong
 * product entirely — Kindloop's look is pressed flowers, paper and polaroid
 * corners. It renders at a third opacity under the title, so it is built to lose:
 * the detail sits in the corners and the middle stays quiet behind the words.
 */
const heroImage = "/demo/hero-blossoms.svg";

export const personalizedWebsiteDemo = {
  theme: "romantic",

  recipient: "Ana",
  from: "Sam",
  title: "Four years, more or less in order",
  subtitle:
    "I couldn't work out which one to send you, so this is all of them. Start at the top.",
  heroImageUrl: heroImage,
  intro: "curtain",
  musicUrl: "",

  sections: [
    { id: "demo-1", type: "memoryverse", content: memoryverseDemo, locked: false },
    { id: "demo-2", type: "love-letter", content: loveLetterDemo, locked: false },
    { id: "demo-3", type: "memory-puzzle", content: memoryPuzzleDemo, locked: false },
    { id: "demo-4", type: "countdown-gift", content: countdownGiftDemo, locked: false },
  ],

  endingTitle: "…and that's only the part I could fit on a page.",
  endingNote:
    "Four years of it, and I still find things I forgot to tell you. There'll be another one of these.",
};
