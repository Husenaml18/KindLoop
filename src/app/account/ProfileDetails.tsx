"use client";

import { useState } from "react";
import { renameAccount } from "./actions";

/**
 * Editing your own name and bio.
 *
 * Folded away by default. On a profile, what you *are* should be what's on screen;
 * the controls for changing it are a second concern and shouldn't compete with the
 * thing itself.
 */
export function ProfileDetails({
  name,
  bio,
  gender,
}: {
  name: string;
  bio: string;
  gender: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(bio);

  const label = {
    fontFamily: "var(--font-ibm-plex-mono), monospace",
    fontSize: 9.5,
    letterSpacing: ".16em",
    textTransform: "uppercase" as const,
    color: "var(--label-on-paper)",
  };
  const field = {
    background: "#fffdf7",
    border: "1px solid rgba(43,32,19,.16)",
    color: "var(--ink)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 14,
    width: "100%",
    outline: "none",
    fontFamily: "var(--font-space-grotesk), sans-serif",
  } as const;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full cursor-pointer rounded-full border bg-transparent px-5 py-2.5 text-[13.5px]"
        style={{ borderColor: "rgba(43,32,19,.22)", color: "var(--ink-muted)" }}
      >
        Edit your details
      </button>
    );
  }

  return (
    <form
      action={renameAccount}
      className="flex flex-col gap-3.5 rounded-2xl p-5"
      style={{ background: "var(--paper)", border: "1px solid rgba(43,32,19,.12)" }}
    >
      <label className="block">
        <span className="mb-1.5 block" style={label}>Your name</span>
        <input type="text" name="name" defaultValue={name} maxLength={80} placeholder="Your name" style={field} />
      </label>

      <label className="block">
        <span className="mb-1.5 block" style={label}>A line about you</span>
        <textarea
          name="bio"
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 280))}
          rows={3}
          placeholder="Only ever shown to you."
          style={{ ...field, resize: "vertical", lineHeight: 1.55 }}
        />
        <span className="mt-1 block text-right" style={{ ...label, fontSize: 8.5 }}>
          {draft.length}/280
        </span>
      </label>

      <label className="block">
        <span className="mb-1.5 flex items-center gap-2" style={label}>
          Gender
          <span style={{ letterSpacing: 0, textTransform: "none", opacity: 0.75 }}>optional</span>
        </span>
        <input
          type="text"
          name="gender"
          defaultValue={gender}
          maxLength={40}
          placeholder="However you'd put it — or leave it blank"
          style={field}
        />
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          className="cursor-pointer rounded-full border-0 px-5 py-2.5 text-[13.5px] font-medium"
          style={{ background: "var(--brass)", color: "var(--on-dark)" }}
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setDraft(bio); }}
          className="cursor-pointer rounded-full border bg-transparent px-5 py-2.5 text-[13.5px]"
          style={{ borderColor: "rgba(43,32,19,.22)", color: "var(--ink-muted)" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
