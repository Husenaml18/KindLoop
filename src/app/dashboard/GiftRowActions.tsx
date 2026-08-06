"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * What you can do with one gift: open it, copy its link, keep editing, remove it.
 *
 * Copying is the action people actually want most — the whole product ends in
 * sending somebody a link — so it gets the plainest treatment and confirms itself
 * in place rather than through a toast that appears somewhere else on the page.
 */
export function GiftRowActions({
  giftId,
  slug,
  template,
  name,
  deleteAction,
}: {
  giftId: string;
  slug: string;
  template: string;
  name: string;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}/g/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* Clipboard refused (insecure context, or permission denied) — show the
         link so it can be copied by hand rather than failing silently. */
      window.prompt("Copy this link", url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const chip = {
    fontSize: 12.5,
    borderRadius: 999,
    padding: "7px 14px",
    border: "1px solid rgba(43,32,19,.2)",
    color: "var(--ink)",
    background: "transparent",
    textDecoration: "none",
  } as const;

  if (confirming) {
    return (
      <div className="mt-auto flex flex-col gap-2.5">
        <p className="m-0" style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-muted)" }}>
          Delete this {name}? Anyone holding its link will find nothing there.
        </p>
        <div className="flex flex-wrap gap-2">
          <form action={deleteAction}>
            <input type="hidden" name="giftId" value={giftId} />
            <button
              type="submit"
              className="cursor-pointer rounded-full border-0 px-4 py-2 text-[12.5px] font-medium"
              style={{ background: "var(--rust)", color: "#fdf6e8" }}
            >
              Delete it
            </button>
          </form>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="cursor-pointer"
            style={chip}
          >
            Keep it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-auto flex flex-wrap gap-2">
      <Link href={`/g/${slug}`} style={chip} target="_blank" rel="noopener noreferrer">
        Open
      </Link>
      <button type="button" onClick={copy} className="cursor-pointer" style={chip}>
        {copied ? "Link copied" : "Copy link"}
      </button>
      <Link href={`/create/${template}?gift=${giftId}`} style={chip}>
        Edit
      </Link>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="cursor-pointer"
        style={{ ...chip, borderColor: "rgba(181,80,46,.34)", color: "var(--rust)" }}
      >
        Delete
      </button>
    </div>
  );
}
