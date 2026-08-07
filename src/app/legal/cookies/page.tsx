import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, P, Plainly, Section } from "../LegalPage";

export const metadata: Metadata = {
  title: "Cookie policy — Kindloop",
  description:
    "Kindloop sets five cookies, all of them necessary for signing in. There are no tracking or advertising cookies.",
};

/**
 * Enumerated from the code, not from a template.
 *
 * `kl_pending` and `kl_signup` are set in `src/lib/pendingSignIn.ts` and
 * `src/lib/signupProfile.ts`; the three `authjs.*` cookies come from Auth.js with
 * the JWT session strategy configured in `src/lib/auth.ts`. If a cookie is added
 * to the product, it belongs in this table on the same commit — a cookie policy
 * that lists four of five cookies is not a shorter policy, it is a wrong one.
 */

const COOKIES = [
  {
    name: "authjs.session-token",
    what: "Keeps you signed in. Holds a signed token identifying your account — not your email or name.",
    life: "30 days, or until you sign out",
  },
  {
    name: "authjs.csrf-token",
    what: "Stops another site from submitting a sign-in on your behalf. A standard security measure.",
    life: "The browser session",
  },
  {
    name: "authjs.callback-url",
    what: "Remembers the page you were on, so signing in returns you there instead of the home page.",
    life: "The browser session",
  },
  {
    name: "kl_pending",
    what: "Holds the address you just asked a code to be sent to, so the code screen has something to check it against. Not readable by scripts on the page.",
    life: "20 minutes",
  },
  {
    name: "kl_signup",
    what: "Holds the name you typed on the sign-up form until the emailed link is opened and the account actually exists to attach it to.",
    life: "20 minutes",
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      active="/legal/cookies"
      title="Cookie policy"
      summary="Kindloop sets five cookies. All five exist to sign you in and keep you signed in. There are no analytics cookies, no advertising cookies, and nothing from a third party."
    >
      <Section n="01" title="Why there is no cookie banner">
        <P>
          Consent banners exist because of tracking. Cookies that are strictly
          necessary to provide a service somebody asked for do not require consent
          under the ePrivacy rules or the GDPR — and every cookie Kindloop sets is one
          of those.
        </P>
        <Plainly>
          We are not asking permission to track you because we are not tracking you.
          If that ever changes, a banner appears and this page changes with it.
        </Plainly>
      </Section>

      <Section n="02" title="Every cookie, in full">
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
            <thead>
              <tr>
                {["Cookie", "What it does", "How long"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "0 12px 10px 0",
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      fontSize: 9.5,
                      letterSpacing: ".16em",
                      textTransform: "uppercase",
                      color: "var(--label-on-paper)",
                      borderBottom: "1px solid rgba(58,42,24,.16)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((c) => (
                <tr key={c.name}>
                  <td
                    style={{
                      padding: "14px 12px 14px 0",
                      verticalAlign: "top",
                      borderBottom: "1px solid rgba(58,42,24,.1)",
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      fontSize: 12,
                      color: "var(--ink)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.name}
                  </td>
                  <td
                    style={{
                      padding: "14px 12px 14px 0",
                      verticalAlign: "top",
                      borderBottom: "1px solid rgba(58,42,24,.1)",
                      fontSize: 14.5,
                      lineHeight: 1.65,
                      color: "var(--ink-muted)",
                    }}
                  >
                    {c.what}
                  </td>
                  <td
                    style={{
                      padding: "14px 0",
                      verticalAlign: "top",
                      borderBottom: "1px solid rgba(58,42,24,.1)",
                      fontSize: 14,
                      color: "var(--ink-faint)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.life}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section n="03" title="What we do not set">
        <P>
          No analytics cookies. No advertising or retargeting cookies. No social
          media pixels. No session recording. No cookie belonging to a third party at
          all — every one in the table above is set by Kindloop itself.
        </P>
        <P>
          Opening a gift sets no cookie whatsoever. Somebody who follows a link you
          sent them and reads what you wrote leaves this site exactly as they arrived.
        </P>
      </Section>

      <Section n="04" title="Turning them off">
        <P>
          Every browser lets you block or clear cookies, usually under Privacy or Site
          settings. You are welcome to — with one consequence worth knowing: blocking
          them means you cannot sign in, because staying signed in is the only thing
          they do. Everything you can reach without an account, including opening a
          gift somebody sent you, works with cookies blocked entirely.
        </P>
      </Section>

      <Section n="05" title="Storage other than cookies">
        <P>
          Kindloop does not use local storage, session storage or IndexedDB to track
          anything about you. Some experiences remember where you were in them for the
          length of the page visit; that lives in memory and is gone when the tab
          closes.
        </P>
        <P>
          Questions about any of this, or something in the table that does not match
          what you see in your browser?{" "}
          <Link href="/contact" style={{ color: "var(--rust)", fontWeight: 500 }}>
            Tell us
          </Link>{" "}
          — that would be a bug in this page, and we would want to fix it.
        </P>
      </Section>
    </LegalPage>
  );
}
