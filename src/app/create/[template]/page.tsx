import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getTemplate, isTemplateId } from "@/lib/templates/registry";
import { generateSlug } from "@/lib/slug";
import { CreateEditorClient } from "./CreateEditorClient";
import { AccountMenu } from "@/app/AccountMenu";

export default async function CreateTemplatePage(
  props: PageProps<"/create/[template]">
) {
  const { template } = await props.params;
  const searchParams = await props.searchParams;

  if (!isTemplateId(template)) notFound();
  const def = getTemplate(template)!;

  const user = await requireUser();
  if (!user) {
    redirect(`/sign-in?callbackUrl=/create/${template}`);
  }

  const giftId = typeof searchParams.gift === "string" ? searchParams.gift : undefined;

  if (!giftId) {
    const gift = await prisma.gift.create({
      data: {
        slug: generateSlug(),
        template,
        content: JSON.stringify(def.emptyContent),
        isPaid: def.isPaid,
        unlocked: !def.isPaid,
        ownerId: user.id,
      },
    });
    redirect(`/create/${template}?gift=${gift.id}`);
  }

  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift || gift.ownerId !== user.id || gift.template !== template) {
    notFound();
  }

  const parsed = def.contentSchema.safeParse(JSON.parse(gift.content));
  const initialContent = parsed.success ? parsed.data : def.emptyContent;

  return (
    <CreateEditorClient
      templateId={template}
      giftId={gift.id}
      slug={gift.slug}
      isPaid={gift.isPaid}
      unlocked={gift.unlocked}
      priceCents={def.priceCents}
      initialContent={initialContent}
      accountMenu={<AccountMenu />}
    />
  );
}
