"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ibmPlexMono } from "@/app/fonts";
import { LETTER_FONT_VARS } from "@/app/letterFonts";
import {
  HANDS,
  HAND_IDS,
  INKS,
  INK_IDS,
  PAPER_COLORS,
  PAPER_COLOR_IDS,
  PAPER_STYLES,
  PAPER_STYLE_IDS,
  SEAL_COLORS,
  SEAL_COLOR_IDS,
  SEAL_ICON_IDS,
  SEAL_ICON_LABELS,
} from "../love-letter/theme";
import {
  LOCK_KINDS,
  LOCK_LABELS,
  MOODS,
  RIBBONS,
  RIBBON_IDS,
  WOODS,
  WOOD_IDS,
  makeLetter,
  type LockKind,
  type OpenWhenContent,
  type OpenWhenLetter,
} from "./schema";
import { OpenWhenView } from "./View";

/* A workbench: wood and brass, matching the object being made. */
const BENCH = "#3a2718";
const CARD = "#f7efdd";
const EDGE = "rgba(74,50,26,.2)";
const INK = "#3a3026";
const SOFT = "#7d6b52";
const BRASS = "#c9a45c";

const label: CSSProperties = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: 9.5,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: SOFT,
};

const field = "w-full rounded-md px-2.5 py-2 text-[13px] outline-none";
const fieldStyle: CSSProperties = {
  background: "#fffdf7",
  border: `1px solid ${EDGE}`,
  color: INK,
  fontFamily: "var(--font-space-grotesk), sans-serif",
};

/** Titles people actually reach for, offered as a starting point. */
const SUGGESTED = [
  "Open when you're happy",
  "Open when you miss me",
  "Open when you can't sleep",
  "Open when you're lonely",
  "Open on your birthday",
  "Open after we meet again",
  "Open when you need motivation",
  "Open when you feel like giving up",
  "Open when you need a laugh",
];

function Swatches<T extends string>({
  ids, value, onChange, colorOf, labelOf,
}: {
  ids: readonly T[];
  value: T;
  onChange: (v: T) => void;
  colorOf: (id: T) => string;
  labelOf: (id: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          title={labelOf(id)}
          aria-label={labelOf(id)}
          aria-pressed={value === id}
          className="cursor-pointer rounded-full"
          style={{
            width: 24, height: 24,
            background: colorOf(id),
            border: value === id ? `2px solid ${INK}` : `1px solid ${EDGE}`,
          }}
        />
      ))}
    </div>
  );
}

function Chips<T extends string>({
  ids, value, onChange, labelOf,
}: {
  ids: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labelOf: (id: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={value === id}
          className="cursor-pointer rounded-full px-2.5 py-1.5 text-[11px]"
          style={{
            background: value === id ? "rgba(140,47,60,.12)" : "#fffdf7",
            border: `1px solid ${value === id ? "rgba(140,47,60,.5)" : EDGE}`,
            color: value === id ? "#8c2f3c" : SOFT,
          }}
        >
          {labelOf(id)}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function OpenWhenEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: OpenWhenContent;
  onChange: (value: OpenWhenContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<"box" | "letter" | "lock">("letter");
  const [previewKey, setPreviewKey] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const letters = value.letters;
  const current = letters[selected];

  const patch = (p: Partial<OpenWhenContent>) => onChange({ ...value, ...p });
  const patchLetter = (id: string, p: Partial<OpenWhenLetter>) =>
    patch({ letters: letters.map((l) => (l.id === id ? { ...l, ...p } : l)) });

  const freshId = () => {
    const used = new Set(letters.map((l) => l.id));
    let n = used.size + 1;
    while (used.has(`l-${n}`)) n += 1;
    return `l-${n}`;
  };

  /** New envelopes get a different ribbon and wax from the last one, so the box
      never ends up looking uniform. */
  const addLetter = (title?: string) => {
    const id = freshId();
    const i = letters.length;
    const fresh: OpenWhenLetter = {
      ...makeLetter(id, title ?? SUGGESTED[i % SUGGESTED.length]),
      ribbon: RIBBON_IDS[i % RIBBON_IDS.length],
      sealColor: SEAL_COLOR_IDS[i % SEAL_COLOR_IDS.length],
      paperColor: PAPER_COLOR_IDS[i % PAPER_COLOR_IDS.length],
      hand: HAND_IDS[i % HAND_IDS.length],
    };
    patch({ letters: [...letters, fresh] });
    setSelected(letters.length);
    setTab("letter");
  };

  const removeLetter = (i: number) => {
    patch({ letters: letters.filter((_, idx) => idx !== i) });
    setSelected((s) => Math.max(0, Math.min(s, letters.length - 2)));
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= letters.length) return;
    const next = [...letters];
    [next[i], next[j]] = [next[j], next[i]];
    patch({ letters: next });
    setSelected(j);
  };

  const tabStyle = (active: boolean): CSSProperties => ({
    ...label,
    background: active ? "rgba(140,47,60,.12)" : "transparent",
    border: `1px solid ${active ? "rgba(140,47,60,.45)" : EDGE}`,
    color: active ? "#8c2f3c" : SOFT,
  });

  return (
    <div
      className={`${LETTER_FONT_VARS} ${ibmPlexMono.variable} rounded-2xl p-4 sm:p-5`}
      style={{
        background: `linear-gradient(168deg, #5c4029, ${BENCH})`,
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f || !current) return;
          const url = await uploadPhoto(f);
          /* Empty means the upload was refused; the reason is already on screen. */
          if (url) patchLetter(current.id, { photoUrl: url });
          if (fileRef.current) fileRef.current.value = "";
        }}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        {/* ---------------- left: the box being filled ---------------- */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 style={{ fontFamily: "var(--hw-elegant), cursive", fontSize: 26, color: "#ffe8c4", margin: 0 }}>
              Filling the box
            </h2>
            <p className="m-0 mt-1 text-[12.5px]" style={{ color: "rgba(255,232,196,.6)" }}>
              Each envelope is its own letter, with its own paper, ribbon and rule
              for when it may be opened.
            </p>
          </div>

          <div className="flex gap-1.5">
            {(["letter", "lock", "box"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className="flex-1 cursor-pointer rounded-lg px-2 py-2" style={tabStyle(tab === t)}>
                {t === "letter" ? "This letter" : t === "lock" ? "When it opens" : "The box"}
              </button>
            ))}
          </div>

          {/* the envelopes in the box */}
          <div className="rounded-xl p-3" style={{ background: CARD, border: `1px solid ${EDGE}` }}>
            <div className="mb-2 flex items-center justify-between">
              <span style={label}>{letters.length} envelopes</span>
              <button
                type="button"
                onClick={() => addLetter()}
                className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]"
                style={{ background: "rgba(140,47,60,.12)", border: "1px solid rgba(140,47,60,.45)", color: "#8c2f3c" }}
              >
                + Add
              </button>
            </div>
            <div className="flex max-h-44 flex-col gap-1.5 overflow-y-auto pr-1">
              {letters.map((l, i) => (
                <div
                  key={l.id}
                  className="flex items-center gap-1.5 rounded-md p-1.5"
                  style={{
                    background: i === selected ? "rgba(140,47,60,.1)" : "transparent",
                    border: `1px solid ${i === selected ? "rgba(140,47,60,.4)" : "transparent"}`,
                  }}
                >
                  <button type="button" onClick={() => setSelected(i)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 bg-transparent text-left">
                    <span className="h-6 w-1.5 flex-none rounded-full" style={{ background: RIBBONS[l.ribbon].hex }} />
                    <span
                      className="h-3 w-3 flex-none rounded-full"
                      style={{ background: SEAL_COLORS[l.sealColor].base }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px]" style={{ color: INK }}>{l.title}</span>
                      <span className="block" style={{ ...label, fontSize: 8.5 }}>{LOCK_LABELS[l.lock]}</span>
                    </span>
                  </button>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="cursor-pointer px-1 text-[8px] disabled:opacity-25" style={{ background: "transparent", color: SOFT }}>▲</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === letters.length - 1} aria-label="Move down" className="cursor-pointer px-1 text-[8px] disabled:opacity-25" style={{ background: "transparent", color: SOFT }}>▼</button>
                  <button type="button" onClick={() => removeLetter(i)} aria-label="Remove" className="cursor-pointer px-1 text-[11px]" style={{ background: "transparent", color: "#a83c2c" }}>×</button>
                </div>
              ))}
              {letters.length === 0 && (
                <p className="m-0 py-2 text-center text-[12px]" style={{ color: SOFT }}>The box is empty.</p>
              )}
            </div>

            {letters.length < 4 && (
              <div className="mt-2.5">
                <span className="mb-1.5 block" style={label}>Start from</span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED.slice(0, 6).map((s) => (
                    <button key={s} type="button" onClick={() => addLetter(s)} className="cursor-pointer rounded-full px-2.5 py-1 text-[10.5px]" style={{ background: "#fffdf7", border: `1px solid ${EDGE}`, color: SOFT }}>
                      {s.replace("Open when you're ", "").replace("Open when you ", "").replace("Open ", "")}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-xl p-4" style={{ background: CARD, border: `1px solid ${EDGE}` }}>
            {/* ---------- the box ---------- */}
            {tab === "box" && (
              <>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Wood</span>
                  <Chips ids={WOOD_IDS} value={value.wood} onChange={(v) => patch({ wood: v })} labelOf={(id) => WOODS[id].label} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Engraved on the plate</span>
                  <input type="text" value={value.plate} onChange={(e) => patch({ plate: e.target.value })} placeholder="their name, or nothing" className={field} style={fieldStyle} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Box title</span>
                  <input type="text" value={value.boxTitle} onChange={(e) => patch({ boxTitle: e.target.value })} className={field} style={fieldStyle} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Line on the lid</span>
                  <input type="text" value={value.dedication} onChange={(e) => patch({ dedication: e.target.value })} className={field} style={fieldStyle} />
                </label>
              </>
            )}

            {!current && tab !== "box" && (
              <p className="m-0 text-[12.5px]" style={{ color: SOFT }}>Add an envelope to begin.</p>
            )}

            {/* ---------- one letter ---------- */}
            {current && tab === "letter" && (
              <>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Written on the envelope</span>
                  <input type="text" value={current.title} onChange={(e) => patchLetter(current.id, { title: e.target.value })} className={field} style={fieldStyle} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Ribbon</span>
                    <Swatches ids={RIBBON_IDS} value={current.ribbon} onChange={(v) => patchLetter(current.id, { ribbon: v })} colorOf={(id) => RIBBONS[id].hex} labelOf={(id) => RIBBONS[id].label} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Wax</span>
                    <Swatches ids={SEAL_COLOR_IDS} value={current.sealColor} onChange={(v) => patchLetter(current.id, { sealColor: v })} colorOf={(id) => SEAL_COLORS[id].base} labelOf={(id) => SEAL_COLORS[id].label} />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Seal design</span>
                  <Chips ids={SEAL_ICON_IDS} value={current.sealIcon} onChange={(v) => patchLetter(current.id, { sealIcon: v })} labelOf={(id) => SEAL_ICON_LABELS[id]} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Paper</span>
                    <Swatches ids={PAPER_COLOR_IDS} value={current.paperColor} onChange={(v) => patchLetter(current.id, { paperColor: v })} colorOf={(id) => PAPER_COLORS[id].hex} labelOf={(id) => PAPER_COLORS[id].label} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Ink</span>
                    <Swatches ids={INK_IDS} value={current.ink} onChange={(v) => patchLetter(current.id, { ink: v })} colorOf={(id) => INKS[id].hex} labelOf={(id) => INKS[id].label} />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Paper texture</span>
                  <Chips ids={PAPER_STYLE_IDS} value={current.paperStyle} onChange={(v) => patchLetter(current.id, { paperStyle: v })} labelOf={(id) => PAPER_STYLES[id].label} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Handwriting</span>
                  <Chips ids={HAND_IDS} value={current.hand} onChange={(v) => patchLetter(current.id, { hand: v })} labelOf={(id) => HANDS[id].label} />
                </label>

                <div className="h-px" style={{ background: EDGE }} />

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Greeting</span>
                  <input type="text" value={current.greeting} onChange={(e) => patchLetter(current.id, { greeting: e.target.value })} placeholder="Hello you," className={field} style={fieldStyle} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>The letter</span>
                  <textarea rows={7} value={current.body} onChange={(e) => patchLetter(current.id, { body: e.target.value })} className={`${field} resize-y leading-[1.6]`} style={fieldStyle} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Closing</span>
                    <input type="text" value={current.closing} onChange={(e) => patchLetter(current.id, { closing: e.target.value })} className={field} style={fieldStyle} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Signature</span>
                    <input type="text" value={current.signature} onChange={(e) => patchLetter(current.id, { signature: e.target.value })} className={field} style={fieldStyle} />
                  </label>
                </div>

                <div className="h-px" style={{ background: EDGE }} />

                <div className="flex flex-col gap-2">
                  <span style={label}>Tucked in with it</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className="cursor-pointer rounded-md px-3 py-2 text-[12px]" style={{ background: "rgba(140,47,60,.1)", border: "1px solid rgba(140,47,60,.4)", color: "#8c2f3c" }}>
                      {current.photoUrl ? "Replace photo" : "Hidden photo"}
                    </button>
                    {current.photoUrl && (
                      <span className="h-9 w-9 rounded bg-cover bg-center" style={{ backgroundImage: `url(${current.photoUrl})`, border: `1px solid ${EDGE}` }} />
                    )}
                  </div>
                  <input type="text" value={current.photoCaption} onChange={(e) => patchLetter(current.id, { photoCaption: e.target.value })} placeholder="photo caption" className={field} style={fieldStyle} />
                  <input type="text" value={current.voiceUrl} onChange={(e) => patchLetter(current.id, { voiceUrl: e.target.value })} placeholder="voice note URL — they press the seal" className={field} style={fieldStyle} />
                  <textarea rows={2} value={current.surprise} onChange={(e) => patchLetter(current.id, { surprise: e.target.value })} placeholder="one tiny surprise, revealed last" className={`${field} resize-y`} style={fieldStyle} />
                </div>
              </>
            )}

            {/* ---------- the lock ---------- */}
            {current && tab === "lock" && (
              <>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>This one opens</span>
                  <Chips ids={LOCK_KINDS} value={current.lock} onChange={(v) => patchLetter(current.id, { lock: v as LockKind })} labelOf={(id) => LOCK_LABELS[id]} />
                </label>

                {(current.lock === "date" || current.lock === "countdown") && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>{current.lock === "date" ? "On" : "Counting down to"}</span>
                    <input type="datetime-local" value={current.unlockAt} onChange={(e) => patchLetter(current.id, { unlockAt: e.target.value })} className={field} style={fieldStyle} />
                  </label>
                )}

                {current.lock === "mood" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>When they feel</span>
                    <Chips ids={MOODS} value={current.mood as (typeof MOODS)[number]} onChange={(v) => patchLetter(current.id, { mood: v })} labelOf={(m) => m} />
                    <span className="mt-1.5 block text-[10.5px]" style={{ color: SOFT }}>
                      They pick their own mood — this is on trust, not surveillance.
                    </span>
                  </label>
                )}

                {current.lock === "password" && (
                  <>
                    <label className="block">
                      <span className="mb-1.5 block" style={label}>Password</span>
                      <input type="text" value={current.password} onChange={(e) => patchLetter(current.id, { password: e.target.value })} className={field} style={fieldStyle} />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block" style={label}>Hint they&apos;ll see</span>
                      <input type="text" value={current.passwordHint} onChange={(e) => patchLetter(current.id, { passwordHint: e.target.value })} placeholder="the name of the street" className={field} style={fieldStyle} />
                    </label>
                    <p className="m-0 rounded-md p-2.5 text-[10.5px]" style={{ background: "rgba(168,60,44,.08)", border: "1px solid rgba(168,60,44,.28)", color: "#8a3a2a" }}>
                      This keeps a moment private, not a secret safe — the password
                      travels with the gift, so don&apos;t reuse a real one.
                    </p>
                  </>
                )}

                {current.lock === "location" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>The place</span>
                    <input type="text" value={current.place} onChange={(e) => patchLetter(current.id, { place: e.target.value })} placeholder="the bench by the river" className={field} style={fieldStyle} />
                    <span className="mt-1.5 block text-[10.5px]" style={{ color: SOFT }}>
                      They confirm they&apos;re there. No location tracking is involved.
                    </span>
                  </label>
                )}

                {current.lock === "creator" && (
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input type="checkbox" checked={current.released} onChange={(e) => patchLetter(current.id, { released: e.target.checked })} className="h-4 w-4 accent-[#8c2f3c]" />
                    <span className="text-[12.5px]" style={{ color: INK }}>Released — they can open this now</span>
                  </label>
                )}
              </>
            )}
          </div>
        </div>

        {/* ---------------- right: the box itself ---------------- */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span style={{ ...label, color: "rgba(255,232,196,.7)" }}>Live preview</span>
            <button
              type="button"
              onClick={() => setPreviewKey((k) => k + 1)}
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]"
              style={{ background: "transparent", border: `1px solid ${BRASS}55`, color: BRASS }}
            >
              ↻ From the closed lid
            </button>
          </div>
          <div
            className="relative overflow-hidden rounded-xl"
            style={{
              minHeight: 520,
              height: "min(76vh, 720px)",
              border: `1px solid ${BRASS}33`,
              boxShadow: "0 34px 66px -34px rgba(0,0,0,.85)",
            }}
          >
            <OpenWhenView key={previewKey} content={value} embedded />
          </div>
          <p className="m-0 text-[11.5px]" style={{ color: "rgba(255,232,196,.55)" }}>
            Locked envelopes shudder when clicked, exactly as they will for them.
            The ones needing a password or a mood get a key button along the bottom.
          </p>
        </div>
      </div>
    </div>
  );
}
