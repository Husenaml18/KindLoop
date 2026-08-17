/**
 * Paper Engine — stock.
 *
 * Every Kindloop experience that is made of paper draws its surfaces, colours,
 * handwriting and ink from here. An experience picks from these and then styles
 * *around* them; the tables themselves stay neutral so a letter, a scrapbook
 * page and a puzzle-piece note can all be the same physical material without
 * looking like the same product.
 */

/* ------------------------------- paper ------------------------------- */

export const PAPER_STYLE_IDS = [
  "ivoryCotton",
  "vintageBeige",
  "aged",
  "linen",
  "watercolour",
  "floral",
  "minimalWhite",
  "darkElegant",
  "washi",
  "botanical",
  "deckled",
] as const;
export type PaperStyleId = (typeof PAPER_STYLE_IDS)[number];

export interface PaperStyle {
  id: PaperStyleId;
  label: string;
  /** Extra layers painted over the base colour. */
  overlay: string;
  /** Fibre strength, 0–1. */
  grain: number;
  /** Torn/deckled edge rather than a clean cut. */
  deckled: boolean;
  /** Dark stationery flips the ink to a light colour. */
  dark: boolean;
  edge: string;
}

export const PAPER_STYLES: Record<PaperStyleId, PaperStyle> = {
  ivoryCotton: {
    id: "ivoryCotton",
    label: "Ivory cotton",
    overlay: "none",
    grain: 0.3,
    deckled: false,
    dark: false,
    edge: "0 30px 60px -30px rgba(70,54,34,.4)",
  },
  vintageBeige: {
    id: "vintageBeige",
    label: "Vintage beige",
    overlay:
      "radial-gradient(ellipse at 12% 8%, rgba(150,116,72,.16), transparent 46%), radial-gradient(ellipse at 88% 92%, rgba(150,116,72,.14), transparent 44%)",
    grain: 0.44,
    deckled: false,
    dark: false,
    edge: "0 30px 60px -30px rgba(70,54,34,.46)",
  },
  aged: {
    id: "aged",
    label: "Aged paper",
    overlay:
      "radial-gradient(ellipse at 0% 0%, rgba(122,84,40,.28), transparent 38%), radial-gradient(ellipse at 100% 12%, rgba(122,84,40,.2), transparent 34%), radial-gradient(ellipse at 40% 100%, rgba(122,84,40,.22), transparent 40%)",
    grain: 0.6,
    deckled: true,
    dark: false,
    edge: "0 28px 56px -28px rgba(60,44,26,.55)",
  },
  linen: {
    id: "linen",
    label: "Linen",
    overlay:
      "repeating-linear-gradient(0deg, rgba(120,100,70,.055) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgba(120,100,70,.055) 0 1px, transparent 1px 4px)",
    grain: 0.24,
    deckled: false,
    dark: false,
    edge: "0 30px 60px -30px rgba(70,54,34,.4)",
  },
  watercolour: {
    id: "watercolour",
    label: "Watercolour",
    overlay:
      "radial-gradient(ellipse at 20% 18%, rgba(150,170,190,.2), transparent 40%), radial-gradient(ellipse at 82% 76%, rgba(196,164,180,.2), transparent 42%)",
    grain: 0.52,
    deckled: true,
    dark: false,
    edge: "0 30px 58px -28px rgba(70,54,34,.4)",
  },
  floral: {
    id: "floral",
    label: "Floral stationery",
    overlay: "none",
    grain: 0.28,
    deckled: false,
    dark: false,
    edge: "0 30px 60px -30px rgba(70,54,34,.4)",
  },
  minimalWhite: {
    id: "minimalWhite",
    label: "Minimal white",
    overlay: "none",
    grain: 0.12,
    deckled: false,
    dark: false,
    edge: "0 26px 54px -30px rgba(40,40,40,.3)",
  },
  darkElegant: {
    id: "darkElegant",
    label: "Dark elegant",
    overlay: "radial-gradient(ellipse at 50% 0%, rgba(255,240,210,.07), transparent 60%)",
    grain: 0.3,
    deckled: false,
    dark: true,
    edge: "0 34px 66px -30px rgba(0,0,0,.75)",
  },
  washi: {
    id: "washi",
    label: "Japanese washi",
    overlay:
      "repeating-linear-gradient(74deg, rgba(140,120,90,.07) 0 1px, transparent 1px 9px), radial-gradient(ellipse at 70% 30%, rgba(160,140,110,.1), transparent 50%)",
    grain: 0.66,
    deckled: true,
    dark: false,
    edge: "0 28px 56px -28px rgba(70,54,34,.42)",
  },
  botanical: {
    id: "botanical",
    label: "Botanical",
    overlay: "none",
    grain: 0.32,
    deckled: false,
    dark: false,
    edge: "0 30px 60px -30px rgba(60,70,50,.42)",
  },
  deckled: {
    id: "deckled",
    label: "Luxury deckled edge",
    overlay: "none",
    grain: 0.2,
    deckled: true,
    dark: false,
    edge: "0 34px 64px -28px rgba(70,54,34,.44)",
  },
};

/* ---------------------------- paper colour ---------------------------- */

export const PAPER_COLOR_IDS = [
  "cream",
  "ivory",
  "softPink",
  "warmBeige",
  "paleLavender",
  "sage",
  "champagne",
  "dustyBlue",
  "classicWhite",
] as const;
export type PaperColorId = (typeof PAPER_COLOR_IDS)[number];

export const PAPER_COLORS: Record<PaperColorId, { label: string; hex: string }> = {
  cream: { label: "Cream", hex: "#f6ecd8" },
  ivory: { label: "Ivory", hex: "#f8f2e4" },
  softPink: { label: "Soft pink", hex: "#f9eae6" },
  warmBeige: { label: "Warm beige", hex: "#efe2cc" },
  paleLavender: { label: "Pale lavender", hex: "#efeaf4" },
  sage: { label: "Sage", hex: "#e9eee2" },
  champagne: { label: "Champagne", hex: "#f5ead3" },
  dustyBlue: { label: "Dusty blue", hex: "#e6ecf1" },
  classicWhite: { label: "Classic white", hex: "#fbfaf6" },
};

/* ---------------------------- handwriting ---------------------------- */

export const HAND_IDS = [
  "elegant",
  "romantic",
  "messy",
  "calligraphy",
  "classic",
  "journal",
  "vintage",
] as const;
export type HandId = (typeof HAND_IDS)[number];

export interface Handwriting {
  id: HandId;
  label: string;
  /** CSS variable set by letterFonts.ts. */
  family: string;
  /** Scripts have wildly different x-heights, so each carries its own metrics. */
  scale: number;
  lineHeight: number;
  tracking: string;
}

export const HANDS: Record<HandId, Handwriting> = {
  elegant: { id: "elegant", label: "Elegant cursive", family: "var(--hw-elegant), cursive", scale: 1.06, lineHeight: 1.85, tracking: "0" },
  romantic: { id: "romantic", label: "Romantic script", family: "var(--hw-romantic), cursive", scale: 1.14, lineHeight: 1.95, tracking: ".005em" },
  messy: { id: "messy", label: "Messy personal", family: "var(--hw-messy), cursive", scale: 1.2, lineHeight: 1.7, tracking: "0" },
  calligraphy: { id: "calligraphy", label: "Modern calligraphy", family: "var(--hw-calligraphy), cursive", scale: 1.22, lineHeight: 2, tracking: ".01em" },
  classic: { id: "classic", label: "Classic ink", family: "var(--hw-classic), cursive", scale: 0.82, lineHeight: 2.1, tracking: "0" },
  journal: { id: "journal", label: "Neat journal", family: "var(--hw-journal), cursive", scale: 1, lineHeight: 1.8, tracking: ".004em" },
  vintage: { id: "vintage", label: "Vintage penmanship", family: "var(--hw-vintage), cursive", scale: 1.02, lineHeight: 1.8, tracking: "0" },
};

/* ------------------------------- ink -------------------------------- */

export const INK_IDS = ["black", "darkBrown", "navy", "forest", "burgundy", "purple", "sepia"] as const;
export type InkId = (typeof INK_IDS)[number];

export const INKS: Record<InkId, { label: string; hex: string; wet: string }> = {
  black: { label: "Black", hex: "#211f1d", wet: "#3b3835" },
  darkBrown: { label: "Dark brown", hex: "#4a3120", wet: "#66452e" },
  navy: { label: "Navy", hex: "#22304f", wet: "#33456b" },
  forest: { label: "Forest green", hex: "#26402f", wet: "#375a43" },
  burgundy: { label: "Burgundy", hex: "#5c1f28", wet: "#7e2f3a" },
  purple: { label: "Purple", hex: "#3d2450", wet: "#553470" },
  sepia: { label: "Sepia", hex: "#6b4a2a", wet: "#8a6339" },
};

/** sRGB relative luminance, per WCAG. 0 is black, 1 is white. */
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

/**
 * Ink on dark stationery needs to invert or it simply disappears.
 *
 * Decided from the luminance of the sheet that actually gets painted, not from
 * `paperStyle.dark`. That flag is a *promise* a style makes about the ground it
 * lays down, and `darkElegant` does not keep it: its overlay is a faint light
 * radial, so the sheet ends up whatever `paperColor` says. Worse, not one of the
 * nine paper colours is dark — the lightest is 0.955 and the darkest 0.771 — so
 * the flag could never be correct with this palette. Measured against every
 * colour in the set, the inverted cream ink scored between 1.01:1 and 1.21:1,
 * which is invisible, while the intended ink scored 10:1 or better.
 *
 * That combination was reachable in the editor as well as in the demo, so a
 * person could write a whole letter nobody could read.
 *
 * A style that genuinely paints a dark ground still inverts correctly, because a
 * dark ground means a dark base colour and this reads the base colour.
 */
export function inkFor(
  inkId: InkId,
  paperStyle: PaperStyle,
  /** The sheet's own colour. Omitted, the old flag is used as a fallback. */
  paperHex?: string
): { hex: string; wet: string } {
  const dark = paperHex ? luminance(paperHex) < 0.4 : paperStyle.dark;
  return dark ? { hex: "#eee4cf", wet: "#fff6e4" } : INKS[inkId];
}

/* --------------------------- scent particles --------------------------- */

export const FIBRE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4'/></filter><rect width='180' height='180' filter='url(%23w)' opacity='.5'/></svg>\")";

