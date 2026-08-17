/**
 * Interactive Birthday Card — the look.
 *
 * The brief's governing line is "build a birthday card that happens to exist on
 * the web", and the palettes exist to serve that one idea. Everything here is a
 * *material* — kraft board, gingham cotton, gummed tape, cut paper — rather than a
 * UI colour. Nothing is named `primary` or `surface`, because the moment a card
 * has a surface colour it stops being a card.
 *
 * Not a client module. The schema reads these ids on the server, and exports from
 * a `"use client"` file arrive there as reference proxies with nothing in them.
 */

export const CARD_THEME_IDS = ["ransom", "scrapbook", "gingham", "midnight", "pressed"] as const;
export type CardThemeId = (typeof CARD_THEME_IDS)[number];

export interface CardTheme {
  id: CardThemeId;
  label: string;
  blurb: string;

  /** The surface the card is lying on. */
  desk: string;
  /** The card board itself, and its cut edge. */
  board: string;
  boardEdge: string;
  /** The inside pages, which are always lighter than the cover. */
  page: string;
  pageEdge: string;

  ink: string;
  inkSoft: string;
  /** The one saturated colour — ribbon, seal, the word that matters. */
  accent: string;
  accentSoft: string;
  /** The second cut-paper colour, for alternating letters. */
  accentAlt: string;
  /** Gummed tape holding things down. */
  tape: string;
  /** Warm light for candles and glow. */
  glow: string;

  /** The repeating cloth behind the cover, if this theme has one. */
  pattern: "gingham" | "dots" | "confetti" | "none";
  patternColor: string;
}

export const CARD_THEMES: Record<CardThemeId, CardTheme> = {
  /* The default, and the one the references are built on: barn red on kraft, red
     gingham, ransom-note letters, everything a bit torn. */
  ransom: {
    id: "ransom",
    label: "Ransom note",
    blurb: "Barn-red gingham, letters snipped from magazines, torn edges.",
    desk: "radial-gradient(ellipse 90% 70% at 50% 0%, #e4cfa4, #d9c193 48%, #c9ad7c 100%)",
    board: "#e2c79c",
    boardEdge: "rgba(90,58,32,.34)",
    page: "#efe0c4",
    pageEdge: "rgba(110,74,40,.26)",
    ink: "#3b2b1c",
    inkSoft: "#71583c",
    accent: "#a82c2c",
    accentSoft: "rgba(168,44,44,.13)",
    accentAlt: "#2f6f8f",
    tape: "rgba(226,196,142,.78)",
    glow: "#ffcf7d",
    pattern: "gingham",
    patternColor: "rgba(168,44,44,.34)",
  },
  scrapbook: {
    id: "scrapbook",
    label: "Handmade scrapbook",
    blurb: "Kraft board, cut-out letters, tape and a photo corner.",
    desk: "radial-gradient(ellipse 90% 70% at 50% 0%, #efe0c6, #e2cfae 48%, #d3bd97 100%)",
    board: "#e8d6b4",
    boardEdge: "rgba(94,70,40,.3)",
    page: "#fdf6e7",
    pageEdge: "rgba(120,92,56,.22)",
    ink: "#4a3822",
    inkSoft: "#7d6949",
    accent: "#c25b45",
    accentSoft: "rgba(194,91,69,.14)",
    accentAlt: "#3f7a6a",
    tape: "rgba(232,206,150,.72)",
    glow: "#ffcf7d",
    pattern: "gingham",
    patternColor: "rgba(194,91,69,.16)",
  },
  gingham: {
    id: "gingham",
    label: "Gingham & roses",
    blurb: "Pink checks, pressed petals, a ribbon down one edge.",
    desk: "radial-gradient(ellipse 90% 70% at 50% 0%, #fbe8e6, #f6d8d6 48%, #eec3c2 100%)",
    board: "#f7e2df",
    boardEdge: "rgba(140,84,84,.28)",
    page: "#fffaf7",
    pageEdge: "rgba(150,100,100,.2)",
    ink: "#5a3540",
    inkSoft: "#8d6570",
    accent: "#c9566e",
    accentSoft: "rgba(201,86,110,.13)",
    accentAlt: "#6d8a5c",
    tape: "rgba(246,214,205,.8)",
    glow: "#ffd9a0",
    pattern: "gingham",
    patternColor: "rgba(201,86,110,.16)",
  },
  /* The one the catalogue artwork is dressed in — ink-navy board, gold foil. */
  midnight: {
    id: "midnight",
    label: "Midnight & gold",
    blurb: "Navy board, gold ink, string lights and a paper star or two.",
    desk: "radial-gradient(ellipse 90% 70% at 50% 0%, #1c2233, #141926 52%, #0d1119 100%)",
    board: "#1b2233",
    boardEdge: "rgba(212,175,110,.3)",
    page: "#f6efe0",
    pageEdge: "rgba(120,98,60,.24)",
    ink: "#2c2418",
    inkSoft: "#6d6250",
    accent: "#c9a24f",
    accentSoft: "rgba(201,162,79,.16)",
    accentAlt: "#7d94b5",
    tape: "rgba(206,182,132,.5)",
    glow: "#ffd98a",
    pattern: "dots",
    patternColor: "rgba(201,162,79,.22)",
  },
  pressed: {
    id: "pressed",
    label: "Pressed & plain",
    blurb: "Quiet cream card, one photo, no noise.",
    desk: "linear-gradient(180deg, #f2eee6 0%, #e9e3d8 62%, #ded7ca 100%)",
    board: "#f0e9dc",
    boardEdge: "rgba(70,60,44,.22)",
    page: "#fffdf8",
    pageEdge: "rgba(90,78,58,.18)",
    ink: "#3c3629",
    inkSoft: "#756c59",
    accent: "#a9714a",
    accentSoft: "rgba(169,113,74,.12)",
    accentAlt: "#6b7a63",
    tape: "rgba(224,214,192,.8)",
    glow: "#ffdca0",
    pattern: "none",
    patternColor: "transparent",
  },
};

/* ------------------------------------------------------------------ */
/* The cake                                                            */
/* ------------------------------------------------------------------ */

export const CAKE_IDS = ["layered", "round", "cupcake", "loaf"] as const;
export type CakeId = (typeof CAKE_IDS)[number];

export const CAKE_LABELS: Record<CakeId, string> = {
  layered: "Two tiers",
  round: "Round & frosted",
  cupcake: "One cupcake",
  loaf: "Homemade loaf",
};

export const FROSTING_IDS = ["vanilla", "strawberry", "chocolate", "mint", "lemon"] as const;
export type FrostingId = (typeof FROSTING_IDS)[number];

export const FROSTINGS: Record<
  FrostingId,
  { label: string; icing: string; icingDeep: string; sponge: string; spongeDeep: string }
> = {
  vanilla: { label: "Vanilla", icing: "#fdf1dc", icingDeep: "#e8d5b4", sponge: "#e6c48f", spongeDeep: "#cfa96f" },
  strawberry: { label: "Strawberry", icing: "#f9cfd2", icingDeep: "#e6a9ae", sponge: "#f0d9c4", spongeDeep: "#d9b99e" },
  chocolate: { label: "Chocolate", icing: "#7a5240", icingDeep: "#5d3c2d", sponge: "#8f6247", spongeDeep: "#6d4733" },
  mint: { label: "Mint", icing: "#d5ead9", icingDeep: "#aecfb5", sponge: "#eddcbc", spongeDeep: "#d3bf9c" },
  lemon: { label: "Lemon", icing: "#fbeeb8", icingDeep: "#e6d68d", sponge: "#f0dfb4", spongeDeep: "#d6c390" },
};

export const CANDLE_STYLE_IDS = ["striped", "plain", "twisted", "sparkler"] as const;
export type CandleStyleId = (typeof CANDLE_STYLE_IDS)[number];

export const CANDLE_STYLE_LABELS: Record<CandleStyleId, string> = {
  striped: "Striped",
  plain: "Plain",
  twisted: "Twisted",
  sparkler: "Sparkler",
};

/** Wax colours, cycled across the candles in order. */
export const CANDLE_COLORS = ["#e0605c", "#f0b24a", "#5f9ea0", "#c98ab8", "#7fa860", "#e8e0cc"] as const;

/* ------------------------------------------------------------------ */
/* Bits stuck on the page                                              */
/* ------------------------------------------------------------------ */

export const DECOR_IDS = ["stars", "hearts", "balloons", "sprinkles", "petals", "none"] as const;
export type DecorId = (typeof DECOR_IDS)[number];

export const DECOR_LABELS: Record<DecorId, string> = {
  stars: "Paper stars",
  hearts: "Little hearts",
  balloons: "Balloons",
  sprinkles: "Sprinkles",
  petals: "Pressed petals",
  none: "Nothing extra",
};

/**
 * How long the blow has to be held, in milliseconds.
 *
 * Long enough to take a real breath's worth of commitment, short enough that
 * somebody on a phone in a hurry does not give up halfway. Anyone who cannot hold
 * a pointer down gets a single tap instead — that alternative is not a fallback,
 * it is always on screen.
 */
export const BLOW_MS = 1700;