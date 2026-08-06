/**
 * Handwriting for the Love Letter template only.
 *
 * Kept out of the shared `fonts.ts` on purpose: seven scripts is real weight,
 * and only the letter routes should pay for it.
 */
import {
  Dancing_Script,
  Great_Vibes,
  Homemade_Apple,
  Shadows_Into_Light,
  Caveat,
  Parisienne,
  Gochi_Hand,
} from "next/font/google";

export const dancingScript = Dancing_Script({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--hw-elegant",
});

export const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--hw-calligraphy",
});

export const homemadeApple = Homemade_Apple({
  weight: "400",
  subsets: ["latin"],
  variable: "--hw-classic",
});

export const shadowsIntoLight = Shadows_Into_Light({
  weight: "400",
  subsets: ["latin"],
  variable: "--hw-journal",
});

export const caveat = Caveat({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--hw-messy",
});

export const parisienne = Parisienne({
  weight: "400",
  subsets: ["latin"],
  variable: "--hw-romantic",
});

export const gochiHand = Gochi_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--hw-vintage",
});

/** Every handwriting variable, applied at the root of a letter. */
export const LETTER_FONT_VARS = [
  dancingScript.variable,
  greatVibes.variable,
  homemadeApple.variable,
  shadowsIntoLight.variable,
  caveat.variable,
  parisienne.variable,
  gochiHand.variable,
].join(" ");
