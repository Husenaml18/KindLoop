import { z } from "zod";
import {
  ENVELOPE_IDS,
  HAND_IDS,
  INK_IDS,
  PAPER_COLOR_IDS,
  PAPER_STYLE_IDS,
  SCENT_IDS,
  SEAL_COLOR_IDS,
  SEAL_ICON_IDS,
} from "./theme";

/** The letter reads top to bottom, so its parts are an ordered list of blocks. */
export const BLOCK_KINDS = ["paragraph", "quote", "highlight", "photo", "folded", "ps"] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

export const BLOCK_LABELS: Record<BlockKind, string> = {
  paragraph: "Paragraph",
  quote: "Quote",
  highlight: "Highlighted line",
  photo: "Photo memory",
  folded: "Hidden fold",
  ps: "PS",
};

export const blockSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(BLOCK_KINDS).default("paragraph"),
  text: z.string().max(3000).default(""),
  /** Photo blocks. */
  imageUrl: z.string().max(600).default(""),
  caption: z.string().max(160).default(""),
  /** Folded blocks stay creased until the recipient opens them. */
  foldLabel: z.string().max(80).default(""),
});

export type LetterBlock = z.infer<typeof blockSchema>;

/** Decorations sit on the page wherever the writer dropped them. */
export const DECOR_KINDS = [
  "pressedFlower",
  "petal",
  "waxStain",
  "coffeeStain",
  "doodle",
  "heart",
  "star",
  "ribbon",
  "sticker",
  "bookmark",
  "stamp",
  "clip",
  "leaf",
  "botanical",
] as const;
export type DecorKind = (typeof DECOR_KINDS)[number];

export const DECOR_LABELS: Record<DecorKind, string> = {
  pressedFlower: "Pressed flower",
  petal: "Petals",
  waxStain: "Wax stain",
  coffeeStain: "Coffee stain",
  doodle: "Doodle",
  heart: "Tiny heart",
  star: "Star",
  ribbon: "Ribbon",
  sticker: "Sticker",
  bookmark: "Bookmark",
  stamp: "Vintage stamp",
  clip: "Paper clip",
  leaf: "Leaf",
  botanical: "Botanical sketch",
};

export const decorSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(DECOR_KINDS).default("pressedFlower"),
  /** Percentage of the page, so a composition holds at any width. */
  x: z.number().min(-10).max(110).default(50),
  y: z.number().min(-5).max(105).default(50),
  w: z.number().min(1).max(60).default(8),
  rotate: z.number().min(-180).max(180).default(0),
  color: z.string().max(40).default(""),
});

export type Decoration = z.infer<typeof decorSchema>;

/** A thought pencilled into the margin, tied to a vertical position. */
export const marginNoteSchema = z.object({
  id: z.string().min(1),
  text: z.string().max(200).default(""),
  y: z.number().min(0).max(100).default(30),
  side: z.enum(["left", "right"]).default("right"),
});

export type MarginNote = z.infer<typeof marginNoteSchema>;

export const loveLetterContentSchema = z.object({
  /* stationery */
  paperStyle: z.enum(PAPER_STYLE_IDS).default("ivoryCotton"),
  paperColor: z.enum(PAPER_COLOR_IDS).default("cream"),
  envelope: z.enum(ENVELOPE_IDS).default("luxury"),
  sealColor: z.enum(SEAL_COLOR_IDS).default("burgundy"),
  sealIcon: z.enum(SEAL_ICON_IDS).default("heart"),
  sealMonogram: z.string().max(3).default(""),
  hand: z.enum(HAND_IDS).default("elegant"),
  ink: z.enum(INK_IDS).default("darkBrown"),
  scent: z.enum(SCENT_IDS).default("none"),

  /* the envelope front */
  recipient: z.string().max(80).default(""),

  /* the letter */
  greeting: z.string().max(160).default(""),
  blocks: z.array(blockSchema).max(30).default([]),
  closing: z.string().max(160).default(""),
  signature: z.string().max(80).default(""),
  dateLine: z.string().max(80).default(""),

  /** The line held back for the very end. */
  finalLine: z.string().max(200).default(""),

  /** Clicking the seal on the page plays this. */
  voiceUrl: z.string().max(600).default(""),

  decorations: z.array(decorSchema).max(30).default([]),
  marginNotes: z.array(marginNoteSchema).max(10).default([]),

  /** Words per minute the ink appears at. Slow is the point. */
  writingSpeed: z.number().min(40).max(400).default(150),
});

export type LoveLetterContent = z.infer<typeof loveLetterContentSchema>;

export const DECOR_DEFAULTS: Partial<Record<DecorKind, Partial<Decoration>>> = {
  pressedFlower: { w: 9 },
  petal: { w: 5 },
  waxStain: { w: 7 },
  coffeeStain: { w: 14 },
  doodle: { w: 8 },
  heart: { w: 4 },
  star: { w: 3 },
  ribbon: { w: 5 },
  sticker: { w: 7 },
  bookmark: { w: 5 },
  stamp: { w: 11 },
  clip: { w: 4 },
  leaf: { w: 7 },
  botanical: { w: 16 },
};

export function makeDecoration(kind: DecorKind, id: string): Decoration {
  return decorSchema.parse({ id, kind, ...DECOR_DEFAULTS[kind] });
}

export const emptyLoveLetterContent: LoveLetterContent = loveLetterContentSchema.parse({
  paperStyle: "ivoryCotton",
  paperColor: "cream",
  envelope: "luxury",
  sealColor: "burgundy",
  sealIcon: "heart",
  hand: "elegant",
  ink: "darkBrown",
  recipient: "",
  greeting: "My dearest,",
  blocks: [
    {
      id: "b-1",
      kind: "paragraph",
      text: "There are things I've been meaning to say properly, and a screen never felt like the right place for them. So I'm writing them down instead.",
    },
  ],
  closing: "Yours, always",
  signature: "",
  finalLine: "I hope you keep this forever.",
});

export const LL_FALLBACKS = {
  greeting: "My dearest,",
  closing: "Yours, always",
  finalLine: "I hope you keep this forever.",
  recipient: "For you",
} as const;
