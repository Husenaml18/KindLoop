"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Wordmark } from "./Wordmark";
import styles from "./chrome.module.css";

/**
 * One header for the whole product.
 *
 * There used to be a different one on each screen, which is how the calls to
 * action drifted apart. The order of the right-hand cluster is fixed everywhere:
 *
 *     … navigation …   [ Create a memory ]   [ Log in ] or [ initials ]
 *
 * "Create a memory" is deliberately *secondary* here. The hero already asks for
 * exactly that in its own words, and two competing primaries on one screen means
 * neither reads as the thing to do. Signing in is the header's job, so it takes
 * the primary weight — until you are signed in, at which point the badge does.
 */

export interface NavItem {
  label: string;
  href: string;
}

/** Anchors only exist on the landing page; every other screen links back to it. */
export const LANDING_NAV: NavItem[] = [
  { label: "Templates", href: "/templates" },
  { label: "About", href: "/about" },
  { label: "How it works", href: "/#how" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader({
  nav = LANDING_NAV,
  account,
  signedIn = false,
  active,
}: {
  nav?: NavItem[];
  /** The badge, or nothing when signed out. Rendered on the server. */
  account?: ReactNode;
  signedIn?: boolean;
  /** Force a nav item to be marked, by href. Rarely needed — see below. */
  active?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();

  /*
   * Which anchor on the landing page you are currently looking at.
   *
   * "How it works" is `/#how`: a real place, but one the router knows nothing
   * about, so it can only be marked by watching the section itself.
   */
  const [section, setSection] = useState<{ path: string; hash: string | null } | null>(null);

  /* Split once. `/#how` -> { path: "/", hash: "how" }. */
  const parsed = useMemo(
    () =>
      nav.map((item) => {
        const [path, hash] = item.href.split("#");
        return { ...item, path: path || "/", hash: hash || null };
      }),
    [nav]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /*
   * The anchor spy.
   *
   * Only the sections the navigation actually points at, and only on the page
   * that has them. Whichever is nearest the top of the viewport wins, so passing
   * through a short section doesn't leave a stale item lit.
   */
  useEffect(() => {
    const targets = parsed
      .filter((i) => i.hash && i.path === pathname)
      .map((i) => ({ hash: i.hash!, el: document.getElementById(i.hash!) }))
      .filter((t): t is { hash: string; el: HTMLElement } => Boolean(t.el));

    /* Nothing to watch here. The reading is stamped with the path it was taken
       on, so whatever is left in state simply stops applying — no clearing
       setState, which would be a cascading render for no reason. */
    if (targets.length === 0) return;

    const evaluate = () => {
      let best: string | null = null;
      let bestTop = -Infinity;
      for (const t of targets) {
        const top = t.el.getBoundingClientRect().top - 120;
        if (top <= 0 && top > bestTop) {
          bestTop = top;
          best = t.hash;
        }
      }
      setSection({ path: pathname, hash: best });
    };

    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    return () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, [parsed, pathname]);

  /*
   * Worked out here rather than passed in by every page.
   *
   * It used to be a prop, and the pages that forgot it — Contact among them —
   * simply had no item lit, with nothing to catch it. The header knows what page
   * it is on; asking it to be told was the mistake.
   */
  const isActive = (item: (typeof parsed)[number]) => {
    if (active) return active === item.href;
    if (item.hash) {
      return pathname === item.path && section?.path === pathname && section.hash === item.hash;
    }
    if (pathname === item.path) return true;
    /* `/templates/x` still counts as Templates. Guarded, or a bare "/" item would
       match every page in the product. */
    return item.path !== "/" && pathname.startsWith(`${item.path}/`);
  };

  /* A drawer left open behind a navigation is a trap on a phone. */
  useEffect(() => {
    if (!drawer) return;
    const close = () => setDrawer(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`} style={{ position: "sticky" }}>
      <div className={styles.headerInner}>
        <Link href="/" aria-label="Kindloop — home" className={styles.headerLeft} style={{ display: "block" }}>
          <Wordmark size={scrolled ? 26 : 30} priority />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {parsed.map((item) => {
            const on = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={`${styles.navLink} ${on ? styles.navLinkActive : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.headerRight}>
          {/* The label is hidden on narrow screens, so the name lives on the
              element itself — a visually-hidden copy would be read out twice
              wherever the label *is* showing. */}
          <Link
            href="/templates"
            aria-label="Create a memory"
            className={`${styles.cta} ${styles.ctaSecondary}`}
          >
            <span aria-hidden>✦</span>
            <span className={styles.ctaLabel} aria-hidden>Create a memory</span>
          </Link>

          {signedIn ? (
            account
          ) : (
            <Link href="/sign-in" className={`${styles.cta} ${styles.ctaPrimary}`}>
              Log in
            </Link>
          )}

          <button
            type="button"
            className={styles.burger}
            aria-label={drawer ? "Close menu" : "Open menu"}
            aria-expanded={drawer}
            onClick={() => setDrawer((d) => !d)}
          >
            <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden>
              {drawer ? (
                <path d="M2 2 L16 12 M16 2 L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M1 1.5 H17 M1 7 H17 M1 12.5 H11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className={`${styles.drawer} ${drawer ? styles.drawerOpen : ""}`}>
        <div className={styles.drawerInner}>
          {parsed.map((item) => {
            const on = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={`${styles.drawerLink} ${on ? styles.drawerLinkActive : ""}`}
                onClick={() => setDrawer(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
