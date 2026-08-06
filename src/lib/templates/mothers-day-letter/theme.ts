/**
 * Mother's Day Letter — "the letter you finally sat down and wrote".
 *
 * The object this replaces is not a card. It is a sheet of good stationery that
 * somebody's grown child bought specially, wrote on slowly, and posted — the kind
 * that ends up in a drawer and gets taken out every year.
 *
 * Its identity is *morning light on a kitchen table*: a cup of tea going cold,
 * baby's breath in a jar, knitted fabric, and a border of watercolour flowers that
 * blooms further the longer you read.
 *
 * Deliberately not the Love Letter, which is one restrained page in a dark room
 * with almost nothing on it. This one is warm, full, sunlit and unhurried, and it
 * is *sectioned* — a letter with chapters, photographs tucked between paragraphs
 * and small notes pinned round the edges.
 */

/* ------------------------------------------------------------------ */
/* Paper                                                              */
/* ------------------------------------------------------------------ */

export const PAPER_IDS = [
  "softFloral",
  "watercolourGarden",
  "classicCream",
  "vintageCotton",
  "pressedBotanical",
  "minimalWhite",
  "roseGarden",
  "wildflower",
  "washi",
  "handmade",
] as const;
export type PaperId = (typeof PAPER_IDS)[number];

export interface Paper {
  label: string;
  /** Printed or woven into the sheet, over the chosen colour. */
  pattern: (accent: string, soft: string) => string;
  /** How strongly the pattern sits on the paper, 0..1. */
  strength: number;
  /** A deckled edge, for the handmade stocks. */
  deckled: boolean;
  /** Visible fibres. */
  fibrous: boolean;
}

export const PAPERS: Record<PaperId, Paper> = {
  softFloral: {
    label: "Soft floral",
    pattern: (a, s) =>
      `radial-gradient(circle at 20% 24%, ${a} 2.4px, transparent 3px), radial-gradient(circle at 62% 68%, ${s} 3px, transparent 3.6px), radial-gradient(circle at 84% 32%, ${a} 1.8px, transparent 2.4px)`,
    strength: 0.3,
    deckled: false,
    fibrous: true,
  },
  watercolourGarden: {
    label: "Watercolour garden",
    pattern: (a, s) =>
      `radial-gradient(ellipse 40% 30% at 12% 16%, ${a}, transparent 70%), radial-gradient(ellipse 36% 26% at 88% 22%, ${s}, transparent 70%), radial-gradient(ellipse 44% 32% at 78% 86%, ${a}, transparent 70%), radial-gradient(ellipse 34% 24% at 16% 82%, ${s}, transparent 70%)`,
    strength: 0.42,
    deckled: true,
    fibrous: false,
  },
  classicCream: {
    label: "Classic cream",
    pattern: () => "none",
    strength: 0,
    deckled: false,
    fibrous: true,
  },
  vintageCotton: {
    label: "Vintage cotton",
    pattern: (a) => `repeating-linear-gradient(0deg, ${a} 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, ${a} 0 1px, transparent 1px 4px)`,
    strength: 0.16,
    deckled: true,
    fibrous: true,
  },
  pressedBotanical: {
    label: "Pressed botanical",
    pattern: (a, s) =>
      `radial-gradient(ellipse 3px 9px at 14% 30%, ${a}, transparent), radial-gradient(ellipse 9px 3px at 82% 58%, ${s}, transparent), radial-gradient(ellipse 3px 8px at 44% 88%, ${a}, transparent)`,
    strength: 0.34,
    deckled: false,
    fibrous: true,
  },
  minimalWhite: {
    label: "Minimal white",
    pattern: () => "none",
    strength: 0,
    deckled: false,
    fibrous: false,
  },
  roseGarden: {
    label: "Rose garden",
    pattern: (a, s) =>
      `radial-gradient(circle at 16% 20%, ${a} 5px, transparent 6px), radial-gradient(circle at 16% 20%, ${s} 8px, transparent 9px), radial-gradient(circle at 84% 76%, ${a} 5px, transparent 6px), radial-gradient(circle at 84% 76%, ${s} 8px, transparent 9px)`,
    strength: 0.26,
    deckled: false,
    fibrous: true,
  },
  wildflower: {
    label: "Wildflower",
    pattern: (a, s) =>
      `radial-gradient(circle at 8% 40%, ${a} 1.6px, transparent 2px), radial-gradient(circle at 28% 14%, ${s} 2px, transparent 2.6px), radial-gradient(circle at 52% 74%, ${a} 1.4px, transparent 2px), radial-gradient(circle at 72% 30%, ${s} 2.2px, transparent 2.8px), radial-gradient(circle at 92% 62%, ${a} 1.6px, transparent 2.2px)`,
    strength: 0.32,
    deckled: false,
    fibrous: true,
  },
  washi: {
    label: "Japanese washi",
    pattern: (a) => `repeating-linear-gradient(102deg, ${a} 0 1px, transparent 1px 11px)`,
    strength: 0.2,
    deckled: true,
    fibrous: true,
  },
  handmade: {
    label: "Luxury handmade",
    pattern: (a) => `radial-gradient(circle at 30% 40%, ${a} 1px, transparent 1.6px)`,
    strength: 0.14,
    deckled: true,
    fibrous: true,
  },
};

export const PAPER_COLOUR_IDS = [
  "ivory",
  "cream",
  "softBlush",
  "warmBeige",
  "lightSage",
  "lavender",
  "peach",
  "classicWhite",
] as const;
export type PaperColourId = (typeof PAPER_COLOUR_IDS)[number];

export const PAPER_COLOURS: Record<PaperColourId, { label: string; hex: string; edge: string }> = {
  ivory: { label: "Ivory", hex: "#f9f3e4", edge: "rgba(150,124,80,.24)" },
  cream: { label: "Cream", hex: "#f7eed8", edge: "rgba(150,120,70,.26)" },
  softBlush: { label: "Soft blush", hex: "#fbeeec", edge: "rgba(168,110,110,.24)" },
  warmBeige: { label: "Warm beige", hex: "#f2e6d2", edge: "rgba(140,112,74,.26)" },
  lightSage: { label: "Light sage", hex: "#eef2e6", edge: "rgba(108,132,96,.24)" },
  lavender: { label: "Lavender", hex: "#f2eef7", edge: "rgba(122,110,150,.24)" },
  peach: { label: "Peach", hex: "#fdeee2", edge: "rgba(180,124,88,.24)" },
  classicWhite: { label: "Classic white", hex: "#fdfbf6", edge: "rgba(120,112,98,.2)" },
};

/* ------------------------------------------------------------------ */
/* Envelope, seal, hand, ink                                          */
/* ------------------------------------------------------------------ */

export const ENVELOPE_IDS = ["floral", "minimal", "botanical", "vintage", "linen", "kraft"] as const;
export type EnvelopeStyleId = (typeof ENVELOPE_IDS)[number];

export const ENVELOPE_STYLES: Record<EnvelopeStyleId, { label: string; body: string; flap: string; lining: string; border: string; ink: string }> = {
  floral: {
    label: "Floral",
    body: "linear-gradient(158deg, #f8e6e2, #eccfc9)",
    flap: "linear-gradient(178deg, #f4dcd6, #e4c2bb)",
    lining: "#c88a86",
    border: "rgba(150,90,86,.34)",
    ink: "#7a4a46",
  },
  minimal: {
    label: "Minimal",
    body: "linear-gradient(158deg, #fbf8f2, #eee8dc)",
    flap: "linear-gradient(178deg, #f6f2e8, #e6dfd0)",
    lining: "#c8bda6",
    border: "rgba(120,108,88,.28)",
    ink: "#5a5346",
  },
  botanical: {
    label: "Botanical",
    body: "linear-gradient(158deg, #eaf0e2, #d6dfc8)",
    flap: "linear-gradient(178deg, #e2ead8, #ccd7bc)",
    lining: "#8ea378",
    border: "rgba(96,116,80,.3)",
    ink: "#455040",
  },
  vintage: {
    label: "Vintage",
    body: "linear-gradient(158deg, #f0e2c8, #ddc9a4)",
    flap: "linear-gradient(178deg, #ebdabc, #d2bc94)",
    lining: "#a8865a",
    border: "rgba(130,100,60,.32)",
    ink: "#5c4830",
  },
  linen: {
    label: "Luxury linen",
    body: "linear-gradient(158deg, #f6f2e8, #e2dccc)",
    flap: "linear-gradient(178deg, #f0ebdd, #d8d0bc)",
    lining: "#bdb39a",
    border: "rgba(118,108,88,.3)",
    ink: "#4e4838",
  },
  kraft: {
    label: "Rustic kraft",
    body: "linear-gradient(158deg, #d8b48a, #c09a6c)",
    flap: "linear-gradient(178deg, #d0aa80, #b8925f)",
    lining: "#8a6a42",
    border: "rgba(96,70,40,.36)",
    ink: "#4a3520",
  },
};

export const SEAL_COLOUR_IDS = ["roseGold", "champagne", "burgundy", "forest", "ivory", "blush"] as const;
export type SealColourId = (typeof SEAL_COLOUR_IDS)[number];

export const SEAL_COLOURS: Record<SealColourId, { label: string; base: string; light: string; deep: string; on: string }> = {
  roseGold: { label: "Rose gold", base: "#c78a72", light: "#e8b39c", deep: "#8a4f39", on: "#4d2417" },
  champagne: { label: "Champagne gold", base: "#cbab6a", light: "#eed9a6", deep: "#8d7233", on: "#4a3a12" },
  burgundy: { label: "Burgundy", base: "#8c2f3c", light: "#b85464", deep: "#5a1520", on: "#f6e2e4" },
  forest: { label: "Forest green", base: "#3c5f44", light: "#628a68", deep: "#1f3826", on: "#e8f2e6" },
  ivory: { label: "Ivory", base: "#e6dcc4", light: "#f6efdd", deep: "#b0a488", on: "#4a4232" },
  blush: { label: "Blush pink", base: "#d99fa4", light: "#f0c4c8", deep: "#a06a70", on: "#4e2a2e" },
};

export const SEAL_SYMBOL_IDS = ["heart", "flower", "rose", "butterfly", "tree", "letterM", "initial"] as const;
export type SealSymbolId = (typeof SEAL_SYMBOL_IDS)[number];

export const SEAL_SYMBOL_LABELS: Record<SealSymbolId, string> = {
  heart: "Heart",
  flower: "Flower",
  rose: "Rose",
  butterfly: "Butterfly",
  tree: "Family tree",
  letterM: "M",
  initial: "Her initial",
};

export const HAND_IDS = ["elegant", "warm", "modern", "penmanship", "journal", "calligraphy"] as const;
export type HandId = (typeof HAND_IDS)[number];

export interface Hand {
  label: string;
  family: string;
  /** Relative size, since these fonts differ wildly in their natural scale. */
  scale: number;
  lineHeight: number;
  tracking: string;
}

export const HANDS: Record<HandId, Hand> = {
  elegant: { label: "Elegant cursive", family: "var(--hw-elegant), cursive", scale: 1.08, lineHeight: 1.85, tracking: "0.005em" },
  warm: { label: "Warm personal", family: "var(--hw-romantic), cursive", scale: 1.02, lineHeight: 1.8, tracking: "0" },
  modern: { label: "Modern script", family: "var(--hw-journal), cursive", scale: 0.98, lineHeight: 1.78, tracking: "0" },
  penmanship: { label: "Classic penmanship", family: "var(--hw-classic), cursive", scale: 1, lineHeight: 1.82, tracking: "0.004em" },
  journal: { label: "Journal style", family: "var(--hw-messy), cursive", scale: 0.96, lineHeight: 1.74, tracking: "0" },
  calligraphy: { label: "Soft calligraphy", family: "var(--hw-calligraphy), cursive", scale: 1.14, lineHeight: 1.9, tracking: "0.008em" },
};

export const INK_IDS = ["black", "sepia", "darkBrown", "navy", "forest", "burgundy"] as const;
export type InkId = (typeof INK_IDS)[number];

export const INKS: Record<InkId, { label: string; hex: string; wet: string }> = {
  black: { label: "Black", hex: "#26241f", wet: "#43403a" },
  sepia: { label: "Sepia", hex: "#6b4a2a", wet: "#8a6339" },
  darkBrown: { label: "Dark brown", hex: "#4a3120", wet: "#66452e" },
  navy: { label: "Navy", hex: "#22304f", wet: "#33456b" },
  forest: { label: "Forest green", hex: "#26402f", wet: "#375a43" },
  burgundy: { label: "Burgundy", hex: "#5c1f28", wet: "#7e2f3a" },
};

/* ------------------------------------------------------------------ */
/* Decorations — everything handmade                                  */
/* ------------------------------------------------------------------ */

export const DECOR_IDS = [
  "pressedFlower",
  "babysBreath",
  "lavender",
  "rosePetal",
  "butterfly",
  "leaf",
  "watercolourBloom",
  "ribbon",
  "paperclip",
  "stamp",
  "heart",
  "doodle",
] as const;
export type DecorId = (typeof DECOR_IDS)[number];

export const DECOR_LABELS: Record<DecorId, string> = {
  pressedFlower: "Pressed flower",
  babysBreath: "Baby's breath",
  lavender: "Lavender sprig",
  rosePetal: "Rose petal",
  butterfly: "Tiny butterfly",
  leaf: "Leaf",
  watercolourBloom: "Watercolour bloom",
  ribbon: "Ribbon",
  paperclip: "Paper clip",
  stamp: "Vintage stamp",
  heart: "Small heart",
  doodle: "Family doodle",
};

/* ------------------------------------------------------------------ */
/* The room                                                           */
/* ------------------------------------------------------------------ */

/** Morning, through a kitchen window. */
export const ROOM = {
  dark: "#17110c",
  wood: "linear-gradient(168deg, #8a5e38 0%, #6b4526 54%, #4e3119 100%)",
  woodEdge: "rgba(50,32,16,.6)",
  light: "rgba(255,236,190,.9)",
  lightSoft: "rgba(255,236,190,.3)",
  onWood: "#f8ecd6",
  onWoodSoft: "rgba(248,236,214,.72)",
} as const;

/** Watercolour greens and pinks for the garden that grows up the margins. */
export const GARDEN = {
  stem: "#7d9a6a",
  stemDeep: "#5a7a4c",
  leaf: "#9ab884",
  bloomA: "#e9a8b4",
  bloomB: "#f0c8d0",
  bloomC: "#e8d0a0",
  bloomD: "#c9a8d4",
  centre: "#f6e2a8",
} as const;

export const DISPLAY_FONT = "var(--font-fraunces), Georgia, serif";
export const MONO_FONT = "var(--font-ibm-plex-mono), ui-monospace, monospace";
export const BODY_FONT = "var(--font-space-grotesk), system-ui, sans-serif";
