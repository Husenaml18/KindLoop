/**
 * Digital Scrapbook — "the handmade book on the desk".
 *
 * The object this replaces is a physical scrapbook someone assembled over many
 * evenings: cut photos, washi tape, pressed flowers, ink that bled slightly.
 * It sits on a wooden desk in afternoon light.
 *
 * Deliberately the inverse of Memoryverse (dark room, projected light, film
 * slate): here everything is warm, lit from a window, papery and imperfect.
 */

export const DS = {
  /** The desk the book rests on. */
  deskDark: "#4a3220",
  desk: "#6b4a2c",
  deskLight: "#8a6440",
  /** Afternoon sun through the window. */
  sun: "#ffd9a0",
  sunWarm: "#f6b96a",
  /** Ink and pencil. */
  ink: "#3a3026",
  inkSoft: "#6b5c48",
  inkFaint: "#9a8a72",
} as const;

/** Fonts — handwriting leads, because a human made this. */
export const DS_HAND = "var(--font-gochi), cursive";
export const DS_SERIF = "var(--font-fraunces), Georgia, serif";
export const DS_BODY = "var(--font-space-grotesk), system-ui, sans-serif";
export const DS_STAMP = "var(--font-ibm-plex-mono), ui-monospace, monospace";

/** Paper fibre, reused everywhere so every sheet shares one grain. */
export const PAPER_GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='170' height='170'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4'/></filter><rect width='170' height='170' filter='url(%23f)' opacity='.5'/></svg>\")";

export const THEME_IDS = [
  "vintage",
  "travel",
  "romantic",
  "minimal",
  "floral",
  "retro",
  "christmas",
  "birthday",
  "academia",
  "cottagecore",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export interface PageTheme {
  id: ThemeId;
  label: string;
  /** Page stock. */
  paper: string;
  paperEdge: string;
  /** Ink on that stock. */
  ink: string;
  inkSoft: string;
  /** Accent used by tape, thread, underlines. */
  accent: string;
  accentSoft: string;
  /** Tape colours this theme reaches for. */
  tape: string[];
  /** The desk surface and light around the book. */
  desk: string;
  deskAccent: string;
  /** Which script the handwriting uses. */
  handFont: string;
  /** Printed-label font. */
  titleFont: string;
  /** Little glyphs this theme decorates with. */
  glyphs: string[];
  /** Ambient bed, named for the editor's sound picker. */
  ambience: string;
}

export const PAGE_THEMES: Record<ThemeId, PageTheme> = {
  vintage: {
    id: "vintage",
    label: "Vintage memories",
    paper: "#f0e4cd",
    paperEdge: "#d9c6a4",
    ink: "#4a3b2a",
    inkSoft: "#7d6a51",
    accent: "#a8663c",
    accentSoft: "rgba(168,102,60,.16)",
    tape: ["rgba(206,168,116,.62)", "rgba(178,146,104,.55)"],
    desk: "#6b4a2c",
    deskAccent: "#f6b96a",
    handFont: DS_HAND,
    titleFont: DS_SERIF,
    glyphs: ["✿", "✦", "❦"],
    ambience: "Attic room, distant traffic",
  },
  travel: {
    id: "travel",
    label: "Travel journal",
    paper: "#efe6d2",
    paperEdge: "#cfc0a0",
    ink: "#33403a",
    inkSoft: "#61705f",
    accent: "#37697a",
    accentSoft: "rgba(55,105,122,.15)",
    tape: ["rgba(86,140,150,.55)", "rgba(214,168,104,.6)"],
    desk: "#5c4530",
    deskAccent: "#e8b26a",
    handFont: DS_HAND,
    titleFont: DS_STAMP,
    glyphs: ["✈", "⚓", "☼"],
    ambience: "Train window, rain",
  },
  romantic: {
    id: "romantic",
    label: "Romantic",
    paper: "#faeee8",
    paperEdge: "#e5c9be",
    ink: "#4b2b2b",
    inkSoft: "#845a58",
    accent: "#b8546a",
    accentSoft: "rgba(184,84,106,.14)",
    tape: ["rgba(226,158,168,.6)", "rgba(238,198,190,.66)"],
    desk: "#6b3f3a",
    deskAccent: "#f3b0a4",
    handFont: DS_HAND,
    titleFont: DS_SERIF,
    glyphs: ["♥", "✦", "❀"],
    ambience: "Quiet room, soft piano",
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    paper: "#f7f4ee",
    paperEdge: "#ddd8ce",
    ink: "#2f2d29",
    inkSoft: "#716d65",
    accent: "#8a8578",
    accentSoft: "rgba(138,133,120,.13)",
    tape: ["rgba(196,190,178,.55)"],
    desk: "#6a5c4c",
    deskAccent: "#e6dcc8",
    handFont: DS_HAND,
    titleFont: DS_BODY,
    glyphs: ["·", "—"],
    ambience: "Still room",
  },
  floral: {
    id: "floral",
    label: "Floral",
    paper: "#f4f1e2",
    paperEdge: "#d6d3ba",
    ink: "#3c4430",
    inkSoft: "#6d7659",
    accent: "#7f9b52",
    accentSoft: "rgba(127,155,82,.15)",
    tape: ["rgba(160,186,120,.55)", "rgba(226,188,160,.6)"],
    desk: "#5f5236",
    deskAccent: "#e4d79c",
    handFont: DS_HAND,
    titleFont: DS_SERIF,
    glyphs: ["❀", "✿", "❁"],
    ambience: "Garden, bees",
  },
  retro: {
    id: "retro",
    label: "Retro",
    paper: "#f6ead0",
    paperEdge: "#dcc79c",
    ink: "#3a2f30",
    inkSoft: "#6f5c58",
    accent: "#d4772f",
    accentSoft: "rgba(212,119,47,.16)",
    tape: ["rgba(226,158,84,.6)", "rgba(122,158,158,.55)"],
    desk: "#5a3e2c",
    deskAccent: "#f0b45c",
    handFont: DS_HAND,
    titleFont: DS_STAMP,
    glyphs: ["★", "✸", "◆"],
    ambience: "Vinyl crackle",
  },
  christmas: {
    id: "christmas",
    label: "Christmas",
    paper: "#f3ece0",
    paperEdge: "#d3ccbc",
    ink: "#2f3a32",
    inkSoft: "#5e6a5c",
    accent: "#9c3b34",
    accentSoft: "rgba(156,59,52,.14)",
    tape: ["rgba(170,74,64,.55)", "rgba(96,124,96,.55)"],
    desk: "#4f3a2c",
    deskAccent: "#f0cf94",
    handFont: DS_HAND,
    titleFont: DS_SERIF,
    glyphs: ["❄", "✦", "❉"],
    ambience: "Fireplace, faint bells",
  },
  birthday: {
    id: "birthday",
    label: "Birthday",
    paper: "#fbf2e4",
    paperEdge: "#e6d6be",
    ink: "#3b3230",
    inkSoft: "#756662",
    accent: "#d2604f",
    accentSoft: "rgba(210,96,79,.15)",
    tape: ["rgba(236,168,110,.62)", "rgba(146,176,196,.55)"],
    desk: "#6b4a34",
    deskAccent: "#f7c579",
    handFont: DS_HAND,
    titleFont: DS_SERIF,
    glyphs: ["✳", "★", "✦"],
    ambience: "Distant laughter",
  },
  academia: {
    id: "academia",
    label: "Dark academia",
    paper: "#e6dcc6",
    paperEdge: "#c2b596",
    ink: "#2e2820",
    inkSoft: "#5d5443",
    accent: "#6b4a2e",
    accentSoft: "rgba(107,74,46,.16)",
    tape: ["rgba(150,124,90,.6)", "rgba(112,96,74,.55)"],
    desk: "#3d2c1e",
    deskAccent: "#c99a55",
    handFont: DS_HAND,
    titleFont: DS_SERIF,
    glyphs: ["❦", "✝", "◆"],
    ambience: "Library, clock ticking",
  },
  cottagecore: {
    id: "cottagecore",
    label: "Cottagecore",
    paper: "#f5efdc",
    paperEdge: "#d9cfb2",
    ink: "#3f3a2a",
    inkSoft: "#6f6851",
    accent: "#8a7a3c",
    accentSoft: "rgba(138,122,60,.15)",
    tape: ["rgba(196,180,120,.58)", "rgba(180,196,150,.55)"],
    desk: "#63512f",
    deskAccent: "#e8dba4",
    handFont: DS_HAND,
    titleFont: DS_SERIF,
    glyphs: ["✿", "☘", "❀"],
    ambience: "Kettle, birds outside",
  },
};

export function getTheme(id: string): PageTheme {
  return PAGE_THEMES[(id as ThemeId) in PAGE_THEMES ? (id as ThemeId) : "vintage"];
}
