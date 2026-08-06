"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getTemplate } from "@/lib/templates/registry";

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

export async function savePersonalization(giftId: string, content: unknown) {
  const gift = await requireOwnedGift(giftId);

  const def = getTemplate(gift.template);
  if (!def) throw new Error("Unknown template");

  const parsed = def.contentSchema.safeParse(content);
  if (!parsed.success) {
    throw new Error(`Invalid content: ${parsed.error.message}`);
  }

  await prisma.gift.update({
    where: { id: giftId },
    data: { content: JSON.stringify(parsed.data) },
  });
}
