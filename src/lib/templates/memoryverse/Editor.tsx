"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { fraunces, spaceGrotesk, ibmPlexMono, gochiHand } from "@/app/fonts";
import {
  CHAPTER_KINDS,
  CHAPTER_KIND_LABELS,
  REVEAL_STYLES,
  REVEAL_STYLE_LABELS,
  TRANSITIONS,
  chapterSchema,
  type Chapter,
  type ChapterKind,
  type MemoryverseContent,
} from "./schema";
import { MV, MV_DISPLAY, MV_SLATE } from "./theme";
import { MemoryverseView } from "./View";

const display: CSSProperties = { fontFamily: MV_DISPLAY };
const slate: CSSProperties = { fontFamily: MV_SLATE };

const KIND_ICON: Record<ChapterKind, string> = {
  photo: "📸",
  video: "🎬",
  voice: "🎙️",
  quote: "❝",
  letter: "💌",
  timeline: "🗓️",
  location: "📍",
  countdown: "⏳",
};

/* ---------- small form primitives, styled for the dark room ---------- */

const fieldBase =
  "w-full rounded-lg border px-3 py-2.5 text-[13.5px] outline-none transition-colors focus:border-[#e8b26a]";
const fieldStyle: CSSProperties = {
  background: "rgba(10,8,6,.5)",
  borderColor: "rgba(244,238,227,.16)",
  color: MV.screen,
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[10px] tracking-[0.16em] uppercase" style={{ ...slate, color: MV.slate }}>
      {children}
    </span>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={fieldBase}
        style={fieldStyle}
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldBase} resize-y leading-[1.6]`}
        style={fieldStyle}
      />
      <span className="mt-1 block text-[10px]" style={{ ...slate, color: "rgba(142,125,100,.8)" }}>
        Each new line arrives on its own beat.
      </span>
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldBase}
        style={fieldStyle}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: MV.room, color: MV.screen }}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function UploadRow({
  label,
  url,
  onUpload,
  onClear,
  accept = "image/*",
}: {
  label: string;
  url: string;
  onUpload: (file: File) => Promise<void>;
  onClear: () => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2.5">
        {url ? (
          <span
            className="h-11 w-11 flex-none rounded-md bg-cover bg-center"
            style={{ backgroundImage: `url(${url})`, border: "1px solid rgba(244,238,227,.2)" }}
          />
        ) : (
          <span
            className="flex h-11 w-11 flex-none items-center justify-center rounded-md text-[15px]"
            style={{ background: "rgba(10,8,6,.5)", border: "1px dashed rgba(244,238,227,.2)" }}
          >
            +
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            try {
              await onUpload(file);
            } finally {
              setBusy(false);
              if (inputRef.current) inputRef.current.value = "";
            }
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="cursor-pointer rounded-md px-3 py-2 text-[11.5px] disabled:opacity-50"
          style={{ background: "rgba(232,178,106,.16)", border: "1px solid rgba(232,178,106,.4)", color: MV.lamp }}
        >
          {busy ? "Uploading…" : url ? "Replace" : "Upload"}
        </button>
        {url && (
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer rounded-md px-3 py-2 text-[11.5px]"
            style={{ background: "transparent", border: "1px solid rgba(244,238,227,.16)", color: MV.slate }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function MemoryverseEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: MemoryverseContent;
  onChange: (value: MemoryverseContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<"story" | "slide">("slide");
  const [previewFromStart, setPreviewFromStart] = useState(false);
  /** Lowest unused `ch-N` — deterministic, so no clock or randomness at render. */
  const freshId = () => {
    const used = new Set(value.chapters.map((c) => c.id));
    let n = value.chapters.length + 1;
    while (used.has(`ch-${n}`)) n += 1;
    return `ch-${n}`;
  };

  const chapters = value.chapters;
  const current = chapters[selected];

  const patch = (p: Partial<MemoryverseContent>) => onChange({ ...value, ...p });

  const patchChapter = (i: number, p: Partial<Chapter>) =>
    patch({ chapters: chapters.map((c, idx) => (idx === i ? { ...c, ...p } : c)) });

  const addChapter = (kind: ChapterKind) => {
    const fresh = chapterSchema.parse({ id: freshId(), kind });
    patch({ chapters: [...chapters, fresh] });
    setSelected(chapters.length);
    setTab("slide");
  };

  const removeChapter = (i: number) => {
    patch({ chapters: chapters.filter((_, idx) => idx !== i) });
    setSelected((s) => Math.max(0, Math.min(s, chapters.length - 2)));
  };

  const duplicateChapter = (i: number) => {
    const copy = { ...chapters[i], id: freshId() };
    const next = [...chapters];
    next.splice(i + 1, 0, copy);
    patch({ chapters: next });
    setSelected(i + 1);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= chapters.length) return;
    const next = [...chapters];
    [next[i], next[j]] = [next[j], next[i]];
    patch({ chapters: next });
    setSelected(j);
  };

  const tabBtn = (active: boolean): CSSProperties => ({
    ...slate,
    background: active ? "rgba(232,178,106,.16)" : "transparent",
    border: `1px solid ${active ? MV.lamp : "rgba(244,238,227,.14)"}`,
    color: active ? MV.lamp : MV.slate,
  });

  return (
    <div
      className={`${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${gochiHand.variable} grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]`}
      style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
    >
      {/* ---------------- left: tray + inspector ---------------- */}
      <div
        className="flex flex-col gap-4 rounded-2xl p-5"
        style={{ background: MV.room, border: "1px solid rgba(244,238,227,.1)" }}
      >
        <div>
          <h2 className="m-0 text-[21px]" style={{ ...display, color: MV.screen }}>
            The slide tray
          </h2>
          <p className="m-0 mt-1 text-[12.5px]" style={{ color: MV.slate }}>
            Each slide is one memory. Reorder them until the story reads right.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("story")}
            className="flex-1 cursor-pointer rounded-lg px-3 py-2 text-[10.5px] tracking-[0.16em] uppercase"
            style={tabBtn(tab === "story")}
          >
            Story
          </button>
          <button
            type="button"
            onClick={() => setTab("slide")}
            className="flex-1 cursor-pointer rounded-lg px-3 py-2 text-[10.5px] tracking-[0.16em] uppercase"
            style={tabBtn(tab === "slide")}
          >
            Slide {chapters.length > 0 ? selected + 1 : ""}
          </button>
        </div>

        {/* ---- story-level settings ---- */}
        {tab === "story" && (
          <div className="flex flex-col gap-4">
            <Text label="Title" value={value.title} onChange={(v) => patch({ title: v })} placeholder="Our Story" />
            <Text
              label="Subtitle"
              value={value.subtitle}
              onChange={(v) => patch({ subtitle: v })}
              placeholder="Built with love by Sarah"
            />
            <Text
              label="Date line"
              value={value.createdOn}
              onChange={(v) => patch({ createdOn: v })}
              placeholder="Created on August 4, 2026"
            />
            <UploadRow
              label="Cover slide"
              url={value.coverUrl}
              onUpload={async (f) => {
                const url = await uploadPhoto(f);
                if (url) patch({ coverUrl: url });
              }}
              onClear={() => patch({ coverUrl: "" })}
            />
            <Area
              label="Opening lines"
              rows={3}
              value={value.introLines.join("\n")}
              onChange={(v) => patch({ introLines: v.split("\n").slice(0, 4) })}
              placeholder={"Every memory has a story.\nThis one is ours."}
            />
            <div className="h-px" style={{ background: "rgba(244,238,227,.1)" }} />
            <Text
              label="Closing line"
              value={value.closingTitle}
              onChange={(v) => patch({ closingTitle: v })}
              placeholder="The story doesn't end here."
            />
            <Text
              label="Closing follow-up"
              value={value.closingSubtitle}
              onChange={(v) => patch({ closingSubtitle: v })}
              placeholder="There are still memories waiting to happen."
            />
            <Text
              label="Closing button"
              value={value.closingCta}
              onChange={(v) => patch({ closingCta: v })}
              placeholder="Leave a message"
            />
            <Text
              label="Button link"
              value={value.closingHref}
              onChange={(v) => patch({ closingHref: v })}
              placeholder="mailto:you@example.com"
            />
          </div>
        )}

        {/* ---- per-slide inspector ---- */}
        {tab === "slide" && (
          <>
            <div className="flex max-h-[240px] flex-col gap-1.5 overflow-y-auto pr-1">
              {chapters.map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 rounded-lg p-1.5"
                  style={{
                    background: i === selected ? "rgba(232,178,106,.14)" : "transparent",
                    border: `1px solid ${i === selected ? "rgba(232,178,106,.42)" : "rgba(244,238,227,.08)"}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 bg-transparent text-left"
                  >
                    <span className="flex-none text-[15px]">{KIND_ICON[c.kind]}</span>
                    <span className="min-w-0">
                      <span className="block text-[9.5px] tracking-[0.14em]" style={{ ...slate, color: MV.slate }}>
                        {String(i + 1).padStart(2, "0")} · {CHAPTER_KIND_LABELS[c.kind].toUpperCase()}
                        {c.hidden ? " · HIDDEN" : ""}
                      </span>
                      <span className="block truncate text-[13px]" style={{ color: MV.screen }}>
                        {c.title || c.quote || "Untitled slide"}
                      </span>
                    </span>
                  </button>
                  <div className="flex flex-none flex-col">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={`Move slide ${i + 1} earlier`}
                      className="cursor-pointer px-1.5 text-[9px] leading-tight disabled:opacity-25"
                      style={{ background: "transparent", color: MV.slate }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === chapters.length - 1}
                      aria-label={`Move slide ${i + 1} later`}
                      className="cursor-pointer px-1.5 text-[9px] leading-tight disabled:opacity-25"
                      style={{ background: "transparent", color: MV.slate }}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
              {chapters.length === 0 && (
                <p className="m-0 py-3 text-center text-[12.5px]" style={{ color: MV.slate }}>
                  The tray is empty. Add your first slide below.
                </p>
              )}
            </div>

            <div>
              <Label>Add a slide</Label>
              <div className="flex flex-wrap gap-1.5">
                {CHAPTER_KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => addChapter(k)}
                    className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11px]"
                    style={{
                      background: "rgba(10,8,6,.5)",
                      border: "1px solid rgba(244,238,227,.16)",
                      color: MV.screenDim,
                    }}
                  >
                    {KIND_ICON[k]} {CHAPTER_KIND_LABELS[k]}
                  </button>
                ))}
              </div>
            </div>

            {current && (
              <>
                <div className="h-px" style={{ background: "rgba(244,238,227,.1)" }} />
                <div className="flex flex-col gap-4">
                  <Select
                    label="Slide type"
                    value={current.kind}
                    onChange={(v) => patchChapter(selected, { kind: v as ChapterKind })}
                    options={CHAPTER_KINDS.map((k) => ({ value: k, label: CHAPTER_KIND_LABELS[k] }))}
                  />

                  {current.kind !== "quote" && (
                    <Text label="Title" value={current.title} onChange={(v) => patchChapter(selected, { title: v })} />
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Text label="Date" value={current.date} onChange={(v) => patchChapter(selected, { date: v })} placeholder="January 2024" />
                    <Text
                      label="Location"
                      value={current.location}
                      onChange={(v) => patchChapter(selected, { location: v })}
                      placeholder="Ahmedabad"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Text
                      label="Emotion tag"
                      value={current.emotion}
                      onChange={(v) => patchChapter(selected, { emotion: v })}
                      placeholder="nervous, happy…"
                    />
                    <Text
                      label="Reaction emoji"
                      value={current.reaction}
                      onChange={(v) => patchChapter(selected, { reaction: v })}
                      placeholder="❤️"
                    />
                  </div>

                  {/* media, per kind */}
                  {current.kind !== "quote" && current.kind !== "letter" && current.kind !== "timeline" && (
                    <UploadRow
                      label={current.kind === "voice" || current.kind === "countdown" ? "Background image" : "Image"}
                      url={current.imageUrl}
                      onUpload={async (f) => {
                        const url = await uploadPhoto(f);
                        if (url) patchChapter(selected, { imageUrl: url });
                      }}
                      onClear={() => patchChapter(selected, { imageUrl: "" })}
                    />
                  )}
                  {/* Upload first, paste second. A URL only works if it points
                      straight at a media file; the share link people actually
                      have to hand — Drive, Dropbox, a Spotify page — is an HTML
                      page, and a browser cannot play one of those. */}
                  {current.kind === "video" && (
                    <>
                      <UploadRow
                        label="Video file (up to 80 MB)"
                        accept="video/*"
                        url={current.videoUrl}
                        onUpload={async (f) => {
                          const url = await uploadPhoto(f);
                          if (url) patchChapter(selected, { videoUrl: url });
                        }}
                        onClear={() => patchChapter(selected, { videoUrl: "" })}
                      />
                      <Text
                        label="…or paste a direct video link"
                        value={current.videoUrl}
                        onChange={(v) => patchChapter(selected, { videoUrl: v })}
                        placeholder="https://…/clip.mp4"
                      />
                    </>
                  )}
                  {current.kind === "voice" && (
                    <>
                      <UploadRow
                        label="Voice note (up to 20 MB)"
                        accept="audio/*"
                        url={current.audioUrl}
                        onUpload={async (f) => {
                          const url = await uploadPhoto(f);
                          if (url) patchChapter(selected, { audioUrl: url });
                        }}
                        onClear={() => patchChapter(selected, { audioUrl: "" })}
                      />
                      <Text
                        label="…or paste a direct audio link"
                        value={current.audioUrl}
                        onChange={(v) => patchChapter(selected, { audioUrl: v })}
                        placeholder="https://…/voice.mp3 — must end in a file, not a share page"
                      />
                      <Text
                        label="Audio caption"
                        value={current.audioLabel}
                        onChange={(v) => patchChapter(selected, { audioLabel: v })}
                        placeholder="Recorded on the drive home"
                      />
                    </>
                  )}
                  {current.kind === "quote" && (
                    <>
                      <Area
                        label="Quote"
                        rows={3}
                        value={current.quote}
                        onChange={(v) => patchChapter(selected, { quote: v })}
                      />
                      <Text
                        label="Attribution"
                        value={current.attribution}
                        onChange={(v) => patchChapter(selected, { attribution: v })}
                      />
                    </>
                  )}
                  {current.kind === "letter" && (
                    <>
                      <Area
                        label="Letter"
                        rows={7}
                        value={current.letterBody}
                        onChange={(v) => patchChapter(selected, { letterBody: v })}
                      />
                      <Text
                        label="Signed"
                        value={current.signature}
                        onChange={(v) => patchChapter(selected, { signature: v })}
                        placeholder="— always, S"
                      />
                    </>
                  )}
                  {current.kind === "timeline" && (
                    <div>
                      <Label>Milestones</Label>
                      <div className="flex flex-col gap-2">
                        {current.milestones.map((m, mi) => (
                          <div key={mi} className="flex gap-2">
                            <input
                              type="text"
                              value={m.date}
                              placeholder="2019"
                              onChange={(e) =>
                                patchChapter(selected, {
                                  milestones: current.milestones.map((x, xi) =>
                                    xi === mi ? { ...x, date: e.target.value } : x
                                  ),
                                })
                              }
                              className={`${fieldBase} w-24 flex-none`}
                              style={fieldStyle}
                            />
                            <input
                              type="text"
                              value={m.label}
                              placeholder="The day we met"
                              onChange={(e) =>
                                patchChapter(selected, {
                                  milestones: current.milestones.map((x, xi) =>
                                    xi === mi ? { ...x, label: e.target.value } : x
                                  ),
                                })
                              }
                              className={fieldBase}
                              style={fieldStyle}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                patchChapter(selected, {
                                  milestones: current.milestones.filter((_, xi) => xi !== mi),
                                })
                              }
                              aria-label={`Remove milestone ${mi + 1}`}
                              className="flex-none cursor-pointer rounded-md px-2.5 text-[12px]"
                              style={{ background: "transparent", border: "1px solid rgba(244,238,227,.16)", color: MV.slate }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            patchChapter(selected, { milestones: [...current.milestones, { date: "", label: "" }] })
                          }
                          className="cursor-pointer rounded-md px-3 py-2 text-[11.5px]"
                          style={{ background: "rgba(232,178,106,.14)", border: "1px solid rgba(232,178,106,.36)", color: MV.lamp }}
                        >
                          + Add milestone
                        </button>
                      </div>
                    </div>
                  )}
                  {current.kind === "location" && (
                    <div className="grid grid-cols-2 gap-3">
                      <Text
                        label="From"
                        value={current.travelFrom}
                        onChange={(v) => patchChapter(selected, { travelFrom: v })}
                        placeholder="Home"
                      />
                      <Text
                        label="To"
                        value={current.place}
                        onChange={(v) => patchChapter(selected, { place: v })}
                        placeholder="Lisbon"
                      />
                    </div>
                  )}
                  {current.kind === "countdown" && (
                    <label className="block">
                      <Label>Counting down to</Label>
                      <input
                        type="datetime-local"
                        value={current.targetDate}
                        onChange={(e) => patchChapter(selected, { targetDate: e.target.value })}
                        className={fieldBase}
                        style={fieldStyle}
                      />
                    </label>
                  )}

                  {current.kind !== "quote" && (
                    <Area
                      label={current.kind === "letter" ? "Extra note" : "The story"
                      }
                      value={current.description}
                      onChange={(v) => patchChapter(selected, { description: v })}
                      placeholder="I still remember pretending I wasn't nervous."
                    />
                  )}

                  <Select
                    label="Transition in"
                    value={current.transition}
                    onChange={(v) => patchChapter(selected, { transition: v as Chapter["transition"] })}
                    options={TRANSITIONS.map((t) => ({ value: t, label: t }))}
                  />

                  <div
                    className="flex flex-col gap-3 rounded-lg p-3"
                    style={{ background: "rgba(10,8,6,.4)", border: "1px dashed rgba(244,238,227,.16)" }}
                  >
                    <label className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={current.hidden}
                        onChange={(e) => patchChapter(selected, { hidden: e.target.checked })}
                        className="h-4 w-4 accent-[#e8b26a]"
                      />
                      <span className="text-[12.5px]" style={{ color: MV.screenDim }}>
                        Keep this one hidden until they find it
                      </span>
                    </label>
                    {current.hidden && (
                      <Select
                        label="How they uncover it"
                        value={current.revealStyle}
                        onChange={(v) => patchChapter(selected, { revealStyle: v as Chapter["revealStyle"] })}
                        options={REVEAL_STYLES.map((r) => ({ value: r, label: REVEAL_STYLE_LABELS[r] }))}
                      />
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => duplicateChapter(selected)}
                      className="flex-1 cursor-pointer rounded-md px-3 py-2 text-[11.5px]"
                      style={{ background: "transparent", border: "1px solid rgba(244,238,227,.16)", color: MV.screenDim }}
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => removeChapter(selected)}
                      className="flex-1 cursor-pointer rounded-md px-3 py-2 text-[11.5px]"
                      style={{ background: "rgba(200,102,58,.14)", border: "1px solid rgba(200,102,58,.4)", color: "#e08a5c" }}
                    >
                      Delete slide
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ---------------- right: live preview ---------------- */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ ...slate, color: MV.slate }}>
            Live preview
          </span>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={previewFromStart}
              onChange={(e) => setPreviewFromStart(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#e8b26a]"
            />
            <span className="text-[11.5px]" style={{ color: MV.slate }}>
              Play the full opening, the way they&apos;ll see it
            </span>
          </label>
        </div>
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            aspectRatio: "16 / 10",
            minHeight: 420,
            border: "1px solid rgba(244,238,227,.12)",
            boxShadow: "0 40px 80px -44px rgba(0,0,0,.8)",
          }}
        >
          <MemoryverseView
            key={previewFromStart ? "from-start" : `from-slide-${selected}`}
            content={value}
            embedded
            previewIndex={previewFromStart ? undefined : selected}
          />
        </div>
        <p className="m-0 text-[11.5px]" style={{ color: MV.slate }}>
          Arrow keys, scroll and swipe all work in here — it is the real experience, not a mock-up.
        </p>
      </div>
    </div>
  );
}
