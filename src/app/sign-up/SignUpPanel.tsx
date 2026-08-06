"use client";

import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";

/**
 * Making an account.
 *
 * Two fields are required and one is not, which is the whole design. Every extra
 * question on a sign-up form costs some proportion of the people filling it in,
 * and the only thing Kindloop genuinely needs is an address to send the link to.
 * The name is asked for because it is used — it signs the gifts you make, and
 * "from" with nothing after it is worse than one more field.
 */

const label: CSSProperties = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: 9.5,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: "var(--label-on-paper)",
};

const field: CSSProperties = {
  background: "#fffdf7",
  border: "1px solid rgba(43,32,19,.18)",
  color: "var(--ink)",
  fontFamily: "var(--font-space-grotesk), sans-serif",
};

/**
 * Free text with suggestions, rather than a closed list.
 *
 * A `<select>` here forces a decision about which options exist and puts everyone
 * else in "other", which is a worse answer than the one they'd have written. This
 * takes whatever somebody types, including nothing.
 */
const GENDER_SUGGESTIONS = ["Woman", "Man", "Non-binary", "Prefer not to say"];

export function SignUpPanel({
  hasGoogle,
  knownEmail = "",
  alreadyExists = false,
  signUpWithGoogle,
  signUpWithEmail,
}: {
  hasGoogle: boolean;
  /** Carried over from the log-in screen, so nobody types it twice. */
  knownEmail?: string;
  alreadyExists?: boolean;
  signUpWithGoogle: () => Promise<void>;
  signUpWithEmail: (formData: FormData) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(knownEmail);
  const [sending, setSending] = useState(false);

  const ready = name.trim().length > 0 && email.trim().length > 0;

  return (
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
        Make an account
      </h1>
      <p
        className="m-0 mt-2 text-center"
        style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-muted)" }}
      >
        You only need one to make something. Whoever you send it to opens it
        without one.
      </p>

      {alreadyExists && (
        <div
          role="alert"
          className="mt-5 rounded-lg px-4 py-3.5 text-center"
          style={{ background: "var(--khaki-pale)", border: "1px solid rgba(122,92,62,.34)" }}
        >
          <p className="m-0" style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink)" }}>
            <strong style={{ fontWeight: 600 }}>{knownEmail || "That address"}</strong>{" "}
            already has an account. Nothing was changed.
          </p>
          <Link
            href={`/sign-in${knownEmail ? `?email=${encodeURIComponent(knownEmail)}` : ""}`}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-lg px-5 no-underline"
            style={{ background: "var(--brass)", color: "var(--on-dark)", fontSize: 13.5, fontWeight: 500 }}
          >
            Log in instead
          </Link>
        </div>
      )}

      {hasGoogle && (
        <>
          <form action={signUpWithGoogle} className="mt-6">
            <button
              type="submit"
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg font-medium"
              style={{ background: "var(--paper)", border: "1px solid rgba(43,32,19,.2)", color: "var(--ink)", fontSize: 14 }}
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
        action={signUpWithEmail}
        onSubmit={() => setSending(true)}
        className={hasGoogle ? "" : "mt-6"}
      >
        <label className="block">
          <span className="mb-1.5 block" style={label}>Your name</span>
          <input
            type="text"
            name="name"
            required
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should the gifts be signed?"
            className="h-11 w-full rounded-lg px-3.5 text-[14px] outline-none"
            style={field}
          />
        </label>

        <label className="mt-4 block">
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
            style={field}
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 flex items-center gap-2" style={label}>
            Gender
            <span style={{ letterSpacing: 0, textTransform: "none", opacity: 0.75 }}>
              optional
            </span>
          </span>
          <input
            type="text"
            name="gender"
            maxLength={40}
            list="kl-gender"
            placeholder="However you'd put it"
            className="h-11 w-full rounded-lg px-3.5 text-[14px] outline-none"
            style={field}
          />
          <datalist id="kl-gender">
            {GENDER_SUGGESTIONS.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </label>
        <p className="m-0 mt-1.5" style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--ink-faint)" }}>
          Nothing in Kindloop changes based on this, and nobody but you ever sees
          it. Leave it blank and nothing is missing.
        </p>

        <button
          type="submit"
          disabled={sending || !ready}
          className="mt-5 flex h-11 w-full cursor-pointer items-center justify-center rounded-lg border-0 font-medium disabled:cursor-default disabled:opacity-45"
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
        Already have an account?{" "}
        <Link href="/sign-in" style={{ color: "var(--rust)", fontWeight: 500 }}>
          Log in
        </Link>
      </p>
    </div>
  );
}
