import Link from "next/link";
import { fraunces, ibmPlexMono, spaceGrotesk, gochiHand } from "@/app/fonts";
import theme from "@/app/theme.module.css";
import { SiteHeader } from "@/app/SiteHeader";
import { SiteFooter } from "@/app/SiteFooter";
import { AccountMenu, isSignedIn } from "@/app/AccountMenu";
import { PageContainer, READ_WIDTH } from "@/app/PageContainer";

export const metadata = {
  title: "Contact — Kindloop",
  description: "Get in touch about a gift, a bug, or an idea for an experience.",
};

const label = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: 9.5,
  letterSpacing: ".2em",
  textTransform: "uppercase" as const,
  color: "var(--label-on-paper)",
};

/**
 * There is no contact form here on purpose.
 *
 * A form implies a queue, a tracker and somebody watching it. Until that exists,
 * an address people can actually write to is the honest version — and it lands
 * somewhere a reply can come from.
 */
const ROUTES = [
  {
    heading: "Something's broken",
    body: "Tell us what you were making and what happened. If you can, include the link — it makes it findable.",
    action: "hello@kindloop.com",
    href: "mailto:hello@kindloop.com?subject=Something%20broke",
  },
  {
    heading: "An idea for an experience",
    body: "The best ones so far came from people describing a moment they couldn't find a card for. Describe yours.",
    action: "hello@kindloop.com",
    href: "mailto:hello@kindloop.com?subject=An%20idea",
  },
  {
    heading: "Something about your data",
    body: "You can delete your account and everything in it yourself, at any time, from your account page. If you'd rather we did it, write and we will.",
    action: "Go to your account",
    href: "/account",
  },
];

export default async function ContactPage() {
  const signedIn = await isSignedIn();

  return (
    <div
      className={`${theme.themeRoot} ${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${gochiHand.variable} flex flex-1 flex-col`}
      style={{
        background: "radial-gradient(circle at 18% 26%, rgba(122,92,52,.07) .7px, transparent 1px), " +
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

      <main className="flex-1">
        <PageContainer className="py-16">
        <p style={label}>Get in touch</p>
        <h1
          className="m-0 mt-4"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontWeight: 500,
            maxWidth: READ_WIDTH,
            fontSize: "clamp(32px,4.4vw,52px)",
            lineHeight: 1.06,
            letterSpacing: "-0.016em",
            color: "var(--ink)",
          }}
        >
          There&apos;s a person at this address.
        </h1>
        <p className="m-0 mt-4 max-w-xl" style={{ fontSize: 16, lineHeight: 1.7 }}>
          Kindloop is small. Write and you&apos;ll get a reply from somebody who
          worked on the thing you&apos;re writing about.
        </p>

        <div className="mt-12 flex flex-col gap-4">
          {ROUTES.map((r) => (
            <section
              key={r.heading}
              className="rounded-2xl p-6"
              style={{ background: "var(--paper)", border: "1px solid rgba(43,32,19,.12)" }}
            >
              <h2
                className="m-0"
                style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 500, fontSize: 20, color: "var(--ink)" }}
              >
                {r.heading}
              </h2>
              <p className="m-0 mt-2" style={{ fontSize: 14, lineHeight: 1.65 }}>
                {r.body}
              </p>
              <Link
                href={r.href}
                className="mt-4 inline-block rounded-full px-5 py-2.5 no-underline"
                style={{
                  background: "var(--brass)",
                  color: "var(--on-dark)",
                  fontSize: 13.5,
                  fontWeight: 500,
                }}
              >
                {r.action}
              </Link>
            </section>
          ))}
        </div>

        <p className="mt-12" style={{ fontFamily: "var(--font-gochi), cursive", fontSize: 21, color: "var(--rust)" }}>
          We read everything. We reply to nearly everything.
        </p>
        </PageContainer>
      </main>

      <SiteFooter waitlist={false} />
    </div>
  );
}
