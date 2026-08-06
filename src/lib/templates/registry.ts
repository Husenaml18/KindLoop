import type { ComponentType } from "react";
import type { z } from "zod";

import {
  memoryverseContentSchema,
  emptyMemoryverseContent,
} from "./memoryverse/schema";
import { MemoryverseEditor } from "./memoryverse/Editor";
import { MemoryverseView } from "./memoryverse/View";

import {
  digitalScrapbookContentSchema,
  emptyDigitalScrapbookContent,
} from "./digital-scrapbook/schema";
import { DigitalScrapbookEditor } from "./digital-scrapbook/Editor";
import { DigitalScrapbookView } from "./digital-scrapbook/View";

import {
  loveLetterContentSchema,
  emptyLoveLetterContent,
} from "./love-letter/schema";
import { LoveLetterEditor } from "./love-letter/Editor";
import { LoveLetterView } from "./love-letter/View";

import { openWhenContentSchema, emptyOpenWhenContent } from "./open-when/schema";
import { OpenWhenEditor } from "./open-when/Editor";
import { OpenWhenView } from "./open-when/View";

import { countdownContentSchema, emptyCountdownContent } from "./countdown-gift/schema";
import { CountdownGiftEditor } from "./countdown-gift/Editor";
import { CountdownGiftView } from "./countdown-gift/View";

import { memoryPuzzleContentSchema, emptyMemoryPuzzleContent } from "./memory-puzzle/schema";
import { MemoryPuzzleEditor } from "./memory-puzzle/Editor";
import { MemoryPuzzleView } from "./memory-puzzle/View";

import { surpriseBoxContentSchema, emptySurpriseBoxContent } from "./surprise-reveal-box/schema";
import { SurpriseBoxEditor } from "./surprise-reveal-box/Editor";
import { SurpriseBoxView } from "./surprise-reveal-box/View";

import { treasureHuntContentSchema, emptyTreasureHuntContent } from "./treasure-hunt/schema";
import { TreasureHuntEditor } from "./treasure-hunt/Editor";
import { TreasureHuntView } from "./treasure-hunt/View";

import { mothersDayContentSchema, emptyMothersDayContent } from "./mothers-day-letter/schema";
import { MothersDayLetterEditor } from "./mothers-day-letter/Editor";
import { MothersDayLetterView } from "./mothers-day-letter/View";

export interface TemplateDefinition<TContent = unknown> {
  id: string;
  displayName: string;
  description: string;
  isPaid: boolean;
  priceCents?: number;
  contentSchema: z.ZodType<TContent>;
  emptyContent: TContent;
  Editor: ComponentType<{
    value: TContent;
    onChange: (value: TContent) => void;
    uploadPhoto: (file: File) => Promise<string>;
  }>;
  /**
   * `embedded` asks the view to fill its container instead of the viewport —
   * used by editor previews and demo frames.
   */
  View: ComponentType<{ content: TContent; embedded?: boolean }>;
  /**
   * Templates whose editor owns its own preview pane (and therefore needs the
   * whole width) opt in here; the create screen then skips its generic split.
   */
  fullWidthEditor?: boolean;
  /** A public, no-signup walkthrough at /demo/<id>. */
  hasDemo?: boolean;
}

export const TEMPLATE_REGISTRY = {
  memoryverse: {
    id: "memoryverse",
    displayName: "Memoryverse",
    description:
      "A darkened room and a slide projector. One memory fills the wall at a time, and you talk them through it.",
    isPaid: false,
    contentSchema: memoryverseContentSchema,
    emptyContent: emptyMemoryverseContent,
    Editor: MemoryverseEditor,
    View: MemoryverseView,
    fullWidthEditor: true,
    hasDemo: true,
  },
  "digital-scrapbook": {
    id: "digital-scrapbook",
    displayName: "Digital Scrapbook",
    description:
      "A handmade book on a sunlit desk. Pages turn with weight, and things are tucked into the pockets.",
    isPaid: true,
    priceCents: 500,
    contentSchema: digitalScrapbookContentSchema,
    emptyContent: emptyDigitalScrapbookContent,
    Editor: DigitalScrapbookEditor,
    View: DigitalScrapbookView,
    fullWidthEditor: true,
    hasDemo: true,
  },
  "love-letter": {
    id: "love-letter",
    displayName: "Love Letter",
    description:
      "One sheet of stationery, sealed with wax. The ink writes itself on, one word at a time.",
    isPaid: false,
    contentSchema: loveLetterContentSchema,
    emptyContent: emptyLoveLetterContent,
    Editor: LoveLetterEditor,
    View: LoveLetterView,
    fullWidthEditor: true,
    hasDemo: true,
  },
  "open-when": {
    id: "open-when",
    displayName: "Open When",
    description:
      "A wooden keepsake box of sealed letters. Some open now; others refuse until the day, mood or place is right.",
    isPaid: false,
    contentSchema: openWhenContentSchema,
    emptyContent: emptyOpenWhenContent,
    Editor: OpenWhenEditor,
    View: OpenWhenView,
    fullWidthEditor: true,
    hasDemo: true,
  },
  "countdown-gift": {
    id: "countdown-gift",
    displayName: "Countdown Gift",
    description:
      "An advent calendar in gold leaf. One door a day, in order, and tomorrow's genuinely will not open early.",
    isPaid: false,
    contentSchema: countdownContentSchema,
    emptyContent: emptyCountdownContent,
    Editor: CountdownGiftEditor,
    View: CountdownGiftView,
    fullWidthEditor: true,
    hasDemo: true,
  },
  "memory-puzzle": {
    id: "memory-puzzle",
    displayName: "Memory Puzzle",
    description:
      "A wooden puzzle tipped onto a sunlit table. The photograph only appears once they've earned it — and something unlocks along the way.",
    isPaid: true,
    priceCents: 500,
    contentSchema: memoryPuzzleContentSchema,
    emptyContent: emptyMemoryPuzzleContent,
    Editor: MemoryPuzzleEditor,
    View: MemoryPuzzleView,
    fullWidthEditor: true,
    hasDemo: true,
  },
  "surprise-reveal-box": {
    id: "surprise-reveal-box",
    displayName: "Surprise Reveal Box",
    description:
      "A box inside a box inside a box. Ribbon, paper, and something small in the way of each lid — then confetti, because here it's earned.",
    isPaid: true,
    priceCents: 500,
    contentSchema: surpriseBoxContentSchema,
    emptyContent: emptySurpriseBoxContent,
    Editor: SurpriseBoxEditor,
    View: SurpriseBoxView,
    fullWidthEditor: true,
    hasDemo: true,
  },
  "treasure-hunt": {
    id: "treasure-hunt",
    displayName: "Treasure Hunt",
    description:
      "A map that unrolls under a lantern and draws its own route. Every stop asks something small and gives back a memory; the last one opens the chest.",
    isPaid: true,
    priceCents: 500,
    contentSchema: treasureHuntContentSchema,
    emptyContent: emptyTreasureHuntContent,
    Editor: TreasureHuntEditor,
    View: TreasureHuntView,
    fullWidthEditor: true,
    hasDemo: true,
  },
  "mothers-day-letter": {
    id: "mothers-day-letter",
    displayName: "Mother's Day Letter",
    description:
      "Good stationery on a kitchen table in the morning. The ink arrives a word at a time, and watercolour flowers grow round the page as she reads.",
    isPaid: false,
    contentSchema: mothersDayContentSchema,
    emptyContent: emptyMothersDayContent,
    Editor: MothersDayLetterEditor,
    View: MothersDayLetterView,
    fullWidthEditor: true,
    hasDemo: true,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry mixes templates with different content types
} satisfies Record<string, TemplateDefinition<any>>;

export type TemplateId = keyof typeof TEMPLATE_REGISTRY;

export function getTemplate(
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
): TemplateDefinition<any> | undefined {
  return TEMPLATE_REGISTRY[id as TemplateId];
}

export function isTemplateId(id: string): id is TemplateId {
  return id in TEMPLATE_REGISTRY;
}
