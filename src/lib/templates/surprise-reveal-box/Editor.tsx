"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ibmPlexMono } from "@/app/fonts";
import { LETTER_FONT_VARS } from "@/app/letterFonts";
import {
  BOX_MATERIALS,
  BOX_MATERIAL_IDS,
  RIBBONS,
  RIBBON_IDS,
  WRAPPINGS,
  WRAPPING_IDS,
} from "@/lib/engines/gift";
import {
  BLOCK_GLYPHS,
  BLOCK_KINDS,
  BLOCK_LABELS,
  makeBlock,
  type MemoryBlock,
} from "@/lib/engines/memory-block/schema";
import {
  GUARD_KINDS,
  GUARD_LABELS,
  GUARD_NOTES,
  makeLayer,
  normaliseCode,
  type GuardKind,
  type Layer,
  type SurpriseBoxContent,
} from "./schema";
import { SCHEMES, SCHEME_IDS, STICKER_IDS, STICKER_LABELS } from "./theme";
import { SurpriseBoxView } from "./View";

/* The workbench is the wrapping table: paper offcuts, ribbon ends, scissors just
   out of frame. Bright, like the experience it makes. */
const BENCH_TOP = "#e8a05c";
const BENCH = "#c07a3c";
const CARD = "#fdf4e2";
const CARD_DEEP = "#f4e6cc";
const EDGE = "rgba(80,44,16,.2)";
const INK = "#3c2412";
const SOFT = "#8a6440";
const ACCENT = "#c62f24";
/* Text that sits on the bare table rather than on a card. */
const ON_BENCH = "#fff6e6";
const ON_BENCH_SOFT = "rgba(255,246,230,.72)";

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

/**
 * A sequence that builds: something to read, then something to look at, then
 * something to hear, then the thing itself. Offered so a new box is never blank.
 */
const SEQUENCE: { kind: MemoryBlock["kind"]; guard: GuardKind; tag: string }[] = [
  { kind: "text", guard: "none", tag: "Open me first" },
  { kind: "photo", guard: "scratch", tag: "Still not it" },
  { kind: "voice", guard: "key", tag: "Getting warmer" },
  { kind: "letter", guard: "combination", tag: "Nearly" },
  { kind: "video", guard: "fit", tag: "Almost there" },
  { kind: "quote", guard: "map", tag: "Last one" },
  { kind: "song", guard: "none", tag: "" },
  { kind: "artwork", guard: "none", tag: "" },
];

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
            background: value === id ? "rgba(198,47,36,.12)" : "#fffdf7",
            border: `1px solid ${value === id ? ACCENT : EDGE}`,
            color: value === id ? ACCENT : SOFT,
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

export function SurpriseBoxEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: SurpriseBoxContent;
  onChange: (value: SurpriseBoxContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<"gift" | "box" | "guard" | "inside">("gift");
  const [previewKey, setPreviewKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const layers = value.layers;
  const current = layers[selected];

  const patch = (p: Partial<SurpriseBoxContent>) => onChange({ ...value, ...p });
  const patchLayer = (id: string, p: Partial<Layer>) =>
    patch({ layers: layers.map((l) => (l.id === id ? { ...l, ...p } : l)) });
  const patchReward = (id: string, p: Partial<MemoryBlock>) =>
    patch({ layers: layers.map((l) => (l.id === id ? { ...l, reward: { ...l.reward, ...p } } : l)) });

  const freshId = () => {
    const used = new Set(layers.map((l) => l.id));
    let n = 1;
    while (used.has(`l-${n}`)) n += 1;
    return `l-${n}`;
  };

  /** Each new box follows the sequence and takes the scheme's own materials. */
  const addLayer = () => {
    if (layers.length >= 8) return;
    const i = layers.length;
    const step = SEQUENCE[i % SEQUENCE.length];
    const scheme = SCHEMES[value.scheme];
    const id = freshId();
    const fresh: Layer = {
      ...makeLayer(id, makeBlock(`${id}-r`, step.kind)),
      guard: step.guard,
      tag: step.tag,
      wrapping: WRAPPING_IDS[i % WRAPPING_IDS.length],
      ribbon: i === 0 ? scheme.defaults.ribbon : RIBBON_IDS[i % RIBBON_IDS.length],
      material: scheme.defaults.material,
      sticker: STICKER_IDS[(i % (STICKER_IDS.length - 1)) + 1],
    };
    patch({ layers: [...layers, fresh] });
    setSelected(i);
    setTab("inside");
  };

  const removeLayer = (i: number) => {
    patch({ layers: layers.filter((_, idx) => idx !== i) });
    setSelected((s) => Math.max(0, Math.min(s, layers.length - 2)));
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= layers.length) return;
    const next = [...layers];
    [next[i], next[j]] = [next[j], next[i]];
    patch({ layers: next });
    setSelected(j);
  };

  const upload = async (file: File, slot: "imageUrl" | "audioUrl" | "videoUrl") => {
    if (!current) return;
    setBusy(true);
    try {
      const url = await uploadPhoto(file);
      /* Empty means the upload was refused; the reason is already on screen. */
      if (url) patchReward(current.id, { [slot]: url } as Partial<MemoryBlock>);
    } finally {
      setBusy(false);
    }
  };

  /* The tabs sit on the bare table, so they need light text on a darkened panel —
     the card palette's mid-brown would vanish into the wood. */
  const tabStyle = (active: boolean): CSSProperties => ({
    ...label,
    background: active ? CARD : "rgba(64,32,10,.42)",
    border: `1px solid ${active ? ACCENT : "rgba(255,246,230,.32)"}`,
    color: active ? ACCENT : ON_BENCH,
  });

  return (
    <div
      className={`${LETTER_FONT_VARS} ${ibmPlexMono.variable} rounded-2xl p-4 sm:p-5`}
      style={{
        background: `linear-gradient(168deg, ${BENCH_TOP}, ${BENCH})`,
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
          const slot = f.type.startsWith("audio/") ? "audioUrl" : f.type.startsWith("video/") ? "videoUrl" : "imageUrl";
          await upload(f, slot);
          if (fileRef.current) fileRef.current.value = "";
        }}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* ---------------- left: wrapping it ---------------- */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 style={{ fontFamily: "var(--hw-messy), cursive", fontSize: 27, color: ON_BENCH, margin: 0 }}>
              Wrapping it
            </h2>
            <p className="m-0 mt-1 text-[12.5px]" style={{ color: ON_BENCH_SOFT }}>
              A box inside a box inside a box. Each one holds something, and some of
              them don&apos;t open until they&apos;ve worked for it.
            </p>
          </div>

          <div className="flex gap-1.5">
            {(["gift", "box", "guard", "inside"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className="flex-1 cursor-pointer rounded-lg px-2 py-2" style={tabStyle(tab === t)}>
                {t === "gift" ? "The gift" : t === "box" ? "This box" : t === "guard" ? "In the way" : "Inside"}
              </button>
            ))}
          </div>

          {/* the boxes */}
          <div className="rounded-xl p-3" style={{ background: CARD, border: `1px solid ${EDGE}` }}>
            <div className="mb-2 flex items-center justify-between">
              <span style={label}>{layers.length} of 8 boxes</span>
              <button
                type="button"
                onClick={addLayer}
                disabled={layers.length >= 8}
                className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px] disabled:opacity-35"
                style={{ background: "rgba(198,47,36,.12)", border: `1px solid ${ACCENT}`, color: ACCENT }}
              >
                + Another box
              </button>
            </div>

            <div className="flex max-h-52 flex-col gap-1.5 overflow-y-auto pr-1">
              {layers.map((l, i) => (
                <div
                  key={l.id}
                  className="flex items-center gap-1.5 rounded-md p-1.5"
                  style={{
                    background: i === selected ? "rgba(198,47,36,.09)" : "transparent",
                    border: `1px solid ${i === selected ? "rgba(198,47,36,.4)" : "transparent"}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setSelected(i); setTab("inside"); }}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 bg-transparent text-left"
                  >
                    <span
                      className="h-7 w-7 flex-none rounded-[3px]"
                      style={{
                        background: WRAPPINGS[l.wrapping].pattern(SCHEMES[value.scheme].paperA, SCHEMES[value.scheme].paperB),
                        border: `1px solid ${BOX_MATERIALS[l.material].edge}`,
                      }}
                    />
                    <span className="h-6 w-1.5 flex-none rounded-full" style={{ background: RIBBONS[l.ribbon].hex }} />
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px]" style={{ color: INK }}>
                        {l.reward.title || l.tag || `Box ${i + 1}`}
                      </span>
                      <span className="block" style={{ ...label, fontSize: 8.5 }}>
                        {BLOCK_GLYPHS[l.reward.kind]} {BLOCK_LABELS[l.reward.kind]}
                        {l.guard !== "none" && ` · ${GUARD_LABELS[l.guard]}`}
                      </span>
                    </span>
                  </button>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move outward" className="cursor-pointer px-1 text-[8px] disabled:opacity-25" style={{ background: "transparent", color: SOFT }}>▲</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === layers.length - 1} aria-label="Move inward" className="cursor-pointer px-1 text-[8px] disabled:opacity-25" style={{ background: "transparent", color: SOFT }}>▼</button>
                  <button type="button" onClick={() => removeLayer(i)} aria-label="Remove" className="cursor-pointer px-1 text-[11px]" style={{ background: "transparent", color: "#a83c2c" }}>×</button>
                </div>
              ))}
              {layers.length === 0 && (
                <p className="m-0 py-2 text-center text-[12px]" style={{ color: SOFT }}>Nothing wrapped yet.</p>
              )}
            </div>

            <p className="m-0 mt-2.5 text-[11px]" style={{ color: SOFT }}>
              The first box is the one they see. Each one after it is inside the last.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-xl p-4" style={{ background: CARD, border: `1px solid ${EDGE}` }}>
            {/* ---------- the gift as a whole ---------- */}
            {tab === "gift" && (
              <>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Palette</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SCHEME_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => patch({ scheme: id })}
                        aria-pressed={value.scheme === id}
                        title={SCHEMES[id].label}
                        className="cursor-pointer overflow-hidden rounded-lg"
                        style={{
                          width: 60, height: 44,
                          background: SCHEMES[id].bg,
                          border: value.scheme === id ? `2px solid ${ACCENT}` : `1px solid ${EDGE}`,
                        }}
                      >
                        <span
                          className="mx-auto mt-1.5 block h-3 w-8 rounded-sm"
                          style={{ background: WRAPPINGS[SCHEMES[id].defaults.wrapping].pattern(SCHEMES[id].paperA, SCHEMES[id].paperB) }}
                        />
                        <span className="mt-1 block px-1 text-[7px] leading-tight" style={{ color: SCHEMES[id].ink }}>
                          {SCHEMES[id].label}
                        </span>
                      </button>
                    ))}
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>To</span>
                    <input type="text" value={value.toLine} onChange={(e) => patch({ toLine: e.target.value })} className={field} style={fieldStyle} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>From</span>
                    <input type="text" value={value.fromLine} onChange={(e) => patch({ fromLine: e.target.value })} className={field} style={fieldStyle} />
                  </label>
                </div>

                <div>
                  <span className="mb-1.5 block" style={label}>What you say before they touch it</span>
                  <div className="flex flex-col gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <input
                        key={i}
                        type="text"
                        value={value.openingLines[i] ?? ""}
                        onChange={(e) => {
                          const next = [...value.openingLines];
                          while (next.length < 3) next.push("");
                          next[i] = e.target.value;
                          patch({ openingLines: next });
                        }}
                        placeholder={["This one's got layers.", "Sorry in advance.", ""][i]}
                        className={field}
                        style={fieldStyle}
                      />
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>The last line</span>
                  <input type="text" value={value.closingLine} onChange={(e) => patch({ closingLine: e.target.value })} placeholder="Told you it had layers." className={field} style={fieldStyle} />
                </label>

                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={value.confetti}
                    onChange={(e) => patch({ confetti: e.target.checked })}
                    className="h-4 w-4 cursor-pointer"
                    style={{ accentColor: ACCENT }}
                  />
                  <span className="text-[12.5px]" style={{ color: INK }}>Confetti at the end</span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Music, once they start</span>
                  <input type="url" value={value.musicUrl} onChange={(e) => patch({ musicUrl: e.target.value })} placeholder="https://… (optional)" className={field} style={fieldStyle} />
                </label>
              </>
            )}

            {!current && tab !== "gift" && (
              <p className="m-0 text-[12.5px]" style={{ color: SOFT }}>Add a box to begin.</p>
            )}

            {/* ---------- this box ---------- */}
            {tab === "box" && current && (
              <>
                <span style={{ ...label, color: ACCENT }}>Box {selected + 1}</span>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Paper</span>
                  <div className="flex flex-wrap gap-1.5">
                    {WRAPPING_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => patchLayer(current.id, { wrapping: id })}
                        aria-pressed={current.wrapping === id}
                        title={WRAPPINGS[id].label}
                        aria-label={WRAPPINGS[id].label}
                        className="cursor-pointer rounded-md"
                        style={{
                          width: 40, height: 30,
                          background: WRAPPINGS[id].pattern(SCHEMES[value.scheme].paperA, SCHEMES[value.scheme].paperB),
                          border: current.wrapping === id ? `2px solid ${ACCENT}` : `1px solid ${EDGE}`,
                        }}
                      />
                    ))}
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Ribbon</span>
                  <div className="flex flex-wrap gap-1.5">
                    {RIBBON_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => patchLayer(current.id, { ribbon: id })}
                        aria-pressed={current.ribbon === id}
                        title={RIBBONS[id].label}
                        aria-label={RIBBONS[id].label}
                        className="cursor-pointer rounded-full"
                        style={{
                          width: 26, height: 26,
                          background: `linear-gradient(135deg, ${RIBBONS[id].hex}, ${RIBBONS[id].sheen})`,
                          border: current.ribbon === id ? `2px solid ${INK}` : `1px solid ${EDGE}`,
                        }}
                      />
                    ))}
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>The box itself</span>
                  <Chips ids={BOX_MATERIAL_IDS} value={current.material} onChange={(v) => patchLayer(current.id, { material: v })} labelOf={(id) => BOX_MATERIALS[id].label} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Sticker</span>
                  <Chips ids={STICKER_IDS} value={current.sticker} onChange={(v) => patchLayer(current.id, { sticker: v })} labelOf={(id) => STICKER_LABELS[id]} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>On the tag</span>
                  <input type="text" value={current.tag} onChange={(e) => patchLayer(current.id, { tag: e.target.value })} placeholder="Open me first" className={field} style={fieldStyle} />
                </label>
              </>
            )}

            {/* ---------- what's in the way ---------- */}
            {tab === "guard" && current && (
              <>
                <p className="m-0 text-[12.5px]" style={{ color: SOFT }}>
                  Something small before the lid lifts. None of these can be failed,
                  and after a few seconds of struggling they&apos;re offered a way
                  straight through — the point is to slow them down, not to lock them out.
                </p>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Before this lid lifts</span>
                  <Chips ids={GUARD_KINDS} value={current.guard} onChange={(v) => patchLayer(current.id, { guard: v })} labelOf={(id) => GUARD_LABELS[id]} />
                  <span className="mt-2 block text-[11.5px]" style={{ color: SOFT }}>
                    {GUARD_NOTES[current.guard]}
                  </span>
                </label>

                {current.guard === "combination" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>The three digits</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={current.code}
                      onChange={(e) => patchLayer(current.id, { code: normaliseCode(e.target.value) })}
                      className={field}
                      style={{ ...fieldStyle, letterSpacing: ".3em", fontFamily: "var(--font-ibm-plex-mono), monospace" }}
                    />
                    <span className="mt-1.5 block text-[11px]" style={{ color: SOFT }}>
                      Pick something they&apos;d guess and nobody else would — a date, a house number.
                    </span>
                  </label>
                )}

                {current.guard !== "none" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>The clue above it</span>
                    <input
                      type="text"
                      value={current.clue}
                      onChange={(e) => patchLayer(current.id, { clue: e.target.value })}
                      placeholder={current.guard === "combination" ? "The day we met, backwards" : "You'll know this one"}
                      className={field}
                      style={fieldStyle}
                    />
                  </label>
                )}
              </>
            )}

            {/* ---------- what's inside ---------- */}
            {tab === "inside" && current && (
              <>
                <div className="flex items-center justify-between">
                  <span style={{ ...label, color: ACCENT }}>Inside box {selected + 1}</span>
                  {busy && <span style={{ ...label, fontSize: 8.5 }}>uploading…</span>}
                </div>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>What they find</span>
                  <Chips
                    ids={BLOCK_KINDS}
                    value={current.reward.kind}
                    onChange={(v) => patchReward(current.id, { kind: v })}
                    labelOf={(id) => BLOCK_LABELS[id]}
                    glyphOf={(id) => BLOCK_GLYPHS[id]}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Heading</span>
                  <input type="text" value={current.reward.title} onChange={(e) => patchReward(current.id, { title: e.target.value })} placeholder="optional" className={field} style={fieldStyle} />
                </label>

                {current.reward.kind !== "map" && current.reward.kind !== "date" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>
                      {current.reward.kind === "quote" ? "The quote" : current.reward.kind === "song" ? "Song title" : "Words"}
                    </span>
                    <textarea
                      value={current.reward.body}
                      onChange={(e) => patchReward(current.id, { body: e.target.value })}
                      rows={current.reward.kind === "letter" ? 5 : 3}
                      className={field}
                      style={{ ...fieldStyle, resize: "vertical" }}
                    />
                  </label>
                )}

                {(current.reward.kind === "photo" || current.reward.kind === "artwork" || current.reward.kind === "voice" || current.reward.kind === "video") && (
                  <div>
                    <span className="mb-1.5 block" style={label}>The file</span>
                    {current.reward.imageUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={current.reward.imageUrl} alt="" className="mb-2 block h-24 w-full rounded-md object-cover" />
                    )}
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => fileRef.current?.click()} className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}`, color: INK }}>
                        Upload
                      </button>
                      <span className="self-center truncate text-[11px]" style={{ color: SOFT }}>
                        {current.reward.audioUrl || current.reward.videoUrl || (current.reward.imageUrl ? "" : "nothing attached")}
                      </span>
                    </div>
                  </div>
                )}

                {(current.reward.kind === "song" || current.reward.kind === "quote" || current.reward.kind === "photo") && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>
                      {current.reward.kind === "quote" ? "Who said it" : current.reward.kind === "song" ? "Artist" : "Credit"}
                    </span>
                    <input type="text" value={current.reward.credit} onChange={(e) => patchReward(current.id, { credit: e.target.value })} className={field} style={fieldStyle} />
                  </label>
                )}

                {current.reward.kind === "song" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>Link to it</span>
                    <input type="url" value={current.reward.linkUrl} onChange={(e) => patchReward(current.id, { linkUrl: e.target.value })} placeholder="https://open.spotify.com/…" className={field} style={fieldStyle} />
                  </label>
                )}

                {current.reward.kind === "map" && (
                  <>
                    <label className="block">
                      <span className="mb-1.5 block" style={label}>The place</span>
                      <input type="text" value={current.reward.place} onChange={(e) => patchReward(current.id, { place: e.target.value })} className={field} style={fieldStyle} />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="mb-1.5 block" style={label}>Latitude</span>
                        <input type="number" step="0.0001" value={current.reward.lat || ""} onChange={(e) => patchReward(current.id, { lat: Number(e.target.value) || 0 })} className={field} style={fieldStyle} />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block" style={label}>Longitude</span>
                        <input type="number" step="0.0001" value={current.reward.lng || ""} onChange={(e) => patchReward(current.id, { lng: Number(e.target.value) || 0 })} className={field} style={fieldStyle} />
                      </label>
                    </div>
                  </>
                )}

                {current.reward.kind === "date" && (
                  <>
                    <label className="block">
                      <span className="mb-1.5 block" style={label}>The date</span>
                      <input type="text" value={current.reward.when} onChange={(e) => patchReward(current.id, { when: e.target.value })} placeholder="14 February 2019" className={field} style={fieldStyle} />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block" style={label}>What happened</span>
                      <textarea value={current.reward.body} onChange={(e) => patchReward(current.id, { body: e.target.value })} rows={2} className={field} style={{ ...fieldStyle, resize: "vertical" }} />
                    </label>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* ---------------- right: the gift as they'll get it ---------------- */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span style={{ ...label, color: ON_BENCH_SOFT }}>How it opens</span>
            <button
              type="button"
              onClick={() => setPreviewKey((k) => k + 1)}
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]"
              style={{ background: "rgba(64,32,10,.42)", border: "1px solid rgba(255,246,230,.34)", color: ON_BENCH }}
            >
              ↺ Wrap it again
            </button>
          </div>
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,246,230,.26)", height: "min(80vh, 860px)" }}>
            <div key={previewKey} className="h-full overflow-y-auto">
              <SurpriseBoxView content={value} embedded />
            </div>
          </div>
          <p className="m-0 text-[11px]" style={{ color: ON_BENCH_SOFT }}>
            Open it here to check the order, and that every guard lets you through.
          </p>
        </div>
      </div>
    </div>
  );
}
