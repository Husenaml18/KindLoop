"use client";

import Image from "next/image";
import { photoStyle } from "@/lib/uiStyle";
import { templateImage } from "@/lib/templateImages";

/**
 * The picture at the top of a card.
 *
 * An experience's own artwork when it has some, and the stock photograph the page
 * already fetched when it doesn't — so a card is never a blank frame while the
 * remaining artwork is being drawn.
 *
 * `sizes` is not optional here: cards sit in an `auto-fill` grid at roughly 232–320
 * px, and without it Next would hand every card a full-viewport-width image, which
 * on a gallery of nine cards is most of the page weight for no visible gain.
 */
export function TemplateArt({
  id,
  alt,
  photos,
  photoIndex,
  /** Dimmed for experiences that aren't finished yet. */
  dim = false,
  priority = false,
}: {
  id: string;
  alt: string;
  photos: string[];
  photoIndex: number;
  dim?: boolean;
  priority?: boolean;
}) {
  const art = templateImage(id);

  if (!art) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={photoStyle(photos, photoIndex, "position:absolute;inset:0", "var(--tan)")}
      />
    );
  }

  return (
    <Image
      src={art}
      alt={alt}
      fill
      sizes="(max-width: 640px) 92vw, (max-width: 1100px) 44vw, 320px"
      placeholder="blur"
      priority={priority}
      style={{
        objectFit: "cover",
        objectPosition: "center",
        /* Unfinished experiences read as unfinished. */
        filter: dim ? "saturate(.75)" : undefined,
      }}
    />
  );
}
