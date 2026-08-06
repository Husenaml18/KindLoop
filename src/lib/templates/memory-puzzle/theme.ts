/**
 * Memory Puzzle — "the wooden puzzle on the table".
 *
 * The object this replaces is a jigsaw someone tipped out onto a table on a
 * quiet afternoon: warm light, a wooden surface, a photograph you can only see
 * once you've earned it. Its identity is *daylight and patience* — the exact
 * opposite of Countdown Gift's midnight wall, and unlike Digital Scrapbook's
 * cluttered desk because here the table is nearly bare. One object, all attention.
 *
 * The puzzle is not the point and the styling says so: no scores, no timer on
 * screen, no win-state fanfare. Just a photograph slowly becoming visible.
 */

/* ------------------------------------------------------------------ */
/* Surfaces — what the puzzle is tipped out onto                       */
/* ------------------------------------------------------------------ */

export const SURFACE_IDS = [
  "woodDesk",
  "fabricTable",
  "scrapbookPaper",
  "travelMap",
  "nightSky",
  "marble",
  "kraftPaper",
  "romanticTable",
] as const;
export type SurfaceId = (typeof SURFACE_IDS)[number];

export interface Surface {
  label: string;
  /** The table. */
  bg: string;
  /** The tray the puzzle is assembled in — a shade of the table, recessed. */
  tray: string;
  trayEdge: string;
  /** Light pooling over the middle. */
  glow: string;
  /** Text on this surface. */
  ink: string;
  inkSoft: string;
  /** The accent: rules, pins, the hint glow. */
  accent: string;
  accentSoft: string;
  /** Ambience this surface calls for. */
  air: "dust" | "petals" | "stars" | "snow" | "none";
  /** Whether a sunbeam falls across it. */
  beam: boolean;
}

export const SURFACES: Record<SurfaceId, Surface> = {
  woodDesk: {
    label: "Wood desk",
    bg: "radial-gradient(ellipse 90% 70% at 50% 22%, #a87a4c 0%, #7d5632 44%, #54371f 100%)",
    tray: "linear-gradient(168deg, #6b4526, #4a2f19)",
    trayEdge: "rgba(255,232,196,.22)",
    glow: "rgba(255,226,168,.24)",
    ink: "#f6ead6",
    inkSoft: "rgba(246,234,214,.66)",
    accent: "#e8c07a",
    accentSoft: "rgba(232,192,122,.3)",
    air: "dust",
    beam: true,
  },
  fabricTable: {
    label: "Linen tablecloth",
    bg: "radial-gradient(ellipse 90% 70% at 50% 20%, #ded2bc 0%, #c2b49a 46%, #a1937a 100%)",
    tray: "linear-gradient(168deg, #b8a888, #9a8a6a)",
    trayEdge: "rgba(74,58,36,.24)",
    glow: "rgba(255,246,220,.4)",
    ink: "#3e3324",
    inkSoft: "rgba(62,51,36,.66)",
    accent: "#8a6a3c",
    accentSoft: "rgba(138,106,60,.24)",
    air: "dust",
    beam: true,
  },
  scrapbookPaper: {
    label: "Scrapbook page",
    bg: "radial-gradient(ellipse 90% 70% at 50% 20%, #f2e6cc 0%, #e2d0ae 48%, #cbb88e 100%)",
    tray: "linear-gradient(168deg, #e8dabb, #d2c09c)",
    trayEdge: "rgba(90,66,36,.22)",
    glow: "rgba(255,248,224,.44)",
    ink: "#42361f",
    inkSoft: "rgba(66,54,31,.64)",
    accent: "#a8703c",
    accentSoft: "rgba(168,112,60,.24)",
    air: "dust",
    beam: false,
  },
  travelMap: {
    label: "Travel map",
    bg: "radial-gradient(ellipse 90% 70% at 50% 20%, #e2d8bc 0%, #c8bb9a 46%, #a89b7a 100%)",
    tray: "linear-gradient(168deg, #d0c4a2, #b4a683)",
    trayEdge: "rgba(60,74,58,.26)",
    glow: "rgba(255,250,226,.36)",
    ink: "#33402f",
    inkSoft: "rgba(51,64,47,.66)",
    accent: "#5c7a4c",
    accentSoft: "rgba(92,122,76,.24)",
    air: "none",
    beam: false,
  },
  nightSky: {
    label: "Night sky",
    bg: "radial-gradient(ellipse 84% 62% at 50% 14%, #2a2448 0%, #171331 46%, #0b0917 100%)",
    tray: "linear-gradient(168deg, #2c2650, #1d1840)",
    trayEdge: "rgba(216,180,110,.26)",
    glow: "rgba(240,198,117,.2)",
    ink: "#efe7d4",
    inkSoft: "rgba(239,231,212,.62)",
    accent: "#d8b46e",
    accentSoft: "rgba(216,180,110,.3)",
    air: "stars",
    beam: false,
  },
  marble: {
    label: "Marble",
    bg: "radial-gradient(ellipse 90% 70% at 50% 18%, #f4f2ee 0%, #e2dfd8 48%, #c8c4bb 100%)",
    tray: "linear-gradient(168deg, #eae7e0, #d4d0c6)",
    trayEdge: "rgba(50,46,40,.18)",
    glow: "rgba(255,255,250,.5)",
    ink: "#33302a",
    inkSoft: "rgba(51,48,42,.62)",
    accent: "#8a7c60",
    accentSoft: "rgba(138,124,96,.22)",
    air: "none",
    beam: true,
  },
  kraftPaper: {
    label: "Kraft paper",
    bg: "radial-gradient(ellipse 90% 70% at 50% 20%, #cfa878 0%, #b48a5c 46%, #8f6a42 100%)",
    tray: "linear-gradient(168deg, #c39a68, #a67c4c)",
    trayEdge: "rgba(58,42,24,.28)",
    glow: "rgba(255,238,204,.34)",
    ink: "#3a2a18",
    inkSoft: "rgba(58,42,24,.66)",
    accent: "#7a4f28",
    accentSoft: "rgba(122,79,40,.24)",
    air: "dust",
    beam: true,
  },
  romanticTable: {
    label: "Rose table",
    bg: "radial-gradient(ellipse 88% 66% at 50% 18%, #6a3448 0%, #4a2032 46%, #2c1220 100%)",
    tray: "linear-gradient(168deg, #5c2c42, #3e1a2c)",
    trayEdge: "rgba(238,192,190,.26)",
    glow: "rgba(244,192,184,.24)",
    ink: "#f8e8e4",
    inkSoft: "rgba(248,232,228,.64)",
    accent: "#e2a8a8",
    accentSoft: "rgba(226,168,168,.28)",
    air: "petals",
    beam: false,
  },
};

/* ------------------------------------------------------------------ */
/* Pieces — what they're cut from                                      */
/* ------------------------------------------------------------------ */

export const MATERIAL_IDS = ["wood", "paper", "glass", "fabric", "metal"] as const;
export type MaterialId = (typeof MATERIAL_IDS)[number];

export interface Material {
  label: string;
  /** Overlaid on the photograph to make it feel cut from something. */
  overlay: string;
  /** Edge highlight, so a piece has thickness. */
  bevel: string;
  /** Drop shadow while it's being held. */
  shadow: string;
  /** Corner radius, in px. */
  radius: number;
  /** How thick a piece reads, 0..1 — feeds shadow depth and lift height. */
  heft: number;
}

export const MATERIALS: Record<MaterialId, Material> = {
  wood: {
    label: "Wood",
    overlay: "repeating-linear-gradient(94deg, rgba(90,58,26,.12) 0 2px, rgba(255,226,180,.07) 2px 5px)",
    bevel: "inset 0 1px 0 rgba(255,236,200,.4), inset 0 -1px 0 rgba(60,38,16,.42)",
    shadow: "0 14px 26px -10px rgba(38,24,10,.62)",
    radius: 3,
    heft: 1,
  },
  paper: {
    label: "Paper",
    overlay: "linear-gradient(168deg, rgba(255,252,242,.1), rgba(140,116,80,.1))",
    bevel: "inset 0 1px 0 rgba(255,255,255,.5), inset 0 -1px 0 rgba(120,96,62,.24)",
    shadow: "0 8px 16px -8px rgba(60,44,24,.44)",
    radius: 1,
    heft: 0.5,
  },
  glass: {
    label: "Glass",
    overlay: "linear-gradient(128deg, rgba(255,255,255,.34) 0%, rgba(255,255,255,.04) 42%, rgba(180,220,255,.2) 100%)",
    bevel: "inset 0 0 0 1px rgba(255,255,255,.5)",
    shadow: "0 16px 30px -12px rgba(20,40,60,.5)",
    radius: 2,
    heft: 0.8,
  },
  fabric: {
    label: "Fabric",
    overlay:
      "repeating-linear-gradient(0deg, rgba(0,0,0,.05) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,.05) 0 1px, transparent 1px 3px)",
    bevel: "inset 0 0 0 1px rgba(255,255,255,.2)",
    shadow: "0 10px 20px -10px rgba(40,30,20,.5)",
    radius: 5,
    heft: 0.6,
  },
  metal: {
    label: "Metal",
    overlay: "linear-gradient(118deg, rgba(255,255,255,.4) 0%, rgba(255,255,255,.02) 34%, rgba(200,208,220,.28) 74%, rgba(255,255,255,.16) 100%)",
    bevel: "inset 0 1px 0 rgba(255,255,255,.6), inset 0 -1px 0 rgba(30,36,44,.5)",
    shadow: "0 18px 32px -12px rgba(16,22,30,.66)",
    radius: 2,
    heft: 1.2,
  },
};

/* ------------------------------------------------------------------ */
/* Cuts — the shape of the pieces                                      */
/* ------------------------------------------------------------------ */

export const CUT_IDS = [
  "jigsaw",
  "wooden",
  "polaroid",
  "heart",
  "envelope",
  "mosaic",
  "sliding",
  "tile",
  "circular",
  "fragment",
] as const;
export type CutId = (typeof CUT_IDS)[number];

export interface Cut {
  label: string;
  /** One line for the creator on what makes this cut different. */
  note: string;
  /** Interlocking tabs, drawn per edge. */
  tabs: boolean;
  /** The board is a ring rather than a grid. */
  radial: boolean;
  /** Pieces slide within the tray instead of being lifted out of it. */
  slide: boolean;
  /** The assembled picture is masked to a shape. */
  mask?: "heart" | "circle" | "envelope";
  /** Gap between pieces once placed, in px — mosaics and tiles keep a grout line. */
  grout: number;
}

export const CUTS: Record<CutId, Cut> = {
  jigsaw: {
    label: "Classic jigsaw",
    note: "Interlocking tabs and blanks. The one everyone knows.",
    tabs: true,
    radial: false,
    slide: false,
    grout: 0,
  },
  wooden: {
    label: "Wooden puzzle",
    note: "Chunky cut pieces with real thickness and weight.",
    tabs: true,
    radial: false,
    slide: false,
    grout: 0,
  },
  polaroid: {
    label: "Polaroid stack",
    note: "Each piece is a little print with a white border.",
    tabs: false,
    radial: false,
    slide: false,
    grout: 5,
  },
  heart: {
    label: "Heart",
    note: "The finished picture is cut to a heart.",
    tabs: true,
    radial: false,
    slide: false,
    mask: "heart",
    grout: 0,
  },
  envelope: {
    label: "Envelope",
    note: "Pieces arrive folded, as if posted.",
    tabs: false,
    radial: false,
    slide: false,
    mask: "envelope",
    grout: 1,
  },
  mosaic: {
    label: "Photo mosaic",
    note: "Small square tiles with a fine grout line between them.",
    tabs: false,
    radial: false,
    slide: false,
    grout: 3,
  },
  sliding: {
    label: "Sliding puzzle",
    note: "One space free. Tiles slide; nothing is lifted out.",
    tabs: false,
    radial: false,
    slide: true,
    grout: 2,
  },
  tile: {
    label: "Tile puzzle",
    note: "Clean rectangles, no tabs. Quick and calm.",
    tabs: false,
    radial: false,
    slide: false,
    grout: 1,
  },
  circular: {
    label: "Circular",
    note: "Pieces ring outward from the middle.",
    tabs: false,
    radial: true,
    slide: false,
    mask: "circle",
    grout: 1,
  },
  fragment: {
    label: "Torn letter",
    note: "A page torn up and pieced back together.",
    tabs: false,
    radial: false,
    slide: false,
    grout: 0,
  },
};

/* ------------------------------------------------------------------ */
/* Difficulty                                                          */
/* ------------------------------------------------------------------ */

export const GRID_SIZES = [3, 4, 5, 6, 8, 10] as const;
export type GridSize = (typeof GRID_SIZES)[number];

export const DIFFICULTY_IDS = ["easy", "medium", "hard", "master"] as const;
export type DifficultyId = (typeof DIFFICULTY_IDS)[number];

export interface Difficulty {
  label: string;
  /** How close a piece must be dropped to snap home, as a fraction of piece size. */
  snap: number;
  /**
   * How much a *placed* piece is dimmed until the picture is finished, 0..1.
   * Nothing is ever shown of the unassembled picture — see the note on
   * `DIFFICULTIES` below.
   */
  settle: number;
  /** Whether pieces can arrive rotated. */
  rotate: boolean;
  /** How many hints are offered. -1 means unlimited. */
  hints: number;
  note: string;
}

/**
 * Difficulty changes how forgiving the *handling* is — never how much of the
 * memory is given away.
 *
 * An earlier version showed a faint copy of the photograph under the board on the
 * easier settings, the way a jigsaw box lid sits on the table beside you. That was
 * wrong: this is a *hidden* photograph, and putting it on the table is the one
 * thing that empties the whole experience. Easier now means generous snapping,
 * more hints and no rotation. The pieces still carry their own slice of the
 * picture, which is all anyone needs to reason about where they go.
 */
export const DIFFICULTIES: Record<DifficultyId, Difficulty> = {
  easy: {
    label: "Easy",
    snap: 0.85,
    settle: 0.3,
    rotate: false,
    hints: -1,
    note: "Very forgiving snapping and as many hints as they want.",
  },
  medium: {
    label: "Medium",
    snap: 0.55,
    settle: 0.45,
    rotate: false,
    hints: 3,
    note: "The usual. Forgiving snapping and three hints.",
  },
  hard: {
    label: "Hard",
    snap: 0.38,
    settle: 0.6,
    rotate: false,
    hints: 1,
    note: "Pieces have to go almost exactly where they belong. One hint.",
  },
  master: {
    label: "Master",
    snap: 0.3,
    settle: 0.75,
    rotate: true,
    hints: 0,
    note: "Pieces arrive turned the wrong way. No hints.",
  },
};

/* ------------------------------------------------------------------ */
/* Type — daylight and a steady hand                                   */
/* ------------------------------------------------------------------ */

/** A quieter face than the calendar's gilt Fraunces — this room is bright. */
export const DISPLAY_FONT = "var(--font-fraunces), Georgia, serif";
export const HAND_FONT = "var(--hw-journal), cursive";
export const MONO_FONT = "var(--font-ibm-plex-mono), ui-monospace, monospace";
export const BODY_FONT = "var(--font-space-grotesk), system-ui, sans-serif";
