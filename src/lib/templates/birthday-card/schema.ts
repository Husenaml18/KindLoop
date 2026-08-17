import { z } from "zod";
import {
  CAKE_IDS,
  CANDLE_STYLE_IDS,
  CARD_THEME_IDS,
  DECOR_IDS,
  FROSTING_IDS,
} from "./theme";

/**
 * Interactive Birthday Card — content.
 *
 * Shaped as the four surfaces of a real card, in the order somebody meets them:
 * the cover, the letter tucked inside, the cake on the right-hand page, and the
 * thing said once the candles are out. Nothing here is a "section" or a "block" —
 * a card has a front and an inside, and the schema says so.
 *
 * Every field is optional. Somebody who fills in only a name and a message still
 * gets a complete card: the view omits what is missing rather than showing a gap,
 * because a half-filled birthday card should read as restrained, not unfinished.
 */

export const birthdayCardContentSchema = z.object({
  theme: z.enum(CARD_THEME_IDS).default("ransom"),

  /* ---------- who it's for ---------- */
  recipient: z.string().max(60).default(""),
  from: z.string().max(60).default(""),

  /* ---------- the front ---------- */
  coverHeading: z.string().max(40).default("Happy Birthday"),
  coverMessage: z.string().max(160).default("Made just for you"),
  coverPhotoUrl: z.string().max(600).default(""),
  decor: z.enum(DECOR_IDS).default("stars"),

  /* ---------- the letter on the left page ---------- */
  envelopeTeaser: z.string().max(80).default("A little something for you…"),
  letterHeading: z.string().max(120).default(""),
  letterBody: z.string().max(2400).default(""),
  letterSignature: z.string().max(60).default(""),
  letterPhotoUrl: z.string().max(600).default(""),

  /* ---------- the cake on the right page ---------- */
  cake: z.enum(CAKE_IDS).default("layered"),
  frosting: z.enum(FROSTING_IDS).default("vanilla"),
  /**
   * Candles are capped at 12 for a reason that is visual, not technical: past a
   * dozen they stop reading as candles on a cake and start reading as a fence.
   * Somebody turning forty does not want forty of them on a phone screen.
   */
  candleCount: z.number().int().min(1).max(12).default(5),
  candleStyle: z.enum(CANDLE_STYLE_IDS).default("striped"),
  /** Indices into `CANDLE_COLORS`, cycled if fewer than the candle count. */
  candleColors: z.array(z.number().int().min(0).max(5)).max(6).default([0, 1, 2]),

  /* ---------- after the candles go out ---------- */
  finalHeading: z.string().max(80).default("Make a wish"),
  finalMessage: z.string().max(600).default(""),
  finalPhotoUrl: z.string().max(600).default(""),
  /** An optional way onward — usually another Kindloop experience. */
  ctaLabel: z.string().max(40).default(""),
  ctaHref: z.string().max(600).default(""),
});

export type BirthdayCardContent = z.infer<typeof birthdayCardContentSchema>;

export const emptyBirthdayCardContent: BirthdayCardContent =
  birthdayCardContentSchema.parse({});
