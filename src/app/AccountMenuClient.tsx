"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./chrome.module.css";

/**
 * The signed-in badge: two initials pressed into wax.
 *
 * It shows initials rather than the address. `husena.limdiwala@o2h.com` across a
 * header is unreadable, breaks the layout at small widths, and quietly puts
 * somebody's email on screen for anyone stood behind them. The full address is
 * still there — inside the menu, where you have to ask for it.
 *
 * Closes on Escape, on a click elsewhere, and when focus leaves; a menu that only
 * shuts via the button that opened it is a trap on a phone.
 */
export function AccountMenuClient({
  initials,
  name,
  email,
  image,
  signOutAction,
}: {
  initials: string;
  name: string | null;
  email: string | null;
  image: string | null;
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative" }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account — signed in as ${name ?? email ?? "you"}`}
        className={styles.seal}
      >
        {image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={image} alt="" className={styles.sealImage} />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div role="menu" className={styles.menu}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid rgba(43,32,19,.1)" }}>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis" }}>
              {name ?? "Signed in"}
            </p>
            {email && (
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 12,
                  color: "var(--ink-faint)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {email}
              </p>
            )}
          </div>

          {/* Two entries, two places. "Your gifts" pointed at an anchor on the
              profile page, so the menu offered the same destination twice under
              two names — a menu whose second item does what the first one did is
              a menu with one item and a decoration. */}
          <Link href="/account" role="menuitem" className={styles.menuItem} onClick={() => setOpen(false)}>
            Your profile
          </Link>
          <Link href="/demo" role="menuitem" className={styles.menuItem} onClick={() => setOpen(false)}>
            Watch demos
          </Link>

          <form action={signOutAction} style={{ borderTop: "1px solid rgba(43,32,19,.1)" }}>
            <button type="submit" role="menuitem" className={styles.menuItem} style={{ color: "var(--rust)" }}>
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
