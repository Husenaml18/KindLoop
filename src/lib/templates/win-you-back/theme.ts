/**
 * Operation: Win You Back — the look.
 *
 * Deliberately the softest palette in the catalogue. Everything else here is
 * kraft and ink; this one is the inside of a stationery shop — dusty rose, butter,
 * sky, mint. That is not decoration, it is the argument: the whole risk of an
 * experience about having messed up is that it reads as heavy, and heavy is where
 * an apology turns into pressure.
 *
 * Not a client module. The schema reads these ids on the server, and exports from
 * a `"use client"` file arrive there as reference proxies with nothing in them.
 */

export const MOOD_IDS = ["rose", "butter", "sky", "mint"] as const;
export type MoodId = (typeof MOOD_IDS)[number];

export interface Mood {
  id: MoodId;
  label: string;
  /** The room. */
  bg: string;
  /** Paper laid on it. */
  paper: string;
  paperEdge: string;
  ink: string;
  inkSoft: string;
  /** The one saturated colour, used sparingly. */
  accent: string;
  accentSoft: string;
  /** Sticky notes, in the order they get used. */
  stickies: [string, string, string];
}

export const MOODS: Record<MoodId, Mood> = {
  rose: {
    id: "rose",
    label: "Dusty rose",
    bg: "radial-gradient(ellipse 80% 60% at 50% 0%, #ffe8ea, #fbd9dd 46%, #f3c9d0 100%)",
    paper: "#fffcf8",
    paperEdge: "rgba(140,94,100,.16)",
    ink: "#5d3b42",
    inkSoft: "#8b6a70",
    accent: "#d4697c",
    accentSoft: "rgba(212,105,124,.14)",
    stickies: ["#ffd9c9", "#ffeeb8", "#d6ecd8"],
  },
  butter: {
    id: "butter",
    label: "Butter",
    bg: "radial-gradient(ellipse 80% 60% at 50% 0%, #fff5da, #ffecc4 46%, #f7e0ae 100%)",
    paper: "#fffdf6",
    paperEdge: "rgba(140,116,70,.16)",
    ink: "#5a4526",
    inkSoft: "#8a7452",
    accent: "#d99340",
    accentSoft: "rgba(217,147,64,.14)",
    stickies: ["#ffe2b0", "#ffd7d0", "#dceccb"],
  },
  sky: {
    id: "sky",
    label: "Sky",
    bg: "radial-gradient(ellipse 80% 60% at 50% 0%, #e6f2ff, #d6e8fb 46%, #c4dcf3 100%)",
    paper: "#fbfdff",
    paperEdge: "rgba(88,110,140,.16)",
    ink: "#37485f",
    inkSoft: "#66788f",
    accent: "#5b8ec9",
    accentSoft: "rgba(91,142,201,.14)",
    stickies: ["#cfe6f7", "#ffe6c9", "#ffd6dc"],
  },
  mint: {
    id: "mint",
    label: "Mint",
    bg: "radial-gradient(ellipse 80% 60% at 50% 0%, #e6f7ee, #d5efe1 46%, #c3e5d3 100%)",
    paper: "#fbfffc",
    paperEdge: "rgba(74,122,98,.16)",
    ink: "#33513f",
    inkSoft: "#5f8570",
    accent: "#4f9e75",
    accentSoft: "rgba(79,158,117,.14)",
    stickies: ["#d3ecd9", "#ffeab6", "#ffd8d2"],
  },
};

/** The little doodles the creator can pin to things. */
export const DOODLE_IDS = [
  "heart",
  "star",
  "flower",
  "cloud",
  "arrow",
  "plane",
  "coffee",
  "sparkle",
] as const;
export type DoodleId = (typeof DOODLE_IDS)[number];

/** What the sender was, in the comic. Chosen once, drawn everywhere. */
export const CHARACTER_IDS = ["bean", "cat", "bird", "ghost"] as const;
export type CharacterId = (typeof CHARACTER_IDS)[number];

export const CHARACTER_LABELS: Record<CharacterId, string> = {
  bean: "A small bean",
  cat: "A guilty cat",
  bird: "An anxious bird",
  ghost: "A soft ghost",
};

/** The six chapters, in order. Titles are fixed; the words in them are not. */
export const CHAPTERS = [
  { id: "oops", title: "What happened", heading: "Oops." },
  { id: "replay", title: "What I was thinking", heading: "The replay." },
  { id: "shouldve", title: "What I should've done", heading: "I should've…" },
  { id: "miss", title: "The things I miss", heading: "Things I miss." },
  { id: "promise", title: "The promise", heading: "Promises, written down." },
  { id: "letter", title: "One last question", heading: "One last thing." },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];
