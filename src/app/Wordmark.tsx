"use client";

import Image from "next/image";
import mark from "@/../public/kindloop-mark.png";

/**
 * The Kindloop lockup: the mark, then the name.
 *
 * Two things worth knowing about the source art. It arrived as a 1536×1024 PNG
 * whose ink occupied only 298×267 in the middle — about 5% of the canvas — so
 * rendered at header size the mark came out roughly nine pixels tall and all but
 * invisible. `public/kindloop-mark.png` is that file cropped to its opaque bounds,
 * which also took it from 1.94 MB to 132 KB. The original is untouched.
 *
 * And the mark is near-square, so it is an emblem rather than a wordmark: the name
 * is still set in type beside it, or the header would carry a small symbol and no
 * indication of whose product this is.
 */
export function Wordmark({
  size = 30,
  priority = false,
  /** The name's colour. Defaults to the current theme's ink. */
  colour = "var(--cream)",
  /** Hide the name where it would repeat something already on screen. */
  markOnly = false,
}: {
  size?: number;
  priority?: boolean;
  colour?: string;
  markOnly?: boolean;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.34 }}>
      <Image
        src={mark}
        alt={markOnly ? "Kindloop" : ""}
        aria-hidden={markOnly ? undefined : true}
        width={Math.round(size * (mark.width / mark.height))}
        height={size}
        sizes={`${Math.round(size * (mark.width / mark.height))}px`}
        priority={priority}
        style={{ height: size, width: "auto", display: "block" }}
      />
      {!markOnly && (
        <span
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: size * 0.78,
            lineHeight: 1,
            color: colour,
            letterSpacing: "-0.01em",
          }}
        >
          Kindloop
        </span>
      )}
    </span>
  );
}
