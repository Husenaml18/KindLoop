import { memoryPuzzleContentSchema, type MemoryPuzzleContent } from "./schema";

/**
 * The public walkthrough.
 *
 * Deliberately a 3 × 3 on Easy: a visitor with no stake in the memory will not
 * sit through a 10 × 10, and the point of the demo is to show what unlocking
 * feels like — not to test anyone's patience. Everything else is complete, so all
 * four milestones and a hidden secret are reachable in about a minute.
 */
export const memoryPuzzleDemo: MemoryPuzzleContent = memoryPuzzleContentSchema.parse({
  surface: "woodDesk",
  material: "wood",
  cut: "jigsaw",
  size: 3,
  difficulty: "easy",

  boxLabel: "Open me slowly",
  openingLines: ["I hid something inside.", "The only way to see it…", "…is to put the pieces together."],

  imageUrl: "https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=1200",
  imageAlt: "The two of us on the harbour steps, the morning we missed the ferry",

  milestones: [
    {
      at: 25,
      headline: "It's starting to look like something.",
      reward: {
        id: "m-25",
        kind: "text",
        title: "",
        body: "You've probably guessed which day this is.\n\nI've had the photo on my phone for four years and never printed it. This felt better than printing it.",
      },
    },
    {
      at: 50,
      headline: "Halfway. Here's the bit I couldn't write down.",
      reward: {
        id: "m-50",
        kind: "quote",
        body: "We didn't do anything that day. That was the whole point of it.",
        credit: "you, on the steps, eating a bad pastry",
      },
    },
    {
      at: 75,
      headline: "Nearly. This is where we were.",
      reward: {
        id: "m-75",
        kind: "map",
        title: "The harbour steps",
        place: "Howth, County Dublin",
        lat: 53.3906,
        lng: -6.0669,
        body: "Third step from the bottom. The one that's always wet.",
      },
    },
    {
      at: 100,
      headline: "There it is.",
      reward: {
        id: "m-100",
        kind: "letter",
        title: "",
        body:
          "I know a puzzle is a strange way to give someone a photograph.\n\nBut you're the most patient person I've ever met, and I wanted to make something that only worked if someone was willing to sit with it for a while. That's you. That's the whole thing.\n\nI'm glad you stayed until the end.",
      },
    },
  ],

  secrets: [
    { id: "s-1", piece: 4, kind: "quote", text: "You said the pastry was fine. It was not fine." },
    { id: "s-2", piece: 0, kind: "flower", text: "There were daisies growing out of the wall. You noticed first." },
    { id: "s-3", piece: 8, kind: "date", text: "11 September, 2021. A Saturday." },
  ],

  closingLine: "I'm glad you stayed until the end.",
  framedCaption: "The best memories are the ones we build together.",
});
