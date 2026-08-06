import type { ReactNode } from "react";
import { fraunces, ibmPlexMono, spaceGrotesk, gochiHand } from "@/app/fonts";
import theme from "@/app/theme.module.css";
import { SiteHeader } from "@/app/SiteHeader";
import { SiteFooter } from "@/app/SiteFooter";
import { AccountMenu, isSignedIn } from "@/app/AccountMenu";

/**
 * The frame every ordinary page sits in.
 *
 * One shell so About, FAQ and Contact cannot drift apart from each other the way
 * the headers did before there was a `SiteHeader`. The ground, the fonts, the
 * header and the footer are decided once, here.
 */
export async function PageShell({
  children,
  waitlist = true,
}: {
  children: ReactNode;
  waitlist?: boolean;
}) {
  const signedIn = await isSignedIn();

  return (
    <div
      className={`${theme.themeRoot} ${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${gochiHand.variable} flex flex-1 flex-col`}
      style={{
        background:
          "radial-gradient(circle at 18% 26%, rgba(122,92,52,.07) .7px, transparent 1px), " +
          "radial-gradient(circle at 72% 64%, rgba(122,92,52,.055) .6px, transparent .9px), " +
          "radial-gradient(ellipse 92% 48% at 50% -6%, rgba(226,186,124,.34), transparent 62%), " +
          "radial-gradient(ellipse 60% 38% at 92% 22%, rgba(190,104,64,.12), transparent 66%), " +
          "linear-gradient(180deg, var(--bg2) 0%, var(--bg0) 32%, var(--bg1) 66%, var(--bg0) 100%)",
        backgroundSize: "39px 43px, 57px 51px, auto, auto, auto",
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
        color: "var(--ink-muted)",
        cursor: "auto",
        minHeight: "100dvh",
      }}
    >
      <SiteHeader account={<AccountMenu />} signedIn={signedIn} />
      <main className="flex-1">{children}</main>
      <SiteFooter waitlist={waitlist} />
    </div>
  );
}
