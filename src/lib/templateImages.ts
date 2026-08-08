import type { StaticImageData } from "next/image";

import countdownGift from "@/images/countdown-gift.png";
import digitalScrapbook from "@/images/digital-scrapbook.png";
import loveLetter from "@/images/love-letter.png";
import memoryPuzzle from "@/images/memory-puzzle.png";
import memoryverse from "@/images/memory-verse.png";
import openWhen from "@/images/open-when.png";
import personalizedWebsite from "@/images/Website.png";
import redFlags from "@/images/RED-FLAGS.png";
import miniWorld from "@/images/mini-world.png";
import mothersDayLetter from "@/images/mothers-day.png";
import personalizedSong from "@/images/personalized-song.png";
import surpriseRevealBox from "@/images/surprise-reveal.png";
import treasureHunt from "@/images/treasure-hunt.png";
import winYouBack from "@/images/win-you-back.png";

/**
 * The artwork for each experience.
 *
 * Imported rather than read from `public/`, so Next processes them: the sources
 * are 2–3 MB PNGs each, and served raw the templates gallery would pull well over
 * 20 MB. Going through the image pipeline gets them resized per breakpoint, served
 * as WebP or AVIF, and gives every one a blur placeholder for free — which matters
 * here, because a card whose picture pops in late looks broken.
 *
 * A few filenames don't match their template id (`memory-verse.png` against
 * `memoryverse`, `mothers-day.png` against `mothers-day-letter`, `Website.png` against
 * `personalized-website`, `RED-FLAGS.png` against `my-red-flags`), so the mapping is
 * explicit rather than derived from the filename. `hasTemplateImage` exists because
 * not every experience has artwork yet, and the callers fall back rather than
 * rendering an empty frame.
 */
export const TEMPLATE_IMAGES: Record<string, StaticImageData> = {
  "countdown-gift": countdownGift,
  "digital-scrapbook": digitalScrapbook,
  "love-letter": loveLetter,
  "memory-puzzle": memoryPuzzle,
  memoryverse: memoryverse,
  "open-when": openWhen,
  "personalized-website": personalizedWebsite,
  "my-red-flags": redFlags,
  "mini-world": miniWorld,
  "mothers-day-letter": mothersDayLetter,
  "personalized-song": personalizedSong,
  "surprise-reveal-box": surpriseRevealBox,
  "treasure-hunt": treasureHunt,
  "win-you-back": winYouBack,
};

export function templateImage(id: string): StaticImageData | undefined {
  return TEMPLATE_IMAGES[id];
}

export function hasTemplateImage(id: string): boolean {
  return id in TEMPLATE_IMAGES;
}
