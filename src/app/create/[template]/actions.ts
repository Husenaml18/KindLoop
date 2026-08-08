"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getTemplate } from "@/lib/templates/registry";
import { unlockedTemplates, type SectionEntitlement } from "@/lib/entitlements";
import { personalizedWebsiteContentSchema } from "@/lib/templates/personalized-website/schema";

/* Uploads deliberately live in /api/upload instead of here: a Server Action
   request body is capped at 1 MB, which photographs routinely exceed. */

async function requireOwnedGift(giftId: string) {
  const user = await requireUser();
  if (!user) throw new Error("Unauthorized");

  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift || gift.ownerId !== user.id) {
    throw new Error("Forbidden");
  }
  return gift;
}

export interface SaveResult {
  /** Paid sections of a Personalized Website that have not been bought yet. */
  owed: SectionEntitlement[];
}

/**
 * Save the draft, then say what is still owed.
 *
 * The save always goes through, even with unpaid sections in it. Refusing would
 * mean somebody loses an afternoon's writing because they have not paid yet, and
 * a draft is theirs regardless. What payment actually gates is the public page:
 * `/website/[slug]` will not serve a website with anything owing on it, and the
 * `owed` list here is what the editor uses to say so plainly.
 */
export async function savePersonalization(
  giftId: string,
  content: unknown
): Promise<SaveResult> {
  const gift = await requireOwnedGift(giftId);

  const def = getTemplate(gift.template);
  if (!def) throw new Error("Unknown template");

  const parsed = def.contentSchema.safeParse(content);
  if (!parsed.success) {
    throw new Error(`Invalid content: ${parsed.error.message}`);
  }

  let toStore: unknown = parsed.data;
  let owed: SectionEntitlement[] = [];

  if (gift.template === "personalized-website") {
    /*
     * The `locked` flags are rewritten from the order rows on the way in.
     *
     * The editor sets them optimistically as a rendering hint, and this is
     * content the owner can post arbitrarily — so whatever arrives is discarded
     * and recomputed here. It is also what makes a section stop looking locked
     * after it is paid for, without the client having to be told.
     */
    const website = personalizedWebsiteContentSchema.parse(parsed.data);
    const bought = await unlockedTemplates(gift.id);

    const sections = website.sections.map((section) => {
      const sectionDef = getTemplate(section.type);
      const paid = Boolean(sectionDef?.isPaid);
      const locked = paid && !bought.has(section.type);
      if (locked) {
        owed.push({
          templateId: section.type,
          paid: true,
          unlocked: false,
          priceCents: sectionDef?.priceCents ?? 0,
        });
      }
      return { ...section, locked };
    });

    /* One entry per template, not per section — two Love Letters are one purchase. */
    owed = owed.filter((o, i) => owed.findIndex((x) => x.templateId === o.templateId) === i);
    toStore = { ...website, sections };
  }

  await prisma.gift.update({
    where: { id: giftId },
    data: { content: JSON.stringify(toStore) },
  });

  return { owed };
}
