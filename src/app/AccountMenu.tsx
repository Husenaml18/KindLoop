import { auth, signOut } from "@/lib/auth";
import { initialsFor } from "@/lib/initials";
import { AccountMenuClient } from "./AccountMenuClient";

/**
 * Who's signed in, and the way out.
 *
 * A server component, so the session is read on the server and only two initials
 * plus the menu's own contents reach the browser. Returns `null` when signed out —
 * the header decides what to show instead, which keeps the "Log in" call to action
 * in one place rather than two.
 */
export async function AccountMenu() {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  async function endSession() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <AccountMenuClient
      initials={initialsFor(user.name, user.email)}
      name={user.name ?? null}
      email={user.email ?? null}
      image={user.image ?? null}
      signOutAction={endSession}
    />
  );
}

/** Whether anybody is signed in, for the header's benefit. */
export async function isSignedIn(): Promise<boolean> {
  const session = await auth();
  return Boolean(session?.user);
}
