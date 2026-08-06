import Link from "next/link";
import { PageShell } from "@/app/PageShell";
import { AboutSection } from "@/app/AboutSection";
import { PageContainer, READ_WIDTH } from "@/app/PageContainer";

export const metadata = {
  title: "About — Kindloop",
  description:
    "Why Kindloop is built one experience at a time, and what that means for what you send.",
};

const label = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: 9.5,
  letterSpacing: ".2em",
  textTransform: "uppercase" as const,
  color: "var(--label-on-paper)",
};

/** The three convictions the whole product is built on. */
const BELIEFS = [
  {
    n: "01",
    title: "A card says the same thing to everybody",
    body: "That is what makes it easy, and what makes it forgettable. Everything here starts from something only you could have written — your handwriting, your photograph, the thing you have never actually said out loud.",
  },
  {
    n: "02",
    title: "The way it opens is part of the gift",
    body: "A sealed letter that has to be broken open is not the same as a page that appears. Waiting for a door to unlock is not the same as scrolling. We build the opening as carefully as the contents, because that is the part people remember.",
  },
  {
    n: "03",
    title: "It belongs to the two of you",
    body: "No feed, no profile anyone can browse, no account for whoever receives it, and nothing in the product that can read what you wrote. A private link, and the ability to delete it and everything in it whenever you like.",
  },
];

export default function AboutPage() {
  return (
    <PageShell>
      {/* ---------- what this is ---------- */}
      <PageContainer as="section" className="pb-4 pt-16">
        <p style={label}>About us</p>
        <h1
          className="m-0 mt-4"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontWeight: 500,
            maxWidth: READ_WIDTH,
            fontSize: "clamp(34px,4.8vw,58px)",
            lineHeight: 1.04,
            letterSpacing: "-0.017em",
            color: "var(--ink)",
          }}
        >
          We make the thing people keep in a drawer.
        </h1>
        <p className="m-0 mt-5 max-w-2xl" style={{ fontSize: 17.5, lineHeight: 1.7 }}>
          Kindloop turns what you already have — a photograph, your voice, something
          you have been meaning to say — into an experience somebody opens once and
          then comes back to. There is no app to install and nothing for them to sign
          up to. It is a link, and it is theirs.
        </p>
        <p className="m-0 mt-4 max-w-2xl" style={{ fontSize: 17.5, lineHeight: 1.7 }}>
          There will never be hundreds of them, because each one is built as its
          own object rather than the same page in a different colour. A few are
          finished, and more are being made.
        </p>
      </PageContainer>

      {/* ---------- the bento, moved here from the landing page ---------- */}
      <AboutSection heading={false} />

      {/* ---------- what we believe ---------- */}
      <PageContainer as="section" className="py-16">
        <p style={label}>What we think</p>
        <h2
          className="m-0 mt-4"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontWeight: 500,
            fontSize: "clamp(28px,3.4vw,42px)",
            lineHeight: 1.08,
            color: "var(--ink)",
          }}
        >
          Three things we keep coming back to.
        </h2>

        <div className="mt-10 flex flex-col gap-4">
          {BELIEFS.map((b) => (
            <div
              key={b.n}
              className="rounded-2xl p-7"
              style={{ background: "var(--paper)", border: "1px solid rgba(58,42,24,.16)" }}
            >
              <div className="flex gap-5">
                <span
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                    fontSize: 11,
                    color: "var(--rust)",
                    paddingTop: 5,
                  }}
                >
                  {b.n}
                </span>
                <div>
                  <h3
                    className="m-0"
                    style={{
                      fontFamily: "var(--font-fraunces), serif",
                      fontWeight: 500,
                      fontSize: 21,
                      lineHeight: 1.25,
                      color: "var(--ink)",
                    }}
                  >
                    {b.title}
                  </h3>
                  <p className="m-0 mt-2.5" style={{ fontSize: 15, lineHeight: 1.7 }}>
                    {b.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/templates"
            className="rounded-full px-6 py-3 no-underline"
            style={{ background: "var(--brass)", color: "var(--on-dark)", fontSize: 14.5, fontWeight: 500 }}
          >
            See the experiences
          </Link>
          <Link
            href="/faq"
            className="rounded-full border px-6 py-3 no-underline"
            style={{ borderColor: "rgba(58,42,24,.26)", color: "var(--ink)", fontSize: 14.5 }}
          >
            Read the questions
          </Link>
        </div>
      </PageContainer>
    </PageShell>
  );
}
