import type { Metadata } from "next";
import LandingPage from "./LandingPage";
import { getGiftPhotos } from "@/lib/giftPhotos";
import { AccountMenu, isSignedIn } from "./AccountMenu";

export const metadata: Metadata = {
  title: "Kindloop — Turn feelings into something they'll keep forever",
  description:
    "Kindloop turns your photos, letters and voice into a private link someone can open in any browser. A memory, not a greeting card.",
};

export default async function Home() {
  const [photos, signedIn] = await Promise.all([getGiftPhotos(24), isSignedIn()]);
  return <LandingPage photos={photos} accountMenu={<AccountMenu />} signedIn={signedIn} />;
}
