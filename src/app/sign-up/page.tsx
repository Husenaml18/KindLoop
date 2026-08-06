import { signIn, hasGoogleAuth } from "@/lib/auth";
import { stashSignupProfile } from "@/lib/signupProfile";
import { stashPendingSignIn } from "@/lib/pendingSignIn";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AuthShell } from "../sign-in/AuthShell";
import { SignUpPanel } from "./SignUpPanel";

export const metadata = {
  title: "Make an account — Kindloop",
  description:
    "One account, so you can come back and edit what you've made. Whoever you send a gift to never needs one.",
};

/** Only same-origin paths, so a query string can't redirect a fresh session away. */
function safeCallback(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/account";
  }
  return raw;
}

export default async function SignUpPage(props: PageProps<"/sign-up">) {
  const searchParams = await props.searchParams;
  const callbackUrl = safeCallback(searchParams.callbackUrl);
  const knownEmail =
    typeof searchParams.email === "string" ? searchParams.email.slice(0, 160) : "";
  const alreadyExists = searchParams.error === "exists";

  async function signUpWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl });
  }

  async function signUpWithEmail(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!email) return;

    /* The mirror of the check on the log-in screen: there is nothing to create,
       and the name they just typed would be thrown away against an account that
       already has one. */
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      redirect(`/sign-up?error=exists&email=${encodeURIComponent(email)}`);
    }

    /* Written before the link goes out, because the account it belongs to will
       not exist until that link is opened. See `signupProfile`. */
    await stashSignupProfile({
      name: String(formData.get("name") ?? ""),
      gender: String(formData.get("gender") ?? ""),
    });
    await stashPendingSignIn({ email, mode: "signup", callbackUrl });

    await signIn("email", { email, redirectTo: callbackUrl });
  }

  return (
    <AuthShell>
      <SignUpPanel
        hasGoogle={hasGoogleAuth}
        knownEmail={knownEmail}
        alreadyExists={alreadyExists}
        signUpWithGoogle={signUpWithGoogle}
        signUpWithEmail={signUpWithEmail}
      />
    </AuthShell>
  );
}
