import Link from "next/link";
import { AuthShell } from "../AuthShell";

export const metadata = { title: "Sign-in problem — Kindloop" };

/**
 * Auth.js redirects here with a machine code. Each one is translated into what
 * actually happened and what to do next — a person who came to read a letter
 * should never be shown the string "OAuthAccountNotLinked".
 */
const PROBLEMS: Record<string, { title: string; body: string }> = {
  Configuration: {
    title: "Sign-in is misconfigured",
    body: "Something is wrong at our end, not yours. Nothing you did caused this.",
  },
  AccessDenied: {
    title: "That was cancelled",
    body: "The sign-in didn't complete, so nothing changed. You can try again whenever you like.",
  },
  Verification: {
    title: "That link has expired",
    body: "Sign-in links last fifteen minutes and work once. Ask for a fresh one and it'll be waiting in a moment.",
  },
  OAuthAccountNotLinked: {
    title: "That email is already in use",
    body: "There's an account with this address, created a different way. Sign in the way you did the first time and it'll be the same account.",
  },
  Default: {
    title: "That didn't work",
    body: "Something went wrong signing you in. Trying once more usually sorts it.",
  },
};

export default async function SignInProblemPage(props: PageProps<"/sign-in/problem">) {
  const searchParams = await props.searchParams;
  const code = typeof searchParams.error === "string" ? searchParams.error : "Default";
  const problem = PROBLEMS[code] ?? PROBLEMS.Default;

  return (
    <AuthShell>
      <div className="w-full text-center">
        <h1
          className="m-0"
          style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 500, fontSize: 26, lineHeight: 1.18, letterSpacing: "-0.012em", color: "var(--ink)" }}
        >
          {problem.title}
        </h1>
        <p className="m-0 mt-3" style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink-muted)" }}>
          {problem.body}
        </p>

        <Link
          href="/sign-in"
          className="mt-6 flex h-11 w-full items-center justify-center rounded-lg no-underline"
          style={{ background: "var(--brass)", color: "var(--on-dark)", fontSize: 14, fontWeight: 500, boxShadow: "0 10px 22px -14px rgba(46,30,14,.9)" }}
        >
          Try again
        </Link>
        <Link
          href="/"
          className="mt-3 block text-center no-underline"
          style={{ fontSize: 13, color: "var(--ink-faint)" }}
        >
          Back to the start
        </Link>
      </div>
    </AuthShell>
  );
}
