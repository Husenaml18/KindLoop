"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ibmPlexMono } from "@/app/fonts";
import { LETTER_FONT_VARS } from "@/app/letterFonts";
import { BLOCK_GLYPHS, BLOCK_KINDS, BLOCK_LABELS, makeBlock, type BlockKind, type MemoryBlock } from "@/lib/engines/memory-block/schema";
import {
  MILESTONE_MARKS,
  type MemoryPuzzleContent,
  type Milestone,
  type MilestoneMark,
  type Secret,
} from "./schema";
import {
  CUTS,
  CUT_IDS,
  DIFFICULTIES,
  DIFFICULTY_IDS,
  GRID_SIZES,
  MATERIALS,
  MATERIAL_IDS,
  SURFACES,
  SURFACE_IDS,
} from "./theme";
import { MemoryPuzzleView } from "./View";

/* The workbench is the table the puzzle is made on: warm wood and daylight, so
   the creator is already in the room the recipient will be in. */
const BENCH = "#7d5632";
const CARD = "#f7efdd";
const CARD_DEEP = "#eee2c8";
const EDGE = "rgba(74,50,26,.2)";
const INK = "#3a3026";
const SOFT = "#7d6b52";
const ACCENT = "#a8703c";
/* Text that sits on the bare wood rather than on a card. */
const ON_BENCH = "#fff4e0";
const ON_BENCH_SOFT = "rgba(255,244,224,.68)";

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

/** What each milestone is usually for, offered so nobody starts from nothing. */
const MILESTONE_SUGGESTIONS: Record<MilestoneMark, { headline: string; kind: BlockKind }> = {
  25: { headline: "It's starting to look like something.", kind: "text" },
  50: { headline: "Halfway. Here's my voice.", kind: "voice" },
  75: { headline: "Almost. Watch this bit.", kind: "video" },
  100: { headline: "There it is.", kind: "letter" },
};

function Chips<T extends string | number>({
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
          key={String(id)}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={value === id}
          className="flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px]"
          style={{
            background: value === id ? "rgba(168,112,60,.14)" : "#fffdf7",
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

export function MemoryPuzzleEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: MemoryPuzzleContent;
  onChange: (value: MemoryPuzzleContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [tab, setTab] = useState<"picture" | "puzzle" | "story" | "secrets" | "ending">("picture");
  const [selectedMilestone, setSelectedMilestone] = useState(0);
  const [previewKey, setPreviewKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const pictureRef = useRef<HTMLInputElement>(null);
  const rewardRef = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<MemoryPuzzleContent>) => onChange({ ...value, ...p });

  const milestones = [...value.milestones].sort((a, b) => a.at - b.at);
  const current = milestones[selectedMilestone];

  const patchMilestone = (at: MilestoneMark, p: Partial<Milestone>) =>
    patch({ milestones: value.milestones.map((m) => (m.at === at ? { ...m, ...p } : m)) });

  const patchReward = (at: MilestoneMark, p: Partial<MemoryBlock>) =>
    patch({
      milestones: value.milestones.map((m) => (m.at === at ? { ...m, reward: { ...m.reward, ...p } } : m)),
    });

  const toggleMilestone = (at: MilestoneMark) => {
    const exists = value.milestones.some((m) => m.at === at);
    if (exists) {
      patch({ milestones: value.milestones.filter((m) => m.at !== at) });
      setSelectedMilestone(0);
      return;
    }
    const s = MILESTONE_SUGGESTIONS[at];
    patch({
      milestones: [...value.milestones, { at, headline: s.headline, reward: makeBlock(`m-${at}`, s.kind) }],
    });
    setSelectedMilestone(milestones.length);
    setTab("story");
  };

  const upload = async (file: File, apply: (url: string) => void) => {
    setBusy(true);
    try {
      const url = await uploadPhoto(file);
      /* An empty URL means the upload was refused and the reason is already on
         screen — applying it would quietly clear whatever was there before. */
      if (url) apply(url);
    } finally {
      setBusy(false);
    }
  };

  /* ---------- secrets ---------- */

  const addSecret = () => {
    if (value.secrets.length >= 12) return;
    const used = new Set(value.secrets.map((s) => s.id));
    let n = 1;
    while (used.has(`s-${n}`)) n += 1;
    /* Default to a piece nobody has claimed yet, so two secrets don't collide. */
    const taken = new Set(value.secrets.map((s) => s.piece));
    let piece = 0;
    while (taken.has(piece) && piece < value.size * value.size - 1) piece += 1;
    patch({ secrets: [...value.secrets, { id: `s-${n}`, piece, kind: "quote", text: "", audioUrl: "" }] });
  };

  const patchSecret = (id: string, p: Partial<Secret>) =>
    patch({ secrets: value.secrets.map((s) => (s.id === id ? { ...s, ...p } : s)) });

  /**
   * The tabs sit directly on the wood, not on a card — so they need light text on
   * a darkened panel. The card palette's mid-brown `SOFT` on mid-brown wood is
   * very nearly invisible, which is exactly what it looked like.
   */
  const tabStyle = (active: boolean): CSSProperties => ({
    ...label,
    background: active ? CARD : "rgba(52,36,20,.42)",
    border: `1px solid ${active ? ACCENT : "rgba(255,244,224,.3)"}`,
    color: active ? ACCENT : ON_BENCH,
  });

  const totalPieces = value.size * value.size;

  return (
    <div
      className={`${LETTER_FONT_VARS} ${ibmPlexMono.variable} rounded-2xl p-4 sm:p-5`}
      style={{
        background: `linear-gradient(168deg, #a87a4c, ${BENCH})`,
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
      }}
    >
      <input
        ref={pictureRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          await upload(f, (url) => patch({ imageUrl: url }));
          if (pictureRef.current) pictureRef.current.value = "";
        }}
      />
      <input
        ref={rewardRef}
        type="file"
        accept="image/*,audio/*,video/*"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f || !current) return;
          const slot = f.type.startsWith("audio/") ? "audioUrl" : f.type.startsWith("video/") ? "videoUrl" : "imageUrl";
          await upload(f, (url) => patchReward(current.at, { [slot]: url } as Partial<MemoryBlock>));
          if (rewardRef.current) rewardRef.current.value = "";
        }}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* ---------------- left: making it ---------------- */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 style={{ fontFamily: "var(--hw-journal), cursive", fontSize: 26, color: ON_BENCH, margin: 0 }}>
              Cutting the puzzle
            </h2>
            <p className="m-0 mt-1 text-[12.5px]" style={{ color: ON_BENCH_SOFT }}>
              One picture, cut into pieces. What matters is what they find on the
              way to seeing it.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(["picture", "puzzle", "story", "secrets", "ending"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className="flex-1 cursor-pointer rounded-lg px-2 py-2" style={tabStyle(tab === t)}>
                {t === "picture" ? "Picture" : t === "puzzle" ? "The cut" : t === "story" ? "Rewards" : t === "secrets" ? "Secrets" : "Ending"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 rounded-xl p-4" style={{ background: CARD, border: `1px solid ${EDGE}` }}>
            {/* ---------- the picture ---------- */}
            {tab === "picture" && (
              <>
                <div>
                  <span className="mb-1.5 block" style={label}>The picture they&apos;re uncovering</span>
                  {value.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={value.imageUrl} alt="" className="mb-2 block h-40 w-full rounded-md object-cover" />
                  ) : (
                    <div className="mb-2 flex h-40 w-full items-center justify-center rounded-md text-[12px]" style={{ background: CARD_DEEP, border: `1px dashed ${EDGE}`, color: SOFT }}>
                      Nothing yet — the puzzle needs a picture
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => pictureRef.current?.click()} className="cursor-pointer rounded-md px-3 py-2 text-[11px]" style={{ background: "rgba(168,112,60,.14)", border: `1px solid ${ACCENT}`, color: ACCENT }}>
                      {value.imageUrl ? "Replace" : "Upload a photo"}
                    </button>
                    {value.imageUrl && (
                      <button type="button" onClick={() => patch({ imageUrl: "" })} className="cursor-pointer rounded-md px-3 py-2 text-[11px]" style={{ background: "transparent", border: `1px solid ${EDGE}`, color: "#a83c2c" }}>
                        Remove
                      </button>
                    )}
                    {busy && <span className="self-center" style={{ ...label, fontSize: 8.5 }}>uploading…</span>}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Or paste a link</span>
                  <input type="url" value={value.imageUrl} onChange={(e) => patch({ imageUrl: e.target.value })} placeholder="https://…" className={field} style={fieldStyle} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Describe it</span>
                  <input type="text" value={value.imageAlt} onChange={(e) => patch({ imageAlt: e.target.value })} placeholder="the two of us on the ferry" className={field} style={fieldStyle} />
                  <span className="mt-1.5 block text-[11px]" style={{ color: SOFT }}>
                    Read aloud to anyone using a screen reader, so they get the memory too.
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Play a video instead, once it&apos;s finished</span>
                  <input type="url" value={value.videoUrl} onChange={(e) => patch({ videoUrl: e.target.value })} placeholder="https://… (optional)" className={field} style={fieldStyle} />
                </label>
              </>
            )}

            {/* ---------- the cut ---------- */}
            {tab === "puzzle" && (
              <>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>How it&apos;s cut</span>
                  <Chips ids={CUT_IDS} value={value.cut} onChange={(v) => patch({ cut: v })} labelOf={(id) => CUTS[id].label} />
                  <span className="mt-2 block text-[11.5px]" style={{ color: SOFT }}>
                    {CUTS[value.cut].note}
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>How many pieces</span>
                  <Chips
                    ids={GRID_SIZES}
                    value={value.size}
                    onChange={(v) => patch({ size: v })}
                    labelOf={(n) => `${n} × ${n}`}
                  />
                  <span className="mt-2 block text-[11.5px]" style={{ color: SOFT }}>
                    {totalPieces} pieces. {totalPieces >= 64 ? "A long afternoon — lovely on a laptop, hard on a phone." : totalPieces <= 16 ? "Quick. Good for someone who won't sit still." : "About right for most people."}
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>How hard</span>
                  <Chips ids={DIFFICULTY_IDS} value={value.difficulty} onChange={(v) => patch({ difficulty: v })} labelOf={(id) => DIFFICULTIES[id].label} />
                  <span className="mt-2 block text-[11.5px]" style={{ color: SOFT }}>
                    {DIFFICULTIES[value.difficulty].note}
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Cut from</span>
                  <Chips ids={MATERIAL_IDS} value={value.material} onChange={(v) => patch({ material: v })} labelOf={(id) => MATERIALS[id].label} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Tipped out onto</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SURFACE_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => patch({ surface: id })}
                        aria-pressed={value.surface === id}
                        title={SURFACES[id].label}
                        className="cursor-pointer overflow-hidden rounded-lg"
                        style={{
                          width: 58, height: 42,
                          background: SURFACES[id].tray,
                          border: value.surface === id ? `2px solid ${ACCENT}` : `1px solid ${EDGE}`,
                        }}
                      >
                        <span className="mx-auto mt-1.5 block rounded-full" style={{ width: 9, height: 9, background: SURFACES[id].accent }} />
                        <span className="mt-1 block px-1 text-[7px] leading-tight" style={{ color: SURFACES[id].ink }}>
                          {SURFACES[id].label}
                        </span>
                      </button>
                    ))}
                  </div>
                </label>
              </>
            )}

            {/* ---------- the rewards ---------- */}
            {tab === "story" && (
              <>
                <p className="m-0 text-[12.5px]" style={{ color: SOFT }}>
                  This is the part that matters. Choose what unlocks as they get
                  closer — the puzzle is only how they earn it.
                </p>

                <div>
                  <span className="mb-1.5 block" style={label}>Unlocks at</span>
                  <div className="flex flex-wrap gap-1.5">
                    {MILESTONE_MARKS.map((at) => {
                      const on = value.milestones.some((m) => m.at === at);
                      return (
                        <button
                          key={at}
                          type="button"
                          onClick={() => toggleMilestone(at)}
                          aria-pressed={on}
                          className="cursor-pointer rounded-full px-3 py-1.5 text-[11px]"
                          style={{
                            background: on ? "rgba(168,112,60,.14)" : "#fffdf7",
                            border: `1px solid ${on ? ACCENT : EDGE}`,
                            color: on ? ACCENT : SOFT,
                          }}
                        >
                          {on ? "✓ " : "+ "}{at}%
                        </button>
                      );
                    })}
                  </div>
                </div>

                {milestones.length === 0 && (
                  <p className="m-0 text-[12.5px]" style={{ color: SOFT }}>
                    Nothing unlocks yet. Add at least the one at 100%.
                  </p>
                )}

                {milestones.length > 0 && (
                  <div className="flex gap-1.5">
                    {milestones.map((m, i) => (
                      <button
                        key={m.at}
                        type="button"
                        onClick={() => setSelectedMilestone(i)}
                        className="flex-1 cursor-pointer rounded-md px-2 py-1.5 text-[11px]"
                        style={{
                          background: i === selectedMilestone ? "rgba(168,112,60,.12)" : "transparent",
                          border: `1px solid ${i === selectedMilestone ? ACCENT : EDGE}`,
                          color: i === selectedMilestone ? ACCENT : SOFT,
                        }}
                      >
                        {m.at}%
                      </button>
                    ))}
                  </div>
                )}

                {current && (
                  <div className="flex flex-col gap-3.5 rounded-lg p-3" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}` }}>
                    <label className="block">
                      <span className="mb-1.5 block" style={label}>What you say as it unlocks</span>
                      <input type="text" value={current.headline} onChange={(e) => patchMilestone(current.at, { headline: e.target.value })} className={field} style={fieldStyle} />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block" style={label}>What they get</span>
                      <Chips
                        ids={BLOCK_KINDS}
                        value={current.reward.kind}
                        onChange={(v) => patchReward(current.at, { kind: v })}
                        labelOf={(id) => BLOCK_LABELS[id]}
                        glyphOf={(id) => BLOCK_GLYPHS[id]}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block" style={label}>Heading</span>
                      <input type="text" value={current.reward.title} onChange={(e) => patchReward(current.at, { title: e.target.value })} placeholder="optional" className={field} style={fieldStyle} />
                    </label>

                    {current.reward.kind !== "map" && current.reward.kind !== "date" && (
                      <label className="block">
                        <span className="mb-1.5 block" style={label}>
                          {current.reward.kind === "quote" ? "The quote" : current.reward.kind === "song" ? "Song title" : "Words"}
                        </span>
                        <textarea
                          value={current.reward.body}
                          onChange={(e) => patchReward(current.at, { body: e.target.value })}
                          rows={current.reward.kind === "letter" ? 5 : 3}
                          className={field}
                          style={{ ...fieldStyle, resize: "vertical" }}
                        />
                      </label>
                    )}

                    {(current.reward.kind === "photo" || current.reward.kind === "artwork" || current.reward.kind === "voice" || current.reward.kind === "video") && (
                      <div>
                        <span className="mb-1.5 block" style={label}>The file</span>
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => rewardRef.current?.click()} className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]" style={{ background: "#fffdf7", border: `1px solid ${EDGE}`, color: INK }}>
                            Upload
                          </button>
                          <span className="self-center truncate text-[11px]" style={{ color: SOFT }}>
                            {current.reward.imageUrl || current.reward.audioUrl || current.reward.videoUrl || "nothing attached"}
                          </span>
                        </div>
                      </div>
                    )}

                    {(current.reward.kind === "song" || current.reward.kind === "quote" || current.reward.kind === "photo") && (
                      <label className="block">
                        <span className="mb-1.5 block" style={label}>
                          {current.reward.kind === "quote" ? "Who said it" : current.reward.kind === "song" ? "Artist" : "Credit"}
                        </span>
                        <input type="text" value={current.reward.credit} onChange={(e) => patchReward(current.at, { credit: e.target.value })} className={field} style={fieldStyle} />
                      </label>
                    )}

                    {current.reward.kind === "song" && (
                      <label className="block">
                        <span className="mb-1.5 block" style={label}>Link to it</span>
                        <input type="url" value={current.reward.linkUrl} onChange={(e) => patchReward(current.at, { linkUrl: e.target.value })} placeholder="https://open.spotify.com/…" className={field} style={fieldStyle} />
                      </label>
                    )}

                    {current.reward.kind === "map" && (
                      <>
                        <label className="block">
                          <span className="mb-1.5 block" style={label}>The place</span>
                          <input type="text" value={current.reward.place} onChange={(e) => patchReward(current.at, { place: e.target.value })} placeholder="the bench by the harbour" className={field} style={fieldStyle} />
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="block">
                            <span className="mb-1.5 block" style={label}>Latitude</span>
                            <input type="number" step="0.0001" value={current.reward.lat || ""} onChange={(e) => patchReward(current.at, { lat: Number(e.target.value) || 0 })} className={field} style={fieldStyle} />
                          </label>
                          <label className="block">
                            <span className="mb-1.5 block" style={label}>Longitude</span>
                            <input type="number" step="0.0001" value={current.reward.lng || ""} onChange={(e) => patchReward(current.at, { lng: Number(e.target.value) || 0 })} className={field} style={fieldStyle} />
                          </label>
                        </div>
                        <label className="block">
                          <span className="mb-1.5 block" style={label}>Why there</span>
                          <textarea value={current.reward.body} onChange={(e) => patchReward(current.at, { body: e.target.value })} rows={2} className={field} style={{ ...fieldStyle, resize: "vertical" }} />
                        </label>
                      </>
                    )}

                    {current.reward.kind === "date" && (
                      <>
                        <label className="block">
                          <span className="mb-1.5 block" style={label}>The date</span>
                          <input type="text" value={current.reward.when} onChange={(e) => patchReward(current.at, { when: e.target.value })} placeholder="14 February 2019" className={field} style={fieldStyle} />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block" style={label}>What happened</span>
                          <textarea value={current.reward.body} onChange={(e) => patchReward(current.at, { body: e.target.value })} rows={2} className={field} style={{ ...fieldStyle, resize: "vertical" }} />
                        </label>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ---------- secrets ---------- */}
            {tab === "secrets" && (
              <>
                <p className="m-0 text-[12.5px]" style={{ color: SOFT }}>
                  Hide something inside a piece. Once it&apos;s placed, a faint spark
                  appears on it — anyone curious enough to click gets this. Nothing
                  tells them it&apos;s there.
                </p>

                <div className="flex items-center justify-between">
                  <span style={label}>{value.secrets.length} hidden</span>
                  <button
                    type="button"
                    onClick={addSecret}
                    disabled={value.secrets.length >= 12}
                    className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px] disabled:opacity-35"
                    style={{ background: "rgba(168,112,60,.14)", border: `1px solid ${ACCENT}`, color: ACCENT }}
                  >
                    + Hide one
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {value.secrets.map((s) => (
                    <div key={s.id} className="flex flex-col gap-2 rounded-lg p-2.5" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}` }}>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5">
                          <span style={{ ...label, fontSize: 8.5 }}>piece</span>
                          <input
                            type="number"
                            min={1}
                            max={totalPieces}
                            value={s.piece + 1}
                            onChange={(e) => patchSecret(s.id, { piece: Math.max(0, Math.min(totalPieces - 1, Number(e.target.value) - 1)) })}
                            className="w-16 rounded-md px-2 py-1 text-[12px] outline-none"
                            style={fieldStyle}
                          />
                        </label>
                        <select
                          value={s.kind}
                          onChange={(e) => patchSecret(s.id, { kind: e.target.value as Secret["kind"] })}
                          className="rounded-md px-2 py-1 text-[12px] outline-none"
                          style={fieldStyle}
                        >
                          {(["quote", "doodle", "flower", "voice", "date", "sparkle"] as const).map((k) => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => patch({ secrets: value.secrets.filter((x) => x.id !== s.id) })}
                          aria-label="Remove"
                          className="ml-auto cursor-pointer px-1 text-[13px]"
                          style={{ background: "transparent", color: "#a83c2c" }}
                        >
                          ×
                        </button>
                      </div>
                      <input
                        type="text"
                        value={s.text}
                        onChange={(e) => patchSecret(s.id, { text: e.target.value })}
                        placeholder="what they find"
                        className={field}
                        style={fieldStyle}
                      />
                      {s.kind === "voice" && (
                        <input
                          type="url"
                          value={s.audioUrl}
                          onChange={(e) => patchSecret(s.id, { audioUrl: e.target.value })}
                          placeholder="https://… a few seconds of you"
                          className={field}
                          style={fieldStyle}
                        />
                      )}
                    </div>
                  ))}
                  {value.secrets.length === 0 && (
                    <p className="m-0 text-[12px]" style={{ color: SOFT }}>Nothing hidden yet.</p>
                  )}
                </div>
              </>
            )}

            {/* ---------- the ending ---------- */}
            {tab === "ending" && (
              <>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>Engraved on the box</span>
                  <input type="text" value={value.boxLabel} onChange={(e) => patch({ boxLabel: e.target.value })} placeholder="For you" className={field} style={fieldStyle} />
                </label>

                <div>
                  <span className="mb-1.5 block" style={label}>The three lines at the start</span>
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
                        placeholder={["I hid something inside.", "The only way to see it…", "…is to put the pieces together."][i]}
                        className={field}
                        style={fieldStyle}
                      />
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Over the finished picture</span>
                  <input type="text" value={value.closingLine} onChange={(e) => patch({ closingLine: e.target.value })} placeholder="I'm glad you stayed until the end." className={field} style={fieldStyle} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Under the frame</span>
                  <input type="text" value={value.framedCaption} onChange={(e) => patch({ framedCaption: e.target.value })} placeholder="The best memories are the ones we build together." className={field} style={fieldStyle} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Music, once they finish</span>
                  <input type="url" value={value.musicUrl} onChange={(e) => patch({ musicUrl: e.target.value })} placeholder="https://… (optional)" className={field} style={fieldStyle} />
                </label>
              </>
            )}
          </div>
        </div>

        {/* ---------------- right: the table itself ---------------- */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span style={{ ...label, color: ON_BENCH_SOFT }}>How it plays</span>
            <button
              type="button"
              onClick={() => setPreviewKey((k) => k + 1)}
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]"
              style={{ background: "rgba(52,36,20,.42)", border: "1px solid rgba(255,244,224,.34)", color: ON_BENCH }}
            >
              ↺ Start over
            </button>
          </div>
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,244,224,.24)", height: "min(80vh, 860px)" }}>
            <div key={previewKey} className="h-full overflow-y-auto">
              <MemoryPuzzleView content={value} embedded />
            </div>
          </div>
          <p className="m-0 text-[11px]" style={{ color: ON_BENCH_SOFT }}>
            Solve it here to check your rewards appear where you meant them to.
            Progress in the preview isn&apos;t saved.
          </p>
        </div>
      </div>
    </div>
  );
}
