import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getTemplate } from "@/lib/templates/registry";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { giftId } = await req.json();
  if (typeof giftId !== "string") {
    return new Response("Missing giftId", { status: 400 });
  }

  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift || gift.ownerId !== user.id) {
    return new Response("Forbidden", { status: 403 });
  }
  if (!gift.isPaid) {
    return new Response("This gift does not require payment", { status: 400 });
  }
  if (gift.unlocked) {
    return Response.json({ url: `/g/${gift.slug}` });
  }

  const def = getTemplate(gift.template);
  if (!def || !def.isPaid || !def.priceCents) {
    return new Response("Unknown or misconfigured template", { status: 400 });
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

  const order = await prisma.order.create({
    data: {
      giftId,
      provider: stripe ? "stripe" : "mock",
      amountCents: def.priceCents,
    },
  });

  if (stripe) {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: def.priceCents,
            product_data: { name: def.displayName },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/g/${gift.slug}?checkout=success`,
      cancel_url: `${origin}/create/${gift.template}?gift=${gift.id}&checkout=canceled`,
      metadata: { orderId: order.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutId: checkoutSession.id },
    });

    return Response.json({ url: checkoutSession.url });
  }

  return Response.json({ url: `/checkout/mock/${order.id}` });
}
