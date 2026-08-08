import type { ReactNode } from "react";
import { fraunces, gochiHand, ibmPlexMono, spaceGrotesk } from "@/app/fonts";

/**
 * The four fonts every experience is written against.
 *
 * Templates reference these as bare CSS variables — `var(--font-fraunces)`,
 * `var(--font-gochi)` and so on — which only resolve if some ancestor carries the
 * classes `next/font` generates. The editor screen has always done that; the two
 * routes that serve the *finished* thing did not, so a gift opened at `/g/[slug]`
 * fell back to the generic `serif`, `cursive` and `monospace` of whatever device
 * it landed on. Handwriting is not decoration in most of these — it is half the
 * voice — and Comic-Sans-by-accident is a bad way to receive a love letter.
 *
 * Memoryverse and Digital Scrapbook already applied the variables inside their own
 * views and were the only two that looked right; wrapping at the route makes that
 * true for all of them, and applying it twice costs nothing.
 */
export function TemplateFonts({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${gochiHand.variable} flex min-h-full flex-1 flex-col`}
    >
      {children}
    </div>
  );
}
