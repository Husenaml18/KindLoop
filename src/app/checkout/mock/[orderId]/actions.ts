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

  /* Buying one section of a website drops you back into the workbench — the
     rest of it is still half-built and unsaved-looking, and landing on the
     finished gift instead would read as "that's it, then". */
  if (order.templateId) {
    redirect(`/create/${order.gift.template}?gift=${order.gift.id}&checkout=success`);
  }

  const view =
    order.gift.template === "personalized-website"
      ? `/website/${order.gift.slug}`
      : `/g/${order.gift.slug}`;
  redirect(`${view}?checkout=success`);
}

export async function simulateCancel(orderId: string) {
  const order = await requireOwnedOrder(orderId);
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "canceled" },
  });
  redirect(`/create/${order.gift.template}?gift=${order.gift.id}&checkout=canceled`);
}
