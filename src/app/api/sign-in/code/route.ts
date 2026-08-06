import { NextResponse } from "next/server";
import { readPendingSignIn } from "@/lib/pendingSignIn";
import { normalizeCode, CODE_LENGTH } from "@/lib/verificationCode";

/**
 * Spending the code from the email.
 *
 * A route handler rather than a Server Action, and that is the whole reason this
 * file exists. The action version threw "an unexpected response was received from
 * the server": an action's reply is a serialised result the client runtime applies
 * itself, and it has no way to express *"stop, and hand this browser to a different
 * endpoint that will set a session cookie and redirect again"*. A plain form post
 * has expressed exactly that since 1995 — the browser follows a 303 and everything
 * downstream behaves as if the link in the email had been clicked, because it is
 * now literally the same request.
 *
 * Nothing is verified here. The code goes to Auth.js's own callback, which knows
 * how the token was hashed, enforces the expiry, and deletes the row so it cannot
 * be spent twice. A second opinion on whether somebody is signed in is not
 * something this codebase should have.
 */
export async function POST(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin;
  const back = new URL("/sign-in/check-your-email", origin);

  const pending = await readPendingSignIn();
  if (!pending) {
    /* The cookie has expired, so there is no address to check a code against. */
    return NextResponse.redirect(new URL("/sign-in", origin), 303);
  }

  const form = await request.formData();
  const code = normalizeCode(String(form.get("code") ?? ""));
  if (code.length !== CODE_LENGTH) {
    back.searchParams.set("error", "code");
    return NextResponse.redirect(back, 303);
  }

  const callback = new URL("/api/auth/callback/email", origin);
  callback.searchParams.set("token", code);
  callback.searchParams.set("email", pending.email);
  callback.searchParams.set("callbackUrl", pending.callbackUrl);

  return NextResponse.redirect(callback, 303);
}
