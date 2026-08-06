import Link from "next/link";
import { hasMailer } from "@/lib/mail";
import { readPendingSignIn, maskEmail } from "@/lib/pendingSignIn";
import { AuthShell } from "../AuthShell";
import { CodeEntry } from "./CodeEntry";

export const metadata = { title: "Enter your code — Kindloop" };

/**
 * The second half of signing in.
 *
 * The email carries a code and a link, and this is where the code is spent. Both
 * end at the same Auth.js callback with the same single-use token, so whichever
 * one somebody reaches for, the other stops working — there is no second path to
 * keep in step.
 *
 * The address is never rendered as an input. It is read from an httpOnly cookie on
 * the server, shown only as a masked reminder, and paired with the code by
 * `/api/sign-in/code` — so this page cannot be used to submit a code against
 * somebody else's address.
 */
export default async function CheckYourEmailPage(
  props: PageProps<"/sign-in/check-your-email">
) {
  const searchParams = await props.searchParams;
  const failed = searchParams.error === "code";
  const pending = await readPendingSignIn();

  const signingUp = pending?.mode === "signup";

  return (
    <AuthShell>
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
          {signingUp ? "Confirm your email" : "Enter your code"}
        </h1>
        <p
          className="m-0 mt-2 text-center"
          style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-muted)" }}
        >
          {pending ? (
            <>
              Six characters, sent to{" "}
              <strong style={{ color: "var(--ink)", fontWeight: 500 }}>
                {maskEmail(pending.email)}
              </strong>
              .
            </>
          ) : (
            <>Six characters, sent to your email.</>
          )}
        </p>

        {failed && (
          <p
            role="alert"
            className="m-0 mt-5 rounded-lg px-3.5 py-3 text-center"
            style={{
              background: "#f7e3da",
              border: "1px solid rgba(138,58,30,.3)",
              fontSize: 13,
              lineHeight: 1.55,
              color: "#8a3a1e",
            }}
          >
            That code didn&apos;t work. Check it against the email, or ask for a
            fresh one below.
          </p>
        )}

        <div className="mt-6">
          <CodeEntry />
        </div>

        <p
          className="m-0 mt-4 text-center"
          style={{ fontSize: 12, lineHeight: 1.6, color: "var(--ink-faint)" }}
        >
          Or press the button in the email — it does the same thing. Either one
          works once and expires in fifteen minutes.
        </p>

        {!hasMailer && (
          <p
            className="m-0 mt-5 rounded-lg px-3.5 py-3"
            style={{
              background: "var(--khaki-pale)",
              border: "1px solid rgba(122,92,62,.3)",
              fontSize: 12.5,
              lineHeight: 1.6,
              color: "var(--ink)",
            }}
          >
            <strong style={{ fontWeight: 600 }}>Running locally:</strong> no mail
            provider is configured, so the code was printed in the terminal running
            the dev server. Set <code>SMTP_HOST</code> (or{" "}
            <code>AUTH_RESEND_KEY</code>) in <code>.env</code> to send it for real.
          </p>
        )}

        <p
          className="m-0 mt-6 text-center"
          style={{ fontSize: 13, color: "var(--ink-muted)" }}
        >
          <Link
            href={signingUp ? "/sign-up" : "/sign-in"}
            style={{ color: "var(--rust)", fontWeight: 500 }}
          >
            Send it again
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
