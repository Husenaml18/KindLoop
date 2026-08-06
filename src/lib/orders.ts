import { prisma } from "@/lib/prisma";

export async function markGiftPaid(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "paid" },
    include: { gift: true },
  });

  await prisma.gift.update({
    where: { id: order.giftId },
    data: { unlocked: true },
  });

  return order;
}
