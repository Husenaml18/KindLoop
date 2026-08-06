import { z } from "zod";
import {
  HAND_IDS,
  INK_IDS,
  PAPER_COLOR_IDS,
  PAPER_STYLE_IDS,
  SEAL_COLOR_IDS,
  SEAL_ICON_IDS,
} from "../love-letter/theme";

/**
 * Open When — "the keepsake box".
 *
 * Deliberately not one letter but a *collection*: the box is the object, and it
 * is meant to be returned to over years. So the schema is a list of sealed
 * letters, each with its own stationery, its own seal and ribbon, and its own
 * condition for being allowed open.
 */

export const LOCK_KINDS = ["none", "date", "mood", "password", "countdown", "location", "creator"] as const;
export type LockKind = (typeof LOCK_KINDS)[number];

export const LOCK_LABELS: Record<LockKind, string> = {
  none: "Open any time",
  date: "On a specific date",
  mood: "When they feel a certain way",
  password: "With a password",
  countdown: "After a countdown",
  location: "At a place",
  creator: "Only when you allow it",
};

export const RIBBON_IDS = ["blush", "sage", "gold", "navy", "plum", "rust", "cream", "forest"] as const;
export type RibbonId = (typeof RIBBON_IDS)[number];

export const RIBBONS: Record<RibbonId, { label: string; hex: string }> = {
  blush: { label: "Blush", hex: "#d99aa2" },
  sage: { label: "Sage", hex: "#9aae8c" },
  gold: { label: "Gold", hex: "#c9a04a" },
  navy: { label: "Navy", hex: "#3c4a70" },
  plum: { label: "Plum", hex: "#7d4a68" },
  rust: { label: "Rust", hex: "#b5623a" },
  cream: { label: "Cream", hex: "#e2d3b4" },
  forest: { label: "Forest", hex: "#3f6350" },
};

/** Box woods, so the collection itself can be chosen. */
export const WOOD_IDS = ["walnut", "oak", "cherry", "ebony", "birch"] as const;
export type WoodId = (typeof WOOD_IDS)[number];

export const WOODS: Record<WoodId, { label: string; dark: string; mid: string; light: string; brass: string }> = {
  walnut: { label: "Walnut", dark: "#3a2718", mid: "#5c3f26", light: "#7d5836", brass: "#c9a45c" },
  oak: { label: "Oak", dark: "#5a4326", mid: "#7d6038", light: "#a3814e", brass: "#c9a45c" },
  cherry: { label: "Cherry", dark: "#4a2318", mid: "#6e3624", light: "#8f4c33", brass: "#d0a862" },
  ebony: { label: "Ebony", dark: "#1e1a16", mid: "#2e2822", light: "#413830", brass: "#b8975a" },
  birch: { label: "Birch", dark: "#7d6a4c", mid: "#a08a66", light: "#c2ac85", brass: "#c9b078" },
};

export const letterSchema = z.object({
  id: z.string().min(1),
  /** The label written on the front — the whole premise of the template. */
  title: z.string().max(90).default("Open when you miss me"),

  /* stationery, per letter — no two envelopes in the box look alike */
  paperStyle: z.enum(PAPER_STYLE_IDS).default("ivoryCotton"),
  paperColor: z.enum(PAPER_COLOR_IDS).default("cream"),
  sealColor: z.enum(SEAL_COLOR_IDS).default("burgundy"),
  sealIcon: z.enum(SEAL_ICON_IDS).default("heart"),
  ribbon: z.enum(RIBBON_IDS).default("blush"),
  hand: z.enum(HAND_IDS).default("elegant"),
  ink: z.enum(INK_IDS).default("darkBrown"),

  /* the letter */
  greeting: z.string().max(140).default(""),
  body: z.string().max(4000).default(""),
  closing: z.string().max(140).default(""),
  signature: z.string().max(80).default(""),

  /* the small things tucked in with it */
  photoUrl: z.string().max(600).default(""),
  photoCaption: z.string().max(160).default(""),
  voiceUrl: z.string().max(600).default(""),
  /** One tiny surprise, revealed after the letter is read. */
  surprise: z.string().max(300).default(""),

  /* the condition */
  lock: z.enum(LOCK_KINDS).default("none"),
  /** date / countdown target, as an ISO-ish local datetime string. */
  unlockAt: z.string().max(40).default(""),
  /** mood the recipient has to pick. */
  mood: z.string().max(60).default(""),
  /** password, compared case-insensitively after trimming. */
  password: z.string().max(60).default(""),
  passwordHint: z.string().max(120).default(""),
  /** place name, confirmed by the recipient rather than geolocated. */
  place: z.string().max(120).default(""),
  /** creator-released letters flip this by hand. */
  released: z.boolean().default(false),
});

export type OpenWhenLetter = z.infer<typeof letterSchema>;

export const openWhenContentSchema = z.object({
  wood: z.enum(WOOD_IDS).default("walnut"),
  boxTitle: z.string().max(90).default(""),
  dedication: z.string().max(200).default(""),
  /** Engraved on the brass plate on the lid. */
  plate: z.string().max(40).default(""),
  letters: z.array(letterSchema).max(24).default([]),
});

export type OpenWhenContent = z.infer<typeof openWhenContentSchema>;

/** Moods the recipient can pick from when a letter is mood-locked. */
export const MOODS = [
  "happy",
  "missing you",
  "can't sleep",
  "lonely",
  "need motivation",
  "giving up",
  "need a laugh",
  "overwhelmed",
  "proud",
] as const;

export function makeLetter(id: string, title = "Open when you miss me"): OpenWhenLetter {
  return letterSchema.parse({ id, title });
}

export const emptyOpenWhenContent: OpenWhenContent = openWhenContentSchema.parse({
  wood: "walnut",
  boxTitle: "For the days that need it",
  dedication: "Keep this somewhere you'll find it again.",
  plate: "",
  letters: [
    {
      id: "l-1",
      title: "Open when you miss me",
      ribbon: "blush",
      sealColor: "burgundy",
      greeting: "Hello you,",
      body: "If you're reading this one, I already know how you're feeling.\n\nSit down for a second. I'm not far.",
      closing: "Yours,",
      lock: "none",
    },
  ],
});

export const OW_FALLBACKS = {
  boxTitle: "For the days that need it",
  dedication: "Keep this somewhere you'll find it again.",
  greeting: "Hello you,",
  closing: "Yours,",
} as const;

/** Whether a letter may be opened right now, and why not if not. */
/**
 * A date written the same way everywhere.
 *
 * `toLocaleDateString` was wrong here on two counts: the server and the browser
 * can resolve different default locales, which is a hydration mismatch waiting to
 * be triggered the moment this string appears in the initial HTML; and their
 * timezones can differ, which can print the wrong *day*. Fixed month names avoid
 * both, and a keepsake should read identically to everyone anyway.
 */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatSealDate(at: number): string {
  const d = new Date(at);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function lockState(letter: OpenWhenLetter, now: number, unlocked: Set<string>): {
  open: boolean;
  reason: string;
  needsInput: boolean;
} {
  if (unlocked.has(letter.id)) return { open: true, reason: "", needsInput: false };

  switch (letter.lock) {
    case "none":
      return { open: true, reason: "", needsInput: false };
    case "creator":
      return letter.released
        ? { open: true, reason: "", needsInput: false }
        : { open: false, reason: "Not yet — they'll tell you when", needsInput: false };
    case "date":
    case "countdown": {
      const t = letter.unlockAt ? new Date(letter.unlockAt).getTime() : NaN;
      if (Number.isNaN(t)) return { open: true, reason: "", needsInput: false };
      if (now >= t) return { open: true, reason: "", needsInput: false };
      return {
        open: false,
        reason:
          letter.lock === "date"
            ? `Sealed until ${formatSealDate(t)}`
            : "Still counting down",
        needsInput: false,
      };
    }
    case "mood":
      return { open: false, reason: `Only when you're ${letter.mood || "ready"}`, needsInput: true };
    case "password":
      return { open: false, reason: "Needs a password", needsInput: true };
    case "location":
      return { open: false, reason: `Only at ${letter.place || "the right place"}`, needsInput: true };
    default:
      return { open: true, reason: "", needsInput: false };
  }
}
