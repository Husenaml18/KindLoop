import { z } from "zod";
import { memoryBlockSchema, makeBlock, type MemoryBlock } from "@/lib/engines/memory-block/schema";
/* From the data module, not the client entry: this schema is evaluated on the
   server, where a client module's exports are references rather than values. */
import { BOX_MATERIAL_IDS, RIBBON_IDS, WRAPPING_IDS } from "@/lib/engines/gift/stock";
import { SCHEME_IDS, STICKER_IDS } from "./theme";

/**
 * Surprise Reveal Box — content.
 *
 * A list of layers, opened in order. Each layer is a wrapped box holding one
 * memory, and some layers are *guarded*: the lid won't lift until a small thing
 * has been done. The guards exist to make the person slow down and pay
 * attention — never to test them — so every one of them can be given up on.
 */

export const GUARD_KINDS = ["none", "scratch", "key", "combination", "fit", "map"] as const;
export type GuardKind = (typeof GUARD_KINDS)[number];

export const GUARD_LABELS: Record<GuardKind, string> = {
  none: "Just open it",
  scratch: "Scratch the foil",
  key: "Find the key",
  combination: "A three-digit lock",
  fit: "Fit the piece",
  map: "Mark the spot",
};

export const GUARD_NOTES: Record<GuardKind, string> = {
  none: "The ribbon comes off and the lid lifts. Nothing in the way.",
  scratch: "A panel of foil to rub off before the lid will move.",
  key: "A little key hidden somewhere on the table. They drag it to the lock.",
  combination: "Three dials. Give them the number — or a clue only they'd get.",
  fit: "One piece, one slot. Drag it home.",
  map: "Four places on a map. Only one is right.",
};

export const layerSchema = z.object({
  id: z.string().min(1),

  /* ---------- the box ---------- */
  wrapping: z.enum(WRAPPING_IDS).default("stripes"),
  ribbon: z.enum(RIBBON_IDS).default("satinCream"),
  material: z.enum(BOX_MATERIAL_IDS).default("kraft"),
  sticker: z.enum(STICKER_IDS).default("none"),
  /** Written on the gift tag hanging off the ribbon. */
  tag: z.string().max(80).default(""),

  /* ---------- what's in the way ---------- */
  guard: z.enum(GUARD_KINDS).default("none"),
  /** The combination, as three digits. Only read by the combination guard. */
  code: z.string().max(3).default("000"),
  /** The clue shown above a guard, in place of instructions. */
  clue: z.string().max(160).default(""),

  /* ---------- what's inside ---------- */
  reward: memoryBlockSchema,
});

export type Layer = z.infer<typeof layerSchema>;

export const surpriseBoxContentSchema = z.object({
  scheme: z.enum(SCHEME_IDS).default("party"),

  /** On the tag of the outermost box, before anything is opened. */
  toLine: z.string().max(80).default(""),
  fromLine: z.string().max(80).default(""),
  /** The two or three lines before they touch it. */
  openingLines: z.array(z.string().max(120)).max(4).default([]),

  layers: z.array(layerSchema).max(8).default([]),

  /** Whether confetti falls at the end. This is the one experience where it fits. */
  confetti: z.boolean().default(true),
  /** Started by a click, never before — browsers block it and it's rude anyway. */
  musicUrl: z.string().max(600).default(""),

  closingLine: z.string().max(200).default(""),
});

export type SurpriseBoxContent = z.infer<typeof surpriseBoxContentSchema>;

/* ------------------------------------------------------------------ */

export function makeLayer(id: string, reward?: MemoryBlock): Layer {
  return layerSchema.parse({ id, reward: reward ?? makeBlock(`${id}-r`, "text") });
}

/** Whether a guard needs anything from the person at all. */
export function isGuarded(layer: Layer): boolean {
  return layer.guard !== "none";
}

/** Three digits, always — a short or non-numeric code would jam the dials. */
export function normaliseCode(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 3);
  return digits.padEnd(3, "0");
}

/** How far in they are, as words rather than a score. */
export function depthNote(opened: number, total: number): string {
  const left = total - opened;
  if (left <= 0) return "That was the last one.";
  if (left === 1) return "One more box.";
  if (opened === 0) return `${total} boxes. Start with the ribbon.`;
  return `${left} more to go.`;
}

export const emptySurpriseBoxContent: SurpriseBoxContent = surpriseBoxContentSchema.parse({
  scheme: "party",
  toLine: "",
  fromLine: "",
  openingLines: ["This one's got layers.", "Sorry in advance."],
  layers: [
    {
      id: "l-1",
      wrapping: "stripes",
      ribbon: "satinRed",
      material: "kraft",
      sticker: "seal",
      tag: "Open me first",
      guard: "none",
      reward: makeBlock("l-1-r", "text"),
    },
  ],
  confetti: true,
  closingLine: "Told you it had layers.",
});

export const SB_FALLBACKS = {
  openingLines: ["This one's got layers.", "Sorry in advance."],
  closingLine: "Told you it had layers.",
} as const;
