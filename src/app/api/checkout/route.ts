import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getTemplate } from "@/lib/templates/registry";
import { unlockedTemplates } from "@/lib/entitlements";
import { stripe } from "@/lib/stripe";

/**
 * Two things can be bought here.
 *
 * Without `templateId`, this is the gift itself — a paid template, the way it
 * has always worked, and paying flips `Gift.unlocked`.
 *
 * With `templateId`, it is one paid section inside a Personalized Website. Those do
 * *not* unlock the gift: a website with three paid sections must not go live
 * because one of them was paid for. The order row carries the template id, and
 * `entitlements.ts` reads entitlement back out of those rows.
 */
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const giftId = body?.giftId;
  const sectionId: string | undefined =
    typeof body?.templateId === "string" ? body.templateId : undefined;

  if (typeof giftId !== "string") {
    return new Response("Missing giftId", { status: 400 });
  }

  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift || gift.ownerId !== user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  /* Where the buyer lands afterwards. A website gets a website's URL. */
  const viewUrl = gift.template === "personalized-website" ? `/website/${gift.slug}` : `/g/${gift.slug}`;
  const backToEditor = `/create/${gift.template}?gift=${gift.id}`;

  /* ---------------- one section of a website ---------------- */
  if (sectionId) {
    if (gift.template !== "personalized-website") {
      return new Response("Sections are only sold inside a Personalized Website", { status: 400 });
    }

    const already = await unlockedTemplates(gift.id);
    if (already.has(sectionId)) {
      return Response.json({ url: backToEditor });
    }
  }

  const def = getTemplate(sectionId ?? gift.template);
  if (!def || !def.isPaid || !def.priceCents) {
    return new Response("Unknown or misconfigured template", { status: 400 });
  }

  if (!sectionId) {
    if (!gift.isPaid) {
      return new Response("This gift does not require payment", { status: 400 });
    }
    if (gift.unlocked) {
      return Response.json({ url: viewUrl });
    }
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

  const order = await prisma.order.create({
    data: {
      giftId,
      templateId: sectionId ?? null,
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
      /* Buying a section returns you to the workbench, where the rest of the
         half-built website is waiting. Buying the gift takes you to the gift. */
      success_url: `${origin}${sectionId ? `${backToEditor}&checkout=success` : `${viewUrl}?checkout=success`}`,
      cancel_url: `${origin}${backToEditor}&checkout=canceled`,
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
