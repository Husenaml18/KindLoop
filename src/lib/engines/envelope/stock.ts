/**
 * Envelope Engine — stock.
 *
 * Envelope bodies, linings, wax colours and seal glyph choices. Shared by every
 * experience that seals something: the love letter, the keepsake box, the advent
 * calendar's envelope doors.
 */

/* ------------------------------ envelope ------------------------------ */

export const ENVELOPE_IDS = [
  "luxury",
  "vintage",
  "minimal",
  "romantic",
  "botanical",
  "royal",
  "rustic",
  "christmas",
  "birthday",
] as const;
export type EnvelopeId = (typeof ENVELOPE_IDS)[number];

export interface EnvelopeStyle {
  id: EnvelopeId;
  label: string;
  body: string;
  flap: string;
  /** Lining shown as the flap opens. */
  lining: string;
  border: string;
  /** Ink used for the name on the front. */
  addressInk: string;
}

export const ENVELOPES: Record<EnvelopeId, EnvelopeStyle> = {
  luxury: {
    id: "luxury",
    label: "Luxury",
    body: "linear-gradient(158deg,#f4e9d2,#e4d3b2)",
    flap: "linear-gradient(172deg,#f7eeda,#e8d9ba)",
    lining: "linear-gradient(160deg,#3f2f22,#26190f)",
    border: "rgba(160,124,70,.4)",
    addressInk: "#4a3a22",
  },
  vintage: {
    id: "vintage",
    label: "Vintage",
    body: "linear-gradient(158deg,#e8d8b8,#d2bd96)",
    flap: "linear-gradient(172deg,#ecdfc2,#d8c49e)",
    lining: "linear-gradient(160deg,#6b4a2c,#3f2a18)",
    border: "rgba(130,98,54,.45)",
    addressInk: "#4a3520",
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    body: "linear-gradient(158deg,#fbfaf6,#eeece4)",
    flap: "linear-gradient(172deg,#fdfcf8,#f2f0e8)",
    lining: "linear-gradient(160deg,#4a4a46,#2c2c28)",
    border: "rgba(60,60,56,.16)",
    addressInk: "#3a3a36",
  },
  romantic: {
    id: "romantic",
    label: "Romantic",
    body: "linear-gradient(158deg,#f7e2de,#e9c6c0)",
    flap: "linear-gradient(172deg,#faeae6,#eed0ca)",
    lining: "linear-gradient(160deg,#7a3a44,#4a2028)",
    border: "rgba(170,104,104,.36)",
    addressInk: "#6b3038",
  },
  botanical: {
    id: "botanical",
    label: "Botanical",
    body: "linear-gradient(158deg,#e8eede,#d2ddc4)",
    flap: "linear-gradient(172deg,#edf2e4,#d9e3cc)",
    lining: "linear-gradient(160deg,#3d4a34,#232c1e)",
    border: "rgba(110,132,86,.38)",
    addressInk: "#39452e",
  },
  royal: {
    id: "royal",
    label: "Royal",
    body: "linear-gradient(158deg,#2c3352,#1b2036)",
    flap: "linear-gradient(172deg,#333b5e,#20263e)",
    lining: "linear-gradient(160deg,#c9a45c,#8a6a2e)",
    border: "rgba(201,164,92,.45)",
    addressInk: "#e6d8ae",
  },
  rustic: {
    id: "rustic",
    label: "Rustic",
    body: "linear-gradient(158deg,#d9c3a0,#bda37c)",
    flap: "linear-gradient(172deg,#dfcbaa,#c4ab84)",
    lining: "linear-gradient(160deg,#5c4530,#38291a)",
    border: "rgba(112,84,50,.5)",
    addressInk: "#4a3720",
  },
  christmas: {
    id: "christmas",
    label: "Christmas",
    body: "linear-gradient(158deg,#f2ece0,#ded6c6)",
    flap: "linear-gradient(172deg,#f5f0e6,#e4dccc)",
    lining: "linear-gradient(160deg,#7a2a26,#4a1614)",
    border: "rgba(122,42,38,.4)",
    addressInk: "#3a4a38",
  },
  birthday: {
    id: "birthday",
    label: "Birthday",
    body: "linear-gradient(158deg,#fbf0dc,#f0dcbc)",
    flap: "linear-gradient(172deg,#fdf4e4,#f3e2c6)",
    lining: "linear-gradient(160deg,#c8663a,#8a3f1e)",
    border: "rgba(200,102,58,.36)",
    addressInk: "#7a4426",
  },
};

/* ------------------------------ wax seal ------------------------------ */

export const SEAL_COLOR_IDS = ["gold", "roseGold", "burgundy", "emerald", "navy", "black", "ivory"] as const;
export type SealColorId = (typeof SEAL_COLOR_IDS)[number];

export const SEAL_COLORS: Record<SealColorId, { label: string; base: string; light: string; deep: string; on: string }> = {
  gold: { label: "Gold", base: "#c9a04a", light: "#e8ca82", deep: "#7d5c18", on: "#4a3410" },
  roseGold: { label: "Rose gold", base: "#c78a72", light: "#e8b39c", deep: "#8a4f39", on: "#4d2417" },
  burgundy: { label: "Burgundy", base: "#8c2f3c", light: "#b85462", deep: "#521620", on: "#f0d8dc" },
  emerald: { label: "Emerald", base: "#2f6b52", light: "#54987c", deep: "#164031", on: "#d8f0e4" },
  navy: { label: "Navy", base: "#2c3a5e", light: "#54648e", deep: "#161f38", on: "#dce4f4" },
  black: { label: "Black", base: "#2e2c2a", light: "#565250", deep: "#151413", on: "#e8e4e0" },
  ivory: { label: "Ivory", base: "#e4d8bf", light: "#f6ede0", deep: "#b09c78", on: "#54462c" },
};

export const SEAL_ICON_IDS = ["heart", "rose", "initials", "infinity", "star", "flower", "tree", "monogram"] as const;
export type SealIconId = (typeof SEAL_ICON_IDS)[number];

export const SEAL_ICON_LABELS: Record<SealIconId, string> = {
  heart: "Heart",
  rose: "Rose",
  initials: "Initials",
  infinity: "Infinity",
  star: "Star",
  flower: "Flower",
  tree: "Tree",
  monogram: "Custom monogram",
};

