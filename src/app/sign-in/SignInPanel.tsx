"use client";

import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "next/navigation";

/**
 * The sign-in panel.
 *
 * Client-side only for the email field's own state — the actual sign-in calls are
 * server actions handed down as props, so no credential or provider detail is
 * shipped to the browser.
 */

const label: CSSProperties = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: 9.5,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: "var(--label-on-paper)",
};

/**
 * What went wrong, in words a person can act on.
 *
 * Auth.js hands back machine codes; showing "OAuthAccountNotLinked" to somebody
 * trying to see a letter is a dead end, so each one is translated into the actual
 * problem and the actual next step.
 */
const PROBLEMS: Record<string, string> = {
  OAuthAccountNotLinked:
    "That email already has an account here, made a different way. Sign in the way you did the first time.",
  Verification:
    "That link has already been used, or it expired. They only last fifteen minutes — here's a fresh one.",
  AccessDenied: "That sign-in was cancelled. Nothing happened.",
  Configuration: "Something's wrong at our end with sign-in. It isn't you.",
  EmailSignin: "We couldn't send that email. Check the address and try again.",
  CredentialsSignin: "That didn't work. Try again.",
  Default: "That didn't work. Try again.",
};

export function SignInPanel({
  hasGoogle,
  hasDevMock,
  signInWithGoogle,
  signInWithEmail,
  signInAsDev,
}: {
  hasGoogle: boolean;
  hasDevMock: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (formData: FormData) => Promise<void>;
  signInAsDev: () => Promise<void>;
}) {
  const params = useSearchParams();
  const error = params.get("error");
  /* Carried back from the server when there is no account, so the address is not
     typed a second time on the way to the other screen. */
  const known = params.get("email") ?? "";
  const [email, setEmail] = useState(known);
  const [sending, setSending] = useState(false);

  const noAccount = error === "nouser";
  const problem = error && !noAccount ? (PROBLEMS[error] ?? PROBLEMS.Default) : null;

  return (
    /* No card. In the split layout the form sits on the page itself — a panel
       inside a panel is one border too many, and the picture beside it is already
       doing the work a card was there to do. */
    <div className="w-full">
      <h1
        className="m-0 text-center"
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontWeight: 500,
          fontSize: 26,
          lineHeight: 1.18,
          letterSpacing: "-0.012em",
          color: "var(--ink)",
        }}
      >
        Log in
      </h1>
      <p
        className="m-0 mt-2 text-center"
        style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-muted)" }}
      >
        Welcome back. We&apos;ll email you a link — there&apos;s no password.
      </p>

      {noAccount && (
        <div
          role="alert"
          className="mt-5 rounded-lg px-4 py-3.5 text-center"
          style={{
            background: "var(--khaki-pale)",
            border: "1px solid rgba(122,92,62,.34)",
          }}
        >
          <p className="m-0" style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink)" }}>
            There&apos;s no account under{" "}
            <strong style={{ fontWeight: 600 }}>{known || "that address"}</strong> yet.
          </p>
          <Link
            href={`/sign-up${known ? `?email=${encodeURIComponent(known)}` : ""}`}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-lg px-5 no-underline"
            style={{ background: "var(--brass)", color: "var(--on-dark)", fontSize: 13.5, fontWeight: 500 }}
          >
            Make one — it takes a minute
          </Link>
        </div>
      )}

      {problem && (
        <p
          role="alert"
          className="m-0 mt-5 rounded-lg px-3.5 py-3"
          style={{ background: "#f7e3da", border: "1px solid rgba(138,58,30,.3)", fontSize: 13, lineHeight: 1.55, color: "#8a3a1e" }}
        >
          {problem}
        </p>
      )}

      {hasGoogle && (
        <>
          <form action={signInWithGoogle} className="mt-6">
            <button
              type="submit"
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg font-medium"
              style={{
                background: "var(--paper)",
                border: "1px solid rgba(43,32,19,.2)",
                color: "var(--ink)",
                fontSize: 14,
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden>
                <path fill="currentColor" d="M21.35 11.1h-9.17v2.98h5.27c-.23 1.37-1.6 4.02-5.27 4.02-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.78 3.9 14.72 3 12.18 3 7.03 3 2.86 7.17 2.86 12.25s4.17 9.25 9.32 9.25c5.38 0 8.94-3.78 8.94-9.1 0-.61-.07-1.08-.17-1.3Z" />
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1" style={{ background: "rgba(43,32,19,.14)" }} />
            <span style={label}>or</span>
            <span className="h-px flex-1" style={{ background: "rgba(43,32,19,.14)" }} />
          </div>
        </>
      )}

      <form
        action={signInWithEmail}
        onSubmit={() => setSending(true)}
        className={hasGoogle ? "" : "mt-6"}
      >
        <label className="block">
          <span className="mb-1.5 block" style={label}>Your email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 w-full rounded-lg px-3.5 text-[14px] outline-none"
            style={{
              background: "#fffdf7",
              border: "1px solid rgba(43,32,19,.18)",
              color: "var(--ink)",
              fontFamily: "var(--font-space-grotesk), sans-serif",
            }}
          />
        </label>
        <button
          type="submit"
          disabled={sending || email.trim().length === 0}
          /* The email link is the primary way in whether or not Google is
             configured — it is the one that needs no account anywhere else. */
          className="mt-3.5 flex h-11 w-full cursor-pointer items-center justify-center rounded-lg border-0 font-medium disabled:cursor-default disabled:opacity-45"
          style={{
            background: "var(--brass)",
            color: "var(--on-dark)",
            fontSize: 14,
            boxShadow: "0 10px 22px -14px rgba(46,30,14,.9)",
          }}
        >
          {sending ? "Sending…" : "Email me a code"}
        </button>
      </form>

      <p
        className="m-0 mt-3.5 text-center"
        style={{ fontSize: 12, lineHeight: 1.55, color: "var(--ink-faint)" }}
      >
        No password to make up or forget. The link works once and expires in
        fifteen minutes.
      </p>

      <p
        className="m-0 mt-6 text-center"
        style={{ fontSize: 13, color: "var(--ink-muted)" }}
      >
        New here?{" "}
        <Link href="/sign-up" style={{ color: "var(--rust)", fontWeight: 500 }}>
          Make an account
        </Link>
      </p>

      {hasDevMock && (
        <>
          <div className="my-5 h-px" style={{ background: "rgba(43,32,19,.12)" }} />
          <form action={signInAsDev}>
            <button
              type="submit"
              className="h-10 w-full cursor-pointer rounded-lg border bg-transparent"
              style={{ borderColor: "rgba(43,32,19,.2)", color: "var(--ink-muted)", fontSize: 13 }}
            >
              Continue as Dev User
            </button>
          </form>
          <p className="m-0 mt-2.5" style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--ink-faint)" }}>
            Local shortcut, shown because no Google credentials are set. It cannot
            exist in a production build.
          </p>
        </>
      )}
    </div>
  );
}
