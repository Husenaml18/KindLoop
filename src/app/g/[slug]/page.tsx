import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/lib/templates/registry";
import { TemplateFonts } from "@/app/TemplateFonts";

export default async function GiftViewPage(props: PageProps<"/g/[slug]">) {
  const { slug } = await props.params;

  const gift = await prisma.gift.findUnique({ where: { slug } });
  if (!gift) notFound();

  /* A Personalized Website is a site, not a gift you open, and it has its own address
     with its own paywall. One slug, one canonical URL. */
  if (gift.template === "personalized-website") redirect(`/website/${slug}`);

  const def = getTemplate(gift.template);
  if (!def) notFound();

  if (gift.isPaid && !gift.unlocked) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-6 py-24 text-center dark:bg-black">
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          This gift isn&apos;t ready yet
        </h1>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          The sender hasn&apos;t finished unlocking this gift. Check back
          soon.
        </p>
      </div>
    );
  }

  const parsed = def.contentSchema.safeParse(JSON.parse(gift.content));
  const content = parsed.success ? parsed.data : def.emptyContent;

  // Full bleed: each template owns its own atmosphere, so nothing is wrapped
  // in shared chrome that would leak one template's look into another's.
  return (
    <TemplateFonts>
      <def.View content={content} />
    </TemplateFonts>
  );
}
