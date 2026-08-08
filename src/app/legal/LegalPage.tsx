import type { ReactNode } from "react";
import Link from "next/link";
import { PageShell } from "@/app/PageShell";
import { PageContainer, READ_WIDTH } from "@/app/PageContainer";

/**
 * The frame the three policies share.
 *
 * One shell so they cannot drift: the same date, the same tone, the same
 * navigation between them. Three legal pages written at three different times is
 * how a product ends up promising one thing in the privacy policy and another in
 * the terms.
 *
 * Set in the same paper and ink as the rest of the site rather than in a bare
 * legal template, because a page that suddenly looks like it came from somewhere
 * else reads as boilerplate nobody meant — and the whole point of these three is
 * that somebody did mean them.
 */

/** Changed by hand when the words change, not generated from the clock. */
export const LEGAL_UPDATED = "6 August 2026";

export const LEGAL_PAGES = [
  { href: "/legal/terms", label: "Terms of service" },
  { href: "/legal/privacy", label: "Privacy policy" },
  { href: "/legal/cookies", label: "Cookie policy" },
] as const;

const label = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: 9.5,
  letterSpacing: ".2em",
  textTransform: "uppercase" as const,
  color: "var(--label-on-paper)",
};

export function LegalPage({
  title,
  summary,
  active,
  children,
}: {
  title: string;
  /** The whole page in a sentence, for anybody who will not read the rest. */
  summary: string;
  active: string;
  children: ReactNode;
}) {
  return (
    <PageShell>
      {/*
        The same column as every other page.

        This used to put an 820px centred wrapper inside the shared container,
        which pushed the left edge inward and made the policies read as narrower
        and more cramped than About or the FAQ sitting either side of them in the
        footer. The container is the container; only the *text* takes a reading
        measure, exactly as it does everywhere else.
      */}
      <PageContainer className="pb-24 pt-16">
        <div>
          <p style={{ ...label, margin: 0 }}>Legal</p>
          <h1
            className="m-0 mt-4"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontWeight: 500,
              fontSize: "clamp(32px,4.4vw,50px)",
              lineHeight: 1.06,
              letterSpacing: "-0.016em",
              color: "var(--ink)",
            }}
          >
            {title}
          </h1>
          <p
            className="m-0 mt-4"
            style={{ maxWidth: READ_WIDTH, fontSize: 17, lineHeight: 1.7, color: "var(--ink-muted)" }}
          >
            {summary}
          </p>
          <p className="m-0 mt-4" style={{ fontSize: 13, color: "var(--ink-faint)" }}>
            Last updated {LEGAL_UPDATED}.
          </p>

          <nav aria-label="Policies" className="mt-8 flex flex-wrap gap-2">
            {LEGAL_PAGES.map((p) => {
              const on = p.href === active;
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  aria-current={on ? "page" : undefined}
                  className="rounded-full px-3.5 py-2 no-underline"
                  style={{
                    background: on ? "var(--brass)" : "var(--paper)",
                    color: on ? "var(--on-dark)" : "var(--ink-muted)",
                    border: `1px solid ${on ? "var(--brass)" : "rgba(58,42,24,.16)"}`,
                    fontSize: 13,
                  }}
                >
                  {p.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-12" style={{ maxWidth: READ_WIDTH }}>
            {children}
          </div>

          <div
            className="mt-16 rounded-2xl p-7"
            style={{ background: "var(--paper)", border: "1px solid rgba(58,42,24,.14)", maxWidth: READ_WIDTH }}
          >
            <p className="m-0" style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--ink-muted)" }}>
              Something here unclear, or something you want removed?{" "}
              <Link href="/contact" style={{ color: "var(--rust)", fontWeight: 500 }}>
                Write to us
              </Link>{" "}
              — a person reads it.
            </p>
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
}

/* ---------- the pieces a policy is built from ---------- */

export function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="mb-11">
      <h2
        className="m-0 flex items-baseline gap-3"
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontWeight: 500,
          fontSize: 23,
          lineHeight: 1.2,
          color: "var(--ink)",
        }}
      >
        <span style={{ ...label, fontSize: 11, color: "var(--rust)" }}>{n}</span>
        {title}
      </h2>
      <div className="mt-3.5 flex flex-col gap-3.5">{children}</div>
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="m-0" style={{ fontSize: 15.5, lineHeight: 1.78, color: "var(--ink-muted)" }}>
      {children}
    </p>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3" style={{ fontSize: 15.5, lineHeight: 1.72, color: "var(--ink-muted)" }}>
          <span aria-hidden style={{ color: "var(--rust)", flex: "0 0 auto" }}>
            —
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** A plain-language restatement, for the paragraph somebody will actually act on. */
export function Plainly({ children }: { children: ReactNode }) {
  return (
    <p
      className="m-0 rounded-xl px-5 py-4"
      style={{
        background: "var(--khaki-pale)",
        border: "1px solid rgba(122,92,62,.26)",
        fontSize: 15,
        lineHeight: 1.7,
        color: "var(--ink)",
      }}
    >
      <strong style={{ fontWeight: 600 }}>In plain terms: </strong>
      {children}
    </p>
  );
}
