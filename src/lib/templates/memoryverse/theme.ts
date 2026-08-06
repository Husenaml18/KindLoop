/**
 * Memoryverse — "the carousel slide projector".
 *
 * The real-world object this template replaces is a Kodak carousel projector
 * running in a darkened living room: you sit in the dark, one slide fills the
 * wall, dust drifts through the lamp beam, and the room dips to black for a
 * beat every time the tray advances.
 *
 * Everything below serves that one idea, and deliberately shares nothing with
 * Digital Scrapbook (handmade craft on cream paper) or Love Letter (stationery
 * and ink). Dark room, projected light, film-slate metadata, title cards.
 */
export const MV = {
  /** The darkened room. */
  void: "#0a0806",
  room: "#13100c",
  roomLift: "#1e1811",
  /** Light thrown onto the screen. */
  screen: "#f4eee3",
  screenDim: "#cec3b0",
  /** Film-slate metadata ink. */
  slate: "#8e7d64",
  /** The projector lamp. */
  lamp: "#e8b26a",
  lampHot: "#ffdcaa",
  /** Warm accent, the colour of aged Ektachrome. */
  ember: "#c8663a",
  emberSoft: "#e08a5c",
  /** Lit paper, for the one chapter that is genuinely an object. */
  paper: "#efe6d4",
  paperInk: "#2a2015",
} as const;

/** Title cards and chapter headings. */
export const MV_DISPLAY = "var(--font-fraunces), Georgia, serif";
/** Narration and body copy — a clean sans, so it never reads as "scrapbook". */
export const MV_BODY = "var(--font-space-grotesk), system-ui, sans-serif";
/** Slate metadata: chapter numbers, timecodes, dates. */
export const MV_SLATE = "var(--font-ibm-plex-mono), ui-monospace, monospace";
/** Only used inside the letter chapter, where handwriting is the point. */
export const MV_HAND = "var(--font-gochi), cursive";

/** 35mm grain, rendered once and reused. */
export const GRAIN_URI =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='4'/></filter><rect width='150' height='150' filter='url(%23g)' opacity='.4'/></svg>\")";
