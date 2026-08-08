import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/lib/templates/registry";
import { lockedSections } from "@/lib/entitlements";
import { personalizedWebsiteContentSchema } from "@/lib/templates/personalized-website/schema";
import { PersonalizedWebsiteView } from "@/lib/templates/personalized-website/View";
import { TemplateFonts } from "@/app/TemplateFonts";

/**
 * A Personalized Website, live.
 *
 * Its own route rather than `/g/[slug]` because it is not a gift you open — it
 * is a site you scroll, and the URL somebody sends should say so. A website slug
 * arriving at `/g` is bounced here, and a gift slug arriving here is bounced
 * back, so each has exactly one address.
 *
 * The paywall lives here, and nowhere else that matters. Everything up to this
 * point — building, arranging, writing, previewing — is free, including with
 * unpaid sections in the draft. This is the line: a website with anything owing
 * on it does not serve.
 */
export async function generateMetadata(
  props: PageProps<"/website/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const gift = await prisma.gift.findUnique({ where: { slug } });
  if (!gift || gift.template !== "personalized-website") return {};

  const parsed = personalizedWebsiteContentSchema.safeParse(JSON.parse(gift.content));
  if (!parsed.success) return {};

  const { title, subtitle, recipient } = parsed.data;
  return {
    title: title || (recipient ? `For ${recipient}` : "A Kindloop website"),
    description: subtitle || undefined,
  };
}

export default async function PersonalizedWebsitePage(props: PageProps<"/website/[slug]">) {
  const { slug } = await props.params;

  const gift = await prisma.gift.findUnique({ where: { slug } });
  if (!gift) notFound();

  /* Anything that is not a website belongs at /g. */
  if (gift.template !== "personalized-website") redirect(`/g/${slug}`);

  const def = getTemplate(gift.template);
  if (!def) notFound();

  const parsed = personalizedWebsiteContentSchema.safeParse(JSON.parse(gift.content));
  const content = parsed.success ? parsed.data : personalizedWebsiteContentSchema.parse({});

  /* Read from the order rows, never from the content — the flags in there are a
     rendering hint the owner can edit, and this is a payment fact. */
  const owed = await lockedSections(
    gift.id,
    [...new Set(content.sections.map((s) => s.type))]
  );

  if (!gift.unlocked || owed.length > 0) {
    return <NotReady />;
  }

  return (
    <TemplateFonts>
      <PersonalizedWebsiteView content={content} />
    </TemplateFonts>
  );
}

/**
 * What the recipient sees if the sender has not finished paying.
 *
 * Deliberately says nothing about money, sections or locks. The person reading
 * this is not the person who owes anything, and telling them their gift is stuck
 * behind an invoice spoils it twice over — once now, and once when it arrives.
 */
function NotReady() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        padding: "24px",
        background:
          "radial-gradient(ellipse 70% 44% at 50% 0%, #f3e6d2, #ecd9bd 46%, #e0c9a6 100%)",
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: 34, lineHeight: 1 }}>✦</div>
        <h1
          className="m-0 mt-5"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontWeight: 500,
            fontSize: "clamp(26px,4vw,38px)",
            lineHeight: 1.1,
            color: "#3f2f1c",
          }}
        >
          Not quite finished
        </h1>
        <p className="m-0 mt-4" style={{ fontSize: 16, lineHeight: 1.7, color: "#71583b" }}>
          Somebody is still putting this together for you. Keep the link — it will
          be here when they&apos;re done.
        </p>
      </div>
    </div>
  );
}
