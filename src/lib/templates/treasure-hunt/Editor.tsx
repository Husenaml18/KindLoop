"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ibmPlexMono } from "@/app/fonts";
import { LETTER_FONT_VARS } from "@/app/letterFonts";
import {
  BLOCK_GLYPHS,
  BLOCK_KINDS,
  BLOCK_LABELS,
  type MemoryBlock,
} from "@/lib/engines/memory-block/schema";
import {
  CLUE_GLYPHS,
  CLUE_KINDS,
  CLUE_LABELS,
  CLUE_NOTES,
  clueIsAsked,
  makeStop,
  normaliseCode,
  type Clue,
  type ClueKind,
  type Stop,
  type TreasureHuntContent,
} from "./schema";
import {
  JOURNEYS,
  JOURNEY_IDS,
  MAP_STYLES,
  MAP_STYLE_IDS,
  PIN_IDS,
  PIN_LABELS,
} from "./theme";
import { TreasureHuntView } from "./View";

/* The workbench is the cartographer's desk: dark green leather, brass, lamplight. */
const DESK_TOP = "#2a3a2c";
const DESK = "#1a2620";
const CARD = "#f4ecd8";
const CARD_DEEP = "#e8dcc0";
const EDGE = "rgba(50,40,20,.2)";
const INK = "#3a3020";
const SOFT = "#7d6b4a";
const BRASS = "#a8823c";
/* Text on the leather rather than on paper. */
const ON_DESK = "#f2e8cc";
const ON_DESK_SOFT = "rgba(242,232,204,.7)";

const label: CSSProperties = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: 9.5,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: SOFT,
};

const field = "w-full rounded-md px-2.5 py-2 text-[13px] outline-none";
const fieldStyle: CSSProperties = {
  background: "#fffdf4",
  border: `1px solid ${EDGE}`,
  color: INK,
  fontFamily: "var(--font-space-grotesk), sans-serif",
};

/** How many stops people actually plan. */
const LENGTHS = [3, 5, 7, 10, 15];

/**
 * A rhythm that alternates *doing* with *reading*, so no two stops in a row feel
 * the same and nobody gets three text boxes in a row.
 */
const RHYTHM: ClueKind[] = [
  "letter",
  "photo",
  "riddle",
  "candles",
  "voice",
  "location",
  "drawer",
  "combination",
  "puzzle",
  "constellation",
  "video",
  "key",
  "photo",
  "letter",
  "riddle",
];

const PIN_RHYTHM = [...PIN_IDS];

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
            background: value === id ? "rgba(168,130,60,.16)" : "#fffdf4",
            border: `1px solid ${value === id ? BRASS : EDGE}`,
            color: value === id ? "#7a5c20" : SOFT,
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

export function TreasureHuntEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: TreasureHuntContent;
  onChange: (value: TreasureHuntContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<"journey" | "clue" | "reward" | "chest">("journey");
  const [previewKey, setPreviewKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const clueFileRef = useRef<HTMLInputElement>(null);
  const rewardFileRef = useRef<HTMLInputElement>(null);

  const stops = value.stops;
  const current = stops[selected];

  const patch = (p: Partial<TreasureHuntContent>) => onChange({ ...value, ...p });
  const patchStop = (id: string, p: Partial<Stop>) =>
    patch({ stops: stops.map((s) => (s.id === id ? { ...s, ...p } : s)) });
  const patchClue = (id: string, p: Partial<Clue>) =>
    patch({ stops: stops.map((s) => (s.id === id ? { ...s, clue: { ...s.clue, ...p } } : s)) });
  const patchReward = (id: string, p: Partial<MemoryBlock>) =>
    patch({ stops: stops.map((s) => (s.id === id ? { ...s, reward: { ...s.reward, ...p } } : s)) });

  const freshId = () => {
    const used = new Set(stops.map((s) => s.id));
    let n = 1;
    while (used.has(`s-${n}`)) n += 1;
    return `s-${n}`;
  };

  const addStop = () => {
    if (stops.length >= 15) return;
    const i = stops.length;
    const id = freshId();
    const fresh: Stop = {
      ...makeStop(id, RHYTHM[i % RHYTHM.length]),
      pin: PIN_RHYTHM[i % PIN_RHYTHM.length],
    };
    patch({ stops: [...stops, fresh] });
    setSelected(i);
    setTab("clue");
  };

  /** Lay out a whole route in one go — the common case. */
  const layOut = (n: number) => {
    const next = [...stops];
    const used = new Set(next.map((s) => s.id));
    let counter = 1;
    while (next.length < n) {
      while (used.has(`s-${counter}`)) counter += 1;
      used.add(`s-${counter}`);
      const i = next.length;
      next.push({ ...makeStop(`s-${counter}`, RHYTHM[i % RHYTHM.length]), pin: PIN_RHYTHM[i % PIN_RHYTHM.length] });
    }
    patch({ stops: next.slice(0, n) });
    setSelected(Math.min(selected, n - 1));
  };

  const removeStop = (i: number) => {
    patch({ stops: stops.filter((_, idx) => idx !== i) });
    setSelected((s) => Math.max(0, Math.min(s, stops.length - 2)));
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= stops.length) return;
    const next = [...stops];
    [next[i], next[j]] = [next[j], next[i]];
    patch({ stops: next });
    setSelected(j);
  };

  const upload = async (file: File, apply: (url: string) => void) => {
    setBusy(true);
    try {
      const url = await uploadPhoto(file);
      /* Empty means the upload was refused; the reason is already on screen. */
      if (url) apply(url);
    } finally {
      setBusy(false);
    }
  };

  /* The tabs sit on the leather, so they need light text on a darkened panel. */
  const tabStyle = (active: boolean): CSSProperties => ({
    ...label,
    background: active ? CARD : "rgba(12,20,14,.46)",
    border: `1px solid ${active ? BRASS : "rgba(242,232,204,.3)"}`,
    color: active ? "#7a5c20" : ON_DESK,
  });

  const journey = JOURNEYS[value.journey];

  return (
    <div
      className={`${LETTER_FONT_VARS} ${ibmPlexMono.variable} rounded-2xl p-4 sm:p-5`}
      style={{
        background: `linear-gradient(168deg, ${DESK_TOP}, ${DESK})`,
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
      }}
    >
      <input
        ref={clueFileRef}
        type="file"
        accept="image/*,audio/*,video/*"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f || !current) return;
          const slot = f.type.startsWith("audio/") ? "audioUrl" : f.type.startsWith("video/") ? "videoUrl" : "imageUrl";
          await upload(f, (url) => patchClue(current.id, { [slot]: url } as Partial<Clue>));
          if (clueFileRef.current) clueFileRef.current.value = "";
        }}
      />
      <input
        ref={rewardFileRef}
        type="file"
        accept="image/*,audio/*,video/*"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f || !current) return;
          const slot = f.type.startsWith("audio/") ? "audioUrl" : f.type.startsWith("video/") ? "videoUrl" : "imageUrl";
          await upload(f, (url) => patchReward(current.id, { [slot]: url } as Partial<MemoryBlock>));
          if (rewardFileRef.current) rewardFileRef.current.value = "";
        }}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
        {/* ---------------- left: drawing the map ---------------- */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 style={{ fontFamily: "var(--hw-vintage), cursive", fontSize: 27, color: ON_DESK, margin: 0 }}>
              Drawing the map
            </h2>
            <p className="m-0 mt-1 text-[12.5px]" style={{ color: ON_DESK_SOFT }}>
              A route of stops. Each one asks something small, and gives back a
              memory. The last one opens the chest.
            </p>
          </div>

          <div className="flex gap-1.5">
            {(["journey", "clue", "reward", "chest"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className="flex-1 cursor-pointer rounded-lg px-2 py-2" style={tabStyle(tab === t)}>
                {t === "journey" ? "The journey" : t === "clue" ? "This clue" : t === "reward" ? "The reward" : "The chest"}
              </button>
            ))}
          </div>

          {/* the route */}
          <div className="rounded-xl p-3" style={{ background: CARD, border: `1px solid ${EDGE}` }}>
            <div className="mb-2 flex items-center justify-between">
              <span style={label}>
                {stops.length} {journey.stopWord}
                {stops.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={addStop}
                disabled={stops.length >= 15}
                className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px] disabled:opacity-35"
                style={{ background: "rgba(168,130,60,.16)", border: `1px solid ${BRASS}`, color: "#7a5c20" }}
              >
                + Add a stop
              </button>
            </div>

            <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
              {stops.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center gap-1.5 rounded-md p-1.5"
                  style={{
                    background: i === selected ? "rgba(168,130,60,.1)" : "transparent",
                    border: `1px solid ${i === selected ? "rgba(168,130,60,.4)" : "transparent"}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setSelected(i); setTab("clue"); }}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 bg-transparent text-left"
                  >
                    <span
                      className="flex h-7 w-7 flex-none items-center justify-center rounded-full"
                      style={{ background: "rgba(168,130,60,.16)", border: `1px solid ${BRASS}`, fontFamily: "var(--font-fraunces), serif", fontSize: 12, color: "#7a5c20" }}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px]" style={{ color: INK }}>
                        {s.clue.place || CLUE_LABELS[s.clue.kind]}
                      </span>
                      <span className="block" style={{ ...label, fontSize: 8.5 }}>
                        {CLUE_GLYPHS[s.clue.kind]} {CLUE_LABELS[s.clue.kind]} · {PIN_LABELS[s.pin]}
                      </span>
                    </span>
                  </button>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Earlier on the route" className="cursor-pointer px-1 text-[8px] disabled:opacity-25" style={{ background: "transparent", color: SOFT }}>▲</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === stops.length - 1} aria-label="Later on the route" className="cursor-pointer px-1 text-[8px] disabled:opacity-25" style={{ background: "transparent", color: SOFT }}>▼</button>
                  <button type="button" onClick={() => removeStop(i)} aria-label="Remove" className="cursor-pointer px-1 text-[11px]" style={{ background: "transparent", color: "#a83c2c" }}>×</button>
                </div>
              ))}
              {stops.length === 0 && (
                <p className="m-0 py-2 text-center text-[12px]" style={{ color: SOFT }}>No route yet.</p>
              )}
            </div>

            <div className="mt-2.5">
              <span className="mb-1.5 block" style={label}>Lay out a route</span>
              <div className="flex flex-wrap gap-1.5">
                {LENGTHS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => layOut(n)}
                    className="cursor-pointer rounded-full px-2.5 py-1 text-[10.5px]"
                    style={{ background: "#fffdf4", border: `1px solid ${EDGE}`, color: SOFT }}
                  >
                    {n} stops
                  </button>
                ))}
              </div>
              <p className="m-0 mt-2 text-[11px]" style={{ color: SOFT }}>
                Stops are laid out with a mix of clue types so no two in a row feel
                the same. Change any of them afterwards.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl p-4" style={{ background: CARD, border: `1px solid ${EDGE}` }}>
            {/* ---------- the journey ---------- */}
            {tab === "journey" && (
              <>
                <label className="block">
                  <span className="mb-1.5 block" style={label}>What kind of adventure</span>
                  <Chips ids={JOURNEY_IDS} value={value.journey} onChange={(v) => patch({ journey: v, map: JOURNEYS[v].map })} labelOf={(id) => JOURNEYS[id].label} />
                  <span className="mt-2 block text-[11.5px]" style={{ color: SOFT }}>
                    Sets the opening and closing lines, the ambience, and what the stops
                    are called. Picking one also swaps to its usual map.
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>The map</span>
                  <div className="flex flex-wrap gap-1.5">
                    {MAP_STYLE_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => patch({ map: id })}
                        aria-pressed={value.map === id}
                        title={MAP_STYLES[id].label}
                        className="cursor-pointer overflow-hidden rounded-lg"
                        style={{
                          width: 62, height: 46,
                          background: MAP_STYLES[id].paper,
                          border: value.map === id ? `2px solid ${BRASS}` : `1px solid ${EDGE}`,
                        }}
                      >
                        <span className="mx-auto mt-2 block h-[2px] w-9 rounded-full" style={{ background: MAP_STYLES[id].gilt }} />
                        <span className="mt-1.5 block px-1 text-[7px] leading-tight" style={{ color: MAP_STYLES[id].ink }}>
                          {MAP_STYLES[id].label}
                        </span>
                      </button>
                    ))}
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Title</span>
                  <input type="text" value={value.title} onChange={(e) => patch({ title: e.target.value })} placeholder="A map, for you" className={field} style={fieldStyle} />
                </label>

                <div>
                  <span className="mb-1.5 block" style={label}>The two lines before the ribbon unties</span>
                  <div className="flex flex-col gap-1.5">
                    {[0, 1].map((i) => (
                      <input
                        key={i}
                        type="text"
                        value={value.openingLines[i] ?? ""}
                        onChange={(e) => {
                          const next = [...value.openingLines];
                          while (next.length < 2) next.push("");
                          next[i] = e.target.value;
                          patch({ openingLines: next });
                        }}
                        placeholder={journey.opening[i]}
                        className={field}
                        style={fieldStyle}
                      />
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Ambient sound, if you want any</span>
                  <input type="url" value={value.ambienceUrl} onChange={(e) => patch({ ambienceUrl: e.target.value })} placeholder="https://… (optional)" className={field} style={fieldStyle} />
                  <span className="mt-1.5 block text-[11px]" style={{ color: SOFT }}>
                    The wind, birds and waves are drawn rather than played — we don&apos;t
                    ship audio. Attach a track and a sound control appears.
                  </span>
                </label>
              </>
            )}

            {!current && tab !== "journey" && tab !== "chest" && (
              <p className="m-0 text-[12.5px]" style={{ color: SOFT }}>Add a stop to begin.</p>
            )}

            {/* ---------- this clue ---------- */}
            {tab === "clue" && current && (
              <>
                <div className="flex items-center justify-between">
                  <span style={{ ...label, color: "#7a5c20" }}>Stop {selected + 1}</span>
                  {busy && <span style={{ ...label, fontSize: 8.5 }}>uploading…</span>}
                </div>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>What this place is called on the map</span>
                  <input type="text" value={current.clue.place} onChange={(e) => patchClue(current.id, { place: e.target.value })} placeholder="The old pier" className={field} style={fieldStyle} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>What they have to do</span>
                  <Chips
                    ids={CLUE_KINDS}
                    value={current.clue.kind}
                    onChange={(v) => patchClue(current.id, { kind: v })}
                    labelOf={(id) => CLUE_LABELS[id]}
                    glyphOf={(id) => CLUE_GLYPHS[id]}
                  />
                  <span className="mt-2 block text-[11.5px]" style={{ color: SOFT }}>
                    {CLUE_NOTES[current.clue.kind]}
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>
                    {current.clue.kind === "letter" ? "The letter" : "The clue itself"}
                  </span>
                  <textarea
                    value={current.clue.prompt}
                    onChange={(e) => patchClue(current.id, { prompt: e.target.value })}
                    rows={current.clue.kind === "letter" ? 5 : 3}
                    placeholder={current.clue.kind === "riddle" ? "Something only they would know." : ""}
                    className={field}
                    style={{ ...fieldStyle, resize: "vertical" }}
                  />
                </label>

                {(current.clue.kind === "photo" || current.clue.kind === "puzzle") && (
                  <div>
                    <span className="mb-1.5 block" style={label}>
                      {current.clue.kind === "photo" ? "The photograph (blurred until they place it)" : "The picture on the tiles"}
                    </span>
                    {current.clue.imageUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={current.clue.imageUrl} alt="" className="mb-2 block h-24 w-full rounded-md object-cover" />
                    )}
                    <button type="button" onClick={() => clueFileRef.current?.click()} className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}`, color: INK }}>
                      {current.clue.imageUrl ? "Replace" : "Upload"}
                    </button>
                  </div>
                )}

                {current.clue.kind === "voice" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>The clip</span>
                    <div className="flex gap-1.5">
                      <input type="url" value={current.clue.audioUrl} onChange={(e) => patchClue(current.id, { audioUrl: e.target.value })} placeholder="https://…" className={field} style={fieldStyle} />
                      <button type="button" onClick={() => clueFileRef.current?.click()} className="flex-none cursor-pointer rounded-md px-2.5 text-[11px]" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}`, color: INK }}>
                        Upload
                      </button>
                    </div>
                  </label>
                )}

                {current.clue.kind === "video" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>The clip</span>
                    <div className="flex gap-1.5">
                      <input type="url" value={current.clue.videoUrl} onChange={(e) => patchClue(current.id, { videoUrl: e.target.value })} placeholder="https://…" className={field} style={fieldStyle} />
                      <button type="button" onClick={() => clueFileRef.current?.click()} className="flex-none cursor-pointer rounded-md px-2.5 text-[11px]" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}`, color: INK }}>
                        Upload
                      </button>
                    </div>
                  </label>
                )}

                {clueIsAsked(current.clue.kind) && current.clue.kind !== "combination" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>The answer</span>
                    <input type="text" value={current.clue.answer} onChange={(e) => patchClue(current.id, { answer: e.target.value })} className={field} style={fieldStyle} />
                    <span className="mt-1.5 block text-[11px]" style={{ color: SOFT }}>
                      Matched generously — case, punctuation and &ldquo;14th&rdquo; versus
                      &ldquo;14&rdquo; are all ignored, and a partial answer counts.
                    </span>
                    {!current.clue.answer.trim() && (
                      <span className="mt-1.5 block text-[11px]" style={{ color: "#a8531c" }}>
                        Nothing here yet, so this stop will accept whatever they type.
                        Fine while you&apos;re still writing — worth filling in before you send it.
                      </span>
                    )}
                  </label>
                )}

                {current.clue.kind === "location" && (
                  <div>
                    <span className="mb-1.5 block" style={label}>Three wrong ones to sit beside it</span>
                    <div className="flex flex-col gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <input
                          key={i}
                          type="text"
                          value={current.clue.decoys[i] ?? ""}
                          onChange={(e) => {
                            const next = [...current.clue.decoys];
                            while (next.length < 3) next.push("");
                            next[i] = e.target.value;
                            patchClue(current.id, { decoys: next.filter((d, idx) => d.trim() || idx < 3) });
                          }}
                          placeholder={["Somewhere plausible", "Somewhere else", "One more"][i]}
                          className={field}
                          style={fieldStyle}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {current.clue.kind === "combination" && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>The three digits</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={current.clue.code}
                      onChange={(e) => patchClue(current.id, { code: normaliseCode(e.target.value) })}
                      className={field}
                      style={{ ...fieldStyle, letterSpacing: ".3em", fontFamily: "var(--font-ibm-plex-mono), monospace" }}
                    />
                  </label>
                )}

                <label className="block">
                  <span className="mb-1.5 block" style={label}>A hint, if they ask for one</span>
                  <input type="text" value={current.clue.nudge} onChange={(e) => patchClue(current.id, { nudge: e.target.value })} placeholder="It rained the whole way there." className={field} style={fieldStyle} />
                  <span className="mt-1.5 block text-[11px]" style={{ color: SOFT }}>
                    Offered after a while. Whatever you write, any clue will let them
                    through after half a minute of trying — nobody gets stuck.
                  </span>
                </label>
              </>
            )}

            {/* ---------- the reward ---------- */}
            {tab === "reward" && current && (
              <>
                <span style={{ ...label, color: "#7a5c20" }}>What they get at stop {selected + 1}</span>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>The memory</span>
                  <Chips
                    ids={BLOCK_KINDS}
                    value={current.reward.kind}
                    onChange={(v) => patchReward(current.id, { kind: v })}
                    labelOf={(id) => BLOCK_LABELS[id]}
                    glyphOf={(id) => BLOCK_GLYPHS[id]}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Pinned to the board as</span>
                  <Chips ids={PIN_IDS} value={current.pin} onChange={(v) => patchStop(current.id, { pin: v })} labelOf={(id) => PIN_LABELS[id]} />
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
                    <textarea value={current.reward.body} onChange={(e) => patchReward(current.id, { body: e.target.value })} rows={3} className={field} style={{ ...fieldStyle, resize: "vertical" }} />
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
                      <button type="button" onClick={() => rewardFileRef.current?.click()} className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}`, color: INK }}>
                        Upload
                      </button>
                      <span className="self-center truncate text-[11px]" style={{ color: SOFT }}>
                        {current.reward.audioUrl || current.reward.videoUrl || ""}
                      </span>
                    </div>
                  </div>
                )}

                {(current.reward.kind === "song" || current.reward.kind === "quote") && (
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>{current.reward.kind === "quote" ? "Who said it" : "Artist"}</span>
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
                  <label className="block">
                    <span className="mb-1.5 block" style={label}>The date</span>
                    <input type="text" value={current.reward.when} onChange={(e) => patchReward(current.id, { when: e.target.value })} placeholder="14 February 2019" className={field} style={fieldStyle} />
                  </label>
                )}

                <label className="block">
                  <span className="mb-1.5 block" style={label}>A line as it&apos;s pinned</span>
                  <input type="text" value={current.aside} onChange={(e) => patchStop(current.id, { aside: e.target.value })} placeholder="I knew you'd get that one." className={field} style={fieldStyle} />
                </label>
              </>
            )}

            {/* ---------- the chest ---------- */}
            {tab === "chest" && (
              <>
                <p className="m-0 text-[12.5px]" style={{ color: SOFT }}>
                  The end of the journey. The chest is only the doorway — what&apos;s
                  inside is the actual gift.
                </p>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Engraved on the lid</span>
                  <input type="text" value={value.chestPlate} onChange={(e) => patch({ chestPlate: e.target.value })} placeholder="For you" className={field} style={fieldStyle} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>What&apos;s inside</span>
                  <Chips
                    ids={BLOCK_KINDS}
                    value={value.treasure.kind}
                    onChange={(v) => patch({ treasure: { ...value.treasure, kind: v } })}
                    labelOf={(id) => BLOCK_LABELS[id]}
                    glyphOf={(id) => BLOCK_GLYPHS[id]}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>Heading</span>
                  <input type="text" value={value.treasure.title} onChange={(e) => patch({ treasure: { ...value.treasure, title: e.target.value } })} className={field} style={fieldStyle} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>The words</span>
                  <textarea
                    value={value.treasure.body}
                    onChange={(e) => patch({ treasure: { ...value.treasure, body: e.target.value } })}
                    rows={5}
                    className={field}
                    style={{ ...fieldStyle, resize: "vertical" }}
                  />
                </label>

                <div className="rounded-lg p-3" style={{ background: CARD_DEEP, border: `1px solid ${EDGE}` }}>
                  <span className="mb-1.5 block" style={label}>Or open one of your other gifts</span>
                  <p className="m-0 mb-2 text-[11.5px]" style={{ color: SOFT }}>
                    Point the chest at a Memoryverse, a scrapbook, a proposal page —
                    anything you&apos;ve already made. The journey becomes the way in.
                  </p>
                  <input type="url" value={value.treasureLinkUrl} onChange={(e) => patch({ treasureLinkUrl: e.target.value })} placeholder="https://…/g/your-gift" className={field} style={fieldStyle} />
                  <input
                    type="text"
                    value={value.treasureLinkLabel}
                    onChange={(e) => patch({ treasureLinkLabel: e.target.value })}
                    placeholder="What the button says"
                    className={`${field} mt-1.5`}
                    style={fieldStyle}
                  />
                </div>

                <label className="block">
                  <span className="mb-1.5 block" style={label}>The last line, over the finished map</span>
                  <textarea
                    value={value.closingLine}
                    onChange={(e) => patch({ closingLine: e.target.value })}
                    rows={2}
                    placeholder={journey.ending}
                    className={field}
                    style={{ ...fieldStyle, resize: "vertical" }}
                  />
                </label>
              </>
            )}
          </div>
        </div>

        {/* ---------------- right: the journey as they'll take it ---------------- */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span style={{ ...label, color: ON_DESK_SOFT }}>How it plays</span>
            <button
              type="button"
              onClick={() => setPreviewKey((k) => k + 1)}
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]"
              style={{ background: "rgba(12,20,14,.46)", border: "1px solid rgba(242,232,204,.32)", color: ON_DESK }}
            >
              ↺ From the start
            </button>
          </div>
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(242,232,204,.26)", height: "min(80vh, 880px)" }}>
            <div key={previewKey} className="h-full overflow-y-auto">
              <TreasureHuntView content={value} embedded />
            </div>
          </div>
          <p className="m-0 text-[11px]" style={{ color: ON_DESK_SOFT }}>
            Walk it yourself to check every clue can be answered — and that the
            answers you&apos;ve written are the ones you meant.
          </p>
        </div>
      </div>
    </div>
  );
}
