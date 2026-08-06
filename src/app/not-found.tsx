import type { Metadata } from "next";
import { AccountMenu, isSignedIn } from "@/app/AccountMenu";
import { NotFoundScene } from "@/app/NotFoundScene";

export const metadata: Metadata = {
  title: "This memory wandered off — Kindloop",
  description: "The page you were looking for isn't here. Here are some that are.",
  /* Nothing here should be indexed, but the links out of it should still be
     followed — the shelf is eight real experiences. */
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const signedIn = await isSignedIn();
  return <NotFoundScene signedIn={signedIn} account={<AccountMenu />} />;
}
