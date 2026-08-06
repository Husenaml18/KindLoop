import "server-only";
import { cookies } from "next/headers";

/**
 * Carrying what somebody typed on the sign-up form across the magic link.
 *
 * The awkward shape of passwordless sign-up: the form asks for a name, but the
 * account does not exist yet and will not until a link in an inbox is opened,
 * possibly on a different device, possibly an hour later. There is nothing to
 * write the name *to* at the moment it is given.
 *
 * So it waits in a short-lived cookie and is applied by the `createUser` event the
 * moment the account is actually made. Twenty minutes, because the link it is
 * travelling with expires in fifteen.
 *
 * Deliberately not signed or encrypted, and deliberately holding nothing that
 * matters: a name and an optional word about how somebody would like to be
 * referred to. The worst a forged cookie achieves is putting a made-up name on an
 * account the forger is signing into themselves, which they could type anyway.
 * Nothing here grants access to anything.
 */

const COOKIE = "kl_signup";
const MAX_AGE = 20 * 60;

export interface SignupProfile {
  name?: string;
  gender?: string;
}

export async function stashSignupProfile(profile: SignupProfile): Promise<void> {
  const trimmed: SignupProfile = {
    name: profile.name?.trim().slice(0, 80) || undefined,
    gender: profile.gender?.trim().slice(0, 40) || undefined,
  };
  if (!trimmed.name && !trimmed.gender) return;

  const jar = await cookies();
  jar.set(COOKIE, JSON.stringify(trimmed), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * Read it back. Returns nothing rather than throwing on anything unexpected — a
 * malformed cookie must never be the reason an account fails to be created.
 */
export async function readSignupProfile(): Promise<SignupProfile | null> {
  try {
    const jar = await cookies();
    const raw = jar.get(COOKIE)?.value;
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { name, gender } = parsed as Record<string, unknown>;
    return {
      name: typeof name === "string" ? name.slice(0, 80) : undefined,
      gender: typeof gender === "string" ? gender.slice(0, 40) : undefined,
    };
  } catch {
    return null;
  }
}
