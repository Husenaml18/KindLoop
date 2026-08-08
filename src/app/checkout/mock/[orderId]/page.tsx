import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getTemplate } from "@/lib/templates/registry";
import { simulateSuccess, simulateCancel } from "./actions";

export default async function MockCheckoutPage(
  props: PageProps<"/checkout/mock/[orderId]">
) {
  // Structurally inert once real Stripe credentials exist — this route can
  // never be reached, not just hidden from the UI.
  if (process.env.STRIPE_SECRET_KEY) notFound();

  const { orderId } = await props.params;

  const user = await requireUser();
  if (!user) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { gift: true },
  });
  if (!order || order.gift.ownerId !== user.id) notFound();

  /* An order with a templateId bought one section of a website, not the gift —
     naming the gift's template here would price the wrong thing. */
  const def = getTemplate(order.templateId ?? order.gift.template);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 py-24 dark:bg-black">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-black/[.08] bg-white p-8 text-center dark:border-white/[.145] dark:bg-zinc-900">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Dev mode &mdash; mock checkout
          </p>
          <h1 className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            {def?.displayName ?? order.gift.template}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            ${(order.amountCents / 100).toFixed(2)}
          </p>
        </div>

        <p className="text-xs text-zinc-500">
          No Stripe credentials are configured, so this simulates a real
          checkout. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env to
          use real Stripe Checkout instead.
        </p>

        <form
          action={async () => {
            "use server";
            await simulateSuccess(order.id);
          }}
        >
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-5 font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Simulate successful payment
          </button>
        </form>
        <form
          action={async () => {
            "use server";
            await simulateCancel(order.id);
          }}
        >
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-full border border-black/[.08] px-5 font-medium hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Simulate cancel
          </button>
        </form>
      </div>
    </div>
  );
}
