import "server-only";
import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/lib/templates/registry";

/**
 * What has actually been paid for.
 *
 * One source of truth, read from `Order` rows, used by everything that cares:
 * the card states in the builder, the placeholder in the preview, and the gate on
 * publishing. Those three must never be able to disagree — a card that says
 * "owned" over a section that publishing then refuses is worse than either state
 * on its own.
 *
 * Deliberately *not* read from the website's own content. `section.locked` is a
 * rendering hint the editor writes; entitlement is a payment fact. Somebody
 * editing their own content must not be able to edit what they have bought, and
 * a server action is reachable by direct POST regardless of what the UI shows.
 */

/** Free experiences are unlocked for everyone, always. */
export function isPaidTemplate(templateId: string): boolean {
  return Boolean(getTemplate(templateId)?.isPaid);
}

/**
 * Which templates are unlocked inside one gift.
 *
 * Scoped to the gift rather than the account, which matches how Kindloop has
 * always charged: a one-off for *that* gift, never a subscription, and the FAQ
 * says so. The consequence worth knowing is that a second Personalized Website pays
 * again for the same sections — a product decision, not an oversight, and the
 * one place to revisit if that turns out to be the wrong call.
 */
export async function unlockedTemplates(giftId: string): Promise<Set<string>> {
  const orders = await prisma.order.findMany({
    where: { giftId, status: "paid" },
    select: { templateId: true },
  });

  const unlocked = new Set<string>();
  for (const o of orders) {
    if (o.templateId) unlocked.add(o.templateId);
  }
  return unlocked;
}

export interface SectionEntitlement {
  templateId: string;
  paid: boolean;
  unlocked: boolean;
  priceCents: number;
}

/**
 * The state of every section in a website, in one query.
 *
 * Returned as a list rather than a boolean so the caller can say *which* pieces
 * are missing. "You have not purchased this item" is a worse message than naming
 * the two sections and offering to unlock them.
 */
export async function sectionEntitlements(
  giftId: string,
  templateIds: string[]
): Promise<SectionEntitlement[]> {
  const unlocked = await unlockedTemplates(giftId);

  return templateIds.map((templateId) => {
    const def = getTemplate(templateId);
    const paid = Boolean(def?.isPaid);
    return {
      templateId,
      paid,
      /* Free experiences are unlocked by definition, with no row to look up. */
      unlocked: !paid || unlocked.has(templateId),
      priceCents: def?.priceCents ?? 0,
    };
  });
}

/** Everything still owing on a website. Empty means it is publishable. */
export async function lockedSections(
  giftId: string,
  templateIds: string[]
): Promise<SectionEntitlement[]> {
  const all = await sectionEntitlements(giftId, templateIds);
  return all.filter((s) => !s.unlocked);
}
