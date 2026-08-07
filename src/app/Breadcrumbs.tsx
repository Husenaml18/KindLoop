import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The trail back out.
 *
 * The create screens deliberately drop the site header — an editor with a
 * marketing navigation across the top invites you to click away from unsaved
 * work — but dropping it left no way back at all except the browser button. This
 * is the smaller, quieter replacement: where you are, and every step above it.
 *
 * The last crumb is the current page and is not a link. Making it one is a
 * common mistake and an annoying one: it looks clickable, and clicking it
 * reloads the thing you are already looking at, which on an editor means
 * gambling with whatever you have typed.
 *
 * Marked up as a `nav` with an ordered list because that is what assistive
 * technology expects to find, and `aria-current="page"` names the end of the
 * trail without relying on it being visually dimmer.
 */

export interface Crumb {
  label: string;
  /** Omitted for the page you are on. */
  href?: string;
}

export function Breadcrumbs({
  items,
  tone = "ink",
}: {
  items: Crumb[];
  /** `cream` for the dark editor benches, `ink` for paper. */
  tone?: "ink" | "cream";
}) {
  const muted = tone === "cream" ? "rgba(253,246,232,.62)" : "var(--ink-faint)";
  const strong = tone === "cream" ? "rgba(253,246,232,.92)" : "var(--ink-muted)";

  return (
    <nav aria-label="Breadcrumb">
      <ol
        className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0"
        style={{ fontSize: 12.5, lineHeight: 1.5 }}
      >
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden style={{ color: muted, opacity: 0.6 }}>
                  /
                </span>
              )}
              {last || !c.href ? (
                <span aria-current="page" style={{ color: strong, fontWeight: 500 }}>
                  {c.label}
                </span>
              ) : (
                <Link
                  href={c.href}
                  style={{ color: muted, textDecoration: "none" }}
                  className="hover:underline"
                >
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** The chevron-and-label version, for going back one step specifically. */
export function BackLink({
  href,
  children,
  tone = "ink",
}: {
  href: string;
  children: ReactNode;
  tone?: "ink" | "cream";
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 no-underline"
      style={{
        fontSize: 13,
        color: tone === "cream" ? "rgba(253,246,232,.72)" : "var(--ink-muted)",
      }}
    >
      <span aria-hidden>←</span>
      {children}
    </Link>
  );
}
