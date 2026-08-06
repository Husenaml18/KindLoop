import { memoryverseDemo } from "./memoryverse/demo";
import { digitalScrapbookDemo } from "./digital-scrapbook/demo";
import { loveLetterDemo } from "./love-letter/demo";
import { openWhenDemo } from "./open-when/demo";
import { countdownGiftDemo } from "./countdown-gift/demo";
import { memoryPuzzleDemo } from "./memory-puzzle/demo";
import { surpriseBoxDemo } from "./surprise-reveal-box/demo";
import { treasureHuntDemo } from "./treasure-hunt/demo";
import { mothersDayLetterDemo } from "./mothers-day-letter/demo";

/**
 * Sample content for the public walkthroughs at /demo/<id>. Kept untyped at the
 * boundary on purpose: the route validates each entry through that template's
 * own `contentSchema`, so a malformed demo fails loudly instead of half-rendering.
 */
export const TEMPLATE_DEMOS: Record<string, unknown> = {
  memoryverse: memoryverseDemo,
  "digital-scrapbook": digitalScrapbookDemo,
  "love-letter": loveLetterDemo,
  "open-when": openWhenDemo,
  "countdown-gift": countdownGiftDemo,
  "memory-puzzle": memoryPuzzleDemo,
  "surprise-reveal-box": surpriseBoxDemo,
  "treasure-hunt": treasureHuntDemo,
  "mothers-day-letter": mothersDayLetterDemo,
};

export function hasDemoContent(id: string): boolean {
  return id in TEMPLATE_DEMOS;
}
