/**
 * Mini World — the atlas.
 *
 * Seven worlds, six secret places, and the rule that binds them: a world is a
 * *setting*, never a skin on the experiences inside it. The sky, the ground, the
 * weather and the props all belong to the world; the moment somebody opens a
 * building, that experience renders exactly as it does anywhere else in Kindloop,
 * in its own colours. A Cherry Blossom Village that repainted Love Letter pink
 * would have destroyed the one thing that makes a catalogue of ten distinct
 * things worth walking through.
 *
 * Not a client module. The schema reads these ids on the server, and exports from
 * a `"use client"` file arrive there as reference proxies with nothing in them.
 */

export const WORLD_IDS = [
  "cozy-town",
  "cherry-blossom",
  "beach-island",
  "cosmic",
  "fairytale",
  "memory-park",
  "railway",
] as const;
export type WorldId = (typeof WORLD_IDS)[number];

/** Which bits of ambient life a world runs. Drawn in `parts.tsx`. */
export type AmbienceId =
  | "clouds"
  | "birds"
  | "petals"
  | "lanterns"
  | "stars"
  | "boats"
  | "train"
  | "fireflies"
  | "windmill"
  | "ferris";

export interface World {
  id: WorldId;
  emoji: string;
  label: string;
  blurb: string;
  /** Who it is for, in the picker. */
  bestFor: string;

  /* ---- the scene, back to front ---- */
  sky: string;
  /** The far silhouette band — hills, dunes, spires. */
  far: string;
  /** The ground the buildings stand on. */
  ground: string;
  /** A softer band under the near layer, for depth. */
  groundNear: string;

  /* ---- ink and light ---- */
  ink: string;
  inkSoft: string;
  accent: string;
  accentSoft: string;
  /** Every lit window and lantern in this world. */
  glow: string;
  /** Walls of the little buildings, and their roofs. */
  wall: string;
  wallShade: string;
  roof: string;
  roofShade: string;
  /** Trees, hedges, seaweed — whatever grows here. */
  foliage: string;
  foliageDeep: string;

  ambience: AmbienceId[];
  /** Night worlds get a darker vignette and brighter windows. */
  night: boolean;
}

export const WORLDS: Record<WorldId, World> = {
  "cozy-town": {
    id: "cozy-town",
    emoji: "🏡",
    label: "Cozy Town",
    blurb: "Tiny cafés, string lights, a bookshop that never closes.",
    bestFor: "Couples",
    sky: "linear-gradient(180deg, #2c3550 0%, #4a4a63 34%, #8a6a63 68%, #c98f66 100%)",
    far: "#3b3f57",
    ground: "linear-gradient(180deg, #574a44 0%, #463b37 100%)",
    groundNear: "#3a312e",
    ink: "#f4e6cf",
    inkSoft: "#c3ac91",
    accent: "#e8a552",
    accentSoft: "rgba(232,165,82,.18)",
    glow: "#ffcf87",
    wall: "#e6d3b4",
    wallShade: "#c4ab88",
    roof: "#9c5b45",
    roofShade: "#7d4534",
    foliage: "#5c7a52",
    foliageDeep: "#3f5a39",
    ambience: ["clouds", "lanterns", "fireflies", "birds"],
    night: true,
  },
  "cherry-blossom": {
    id: "cherry-blossom",
    emoji: "🌸",
    label: "Cherry Blossom Village",
    blurb: "Pink trees, floating petals, sunlight that never quite leaves.",
    bestFor: "Romantic gifts",
    sky: "linear-gradient(180deg, #ffe6ef 0%, #ffd8e0 38%, #ffd0be 72%, #ffc9a8 100%)",
    far: "#e8b0bd",
    ground: "linear-gradient(180deg, #b9c58f 0%, #9aab73 100%)",
    groundNear: "#87995f",
    ink: "#5c3742",
    inkSoft: "#8b6470",
    accent: "#d9647f",
    accentSoft: "rgba(217,100,127,.14)",
    glow: "#fff0b8",
    wall: "#fdf3e6",
    wallShade: "#e4d2c0",
    roof: "#c9697c",
    roofShade: "#a54f61",
    foliage: "#f2a6bd",
    foliageDeep: "#d67f9c",
    ambience: ["petals", "birds", "clouds", "lanterns"],
    night: false,
  },
  "beach-island": {
    id: "beach-island",
    emoji: "🌊",
    label: "Beach Island",
    blurb: "A lighthouse, a dock, and a bonfire that stays lit.",
    bestFor: "Holidays and summers",
    sky: "linear-gradient(180deg, #ffd9a0 0%, #ffb98a 30%, #f08e7d 60%, #8e6f8f 100%)",
    far: "#7b6a90",
    ground: "linear-gradient(180deg, #4a8ba0 0%, #2f6b85 100%)",
    groundNear: "#e6d3a8",
    ink: "#3d2f3a",
    inkSoft: "#75626e",
    accent: "#e07a4f",
    accentSoft: "rgba(224,122,79,.16)",
    glow: "#ffdc9a",
    wall: "#fbf0dd",
    wallShade: "#ddcdb4",
    roof: "#4f8496",
    roofShade: "#3a6a7c",
    foliage: "#6b9b62",
    foliageDeep: "#4c7a48",
    ambience: ["boats", "birds", "clouds", "lanterns"],
    night: false,
  },
  cosmic: {
    id: "cosmic",
    emoji: "🌌",
    label: "Cosmic Universe",
    blurb: "Islands adrift, constellations you can name yourselves.",
    bestFor: "Dreamers",
    sky: "linear-gradient(180deg, #0e1030 0%, #221a4a 42%, #3d2258 74%, #55305c 100%)",
    far: "#2a2050",
    ground: "linear-gradient(180deg, #3a2a5e 0%, #251a44 100%)",
    groundNear: "#1c1436",
    ink: "#e8e2ff",
    inkSoft: "#a99fd0",
    accent: "#9b8cf0",
    accentSoft: "rgba(155,140,240,.2)",
    glow: "#c9d8ff",
    wall: "#cfc6f0",
    wallShade: "#a89ecb",
    roof: "#6e5aa8",
    roofShade: "#54438a",
    foliage: "#5f7fb0",
    foliageDeep: "#43608c",
    ambience: ["stars", "fireflies", "clouds"],
    night: true,
  },
  fairytale: {
    id: "fairytale",
    emoji: "🏰",
    label: "Fairytale Kingdom",
    blurb: "Castles, a bridge that glows, lanterns all the way up.",
    bestFor: "Proposals",
    sky: "linear-gradient(180deg, #2a2a55 0%, #4b3568 38%, #7d4a72 70%, #b9707a 100%)",
    far: "#3f3163",
    ground: "linear-gradient(180deg, #4b5b52 0%, #38463f 100%)",
    groundNear: "#2c3830",
    ink: "#f6e8d8",
    inkSoft: "#c6ae9d",
    accent: "#dfa055",
    accentSoft: "rgba(223,160,85,.18)",
    glow: "#ffd694",
    wall: "#e9dcc6",
    wallShade: "#c8b79d",
    roof: "#7a5a96",
    roofShade: "#5d4278",
    foliage: "#4f6b4c",
    foliageDeep: "#374f36",
    ambience: ["lanterns", "stars", "fireflies", "clouds"],
    night: true,
  },
  "memory-park": {
    id: "memory-park",
    emoji: "🎡",
    label: "Memory Park",
    blurb: "A ferris wheel, a bandstand, and everything lit at once.",
    bestFor: "Birthdays",
    sky: "linear-gradient(180deg, #1f2a4a 0%, #3d3160 36%, #7a4a63 70%, #c1735f 100%)",
    far: "#332a52",
    ground: "linear-gradient(180deg, #4c4a58 0%, #3a3a44 100%)",
    groundNear: "#2f2f38",
    ink: "#f6ead6",
    inkSoft: "#c5b19a",
    accent: "#e8734f",
    accentSoft: "rgba(232,115,79,.18)",
    glow: "#ffd47a",
    wall: "#ecdcc0",
    wallShade: "#cbb89a",
    roof: "#c2604f",
    roofShade: "#9c4a3c",
    foliage: "#57774f",
    foliageDeep: "#3c5837",
    ambience: ["ferris", "lanterns", "fireflies", "stars"],
    night: true,
  },
  railway: {
    id: "railway",
    emoji: "🚂",
    label: "Adventure Railway",
    blurb: "One little train, and every stop is somewhere you've been.",
    bestFor: "Long stories",
    sky: "linear-gradient(180deg, #b9d4e0 0%, #d6dfc9 40%, #efd9ad 74%, #e8bd8c 100%)",
    far: "#8fa398",
    ground: "linear-gradient(180deg, #7e9464 0%, #64784e 100%)",
    groundNear: "#55663f",
    ink: "#3a3325",
    inkSoft: "#6f6552",
    accent: "#b0663d",
    accentSoft: "rgba(176,102,61,.15)",
    glow: "#ffe0a0",
    wall: "#f3e6cd",
    wallShade: "#d5c5a8",
    roof: "#8a6340",
    roofShade: "#6b4b30",
    foliage: "#5d7f4c",
    foliageDeep: "#456138",
    ambience: ["train", "clouds", "birds", "windmill"],
    night: false,
  },
};

/* ------------------------------------------------------------------ */
/* The secret place                                                    */
/* ------------------------------------------------------------------ */

export const SECRET_IDS = [
  "garden",
  "mountain",
  "observatory",
  "lighthouse",
  "treehouse",
  "tower",
] as const;
export type SecretId = (typeof SECRET_IDS)[number];

export interface SecretPlace {
  id: SecretId;
  emoji: string;
  label: string;
  /** The line on the little sign outside it. */
  sign: string;
}

export const SECRET_PLACES: Record<SecretId, SecretPlace> = {
  garden: { id: "garden", emoji: "🌳", label: "Secret Garden", sign: "through the gate" },
  mountain: { id: "mountain", emoji: "🏔", label: "Hidden Mountain", sign: "up the long path" },
  observatory: { id: "observatory", emoji: "🌌", label: "Star Observatory", sign: "mind the steps" },
  lighthouse: { id: "lighthouse", emoji: "🌊", label: "The Lighthouse", sign: "follow the light" },
  treehouse: { id: "treehouse", emoji: "🏡", label: "The Treehouse", sign: "ladder's round the back" },
  tower: { id: "tower", emoji: "🏰", label: "Castle Tower", sign: "the top window" },
};

/* ------------------------------------------------------------------ */
/* The people who live here                                            */
/* ------------------------------------------------------------------ */

export const SKIN_TONES = ["#f2d3bb", "#e8bb95", "#c98d63", "#a06840", "#75492b", "#4d2f1c"] as const;
export const HAIR_COLORS = ["#2c2118", "#5a3a22", "#8c5a2b", "#c98b3f", "#d9d3c8", "#7a4a6a"] as const;
export const OUTFIT_COLORS = ["#c95f56", "#4f7fa8", "#5f8a56", "#d1a04a", "#8a6aa8", "#3d4550"] as const;

export const HAIR_IDS = ["short", "bob", "long", "bun", "curly", "buzz"] as const;
export type HairId = (typeof HAIR_IDS)[number];

export const OUTFIT_IDS = ["tee", "dress", "hoodie", "coat", "dungarees"] as const;
export type OutfitId = (typeof OUTFIT_IDS)[number];

export const HAT_IDS = ["none", "beanie", "cap", "sunhat", "flower"] as const;
export type HatId = (typeof HAT_IDS)[number];

export const PROP_IDS = ["none", "balloon", "camera", "book", "coffee", "flowers", "umbrella"] as const;
export type PropId = (typeof PROP_IDS)[number];

export const HAIR_LABELS: Record<HairId, string> = {
  short: "Short", bob: "Bob", long: "Long", bun: "Bun", curly: "Curly", buzz: "Buzzed",
};
export const OUTFIT_LABELS: Record<OutfitId, string> = {
  tee: "T-shirt", dress: "Dress", hoodie: "Hoodie", coat: "Long coat", dungarees: "Dungarees",
};
export const HAT_LABELS: Record<HatId, string> = {
  none: "No hat", beanie: "Beanie", cap: "Cap", sunhat: "Sun hat", flower: "Flower",
};
export const PROP_LABELS: Record<PropId, string> = {
  none: "Empty hands", balloon: "Balloon", camera: "Camera", book: "Book",
  coffee: "Coffee", flowers: "Flowers", umbrella: "Umbrella",
};

/* ------------------------------------------------------------------ */
/* Which building an experience lives in                               */
/* ------------------------------------------------------------------ */

export type RoofId = "gable" | "hip" | "flat" | "dome" | "tower" | "tent";

export interface Archetype {
  /** What the building is called on its little sign, if the sender writes nothing. */
  name: string;
  roof: RoofId;
  /** Footprint in stage units. Bigger buildings read as more important. */
  w: number;
  h: number;
  /** The one prop that makes it recognisable at a glance. */
  ornament: "projector" | "postbox" | "books" | "mailboxes" | "clock" | "gifts" | "gears" | "map" | "wreath" | "mask" | "plant" | "none";
}

/**
 * Every experience gets a place in the world.
 *
 * Keyed by template id, so an eleventh experience appearing in the registry needs
 * one line here and nothing else. Anything unmapped still gets a building — the
 * fallback is a plain cottage rather than a hole in the map.
 */
export const ARCHETYPES: Record<string, Archetype> = {
  memoryverse: { name: "The Picture House", roof: "hip", w: 17, h: 15, ornament: "projector" },
  "love-letter": { name: "Post Office", roof: "gable", w: 14, h: 14, ornament: "postbox" },
  "digital-scrapbook": { name: "The Library", roof: "gable", w: 18, h: 16, ornament: "books" },
  "open-when": { name: "Open When Street", roof: "flat", w: 16, h: 11, ornament: "mailboxes" },
  "countdown-gift": { name: "The Clock Tower", roof: "tower", w: 11, h: 22, ornament: "clock" },
  "surprise-reveal-box": { name: "The Gift Shop", roof: "gable", w: 14, h: 13, ornament: "gifts" },
  "memory-puzzle": { name: "The Workshop", roof: "hip", w: 15, h: 13, ornament: "gears" },
  "treasure-hunt": { name: "Ranger's Hut", roof: "tent", w: 14, h: 12, ornament: "map" },
  "mothers-day-letter": { name: "The Family House", roof: "gable", w: 15, h: 15, ornament: "wreath" },
  "win-you-back": { name: "The Little Theatre", roof: "dome", w: 15, h: 14, ornament: "mask" },
  "my-red-flags": { name: "The Greenhouse", roof: "dome", w: 14, h: 13, ornament: "plant" },
};

export const FALLBACK_ARCHETYPE: Archetype = {
  name: "The Cottage",
  roof: "gable",
  w: 13,
  h: 12,
  ornament: "none",
};

export function archetypeFor(templateId: string): Archetype {
  return ARCHETYPES[templateId] ?? FALLBACK_ARCHETYPE;
}
