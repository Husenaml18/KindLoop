import { z } from "zod";
import { THEME_IDS } from "./theme";

/**
 * The whole point of this template is that no two spreads look alike, so the
 * data model is a free canvas rather than a set of layouts: every item carries
 * its own position, rotation, scale and stacking order across the spread.
 *
 * Coordinates are percentages of the spread (0–100 on both axes), which keeps
 * a composition intact from a phone to a desktop two-page spread.
 */

export const ITEM_KINDS = [
  "photo",
  "polaroid",
  "note",
  "journal",
  "title",
  "ticket",
  "postcard",
  "filmstrip",
  "sticky",
  "letter",
  "cassette",
  "pocket",
  "flower",
  "leaf",
  "tape",
  "clip",
  "stain",
  "doodle",
  "stamp",
  "ribbon",
  "star",
  "pin",
  "tag",
  "scrap",
] as const;

export type ItemKind = (typeof ITEM_KINDS)[number];

export const ITEM_LABELS: Record<ItemKind, string> = {
  photo: "Photo",
  polaroid: "Polaroid",
  note: "Handwritten note",
  journal: "Journal entry",
  title: "Title",
  ticket: "Ticket",
  postcard: "Postcard",
  filmstrip: "Film strip",
  sticky: "Sticky note",
  letter: "Folded letter",
  cassette: "Cassette",
  pocket: "Memory pocket",
  flower: "Pressed flower",
  leaf: "Pressed leaf",
  tape: "Washi tape",
  clip: "Paper clip",
  stain: "Coffee stain",
  doodle: "Doodle",
  stamp: "Date stamp",
  ribbon: "Ribbon",
  star: "Tiny star",
  pin: "Push pin",
  tag: "Gift tag",
  scrap: "Torn paper",
};

/** Which items are decoration only — the editor groups them separately. */
export const DECOR_KINDS: ItemKind[] = [
  "tape",
  "clip",
  "stain",
  "doodle",
  "stamp",
  "ribbon",
  "star",
  "flower",
  "leaf",
  "pin",
  "tag",
  "scrap",
];

export const DOODLE_SHAPES = ["heart", "arrow", "swirl", "underline", "burst"] as const;
export type DoodleShape = (typeof DOODLE_SHAPES)[number];

export const itemSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(ITEM_KINDS).default("photo"),

  /** Placement across the spread, in percent. */
  x: z.number().min(-20).max(120).default(50),
  y: z.number().min(-20).max(120).default(50),
  /** Width in percent of spread width; height follows the item's own ratio. */
  w: z.number().min(2).max(100).default(24),
  rotate: z.number().min(-180).max(180).default(0),
  z: z.number().min(0).max(999).default(1),
  locked: z.boolean().default(false),

  /** Media + words. Unused fields simply stay empty per kind. */
  imageUrl: z.string().max(600).default(""),
  audioUrl: z.string().max(600).default(""),
  text: z.string().max(1400).default(""),
  caption: z.string().max(240).default(""),
  /** Second line of small print: ticket row, stamp date, postcard place. */
  meta: z.string().max(120).default(""),

  /** Colour override — otherwise the theme decides. */
  color: z.string().max(40).default(""),
  doodle: z.enum(DOODLE_SHAPES).default("heart"),

  /** Pocket / letter / tag contents, revealed on interaction. */
  hiddenText: z.string().max(1200).default(""),
  hiddenImageUrl: z.string().max(600).default(""),
});

export type ScrapItem = z.infer<typeof itemSchema>;

export const spreadSchema = z.object({
  id: z.string().min(1),
  /** Optional per-spread override of the book's theme. */
  theme: z.enum(THEME_IDS).nullable().default(null),
  /** Small printed tab on the page edge. */
  tab: z.string().max(40).default(""),
  items: z.array(itemSchema).max(40).default([]),
});

export type Spread = z.infer<typeof spreadSchema>;

export const digitalScrapbookContentSchema = z.object({
  theme: z.enum(THEME_IDS).default("vintage"),

  /** Cover. */
  title: z.string().max(120).default(""),
  subtitle: z.string().max(160).default(""),
  nameTag: z.string().max(80).default(""),
  coverImageUrl: z.string().max(600).default(""),

  /** The handwritten line before the book opens. */
  openingNote: z.string().max(220).default(""),

  /** Ambient bed, off by default — sound is never forced on anyone. */
  ambientUrl: z.string().max(600).default(""),

  spreads: z.array(spreadSchema).max(30).default([]),

  /** Closing spread. */
  closingNote: z.string().max(200).default(""),
  closingSubnote: z.string().max(200).default(""),
  closingImageUrl: z.string().max(600).default(""),
});

export type DigitalScrapbookContent = z.infer<typeof digitalScrapbookContentSchema>;

/** Sensible defaults for a brand-new item of each kind, so nothing lands empty. */
export const ITEM_DEFAULTS: Partial<Record<ItemKind, Partial<ScrapItem>>> = {
  photo: { w: 30 },
  polaroid: { w: 20, caption: "the good one" },
  note: { w: 26, text: "write something only they'd get" },
  journal: { w: 30, text: "The long version of what happened." },
  title: { w: 40, text: "A title for this page" },
  ticket: { w: 20, text: "CINEMA", meta: "ADMIT ONE" },
  postcard: { w: 30, text: "Wish you were here", meta: "LISBON" },
  filmstrip: { w: 26 },
  sticky: { w: 16, text: "don't forget" },
  letter: { w: 20, hiddenText: "The bit I never said out loud." },
  cassette: { w: 24, caption: "side A" },
  pocket: { w: 22, text: "pull me out", hiddenText: "Found it." },
  flower: { w: 9 },
  leaf: { w: 9 },
  tape: { w: 14 },
  clip: { w: 5 },
  stain: { w: 18 },
  doodle: { w: 10 },
  stamp: { w: 14, meta: "12 JAN 2024" },
  ribbon: { w: 7 },
  star: { w: 4 },
  pin: { w: 5 },
  tag: { w: 13, text: "for you", hiddenText: "Found the tag. Good." },
  scrap: { w: 18, text: "" },
};

export function makeItem(kind: ItemKind, id: string): ScrapItem {
  return itemSchema.parse({ id, kind, ...ITEM_DEFAULTS[kind] });
}

export const emptyDigitalScrapbookContent: DigitalScrapbookContent =
  digitalScrapbookContentSchema.parse({
    theme: "vintage",
    title: "Our Scrapbook",
    subtitle: "made over a few evenings",
    nameTag: "",
    openingNote: "I spent a little time making this for you.",
    spreads: [
      {
        id: "sp-1",
        tab: "one",
        items: [
          { id: "it-1", kind: "title", x: 26, y: 20, w: 34, rotate: -2, z: 3, text: "Where it started" },
          { id: "it-2", kind: "photo", x: 28, y: 55, w: 28, rotate: -3, z: 2 },
          { id: "it-3", kind: "tape", x: 28, y: 40, w: 13, rotate: -8, z: 4 },
          { id: "it-4", kind: "flower", x: 68, y: 66, w: 9, rotate: 14, z: 3 },
          { id: "it-5", kind: "note", x: 70, y: 38, w: 24, rotate: 2, z: 2, text: "the first page is always the hardest" },
        ],
      },
    ],
    closingNote: "Our scrapbook isn't finished.",
    closingSubnote: "There are still blank pages waiting for us.",
  });

export const DS_FALLBACKS = {
  title: "Our Scrapbook",
  openingNote: "I spent a little time making this for you.",
  closingNote: "Our scrapbook isn't finished.",
  closingSubnote: "There are still blank pages waiting for us.",
} as const;
