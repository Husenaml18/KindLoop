import { z } from "zod";
import { WEBSITE_THEME_IDS, INTRO_IDS } from "./theme";

/**
 * Personalized Website — content.
 *
 * The one experience whose content contains other experiences. A section holds a
 * template id and that template's own content, verbatim: `content` here is
 * exactly what `getTemplate(type).contentSchema` produces, unchanged and
 * unwrapped.
 *
 * That is the whole design. Sections are not a new format that experiences get
 * converted into — they are a *list of the formats that already exist*. Nothing
 * about Love Letter or Treasure Hunt changes to live in here, and a website is
 * readable by walking the registry rather than by knowing anything about the ten
 * experiences individually.
 *
 * `content` is deliberately `unknown`. Validating it here would mean importing
 * every template's schema into this file and re-validating on every website
 * parse — a circular dependency and a second place for the rules to drift. It is
 * parsed lazily, per section, by the renderer that is about to draw it, using
 * that template's own schema. A section whose content fails to parse falls back
 * to that template's `emptyContent` rather than taking the page down.
 */

export const sectionSchema = z.object({
  /** Stable across reorders, so React keys and edit targets survive a drag. */
  id: z.string().min(1),
  /** A key into TEMPLATE_REGISTRY. Not an enum — the registry is the authority. */
  type: z.string().min(1).max(60),
  /** That template's own content, opaque here. */
  content: z.unknown().optional(),
  /**
   * Present but not yet paid for.
   *
   * A section arriving from a preset theme can sit in the story as a placeholder
   * — the reader never sees it, and publishing is refused while one remains.
   * Entitlement itself is never read from here: this is a rendering hint, and
   * the truth lives in the `Order` rows. Content a person can edit must not be
   * the record of what they paid for.
   */
  locked: z.boolean().default(false),
});
export type WebsiteSection = z.infer<typeof sectionSchema>;

export const personalizedWebsiteContentSchema = z.object({
  theme: z.enum(WEBSITE_THEME_IDS).default("romantic"),

  /* ---------- the hero, the one part that is genuinely new ---------- */
  title: z.string().max(120).default(""),
  subtitle: z.string().max(200).default(""),
  recipient: z.string().max(60).default(""),
  from: z.string().max(60).default(""),
  heroImageUrl: z.string().max(600).default(""),
  intro: z.enum(INTRO_IDS).default("curtain"),
  /** Played once they choose to start it. Never autoplayed. */
  musicUrl: z.string().max(600).default(""),

  /* ---------- the story ---------- */
  sections: z.array(sectionSchema).max(12).default([]),

  /* ---------- the last screen ---------- */
  endingTitle: z.string().max(120).default(""),
  endingNote: z.string().max(400).default(""),
});

export type PersonalizedWebsiteContent = z.infer<typeof personalizedWebsiteContentSchema>;

export const emptyPersonalizedWebsiteContent: PersonalizedWebsiteContent =
  personalizedWebsiteContentSchema.parse({
    title: "Our story",
    endingTitle: "…and it keeps going.",
  });

let seq = 0;
/** Ids are generated rather than derived from the type: the same experience may
 *  appear twice in one story, and two Love Letters must not share an id. */
export function makeSection(type: string, locked = false): WebsiteSection {
  seq += 1;
  return { id: `s${Date.now().toString(36)}${seq.toString(36)}`, type, content: undefined, locked };
}
