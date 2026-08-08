/**
 * My Red Flags (That I'm Working On) — the look.
 *
 * One rule governs the whole palette and it is worth stating before the colours:
 * **no bright red anywhere.** The flag in the title is a joke the sender is making
 * at their own expense, not a warning label. Red is the colour of danger, and
 * danger is the one thing this experience must never imply about the person
 * writing it — they are not a hazard, they are someone doing the work. Terracotta
 * and dusty rose carry the same warmth with none of the alarm.
 *
 * The other constant is forest green, reserved almost entirely for progress: the
 * ticked steps, the plant, the small wins. Growth gets its own colour so that
 * "what I'm doing about it" always reads louder than "what's wrong with me".
 *
 * Not a client module. The schema reads these ids on the server, and exports from
 * a `"use client"` file arrive there as reference proxies with nothing in them.
 */

export const NOTEBOOK_IDS = ["vintage", "romantic", "minimal", "cozy"] as const;
export type NotebookId = (typeof NOTEBOOK_IDS)[number];

export interface Notebook {
  id: NotebookId;
  label: string;
  /** One line, shown while choosing. */
  blurb: string;
  /** The desk the notebook lies on. */
  desk: string;
  /** The cover board. */
  cover: string;
  coverEdge: string;
  /** Ink on the cover, which is darker than the page. */
  coverInk: string;
  /** The page inside. */
  page: string;
  pageEdge: string;
  /** Faint horizontal rule on the page, or `null` for unlined paper. */
  rule: string | null;
  ink: string;
  inkSoft: string;
  /** The one warm accent — terracotta family, never red. */
  accent: string;
  accentSoft: string;
  /** Progress, growth, ticked boxes. Always a green. */
  grow: string;
  growSoft: string;
  /** Sticky notes and highlighter, in the order they get used. */
  stickies: [string, string, string];
  highlight: string;
}

export const NOTEBOOKS: Record<NotebookId, Notebook> = {
  vintage: {
    id: "vintage",
    label: "Vintage journal",
    blurb: "Foxed paper, fountain pen, a book that has been carried around.",
    desk: "radial-gradient(ellipse 90% 60% at 50% 0%, #e6d8bd, #dbcaa9 46%, #cbb78f 100%)",
    cover: "linear-gradient(145deg, #7d5c3a, #5f4429)",
    coverEdge: "rgba(40,28,16,.45)",
    coverInk: "#f2e4cb",
    page: "#fbf3e2",
    pageEdge: "rgba(90,68,40,.22)",
    rule: "rgba(120,96,60,.16)",
    ink: "#4a3a24",
    inkSoft: "#7d6a4c",
    accent: "#a9603c",
    accentSoft: "rgba(169,96,60,.13)",
    grow: "#5c7a4a",
    growSoft: "rgba(92,122,74,.15)",
    stickies: ["#f0d9ad", "#e8c9b2", "#cfdcc0"],
    highlight: "rgba(224,178,92,.34)",
  },
  romantic: {
    id: "romantic",
    label: "Soft romantic",
    blurb: "Dusty rose, pressed petals, handwriting that leans.",
    desk: "radial-gradient(ellipse 90% 60% at 50% 0%, #f7e3e0, #f0d2ce 46%, #e5bdb9 100%)",
    cover: "linear-gradient(145deg, #b5757a, #90565e)",
    coverEdge: "rgba(70,38,42,.4)",
    coverInk: "#fdeef0",
    page: "#fffaf6",
    pageEdge: "rgba(140,94,100,.2)",
    rule: "rgba(160,110,116,.14)",
    ink: "#553840",
    inkSoft: "#87656d",
    accent: "#b96a55",
    accentSoft: "rgba(185,106,85,.13)",
    grow: "#5f8060",
    growSoft: "rgba(95,128,96,.15)",
    stickies: ["#f8d8d2", "#f3e2c4", "#d5e6d6"],
    highlight: "rgba(228,164,150,.34)",
  },
  minimal: {
    id: "minimal",
    label: "Minimal modern",
    blurb: "Plain paper, wide margins, nothing in the way of the words.",
    desk: "linear-gradient(180deg, #f2efe9 0%, #e8e4dc 60%, #ded9d0 100%)",
    cover: "linear-gradient(145deg, #57534b, #3d3a34)",
    coverEdge: "rgba(30,28,24,.35)",
    coverInk: "#f4f1ea",
    page: "#fefdfa",
    pageEdge: "rgba(60,56,48,.16)",
    rule: null,
    ink: "#3a3630",
    inkSoft: "#736e64",
    accent: "#a9654a",
    accentSoft: "rgba(169,101,74,.11)",
    grow: "#55764f",
    growSoft: "rgba(85,118,79,.13)",
    stickies: ["#efe7d6", "#e6ddd0", "#dbe4d5"],
    highlight: "rgba(196,182,150,.34)",
  },
  cozy: {
    id: "cozy",
    label: "Cozy scrapbook",
    blurb: "Tape, doodles in the margin, three colours of sticky note.",
    desk: "radial-gradient(ellipse 90% 60% at 50% 0%, #f6e9d4, #efdcc0 46%, #e3caa4 100%)",
    cover: "linear-gradient(145deg, #a86b4a, #855338)",
    coverEdge: "rgba(60,38,22,.4)",
    coverInk: "#fdefdc",
    page: "#fffbf1",
    pageEdge: "rgba(120,86,50,.2)",
    rule: "rgba(150,116,72,.13)",
    ink: "#4a3826",
    inkSoft: "#7e6a50",
    accent: "#b0663d",
    accentSoft: "rgba(176,102,61,.13)",
    grow: "#5e7f48",
    growSoft: "rgba(94,127,72,.15)",
    stickies: ["#ffe0ad", "#f7cdb8", "#d3e5bd"],
    highlight: "rgba(232,186,104,.36)",
  },
};

/**
 * The plant in the corner.
 *
 * It grows with how far through the journal you are, and it is the only progress
 * indicator here — deliberately, instead of "3 of 7". A fraction invites you to
 * check how much is left; a plant just quietly gets bigger. The metaphor is the
 * brief's, and it earns its place: growth over perfection.
 */
export const GROWTH_STAGES = [
  { at: 0, glyph: "🌱", label: "just started" },
  { at: 0.34, glyph: "🌿", label: "coming along" },
  { at: 0.7, glyph: "🪴", label: "taking root" },
  { at: 1, glyph: "🌸", label: "flowering" },
] as const;

export type GrowthStage = (typeof GROWTH_STAGES)[number];

export function growthFor(fraction: number): GrowthStage {
  let stage: GrowthStage = GROWTH_STAGES[0];
  for (const s of GROWTH_STAGES) if (fraction >= s.at) stage = s;
  return stage;
}

/** What can be attached to one flag, beyond the words. */
export const ATTACHMENT_IDS = ["none", "photo", "voice", "screenshot"] as const;
export type AttachmentId = (typeof ATTACHMENT_IDS)[number];

export const ATTACHMENT_LABELS: Record<AttachmentId, string> = {
  none: "Just the words",
  photo: "A photo",
  voice: "A voice note",
  screenshot: "A screenshot",
};
