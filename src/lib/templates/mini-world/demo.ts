import { memoryverseDemo } from "../memoryverse/demo";
import { loveLetterDemo } from "../love-letter/demo";
import { openWhenDemo } from "../open-when/demo";
import { countdownGiftDemo } from "../countdown-gift/demo";
import { memoryPuzzleDemo } from "../memory-puzzle/demo";
import { treasureHuntDemo } from "../treasure-hunt/demo";

/**
 * Mini World — the sample world.
 *
 * Its buildings hold the *other demos*, unchanged — the same objects
 * `/demo/love-letter` and `/demo/memoryverse` serve on their own. That is not a
 * shortcut, it is the claim the flagship makes: these are the experiences you
 * already know, arranged into a place. Writing separate sample content would
 * have made the walkthrough an advert for something that doesn't exist, and left
 * a second set of samples to rot.
 *
 * Imported from each template's own `demo.ts` rather than through `demos.ts`,
 * which imports this file — the direct route has no cycle in it.
 *
 * The layout is hand-placed rather than spiralled. The Picture House sits front
 * and centre because it is where the story starts; the Clock Tower is furthest
 * back because it is about waiting; the Ranger's Hut is off in the trees. A world
 * whose buildings were evenly spaced would be a menu.
 */
export const miniWorldDemo = {
  world: "cozy-town",

  recipient: "Noor",
  from: "Ellis",
  title: "Welcome to Our Mini World",
  subtitle: "Four years, one small town. Take any street you like.",
  musicUrl: "",

  characters: [
    {
      id: "mw-c1",
      name: "Noor",
      skin: 3,
      hair: "long",
      hairColor: 0,
      outfit: "dress",
      outfitColor: 0,
      hat: "flower",
      glasses: false,
      prop: "flowers",
    },
    {
      id: "mw-c2",
      name: "Ellis",
      skin: 1,
      hair: "curly",
      hairColor: 1,
      outfit: "hoodie",
      outfitColor: 1,
      hat: "beanie",
      glasses: true,
      prop: "camera",
    },
  ],

  districts: [
    {
      id: "mw-d1",
      type: "memoryverse",
      label: "The Picture House",
      content: memoryverseDemo,
      x: 30,
      y: 62,
      depth: 1,
      locked: false,
    },
    {
      id: "mw-d2",
      type: "love-letter",
      label: "Post Office",
      content: loveLetterDemo,
      x: 58,
      y: 58,
      depth: 1,
      locked: false,
    },
    {
      id: "mw-d3",
      type: "open-when",
      label: "Open When Street",
      content: openWhenDemo,
      x: 16,
      y: 80,
      depth: 2,
      locked: false,
    },
    {
      id: "mw-d4",
      type: "countdown-gift",
      label: "The Clock Tower",
      content: countdownGiftDemo,
      x: 74,
      y: 44,
      depth: 0,
      locked: false,
    },
    {
      id: "mw-d5",
      type: "memory-puzzle",
      label: "The Workshop",
      content: memoryPuzzleDemo,
      x: 47,
      y: 82,
      depth: 2,
      locked: false,
    },
    {
      id: "mw-d6",
      type: "treasure-hunt",
      label: "Ranger's Hut",
      content: treasureHuntDemo,
      x: 88,
      y: 74,
      depth: 2,
      locked: false,
    },
  ],

  secret: "treehouse",
  secretTitle: "You found it.",
  secretMessage:
    "I built the rest of this so you'd have somewhere to wander, but I built this bit so I'd have somewhere to say it.\n\nFour years, and I still take the long way home when I know you're in.",
  endingLine: "Some stories deserve their own world.",
};
