import type { Metadata } from "next";
import LandingPage from "./LandingPage";
import { getGiftPhotos } from "@/lib/giftPhotos";

export const metadata: Metadata = {
  title: "Kindloop — Turn feelings into something they'll keep forever",
  description:
    "Kindloop turns your photos, letters and voice into a private link someone can open in any browser. A memory, not a greeting card.",
};

export default async function Home() {
  const photos = await getGiftPhotos(24);
  return <LandingPage photos={photos} />;
}
