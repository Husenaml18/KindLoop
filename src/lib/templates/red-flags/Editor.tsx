"use client";

import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  ATTACHMENT_IDS,
  ATTACHMENT_LABELS,
  NOTEBOOKS,
  NOTEBOOK_IDS,
  type AttachmentId,
} from "./theme";
import {
  makeFlag,
  makeGoal,
  makeStep,
  type Flag,
  type RedFlagsContent,
} from "./schema";
import { RedFlagsView } from "./View";

/**
 * My Red Flags — the workbench.
 *
 * The hardest thing about this experience is not building it, it is getting
 * somebody to write it honestly. So the editor is shaped to make the honest
 * version the easy one:
 *
 *   - the five fields of a flag are laid out in the order the brief specifies,
 *     and "what I'm doing about it" is the largest block on the screen. You
 *     cannot fill this in and end up with a confession, because the work is
 *     always right there under the admission;
 *   - every placeholder is a real example rather than a instruction. "Pause
 *     before assuming" tells you what a step looks like; "Enter a step" does not;
 *   - nothing is required. Chapters with nothing in them are simply not shown to
 *     the reader, so an abandoned half-thought costs nothing.
 */

const PAPER = "#fffdf6";
const EDGE = "rgba(58,42,24,.14)";
const INK = "#33240f";
const MUTED = "#8a7458";
const ACCENT = "#8a3116";

const stamp: CSSProperties = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: 9.5,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: MUTED,
};

const field = "w-full rounded-lg px-3 py-2.5 text-[14px] outline-none";
const fieldStyle: CSSProperties = {
  background: "#fffefa",
  border: `1px solid ${EDGE}`,
  color: INK,
  fontFamily: "var(--font-space-grotesk), sans-serif",
};

type Step = "notebook" | "flags" | "promise" | "cover";

const STEPS: { id: Step; n: string; label: string }[] = [
  { id: "notebook", n: "01", label: "The notebook" },
  { id: "flags", n: "02", label: "The flags" },
  { id: "promise", n: "03", label: "The promise" },
  { id: "cover", n: "04", label: "Cover & ending" },
];

export function RedFlagsEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: RedFlagsContent;
  onChange: (v: RedFlagsContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [step, setStep] = useState<Step>("notebook");
  const [open, setOpen] = useState<string | null>(value.flags[0]?.id ?? null);

  const patch = (p: Partial<RedFlagsContent>) => onChange({ ...value, ...p });
  const book = NOTEBOOKS[value.notebook] ?? NOTEBOOKS.vintage;

  const patchFlag = (id: string, p: Partial<Flag>) =>
    patch({ flags: value.flags.map((f) => (f.id === id ? { ...f, ...p } : f)) });

  const addFlag = () => {
    if (value.flags.length >= 10) return;
    const f = makeFlag();
    patch({ flags: [...value.flags, f] });
    setOpen(f.id);
  };
  const removeFlag = (id: string) => patch({ flags: value.flags.filter((f) => f.id !== id) });
  const moveFlag = (i: number, to: number) => {
    if (to < 0 || to >= value.flags.length) return;
    const next = [...value.flags];
    const [f] = next.splice(i, 1);
    next.splice(to, 0, f);
    patch({ flags: next });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((s) => {
          const on = step === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className="flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2.5"
              style={{
                background: on ? book.accent : PAPER,
                color: on ? "#fff" : INK,
                border: `1px solid ${on ? book.accent : EDGE}`,
                fontSize: 13,
                transition: "background .2s ease, color .2s ease",
              }}
            >
              <span style={{ ...stamp, color: on ? "rgba(255,255,255,.7)" : "#a8926f" }}>{s.n}</span>
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        <div className="rounded-2xl p-5" style={{ background: PAPER, border: `1px solid ${EDGE}` }}>
          {/* ---------------- 01 · notebook ---------------- */}
          {step === "notebook" && (
            <div className="flex flex-col gap-4">
              <Note>
                Four notebooks, same words. None of them uses a bright red — this is
                growth, not a warning label.
              </Note>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {NOTEBOOK_IDS.map((id) => {
                  const nb = NOTEBOOKS[id];
                  const on = value.notebook === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => patch({ notebook: id })}
                      className="cursor-pointer overflow-hidden rounded-xl text-left"
                      style={{ border: `1.5px solid ${on ? nb.accent : EDGE}`, background: "#fffefa" }}
                    >
                      <div style={{ height: 58, background: nb.cover }} />
                      <div className="p-3.5">
                        <div style={{ fontSize: 14.5, fontWeight: 500, color: INK }}>{nb.label}</div>
                        <p className="m-0 mt-1" style={{ fontSize: 12.5, lineHeight: 1.5, color: MUTED }}>
                          {nb.blurb}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------- 02 · flags ---------------- */}
          {step === "flags" && (
            <div className="flex flex-col gap-3">
              <Note>
                One chapter each. Write the habit plainly, then what you&rsquo;re actually
                doing about it — a flag without the second half is just a confession.
              </Note>

              {value.flags.length === 0 && (
                <p className="m-0 py-4 text-center" style={{ fontSize: 13.5, color: MUTED }}>
                  Nothing here yet.
                </p>
              )}

              {value.flags.map((f, i) => (
                <FlagBlock
                  key={f.id}
                  flag={f}
                  n={i + 1}
                  open={open === f.id}
                  accent={book.accent}
                  onToggle={() => setOpen(open === f.id ? null : f.id)}
                  onChange={(p) => patchFlag(f.id, p)}
                  onRemove={() => removeFlag(f.id)}
                  onUp={() => moveFlag(i, i - 1)}
                  onDown={() => moveFlag(i, i + 1)}
                  first={i === 0}
                  last={i === value.flags.length - 1}
                  uploadPhoto={uploadPhoto}
                />
              ))}

              {value.flags.length < 10 && (
                <button
                  type="button"
                  onClick={addFlag}
                  className="cursor-pointer rounded-lg px-4 py-3 text-[13px]"
                  style={{ border: `1px dashed ${book.accent}`, color: book.accent, background: "transparent" }}
                >
                  + Another one
                </button>
              )}
            </div>
          )}

          {/* ---------------- 03 · promise ---------------- */}
          {step === "promise" && (
            <div className="flex flex-col gap-4">
              <Note>The page that closes the journal. Say the smaller, truer thing.</Note>

              <Field label="The promise">
                <input
                  className={field}
                  style={fieldStyle}
                  value={value.promiseTitle}
                  maxLength={120}
                  placeholder="I don't expect to become perfect."
                  onChange={(e) => patch({ promiseTitle: e.target.value })}
                />
              </Field>
              <Field label="And underneath it">
                <textarea
                  className={field}
                  style={{ ...fieldStyle, minHeight: 78, resize: "vertical" }}
                  value={value.promiseNote}
                  maxLength={400}
                  placeholder="I just don't want to stay the same."
                  onChange={(e) => patch({ promiseNote: e.target.value })}
                />
              </Field>

              <div>
                <span className="mb-2 block" style={stamp}>What you&rsquo;re aiming at</span>
                <div className="flex flex-col gap-2">
                  {value.goals.map((g, i) => (
                    <div key={g.id} className="flex flex-wrap items-center gap-2">
                      <input
                        className="rounded-lg px-3 py-2 text-[13px] outline-none"
                        style={{ ...fieldStyle, width: 118 }}
                        value={g.when}
                        maxLength={40}
                        placeholder="This year"
                        onChange={(e) =>
                          patch({ goals: value.goals.map((x) => (x.id === g.id ? { ...x, when: e.target.value } : x)) })
                        }
                      />
                      <input
                        className={`${field} flex-1`}
                        style={{ ...fieldStyle, minWidth: 180 }}
                        value={g.text}
                        maxLength={160}
                        placeholder="Say the thing instead of hoping you notice"
                        onChange={(e) =>
                          patch({ goals: value.goals.map((x) => (x.id === g.id ? { ...x, text: e.target.value } : x)) })
                        }
                      />
                      <Tiny onClick={() => patch({ goals: value.goals.filter((x) => x.id !== g.id) })} danger>
                        ×
                      </Tiny>
                      <span style={{ ...stamp, fontSize: 8.5 }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                  ))}
                  {value.goals.length < 6 && (
                    <Tiny onClick={() => patch({ goals: [...value.goals, makeGoal()] })}>+ Add a milestone</Tiny>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- 04 · cover & ending ---------------- */}
          {step === "cover" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="For">
                  <input className={field} style={fieldStyle} value={value.recipient} maxLength={60}
                    placeholder="Their name" onChange={(e) => patch({ recipient: e.target.value })} />
                </Field>
                <Field label="From">
                  <input className={field} style={fieldStyle} value={value.from} maxLength={60}
                    placeholder="Yours" onChange={(e) => patch({ from: e.target.value })} />
                </Field>
              </div>

              <Field label="Title on the cover">
                <input className={field} style={fieldStyle} value={value.coverTitle} maxLength={80}
                  onChange={(e) => patch({ coverTitle: e.target.value })} />
              </Field>
              <Field label="Subtitle">
                <input className={field} style={fieldStyle} value={value.coverSubtitle} maxLength={120}
                  onChange={(e) => patch({ coverSubtitle: e.target.value })} />
              </Field>
              <Field label="The handwritten line">
                <textarea className={field} style={{ ...fieldStyle, minHeight: 74, resize: "vertical" }}
                  value={value.coverNote} maxLength={240}
                  onChange={(e) => patch({ coverNote: e.target.value })} />
              </Field>

              <span className="h-px" style={{ background: EDGE }} />

              <Field label="The last words, after the jar opens">
                <textarea className={field} style={{ ...fieldStyle, minHeight: 78, resize: "vertical" }}
                  value={value.endingNote} maxLength={240}
                  onChange={(e) => patch({ endingNote: e.target.value })} />
              </Field>
            </div>
          )}
        </div>

        {/* ---------------- preview ---------------- */}
        <div className="flex flex-col gap-2">
          <span className="px-1" style={stamp}>Preview</span>
          <div className="overflow-hidden rounded-2xl" style={{ border: `1px solid ${EDGE}` }}>
            <div style={{ height: "min(76vh, 700px)", overflowY: "auto" }}>
              <RedFlagsView content={value} embedded />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function FlagBlock({
  flag,
  n,
  open,
  accent,
  onToggle,
  onChange,
  onRemove,
  onUp,
  onDown,
  first,
  last,
  uploadPhoto,
}: {
  flag: Flag;
  n: number;
  open: boolean;
  accent: string;
  onToggle: () => void;
  onChange: (p: Partial<Flag>) => void;
  onRemove: () => void;
  onUp: () => void;
  onDown: () => void;
  first: boolean;
  last: boolean;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const kind = flag.attachment.kind;

  const setSteps = (steps: Flag["steps"]) => onChange({ steps });

  return (
    <div className="rounded-xl" style={{ background: "#fffefa", border: `1px solid ${EDGE}` }}>
      <div className="flex items-center gap-2.5 p-3">
        <span style={{ ...stamp, width: 22 }}>{String(n).padStart(2, "0")}</span>
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 cursor-pointer border-0 bg-transparent text-left"
          style={{ fontSize: 14, color: flag.title ? INK : MUTED }}
        >
          🚩 {flag.title || "Untitled flag"}
        </button>
        <Tiny onClick={onUp} disabled={first}>↑</Tiny>
        <Tiny onClick={onDown} disabled={last}>↓</Tiny>
        <Tiny onClick={onToggle}>{open ? "Close" : "Edit"}</Tiny>
        <Tiny onClick={onRemove} danger>×</Tiny>
      </div>

      {open && (
        <div className="flex flex-col gap-3.5 border-t p-4" style={{ borderColor: EDGE }}>
          <Field label="The flag">
            <input className={field} style={fieldStyle} value={flag.title} maxLength={90}
              placeholder="I overthink texts."
              onChange={(e) => onChange({ title: e.target.value })} />
          </Field>

          <Field label="What it actually looks like">
            <textarea className={field} style={{ ...fieldStyle, minHeight: 76, resize: "vertical" }}
              value={flag.explain} maxLength={400}
              placeholder="When you take longer than usual to reply, my brain writes ten fake stories before reality arrives."
              onChange={(e) => onChange({ explain: e.target.value })} />
          </Field>

          <Field label="Where it comes from — optional">
            <textarea className={field} style={{ ...fieldStyle, minHeight: 62, resize: "vertical" }}
              value={flag.origin} maxLength={400}
              placeholder="I think I've always been scared of being forgotten."
              onChange={(e) => onChange({ origin: e.target.value })} />
          </Field>

          {/* the largest block on the screen, on purpose */}
          <div
            className="rounded-lg p-3.5"
            style={{ background: "rgba(92,122,74,.07)", border: "1px solid rgba(92,122,74,.22)" }}
          >
            <span className="mb-2.5 block" style={{ ...stamp, color: "#4a6b3a" }}>
              What I&rsquo;m doing about it
            </span>
            <div className="flex flex-col gap-2">
              {flag.steps.map((s) => (
                <div key={s.id} className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSteps(flag.steps.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)))}
                    aria-label={s.done ? "Mark as still in progress" : "Mark as done"}
                    className="grid cursor-pointer place-items-center rounded"
                    style={{
                      flex: "none",
                      width: 22,
                      height: 22,
                      border: `1.5px solid ${s.done ? "#5c7a4a" : "rgba(58,42,24,.28)"}`,
                      background: s.done ? "rgba(92,122,74,.16)" : "transparent",
                      color: "#4a6b3a",
                      fontSize: 12,
                    }}
                  >
                    {s.done ? "✓" : ""}
                  </button>
                  <input
                    className={`${field} flex-1`}
                    style={fieldStyle}
                    value={s.text}
                    maxLength={120}
                    placeholder="Pause before assuming"
                    onChange={(e) =>
                      setSteps(flag.steps.map((x) => (x.id === s.id ? { ...x, text: e.target.value } : x)))
                    }
                  />
                  <Tiny onClick={() => setSteps(flag.steps.filter((x) => x.id !== s.id))} danger>×</Tiny>
                </div>
              ))}
              {flag.steps.length < 8 && (
                <Tiny onClick={() => setSteps([...flag.steps, makeStep()])}>+ Add a step</Tiny>
              )}
            </div>
            <p className="m-0 mt-2.5" style={{ fontSize: 11.5, lineHeight: 1.5, color: MUTED }}>
              Leave the ones you haven&rsquo;t managed yet unticked. All ticked reads as a
              boast; none ticked reads as a shrug.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
            <Field label="A small win">
              <input className={field} style={fieldStyle} value={flag.win} maxLength={240}
                placeholder="Last month I waited instead of spiralling."
                onChange={(e) => onChange({ win: e.target.value })} />
            </Field>
            <Field label="When">
              <input className={field} style={fieldStyle} value={flag.winWhen} maxLength={60}
                placeholder="last month"
                onChange={(e) => onChange({ winWhen: e.target.value })} />
            </Field>
          </div>

          <Field label="What I need from you">
            <textarea className={field} style={{ ...fieldStyle, minHeight: 66, resize: "vertical" }}
              value={flag.need} maxLength={300}
              placeholder="If I'm spiralling, please tell me the truth instead of guessing what I need."
              onChange={(e) => onChange({ need: e.target.value })} />
          </Field>

          {/* ---- optional attachment ---- */}
          <div>
            <span className="mb-2 block" style={stamp}>Attach something — optional</span>
            <div className="flex flex-wrap gap-1.5">
              {ATTACHMENT_IDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => onChange({ attachment: { ...flag.attachment, kind: k as AttachmentId } })}
                  className="cursor-pointer rounded-full px-3 py-1.5 text-[12px]"
                  style={{
                    background: kind === k ? accent : "#fffefa",
                    color: kind === k ? "#fff" : INK,
                    border: `1px solid ${kind === k ? accent : EDGE}`,
                  }}
                >
                  {ATTACHMENT_LABELS[k]}
                </button>
              ))}
            </div>

            {kind !== "none" && (
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fileRef.current?.click()}
                    className="cursor-pointer rounded-lg px-3.5 py-2 text-[12px] disabled:opacity-50"
                    style={{ background: "rgba(138,49,22,.08)", border: `1px solid ${accent}`, color: accent }}
                  >
                    {flag.attachment.url ? "Replace" : "Upload"}
                  </button>
                  {flag.attachment.url && (
                    <Tiny onClick={() => onChange({ attachment: { ...flag.attachment, url: "" } })}>Remove</Tiny>
                  )}
                  {busy && <span style={{ ...stamp, fontSize: 8.5 }}>uploading…</span>}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept={kind === "voice" ? "audio/*" : "image/*"}
                  className="sr-only"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (fileRef.current) fileRef.current.value = "";
                    if (!f) return;
                    setBusy(true);
                    try {
                      const url = await uploadPhoto(f);
                      if (url) onChange({ attachment: { ...flag.attachment, url } });
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
                <input
                  className={field}
                  style={fieldStyle}
                  value={flag.attachment.caption}
                  maxLength={160}
                  placeholder="A line underneath it"
                  onChange={(e) => onChange({ attachment: { ...flag.attachment, caption: e.target.value } })}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- small pieces ---------- */

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="m-0" style={{ fontSize: 13.5, lineHeight: 1.6, color: "#7a6148" }}>
      {children}
    </p>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block" style={stamp}>{label}</span>
      {children}
    </label>
  );
}

function Tiny({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer self-start rounded-md px-2.5 py-1.5 text-[11.5px] disabled:cursor-default disabled:opacity-25"
      style={{ background: "transparent", border: `1px solid ${EDGE}`, color: danger ? ACCENT : "#7a6148" }}
    >
      {children}
    </button>
  );
}
