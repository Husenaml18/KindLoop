import { z } from "zod";
import { CHARACTER_IDS, DOODLE_IDS, MOOD_IDS } from "./theme";

/**
 * Operation: Win You Back — content.
 *
 * Shaped as six chapters because the pacing *is* the design. An apology delivered
 * in one paragraph asks to be judged all at once; delivered in chapters it can do
 * what people actually do — admit the thing, explain the thinking, name what
 * should have happened, remember why it matters, promise something specific, and
 * only then say the plain part.
 *
 * Every field is optional and every list can be empty. A creator who fills in only
 * chapter one and the letter still gets a complete, coherent experience — the view
 * skips whatever is not there rather than showing a gap. That matters more here
 * than anywhere else in the catalogue: somebody writing this is not in the mood to
 * be told they have twelve fields left.
 */

/* ------------------------------------------------------------------ */
/* The small pieces                                                   */
/* ------------------------------------------------------------------ */

/** One frame of the comic strip in chapter two. */
export const panelSchema = z.object({
  id: z.string().min(1),
  /** What is happening, narrated underneath. */
  caption: z.string().max(160).default(""),
  /** What was said or thought, in the bubble. */
  bubble: z.string().max(120).default(""),
  doodle: z.enum(DOODLE_IDS).default("cloud"),
});
export type Panel = z.infer<typeof panelSchema>;

/**
 * One "I should've…" the recipient can open.
 *
 * The label is the admission and the body is the working — kept apart so the
 * recipient chooses how much of it to read. A wall of five explanations is a
 * defence; five things you can open one at a time is an offer.
 */
export const regretSchema = z.object({
  id: z.string().min(1),
  label: z.string().max(60).default(""),
  body: z.string().max(600).default(""),
});
export type Regret = z.infer<typeof regretSchema>;

/** Something pinned to the corkboard in chapter four. */
export const keepsakeSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["photo", "note", "ticket", "song", "voice"]).default("note"),
  /** Photo or audio, depending on kind. */
  url: z.string().max(600).default(""),
  /** The handwriting under it. */
  caption: z.string().max(160).default(""),
  /** Ticket stubs and songs get a second line. */
  detail: z.string().max(120).default(""),
  tilt: z.number().min(-10).max(10).default(-2),
});
export type Keepsake = z.infer<typeof keepsakeSchema>;

/** A card that flips over in chapter five. */
export const promiseSchema = z.object({
  id: z.string().min(1),
  /** The promise, short enough to fit on the front of a card. */
  text: z.string().max(120).default(""),
  /** What it actually means in practice, on the back. */
  detail: z.string().max(240).default(""),
  doodle: z.enum(DOODLE_IDS).default("heart"),
});
export type Promise_ = z.infer<typeof promiseSchema>;

/** One of the notes drifting round the edges, admitting something small. */
export const asideSchema = z.object({
  id: z.string().min(1),
  text: z.string().max(120).default(""),
});
export type Aside = z.infer<typeof asideSchema>;

/** Something kept behind the teddy bear, for when it is needed. */
export const cuteSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["image", "joke", "voice"]).default("joke"),
  url: z.string().max(600).default(""),
  text: z.string().max(240).default(""),
});
export type Cute = z.infer<typeof cuteSchema>;

/* ------------------------------------------------------------------ */

export const winYouBackContentSchema = z.object({
  /* ---------- the room ---------- */
  mood: z.enum(MOOD_IDS).default("rose"),
  character: z.enum(CHARACTER_IDS).default("bean"),

  /* ---------- who it is for ---------- */
  to: z.string().max(60).default(""),
  from: z.string().max(60).default(""),

  /* ---------- the opening ---------- */
  /** Both halves of the first line, so the pause between them is authored. */
  openingBroke: z.string().max(120).default("I think I broke something…"),
  openingFix: z.string().max(120).default("…and I really want to fix it."),

  /* ---------- chapter 1: what happened ---------- */
  oopsLine: z.string().max(200).default(""),
  oopsAdmission: z.string().max(400).default(""),

  /* ---------- chapter 2: what I was thinking ---------- */
  replayIntro: z.string().max(300).default(""),
  panels: z.array(panelSchema).max(6).default([]),

  /* ---------- chapter 3: what I should've done ---------- */
  regretIntro: z.string().max(300).default(""),
  regrets: z.array(regretSchema).max(6).default([]),

  /* ---------- chapter 4: the things I miss ---------- */
  missIntro: z.string().max(300).default(""),
  keepsakes: z.array(keepsakeSchema).max(12).default([]),

  /* ---------- chapter 5: the promise ---------- */
  promiseIntro: z.string().max(300).default(""),
  promises: z.array(promiseSchema).max(8).default([]),

  /* ---------- chapter 6: the letter ---------- */
  /** Plain, and deliberately the only place with no animation over it. */
  letter: z.string().max(2500).default(""),
  letterSignoff: z.string().max(80).default(""),

  /* ---------- the small moments ---------- */
  /** "Rate my apology" — off by default, because it is a joke that has to land. */
  rating: z.boolean().default(true),
  asides: z.array(asideSchema).max(8).default([]),

  /* ---------- emergency cute mode ---------- */
  cuteEnabled: z.boolean().default(true),
  cuteLabel: z.string().max(60).default("Emergency cute mode"),
  cute: z.array(cuteSchema).max(8).default([]),

  /* ---------- the ending ---------- */
  closingLine: z
    .string()
    .max(240)
    .default("If today isn't the day, I'll still be grateful you read this."),

  /* ---------- the optional reply ---------- */
  /**
   * Whether to offer the three buttons at the end at all, and where a reply would
   * go if one is pressed. With no address they are still shown, but they say so
   * rather than pretending to send anything.
   */
  replyEnabled: z.boolean().default(true),
  replyTo: z.string().max(160).default(""),
});

export type WinYouBackContent = z.infer<typeof winYouBackContentSchema>;

export const emptyWinYouBackContent: WinYouBackContent =
  winYouBackContentSchema.parse({});
