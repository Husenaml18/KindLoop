import { z } from "zod";
import { memoryBlockSchema, makeBlock, type MemoryBlock } from "@/lib/engines/memory-block/schema";
import { CUT_IDS, DIFFICULTY_IDS, MATERIAL_IDS, SURFACE_IDS } from "./theme";

/**
 * Memory Puzzle — content.
 *
 * The design brief was emphatic that this is not a game, so the schema is shaped
 * around the *story*, not the puzzle: the picture is one field, and everything
 * else is what unlocks along the way. Milestones are the whole point — solving is
 * merely how you earn them.
 */

/** Milestones are percentages of the board, so they hold at any grid size. */
export const MILESTONE_MARKS = [25, 50, 75, 100] as const;
export type MilestoneMark = (typeof MILESTONE_MARKS)[number];

export const milestoneSchema = z.object({
  /** How much of the picture must be assembled first. */
  at: z.union([z.literal(25), z.literal(50), z.literal(75), z.literal(100)]).default(25),
  /** A line of narration that appears as it unlocks. */
  headline: z.string().max(160).default(""),
  /** What they get. Any memory kind the platform supports. */
  reward: memoryBlockSchema,
});

export type Milestone = z.infer<typeof milestoneSchema>;

/**
 * A secret tucked inside one piece. Optional, and never signposted — the reward
 * for being the sort of person who clicks a piece they've already placed.
 */
export const secretSchema = z.object({
  id: z.string().min(1),
  /** Which piece hides it, as a 0-based index into the grid, reading order. */
  piece: z.number().int().min(0).default(0),
  kind: z.enum(["doodle", "quote", "flower", "voice", "date", "sparkle"]).default("quote"),
  text: z.string().max(300).default(""),
  audioUrl: z.string().max(600).default(""),
});

export type Secret = z.infer<typeof secretSchema>;

export const memoryPuzzleContentSchema = z.object({
  /* ---------- the object ---------- */
  surface: z.enum(SURFACE_IDS).default("woodDesk"),
  material: z.enum(MATERIAL_IDS).default("wood"),
  cut: z.enum(CUT_IDS).default("jigsaw"),
  size: z
    .union([z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(8), z.literal(10)])
    .default(4),
  difficulty: z.enum(DIFFICULTY_IDS).default("medium"),

  /* ---------- the opening ---------- */
  /** Engraved on the keepsake box the pieces come out of. */
  boxLabel: z.string().max(60).default(""),
  /** The three lines of the opening, delivered one at a time. */
  openingLines: z.array(z.string().max(120)).max(4).default([]),

  /* ---------- the picture ---------- */
  /** The photograph, artwork or scanned letter that becomes the puzzle. */
  imageUrl: z.string().max(600).default(""),
  /** What the picture is of, for anyone using a screen reader. */
  imageAlt: z.string().max(200).default(""),
  /** A video that plays instead of the still, once it's fully assembled. */
  videoUrl: z.string().max(600).default(""),

  /* ---------- the story ---------- */
  milestones: z.array(milestoneSchema).max(4).default([]),
  secrets: z.array(secretSchema).max(12).default([]),

  /* ---------- the ending ---------- */
  /** The handwritten line that fades in over the finished picture. */
  closingLine: z.string().max(200).default(""),
  /** Written under the framed photograph on the last screen. */
  framedCaption: z.string().max(200).default(""),
  /** Optional music bed, started by a click and never before. */
  musicUrl: z.string().max(600).default(""),
});

export type MemoryPuzzleContent = z.infer<typeof memoryPuzzleContentSchema>;

/* ------------------------------------------------------------------ */
/* Progress                                                           */
/* ------------------------------------------------------------------ */

/** Percentage of the board assembled, 0..100. */
export function percentDone(placed: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((placed / total) * 100);
}

/**
 * Which milestones have been earned at this much progress. Ordered, so the view
 * can show them as a sequence rather than a set.
 */
export function earnedMilestones(content: MemoryPuzzleContent, percent: number): Milestone[] {
  return [...content.milestones].sort((a, b) => a.at - b.at).filter((m) => percent >= m.at);
}

/** The next one to work toward, if there is one. */
export function nextMilestone(content: MemoryPuzzleContent, percent: number): Milestone | null {
  return [...content.milestones].sort((a, b) => a.at - b.at).find((m) => percent < m.at) ?? null;
}

/**
 * How much of its colour a placed piece has come into, 0..1.
 *
 * Story mode asks that the photograph "becomes clearer" as sections complete. It
 * does that here by warming up the pieces *already on the board* — they start
 * muted and reach full colour as the picture comes together. The unassembled
 * picture is never shown at all, which is the entire point of the experience: the
 * memory is hidden until it's been earned.
 */
export function clarityAt(percent: number): number {
  return Math.min(1, percent / 100);
}

/** A gentle nudge, never a scold. Mirrors the Unlock Engine's tone. */
export function progressNote(placed: number, total: number): string {
  const left = total - placed;
  if (left <= 0) return "That's all of it.";
  if (left === 1) return "One piece left.";
  if (left === 2) return "Two to go.";
  if (placed === 0) return "Start anywhere. Corners are easiest.";
  return `${left} pieces left.`;
}

/* ------------------------------------------------------------------ */

export function makeMilestone(at: MilestoneMark, headline: string, reward: MemoryBlock): Milestone {
  return milestoneSchema.parse({ at, headline, reward });
}

export const emptyMemoryPuzzleContent: MemoryPuzzleContent = memoryPuzzleContentSchema.parse({
  surface: "woodDesk",
  material: "wood",
  cut: "jigsaw",
  size: 4,
  difficulty: "medium",
  boxLabel: "For you",
  openingLines: ["I hid something inside.", "The only way to see it…", "…is to put the pieces together."],
  imageUrl: "",
  imageAlt: "",
  milestones: [
    { at: 25, headline: "It's starting to look like something.", reward: makeBlock("m-1", "text") },
    { at: 100, headline: "There it is.", reward: makeBlock("m-4", "letter") },
  ],
  closingLine: "I'm glad you stayed until the end.",
  framedCaption: "The best memories are the ones we build together.",
});

export const MP_FALLBACKS = {
  openingLines: ["I hid something inside.", "The only way to see it…", "…is to put the pieces together."],
  boxLabel: "For you",
  closingLine: "I'm glad you stayed until the end.",
  framedCaption: "The best memories are the ones we build together.",
} as const;

/**
 * A stable identity for one puzzle, used to key its saved progress.
 *
 * The photograph's URL alone was not enough: two gifts built from the same pasted
 * image at the same size would have shared a save, so finishing one would show the
 * other as already solved. Everything that makes this puzzle *this* puzzle goes
 * into the hash.
 */
export function puzzleKey(content: MemoryPuzzleContent): string {
  const parts = [
    content.imageUrl,
    content.size,
    content.cut,
    content.difficulty,
    content.closingLine,
    content.boxLabel,
    content.milestones.map((m) => `${m.at}:${m.reward.id}`).join(","),
  ].join("|");

  let h = 2166136261;
  for (let i = 0; i < parts.length; i += 1) {
    h ^= parts.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `kindloop-puzzle-${(h >>> 0).toString(36)}`;
}
