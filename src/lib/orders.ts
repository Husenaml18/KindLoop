import { prisma } from "@/lib/prisma";

/**
 * Mark an order paid, and unlock whatever it bought.
 *
 * Two shapes of order now exist. One with no `templateId` is a payment for the
 * gift itself — the way every paid template has always worked — and it flips
 * `Gift.unlocked`. One *with* a `templateId` bought a single section inside a
 * Personalized Website, and must not: a website with three paid sections would
 * otherwise be fully unlocked by paying for one of them.
 *
 * Section entitlement is read back from these rows by `entitlements.ts`, so
 * nothing else needs a flag.
 */
export async function markGiftPaid(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "paid" },
    include: { gift: true },
  });

  if (!order.templateId) {
    await prisma.gift.update({
      where: { id: order.giftId },
      data: { unlocked: true },
    });
  }

  return order;
}
