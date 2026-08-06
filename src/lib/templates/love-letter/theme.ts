/**
 * Love Letter — "one sheet of writing paper".
 *
 * The object this replaces is a letter someone sat down and wrote by hand, then
 * folded, sealed and posted. Its identity is *restraint*: a single page, wide
 * margins, almost nothing on screen, and the whole experience carried by ink
 * arriving one word at a time.
 *
 * Deliberately unlike Digital Scrapbook, which is the cluttered handmade world
 * of many taped-down objects, and unlike Memoryverse's dark projector room.
 */
/*
 * The stationery tables themselves now live in the Paper and Envelope engines —
 * they are shared with Open When, Countdown Gift and anything else made of paper.
 * This module is what makes *this* experience: the engine stock it selects, plus
 * the scents, which nothing else uses.
 */

export {
  PAPER_STYLE_IDS,
  PAPER_STYLES,
  PAPER_COLOR_IDS,
  PAPER_COLORS,
  HAND_IDS,
  HANDS,
  INK_IDS,
  INKS,
  inkFor,
  FIBRE,
  type PaperStyleId,
  type PaperStyle,
  type PaperColorId,
  type HandId,
  type Handwriting,
  type InkId,
} from "@/lib/engines/paper/stock";

export {
  ENVELOPE_IDS,
  ENVELOPES,
  SEAL_COLOR_IDS,
  SEAL_COLORS,
  SEAL_ICON_IDS,
  SEAL_ICON_LABELS,
  type EnvelopeId,
  type EnvelopeStyle,
  type SealColorId,
  type SealIconId,
} from "@/lib/engines/envelope/stock";

export const SCENT_IDS = ["none", "lavender", "rose", "coffee"] as const;
export type ScentId = (typeof SCENT_IDS)[number];

export const SCENTS: Record<ScentId, { label: string; color: string; glyph: string }> = {
  none: { label: "None", color: "transparent", glyph: "" },
  lavender: { label: "Lavender", color: "#a893c4", glyph: "✿" },
  rose: { label: "Roses", color: "#c9808c", glyph: "❀" },
  coffee: { label: "Coffee", color: "#9a7048", glyph: "◦" },
};

/** Paper fibre, shared by every sheet. */
