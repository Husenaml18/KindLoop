import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// A JWT session can outlive the User row it points to (e.g. the dev DB was
// reset while a browser still held a session cookie). Treat that case as
// logged-out rather than letting a stale id hit a foreign-key error.
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({ where: { id: session.user.id } });
}
