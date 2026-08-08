import type { Metadata } from "next";
import { fraunces, ibmPlexMono, spaceGrotesk, gochiHand } from "@/app/fonts";
import theme from "@/app/theme.module.css";
import { SiteHeader } from "@/app/SiteHeader";
import { SiteFooter } from "@/app/SiteFooter";
import { AccountMenu, isSignedIn } from "@/app/AccountMenu";
import { PageContainer } from "@/app/PageContainer";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";
import { hasDemoContent } from "@/lib/templates/demos";
import { templateImage } from "@/lib/templateImages";
import { DemoRoom, type DemoStop } from "./DemoRoom";
import styles from "./demoRoom.module.css";

export const metadata: Metadata = {
  title: "Demo room — Kindloop",
  description:
    "Open a finished Kindloop experience, filled in with somebody else's memories, without making an account.",
};

/**
 * Every walkthrough in one place.
 *
 * Laid out as a doorway you step through rather than a grid of cards, because the
 * page's whole job is *showing* rather than telling. Kraft and ink like every
 * other page: an earlier pass made this dark to match a reference and it read as
 * a different product bolted on.
 *
 * Built from the catalogue and filtered on whether demo content actually exists,
 * so it cannot offer a walkthrough that would 404. Everything unfinished is named
 * lower down without a link.
 */
export default async function DemoIndexPage() {
  const signedIn = await isSignedIn();

  const live = TEMPLATE_CATALOG.filter(
    (t) => t.status === "available" && hasDemoContent(t.id)
  );

  const stops: DemoStop[] = live.map((t) => ({
    id: t.id,
    name: t.name,
    blurb: t.blurb,
    /* The one thing this experience does that none of the others do — the reason
       to open this demo rather than a different one. */
    interaction: t.interaction,
    href: `/demo/${t.id}`,
    art: templateImage(t.id),
  }));

  const soon = TEMPLATE_CATALOG.filter((t) => t.status === "soon")
    .slice(0, 8)
    .map((t) => t.name);

  /* Whatever artwork exists, for the photographs pinned round the door. */
  const pinned = live
    .map((t) => templateImage(t.id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .slice(0, 3);

  return (
    <div
      className={`${theme.themeRoot} ${styles.room} ${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${gochiHand.variable}`}
      style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif", cursor: "auto" }}
    >
      <SiteHeader account={<AccountMenu />} signedIn={signedIn} />

      <main className="flex-1">
        <PageContainer className="pb-16">
          <DemoRoom stops={stops} soon={soon} pinned={pinned} />
        </PageContainer>
      </main>

      <SiteFooter waitlist={false} />
    </div>
  );
}
