"use client";

import { useState } from "react";

/**
 * Deleting the account.
 *
 * Kept behind two deliberate steps — opening it, then typing the word — because
 * what it removes is not recoverable and is not only the account: it is every
 * letter, photograph and recording somebody put into this, plus every link they
 * have already sent to somebody else. The copy says exactly that rather than
 * softening it.
 */
export function DangerZone({
  giftCount,
  confirmFailed,
  deleteAccountAction,
}: {
  giftCount: number;
  confirmFailed: boolean;
  deleteAccountAction: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(confirmFailed);
  const [typed, setTyped] = useState("");
  const armed = typed.trim().toLowerCase() === "delete";

  return (
    <section
      className="rounded-2xl p-6"
      style={{ background: "rgba(181,80,46,.06)", border: "1px solid rgba(181,80,46,.28)" }}
    >
      <h2 className="m-0" style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 500, fontSize: 19, color: "var(--ink)" }}>
        Delete your account
      </h2>
      <p className="m-0 mt-1.5" style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-muted)" }}>
        {giftCount === 0
          ? "This removes your account. There's nothing else stored against it yet."
          : `This removes your account and all ${giftCount} gift${giftCount === 1 ? "" : "s"} — the words, the photographs, the recordings, and every link you've already shared. Anyone holding one of those links will find nothing there.`}
      </p>
      <p className="m-0 mt-2" style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-muted)" }}>
        It cannot be undone, and we keep no copy.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 cursor-pointer rounded-full border bg-transparent px-5 py-2.5 text-[13.5px]"
          style={{ borderColor: "rgba(181,80,46,.5)", color: "var(--rust)" }}
        >
          Delete my account
        </button>
      ) : (
        <form action={deleteAccountAction} className="mt-4">
          <label className="block">
            <span className="block text-[13px]" style={{ color: "var(--ink)" }}>
              Type <strong style={{ fontWeight: 600 }}>delete</strong> to confirm.
            </span>
            <input
              type="text"
              name="confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              aria-label="Type delete to confirm"
              className="mt-2 w-full max-w-xs rounded-lg px-3.5 py-2.5 text-[14px] outline-none"
              style={{ background: "#fffdf7", border: "1px solid rgba(181,80,46,.4)", color: "var(--ink)" }}
            />
          </label>

          {confirmFailed && (
            <p role="alert" className="m-0 mt-2 text-[13px]" style={{ color: "var(--rust)" }}>
              That wasn&apos;t quite it — the word is &ldquo;delete&rdquo;. Nothing was removed.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={!armed}
              className="cursor-pointer rounded-full border-0 px-5 py-2.5 text-[13.5px] font-medium disabled:cursor-default disabled:opacity-40"
              style={{ background: "var(--rust)", color: "#fdf6e8" }}
            >
              Delete everything
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setTyped(""); }}
              className="cursor-pointer rounded-full border bg-transparent px-5 py-2.5 text-[13.5px]"
              style={{ borderColor: "rgba(43,32,19,.22)", color: "var(--ink-muted)" }}
            >
              Keep it
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
