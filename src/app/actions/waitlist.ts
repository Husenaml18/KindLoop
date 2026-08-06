"use server";

import { prisma } from "@/lib/prisma";

/**
 * Joining the waitlist.
 *
 * Deliberately *not* an account. Somebody handing over an address to hear when
 * there's more has not asked to be signed up to anything, so it lands in its own
 * table and creates no `User`.
 *
 * Asking twice is not an error — the same address simply stays on the list, and
 * the answer looks identical either way. Telling somebody "you're already on this
 * list" leaks who is on it to anyone who cares to guess.
 */
export type WaitlistResult = { ok: true; message: string } | { ok: false; message: string };

export async function joinWaitlist(
  _prev: WaitlistResult | null,
  formData: FormData
): Promise<WaitlistResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const source = String(formData.get("source") ?? "footer").slice(0, 40);

  /* Deliberately loose. Rejecting unusual but valid addresses is worse than
     storing the occasional typo. */
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return { ok: false, message: "That doesn't look like an email address." };
  }

  try {
    await prisma.waitlistEntry.upsert({
      where: { email },
      update: {},
      create: { email, source },
    });
  } catch {
    return { ok: false, message: "Couldn't save that just now. Try again in a moment." };
  }

  return {
    ok: true,
    message: "You're on the list. We'll only write when there's something worth saying.",
  };
}
