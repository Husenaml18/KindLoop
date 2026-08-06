import { signIn, hasGoogleAuth } from "@/lib/auth";

export default async function SignInPage(props: PageProps<"/sign-in">) {
  const searchParams = await props.searchParams;
  const callbackUrl =
    typeof searchParams.callbackUrl === "string"
      ? searchParams.callbackUrl
      : "/dashboard";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 py-24 dark:bg-black">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-black/[.08] bg-white p-8 text-center dark:border-white/[.145] dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Sign in to Kindloop
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to create and manage your gifts.
        </p>

        {hasGoogleAuth ? (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: callbackUrl });
            }}
          >
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-5 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Continue with Google
            </button>
          </form>
        ) : (
          <>
            <form
              action={async () => {
                "use server";
                await signIn("dev-mock", { redirectTo: callbackUrl });
              }}
            >
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-5 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
              >
                Continue as Dev User
              </button>
            </form>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Dev mode: no Google OAuth credentials configured yet. Set
              AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET in .env to enable real
              Google sign-in.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
