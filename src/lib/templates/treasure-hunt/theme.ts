/**
 * Treasure Hunt — "the map somebody drew for you".
 *
 * The object this replaces is a hand-drawn map with a route across it and an X at
 * the end — the kind a person makes on the back of an envelope when they've hidden
 * something in the house. Its identity is *parchment under a lantern*: warm ink,
 * gold, deep green, leather, and a route that draws itself.
 *
 * Distinct from everything else here by having a **place you move through**. Memory
 * Puzzle is one object on a table; Countdown Gift is a grid on a wall; Surprise
 * Reveal Box is one box unwrapped over and over. This one is a journey with stops,
 * and the screen is a map rather than a thing.
 */

/* ------------------------------------------------------------------ */
/* Map styles — the paper the route is drawn on                        */
/* ------------------------------------------------------------------ */

export const MAP_STYLE_IDS = [
  "vintageTreasure",
  "fantasy",
  "passport",
  "cityModern",
  "forest",
  "nightSky",
  "island",
  "journal",
  "scrapbookRoute",
] as const;
export type MapStyleId = (typeof MAP_STYLE_IDS)[number];

export interface MapStyle {
  label: string;
  /** The room the map is lying in. */
  room: string;
  /** The paper itself. */
  paper: string;
  /** Its edge, and the shadow it casts. */
  paperEdge: string;
  /** Ink drawn on the paper. */
  ink: string;
  inkSoft: string;
  /** Gold, brass, the route, the X. */
  gilt: string;
  giltSoft: string;
  /** Lantern light and anything glowing. */
  glow: string;
  /** What the terrain behind the route looks like. */
  terrain: "coast" | "hills" | "grid" | "trees" | "stars" | "isles" | "ruled" | "collage";
  /** Whether the paper is a light or dark surface — decides which ink reads. */
  dark: boolean;
}

export const MAP_STYLES: Record<MapStyleId, MapStyle> = {
  vintageTreasure: {
    label: "Vintage treasure map",
    room: "radial-gradient(ellipse 70% 54% at 50% 6%, #40301c 0%, #241a0f 46%, #120c06 100%)",
    paper: "linear-gradient(158deg, #efdcb4 0%, #e2c894 52%, #d4b47c 100%)",
    paperEdge: "rgba(96,64,28,.5)",
    ink: "#4a3418",
    inkSoft: "rgba(74,52,24,.62)",
    gilt: "#9c6a24",
    giltSoft: "rgba(156,106,36,.28)",
    glow: "rgba(255,206,122,.9)",
    terrain: "coast",
    dark: false,
  },
  fantasy: {
    label: "Fantasy map",
    room: "radial-gradient(ellipse 70% 54% at 50% 6%, #2a2c40 0%, #1a1b2c 46%, #0e0f1a 100%)",
    paper: "linear-gradient(158deg, #e6dcc4 0%, #d4c8a8 52%, #c0b48e 100%)",
    paperEdge: "rgba(60,56,40,.5)",
    ink: "#3a3628",
    inkSoft: "rgba(58,54,40,.6)",
    gilt: "#7a5c9c",
    giltSoft: "rgba(122,92,156,.28)",
    glow: "rgba(206,190,255,.85)",
    terrain: "hills",
    dark: false,
  },
  passport: {
    label: "Travel passport",
    room: "radial-gradient(ellipse 70% 54% at 50% 6%, #2c3a48 0%, #1c2630 46%, #0f151b 100%)",
    paper: "linear-gradient(158deg, #f2ece0 0%, #e4dccc 52%, #d2c8b4 100%)",
    paperEdge: "rgba(40,58,72,.44)",
    ink: "#26323c",
    inkSoft: "rgba(38,50,60,.6)",
    gilt: "#2c6a8c",
    giltSoft: "rgba(44,106,140,.26)",
    glow: "rgba(180,224,248,.85)",
    terrain: "grid",
    dark: false,
  },
  cityModern: {
    label: "Modern city map",
    room: "radial-gradient(ellipse 70% 54% at 50% 6%, #34383c 0%, #22262a 46%, #121416 100%)",
    paper: "linear-gradient(158deg, #f4f2ee 0%, #e6e4de 52%, #d2d0c8 100%)",
    paperEdge: "rgba(40,44,48,.4)",
    ink: "#2a2e32",
    inkSoft: "rgba(42,46,50,.6)",
    gilt: "#c05a3c",
    giltSoft: "rgba(192,90,60,.24)",
    glow: "rgba(255,214,190,.82)",
    terrain: "grid",
    dark: false,
  },
  forest: {
    label: "Fantasy forest",
    room: "radial-gradient(ellipse 70% 54% at 50% 6%, #24382a 0%, #16241a 46%, #0a1410 100%)",
    paper: "linear-gradient(158deg, #e4e2c8 0%, #d0d0b0 52%, #b8bc98 100%)",
    paperEdge: "rgba(34,56,40,.5)",
    ink: "#2a3a2c",
    inkSoft: "rgba(42,58,44,.62)",
    gilt: "#5c7a3c",
    giltSoft: "rgba(92,122,60,.28)",
    glow: "rgba(216,248,190,.85)",
    terrain: "trees",
    dark: false,
  },
  nightSky: {
    label: "Night sky",
    room: "radial-gradient(ellipse 70% 54% at 50% 6%, #1e2044 0%, #12142c 46%, #080916 100%)",
    paper: "linear-gradient(158deg, #202244 0%, #16183a 52%, #0e102a 100%)",
    paperEdge: "rgba(214,190,120,.34)",
    ink: "#eee6cc",
    inkSoft: "rgba(238,230,204,.62)",
    gilt: "#e2c06a",
    giltSoft: "rgba(226,192,106,.3)",
    glow: "rgba(255,232,168,.9)",
    terrain: "stars",
    dark: true,
  },
  island: {
    label: "Island adventure",
    room: "radial-gradient(ellipse 70% 54% at 50% 6%, #1c4450 0%, #123038 46%, #081a20 100%)",
    paper: "linear-gradient(158deg, #f0e2c0 0%, #e0cc9c 52%, #ccb684 100%)",
    paperEdge: "rgba(20,68,80,.46)",
    ink: "#3c4a3a",
    inkSoft: "rgba(60,74,58,.6)",
    gilt: "#c07a2c",
    giltSoft: "rgba(192,122,44,.26)",
    glow: "rgba(255,222,150,.88)",
    terrain: "isles",
    dark: false,
  },
  journal: {
    label: "Old journal",
    room: "radial-gradient(ellipse 70% 54% at 50% 6%, #3a2c22 0%, #241a14 46%, #120c09 100%)",
    paper: "linear-gradient(158deg, #f2ead6 0%, #e6dcc2 52%, #d6caac 100%)",
    paperEdge: "rgba(80,58,36,.46)",
    ink: "#3e3020",
    inkSoft: "rgba(62,48,32,.6)",
    gilt: "#8a5c2c",
    giltSoft: "rgba(138,92,44,.26)",
    glow: "rgba(255,220,164,.86)",
    terrain: "ruled",
    dark: false,
  },
  scrapbookRoute: {
    label: "Scrapbook route",
    room: "radial-gradient(ellipse 70% 54% at 50% 6%, #4a3a2c 0%, #2e241a 46%, #17110c 100%)",
    paper: "linear-gradient(158deg, #f6ecd8 0%, #e8d8b8 52%, #d8c49c 100%)",
    paperEdge: "rgba(90,64,36,.44)",
    ink: "#42361f",
    inkSoft: "rgba(66,54,31,.6)",
    gilt: "#a8703c",
    giltSoft: "rgba(168,112,60,.26)",
    glow: "rgba(255,226,176,.86)",
    terrain: "collage",
    dark: false,
  },
};

/* ------------------------------------------------------------------ */
/* Journey themes — what the adventure is *for*                        */
/* ------------------------------------------------------------------ */

export const JOURNEY_IDS = [
  "romantic",
  "birthday",
  "travel",
  "proposal",
  "friendship",
  "family",
  "christmas",
  "graduation",
] as const;
export type JourneyId = (typeof JOURNEY_IDS)[number];

/**
 * Visual ambience only.
 *
 * The brief asks for wind, birds, waves, campfire. Kindloop ships no audio files
 * and inventing them would mean shipping megabytes of stock loops nobody chose —
 * so ambience here is what you can *see* (leaves drifting, fireflies, snow) and a
 * creator may attach their own track if they want sound. Honest, and it keeps the
 * page light.
 */
export type Ambience = "fireflies" | "leaves" | "waves" | "snow" | "embers" | "stars" | "none";

export interface Journey {
  label: string;
  /** The words this kind of adventure opens with, unless the creator writes their own. */
  opening: [string, string];
  /** What it says once the chest is open. */
  ending: string;
  /** A sensible map to start from. */
  map: MapStyleId;
  ambience: Ambience;
  /** What the stops are called on this kind of journey. */
  stopWord: string;
}

export const JOURNEYS: Record<JourneyId, Journey> = {
  romantic: {
    label: "Romantic adventure",
    opening: ["I've hidden something for you.", "But you'll have to find it."],
    ending: "The treasure was never the prize. It was every memory we made along the way.",
    map: "vintageTreasure",
    ambience: "fireflies",
    stopWord: "stop",
  },
  birthday: {
    label: "Birthday quest",
    opening: ["Happy birthday. Now work for it.", "Five clues. No skipping."],
    ending: "Every year of you, hidden in five places.",
    map: "scrapbookRoute",
    ambience: "embers",
    stopWord: "clue",
  },
  travel: {
    label: "Travel hunt",
    opening: ["Every stamp in here is somewhere we've been.", "See if you remember them all."],
    ending: "Nine countries, one very patient travelling companion.",
    map: "passport",
    ambience: "waves",
    stopWord: "border",
  },
  proposal: {
    label: "Proposal journey",
    opening: ["There's something at the end of this.", "Take your time getting there."],
    ending: "Every place that got us here — and one more question at the end of it.",
    map: "fantasy",
    ambience: "stars",
    stopWord: "waypoint",
  },
  friendship: {
    label: "Friendship quest",
    opening: ["Right. You're going to hate this.", "Do it anyway."],
    ending: "Twenty years of this. God help us both.",
    map: "cityModern",
    ambience: "leaves",
    stopWord: "stop",
  },
  family: {
    label: "Family adventure",
    opening: ["We made you a map.", "It goes all the way back."],
    ending: "All of us, all the way back, in one place.",
    map: "journal",
    ambience: "leaves",
    stopWord: "chapter",
  },
  christmas: {
    label: "Christmas hunt",
    opening: ["Something's hidden in this house.", "The map is the only help you're getting."],
    ending: "Found it. Now come and eat something.",
    map: "forest",
    ambience: "snow",
    stopWord: "hiding place",
  },
  graduation: {
    label: "Graduation challenge",
    opening: ["Four years. One last exam.", "This one you'll enjoy."],
    ending: "You did the whole thing. Every bit of it was worth watching.",
    map: "island",
    ambience: "waves",
    stopWord: "milestone",
  },
};

/* ------------------------------------------------------------------ */
/* What a reward is pinned to the board as                             */
/* ------------------------------------------------------------------ */

export const PIN_IDS = ["polaroid", "stamp", "ticket", "stub", "flower", "note", "coin", "postcard"] as const;
export type PinId = (typeof PIN_IDS)[number];

export const PIN_LABELS: Record<PinId, string> = {
  polaroid: "Polaroid",
  stamp: "Passport stamp",
  ticket: "Ticket",
  stub: "Ticket stub",
  flower: "Pressed flower",
  note: "Torn note",
  coin: "Coin",
  postcard: "Postcard",
};

/* ------------------------------------------------------------------ */

/** Vintage ink, on parchment. */
export const DISPLAY_FONT = "var(--font-fraunces), Georgia, serif";
export const HAND_FONT = "var(--hw-vintage), cursive";
export const HAND_ALT_FONT = "var(--hw-classic), cursive";
export const MONO_FONT = "var(--font-ibm-plex-mono), ui-monospace, monospace";
export const BODY_FONT = "var(--font-space-grotesk), system-ui, sans-serif";
