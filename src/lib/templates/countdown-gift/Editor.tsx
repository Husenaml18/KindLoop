"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ibmPlexMono } from "@/app/fonts";
import { LETTER_FONT_VARS } from "@/app/letterFonts";
import {
  GIFT_GLYPHS,
  GIFT_KINDS,
  GIFT_LABELS,
  ILLUSTRATIONS,
  makeDay,
  openedCount,
  type CountdownContent,
  type CountdownDay,
  type GiftKind,
} from "./schema";
import { DOOR_STYLE_IDS, DOOR_STYLE_LABELS, SKINS, SKIN_IDS } from "./theme";
import { useToday } from "@/lib/engines/unlock/clock";
import { CountdownGiftView } from "./View";

/* The workbench for this template is the calendar's own night: ink-blue card
   stock and gold leaf, not the wooden bench of the keepsake box. */
const DESK = "#171331";
const CARD = "#1f1a3a";
const CARD_LIFT = "#282246";
const EDGE = "rgba(216,180,110,.22)";
const GOLD = "#d8b46e";
const INK = "#efe7d4";
const SOFT = "rgba(239,231,212,.58)";

const label: CSSProperties = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: 9.5,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: SOFT,
};

const field = "w-full rounded-md px-2.5 py-2 text-[13px] outline-none";
const fieldStyle: CSSProperties = {
  background: "rgba(0,0,0,.3)",
  border: `1px solid ${EDGE}`,
  color: INK,
  fontFamily: "var(--font-space-grotesk), sans-serif",
};

/** A sane starting rhythm: vary the kinds so no two adjacent days repeat. */
const RHYTHM: GiftKind[] = [
  "letter", "photo", "quote", "voice", "song", "memory",
  "illustration", "photo", "coupon", "letter", "game", "video",
];

/** Suggested lengths people actually pick. */
const LENGTHS = [7, 10, 12, 14, 24, 30];

function Chips<T extends string>({
  ids, value, onChange, labelOf, glyphOf,
}: {
  ids: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labelOf: (id: T) => string;
  glyphOf?: (id: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={value === id}
          className="flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px]"
          style={{
            background: value === id ? "rgba(216,180,110,.16)" : "rgba(0,0,0,.24)",
            border: `1px solid ${value === id ? GOLD : EDGE}`,
            color: value === id ? GOLD : SOFT,
          }}
        >
          {glyphOf && <span aria-hidden>{glyphOf(id)}</span>}
          {labelOf(id)}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function CountdownGiftEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: CountdownContent;
  onChange: (value: CountdownContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<"calendar" | "day" | "finale">("calendar");
  const [previewKey, setPreviewKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const days = value.days;
  const current = days[selected];

  const patch = (p: Partial<CountdownContent>) => onChange({ ...value, ...p });
  const patchDay = (id: string, p: Partial<CountdownDay>) =>
    patch({ days: days.map((d) => (d.id === id ? { ...d, ...p } : d)) });

  /** Deterministic — never `Date.now()`, which would differ between renders. */
  const freshId = () => {
    const used = new Set(days.map((d) => d.id));
    let n = 1;
    while (used.has(`d-${n}`)) n += 1;
    return `d-${n}`;
  };

  const addDay = (kind?: GiftKind) => {
    if (days.length >= 31) return;
    const i = days.length;
    const fresh = makeDay(freshId(), kind ?? RHYTHM[i % RHYTHM.length]);
    patch({ days: [...days, fresh] });
    setSelected(i);
    setTab("day");
  };

  /** Lay out a whole calendar in one go — the common case. */
  const fillTo = (n: number) => {
    const next = [...days];
    const used = new Set(next.map((d) => d.id));
    let counter = 1;
    while (next.length < n) {
      while (used.has(`d-${counter}`)) counter += 1;
      used.add(`d-${counter}`);
      next.push(makeDay(`d-${counter}`, RHYTHM[next.length % RHYTHM.length]));
    }
    patch({ days: next.slice(0, n) });
    setSelected(Math.min(selected, n - 1));
  };

  const removeDay = (i: number) => {
    patch({ days: days.filter((_, idx) => idx !== i) });
    setSelected((s) => Math.max(0, Math.min(s, days.length - 2)));
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= days.length) return;
    const next = [...days];
    [next[i], next[j]] = [next[j], next[i]];
    patch({ days: next });
    setSelected(j);
  };

  const upload = async (file: File, slot: "imageUrl" | "audioUrl" | "videoUrl") => {
    if (!current) return;
    setBusy(true);
    try {
      const url = await uploadPhoto(file);
      /* An empty URL means the upload was refused and the reason is already on
         screen — applying it would quietly clear whatever was there before. */
      if (url) patchDay(current.id, { [slot]: url } as Partial<CountdownDay>);
    } finally {
      setBusy(false);
    }
  };

  const tabStyle = (active: boolean): CSSProperties => ({
    ...label,
    background: active ? "rgba(216,180,110,.16)" : "transparent",
    border: `1px solid ${active ? GOLD : EDGE}`,
    color: active ? GOLD : SOFT,
  });

  /* How much of it the recipient can see today — the thing creators most want to
     know before they send it. */
  const today = useToday();
  const openNow = value.startDate && today ? openedCount(value, today) : days.length;

  return (
    <div
      className={`${LETTER_FONT_VARS} ${ibmPlexMono.variable} rounded-2xl p-4 sm:p-5`}
      style={{
        background: `linear-gradient(168deg, #241f3c, ${DESK})`,
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*,audio/*,video/*"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const kind = f.type.startsWith("audio/") ? "audioUrl" : f.type.startsWith("video/") ? "videoUrl" : "imageUrl";
          await upload(f, kind);
          if (fileRef.current) fileRef.current.value = "";
        }}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,410px)_minmax(0,1fr)]">
        {/* ---------------- left: building the calendar ---------------- */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 style={{ fontFamily: "var(--hw-elegant), cursive", fontSize: 26, color: INK, margin: 0 }}>
              Building the calendar
            </h2>
            <p className="m-0 mt-1 text-[12.5px]" style={{ color: SOFT }}>
              One door a day, in order. They can&apos;t open tomorrow&apos;s early —
              that&apos;s the whole point of it.
            </p>
          </div>

          <div className="flex gap-1.5">
            {(["calendar", "day", "finale"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className="flex-1 cursor-pointer rounded-lg px-2 py-2" style={tabStyle(tab === t)}>
                {t === "calendar" ? "The calendar" : t === "day" ? "This day" : "The ending"}
              </button>
            ))}
          </div>

          {/* the days */}
          <div className="rounded-xl p-3" style={{ background: CARD, border: `1px solid ${EDGE}` }}>
            <div className="mb-2 flex items-center justify-between">
              <span style={label}>
                {days.length} {days.length === 1 ? "day" : "days"}
                {value.startDate && ` · ${openNow} open today`}
              </span>
              <button
                type="button"
                onClick={() => addDay()}
                disabled={days.length >= 31}
                className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px] disabled:opacity-35"
                style={{ background: "rgba(216,180,110,.16)", border: `1px solid ${GOLD}`, color: GOLD }}
              >
                + Add
              </button>
            </div>

            <div className="flex max-h-52 flex-col gap-1.5 overflow-y-auto pr-1">
              {days.map((d, i) => (
                <div
                  key={d.id}
                  className="flex items-center gap-1.5 rounded-md p-1.5"
                  style={{
                    background: i === selected ? "rgba(216,180,110,.1)" : "transparent",
                    border: `1px solid ${i === selected ? "rgba(216,180,110,.4)" : "transparent"}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setSelected(i); setTab("day"); }}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 bg-transparent text-left"
                  >
                    <span
                      className="flex h-7 w-7 flex-none items-center justify-center rounded-[3px]"
                      style={{ background: "rgba(0,0,0,.35)", border: `1px solid ${EDGE}`, fontFamily: "var(--font-fraunces), serif", fontSize: 12, color: GOLD }}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px]" style={{ color: INK }}>
                        {d.title || GIFT_LABELS[d.kind]}
                      </span>
                      <span className="block" style={{ ...label, fontSize: 8.5 }}>
                        {GIFT_GLYPHS[d.kind]} {GIFT_LABELS[d.kind]}
                        {i < openNow ? "" : " · locked today"}
                      </span>
                    </span>
                  </button>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier" className="cursor-pointer px-1 text-[8px] disabled:opacity-25" style={{ background: "transparent", color: SOFT }}>▲</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === days.length - 1} aria-label="Move later" className="cursor-pointer px-1 text-[8px] disabled:opacity-25" style={{ background: "transparent", color: SOFT }}>▼</button>
                  <button type="button" onClick={() => removeDay(i)} aria-label="Remove" className="cursor-pointer px-1 text-[11px]" style={{ background: "transparent", color: "#e08878" }}>×</button>
                </div>
              ))}
              {days.length === 0 && (
                <p className="m-0 py-2 text-center text-[12px]" style={{ color: SOFT }}>No days yet.</p>
              )}
            </div>

            <div className="mt-2.5">
              <span className="mb-1.5 block" style={label}>Lay out</span>
              <div className="flex flex-wrap gap-1.5">
                {LENGTHS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => fillTo(n)}
                    className="cursor-pointer rounded-full px-2.5 py-1 text-[10.5px]"
                    style={{ background: "rgba(0,0,0,.24)", border: `1px solid ${EDGE}`, color: SOFT }}
                  >
                    {n} days
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl p-4" style={{ background: CARD, border: `1px solid ${EDGE}` }}>
            {/* ---------- the calendar itself ---------- */}
            {tab === "calendar" && (
              <>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Title</span>
                  <input type="text" value={value.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Counting down" className={field} style={fieldStyle} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Counting down to</span>
                  <input type="text" value={value.occasion} onChange={(e) => patch({ occasion: e.target.value })} placeholder="your birthday" className={field} style={fieldStyle} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Line underneath</span>
                  <input type="text" value={value.dedication} onChange={(e) => patch({ dedication: e.target.value })} placeholder="One a day. No peeking." className={field} style={fieldStyle} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Day one opens on</span>
                  <input
                    type="date"
                    value={value.startDate.slice(0, 10)}
                    onChange={(e) => patch({ startDate: e.target.value })}
                    className={field}
                    style={fieldStyle}
                  />
                  <span className="mt-1.5 block text-[11px]" style={{ color: SOFT }}>
                    {value.startDate
                      ? `Day ${days.length} opens ${days.length - 1} days later. Leave this blank and every door opens straight away.`
                      : "Blank means no waiting — every door is open immediately."}
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Every day looks like</span>
                  <Chips ids={DOOR_STYLE_IDS} value={value.doorStyle} onChange={(v) => patch({ doorStyle: v })} labelOf={(id) => DOOR_STYLE_LABELS[id]} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Palette</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SKIN_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => patch({ skin: id })}
                        aria-pressed={value.skin === id}
                        title={SKINS[id].label}
                        className="cursor-pointer overflow-hidden rounded-lg"
                        style={{
                          width: 54, height: 38,
                          background: SKINS[id].board,
                          border: value.skin === id ? `2px solid ${SKINS[id].gold}` : `1px solid ${EDGE}`,
                        }}
                      >
                        <span className="mx-auto mt-1.5 block rounded-full" style={{ width: 10, height: 10, background: SKINS[id].gold }} />
                        <span className="mt-1 block text-[7.5px]" style={{ color: SKINS[id].ink, letterSpacing: ".08em" }}>
                          {SKINS[id].label}
                        </span>
                      </button>
                    ))}
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Music that starts when a door opens</span>
                  <input type="url" value={value.musicUrl} onChange={(e) => patch({ musicUrl: e.target.value })} placeholder="https://… (optional)" className={field} style={fieldStyle} />
                </label>
              </>
            )}

            {/* ---------- one day ---------- */}
            {tab === "day" && !current && (
              <p className="m-0 text-[12.5px]" style={{ color: SOFT }}>Add a day to begin.</p>
            )}
            {tab === "day" && current && (
              <>
                <div className="flex items-center justify-between">
                  <span style={{ ...label, color: GOLD }}>Day {selected + 1}</span>
                  {busy && <span style={{ ...label, fontSize: 8.5 }}>uploading…</span>}
                </div>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>What&apos;s behind the door</span>
                  <Chips
                    ids={GIFT_KINDS}
                    value={current.kind}
                    onChange={(v) => patchDay(current.id, { kind: v })}
                    labelOf={(id) => GIFT_LABELS[id]}
                    glyphOf={(id) => GIFT_GLYPHS[id]}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Heading</span>
                  <input type="text" value={current.title} onChange={(e) => patchDay(current.id, { title: e.target.value })} placeholder="optional" className={field} style={fieldStyle} />
                </label>

                {current.kind !== "game" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>
                      {current.kind === "quote" ? "The quote" : current.kind === "song" ? "Song title" : current.kind === "coupon" ? "What you're promising" : "Words"}
                    </span>
                    <textarea
                      value={current.text}
                      onChange={(e) => patchDay(current.id, { text: e.target.value })}
                      rows={current.kind === "letter" || current.kind === "memory" ? 5 : 3}
                      className={field}
                      style={{ ...fieldStyle, resize: "vertical" }}
                    />
                  </label>
                )}

                {(current.kind === "photo" || current.kind === "memory") && (
                  <div>
                    <span className="mb-1.5 block" style={label}>Photo</span>
                    {current.imageUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={current.imageUrl} alt="" className="mb-2 block h-24 w-full rounded-md object-cover" />
                    )}
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => fileRef.current?.click()} className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]" style={{ background: CARD_LIFT, border: `1px solid ${EDGE}`, color: INK }}>
                        {current.imageUrl ? "Replace" : "Upload"}
                      </button>
                      {current.imageUrl && (
                        <button type="button" onClick={() => patchDay(current.id, { imageUrl: "" })} className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]" style={{ background: "transparent", border: `1px solid ${EDGE}`, color: "#e08878" }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {current.kind === "voice" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Voice note</span>
                    <div className="flex gap-1.5">
                      <input type="url" value={current.audioUrl} onChange={(e) => patchDay(current.id, { audioUrl: e.target.value })} placeholder="https://…" className={field} style={fieldStyle} />
                      <button type="button" onClick={() => fileRef.current?.click()} className="flex-none cursor-pointer rounded-md px-2.5 text-[11px]" style={{ background: CARD_LIFT, border: `1px solid ${EDGE}`, color: INK }}>
                        Upload
                      </button>
                    </div>
                  </label>
                )}

                {current.kind === "video" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Video</span>
                    <div className="flex gap-1.5">
                      <input type="url" value={current.videoUrl} onChange={(e) => patchDay(current.id, { videoUrl: e.target.value })} placeholder="https://…" className={field} style={fieldStyle} />
                      <button type="button" onClick={() => fileRef.current?.click()} className="flex-none cursor-pointer rounded-md px-2.5 text-[11px]" style={{ background: CARD_LIFT, border: `1px solid ${EDGE}`, color: INK }}>
                        Upload
                      </button>
                    </div>
                  </label>
                )}

                {current.kind === "song" && (
                  <>
                    <label className="block">
                      <span className="mb-1.5 block" style={label}>Artist</span>
                      <input type="text" value={current.songArtist} onChange={(e) => patchDay(current.id, { songArtist: e.target.value })} className={field} style={fieldStyle} />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block" style={label}>Link to it</span>
                      <input type="url" value={current.songUrl} onChange={(e) => patchDay(current.id, { songUrl: e.target.value })} placeholder="https://open.spotify.com/…" className={field} style={fieldStyle} />
                    </label>
                  </>
                )}

                {current.kind === "quote" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Who said it</span>
                    <input type="text" value={current.attribution} onChange={(e) => patchDay(current.id, { attribution: e.target.value })} className={field} style={fieldStyle} />
                  </label>
                )}

                {/*
                  * When this one door opens.
                  *
                  * Offered per door rather than as one global rule, because the
                  * reason anybody wants it is specific: the last door at 7pm on
                  * the actual birthday, the proposal one at the hour it happened.
                  */}
                <label className="block">
                  <span className="mb-1.5 block" style={label}>This door opens</span>
                  <input
                    type="datetime-local"
                    value={current.openAt}
                    onChange={(e) => patchDay(current.id, { openAt: e.target.value })}
                    className={field}
                    style={fieldStyle}
                  />
                  <span className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: SOFT }}>
                    {current.openAt ? (
                      <>
                        <span>Locked until then, to the minute — the calendar is ignored for this one.</span>
                        <button
                          type="button"
                          onClick={() => patchDay(current.id, { openAt: "" })}
                          className="cursor-pointer rounded-full px-2.5 py-1"
                          style={{ background: "rgba(0,0,0,.05)", border: `1px solid ${EDGE}`, color: INK }}
                        >
                          Back to the calendar
                        </button>
                      </>
                    ) : (
                      <span>
                        {value.startDate
                          ? `Following the calendar: day ${selected + 1}. Set a time here to override it.`
                          : "No schedule at all, so this opens straight away. Set a time to make them wait."}
                      </span>
                    )}
                  </span>
                </label>

                {current.kind === "illustration" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Drawing</span>
                    <Chips ids={ILLUSTRATIONS} value={current.illustration} onChange={(v) => patchDay(current.id, { illustration: v })} labelOf={(id) => id} />
                  </label>
                )}

                {current.kind === "coupon" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Small print</span>
                    <input type="text" value={current.couponTerms} onChange={(e) => patchDay(current.id, { couponTerms: e.target.value })} placeholder="no expiry, no excuses" className={field} style={fieldStyle} />
                  </label>
                )}

                {current.kind === "game" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Hidden under the foil</span>
                    <textarea
                      value={current.scratchPrize}
                      onChange={(e) => patchDay(current.id, { scratchPrize: e.target.value })}
                      rows={3}
                      placeholder="They have to scratch it off to read this."
                      className={field}
                      style={{ ...fieldStyle, resize: "vertical" }}
                    />
                  </label>
                )}
              </>
            )}

            {/* ---------- the ending ---------- */}
            {tab === "finale" && (
              <>
                <p className="m-0 text-[12.5px]" style={{ color: SOFT }}>
                  Once the last door is open, everything they collected comes back
                  together on one screen.
                </p>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Closing line</span>
                  <input type="text" value={value.finaleTitle} onChange={(e) => patch({ finaleTitle: e.target.value })} className={field} style={fieldStyle} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Underneath it</span>
                  <textarea value={value.finaleNote} onChange={(e) => patch({ finaleNote: e.target.value })} rows={3} className={field} style={{ ...fieldStyle, resize: "vertical" }} />
                </label>
              </>
            )}
          </div>
        </div>

        {/* ---------------- right: the calendar as they'll see it ---------------- */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span style={label}>How it looks</span>
            <button
              type="button"
              onClick={() => setPreviewKey((k) => k + 1)}
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]"
              style={{ background: "rgba(216,180,110,.14)", border: `1px solid ${EDGE}`, color: GOLD }}
            >
              ↺ Replay
            </button>
          </div>
          <div
            className="overflow-hidden rounded-xl"
            style={{ border: `1px solid ${EDGE}`, height: "min(78vh, 820px)" }}
          >
            <div key={previewKey} className="h-full overflow-y-auto">
              <CountdownGiftView content={value} embedded />
            </div>
          </div>
          <p className="m-0 text-[11px]" style={{ color: SOFT }}>
            The preview opens every door so you can check your work. The person you
            send it to will only ever see up to today.
          </p>
        </div>
      </div>
    </div>
  );
}
