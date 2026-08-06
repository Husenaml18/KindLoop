/**
 * Countdown Gift — "the advent calendar on the wall".
 *
 * The object this replaces is a numbered advent calendar: a grid of little doors,
 * one per day, that you are not allowed to open early. Its identity is the
 * *grid, the number, and the wait* — anticipation is the gift.
 *
 * Kept distinct from Open When, which is also sealed letters but in a warm
 * wooden box unlocked by mood or password rather than by the calendar. This one
 * is a winter evening: midnight blue, gold leaf, stars.
 */

export const SKIN_IDS = ["midnight", "winter", "rose", "forest", "champagne"] as const;
export type SkinId = (typeof SKIN_IDS)[number];

export interface Skin {
  id: SkinId;
  label: string;
  /** The wall the calendar hangs on. */
  bg: string;
  /** The calendar board itself. */
  board: string;
  boardEdge: string;
  /** Gilt — numbers, hinges, rules. */
  gold: string;
  goldSoft: string;
  /** Text on the board. */
  ink: string;
  inkSoft: string;
  /** A door that is still shut. */
  doorFace: string;
  doorEdge: string;
  /** Light spilling from a door that has been opened. */
  glow: string;
  /** Star colour. */
  star: string;
}

export const SKINS: Record<SkinId, Skin> = {
  midnight: {
    id: "midnight",
    label: "Midnight",
    bg: "radial-gradient(ellipse 80% 60% at 50% 12%, #26203f 0%, #141026 46%, #0b0917 100%)",
    board: "linear-gradient(168deg, #241f3c, #171331)",
    boardEdge: "rgba(214,180,110,.28)",
    gold: "#d8b46e",
    goldSoft: "rgba(216,180,110,.38)",
    ink: "#efe7d4",
    inkSoft: "rgba(239,231,212,.62)",
    doorFace: "linear-gradient(158deg, #2f2850, #221c3e)",
    doorEdge: "rgba(214,180,110,.24)",
    glow: "#f0c675",
    star: "#fff0c8",
  },
  winter: {
    id: "winter",
    label: "Winter",
    bg: "radial-gradient(ellipse 80% 60% at 50% 12%, #24384a 0%, #16242f 48%, #0d151c 100%)",
    board: "linear-gradient(168deg, #24384a, #16242f)",
    boardEdge: "rgba(198,220,232,.26)",
    gold: "#c6dce8",
    goldSoft: "rgba(198,220,232,.32)",
    ink: "#eef5f8",
    inkSoft: "rgba(238,245,248,.6)",
    doorFace: "linear-gradient(158deg, #2c465b, #1e3140)",
    doorEdge: "rgba(198,220,232,.22)",
    glow: "#d8ecf6",
    star: "#ffffff",
  },
  rose: {
    id: "rose",
    label: "Rose",
    bg: "radial-gradient(ellipse 80% 60% at 50% 12%, #4a2436 0%, #2e1522 48%, #1c0d15 100%)",
    board: "linear-gradient(168deg, #46223a, #2b1422)",
    boardEdge: "rgba(226,168,168,.28)",
    gold: "#e2a8a8",
    goldSoft: "rgba(226,168,168,.34)",
    ink: "#f8e8e4",
    inkSoft: "rgba(248,232,228,.62)",
    doorFace: "linear-gradient(158deg, #582c46, #3a1c2e)",
    doorEdge: "rgba(226,168,168,.24)",
    glow: "#f4c0b8",
    star: "#ffe8e4",
  },
  forest: {
    id: "forest",
    label: "Forest",
    bg: "radial-gradient(ellipse 80% 60% at 50% 12%, #1e3a30 0%, #14261f 48%, #0a1611 100%)",
    board: "linear-gradient(168deg, #1e3a30, #12241c)",
    boardEdge: "rgba(200,176,112,.28)",
    gold: "#c8b070",
    goldSoft: "rgba(200,176,112,.34)",
    ink: "#e8f0e2",
    inkSoft: "rgba(232,240,226,.6)",
    doorFace: "linear-gradient(158deg, #27483a, #1a3028)",
    doorEdge: "rgba(200,176,112,.24)",
    glow: "#e2d098",
    star: "#f4ffe8",
  },
  champagne: {
    id: "champagne",
    label: "Champagne",
    bg: "radial-gradient(ellipse 80% 60% at 50% 12%, #3d3428 0%, #26211a 48%, #17130f 100%)",
    board: "linear-gradient(168deg, #3a3226, #241f18)",
    boardEdge: "rgba(232,208,152,.3)",
    gold: "#e8d098",
    goldSoft: "rgba(232,208,152,.36)",
    ink: "#f6efdd",
    inkSoft: "rgba(246,239,221,.62)",
    doorFace: "linear-gradient(158deg, #4a3f2e, #302920)",
    doorEdge: "rgba(232,208,152,.26)",
    glow: "#f6e0aa",
    star: "#fff8e0",
  },
};

/** How each day presents itself before it is opened. */
export const DOOR_STYLE_IDS = ["envelope", "drawer", "window", "giftbox", "lock", "card"] as const;
export type DoorStyleId = (typeof DOOR_STYLE_IDS)[number];

export const DOOR_STYLE_LABELS: Record<DoorStyleId, string> = {
  envelope: "Sealed envelopes",
  drawer: "Little drawers",
  window: "Shutters",
  giftbox: "Gift boxes",
  lock: "Padlocks",
  card: "Calendar cards",
};

/** Gilt numerals — the calendar's own typography. */
export const NUMERAL_FONT = "var(--font-fraunces), Georgia, serif";
export const HAND_FONT = "var(--hw-elegant), cursive";
export const MONO_FONT = "var(--font-ibm-plex-mono), ui-monospace, monospace";
export const BODY_FONT = "var(--font-space-grotesk), system-ui, sans-serif";

export const GILT_GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/></filter><rect width='160' height='160' filter='url(%23c)' opacity='.34'/></svg>\")";
