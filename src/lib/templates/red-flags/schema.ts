import { z } from "zod";
import { ATTACHMENT_IDS, NOTEBOOK_IDS } from "./theme";

/**
 * My Red Flags (That I'm Working On) — content.
 *
 * The shape *is* the argument. Each flag is five fields in a fixed order — the
 * habit, where it comes from, what's being done about it, a win, and what's
 * needed — and that order is what separates accountability from apology. A
 * confession stops after the first field. This one can't: the steps and the win
 * sit inside the same card as the admission, so nothing here can be read as
 * self-flagellation without also reading the work underneath it.
 *
 * `steps` is the load-bearing field. It is the only place with a checkbox, and
 * some of the boxes are meant to be *unticked* — a flag with every box ticked is
 * a boast, and a flag with none is a shrug. The default content ships with a
 * mixture for exactly that reason.
 *
 * Every field is optional and every list can be empty. Somebody writing this is
 * being honest about themselves on a screen; being told they have nine fields
 * left is the fastest way to make them close the tab.
 */

/* ------------------------------------------------------------------ */
/* The pieces                                                          */
/* ------------------------------------------------------------------ */

/** One thing being worked on, ticked or not. */
export const stepSchema = z.object({
  id: z.string().min(1),
  text: z.string().max(120).default(""),
  /** Unticked is not failure — it is the part still in progress, and it shows. */
  done: z.boolean().default(false),
});
export type GrowthStep = z.infer<typeof stepSchema>;

/** A photo, a voice note or a screenshot, pinned to one flag. */
export const attachmentSchema = z.object({
  kind: z.enum(ATTACHMENT_IDS).default("none"),
  url: z.string().max(600).default(""),
  caption: z.string().max(160).default(""),
});
export type Attachment = z.infer<typeof attachmentSchema>;

/** One chapter of the journal. */
export const flagSchema = z.object({
  id: z.string().min(1),

  /* 1 — the flag itself */
  title: z.string().max(90).default(""),
  explain: z.string().max(400).default(""),

  /* 2 — where it comes from, if they want to go there */
  origin: z.string().max(400).default(""),

  /* 3 — what's being done about it */
  steps: z.array(stepSchema).max(8).default([]),

  /* 4 — a small win, shown as a polaroid */
  win: z.string().max(240).default(""),
  winWhen: z.string().max(60).default(""),

  /* 5 — what they need from the reader */
  need: z.string().max(300).default(""),

  attachment: attachmentSchema.default({ kind: "none", url: "", caption: "" }),
});
export type Flag = z.infer<typeof flagSchema>;

/** One line on the promise page's timeline. */
export const goalSchema = z.object({
  id: z.string().min(1),
  when: z.string().max(40).default(""),
  text: z.string().max(160).default(""),
});
export type Goal = z.infer<typeof goalSchema>;

/* ------------------------------------------------------------------ */
/* The whole journal                                                   */
/* ------------------------------------------------------------------ */

export const redFlagsContentSchema = z.object({
  notebook: z.enum(NOTEBOOK_IDS).default("vintage"),

  /* ---------- the cover ---------- */
  coverTitle: z.string().max(80).default("My Red Flags 🚩"),
  coverSubtitle: z.string().max(120).default("The ones I'm working on."),
  /** The handwritten line under the title. */
  coverNote: z.string().max(240).default("Nobody comes with a user manual.\nThis is mine."),
  recipient: z.string().max(60).default(""),
  from: z.string().max(60).default(""),

  /* ---------- the chapters ---------- */
  flags: z.array(flagSchema).max(10).default([]),

  /* ---------- the promise page ---------- */
  promiseTitle: z.string().max(120).default("I don't expect to become perfect."),
  promiseNote: z.string().max(400).default("I just don't want to stay the same."),
  goals: z.array(goalSchema).max(6).default([]),

  /* ---------- the jar ---------- */
  endingNote: z
    .string()
    .max(240)
    .default("The goal isn't to hide your flaws.\nIt's to outgrow them."),
});

export type RedFlagsContent = z.infer<typeof redFlagsContentSchema>;

export const emptyRedFlagsContent: RedFlagsContent = redFlagsContentSchema.parse({});

let seq = 0;
function nextId(prefix: string) {
  seq += 1;
  return `${prefix}${Date.now().toString(36)}${seq.toString(36)}`;
}

export function makeFlag(): Flag {
  return flagSchema.parse({
    id: nextId("f"),
    /* Two steps, one ticked and one not — the honest default, and a working
       example of the thing the field is for. */
    steps: [
      { id: nextId("s"), text: "", done: true },
      { id: nextId("s"), text: "", done: false },
    ],
  });
}

export function makeStep(): GrowthStep {
  return stepSchema.parse({ id: nextId("s") });
}

export function makeGoal(): Goal {
  return goalSchema.parse({ id: nextId("g") });
}
