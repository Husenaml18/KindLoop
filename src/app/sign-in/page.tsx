import { Suspense } from "react";
import { signIn, hasGoogleAuth } from "@/lib/auth";
import { stashPendingSignIn } from "@/lib/pendingSignIn";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AuthShell } from "./AuthShell";
import { SignInPanel } from "./SignInPanel";

export const metadata = {
  title: "Log in — Kindloop",
  description: "Sign in to make something. Anyone you send a gift to opens it without an account.",
};

/**
 * Where the callback is allowed to send somebody afterwards.
 *
 * Only same-origin paths. A `callbackUrl` arrives in the query string, so without
 * this an emailed link could carry somebody straight off to another site wearing a
 * freshly-issued session.
 */
function safeCallback(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

export default async function SignInPage(props: PageProps<"/sign-in">) {
  const searchParams = await props.searchParams;
  const callbackUrl = safeCallback(searchParams.callbackUrl);

  /* The mock is offered on exactly the same terms it is constructed on. */
  const hasDevMock = process.env.NODE_ENV !== "production" && !hasGoogleAuth;

  async function signInWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl });
  }

  async function signInWithEmail(formData: FormData) {
    "use server";
    /* Lowercased to match how the provider stores it, or "Ann@x.com" looks like a
       stranger to an account created as "ann@x.com". */
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!email) return;

    /*
     * Logging in is for people who already have an account.
     *
     * Without this check the email provider quietly creates one, so a typo in an
     * address doesn't fail — it succeeds into an empty account that isn't yours,
     * with none of your gifts in it and no explanation of why. Sending somebody to
     * sign up is the honest answer to "there is nothing here under that address".
     *
     * The trade this makes: the page now confirms whether an address has an
     * account here, which it previously did not. That is a real disclosure and a
     * deliberate one — the alternative is a sign-in that silently does something
     * other than signing you in.
     */
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!existing) {
      redirect(`/sign-in?error=nouser&email=${encodeURIComponent(email)}`);
    }

    /* The code screen needs the address to check a code against, and Auth.js
       redirects there carrying nothing of its own. */
    await stashPendingSignIn({ email, mode: "login", callbackUrl });
    await signIn("email", { email, redirectTo: callbackUrl });
  }

  async function signInAsDev() {
    "use server";
    await signIn("dev-mock", { redirectTo: callbackUrl });
  }

  return (
    <AuthShell>
      {/* useSearchParams needs a boundary; the panel is the only client part. */}
      <Suspense fallback={null}>
        <SignInPanel
          hasGoogle={hasGoogleAuth}
          hasDevMock={hasDevMock}
          signInWithGoogle={signInWithGoogle}
          signInWithEmail={signInWithEmail}
          signInAsDev={signInAsDev}
        />
      </Suspense>
    </AuthShell>
  );
}
