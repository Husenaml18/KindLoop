"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ibmPlexMono } from "@/app/fonts";
import { LETTER_FONT_VARS } from "@/app/letterFonts";
import {
  makeDecor,
  makeLesson,
  makePolaroid,
  makeThanks,
  paragraphsOf,
  type Decor,
  type Lesson,
  type MothersDayContent,
  type Polaroid,
} from "./schema";
import {
  DECOR_IDS,
  DECOR_LABELS,
  ENVELOPE_IDS,
  ENVELOPE_STYLES,
  HANDS,
  HAND_IDS,
  INKS,
  INK_IDS,
  PAPERS,
  PAPER_COLOURS,
  PAPER_COLOUR_IDS,
  PAPER_IDS,
  SEAL_COLOURS,
  SEAL_COLOUR_IDS,
  SEAL_SYMBOL_IDS,
  SEAL_SYMBOL_LABELS,
} from "./theme";
import { MothersDayLetterView } from "./View";

/* The workbench is her kitchen table in the morning: pale wood, linen, soft light.
   Lighter than any other editor here, because this is the gentlest experience. */
const DESK_TOP = "#d8c0a0";
const DESK = "#b89a78";
const CARD = "#fdfaf2";
const CARD_DEEP = "#f4ece0";
const EDGE = "rgba(120,96,64,.22)";
const INK = "#4a3c2c";
const SOFT = "#8a7660";
const ACCENT = "#a8756a";
/* On the bare table rather than on a card. */
const ON_DESK = "#3a2c1e";
const ON_DESK_SOFT = "rgba(58,44,30,.72)";

const label: CSSProperties = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: 9.5,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: SOFT,
};

const field = "w-full rounded-md px-2.5 py-2 text-[13px] outline-none";
const fieldStyle: CSSProperties = {
  background: "#fffdf8",
  border: `1px solid ${EDGE}`,
  color: INK,
  fontFamily: "var(--font-space-grotesk), sans-serif",
};

/** Openers people reach for, offered so the page is never blank. */
const SUGGESTED_THANKS = [
  "Every lift you gave me that you pretended was on your way.",
  "Sitting up with me the week of my exams.",
  "Never once telling me I was being dramatic, even when I was.",
  "The way you still ask if I've eaten.",
  "Teaching me to apologise properly.",
];

const SUGGESTED_LESSONS: { title: string; motif: Lesson["motif"] }[] = [
  { title: "How to say sorry and mean it", motif: "hands" },
  { title: "That a house is people, not a building", motif: "house" },
  { title: "To finish what I start", motif: "thread" },
  { title: "That kindness costs nothing", motif: "flower" },
];

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
            background: value === id ? "rgba(168,117,106,.14)" : "#fffdf8",
            border: `1px solid ${value === id ? ACCENT : EDGE}`,
            color: value === id ? ACCENT : SOFT,
          }}
        >
          {labelOf(id)}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function MothersDayLetterEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: MothersDayContent;
  onChange: (value: MothersDayContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [tab, setTab] = useState<"letter" | "stationery" | "sections" | "photos" | "ending">("letter");
  const [previewKey, setPreviewKey] = useState(0);
  const [busy, setBusy] = useState(false);
  /** Where the next uploaded file should go. */
  const target = useRef<"favourite" | "family" | "voice" | { polaroid: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<MothersDayContent>) => onChange({ ...value, ...p });

  const paragraphs = paragraphsOf(value.body);

  const freshId = (prefix: string, taken: string[]) => {
    const used = new Set(taken);
    let n = 1;
    while (used.has(`${prefix}-${n}`)) n += 1;
    return `${prefix}-${n}`;
  };

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadPhoto(file);
      /* Empty means the upload was refused; the reason is already on screen. */
      if (!url) return;
      const to = target.current;
      if (to === "favourite") patch({ favouriteMemoryPhoto: url });
      else if (to === "family") patch({ familyPhoto: url });
      else if (to === "voice") patch({ voiceUrl: url });
      else if (to && typeof to === "object") {
        patch({ polaroids: value.polaroids.map((p) => (p.id === to.polaroid ? { ...p, url } : p)) });
      }
    } finally {
      setBusy(false);
      target.current = null;
    }
  };

  const pick = (to: typeof target.current) => {
    target.current = to;
    fileRef.current?.click();
  };

  const tabStyle = (active: boolean): CSSProperties => ({
    ...label,
    background: active ? CARD : "rgba(90,66,42,.16)",
    border: `1px solid ${active ? ACCENT : "rgba(58,44,30,.24)"}`,
    color: active ? ACCENT : ON_DESK,
  });

  return (
    <div
      className={`${LETTER_FONT_VARS} ${ibmPlexMono.variable} rounded-2xl p-4 sm:p-5`}
      style={{
        background: `linear-gradient(168deg, ${DESK_TOP}, ${DESK})`,
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*,audio/*"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          await upload(f);
          if (fileRef.current) fileRef.current.value = "";
        }}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
        {/* ---------------- left: writing it ---------------- */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 style={{ fontFamily: "var(--hw-elegant), cursive", fontSize: 29, color: ON_DESK, margin: 0 }}>
              Writing to her
            </h2>
            <p className="m-0 mt-1 text-[12.5px]" style={{ color: ON_DESK_SOFT }}>
              Take your time. It arrives a word at a time, the way you wrote it, and
              the flowers grow round the page as she reads.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(["letter", "stationery", "sections", "photos", "ending"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className="flex-1 cursor-pointer rounded-lg px-2 py-2" style={tabStyle(tab === t)}>
                {t === "letter" ? "The letter" : t === "stationery" ? "Paper" : t === "sections" ? "Sections" : t === "photos" ? "Photos" : "The end"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 rounded-xl p-4" style={{ background: CARD, border: `1px solid ${EDGE}` }}>
            {/* ---------- the letter ---------- */}
            {tab === "letter" && (
              <>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>On the tag</span>
                  <input type="text" value={value.tag} onChange={(e) => patch({ tag: e.target.value })} placeholder="For Mom" className={field} style={fieldStyle} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>How it opens</span>
                  <input type="text" value={value.greeting} onChange={(e) => patch({ greeting: e.target.value })} placeholder="Mom," className={field} style={fieldStyle} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>The letter</span>
                  <textarea
                    value={value.body}
                    onChange={(e) => patch({ body: e.target.value })}
                    rows={12}
                    placeholder={"Leave a blank line between paragraphs.\n\nDon't try to make it neat. Neat isn't the point."}
                    className={field}
                    style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.6 }}
                  />
                  <span className="mt-1.5 block text-[11px]" style={{ color: SOFT }}>
                    {paragraphs.length} paragraph{paragraphs.length === 1 ? "" : "s"} — photos can be tucked after any of them.
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Things you&apos;ve never said</span>
                  <textarea
                    value={value.neverSaid}
                    onChange={(e) => patch({ neverSaid: e.target.value })}
                    rows={5}
                    placeholder="Held back until near the end, under its own heading. Leave it empty if it isn't right."
                    className={field}
                    style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.6 }}
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Closing</span>
                    <input type="text" value={value.closing} onChange={(e) => patch({ closing: e.target.value })} placeholder="All my love," className={field} style={fieldStyle} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Signed</span>
                    <input type="text" value={value.signature} onChange={(e) => patch({ signature: e.target.value })} placeholder="your name" className={field} style={fieldStyle} />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Date, as you&apos;d write it</span>
                    <input type="text" value={value.dateLine} onChange={(e) => patch({ dateLine: e.target.value })} placeholder="Mother's Day, 2026" className={field} style={fieldStyle} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Ink flows at</span>
                    <input
                      type="range"
                      min={60}
                      max={260}
                      step={10}
                      value={value.writingSpeed}
                      onChange={(e) => patch({ writingSpeed: Number(e.target.value) })}
                      className="w-full cursor-pointer"
                      style={{ accentColor: ACCENT }}
                    />
                    <span className="block text-[11px]" style={{ color: SOFT }}>
                      {value.writingSpeed <= 100 ? "very slow" : value.writingSpeed <= 160 ? "unhurried" : "brisker"}
                    </span>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>P.S.</span>
                  <input type="text" value={value.postscript} onChange={(e) => patch({ postscript: e.target.value })} placeholder="optional" className={field} style={fieldStyle} />
                </label>
              </>
            )}

            {/* ---------- stationery ---------- */}
            {tab === "stationery" && (
              <>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Paper</span>
                  <Chips ids={PAPER_IDS} value={value.paper} onChange={(v) => patch({ paper: v })} labelOf={(id) => PAPERS[id].label} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Its colour</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PAPER_COLOUR_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => patch({ paperColour: id })}
                        aria-pressed={value.paperColour === id}
                        title={PAPER_COLOURS[id].label}
                        aria-label={PAPER_COLOURS[id].label}
                        className="cursor-pointer rounded-full"
                        style={{
                          width: 26,
                          height: 26,
                          background: PAPER_COLOURS[id].hex,
                          border: value.paperColour === id ? `2px solid ${ACCENT}` : `1px solid ${EDGE}`,
                        }}
                      />
                    ))}
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Envelope</span>
                  <div className="flex flex-wrap gap-1.5">
                    {ENVELOPE_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => patch({ envelope: id })}
                        aria-pressed={value.envelope === id}
                        title={ENVELOPE_STYLES[id].label}
                        className="cursor-pointer overflow-hidden rounded-md"
                        style={{
                          width: 46,
                          height: 32,
                          background: ENVELOPE_STYLES[id].body,
                          border: value.envelope === id ? `2px solid ${ACCENT}` : `1px solid ${EDGE}`,
                        }}
                      >
                        <span
                          aria-hidden
                          className="block"
                          style={{ height: 16, background: ENVELOPE_STYLES[id].flap, clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                        />
                      </button>
                    ))}
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Wax</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SEAL_COLOUR_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => patch({ sealColour: id })}
                        aria-pressed={value.sealColour === id}
                        title={SEAL_COLOURS[id].label}
                        aria-label={SEAL_COLOURS[id].label}
                        className="cursor-pointer rounded-full"
                        style={{
                          width: 26,
                          height: 26,
                          background: `radial-gradient(circle at 34% 28%, ${SEAL_COLOURS[id].light}, ${SEAL_COLOURS[id].base} 58%, ${SEAL_COLOURS[id].deep})`,
                          border: value.sealColour === id ? `2px solid ${INK}` : `1px solid ${EDGE}`,
                        }}
                      />
                    ))}
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Pressed into it</span>
                  <Chips ids={SEAL_SYMBOL_IDS} value={value.sealSymbol} onChange={(v) => patch({ sealSymbol: v })} labelOf={(id) => SEAL_SYMBOL_LABELS[id]} />
                </label>

                {value.sealSymbol === "initial" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Her initial</span>
                    <input
                      type="text"
                      maxLength={2}
                      value={value.sealInitial}
                      onChange={(e) => patch({ sealInitial: e.target.value })}
                      className={field}
                      style={{ ...fieldStyle, width: 80, textAlign: "center" }}
                    />
                  </label>
                )}

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Your handwriting</span>
                  <div className="flex flex-col gap-1.5">
                    {HAND_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => patch({ hand: id })}
                        aria-pressed={value.hand === id}
                        className="cursor-pointer rounded-md px-3 py-2 text-left"
                        style={{
                          background: value.hand === id ? "rgba(168,117,106,.1)" : "#fffdf8",
                          border: `1px solid ${value.hand === id ? ACCENT : EDGE}`,
                        }}
                      >
                        <span style={{ fontFamily: HANDS[id].family, fontSize: 19 * HANDS[id].scale, color: INK }}>
                          Thank you for everything, Mom
                        </span>
                        <span className="mt-0.5 block" style={{ ...label, fontSize: 8.5 }}>{HANDS[id].label}</span>
                      </button>
                    ))}
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Ink</span>
                  <div className="flex flex-wrap gap-1.5">
                    {INK_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => patch({ ink: id })}
                        aria-pressed={value.ink === id}
                        title={INKS[id].label}
                        aria-label={INKS[id].label}
                        className="cursor-pointer rounded-full"
                        style={{
                          width: 24,
                          height: 24,
                          background: INKS[id].hex,
                          border: value.ink === id ? `2px solid ${ACCENT}` : `1px solid ${EDGE}`,
                        }}
                      />
                    ))}
                  </div>
                </label>

                <div className="flex flex-col gap-2 rounded-lg p-3" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}` }}>
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input type="checkbox" checked={value.garden} onChange={(e) => patch({ garden: e.target.checked })} className="h-4 w-4 cursor-pointer" style={{ accentColor: ACCENT }} />
                    <span className="text-[12.5px]" style={{ color: INK }}>
                      Let the garden grow round the page as she reads
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input type="checkbox" checked={value.ambience} onChange={(e) => patch({ ambience: e.target.checked })} className="h-4 w-4 cursor-pointer" style={{ accentColor: ACCENT }} />
                    <span className="text-[12.5px]" style={{ color: INK }}>
                      Offer the morning sounds
                    </span>
                  </label>
                  <p className="m-0 text-[11px]" style={{ color: SOFT }}>
                    The piano, birds and breeze are generated in her browser rather than
                    downloaded — no files, and it stays silent until she asks for it.
                  </p>
                </div>
              </>
            )}

            {/* ---------- the special sections ---------- */}
            {tab === "sections" && (
              <>
                <div className="flex flex-col gap-3">
                  <span style={{ ...label, color: ACCENT }}>My favourite memory</span>
                  <input type="text" value={value.favouriteMemoryTitle} onChange={(e) => patch({ favouriteMemoryTitle: e.target.value })} placeholder="What to call it" className={field} style={fieldStyle} />
                  <textarea value={value.favouriteMemoryStory} onChange={(e) => patch({ favouriteMemoryStory: e.target.value })} rows={4} placeholder="The story of it" className={field} style={{ ...fieldStyle, resize: "vertical" }} />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => pick("favourite")} className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}`, color: INK }}>
                      {value.favouriteMemoryPhoto ? "Replace the photograph" : "Add a photograph"}
                    </button>
                    {value.favouriteMemoryPhoto && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={value.favouriteMemoryPhoto} alt="" className="h-10 w-14 rounded object-cover" />
                    )}
                  </div>
                </div>

                <div className="my-1 h-px" style={{ background: EDGE }} />

                {/* what you taught me */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span style={{ ...label, color: ACCENT }}>What you taught me</span>
                    <button
                      type="button"
                      onClick={() =>
                        value.lessons.length < 8 &&
                        patch({ lessons: [...value.lessons, { ...makeLesson(freshId("l", value.lessons.map((l) => l.id))), ...SUGGESTED_LESSONS[value.lessons.length % SUGGESTED_LESSONS.length] }] })
                      }
                      disabled={value.lessons.length >= 8}
                      className="cursor-pointer rounded-md px-2.5 py-1 text-[11px] disabled:opacity-35"
                      style={{ background: "rgba(168,117,106,.14)", border: `1px solid ${ACCENT}`, color: ACCENT }}
                    >
                      + Add
                    </button>
                  </div>
                  {value.lessons.map((l) => (
                    <div key={l.id} className="flex flex-col gap-1.5 rounded-lg p-2.5" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}` }}>
                      <div className="flex gap-1.5">
                        <input type="text" value={l.title} onChange={(e) => patch({ lessons: value.lessons.map((x) => (x.id === l.id ? { ...x, title: e.target.value } : x)) })} placeholder="The lesson" className={field} style={fieldStyle} />
                        <button type="button" onClick={() => patch({ lessons: value.lessons.filter((x) => x.id !== l.id) })} aria-label="Remove" className="cursor-pointer px-1 text-[13px]" style={{ background: "transparent", color: "#a83c2c" }}>×</button>
                      </div>
                      <textarea value={l.body} onChange={(e) => patch({ lessons: value.lessons.map((x) => (x.id === l.id ? { ...x, body: e.target.value } : x)) })} rows={2} placeholder="How she taught it" className={field} style={{ ...fieldStyle, resize: "vertical" }} />
                      <select
                        value={l.motif}
                        onChange={(e) => patch({ lessons: value.lessons.map((x) => (x.id === l.id ? { ...x, motif: e.target.value as Lesson["motif"] } : x)) })}
                        aria-label="The drawing on the card"
                        className="rounded-md px-2 py-1 text-[12px] outline-none"
                        style={fieldStyle}
                      >
                        {(["flower", "cup", "hands", "thread", "sun", "house", "bird", "book"] as const).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {value.lessons.length === 0 && <p className="m-0 text-[12px]" style={{ color: SOFT }}>Nothing yet.</p>}
                </div>

                <div className="my-1 h-px" style={{ background: EDGE }} />

                {/* thank you */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span style={{ ...label, color: ACCENT }}>Thank you for…</span>
                    <button
                      type="button"
                      onClick={() =>
                        value.thanks.length < 10 &&
                        patch({ thanks: [...value.thanks, { ...makeThanks(freshId("t", value.thanks.map((t) => t.id))), text: SUGGESTED_THANKS[value.thanks.length % SUGGESTED_THANKS.length] }] })
                      }
                      disabled={value.thanks.length >= 10}
                      className="cursor-pointer rounded-md px-2.5 py-1 text-[11px] disabled:opacity-35"
                      style={{ background: "rgba(168,117,106,.14)", border: `1px solid ${ACCENT}`, color: ACCENT }}
                    >
                      + Add
                    </button>
                  </div>
                  {value.thanks.map((t) => (
                    <div key={t.id} className="flex gap-1.5">
                      <input type="text" value={t.text} onChange={(e) => patch({ thanks: value.thanks.map((x) => (x.id === t.id ? { ...x, text: e.target.value } : x)) })} className={field} style={fieldStyle} />
                      <button type="button" onClick={() => patch({ thanks: value.thanks.filter((x) => x.id !== t.id) })} aria-label="Remove" className="cursor-pointer px-1 text-[13px]" style={{ background: "transparent", color: "#a83c2c" }}>×</button>
                    </div>
                  ))}
                  {value.thanks.length === 0 && <p className="m-0 text-[12px]" style={{ color: SOFT }}>Nothing pinned yet.</p>}
                </div>

                <div className="my-1 h-px" style={{ background: EDGE }} />

                {/* her voice */}
                <div className="flex flex-col gap-2">
                  <span style={{ ...label, color: ACCENT }}>Your voice</span>
                  <div className="flex gap-1.5">
                    <input type="url" value={value.voiceUrl} onChange={(e) => patch({ voiceUrl: e.target.value })} placeholder="https://…" className={field} style={fieldStyle} />
                    <button type="button" onClick={() => pick("voice")} className="flex-none cursor-pointer rounded-md px-2.5 text-[11px]" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}`, color: INK }}>
                      Upload
                    </button>
                  </div>
                  <input type="text" value={value.voiceLabel} onChange={(e) => patch({ voiceLabel: e.target.value })} placeholder="What it says above the seal" className={field} style={fieldStyle} />
                </div>
              </>
            )}

            {/* ---------- photos and decorations ---------- */}
            {tab === "photos" && (
              <>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span style={{ ...label, color: ACCENT }}>Tucked between paragraphs</span>
                    <button
                      type="button"
                      onClick={() => value.polaroids.length < 10 && patch({ polaroids: [...value.polaroids, makePolaroid(freshId("p", value.polaroids.map((p) => p.id)), Math.min(value.polaroids.length, Math.max(0, paragraphs.length - 1))) ] })}
                      disabled={value.polaroids.length >= 10}
                      className="cursor-pointer rounded-md px-2.5 py-1 text-[11px] disabled:opacity-35"
                      style={{ background: "rgba(168,117,106,.14)", border: `1px solid ${ACCENT}`, color: ACCENT }}
                    >
                      + Add a photo
                    </button>
                  </div>

                  {value.polaroids.map((p: Polaroid) => (
                    <div key={p.id} className="flex flex-col gap-1.5 rounded-lg p-2.5" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}` }}>
                      <div className="flex items-center gap-2">
                        {p.url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={p.url} alt="" className="h-12 w-12 rounded object-cover" />
                        ) : (
                          <span className="flex h-12 w-12 items-center justify-center rounded text-[9px]" style={{ background: "#e6dccc", color: SOFT }}>none</span>
                        )}
                        <button type="button" onClick={() => pick({ polaroid: p.id })} className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]" style={{ background: "#fffdf8", border: `1px solid ${EDGE}`, color: INK }}>
                          {p.url ? "Replace" : "Upload"}
                        </button>
                        <button type="button" onClick={() => patch({ polaroids: value.polaroids.filter((x) => x.id !== p.id) })} aria-label="Remove" className="ml-auto cursor-pointer px-1 text-[13px]" style={{ background: "transparent", color: "#a83c2c" }}>×</button>
                      </div>
                      <input type="text" value={p.caption} onChange={(e) => patch({ polaroids: value.polaroids.map((x) => (x.id === p.id ? { ...x, caption: e.target.value } : x)) })} placeholder="What she'll read under it" className={field} style={fieldStyle} />
                      <label className="flex items-center gap-2">
                        <span style={{ ...label, fontSize: 8.5 }}>after paragraph</span>
                        <input
                          type="number"
                          min={1}
                          max={Math.max(1, paragraphs.length)}
                          value={p.afterParagraph + 1}
                          onChange={(e) =>
                            patch({
                              polaroids: value.polaroids.map((x) =>
                                x.id === p.id ? { ...x, afterParagraph: Math.max(0, Math.min(Math.max(0, paragraphs.length - 1), Number(e.target.value) - 1)) } : x
                              ),
                            })
                          }
                          className="w-16 rounded-md px-2 py-1 text-[12px] outline-none"
                          style={fieldStyle}
                        />
                        <span className="text-[11px]" style={{ color: SOFT }}>of {paragraphs.length}</span>
                      </label>
                    </div>
                  ))}
                  {value.polaroids.length === 0 && <p className="m-0 text-[12px]" style={{ color: SOFT }}>No photographs yet.</p>}
                </div>

                <div className="my-1 h-px" style={{ background: EDGE }} />

                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span style={{ ...label, color: ACCENT }}>Laid on the page</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (value.decorations.length >= 20) return;
                        const i = value.decorations.length;
                        const kind = DECOR_IDS[i % DECOR_IDS.length];
                        const spots: [number, number][] = [
                          [6, 10], [94, 14], [8, 88], [92, 84], [50, 4], [4, 48], [96, 52], [24, 96],
                        ];
                        const [x, y] = spots[i % spots.length];
                        patch({
                          decorations: [
                            ...value.decorations,
                            { ...makeDecor(freshId("d", value.decorations.map((d) => d.id)), kind), x, y, rotate: (i % 5) * 14 - 28, scale: 0.9 + (i % 3) * 0.2 },
                          ],
                        });
                      }}
                      disabled={value.decorations.length >= 20}
                      className="cursor-pointer rounded-md px-2.5 py-1 text-[11px] disabled:opacity-35"
                      style={{ background: "rgba(168,117,106,.14)", border: `1px solid ${ACCENT}`, color: ACCENT }}
                    >
                      + Add
                    </button>
                  </div>

                  {value.decorations.map((d: Decor) => (
                    <div key={d.id} className="flex items-center gap-1.5 rounded-lg p-2" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}` }}>
                      <select
                        value={d.kind}
                        onChange={(e) => patch({ decorations: value.decorations.map((x) => (x.id === d.id ? { ...x, kind: e.target.value as Decor["kind"] } : x)) })}
                        aria-label="What it is"
                        className="min-w-0 flex-1 rounded-md px-2 py-1 text-[12px] outline-none"
                        style={fieldStyle}
                      >
                        {DECOR_IDS.map((k) => (
                          <option key={k} value={k}>{DECOR_LABELS[k]}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1">
                        <span style={{ ...label, fontSize: 8 }}>x</span>
                        <input type="number" min={-6} max={106} value={d.x} onChange={(e) => patch({ decorations: value.decorations.map((x) => (x.id === d.id ? { ...x, x: Number(e.target.value) } : x)) })} className="w-14 rounded px-1.5 py-1 text-[12px] outline-none" style={fieldStyle} />
                      </label>
                      <label className="flex items-center gap-1">
                        <span style={{ ...label, fontSize: 8 }}>y</span>
                        <input type="number" min={-6} max={106} value={d.y} onChange={(e) => patch({ decorations: value.decorations.map((x) => (x.id === d.id ? { ...x, y: Number(e.target.value) } : x)) })} className="w-14 rounded px-1.5 py-1 text-[12px] outline-none" style={fieldStyle} />
                      </label>
                      <button type="button" onClick={() => patch({ decorations: value.decorations.filter((x) => x.id !== d.id) })} aria-label="Remove" className="cursor-pointer px-1 text-[13px]" style={{ background: "transparent", color: "#a83c2c" }}>×</button>
                    </div>
                  ))}
                  {value.decorations.length === 0 && <p className="m-0 text-[12px]" style={{ color: SOFT }}>Nothing laid on it yet.</p>}
                </div>
              </>
            )}

            {/* ---------- the ending ---------- */}
            {tab === "ending" && (
              <>
                <p className="m-0 text-[12.5px]" style={{ color: SOFT }}>
                  The last thing she sees before the letter folds itself back up.
                </p>

                <div className="flex flex-col gap-2">
                  <span className="block" style={label}>All of you, together</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => pick("family")} className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}`, color: INK }}>
                      {value.familyPhoto ? "Replace" : "Add the family photograph"}
                    </button>
                    {value.familyPhoto && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={value.familyPhoto} alt="" className="h-10 w-14 rounded object-cover" />
                    )}
                    {busy && <span style={{ ...label, fontSize: 8.5 }}>uploading…</span>}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>The last line</span>
                  <textarea
                    value={value.finalLine}
                    onChange={(e) => patch({ finalLine: e.target.value })}
                    rows={2}
                    placeholder="No matter how old I become, I'll always be your child."
                    className={field}
                    style={{ ...fieldStyle, resize: "vertical" }}
                  />
                </label>
              </>
            )}
          </div>
        </div>

        {/* ---------------- right: as she'll read it ---------------- */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span style={{ ...label, color: ON_DESK_SOFT }}>How she&apos;ll read it</span>
            <button
              type="button"
              onClick={() => setPreviewKey((k) => k + 1)}
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]"
              style={{ background: "rgba(90,66,42,.16)", border: "1px solid rgba(58,44,30,.26)", color: ON_DESK }}
            >
              ↺ From the start
            </button>
          </div>
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(58,44,30,.2)", height: "min(82vh, 900px)" }}>
            <div key={previewKey} className="h-full overflow-y-auto">
              <MothersDayLetterView content={value} embedded />
            </div>
          </div>
          <p className="m-0 text-[11px]" style={{ color: ON_DESK_SOFT }}>
            The preview starts at the letter itself. She&apos;ll see the table, the
            tea and the envelope first.
          </p>
        </div>
      </div>
    </div>
  );
}
