/**
 * Gift Engine — stock.
 *
 * Box materials, wrapping papers and ribbons.
 *
 * Deliberately a plain module with no `"use client"` directive. A template's Zod
 * schema builds enums out of these ID lists, and schemas are evaluated on the
 * server — where the exports of a client module are replaced by client-reference
 * proxies rather than the real arrays. Reading them from a client module produced
 * enums with no options at all, and every layer failed validation.
 */

/* ------------------------------------------------------------------ */
/* Materials                                                           */
/* ------------------------------------------------------------------ */

export const BOX_MATERIAL_IDS = ["walnut", "oak", "linen", "velvet", "kraft", "lacquer"] as const;
export type BoxMaterialId = (typeof BOX_MATERIAL_IDS)[number];

export interface BoxMaterial {
  label: string;
  /** The outside. */
  face: string;
  /** The cut edge, a shade darker. */
  edge: string;
  /** The lining you see when it opens. */
  inner: string;
  /** Text that sits on the material. */
  on: string;
}

export const BOX_MATERIALS: Record<BoxMaterialId, BoxMaterial> = {
  walnut: {
    label: "Walnut",
    face: "linear-gradient(158deg, #6b4526, #4a2f19)",
    edge: "#33200f",
    inner: "#8a5c33",
    on: "#f4e4cc",
  },
  oak: {
    label: "Oak",
    face: "linear-gradient(158deg, #b08a5c, #8a6a42)",
    edge: "#6a4f2e",
    inner: "#c9a878",
    on: "#3a2a18",
  },
  linen: {
    label: "Linen",
    face: "linear-gradient(158deg, #ded2bc, #c4b69c)",
    edge: "#a89878",
    inner: "#efe6d4",
    on: "#40352a",
  },
  velvet: {
    label: "Velvet",
    face: "radial-gradient(ellipse at 34% 26%, #5a2038, #341020)",
    edge: "#240a14",
    inner: "#7a2c4a",
    on: "#f6e0e8",
  },
  kraft: {
    label: "Kraft",
    face: "linear-gradient(158deg, #c39a68, #a67c4c)",
    edge: "#82603a",
    inner: "#d9b688",
    on: "#3a2a18",
  },
  lacquer: {
    label: "Lacquer",
    face: "linear-gradient(158deg, #1c1a24, #0e0d14)",
    edge: "#000000",
    inner: "#2a2734",
    on: "#f0ead8",
  },
};

export const WRAPPING_IDS = ["stripes", "dots", "stars", "floral", "kraftTwine", "marble", "plainGilt"] as const;
export type WrappingId = (typeof WRAPPING_IDS)[number];

export interface Wrapping {
  label: string;
  /** A CSS background. Two colours are supplied so it can follow a palette. */
  pattern: (a: string, b: string) => string;
}

export const WRAPPINGS: Record<WrappingId, Wrapping> = {
  stripes: {
    label: "Stripes",
    pattern: (a, b) => `repeating-linear-gradient(58deg, ${a} 0 9px, ${b} 9px 18px)`,
  },
  dots: {
    label: "Dots",
    pattern: (a, b) => `radial-gradient(${b} 1.6px, transparent 1.8px) 0 0/13px 13px, ${a}`,
  },
  stars: {
    label: "Stars",
    pattern: (a, b) =>
      `radial-gradient(${b} 1px, transparent 1.4px) 0 0/22px 22px, radial-gradient(${b} .8px, transparent 1.2px) 11px 11px/22px 22px, ${a}`,
  },
  floral: {
    label: "Floral",
    pattern: (a, b) =>
      `radial-gradient(circle at 30% 30%, ${b} 2.4px, transparent 3px) 0 0/26px 26px, radial-gradient(circle at 70% 70%, ${b} 1.6px, transparent 2.2px) 0 0/26px 26px, ${a}`,
  },
  kraftTwine: {
    label: "Kraft & twine",
    pattern: (a, b) => `repeating-linear-gradient(90deg, ${a} 0 30px, ${b} 30px 32px)`,
  },
  marble: {
    label: "Marble",
    pattern: (a, b) => `radial-gradient(ellipse 60% 40% at 30% 30%, ${b}, transparent 60%), ${a}`,
  },
  plainGilt: {
    label: "Plain & gilt",
    pattern: (a, b) => `linear-gradient(158deg, ${a}, ${b})`,
  },
};

export const RIBBON_IDS = ["satinCream", "satinRed", "gold", "navy", "sage", "twine", "blush"] as const;
export type RibbonId = (typeof RIBBON_IDS)[number];

export const RIBBONS: Record<RibbonId, { label: string; hex: string; sheen: string }> = {
  satinCream: { label: "Cream satin", hex: "#e8dcc0", sheen: "#fbf5e6" },
  satinRed: { label: "Red satin", hex: "#98202e", sheen: "#c84a56" },
  gold: { label: "Gold", hex: "#c9a04a", sheen: "#eccd8a" },
  navy: { label: "Navy", hex: "#2a3550", sheen: "#4a5c80" },
  sage: { label: "Sage", hex: "#7d8f6a", sheen: "#a5b494" },
  twine: { label: "Twine", hex: "#a88a5c", sheen: "#c9ad82" },
  blush: { label: "Blush", hex: "#d49aa0", sheen: "#eec2c6" },
};

