import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { deliverMagicLink } from "@/lib/mail";
import { readSignupProfile } from "@/lib/signupProfile";
import { generateCode } from "@/lib/verificationCode";

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
  /*
   * The token is the code.
   *
   * Auth.js keeps one token per address, so rather than inventing a second secret
   * and somewhere to store it, the six characters printed in the email *are* the
   * token in the link. Click the button or type them in and the same row is spent
   * either way — one thing to expire, one thing to invalidate, no second path that
   * could disagree with the first.
   */
  generateVerificationToken: () => generateCode(),
  sendVerificationRequest: async ({
    identifier,
    url,
    token,
    expires,
  }: {
    identifier: string;
    url: string;
    token: string;
    expires: Date;
  }) => {
    await deliverMagicLink({ to: identifier, url, code: token, expires });
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
  events: {
    /*
     * The sign-up form's answers, applied at the only moment the account exists
     * to receive them.
     *
     * Auth.js creates the row when the emailed link is opened, which can be a
     * different device and an hour after the form was filled in — so the name
     * travels in a short-lived cookie and lands here. An event rather than a
     * callback because nothing about sign-in should depend on this working: if
     * the cookie is gone, the account is still made, just without a name on it.
     */
    async createUser({ user }) {
      const profile = await readSignupProfile();
      if (!profile) return;

      const data: { name?: string; gender?: string } = {};
      if (profile.name && !user.name) data.name = profile.name;
      if (profile.gender) data.gender = profile.gender;
      if (Object.keys(data).length === 0) return;

      try {
        await prisma.user.update({ where: { id: user.id }, data });
      } catch {
        /* Never let a nicety break the only way into the product. */
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) token.sub = user.id;

      /* A rename has to reach the session at once, or the header keeps showing
         the old name until the token expires. */
      if (trigger === "update" && typeof session?.name === "string") {
        token.name = session.name;
      }

      /*
       * Fill in the name from the account itself when the token has none.
       *
       * Signing in by email mints this token in the same request that creates
       * the row, and the name arrives a moment later — the sign-up form's answers
       * are applied by the `createUser` event below. So the first token of a new
       * account had no name on it at all, and everything reading the session fell
       * back to initials derived from the email address, while anything reading
       * the database showed initials from the real name. Two different badges for
       * the same person, on the same screen.
       *
       * Read once, when it is missing, and then carried on the token.
       */
      if (!token.name && token.sub) {
        const account = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { name: true, email: true, image: true },
        });
        if (account?.name) token.name = account.name;
        if (account?.email) token.email = account.email;
        if (account?.image) token.picture = account.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user && typeof token.name === "string") session.user.name = token.name;
      if (session.user && typeof token.picture === "string") session.user.image = token.picture;
      return session;
    },
  },
});
