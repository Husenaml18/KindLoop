import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getTemplate } from "@/lib/templates/registry";

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) redirect("/sign-in?callbackUrl=/dashboard");

  const gifts = await prisma.gift.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="flex w-full max-w-2xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Your gifts
          </h1>
          <Link
            href="/templates"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            New gift
          </Link>
        </div>

        {gifts.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You haven&apos;t created a gift yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {gifts.map((gift) => {
              const template = getTemplate(gift.template);
              const locked = gift.isPaid && !gift.unlocked;
              return (
                <li
                  key={gift.id}
                  className="flex items-center justify-between rounded-xl border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-900"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-zinc-950 dark:text-zinc-50">
                      {template?.displayName ?? gift.template}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {locked ? "Payment required" : "Ready to share"}
                    </span>
                  </div>
                  <Link
                    href={`/g/${gift.slug}`}
                    className="text-sm font-medium text-zinc-950 underline dark:text-zinc-50"
                  >
                    View link
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
