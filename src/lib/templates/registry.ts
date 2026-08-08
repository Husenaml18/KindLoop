/**
 * Every template Kindloop can make a gift from.
 *
 * The eleven standalone experiences live in `sections.ts`; the two *containers* —
 * Personalized Website and Mini World — are added here, on top of them. The split
 * is not organisational tidiness: it is what stops a container from containing
 * itself. `sections.ts` cannot see this file, so the set both of them compose
 * from provably excludes both of them, and the infinite regress is impossible
 * rather than merely guarded against.
 *
 * The public API is unchanged: `getTemplate`, `isTemplateId`, `TemplateId` and
 * `TEMPLATE_REGISTRY` mean what they always did, and now include the website.
 */

import { SECTION_REGISTRY, type TemplateDefinition } from "./sections";

import {
  personalizedWebsiteContentSchema,
  emptyPersonalizedWebsiteContent,
} from "./personalized-website/schema";
import { PersonalizedWebsiteEditor } from "./personalized-website/Editor";
import { PersonalizedWebsiteView } from "./personalized-website/View";

import { miniWorldContentSchema, emptyMiniWorldContent } from "./mini-world/schema";
import { MiniWorldEditor } from "./mini-world/Editor";
import { MiniWorldView } from "./mini-world/View";

export type { TemplateDefinition };
export { SECTION_REGISTRY, getSectionTemplate } from "./sections";

export const TEMPLATE_REGISTRY = {
  ...SECTION_REGISTRY,
  "personalized-website": {
    id: "personalized-website",
    displayName: "Personalized Website",
    description:
      "Not one gift but all of them, in a running order. Their own site, opening on a title, moving through as many experiences as the story needs, and ending on a page written by you.",
    isPaid: true,
    priceCents: 1500,
    contentSchema: personalizedWebsiteContentSchema,
    emptyContent: emptyPersonalizedWebsiteContent,
    Editor: PersonalizedWebsiteEditor,
    View: PersonalizedWebsiteView,
    fullWidthEditor: true,
    hasDemo: true,
  },
  "mini-world": {
    id: "mini-world",
    displayName: "Mini World",
    description:
      "A tiny handcrafted world you can walk around. Every building holds one of the other experiences, small versions of you live in it, and something is waiting at the edge of the map.",
    isPaid: true,
    priceCents: 2500,
    contentSchema: miniWorldContentSchema,
    emptyContent: emptyMiniWorldContent,
    Editor: MiniWorldEditor,
    View: MiniWorldView,
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
