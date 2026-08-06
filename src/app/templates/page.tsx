import type { Metadata } from "next";
import { TemplatesGallery } from "./TemplatesGallery";
import { AccountMenu, isSignedIn } from "@/app/AccountMenu";
import { getGiftPhotos } from "@/lib/giftPhotos";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";

export const metadata: Metadata = {
  title: "Choose an experience — Kindloop",
  description:
    "Every Kindloop experience in one place — search or filter by occasion and recipient, watch a demo, and start free.",
};

export default async function TemplatesPage() {
  const [photos, signedIn] = await Promise.all([getGiftPhotos(TEMPLATE_CATALOG.length), isSignedIn()]);
  return <TemplatesGallery photos={photos} accountMenu={<AccountMenu />} signedIn={signedIn} />;
}
