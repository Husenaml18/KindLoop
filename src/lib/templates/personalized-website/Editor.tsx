"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { StaticImageData } from "next/image";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";
import { templateImage } from "@/lib/templateImages";
import { getSectionTemplate as getTemplate } from "@/lib/templates/sections";
import { INTRO_IDS, INTRO_LABELS, WEBSITE_THEMES, WEBSITE_THEME_IDS } from "./theme";
import { makeSection, type PersonalizedWebsiteContent, type WebsiteSection } from "./schema";
import { PersonalizedWebsiteView } from "./View";

/**
 * Personalized Website — the workbench.
 *
 * Four steps, in the order somebody actually thinks: what kind of story, which
 * pieces, what order, then the words. Each step is finishable and reversible, and
 * none is gated behind finishing the one before it.
 *
 * The thing this file most carefully does *not* do is rebuild any editor. Editing
 * a section mounts that experience's own `Editor` — the identical component
 * `/create/[template]` mounts, given the same `{ value, onChange, uploadPhoto }`.
 * Ten editors, none forked, none aware they are inside a website.
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

type Step = "theme" | "sections" | "arrange" | "words";

const STEPS: { id: Step; n: string; label: string }[] = [
  { id: "theme", n: "01", label: "The kind of story" },
  { id: "sections", n: "02", label: "The pieces" },
  { id: "arrange", n: "03", label: "The order" },
  { id: "words", n: "04", label: "The words" },
];

export function PersonalizedWebsiteEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: PersonalizedWebsiteContent;
  onChange: (v: PersonalizedWebsiteContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [step, setStep] = useState<Step>("theme");
  const [editing, setEditing] = useState<string | null>(null);
  const [offering, setOffering] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const heroRef = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<PersonalizedWebsiteContent>) => onChange({ ...value, ...p });
  const theme = WEBSITE_THEMES[value.theme] ?? WEBSITE_THEMES.romantic;

  /*
   * Every finished experience is offered, owned or not.
   *
   * Hiding what somebody has not bought also hides the reason to buy it. A paid
   * card is dimmed and asks at publish; it is never absent and never refuses a
   * click.
   */
  const available = useMemo(
    () => TEMPLATE_CATALOG.filter((t) => t.status === "available" && getTemplate(t.id)),
    []
  );

  const chosen = value.sections;
  const countOf = (id: string) => chosen.filter((s) => s.type === id).length;

  const add = (templateId: string) => {
    const def = getTemplate(templateId);
    if (!def || chosen.length >= 12) return;
    patch({ sections: [...chosen, makeSection(templateId, Boolean(def.isPaid))] });
  };
  const remove = (id: string) => patch({ sections: chosen.filter((s) => s.id !== id) });
  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= chosen.length) return;
    const next = [...chosen];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    patch({ sections: next });
  };
  const patchSection = (id: string, content: unknown) =>
    patch({ sections: chosen.map((s) => (s.id === id ? { ...s, content } : s)) });

  const editingSection = chosen.find((s) => s.id === editing) ?? null;
  const offeringDef = offering ? getTemplate(offering) : undefined;
  const offeringCard = offering ? available.find((t) => t.id === offering) : undefined;
  const owing = chosen.filter((s) => s.locked).length;

  return (
    <div className="flex flex-col gap-6">
      {/* ---------------- the steps ---------------- */}
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
                background: on ? theme.accent : PAPER,
                color: on ? "#fff" : INK,
                border: `1px solid ${on ? theme.accent : EDGE}`,
                fontSize: 13,
                transition: "background .2s ease, color .2s ease",
              }}
            >
              <span style={{ ...stamp, color: on ? "rgba(255,255,255,.7)" : "#a8926f" }}>
                {s.n}
              </span>
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)]">
        <div className="rounded-2xl p-5" style={{ background: PAPER, border: `1px solid ${EDGE}` }}>
          {/* ---------------- 01 · theme ---------------- */}
          {step === "theme" && (
            <div className="flex flex-col gap-4">
              <Note>
                A starting point, not a rule. The theme dresses the opening, the seams
                between sections and the last screen — it never reaches inside the
                sections themselves.
              </Note>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {WEBSITE_THEME_IDS.map((id) => {
                  const t = WEBSITE_THEMES[id];
                  const on = value.theme === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => patch({ theme: id })}
                      className="cursor-pointer rounded-xl p-4 text-left"
                      style={{
                        background: on ? t.accentSoft : "#fffefa",
                        border: `1.5px solid ${on ? t.accent : EDGE}`,
                        transition: "background .2s ease, border-color .2s ease",
                      }}
                    >
                      <div style={{ fontSize: 20, lineHeight: 1 }}>{t.emoji}</div>
                      <div className="mt-2.5" style={{ fontSize: 14.5, fontWeight: 500, color: INK }}>
                        {t.label}
                      </div>
                      <p className="m-0 mt-1" style={{ fontSize: 12.5, lineHeight: 1.5, color: MUTED }}>
                        {t.blurb}
                      </p>
                    </button>
                  );
                })}
              </div>

              {chosen.length === 0 && (
                <button
                  type="button"
                  onClick={() =>
                    patch({
                      sections: theme.suggested
                        .filter((id) => getTemplate(id))
                        .map((id) => makeSection(id, Boolean(getTemplate(id)?.isPaid))),
                    })
                  }
                  className="cursor-pointer rounded-lg px-4 py-3 text-[13px]"
                  style={{
                    border: `1px dashed ${theme.accent}`,
                    color: theme.accent,
                    background: "transparent",
                  }}
                >
                  Lay out a {theme.label.toLowerCase()} for me — {theme.suggested.length} sections,
                  all of them changeable
                </button>
              )}
            </div>
          )}

          {/* ---------------- 02 · pieces ---------------- */}
          {step === "sections" && (
            <div className="flex flex-col gap-4">
              <Note>
                Everything Kindloop makes, whether or not you own it yet. Add as many as
                the story needs — the same experience twice is fine.
              </Note>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {available.map((t) => {
                  const def = getTemplate(t.id)!;
                  const paid = Boolean(def.isPaid);
                  const used = countOf(t.id);
                  const lit = hover === t.id;
                  const art = templateImage(t.id);

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => (paid ? setOffering(t.id) : add(t.id))}
                      onMouseEnter={() => setHover(t.id)}
                      onMouseLeave={() => setHover((h) => (h === t.id ? null : h))}
                      onFocus={() => setHover(t.id)}
                      onBlur={() => setHover((h) => (h === t.id ? null : h))}
                      className="relative cursor-pointer overflow-hidden rounded-xl text-left"
                      style={{
                        border: `1px solid ${used ? theme.accent : EDGE}`,
                        background: "#fffefa",
                        transform: lit ? "translateY(-2px)" : "none",
                        transition: "transform .22s ease, border-color .2s ease",
                      }}
                    >
                      <div style={{ position: "relative", aspectRatio: "5 / 4", overflow: "hidden" }}>
                        {art ? (
                          <Image
                            src={art}
                            alt=""
                            fill
                            sizes="220px"
                            placeholder="blur"
                            style={{
                              objectFit: "cover",
                              /* Locked pieces stay beautiful — dimmed and softened,
                                 never hidden, and they come up to full colour under
                                 the cursor. Something waiting to be unlocked, not
                                 something being withheld. */
                              opacity: !paid || lit ? 1 : 0.55,
                              filter: !paid || lit ? "none" : "saturate(.6)",
                              transition: "opacity .35s ease, filter .35s ease",
                            }}
                          />
                        ) : (
                          <div className="h-full w-full" style={{ background: theme.accentSoft }} />
                        )}

                        <span
                          className="absolute left-2 top-2 rounded-full px-2 py-1"
                          style={{
                            ...stamp,
                            fontSize: 8.5,
                            letterSpacing: ".12em",
                            background: paid ? "rgba(23,18,14,.8)" : "rgba(95,128,71,.9)",
                            color: "#fdf6e8",
                          }}
                        >
                          {paid ? `★ $${((def.priceCents ?? 0) / 100).toFixed(0)}` : "Free"}
                        </span>

                        {used > 0 && (
                          <span
                            className="absolute right-2 top-2 grid h-6 min-w-6 place-items-center rounded-full px-1.5"
                            style={{ background: theme.accent, color: "#fff", fontSize: 11.5 }}
                          >
                            {used > 1 ? `×${used}` : "✓"}
                          </span>
                        )}
                      </div>

                      <div className="p-3">
                        <div style={{ fontSize: 13, fontWeight: 500, color: INK }}>{t.name}</div>
                        <p className="m-0 mt-1" style={{ fontSize: 11.5, lineHeight: 1.45, color: MUTED }}>
                          {paid ? "Unlock to add" : "Tap to add"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------- 03 · order ---------------- */}
          {step === "arrange" && (
            <div className="flex flex-col gap-2.5">
              <Note>
                Drag to rearrange, or use the arrows. Edit opens that experience&rsquo;s own
                editor.
              </Note>

              <Rail label="Opening" />

              {chosen.length === 0 && (
                <p className="m-0 py-6 text-center" style={{ fontSize: 13.5, color: MUTED }}>
                  Nothing in the story yet — pick some pieces first.
                </p>
              )}

              {chosen.map((s, i) => {
                const def = getTemplate(s.type);
                const held = dragging === i;
                return (
                  <div
                    key={s.id}
                    draggable
                    onDragStart={() => setDragging(i)}
                    onDragEnd={() => setDragging(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragging !== null) move(dragging, i);
                      setDragging(null);
                    }}
                    className="flex items-center gap-2.5 rounded-xl p-3"
                    style={{
                      background: "#fffefa",
                      border: `1px solid ${held ? theme.accent : EDGE}`,
                      opacity: held ? 0.5 : 1,
                      cursor: "grab",
                    }}
                  >
                    <span aria-hidden style={{ color: "#c3b39a", fontSize: 13, letterSpacing: -1 }}>
                      ⠿
                    </span>
                    <span style={{ ...stamp, width: 20 }}>{String(i + 1).padStart(2, "0")}</span>

                    <span className="flex-1" style={{ fontSize: 14, color: INK }}>
                      {def?.displayName ?? s.type}
                      {s.locked && (
                        <span
                          className="ml-2 whitespace-nowrap rounded-full px-2 py-0.5"
                          style={{ fontSize: 10, background: "rgba(138,49,22,.1)", color: ACCENT }}
                        >
                          🔒 unlocks at publish
                        </span>
                      )}
                    </span>

                    <Tiny onClick={() => move(i, i - 1)} disabled={i === 0} title="Move up">↑</Tiny>
                    <Tiny onClick={() => move(i, i + 1)} disabled={i === chosen.length - 1} title="Move down">↓</Tiny>
                    <Tiny onClick={() => setEditing(s.id)}>Edit</Tiny>
                    <Tiny onClick={() => remove(s.id)} danger title="Remove">×</Tiny>
                  </div>
                );
              })}

              <Rail label="Last screen" />
            </div>
          )}

          {/* ---------------- 04 · words ---------------- */}
          {step === "words" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="For">
                  <input className={field} style={fieldStyle} value={value.recipient} maxLength={60}
                    onChange={(e) => patch({ recipient: e.target.value })} placeholder="Their name" />
                </Field>
                <Field label="From">
                  <input className={field} style={fieldStyle} value={value.from} maxLength={60}
                    onChange={(e) => patch({ from: e.target.value })} placeholder="Yours" />
                </Field>
              </div>

              <Field label="Title">
                <input className={field} style={fieldStyle} value={value.title} maxLength={120}
                  onChange={(e) => patch({ title: e.target.value })} placeholder="Our story" />
              </Field>

              <Field label="Subtitle">
                <textarea className={field} style={{ ...fieldStyle, minHeight: 66, resize: "vertical" }}
                  value={value.subtitle} maxLength={200} placeholder="One line, before anything opens."
                  onChange={(e) => patch({ subtitle: e.target.value })} />
              </Field>

              <Field label="Opening image">
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" disabled={busy} onClick={() => heroRef.current?.click()}
                    className="cursor-pointer rounded-lg px-3.5 py-2 text-[12px] disabled:opacity-50"
                    style={{ background: theme.accentSoft, border: `1px solid ${theme.accent}`, color: theme.accent }}>
                    {value.heroImageUrl ? "Replace" : "Upload"}
                  </button>
                  {value.heroImageUrl && <Tiny onClick={() => patch({ heroImageUrl: "" })}>Remove</Tiny>}
                  {busy && <span style={{ ...stamp, fontSize: 8.5 }}>uploading…</span>}
                </div>
                <input ref={heroRef} type="file" accept="image/*" className="sr-only"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (heroRef.current) heroRef.current.value = "";
                    if (!f) return;
                    setBusy(true);
                    try {
                      const url = await uploadPhoto(f);
                      if (url) patch({ heroImageUrl: url });
                    } finally {
                      setBusy(false);
                    }
                  }} />
              </Field>

              <Field label="How it opens">
                <div className="flex flex-wrap gap-1.5">
                  {INTRO_IDS.map((id) => (
                    <button key={id} type="button" onClick={() => patch({ intro: id })}
                      className="cursor-pointer rounded-full px-3 py-1.5 text-[12px]"
                      style={{
                        background: value.intro === id ? theme.accent : "#fffefa",
                        color: value.intro === id ? "#fff" : INK,
                        border: `1px solid ${value.intro === id ? theme.accent : EDGE}`,
                      }}>
                      {INTRO_LABELS[id]}
                    </button>
                  ))}
                </div>
              </Field>

              <span className="h-px" style={{ background: EDGE }} />

              <Field label="The last screen">
                <input className={field} style={fieldStyle} value={value.endingTitle} maxLength={120}
                  onChange={(e) => patch({ endingTitle: e.target.value })} placeholder="…and it keeps going." />
              </Field>
              <Field label="And underneath it">
                <textarea className={field} style={{ ...fieldStyle, minHeight: 84, resize: "vertical" }}
                  value={value.endingNote} maxLength={400}
                  onChange={(e) => patch({ endingNote: e.target.value })} />
              </Field>
            </div>
          )}
        </div>

        {/* ---------------- live preview ---------------- */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span style={stamp}>Preview</span>
            {owing > 0 && (
              <span style={{ ...stamp, color: ACCENT }}>
                {owing} section{owing > 1 ? "s" : ""} to unlock
              </span>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl" style={{ border: `1px solid ${EDGE}`, background: "#fff" }}>
            <div style={{ height: "min(78vh, 720px)", overflowY: "auto" }}>
              <PersonalizedWebsiteView content={value} embedded showLocked />
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- the premium offer ---------------- */}
      <AnimatePresence>
        {offeringDef && offeringCard && (
          <Offer
            name={offeringDef.displayName}
            blurb={offeringCard.blurb}
            adds={offeringCard.interaction}
            priceCents={offeringDef.priceCents ?? 0}
            art={templateImage(offeringDef.id)}
            accent={theme.accent}
            onClose={() => setOffering(null)}
            onAdd={() => {
              /*
               * Added straight away, marked locked.
               *
               * Payment is asked for once, at publish, against everything owing —
               * not per card mid-build, which would mean bouncing out to a checkout
               * with a half-built website unsaved behind you. The person never
               * presses the same button twice, which was the point.
               */
              add(offeringDef.id);
              setOffering(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ---------------- one section's own editor ---------------- */}
      <AnimatePresence>
        {editingSection && (
          <SectionSheet
            section={editingSection}
            uploadPhoto={uploadPhoto}
            onChange={(c) => patchSection(editingSection.id, c)}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * A section's own editor, mounted in a sheet.
 *
 * The registry hands back the identical component `/create/[template]` uses. It
 * gets the same three props and is told nothing else — no notion that it is
 * inside a website, no wrapper around its state, no fork.
 */
function SectionSheet({
  section,
  onChange,
  onClose,
  uploadPhoto,
}: {
  section: WebsiteSection;
  onChange: (content: unknown) => void;
  onClose: () => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const reduced = useReducedMotion();
  const def = getTemplate(section.type);
  if (!def) return null;

  const parsed = def.contentSchema.safeParse(section.content ?? def.emptyContent);
  const content = parsed.success ? parsed.data : def.emptyContent;

  const Inner = def.Editor as ComponentType<{
    value: unknown;
    onChange: (v: unknown) => void;
    uploadPhoto: (f: File) => Promise<string>;
  }>;

  return (
    <motion.div
      className="fixed inset-0 z-[120] overflow-y-auto p-3 sm:p-8"
      style={{ background: "rgba(30,20,10,.55)", backdropFilter: "blur(6px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="mx-auto rounded-2xl p-4 sm:p-5"
        style={{ maxWidth: 1180, background: "#f6efe2", border: `1px solid ${EDGE}` }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="m-0" style={stamp}>Editing one section</p>
            <h2 className="m-0 mt-1"
              style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 22, color: INK }}>
              {def.displayName}
            </h2>
          </div>
          <button type="button" onClick={onClose}
            className="cursor-pointer rounded-full px-5 py-2.5 text-[13px]"
            style={{ background: INK, color: "#fdfaf1", border: "none" }}>
            Done
          </button>
        </div>

        <Inner value={content} onChange={onChange} uploadPhoto={uploadPhoto} />
      </motion.div>
    </motion.div>
  );
}

/** The premium dialog. What it adds first, what it costs second. */
function Offer({
  name,
  blurb,
  adds,
  priceCents,
  art,
  accent,
  onAdd,
  onClose,
}: {
  name: string;
  blurb: string;
  adds: string;
  priceCents: number;
  art?: StaticImageData;
  accent: string;
  onAdd: () => void;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="fixed inset-0 z-[130] grid place-items-center overflow-y-auto p-5"
      style={{ background: "rgba(30,20,10,.6)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Add ${name}`}
    >
      <motion.div
        className="w-full overflow-hidden rounded-2xl"
        style={{ maxWidth: 420, background: PAPER, border: `1px solid ${EDGE}` }}
        onClick={(e) => e.stopPropagation()}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
      >
        {art && (
          <div style={{ position: "relative", aspectRatio: "16 / 9" }}>
            <Image src={art} alt="" fill sizes="420px" placeholder="blur" style={{ objectFit: "cover" }} />
          </div>
        )}
        <div className="p-6">
          <h3 className="m-0"
            style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 23, color: INK }}>
            {name}
          </h3>
          <p className="m-0 mt-2" style={{ fontSize: 14.5, lineHeight: 1.6, color: "#7a6148" }}>
            {blurb}
          </p>
          <p className="m-0 mt-3.5 rounded-lg px-3.5 py-3"
            style={{ background: "rgba(58,42,24,.05)", fontSize: 13, lineHeight: 1.55, color: INK }}>
            <strong style={{ fontWeight: 600 }}>What it adds: </strong>
            {adds}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" onClick={onAdd}
              className="flex-1 cursor-pointer rounded-full px-5 py-3 text-[14px] font-medium"
              style={{ background: accent, color: "#fff", border: "none" }}>
              Add it — ${(priceCents / 100).toFixed(0)}
            </button>
            <button type="button" onClick={onClose}
              className="cursor-pointer rounded-full px-5 py-3 text-[13.5px]"
              style={{ background: "transparent", border: `1px solid ${EDGE}`, color: "#7a6148" }}>
              Maybe later
            </button>
          </div>
          <p className="m-0 mt-3.5 text-center" style={{ fontSize: 11.5, lineHeight: 1.5, color: MUTED }}>
            Build the whole thing first — fill it in, move it around, change your mind.
            You only pay when you publish.
          </p>
        </div>
      </motion.div>
    </motion.div>
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
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title}
      className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11.5px] disabled:cursor-default disabled:opacity-25"
      style={{ background: "transparent", border: `1px solid ${EDGE}`, color: danger ? ACCENT : "#7a6148" }}>
      {children}
    </button>
  );
}

/** The two parts of a website that are always there and cannot be moved. */
function Rail({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5"
      style={{ background: "rgba(58,42,24,.035)", border: `1px dashed ${EDGE}` }}>
      <span aria-hidden style={{ color: "#c3b39a", fontSize: 12 }}>—</span>
      <span style={{ fontSize: 12.5, color: MUTED }}>{label} · always here</span>
    </div>
  );
}
