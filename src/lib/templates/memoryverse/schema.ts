import { z } from "zod";

export const CHAPTER_KINDS = [
  "photo",
  "video",
  "voice",
  "quote",
  "letter",
  "timeline",
  "location",
  "countdown",
] as const;

export type ChapterKind = (typeof CHAPTER_KINDS)[number];

export const CHAPTER_KIND_LABELS: Record<ChapterKind, string> = {
  photo: "Photo",
  video: "Video",
  voice: "Voice memory",
  quote: "Quote",
  letter: "Letter",
  timeline: "Timeline",
  location: "Location",
  countdown: "Countdown",
};

export const REVEAL_STYLES = ["tap", "hold", "envelope", "scratch"] as const;
export type RevealStyle = (typeof REVEAL_STYLES)[number];

export const REVEAL_STYLE_LABELS: Record<RevealStyle, string> = {
  tap: "Tap to reveal",
  hold: "Press and hold",
  envelope: "Open the envelope",
  scratch: "Scratch to uncover",
};

export const TRANSITIONS = ["fade", "rise", "drift"] as const;
export type TransitionStyle = (typeof TRANSITIONS)[number];

const milestoneSchema = z.object({
  label: z.string().max(140).default(""),
  date: z.string().max(60).default(""),
});

export type Milestone = z.infer<typeof milestoneSchema>;

/**
 * One flexible chapter shape rather than a discriminated union: `kind` decides
 * which fields the renderer and editor surface, while unused fields simply stay
 * empty. This keeps switching a chapter's type non-destructive — a creator can
 * flip photo → quote → photo and get their caption back.
 */
export const chapterSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(CHAPTER_KINDS).default("photo"),

  // shared chrome
  title: z.string().max(160).default(""),
  date: z.string().max(80).default(""),
  location: z.string().max(120).default(""),
  emotion: z.string().max(40).default(""),
  description: z.string().max(2000).default(""),
  reaction: z.string().max(8).default(""),

  // media
  imageUrl: z.string().max(600).default(""),
  videoUrl: z.string().max(600).default(""),
  audioUrl: z.string().max(600).default(""),
  audioLabel: z.string().max(120).default(""),

  // quote
  quote: z.string().max(400).default(""),
  attribution: z.string().max(120).default(""),

  // letter
  letterBody: z.string().max(4000).default(""),
  signature: z.string().max(120).default(""),

  // timeline
  milestones: z.array(milestoneSchema).max(14).default([]),

  // location
  place: z.string().max(160).default(""),
  travelFrom: z.string().max(160).default(""),

  // countdown
  targetDate: z.string().max(40).default(""),

  // surprise
  hidden: z.boolean().default(false),
  revealStyle: z.enum(REVEAL_STYLES).default("tap"),

  transition: z.enum(TRANSITIONS).default("rise"),
});

export type Chapter = z.infer<typeof chapterSchema>;

export const memoryverseContentSchema = z.object({
  title: z.string().max(160).default(""),
  subtitle: z.string().max(200).default(""),
  createdOn: z.string().max(80).default(""),
  coverUrl: z.string().max(600).default(""),
  introLines: z.array(z.string().max(200)).max(4).default([]),
  musicUrl: z.string().max(600).default(""),
  chapters: z.array(chapterSchema).max(40).default([]),
  closingTitle: z.string().max(200).default(""),
  closingSubtitle: z.string().max(200).default(""),
  closingCta: z.string().max(60).default(""),
  closingHref: z.string().max(600).default(""),
});

export type MemoryverseContent = z.infer<typeof memoryverseContentSchema>;

export function makeChapter(kind: ChapterKind = "photo", seed = ""): Chapter {
  return chapterSchema.parse({ id: `ch-${seed || Math.round(performance.now())}`, kind });
}

/** What a creator lands on the first time they open the editor. */
export const emptyMemoryverseContent: MemoryverseContent = memoryverseContentSchema.parse({
  title: "Our Story",
  subtitle: "",
  createdOn: "",
  introLines: ["Every memory has a story.", "This one is ours."],
  chapters: [
    {
      id: "ch-1",
      kind: "photo",
      title: "Where it started",
      emotion: "the beginning",
      description: "Write the part only the two of you would remember.",
    },
  ],
  closingTitle: "The story doesn't end here.",
  closingSubtitle: "There are still memories waiting to happen.",
  closingCta: "Leave a message",
});

/** Fallbacks so an unfinished gift still reads as intentional, never broken. */
export const MEMORYVERSE_FALLBACKS = {
  title: "Our Story",
  introLines: ["Every memory has a story.", "This one is ours."],
  closingTitle: "The story doesn't end here.",
  closingSubtitle: "There are still memories waiting to happen.",
  closingCta: "Leave a message",
} as const;
