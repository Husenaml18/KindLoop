import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/app/PageShell";
import { PageContainer } from "@/app/PageContainer";
import { TemplateArt } from "@/app/TemplateArt";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";
import { hasDemoContent } from "@/lib/templates/demos";

export const metadata: Metadata = {
  title: "Watch a demo — Kindloop",
  description:
    "Open a finished Kindloop experience, filled in with somebody else's memories, without making an account.",
};

const label = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: 9.5,
  letterSpacing: ".2em",
  textTransform: "uppercase" as const,
  color: "var(--label-on-paper)",
};

/**
 * Every walkthrough in one place.
 *
 * The individual demos have existed since the experiences did, but the only way to
 * reach one was to already know its URL — so the account menu had two entries that
 * both led to the profile page, and the most persuasive thing the product owns was
 * unreachable from anywhere.
 *
 * Built from the catalogue and filtered by whether demo content actually exists,
 * so this page cannot offer a walkthrough that would 404. Nothing here needs an
 * account, which is the point of it.
 */
export default function DemoIndexPage() {
  const demos = TEMPLATE_CATALOG.filter(
    (t) => t.status === "available" && hasDemoContent(t.id)
  );

  return (
    <PageShell>
      <PageContainer className="pb-20 pt-16">
        <div className="text-center">
          <p style={{ ...label, margin: 0 }}>Watch a demo</p>
          <h1
            className="m-0 mt-4"
            style={{
              maxWidth: 720,
              marginInline: "auto",
              fontFamily: "var(--font-fraunces), serif",
              fontWeight: 500,
              fontSize: "clamp(32px,4.4vw,52px)",
              lineHeight: 1.06,
              letterSpacing: "-0.016em",
              color: "var(--ink)",
            }}
          >
            Open one before you make one.
          </h1>
          <p
            className="m-0 mt-4"
            style={{ maxWidth: 520, marginInline: "auto", fontSize: 16, lineHeight: 1.68 }}
          >
            Each of these is the real experience, filled in with somebody else&apos;s
            memories. No account, nothing to install — exactly what the person you
            send one to would see.
          </p>
        </div>

        <ul className="mt-14 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {demos.map((t) => (
            <li key={t.id}>
              <Link
                href={`/demo/${t.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl no-underline"
                style={{
                  background: "var(--paper)",
                  border: "1px solid rgba(43,32,19,.12)",
                  boxShadow: "0 18px 40px -30px rgba(30,20,12,.6)",
                }}
              >
                <div className="relative" style={{ aspectRatio: "5 / 4", overflow: "hidden" }}>
                  <TemplateArt
                    id={t.id}
                    alt={`${t.name} — ${t.blurb}`}
                    photos={[]}
                    photoIndex={0}
                  />
                  <span
                    className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1"
                    style={{
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      fontSize: 9,
                      letterSpacing: ".16em",
                      textTransform: "uppercase",
                      background: "rgba(23,18,14,.78)",
                      color: "var(--paper)",
                    }}
                  >
                    {t.price ?? "Free"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-5">
                  <span
                    style={{
                      fontFamily: "var(--font-fraunces), serif",
                      fontSize: 19,
                      color: "var(--ink)",
                    }}
                  >
                    {t.name}
                  </span>
                  <p className="m-0 flex-1" style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-muted)" }}>
                    {t.blurb}
                  </p>
                  {/* The one thing this experience does that none of the others do —
                      the reason to open this demo rather than a different one. */}
                  <p className="m-0" style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-faint)" }}>
                    {t.interaction}
                  </p>
                  <span
                    className="mt-1"
                    style={{
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      fontSize: 9.5,
                      letterSpacing: ".1em",
                      color: "var(--rust)",
                    }}
                  >
                    WATCH IT →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div
          className="mt-14 rounded-2xl p-8 text-center"
          style={{ background: "var(--paper)", border: "1px solid rgba(58,42,24,.12)" }}
        >
          <p
            className="m-0"
            style={{ fontFamily: "var(--font-gochi), cursive", fontSize: 23, color: "var(--ink)" }}
          >
            Seen one you&apos;d send?
          </p>
          <p className="m-0 mt-2" style={{ fontSize: 14.5, lineHeight: 1.65 }}>
            Making one is the same thing, with your photographs in it instead.
          </p>
          <Link
            href="/templates"
            className="mt-6 inline-block rounded-full px-6 py-3 no-underline"
            style={{ background: "var(--brass)", color: "var(--on-dark)", fontSize: 14, fontWeight: 500 }}
          >
            Choose an experience
          </Link>
        </div>
      </PageContainer>
    </PageShell>
  );
}
