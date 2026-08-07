import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { WaitlistPanel } from "./WaitlistPanel";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";
import styles from "./chrome.module.css";

/**
 * One footer for the whole product.
 *
 * Its top edge is torn rather than ruled — the page reads as a sheet pulled from a
 * pad, the same idea the header's stamp perforation is making at the other end.
 *
 * The experiences column is generated from the catalogue and lists only what is
 * actually finished. A footer advertising things that don't exist is the fastest
 * way to make a small product feel dishonest, and it is already the reason the
 * landing page spent months claiming "two ready now".
 */
export function SiteFooter({ waitlist = true }: { waitlist?: boolean }) {
  const live = TEMPLATE_CATALOG.filter((t) => t.status === "available");
  const year = 2026;

  return (
    <>
      {waitlist && (
        <div style={{ padding: "0 28px" }}>
          <WaitlistPanel />
        </div>
      )}

      <footer className={styles.footer} style={waitlist ? { paddingTop: 110 } : undefined}>
        <span aria-hidden className={styles.tornEdge} />

        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <Link href="/" aria-label="Kindloop — home" style={{ display: "inline-block" }}>
              <Wordmark size={26} />
            </Link>
            <p
              style={{
                margin: "16px 0 0",
                maxWidth: 290,
                fontSize: 13.5,
                lineHeight: 1.65,
                color: "var(--cream-muted)",
              }}
            >
              Letters, photographs and voices, made into something worth keeping.
              Every gift is a private link — whoever opens it never needs an account.
            </p>
            <p
              style={{
                margin: "18px 0 0",
                fontFamily: "var(--font-gochi), cursive",
                fontSize: 19,
                color: "var(--rust)",
              }}
            >
              Small gestures, kept.
            </p>

            <div className={styles.socials}>
              {[
                { label: "Instagram", href: "https://instagram.com", d: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5Zm0 2A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5ZM17.8 6a1.2 1.2 0 1 0 1.2 1.2A1.2 1.2 0 0 0 17.8 6Z" },
                { label: "Pinterest", href: "https://pinterest.com", d: "M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.1-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.8-2.5.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.8 3.4-.2 1 .5 1.8 1.5 1.8 1.8 0 3-2.3 3-5 0-2.1-1.4-3.6-3.9-3.6a4.5 4.5 0 0 0-4.7 4.5c0 .9.3 1.5.7 2 .2.2.2.3.1.5l-.2.8c0 .3-.2.4-.5.2-1.3-.5-1.9-2-1.9-3.6 0-2.7 2.3-5.9 6.8-5.9 3.6 0 6 2.6 6 5.4 0 3.7-2 6.4-5 6.4-1 0-2-.5-2.3-1.2l-.6 2.4c-.2.8-.7 1.7-1.1 2.3A10 10 0 1 0 12 2Z" },
                /* The envelope goes to the contact page rather than opening a
                   mail client — one place to write to us, and no address sitting
                   in the footer markup for scrapers to harvest. */
                { label: "Write to us", href: "/contact", d: "M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2.4V17h16V7.4l-8 5.3Zm14.6-.4H5.4L12 10.4Z" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={styles.social}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className={styles.footerHeading}>Experiences</p>
            {live.slice(0, 5).map((t) => (
              <Link key={t.id} href={t.href} className={styles.footerLink}>
                {t.name}
              </Link>
            ))}
            <Link href="/templates" className={styles.footerLink} style={{ color: "var(--rust)" }}>
              View all →
            </Link>
          </div>

          <div>
            <p className={styles.footerHeading}>Kindloop</p>
            <Link href="/about" className={styles.footerLink}>About us</Link>
            <Link href="/#how" className={styles.footerLink}>How it works</Link>
            <Link href="/#occasions" className={styles.footerLink}>Occasions</Link>
            <Link href="/faq" className={styles.footerLink}>Questions</Link>
            <Link href="/demo" className={styles.footerLink}>Watch a demo</Link>
            <Link href="/account" className={styles.footerLink}>Your profile</Link>
          </div>

          <div>
            <p className={styles.footerHeading}>Get in touch</p>
            <Link href="/contact" className={styles.footerLink}>Contact us</Link>
            <p
              style={{
                margin: "14px 0 0",
                maxWidth: 230,
                fontSize: 12.5,
                lineHeight: 1.6,
                color: "var(--cream-faint)",
              }}
            >
              Questions, ideas, or something that broke — a person reads it and replies.
            </p>
            <p
              style={{
                margin: "14px 0 0",
                fontSize: 12.5,
                lineHeight: 1.6,
                color: "var(--cream-faint)",
              }}
            >
              More experiences still being made.
            </p>
          </div>
        </div>

        <div className={styles.footerBase}>
          <span>© {year} Kindloop</span>

          <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 18px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span
                aria-hidden
                style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--rust)" }}
              />
              Private by default
            </span>
            {/* Findable without hunting, which is most of what a legal link is for. */}
            <Link href="/legal/terms" className={styles.footerBaseLink}>Terms</Link>
            <Link href="/legal/privacy" className={styles.footerBaseLink}>Privacy</Link>
            <Link href="/legal/cookies" className={styles.footerBaseLink}>Cookies</Link>
          </span>
        </div>
      </footer>
    </>
  );
}
