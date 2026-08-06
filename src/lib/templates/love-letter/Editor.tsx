"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ibmPlexMono } from "@/app/fonts";
import { LETTER_FONT_VARS } from "@/app/letterFonts";
import {
  BLOCK_KINDS,
  BLOCK_LABELS,
  DECOR_KINDS,
  DECOR_LABELS,
  blockSchema,
  makeDecoration,
  marginNoteSchema,
  type BlockKind,
  type DecorKind,
  type LetterBlock,
  type LoveLetterContent,
} from "./schema";
import {
  ENVELOPES,
  ENVELOPE_IDS,
  HANDS,
  HAND_IDS,
  INKS,
  INK_IDS,
  PAPER_COLORS,
  PAPER_COLOR_IDS,
  PAPER_STYLES,
  PAPER_STYLE_IDS,
  SCENTS,
  SCENT_IDS,
  SEAL_COLORS,
  SEAL_COLOR_IDS,
  SEAL_ICON_IDS,
  SEAL_ICON_LABELS,
} from "./theme";
import { LoveLetterView } from "./View";

/* A writing-desk palette — pale, papery, quiet. Never an app UI. */
const DESK = "#e7ddc9";
const CARD = "#faf5ea";
const EDGE = "rgba(90,70,44,.18)";
const INK = "#3a3026";
const SOFT = "#7d6b52";

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

const BLOCK_GLYPH: Record<BlockKind, string> = {
  paragraph: "¶",
  quote: "❝",
  highlight: "▔",
  photo: "📷",
  folded: "⤵",
  ps: "P.S.",
};

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>;
}

function Swatches<T extends string>({
  ids,
  value,
  onChange,
  colorOf,
  labelOf,
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
            width: 26,
            height: 26,
            background: colorOf(id),
            border: value === id ? `2px solid ${INK}` : `1px solid ${EDGE}`,
            boxShadow: value === id ? `0 0 0 2px #fffdf7 inset` : undefined,
          }}
        />
      ))}
    </div>
  );
}

function Chips<T extends string>({
  ids,
  value,
  onChange,
  labelOf,
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

export function LoveLetterEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: LoveLetterContent;
  onChange: (value: LoveLetterContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [tab, setTab] = useState<"stationery" | "letter" | "extras">("letter");
  const [selectedBlock, setSelectedBlock] = useState<string | null>(value.blocks[0]?.id ?? null);
  const [previewKey, setPreviewKey] = useState(0);
  const [dragDecor, setDragDecor] = useState<string | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<string>("");

  const patch = (p: Partial<LoveLetterContent>) => onChange({ ...value, ...p });

  const freshId = (prefix: string, used: Set<string>) => {
    let n = used.size + 1;
    while (used.has(`${prefix}-${n}`)) n += 1;
    return `${prefix}-${n}`;
  };

  /* ---- blocks ---- */
  const addBlock = (kind: BlockKind) => {
    const id = freshId("b", new Set(value.blocks.map((b) => b.id)));
    const fresh = blockSchema.parse({ id, kind });
    patch({ blocks: [...value.blocks, fresh] });
    setSelectedBlock(id);
  };
  const patchBlock = (id: string, p: Partial<LetterBlock>) =>
    patch({ blocks: value.blocks.map((b) => (b.id === id ? { ...b, ...p } : b)) });
  const removeBlock = (id: string) => {
    patch({ blocks: value.blocks.filter((b) => b.id !== id) });
    if (selectedBlock === id) setSelectedBlock(null);
  };
  const moveBlock = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.blocks.length) return;
    const next = [...value.blocks];
    [next[i], next[j]] = [next[j], next[i]];
    patch({ blocks: next });
  };

  /* ---- decorations, dropped onto the page by hand ---- */
  const addDecor = (kind: DecorKind) => {
    const id = freshId("d", new Set(value.decorations.map((d) => d.id)));
    patch({ decorations: [...value.decorations, { ...makeDecoration(kind, id), x: 78, y: 22 }] });
    setDragDecor(id);
  };
  const patchDecor = (id: string, p: Partial<(typeof value.decorations)[number]>) =>
    patch({ decorations: value.decorations.map((d) => (d.id === id ? { ...d, ...p } : d)) });
  const removeDecor = (id: string) => {
    patch({ decorations: value.decorations.filter((d) => d.id !== id) });
    if (dragDecor === id) setDragDecor(null);
  };

  const onPaperMove = (e: React.PointerEvent) => {
    if (!dragDecor) return;
    const rect = paperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    patchDecor(dragDecor, {
      x: Math.max(-8, Math.min(108, Math.round(x * 2) / 2)),
      y: Math.max(-3, Math.min(103, Math.round(y * 2) / 2)),
    });
  };

  /* ---- margin notes ---- */
  const addNote = () => {
    const id = freshId("m", new Set(value.marginNotes.map((n) => n.id)));
    patch({
      marginNotes: [...value.marginNotes, marginNoteSchema.parse({ id, text: "a small thought", y: 40 })],
    });
  };

  const selected = value.blocks.find((b) => b.id === selectedBlock) ?? null;
  const seal = SEAL_COLORS[value.sealColor];

  const tabStyle = (active: boolean): CSSProperties => ({
    ...label,
    background: active ? "rgba(140,47,60,.12)" : "transparent",
    border: `1px solid ${active ? "rgba(140,47,60,.45)" : EDGE}`,
    color: active ? "#8c2f3c" : SOFT,
  });

  return (
    <div
      className={`${LETTER_FONT_VARS} ${ibmPlexMono.variable} rounded-2xl p-4 sm:p-5`}
      style={{ background: DESK, fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const url = await uploadPhoto(f);
          /* Empty means the upload was refused; the reason is already on screen. */
          if (url && uploadTarget.current) patchBlock(uploadTarget.current, { imageUrl: url });
          if (fileRef.current) fileRef.current.value = "";
        }}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* ---------------- left: the writing desk ---------------- */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 style={{ fontFamily: "var(--hw-elegant), cursive", fontSize: 26, color: INK, margin: 0 }}>
              Your stationery
            </h2>
            <p className="m-0 mt-1 text-[12.5px]" style={{ color: SOFT }}>
              Choose the paper first. Everything else follows it.
            </p>
          </div>

          <div className="flex gap-1.5">
            {(["letter", "stationery", "extras"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="flex-1 cursor-pointer rounded-lg px-2 py-2"
                style={tabStyle(tab === t)}
              >
                {t === "letter" ? "The letter" : t === "stationery" ? "Paper & seal" : "Extras"}
              </button>
            ))}
          </div>

          <div
            className="flex flex-col gap-4 rounded-xl p-4"
            style={{ background: CARD, border: `1px solid ${EDGE}` }}
          >
            {/* ---------- stationery ---------- */}
            {tab === "stationery" && (
              <>
                <Row>
                  <span style={label}>Paper style</span>
                  <Chips ids={PAPER_STYLE_IDS} value={value.paperStyle} onChange={(v) => patch({ paperStyle: v })} labelOf={(id) => PAPER_STYLES[id].label} />
                </Row>
                <Row>
                  <span style={label}>Paper colour</span>
                  <Swatches ids={PAPER_COLOR_IDS} value={value.paperColor} onChange={(v) => patch({ paperColor: v })} colorOf={(id) => PAPER_COLORS[id].hex} labelOf={(id) => PAPER_COLORS[id].label} />
                </Row>
                <Row>
                  <span style={label}>Envelope</span>
                  <Chips ids={ENVELOPE_IDS} value={value.envelope} onChange={(v) => patch({ envelope: v })} labelOf={(id) => ENVELOPES[id].label} />
                </Row>
                <Row>
                  <span style={label}>Wax colour</span>
                  <Swatches ids={SEAL_COLOR_IDS} value={value.sealColor} onChange={(v) => patch({ sealColor: v })} colorOf={(id) => SEAL_COLORS[id].base} labelOf={(id) => SEAL_COLORS[id].label} />
                </Row>
                <Row>
                  <span style={label}>Seal design</span>
                  <Chips ids={SEAL_ICON_IDS} value={value.sealIcon} onChange={(v) => patch({ sealIcon: v })} labelOf={(id) => SEAL_ICON_LABELS[id]} />
                </Row>
                {(value.sealIcon === "initials" || value.sealIcon === "monogram") && (
                  <Row>
                    <span style={label}>Monogram (up to 3)</span>
                    <input type="text" maxLength={3} value={value.sealMonogram} onChange={(e) => patch({ sealMonogram: e.target.value })} className={field} style={fieldStyle} />
                  </Row>
                )}
                <Row>
                  <span style={label}>Handwriting</span>
                  <div className="flex flex-col gap-1.5">
                    {HAND_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => patch({ hand: id })}
                        aria-pressed={value.hand === id}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-left"
                        style={{
                          background: value.hand === id ? "rgba(140,47,60,.1)" : "#fffdf7",
                          border: `1px solid ${value.hand === id ? "rgba(140,47,60,.45)" : EDGE}`,
                        }}
                      >
                        <span style={{ fontFamily: HANDS[id].family, fontSize: 19 * HANDS[id].scale, color: INK }}>
                          the way I write
                        </span>
                        <span style={{ ...label, fontSize: 8.5 }}>{HANDS[id].label}</span>
                      </button>
                    ))}
                  </div>
                </Row>
                <Row>
                  <span style={label}>Ink</span>
                  <Swatches ids={INK_IDS} value={value.ink} onChange={(v) => patch({ ink: v })} colorOf={(id) => INKS[id].hex} labelOf={(id) => INKS[id].label} />
                </Row>
              </>
            )}

            {/* ---------- the letter ---------- */}
            {tab === "letter" && (
              <>
                <Row>
                  <span style={label}>Envelope reads</span>
                  <input type="text" value={value.recipient} onChange={(e) => patch({ recipient: e.target.value })} placeholder="For Ana" className={field} style={fieldStyle} />
                </Row>
                <Row>
                  <span style={label}>Date line</span>
                  <input type="text" value={value.dateLine} onChange={(e) => patch({ dateLine: e.target.value })} placeholder="a Tuesday in March" className={field} style={fieldStyle} />
                </Row>
                <Row>
                  <span style={label}>Greeting</span>
                  <input type="text" value={value.greeting} onChange={(e) => patch({ greeting: e.target.value })} placeholder="My dearest," className={field} style={fieldStyle} />
                </Row>

                <div className="h-px" style={{ background: EDGE }} />

                <Row>
                  <span style={label}>The letter, in parts</span>
                  <div className="flex max-h-52 flex-col gap-1.5 overflow-y-auto pr-1">
                    {value.blocks.map((b, i) => (
                      <div
                        key={b.id}
                        className="flex items-center gap-1 rounded-md p-1.5"
                        style={{
                          background: selectedBlock === b.id ? "rgba(140,47,60,.1)" : "transparent",
                          border: `1px solid ${selectedBlock === b.id ? "rgba(140,47,60,.4)" : "transparent"}`,
                        }}
                      >
                        <button type="button" onClick={() => setSelectedBlock(b.id)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 bg-transparent text-left">
                          <span className="flex-none text-[11px]" style={{ color: SOFT }}>{BLOCK_GLYPH[b.kind]}</span>
                          <span className="min-w-0">
                            <span className="block" style={{ ...label, fontSize: 8.5 }}>{BLOCK_LABELS[b.kind]}</span>
                            <span className="block truncate text-[12.5px]" style={{ color: INK }}>
                              {b.text || b.caption || b.foldLabel || "empty"}
                            </span>
                          </span>
                        </button>
                        <button type="button" onClick={() => moveBlock(i, -1)} disabled={i === 0} aria-label="Move earlier" className="cursor-pointer px-1 text-[8px] disabled:opacity-25" style={{ background: "transparent", color: SOFT }}>▲</button>
                        <button type="button" onClick={() => moveBlock(i, 1)} disabled={i === value.blocks.length - 1} aria-label="Move later" className="cursor-pointer px-1 text-[8px] disabled:opacity-25" style={{ background: "transparent", color: SOFT }}>▼</button>
                        <button type="button" onClick={() => removeBlock(b.id)} aria-label="Remove" className="cursor-pointer px-1 text-[11px]" style={{ background: "transparent", color: "#a83c2c" }}>×</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {BLOCK_KINDS.map((k) => (
                      <button key={k} type="button" onClick={() => addBlock(k)} className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]" style={{ background: "#fffdf7", border: `1px solid ${EDGE}`, color: SOFT }}>
                        + {BLOCK_LABELS[k]}
                      </button>
                    ))}
                  </div>
                </Row>

                {selected && (
                  <>
                    <div className="h-px" style={{ background: EDGE }} />
                    <Row>
                      <span style={label}>{BLOCK_LABELS[selected.kind]}</span>
                      {selected.kind === "photo" ? (
                        <div className="flex flex-col gap-2">
                          <button type="button" onClick={() => { uploadTarget.current = selected.id; fileRef.current?.click(); }} className="cursor-pointer rounded-md px-3 py-2 text-[12px]" style={{ background: "rgba(140,47,60,.1)", border: "1px solid rgba(140,47,60,.4)", color: "#8c2f3c" }}>
                            {selected.imageUrl ? "Replace photo" : "Add photo"}
                          </button>
                          <input type="text" value={selected.caption} onChange={(e) => patchBlock(selected.id, { caption: e.target.value })} placeholder="caption in your hand" className={field} style={fieldStyle} />
                        </div>
                      ) : (
                        <>
                          {selected.kind === "folded" && (
                            <input type="text" value={selected.foldLabel} onChange={(e) => patchBlock(selected.id, { foldLabel: e.target.value })} placeholder="what the crease says" className={`${field} mb-1.5`} style={fieldStyle} />
                          )}
                          <textarea rows={selected.kind === "paragraph" || selected.kind === "folded" ? 6 : 3} value={selected.text} onChange={(e) => patchBlock(selected.id, { text: e.target.value })} className={`${field} resize-y leading-[1.6]`} style={fieldStyle} />
                          <span className="text-[10.5px]" style={{ color: SOFT }}>
                            Each new line becomes its own line of writing.
                          </span>
                        </>
                      )}
                    </Row>
                  </>
                )}

                <div className="h-px" style={{ background: EDGE }} />
                <Row>
                  <span style={label}>Closing</span>
                  <input type="text" value={value.closing} onChange={(e) => patch({ closing: e.target.value })} placeholder="Yours, always" className={field} style={fieldStyle} />
                </Row>
                <Row>
                  <span style={label}>Signature</span>
                  <input type="text" value={value.signature} onChange={(e) => patch({ signature: e.target.value })} placeholder="your name, as you sign it" className={field} style={fieldStyle} />
                </Row>
                <Row>
                  <span style={label}>The last line</span>
                  <input type="text" value={value.finalLine} onChange={(e) => patch({ finalLine: e.target.value })} placeholder="I hope you keep this forever." className={field} style={fieldStyle} />
                </Row>
              </>
            )}

            {/* ---------- extras ---------- */}
            {tab === "extras" && (
              <>
                <Row>
                  <span style={label}>Lay something on the page</span>
                  <div className="flex flex-wrap gap-1.5">
                    {DECOR_KINDS.map((k) => (
                      <button key={k} type="button" onClick={() => addDecor(k)} className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]" style={{ background: "#fffdf7", border: `1px solid ${EDGE}`, color: SOFT }}>
                        + {DECOR_LABELS[k]}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10.5px]" style={{ color: SOFT }}>
                    Then drag it around on the preview to the right.
                  </span>
                </Row>

                {value.decorations.length > 0 && (
                  <Row>
                    <span style={label}>On the page</span>
                    <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto pr-1">
                      {value.decorations.map((d) => (
                        <div key={d.id} className="flex items-center gap-2 rounded-md p-1.5" style={{ background: dragDecor === d.id ? "rgba(140,47,60,.1)" : "transparent", border: `1px solid ${dragDecor === d.id ? "rgba(140,47,60,.4)" : "transparent"}` }}>
                          <button type="button" onClick={() => setDragDecor(dragDecor === d.id ? null : d.id)} className="flex-1 cursor-pointer bg-transparent text-left text-[12.5px]" style={{ color: INK }}>
                            {DECOR_LABELS[d.kind]}
                            <span style={{ ...label, fontSize: 8.5, marginLeft: 6 }}>
                              {dragDecor === d.id ? "moving" : "tap to move"}
                            </span>
                          </button>
                          <input type="range" min={-180} max={180} value={d.rotate} onChange={(e) => patchDecor(d.id, { rotate: Number(e.target.value) })} aria-label="Rotate" className="w-16 accent-[#8c2f3c]" />
                          <input type="range" min={1} max={40} value={d.w} onChange={(e) => patchDecor(d.id, { w: Number(e.target.value) })} aria-label="Size" className="w-16 accent-[#8c2f3c]" />
                          <button type="button" onClick={() => removeDecor(d.id)} aria-label="Remove" className="cursor-pointer px-1 text-[11px]" style={{ background: "transparent", color: "#a83c2c" }}>×</button>
                        </div>
                      ))}
                    </div>
                  </Row>
                )}

                <div className="h-px" style={{ background: EDGE }} />
                <Row>
                  <span style={label}>Margin notes</span>
                  {value.marginNotes.map((n) => (
                    <div key={n.id} className="flex items-center gap-2">
                      <input type="text" value={n.text} onChange={(e) => patch({ marginNotes: value.marginNotes.map((x) => (x.id === n.id ? { ...x, text: e.target.value } : x)) })} className={field} style={fieldStyle} />
                      <button type="button" onClick={() => patch({ marginNotes: value.marginNotes.map((x) => (x.id === n.id ? { ...x, side: x.side === "left" ? "right" : "left" } : x)) })} className="flex-none cursor-pointer rounded-md px-2 py-2 text-[10px]" style={{ background: "#fffdf7", border: `1px solid ${EDGE}`, color: SOFT }}>
                        {n.side}
                      </button>
                      <button type="button" onClick={() => patch({ marginNotes: value.marginNotes.filter((x) => x.id !== n.id) })} aria-label="Remove note" className="flex-none cursor-pointer px-1 text-[11px]" style={{ background: "transparent", color: "#a83c2c" }}>×</button>
                    </div>
                  ))}
                  <button type="button" onClick={addNote} className="self-start cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]" style={{ background: "#fffdf7", border: `1px solid ${EDGE}`, color: SOFT }}>
                    + Add a margin note
                  </button>
                </Row>

                <div className="h-px" style={{ background: EDGE }} />
                <Row>
                  <span style={label}>Voice note URL</span>
                  <input type="text" value={value.voiceUrl} onChange={(e) => patch({ voiceUrl: e.target.value })} placeholder="they press the seal to hear it" className={field} style={fieldStyle} />
                </Row>
                <Row>
                  <span style={label}>Scent, as particles</span>
                  <Chips ids={SCENT_IDS} value={value.scent} onChange={(v) => patch({ scent: v })} labelOf={(id) => SCENTS[id].label} />
                </Row>
                <Row>
                  <span style={label}>Writing pace · {value.writingSpeed} words / min</span>
                  <input type="range" min={40} max={400} step={10} value={value.writingSpeed} onChange={(e) => patch({ writingSpeed: Number(e.target.value) })} className="w-full accent-[#8c2f3c]" />
                  <span className="text-[10.5px]" style={{ color: SOFT }}>
                    Slower feels more deliberate. 150 is about reading speed.
                  </span>
                </Row>
              </>
            )}
          </div>
        </div>

        {/* ---------------- right: the letter itself ---------------- */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span style={label}>Live preview</span>
            <div className="flex items-center gap-2">
              {dragDecor && (
                <span className="text-[11px]" style={{ color: "#8c2f3c" }}>
                  Click on the page to place it
                </span>
              )}
              <button
                type="button"
                onClick={() => setPreviewKey((k) => k + 1)}
                className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]"
                style={{ background: "#fffdf7", border: `1px solid ${EDGE}`, color: SOFT }}
              >
                ↻ Watch it write again
              </button>
            </div>
          </div>

          <div
            ref={paperRef}
            onPointerMove={onPaperMove}
            onClick={() => setDragDecor(null)}
            className="relative overflow-hidden rounded-xl"
            style={{
              minHeight: 520,
              height: "min(74vh, 700px)",
              border: `1px solid ${EDGE}`,
              boxShadow: `0 30px 60px -34px rgba(60,44,26,.6)`,
              cursor: dragDecor ? "crosshair" : "default",
              touchAction: dragDecor ? "none" : undefined,
            }}
          >
            <LoveLetterView key={previewKey} content={value} embedded />
          </div>
          <p className="m-0 text-[11.5px]" style={{ color: SOFT }}>
            This is the real experience — the ink writes at the pace you set, and
            everything you place here is what they&apos;ll see. Seal colour{" "}
            <span style={{ color: seal.base }}>●</span> carries through to the
            envelope, the page and the voice seal.
          </p>
        </div>
      </div>
    </div>
  );
}
