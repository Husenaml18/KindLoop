import "server-only";
import { cookies } from "next/headers";

/**
 * Who is halfway through signing in, and which door they came through.
 *
 * The code screen has to know the address the code was sent to — a code alone
 * verifies nothing, since it is only meaningful paired with the identifier it was
 * issued against. Auth.js redirects to that screen itself and carries nothing with
 * it, so the address is written here on the way out.
 *
 * The address is *not* rendered back into the page as an editable value, only as
 * something to check the code against on the server. And it is httpOnly, so a
 * script on the page cannot read which address somebody typed.
 */

const COOKIE = "kl_pending";
const MAX_AGE = 20 * 60;

export type SignInMode = "login" | "signup";

export interface PendingSignIn {
  email: string;
  mode: SignInMode;
  callbackUrl: string;
}

export async function stashPendingSignIn(pending: PendingSignIn): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, JSON.stringify(pending), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function readPendingSignIn(): Promise<PendingSignIn | null> {
  try {
    const raw = (await cookies()).get(COOKIE)?.value;
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { email, mode, callbackUrl } = parsed as Record<string, unknown>;
    if (typeof email !== "string" || !email.includes("@")) return null;
    return {
      email,
      mode: mode === "signup" ? "signup" : "login",
      /* Re-checked rather than trusted: this ends up in a redirect. */
      callbackUrl:
        typeof callbackUrl === "string" &&
        callbackUrl.startsWith("/") &&
        !callbackUrl.startsWith("//")
          ? callbackUrl
          : "/account",
    };
  } catch {
    return null;
  }
}

export async function clearPendingSignIn(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/**
 * The address, with most of it taken out.
 *
 * Shown so somebody can tell at a glance whether they typed it correctly, without
 * printing a full address onto a page that might be open on a shared screen.
 */
export function maskEmail(email: string): string {
  const [user = "", domain = ""] = email.split("@");
  const head = user.slice(0, 2);
  const tail = user.length > 3 ? user.slice(-1) : "";
  return `${head}${"•".repeat(Math.max(1, user.length - head.length - tail.length))}${tail}@${domain}`;
}
