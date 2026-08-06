import { treasureHuntContentSchema, type TreasureHuntContent } from "./schema";

/**
 * The public walkthrough.
 *
 * Five stops rather than fifteen, and every answer is either given away in its own
 * clue or is a multiple choice — a visitor has no way of knowing a stranger's
 * anniversary, and a demo that can't be finished demonstrates nothing. The clue
 * *types* are what's on show: a letter, a blurred photograph, candles, a lock and
 * a hidden key, so five of the twelve are covered in about two minutes.
 */
export const treasureHuntDemo: TreasureHuntContent = treasureHuntContentSchema.parse({
  journey: "romantic",
  map: "vintageTreasure",

  title: "A map, for you",
  openingLines: ["I've hidden something for you.", "But you'll have to find it."],

  stops: [
    {
      id: "s-1",
      pin: "note",
      aside: "Start of the trail.",
      clue: {
        kind: "letter",
        place: "The kitchen table",
        prompt:
          "You're holding a map I drew badly at the kitchen table, which is where most of this starts.\n\nThere are five places on it. You've been to all of them with me. Follow it in order and don't skip ahead — I'll know.",
      },
      reward: {
        id: "s-1-r",
        kind: "text",
        title: "Where it starts",
        body: "The table with the wobbly leg. Four years of arguing about whether to fix it.",
      },
    },
    {
      id: "s-2",
      pin: "polaroid",
      aside: "You always get this one.",
      clue: {
        kind: "photo",
        place: "The harbour steps",
        prompt: "You know this place. Say its name and it'll come into focus.",
        imageUrl: "https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=1000",
        answer: "the harbour",
        nudge: "It's written on the map, two words, right where you're standing.",
      },
      reward: {
        id: "s-2-r",
        kind: "photo",
        title: "The morning we missed the ferry",
        body: "You laughed for a full minute. I was furious. You were right.",
        imageUrl: "https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=1000",
      },
    },
    {
      id: "s-3",
      pin: "flower",
      aside: "Five candles, five years.",
      clue: {
        kind: "candles",
        place: "The long table",
        prompt: "Light them left to right, the way we always do.",
      },
      reward: {
        id: "s-3-r",
        kind: "quote",
        body: "We didn't do anything that day. That was the whole point of it.",
        credit: "you, on the steps, eating a bad pastry",
      },
    },
    {
      id: "s-4",
      pin: "stamp",
      aside: "Told you it was a date you'd know.",
      clue: {
        kind: "combination",
        place: "The lock-up",
        prompt: "Three digits. It's the day we moved in — the fourth of the second.",
        code: "402",
        nudge: "Four, zero, two.",
      },
      reward: {
        id: "s-4-r",
        kind: "map",
        title: "The harbour steps",
        place: "Howth, County Dublin",
        lat: 53.3906,
        lng: -6.0669,
        body: "Third step from the bottom. The one that's always wet.",
      },
    },
    {
      id: "s-5",
      pin: "coin",
      aside: "Last one.",
      clue: {
        kind: "key",
        place: "The last place",
        prompt: "There's a key on this page. It's not hiding very hard.",
      },
      reward: {
        id: "s-5-r",
        kind: "text",
        title: "The key",
        body: "It opens the thing at the end of the map. Go on.",
      },
    },
  ],

  chestPlate: "For you",
  treasure: {
    id: "treasure",
    kind: "letter",
    title: "",
    body:
      "A map is a ridiculous way to give someone a present, and I knew that when I started drawing it.\n\nBut you're the only person I know who would actually follow it — all five stops, in order, without skipping — and that is precisely the thing I wanted to say. So: I booked the coast house. The whole week, not the weekend.\n\nThe treasure was never the prize.",
  },
  treasureLinkLabel: "",
  treasureLinkUrl: "",

  closingLine: "The treasure was never the prize. It was every memory we made along the way.",
});
