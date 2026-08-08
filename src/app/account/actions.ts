"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { signOut } from "@/lib/auth";
import { deleteGiftFiles } from "@/lib/storage";

/**
 * Account actions.
 *
 * Every one re-checks who is signed in. Server actions are reachable by direct
 * POST regardless of what the interface is showing, so the session is verified
 * here rather than trusted from the page that rendered the form.
 */

export async function renameAccount(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/sign-in?callbackUrl=/account");

  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 280);
  const gender = String(formData.get("gender") ?? "").trim().slice(0, 40);
  await prisma.user.update({
    where: { id: user.id },
    /* Empty clears the column rather than storing "". Whatever somebody put here
       is theirs to take back, and a blank string is not the same as blank. */
    data: { name: name || null, bio: bio || null, gender: gender || null },
  });

  revalidatePath("/account");
  revalidatePath("/dashboard");
}

/** Remove a single gift, and the files that belonged to it. */
export async function deleteGift(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/sign-in?callbackUrl=/dashboard");

  const giftId = String(formData.get("giftId") ?? "");
  if (!giftId) return;

  /* Scoped to the owner, so a guessed id deletes nothing. */
  const { count } = await prisma.gift.deleteMany({
    where: { id: giftId, ownerId: user.id },
  });
  if (count > 0) await removeUploads(giftId);

  revalidatePath("/dashboard");
}

/**
 * Delete the account and everything in it.
 *
 * The database cascades from `User` through accounts, sessions, gifts and orders,
 * but nothing cascades to disk — so the uploaded photographs and recordings are
 * removed explicitly first. Leaving somebody's photographs on a server after they
 * asked to be forgotten is not an acceptable way to fail.
 */
export async function deleteAccount(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/sign-in");

  /* Typed confirmation, so this cannot happen by a stray click or a double submit. */
  const confirmation = String(formData.get("confirm") ?? "").trim().toLowerCase();
  if (confirmation !== "delete") {
    redirect("/account?error=confirm");
  }

  const gifts = await prisma.gift.findMany({
    where: { ownerId: user.id },
    select: { id: true },
  });
  for (const gift of gifts) await removeUploads(gift.id);

  await prisma.user.delete({ where: { id: user.id } });
  await signOut({ redirectTo: "/?farewell=1" });
}

/**
 * Best-effort: whatever is gone is the desired end state anyway.
 *
 * Delegated to the storage driver so deleting an account removes the files
 * wherever they actually live. Deleting used to reach into `uploads/` directly,
 * which silently did nothing once files moved to blob storage — the row would
 * vanish and the photographs would not, which is precisely the promise the
 * privacy policy makes and the one worst to break.
 */
async function removeUploads(giftId: string) {
  await deleteGiftFiles(giftId);
}
