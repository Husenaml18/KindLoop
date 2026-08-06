/**
 * Surprise Reveal Box — "a box inside a box inside a box".
 *
 * The object this replaces is a wrapped present that turns out to have another
 * wrapped present inside it. Its identity is *bright, impatient delight*: a party
 * table under a hard key light, saturated paper, ribbon everywhere, and the only
 * place in Kindloop where confetti is the right answer.
 *
 * Deliberately the loudest experience here. Countdown Gift is a midnight wall,
 * Open When is a quiet wooden box, Memory Puzzle is a slow afternoon — this one is
 * somebody shouting "open it, open it". Nothing about it is restrained.
 */

import { BOX_MATERIALS, RIBBONS, WRAPPINGS, type BoxMaterialId, type RibbonId, type WrappingId } from "@/lib/engines/gift/stock";

export const SCHEME_IDS = ["party", "rose", "emerald", "midnightGold", "sherbet", "kraft"] as const;
export type SchemeId = (typeof SCHEME_IDS)[number];

export interface Scheme {
  id: SchemeId;
  label: string;
  /** The room. Bright — this is not an evening. */
  bg: string;
  /** The table the box sits on. */
  table: string;
  /** The two colours the wrapping pattern is built from. */
  paperA: string;
  paperB: string;
  /** Text on the room. */
  ink: string;
  inkSoft: string;
  /** The accent: ribbon curls, rules, the light in the box. */
  accent: string;
  accentSoft: string;
  /** Light spilling out when a lid comes off. */
  glow: string;
  /** Confetti, in the order it should be mixed. */
  confetti: string[];
  /** Sensible defaults for the parts that come from the Gift Engine. */
  defaults: { material: BoxMaterialId; wrapping: WrappingId; ribbon: RibbonId };
}

export const SCHEMES: Record<SchemeId, Scheme> = {
  party: {
    id: "party",
    label: "Party",
    bg: "radial-gradient(ellipse 78% 58% at 50% 8%, #fff3d4 0%, #f6cf92 40%, #d9a05e 100%)",
    table: "linear-gradient(168deg, #c98a4e, #a86b36)",
    paperA: "#e8503f",
    paperB: "#f8d9a0",
    ink: "#3c2412",
    inkSoft: "rgba(60,36,18,.68)",
    accent: "#c62f24",
    accentSoft: "rgba(198,47,36,.24)",
    glow: "rgba(255,226,150,.85)",
    confetti: ["#e8503f", "#f6c344", "#3f8fc6", "#68b45c", "#f8f2e0"],
    defaults: { material: "kraft", wrapping: "stripes", ribbon: "satinRed" },
  },
  rose: {
    id: "rose",
    label: "Rose",
    bg: "radial-gradient(ellipse 78% 58% at 50% 8%, #fff0f0 0%, #f6ccd0 42%, #d99aa4 100%)",
    table: "linear-gradient(168deg, #c98894, #a4636f)",
    paperA: "#e8a0ac",
    paperB: "#fdeef0",
    ink: "#4a2230",
    inkSoft: "rgba(74,34,48,.66)",
    accent: "#c25a6e",
    accentSoft: "rgba(194,90,110,.22)",
    glow: "rgba(255,214,220,.9)",
    confetti: ["#e8a0ac", "#f6d8dc", "#c25a6e", "#f8e6c0", "#ffffff"],
    defaults: { material: "velvet", wrapping: "floral", ribbon: "blush" },
  },
  emerald: {
    id: "emerald",
    label: "Emerald",
    bg: "radial-gradient(ellipse 78% 58% at 50% 8%, #eef8ee 0%, #b8ddbe 42%, #7aab86 100%)",
    table: "linear-gradient(168deg, #7d9c7e, #566f5a)",
    paperA: "#2f7a4a",
    paperB: "#e6f2e2",
    ink: "#1e3a28",
    inkSoft: "rgba(30,58,40,.66)",
    accent: "#2f7a4a",
    accentSoft: "rgba(47,122,74,.22)",
    glow: "rgba(226,248,222,.9)",
    confetti: ["#2f7a4a", "#c9a04a", "#e6f2e2", "#7aab86", "#ffffff"],
    defaults: { material: "linen", wrapping: "dots", ribbon: "sage" },
  },
  midnightGold: {
    id: "midnightGold",
    label: "Midnight & gold",
    bg: "radial-gradient(ellipse 78% 58% at 50% 10%, #3a3450 0%, #221d38 44%, #12101f 100%)",
    table: "linear-gradient(168deg, #2c2646, #1a1630)",
    paperA: "#1e1a30",
    paperB: "#c9a04a",
    ink: "#f6efdd",
    inkSoft: "rgba(246,239,221,.68)",
    accent: "#e8c878",
    accentSoft: "rgba(232,200,120,.26)",
    glow: "rgba(246,224,170,.85)",
    confetti: ["#e8c878", "#c9a04a", "#f6efdd", "#6a5ca8", "#ffffff"],
    defaults: { material: "lacquer", wrapping: "stars", ribbon: "gold" },
  },
  sherbet: {
    id: "sherbet",
    label: "Sherbet",
    bg: "radial-gradient(ellipse 78% 58% at 50% 8%, #fff8e8 0%, #ffdcc0 40%, #f0b4a0 100%)",
    table: "linear-gradient(168deg, #e0a894, #c08272)",
    paperA: "#f68a60",
    paperB: "#fff2d8",
    ink: "#4a2a20",
    inkSoft: "rgba(74,42,32,.66)",
    accent: "#e8663c",
    accentSoft: "rgba(232,102,60,.22)",
    glow: "rgba(255,232,196,.9)",
    confetti: ["#f68a60", "#ffd45c", "#7ac6d8", "#f8a8c0", "#fff2d8"],
    defaults: { material: "linen", wrapping: "stripes", ribbon: "satinCream" },
  },
  kraft: {
    id: "kraft",
    label: "Kraft & twine",
    bg: "radial-gradient(ellipse 78% 58% at 50% 8%, #f6ecd8 0%, #d9bc92 42%, #b4926a 100%)",
    table: "linear-gradient(168deg, #b8946a, #96744c)",
    paperA: "#c39a68",
    paperB: "#efdcc0",
    ink: "#3a2a18",
    inkSoft: "rgba(58,42,24,.66)",
    accent: "#8a5c30",
    accentSoft: "rgba(138,92,48,.22)",
    glow: "rgba(255,238,206,.88)",
    confetti: ["#c39a68", "#8a5c30", "#efdcc0", "#7d8f6a", "#f8f2e0"],
    defaults: { material: "kraft", wrapping: "kraftTwine", ribbon: "twine" },
  },
};

/** The sticker holding the paper down. Drawn, so it scales and needs no assets. */
export const STICKER_IDS = ["none", "seal", "star", "heart", "bow", "stamp"] as const;
export type StickerId = (typeof STICKER_IDS)[number];

export const STICKER_LABELS: Record<StickerId, string> = {
  none: "No sticker",
  seal: "Foil seal",
  star: "Star",
  heart: "Heart",
  bow: "Little bow",
  stamp: "Postage stamp",
};

/** Re-exported so the editor picks from one list and the view reads the same one. */
export { BOX_MATERIALS, RIBBONS, WRAPPINGS };

export const DISPLAY_FONT = "var(--font-fraunces), Georgia, serif";
export const HAND_FONT = "var(--hw-messy), cursive";
export const MONO_FONT = "var(--font-ibm-plex-mono), ui-monospace, monospace";
export const BODY_FONT = "var(--font-space-grotesk), system-ui, sans-serif";
