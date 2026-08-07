import type { ReactNode } from "react";
import Link from "next/link";
import { fraunces, ibmPlexMono, spaceGrotesk, gochiHand } from "@/app/fonts";
import theme from "@/app/theme.module.css";
import { Wordmark } from "@/app/Wordmark";
import { AuthShowcase } from "./AuthShowcase";
import styles from "./auth.module.css";

/**
 * The frame every sign-in screen sits in.
 *
 * One shell, so the sign-in page, the "check your email" page and the error page
 * are visibly the same room — moving between them should feel like staying put,
 * not like being bounced between three different products.
 *
 * Split in two: the form on the left in a narrow column, and the product itself
 * filling the right. A card floating in the middle of an empty page makes signing
 * in feel like the destination, and it never is — nobody wants to be here, and the
 * least this screen can do is show what is on the other side of it.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${theme.themeRoot} ${styles.page} ${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${gochiHand.variable}`}
    >
      <div className={styles.left}>
        <Link href="/" aria-label="Kindloop — home" className={styles.brand}>
          <Wordmark size={26} priority />
        </Link>

        {/* The registration mark printers put in the margin before a sheet is cut. */}
        <svg viewBox="0 0 16 16" className={styles.mark} aria-hidden>
          <path d="M8 0 V16 M0 8 H16" stroke="var(--ink-faint)" strokeWidth="1" />
          <circle cx="8" cy="8" r="4.2" fill="none" stroke="var(--ink-faint)" strokeWidth="1" />
        </svg>

        <div className={styles.middle}>
          <div className={styles.form}>{children}</div>
        </div>

        <p className={`m-0 ${styles.foot}`}>
          By signing in you agree to our <Link href="/legal/terms">terms</Link> and{" "}
          <Link href="/legal/privacy">privacy policy</Link>. Whoever you send a gift
          to never needs an account.
        </p>
      </div>

      <div className={styles.right}>
        <AuthShowcase />
      </div>
    </div>
  );
}
