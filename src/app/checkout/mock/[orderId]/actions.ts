"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { markGiftPaid } from "@/lib/orders";

async function requireOwnedOrder(orderId: string) {
  const user = await requireUser();
  if (!user) throw new Error("Unauthorized");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { gift: true },
  });
  if (!order || order.gift.ownerId !== user.id) {
    throw new Error("Forbidden");
  }
  return order;
}

export async function simulateSuccess(orderId: string) {
  const order = await requireOwnedOrder(orderId);
  await markGiftPaid(orderId);
  redirect(`/g/${order.gift.slug}?checkout=success`);
}

export async function simulateCancel(orderId: string) {
  const order = await requireOwnedOrder(orderId);
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "canceled" },
  });
  redirect(`/create/${order.gift.template}?gift=${order.gift.id}&checkout=canceled`);
}
