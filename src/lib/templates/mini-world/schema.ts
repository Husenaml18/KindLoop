import { z } from "zod";
import {
  HAIR_IDS,
  HAT_IDS,
  OUTFIT_IDS,
  PROP_IDS,
  SECRET_IDS,
  WORLD_IDS,
} from "./theme";

/**
 * Mini World — content.
 *
 * The flagship, and structurally the smallest schema in the catalogue. That is
 * the point: a Mini World is almost entirely *other experiences*, so what lives
 * here is a map — where each building stands, who is walking about, and what is
 * hidden at the end. The memories themselves stay in the templates that already
 * know how to hold them.
 *
 * A district is a template id, that template's own content verbatim, and a spot
 * on the ground. Nothing is converted into a "Mini World format"; opening a
 * building hands the content straight to that experience's own `View`. Adding an
 * twelfth experience to Kindloop makes it placeable with no change to this file.
 *
 * `content` is `unknown` for the same reason it is in Personalized Website:
 * validating it here would mean importing every template's schema and
 * re-validating on every parse. It is parsed lazily, per district, by whatever is
 * about to draw it.
 */

/* ------------------------------------------------------------------ */
/* Who lives here                                                      */
/* ------------------------------------------------------------------ */

export const characterSchema = z.object({
  id: z.string().min(1),
  name: z.string().max(40).default(""),
  /** Indices into the palettes in `theme.ts`, so a palette can be retuned freely. */
  skin: z.number().int().min(0).max(5).default(1),
  hair: z.enum(HAIR_IDS).default("short"),
  hairColor: z.number().int().min(0).max(5).default(0),
  outfit: z.enum(OUTFIT_IDS).default("tee"),
  outfitColor: z.number().int().min(0).max(5).default(0),
  hat: z.enum(HAT_IDS).default("none"),
  glasses: z.boolean().default(false),
  prop: z.enum(PROP_IDS).default("none"),
});
export type Character = z.infer<typeof characterSchema>;

/* ------------------------------------------------------------------ */
/* Where things stand                                                  */
/* ------------------------------------------------------------------ */

export const districtSchema = z.object({
  id: z.string().min(1),
  /** A key into the section registry — the experience inside this building. */
  type: z.string().min(1).max(60),
  /** What the little sign says. Blank falls back to the archetype's own name. */
  label: z.string().max(40).default(""),
  /** That template's own content, opaque here. */
  content: z.unknown().optional(),

  /*
   * Where it stands, as a percentage of the stage.
   *
   * Stored rather than computed so a sender can drag their world into a shape
   * that means something — the café where you actually met, next to the park you
   * actually walked through. A generated layout would be tidier and would say
   * nothing.
   */
  x: z.number().min(2).max(98).default(50),
  y: z.number().min(20).max(92).default(60),
  /** 0 far, 1 middle, 2 near. Drives scale, parallax and overlap. */
  depth: z.number().int().min(0).max(2).default(1),

  /** Paid experiences a sender has not bought yet. Rendering hint only. */
  locked: z.boolean().default(false),
});
export type District = z.infer<typeof districtSchema>;

/* ------------------------------------------------------------------ */
/* The world                                                           */
/* ------------------------------------------------------------------ */

export const miniWorldContentSchema = z.object({
  world: z.enum(WORLD_IDS).default("cozy-town"),

  /* ---------- the sign at the gate ---------- */
  title: z.string().max(80).default("Welcome to Our Mini World"),
  subtitle: z.string().max(140).default(""),
  recipient: z.string().max(60).default(""),
  from: z.string().max(60).default(""),
  musicUrl: z.string().max(600).default(""),

  /* ---------- who is in it ---------- */
  characters: z.array(characterSchema).max(6).default([]),

  /* ---------- what is in it ---------- */
  districts: z.array(districtSchema).max(12).default([]),

  /* ---------- the place at the end ---------- */
  secret: z.enum(SECRET_IDS).default("garden"),
  secretTitle: z.string().max(120).default(""),
  secretMessage: z.string().max(900).default(""),

  /* ---------- the last words ---------- */
  endingLine: z.string().max(160).default("Some stories deserve their own world."),
});

export type MiniWorldContent = z.infer<typeof miniWorldContentSchema>;

export const emptyMiniWorldContent: MiniWorldContent = miniWorldContentSchema.parse({});

let seq = 0;
function nextId(prefix: string) {
  seq += 1;
  return `${prefix}${Date.now().toString(36)}${seq.toString(36)}`;
}

/**
 * Drop a new building onto the ground.
 *
 * Placed on a loose spiral rather than in a row, because a grid of buildings
 * reads as a menu and the whole premise is that this is a place. The sender can
 * drag it anywhere afterwards.
 */
export function makeDistrict(type: string, index: number, locked = false): District {
  const ring = Math.floor(index / 4);
  const step = index % 4;
  return districtSchema.parse({
    id: nextId("d"),
    type,
    locked,
    x: 22 + step * 19 + (ring % 2) * 8,
    y: 44 + ring * 15 + (step % 2) * 6,
    depth: Math.min(2, ring),
  });
}

export function makeCharacter(index = 0): Character {
  return characterSchema.parse({
    id: nextId("c"),
    skin: index % 6,
    hair: HAIR_IDS[index % HAIR_IDS.length],
    hairColor: index % 6,
    outfit: OUTFIT_IDS[index % OUTFIT_IDS.length],
    outfitColor: index % 6,
  });
}
