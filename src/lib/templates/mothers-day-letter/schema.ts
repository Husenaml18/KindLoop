import { z } from "zod";
import {
  DECOR_IDS,
  ENVELOPE_IDS,
  HAND_IDS,
  INK_IDS,
  PAPER_COLOUR_IDS,
  PAPER_IDS,
  SEAL_COLOUR_IDS,
  SEAL_SYMBOL_IDS,
} from "./theme";

/**
 * Mother's Day Letter — content.
 *
 * Shaped as a letter with chapters rather than one block of text, because the
 * brief's structure *is* the emotional pacing: the ordinary greeting, then the
 * body, then a memory, then the things never said out loud, then her voice, then
 * the signature. Each part is optional; a letter with only a greeting and a body
 * is still a complete letter, and the view simply skips what isn't there.
 */

/* ------------------------------------------------------------------ */
/* The small pieces                                                   */
/* ------------------------------------------------------------------ */

/** A photograph tucked between paragraphs. */
export const polaroidSchema = z.object({
  id: z.string().min(1),
  url: z.string().max(600).default(""),
  caption: z.string().max(160).default(""),
  /** Which paragraph it sits beside, 0-based. Clamped when rendered. */
  afterParagraph: z.number().int().min(0).default(0),
  /** Which way it's tucked in. */
  tilt: z.number().min(-12).max(12).default(-3),
});
export type Polaroid = z.infer<typeof polaroidSchema>;

/** One of the "What You Taught Me" cards. */
export const lessonSchema = z.object({
  id: z.string().min(1),
  /** The lesson, in a few words. */
  title: z.string().max(90).default(""),
  /** How she taught it, or when you noticed. */
  body: z.string().max(400).default(""),
  /** A drawn illustration on the card. */
  motif: z.enum(["flower", "cup", "hands", "thread", "sun", "house", "bird", "book"]).default("flower"),
});
export type Lesson = z.infer<typeof lessonSchema>;

/** A small note pinned round the margins. */
export const thanksSchema = z.object({
  id: z.string().min(1),
  text: z.string().max(200).default(""),
});
export type Thanks = z.infer<typeof thanksSchema>;

/** A decoration laid on the page. */
export const decorSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(DECOR_IDS).default("babysBreath"),
  /** Percentages of the sheet. */
  x: z.number().min(-6).max(106).default(50),
  y: z.number().min(-6).max(106).default(50),
  rotate: z.number().min(-180).max(180).default(0),
  scale: z.number().min(0.4).max(2.4).default(1),
});
export type Decor = z.infer<typeof decorSchema>;

/* ------------------------------------------------------------------ */

export const mothersDayContentSchema = z.object({
  /* ---------- the stationery ---------- */
  paper: z.enum(PAPER_IDS).default("softFloral"),
  paperColour: z.enum(PAPER_COLOUR_IDS).default("ivory"),
  envelope: z.enum(ENVELOPE_IDS).default("floral"),
  sealColour: z.enum(SEAL_COLOUR_IDS).default("roseGold"),
  sealSymbol: z.enum(SEAL_SYMBOL_IDS).default("flower"),
  /** Only read when the symbol is "initial". */
  sealInitial: z.string().max(2).default("M"),
  hand: z.enum(HAND_IDS).default("elegant"),
  ink: z.enum(INK_IDS).default("sepia"),

  /* ---------- on the table ---------- */
  /** Written on the tag tied to the envelope. */
  tag: z.string().max(40).default(""),
  /** Words per minute the ink flows at. Slow is the point. */
  writingSpeed: z.number().min(60).max(260).default(120),

  /* ---------- the letter ---------- */
  greeting: z.string().max(120).default(""),
  /** The body, paragraph per blank line. */
  body: z.string().max(6000).default(""),
  /** "Things I've never said" — held back until near the end. */
  neverSaid: z.string().max(2000).default(""),
  closing: z.string().max(160).default(""),
  signature: z.string().max(80).default(""),
  /** Written as the creator types it, never localised. */
  dateLine: z.string().max(60).default(""),
  postscript: z.string().max(300).default(""),

  /* ---------- the special sections ---------- */
  favouriteMemoryTitle: z.string().max(120).default(""),
  favouriteMemoryPhoto: z.string().max(600).default(""),
  favouriteMemoryStory: z.string().max(1200).default(""),

  lessons: z.array(lessonSchema).max(8).default([]),
  thanks: z.array(thanksSchema).max(10).default([]),
  polaroids: z.array(polaroidSchema).max(10).default([]),
  decorations: z.array(decorSchema).max(20).default([]),

  /* ---------- her voice ---------- */
  voiceUrl: z.string().max(600).default(""),
  voiceLabel: z.string().max(80).default(""),

  /* ---------- the last moment ---------- */
  familyPhoto: z.string().max(600).default(""),
  finalLine: z.string().max(200).default(""),

  /* ---------- ambience ---------- */
  /**
   * Whether the synthesised morning ambience is offered at all. It is always
   * muted until asked for; this only decides if the control exists.
   */
  ambience: z.boolean().default(true),
  /** The garden grows as they read. Turn it off for a plainer sheet. */
  garden: z.boolean().default(true),
});

export type MothersDayContent = z.infer<typeof mothersDayContentSchema>;

/* ------------------------------------------------------------------ */
/* Reading it                                                         */
/* ------------------------------------------------------------------ */

/** Paragraphs, split on blank lines and trimmed. */
export function paragraphsOf(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Everything that gets written in ink, in the order it appears.
 *
 * Collected in one place so the writing cursor can run continuously across the
 * whole letter: the ink must not restart at every section, or the effect of one
 * person writing one letter falls apart.
 */
export function inkFlow(content: MothersDayContent): string[] {
  const out: string[] = [];
  if (content.greeting.trim()) out.push(content.greeting.trim());
  out.push(...paragraphsOf(content.body));
  if (content.neverSaid.trim()) out.push(...paragraphsOf(content.neverSaid));
  if (content.closing.trim()) out.push(content.closing.trim());
  return out;
}

/**
 * How far through the letter they are, 0..1.
 *
 * Drives the garden: at 0 the margins are bare, at 1 they are in full bloom.
 */
export function bloomAt(written: number, total: number): number {
  if (total <= 0) return 1;
  return Math.max(0, Math.min(1, written / total));
}

/**
 * How many blooms are open at this much progress.
 *
 * One per meaningful thing in the letter — a thank-you note, a lesson, a
 * photograph — so the finished border is literally made of what she gave them,
 * which is the whole idea of the growing garden.
 */
export function bloomCount(content: MothersDayContent, progress: number): number {
  const total = gardenSize(content);
  return Math.round(total * progress);
}

/** The garden's full size: never fewer than a handful, never a thicket. */
export function gardenSize(content: MothersDayContent): number {
  const meaningful = content.thanks.length + content.lessons.length + content.polaroids.length;
  return Math.max(6, Math.min(18, meaningful + 4));
}

/* ------------------------------------------------------------------ */

export function makeLesson(id: string): Lesson {
  return lessonSchema.parse({ id });
}
export function makeThanks(id: string): Thanks {
  return thanksSchema.parse({ id });
}
export function makePolaroid(id: string, afterParagraph = 0): Polaroid {
  return polaroidSchema.parse({ id, afterParagraph, tilt: afterParagraph % 2 ? 3 : -3 });
}
export function makeDecor(id: string, kind: Decor["kind"] = "babysBreath"): Decor {
  return decorSchema.parse({ id, kind });
}

export const emptyMothersDayContent: MothersDayContent = mothersDayContentSchema.parse({
  paper: "softFloral",
  paperColour: "ivory",
  envelope: "floral",
  sealColour: "roseGold",
  sealSymbol: "flower",
  hand: "elegant",
  ink: "sepia",
  tag: "For Mom",
  greeting: "Mom,",
  body: "I've been meaning to write this for a long time.\n\nI'm not going to get it all down properly, but I wanted to try.",
  closing: "All my love,",
  signature: "",
  finalLine: "No matter how old I become, I'll always be your child.",
  ambience: true,
  garden: true,
});

export const MD_FALLBACKS = {
  tag: "For Mom",
  greeting: "Mom,",
  closing: "All my love,",
  finalLine: "No matter how old I become, I'll always be your child.",
  voiceLabel: "Press here",
} as const;
