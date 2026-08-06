import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { deliverMagicLink } from "@/lib/mail";

export const hasGoogleAuth = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

/**
 * A sign-in link, sent to an address.
 *
 * Written as a plain provider object rather than imported: the `email` provider
 * export is a deprecated wrapper around nodemailer, and the only part that
 * actually matters here — how the link is delivered — is ours. This keeps the
 * mail dependency at zero.
 *
 * Fifteen minutes is deliberate. Long enough to go and find the email, short
 * enough that a link left sitting in an inbox is not a standing key to somebody's
 * letters.
 */
const emailProvider = {
  id: "email",
  type: "email",
  name: "Email",
  from: process.env.AUTH_EMAIL_FROM ?? "Kindloop <onboarding@resend.dev>",
  maxAge: 15 * 60,
  options: {},
  /* Compared as stored, so addresses are lowercased and trimmed on the way in —
     otherwise "Ann@x.com" and "ann@x.com" become two separate accounts. */
  normalizeIdentifier: (identifier: string) => identifier.trim().toLowerCase(),
  sendVerificationRequest: async ({
    identifier,
    url,
    expires,
  }: {
    identifier: string;
    url: string;
    expires: Date;
  }) => {
    await deliverMagicLink({ to: identifier, url, expires });
  },
} satisfies Provider;

/**
 * The local shortcut.
 *
 * Constructed only outside production *and* only when Google isn't configured, so
 * it cannot exist in a production build whatever the environment contains. Still
 * useful now that email sign-in works, because it skips the trip through an inbox.
 */
const devMockProvider =
  process.env.NODE_ENV !== "production" && !hasGoogleAuth
    ? Credentials({
        id: "dev-mock",
        name: "Dev User",
        credentials: {},
        async authorize() {
          const user = await prisma.user.upsert({
            where: { email: "dev@kindloop.local" },
            update: {},
            create: {
              email: "dev@kindloop.local",
              name: "Dev User",
              isDevMock: true,
            },
          });
          return user;
        },
      })
    : null;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    ...(hasGoogleAuth ? [Google] : []),
    emailProvider,
    ...(devMockProvider ? [devMockProvider] : []),
  ],
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/sign-in/check-your-email",
    error: "/sign-in/problem",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) token.sub = user.id;
      /* A rename has to reach the session at once, or the header keeps showing
         the old name until the token expires. */
      if (trigger === "update" && typeof session?.name === "string") {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user && typeof token.name === "string") session.user.name = token.name;
      return session;
    },
  },
});
