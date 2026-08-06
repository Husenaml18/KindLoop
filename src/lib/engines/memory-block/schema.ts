import { z } from "zod";

/**
 * Memory Block Engine — the schema.
 *
 * One vocabulary for "a piece of a memory", shared by every experience. A photo
 * is a photo whether it's taped into a scrapbook, hidden behind an advent door,
 * or the reward for finishing a puzzle. Experiences compose blocks and decide how
 * they *look*; they no longer each invent their own content shape.
 *
 * Adding a block kind here makes it available to every experience at once, which
 * is the point — and why the renderer takes a skin rather than baking in colour.
 */

export const BLOCK_KINDS = [
  "text",
  "letter",
  "photo",
  "voice",
  "video",
  "song",
  "quote",
  "map",
  "artwork",
  "date",
] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

export const BLOCK_LABELS: Record<BlockKind, string> = {
  text: "Note",
  letter: "Letter",
  photo: "Photo",
  voice: "Voice message",
  video: "Video",
  song: "Song",
  quote: "Quote",
  map: "Place",
  artwork: "Artwork",
  date: "A date",
};

export const BLOCK_GLYPHS: Record<BlockKind, string> = {
  text: "✎",
  letter: "✉",
  photo: "📷",
  voice: "🎙",
  video: "▶",
  song: "♪",
  quote: "❝",
  map: "📍",
  artwork: "✦",
  date: "📅",
};

/**
 * Every field is optional with a default, so a block is always complete after
 * parsing and a partially-filled block from an editor never fails validation.
 * The kind decides which fields are actually read.
 */
export const memoryBlockSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(BLOCK_KINDS).default("text"),

  /** A heading, where the experience shows one. */
  title: z.string().max(160).default(""),
  /** The words. Letters use this too — the ink engine writes it on. */
  body: z.string().max(4000).default(""),

  imageUrl: z.string().max(600).default(""),
  audioUrl: z.string().max(600).default(""),
  videoUrl: z.string().max(600).default(""),
  /** Songs link out rather than pretending to host music. */
  linkUrl: z.string().max(600).default(""),

  /** Quote attribution, song artist, photographer — whoever it belongs to. */
  credit: z.string().max(160).default(""),

  /** Place blocks: what to call it, and roughly where it is. */
  place: z.string().max(160).default(""),
  lat: z.number().default(0),
  lng: z.number().default(0),

  /** Date blocks: a plain `YYYY-MM-DD`, shown as written not localised. */
  when: z.string().max(40).default(""),
});

export type MemoryBlock = z.infer<typeof memoryBlockSchema>;

export function makeBlock(id: string, kind: BlockKind = "text"): MemoryBlock {
  return memoryBlockSchema.parse({ id, kind });
}

/** Whether a block has anything worth rendering yet. */
export function blockIsEmpty(b: MemoryBlock): boolean {
  switch (b.kind) {
    case "photo":
    case "artwork":
      return !b.imageUrl;
    case "voice":
      return !b.audioUrl;
    case "video":
      return !b.videoUrl;
    case "song":
      return !b.body && !b.linkUrl;
    case "map":
      return !b.place;
    case "date":
      return !b.when;
    default:
      return !b.body && !b.title;
  }
}

/**
 * The palette a block is drawn in. Experiences pass their own, which is how the
 * same photo block reads as a polaroid on a sunlit desk in one place and as
 * gilt-framed on a midnight wall in another.
 */
export interface BlockSkin {
  /** Main text. */
  ink: string;
  /** Secondary text — captions, credits, labels. */
  inkSoft: string;
  /** The accent: rules, play buttons, quote marks. */
  accent: string;
  /** A soft form of the accent, for fills. */
  accentSoft: string;
  /** Surface a block sits on, when it needs one. */
  surface: string;
  /** Border on that surface. */
  edge: string;
  /** Fonts. */
  display: string;
  hand: string;
  body: string;
  mono: string;
}
