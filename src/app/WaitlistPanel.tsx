"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistResult } from "./actions/waitlist";
import styles from "./chrome.module.css";

/**
 * The invitation at the top of the footer.
 *
 * Uses `useActionState` so the result comes back without navigating and without a
 * client-side fetch of our own — the form still works with JavaScript off, which
 * for a plain email field is worth keeping.
 *
 * The copy promises very little on purpose. A newsletter box that says "get
 * exclusive offers" on a product about writing to your mother reads as somebody
 * else's website.
 */
export function WaitlistPanel({ source = "footer" }: { source?: string }) {
  const [state, formAction, pending] = useActionState<WaitlistResult | null, FormData>(
    joinWaitlist,
    null
  );

  return (
    <section className={styles.waitlist} aria-labelledby="waitlist-heading">
      {/* a coffee ring on the card, because of course there is one */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: -40,
          bottom: -70,
          width: 210,
          height: 210,
          borderRadius: "50%",
          border: "9px solid rgba(217,164,92,.1)",
          transform: "scale(1.05, .84) rotate(-8deg)",
          pointerEvents: "none",
        }}
      />

      <div className={styles.waitlistGrid}>
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: 9.5,
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "var(--brass-bright)",
            }}
          >
            More on the way
          </p>
          <h2
            id="waitlist-heading"
            style={{
              margin: "12px 0 0",
              fontFamily: "var(--font-fraunces), serif",
              fontWeight: 500,
              fontSize: "clamp(24px,3vw,33px)",
              lineHeight: 1.14,
              color: "#f6ecd8",
              letterSpacing: "-0.012em",
            }}
          >
            There are more experiences still in the workshop.
          </h2>
          <p style={{ margin: "12px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "rgba(242,233,212,.7)" }}>
            Leave an address and we&apos;ll tell you when the next one is finished.
          </p>
        </div>

        <div>
          <form action={formAction} className={styles.waitlistForm}>
            <input type="hidden" name="source" value={source} />
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              aria-label="Your email address"
              placeholder="you@example.com"
              className={styles.waitlistInput}
            />
            <button type="submit" disabled={pending} className={styles.waitlistBtn}>
              {pending ? "Adding…" : "Join the waitlist"}
            </button>
          </form>

          <p
            role={state && !state.ok ? "alert" : "status"}
            style={{
              margin: "12px 0 0",
              minHeight: 19,
              fontSize: 13,
              lineHeight: 1.5,
              color: state?.ok === false ? "#f0a88c" : "rgba(242,233,212,.66)",
            }}
          >
            {state
              ? state.message
              : "No account needed, and nothing else. Unsubscribe in one click."}
          </p>
        </div>
      </div>
    </section>
  );
}
