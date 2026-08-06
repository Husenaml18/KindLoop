import Link from "next/link";
import { PageShell } from "@/app/PageShell";
import { PageContainer } from "@/app/PageContainer";
import { FaqBrowser } from "@/app/FaqBrowser";
import { FAQS } from "@/lib/faq";
import styles from "@/app/chrome.module.css";

export const metadata = {
  title: "Questions — Kindloop",
  description:
    "What it costs, who can see it, how long it takes, and what happens to a gift afterwards.",
};

const label = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: 9.5,
  letterSpacing: ".2em",
  textTransform: "uppercase" as const,
  color: "var(--label-on-paper)",
};

/**
 * The questions, in a ruled column.
 *
 * Two hairlines run the height of the page with everything between them, and the
 * bands inside are divided by rules of their own: the title, then the way in, then
 * the questions. It reads as a sheet in a binder rather than a web page, which is
 * the claim every other screen here makes — and it gives the search box a shelf to
 * sit on instead of floating above a list.
 */
export default function FaqPage() {
  return (
    <PageShell>
      <PageContainer className="pb-20">
        <div className={styles.faqRails}>
          {/* ---------- the title ---------- */}
          <div className={styles.faqBand} style={{ padding: "58px 24px 40px", textAlign: "center" }}>
            <p style={{ ...label, margin: 0 }}>Questions</p>
            <h1
              className="m-0 mt-4"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontWeight: 500,
                fontSize: "clamp(34px,4.6vw,54px)",
                lineHeight: 1.05,
                letterSpacing: "-0.016em",
                color: "var(--ink)",
              }}
            >
              Everything people ask.
            </h1>
            <p
              className="m-0 mt-4"
              style={{ maxWidth: 470, marginInline: "auto", fontSize: 16, lineHeight: 1.65 }}
            >
              Most of these are really one question — <em>can I trust you with this</em>{" "}
              — so they&apos;re answered plainly rather than carefully.
            </p>
          </div>

          {/* ---------- search, filters, and the list ---------- */}
          <div style={{ padding: "0 24px" }}>
            <FaqBrowser items={FAQS} />
          </div>

          {/* ---------- still stuck ---------- */}
          <div style={{ padding: "12px 24px 56px" }}>
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "var(--paper)", border: "1px solid rgba(58,42,24,.12)" }}
            >
              <p
                className="m-0"
                style={{ fontFamily: "var(--font-gochi), cursive", fontSize: 23, color: "var(--ink)" }}
              >
                Still wondering something?
              </p>
              <p className="m-0 mt-2" style={{ fontSize: 14.5, lineHeight: 1.65 }}>
                Write and a person replies — usually the one who built the thing
                you&apos;re asking about.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-block rounded-full px-6 py-3 no-underline"
                style={{ background: "var(--brass)", color: "var(--on-dark)", fontSize: 14, fontWeight: 500 }}
              >
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
}
