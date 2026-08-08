"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";
import { templateImage } from "@/lib/templateImages";
import { getSectionTemplate } from "@/lib/templates/sections";
import {
  HAIR_COLORS,
  HAIR_IDS,
  HAIR_LABELS,
  HAT_IDS,
  HAT_LABELS,
  OUTFIT_COLORS,
  OUTFIT_IDS,
  OUTFIT_LABELS,
  PROP_IDS,
  PROP_LABELS,
  SECRET_IDS,
  SECRET_PLACES,
  SKIN_TONES,
  WORLDS,
  WORLD_IDS,
  archetypeFor,
} from "./theme";
import {
  makeCharacter,
  makeDistrict,
  type Character,
  type District,
  type MiniWorldContent,
} from "./schema";
import { WorldStage } from "./World";
import { TinyPerson } from "./parts";

/**
 * Mini World — the workbench.
 *
 * Seven steps, in the order the brief lays them out, because that order is also
 * the order somebody imagines a place: what kind of world, who is in it, what is
 * in it, where things stand, what is hidden at the end, then look at it.
 *
 * Two things it refuses to do. It does not rebuild a single editor — pressing
 * Edit on a building mounts that experience's own `Editor`, the identical
 * component `/create/[template]` mounts, with the identical three props. And it
 * does not generate the layout: buildings are dragged onto the ground by hand,
 * because a tidy generated grid would say nothing and the whole premise is that
 * this place means something.
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

type Step = "world" | "people" | "places" | "arrange" | "secret" | "words";

const STEPS: { id: Step; n: string; label: string }[] = [
  { id: "world", n: "01", label: "The world" },
  { id: "people", n: "02", label: "Who lives there" },
  { id: "places", n: "03", label: "What's in it" },
  { id: "arrange", n: "04", label: "Where it stands" },
  { id: "secret", n: "05", label: "The secret place" },
  { id: "words", n: "06", label: "The words" },
];

export function MiniWorldEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: MiniWorldContent;
  onChange: (v: MiniWorldContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [step, setStep] = useState<Step>("world");
  const [editing, setEditing] = useState<string | null>(null);
  const [whoOpen, setWhoOpen] = useState<string | null>(null);
  const reduced = Boolean(useReducedMotion());

  const patch = (p: Partial<MiniWorldContent>) => onChange({ ...value, ...p });
  const world = WORLDS[value.world] ?? WORLDS["cozy-town"];

  const available = useMemo(
    () => TEMPLATE_CATALOG.filter((t) => t.status === "available" && getSectionTemplate(t.id)),
    []
  );

  const addDistrict = (type: string) => {
    const def = getSectionTemplate(type);
    if (!def || value.districts.length >= 12) return;
    patch({
      districts: [...value.districts, makeDistrict(type, value.districts.length, Boolean(def.isPaid))],
    });
  };
  const patchDistrict = (id: string, p: Partial<District>) =>
    patch({ districts: value.districts.map((d) => (d.id === id ? { ...d, ...p } : d)) });
  const removeDistrict = (id: string) =>
    patch({ districts: value.districts.filter((d) => d.id !== id) });

  const patchCharacter = (id: string, p: Partial<Character>) =>
    patch({ characters: value.characters.map((c) => (c.id === id ? { ...c, ...p } : c)) });

  const editingDistrict = value.districts.find((d) => d.id === editing) ?? null;
  const owing = value.districts.filter((d) => d.locked).length;

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
                background: on ? world.accent : PAPER,
                color: on ? "#fff" : INK,
                border: `1px solid ${on ? world.accent : EDGE}`,
                fontSize: 13,
                transition: "background .2s ease, color .2s ease",
              }}
            >
              <span style={{ ...stamp, color: on ? "rgba(255,255,255,.72)" : "#a8926f" }}>{s.n}</span>
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
        <div className="rounded-2xl p-5" style={{ background: PAPER, border: `1px solid ${EDGE}` }}>
          {/* ---------------- 01 · world ---------------- */}
          {step === "world" && (
            <div className="flex flex-col gap-4">
              <Note>
                The setting only — sky, ground, weather and props. It never reaches
                inside the experiences you put in it; a Love Letter looks like a Love
                Letter in all seven.
              </Note>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {WORLD_IDS.map((id) => {
                  const w = WORLDS[id];
                  const on = value.world === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => patch({ world: id })}
                      className="cursor-pointer overflow-hidden rounded-xl text-left"
                      style={{ border: `1.5px solid ${on ? w.accent : EDGE}`, background: "#fffefa" }}
                    >
                      <div style={{ height: 56, background: w.sky, position: "relative" }}>
                        <div style={{ position: "absolute", inset: "auto 0 0", height: 18, background: w.ground }} />
                      </div>
                      <div className="p-3.5">
                        <div style={{ fontSize: 14.5, fontWeight: 500, color: INK }}>
                          {w.emoji} {w.label}
                        </div>
                        <p className="m-0 mt-1" style={{ fontSize: 12.5, lineHeight: 1.5, color: MUTED }}>
                          {w.blurb}
                        </p>
                        <p className="m-0 mt-1.5" style={{ ...stamp, fontSize: 8.5 }}>
                          best for {w.bestFor}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------- 02 · people ---------------- */}
          {step === "people" && (
            <div className="flex flex-col gap-3">
              <Note>
                Tiny versions of whoever this is about. They wander the world, wave,
                and stand together at the end.
              </Note>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {value.characters.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setWhoOpen(whoOpen === c.id ? null : c.id)}
                    className="cursor-pointer rounded-xl p-3"
                    style={{
                      background: "#fffefa",
                      border: `1.5px solid ${whoOpen === c.id ? world.accent : EDGE}`,
                    }}
                  >
                    <svg viewBox="-9 -20 18 22" style={{ width: "100%", height: 84, overflow: "visible" }}>
                      <TinyPerson ch={c} i={i} />
                    </svg>
                    <div className="mt-1.5 truncate" style={{ fontSize: 12.5, color: c.name ? INK : MUTED }}>
                      {c.name || "Unnamed"}
                    </div>
                  </button>
                ))}

                {value.characters.length < 6 && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = makeCharacter(value.characters.length);
                      patch({ characters: [...value.characters, c] });
                      setWhoOpen(c.id);
                    }}
                    className="grid cursor-pointer place-items-center rounded-xl p-3"
                    style={{ border: `1px dashed ${world.accent}`, color: world.accent, minHeight: 120, fontSize: 13 }}
                  >
                    + Someone else
                  </button>
                )}
              </div>

              {whoOpen && (
                <CharacterBuilder
                  ch={value.characters.find((c) => c.id === whoOpen)!}
                  accent={world.accent}
                  onChange={(p) => patchCharacter(whoOpen, p)}
                  onRemove={() => {
                    patch({ characters: value.characters.filter((c) => c.id !== whoOpen) });
                    setWhoOpen(null);
                  }}
                />
              )}
            </div>
          )}

          {/* ---------------- 03 · places ---------------- */}
          {step === "places" && (
            <div className="flex flex-col gap-4">
              <Note>
                Every experience Kindloop makes gets a building. Add what the story
                needs — the same one twice is fine, they just get different signs.
              </Note>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {available.map((t) => {
                  const def = getSectionTemplate(t.id)!;
                  const used = value.districts.filter((d) => d.type === t.id).length;
                  const art = templateImage(t.id);
                  const a = archetypeFor(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => addDistrict(t.id)}
                      className="relative cursor-pointer overflow-hidden rounded-xl text-left"
                      style={{ border: `1px solid ${used ? world.accent : EDGE}`, background: "#fffefa" }}
                    >
                      <div style={{ position: "relative", aspectRatio: "5 / 4", overflow: "hidden" }}>
                        {art ? (
                          <Image src={art} alt="" fill sizes="220px" placeholder="blur"
                            style={{ objectFit: "cover", opacity: def.isPaid ? 0.62 : 1 }} />
                        ) : (
                          <div className="h-full w-full" style={{ background: world.accentSoft }} />
                        )}
                        {used > 0 && (
                          <span className="absolute right-2 top-2 grid h-6 min-w-6 place-items-center rounded-full px-1.5"
                            style={{ background: world.accent, color: "#fff", fontSize: 11.5 }}>
                            {used > 1 ? `×${used}` : "✓"}
                          </span>
                        )}
                        {def.isPaid && (
                          <span className="absolute left-2 top-2 rounded-full px-2 py-1"
                            style={{ ...stamp, fontSize: 8.5, background: "rgba(23,18,14,.8)", color: "#fdf6e8" }}>
                            ★ ${((def.priceCents ?? 0) / 100).toFixed(0)}
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <div style={{ fontSize: 13, fontWeight: 500, color: INK }}>{t.name}</div>
                        <p className="m-0 mt-1" style={{ fontSize: 11.5, lineHeight: 1.45, color: MUTED }}>
                          becomes {a.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------- 04 · arrange ---------------- */}
          {step === "arrange" && (
            <div className="flex flex-col gap-3">
              <Note>
                Drag the buildings around the map on the right. Where things stand is
                worth thinking about — the café next to the park you actually walked
                through means more than a tidy row.
              </Note>

              {value.districts.length === 0 && (
                <p className="m-0 py-4 text-center" style={{ fontSize: 13.5, color: MUTED }}>
                  Nothing built yet.
                </p>
              )}

              {value.districts.map((d, i) => {
                const def = getSectionTemplate(d.type);
                const a = archetypeFor(d.type);
                return (
                  <div key={d.id} className="flex flex-wrap items-center gap-2.5 rounded-xl p-3"
                    style={{ background: "#fffefa", border: `1px solid ${EDGE}` }}>
                    <span style={{ ...stamp, width: 20 }}>{String(i + 1).padStart(2, "0")}</span>
                    <input
                      className="flex-1 rounded-lg px-2.5 py-1.5 text-[13px] outline-none"
                      style={{ ...fieldStyle, minWidth: 130 }}
                      value={d.label}
                      maxLength={40}
                      placeholder={a.name}
                      onChange={(e) => patchDistrict(d.id, { label: e.target.value })}
                    />
                    <span style={{ ...stamp, fontSize: 8.5 }}>{def?.displayName ?? d.type}</span>
                    {d.locked && (
                      <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, background: "rgba(138,49,22,.1)", color: ACCENT }}>
                        🔒
                      </span>
                    )}
                    <Tiny onClick={() => patchDistrict(d.id, { depth: (d.depth + 1) % 3 })}>
                      {["far", "mid", "near"][d.depth]}
                    </Tiny>
                    <Tiny onClick={() => setEditing(d.id)}>Edit</Tiny>
                    <Tiny onClick={() => removeDistrict(d.id)} danger>×</Tiny>
                  </div>
                );
              })}
            </div>
          )}

          {/* ---------------- 05 · secret ---------------- */}
          {step === "secret" && (
            <div className="flex flex-col gap-4">
              <Note>
                One place, tucked at the edge of the map, holding the thing you
                actually wanted to say. It is the only part of the world nobody
                stumbles into by accident.
              </Note>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {SECRET_IDS.map((id) => {
                  const p = SECRET_PLACES[id];
                  const on = value.secret === id;
                  return (
                    <button key={id} type="button" onClick={() => patch({ secret: id })}
                      className="cursor-pointer rounded-xl p-3.5 text-left"
                      style={{ background: on ? world.accentSoft : "#fffefa", border: `1.5px solid ${on ? world.accent : EDGE}` }}>
                      <div style={{ fontSize: 20, lineHeight: 1 }}>{p.emoji}</div>
                      <div className="mt-2" style={{ fontSize: 13.5, fontWeight: 500, color: INK }}>{p.label}</div>
                    </button>
                  );
                })}
              </div>

              <Field label="What it says when they get there">
                <input className={field} style={fieldStyle} value={value.secretTitle} maxLength={120}
                  placeholder="There's one more thing."
                  onChange={(e) => patch({ secretTitle: e.target.value })} />
              </Field>
              <Field label="And then">
                <textarea className={field} style={{ ...fieldStyle, minHeight: 150, resize: "vertical" }}
                  value={value.secretMessage} maxLength={900}
                  placeholder="The part you'd only say out loud once."
                  onChange={(e) => patch({ secretMessage: e.target.value })} />
              </Field>
            </div>
          )}

          {/* ---------------- 06 · words ---------------- */}
          {step === "words" && (
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

              <Field label="On the wooden sign">
                <input className={field} style={fieldStyle} value={value.title} maxLength={80}
                  onChange={(e) => patch({ title: e.target.value })} />
              </Field>
              <Field label="Underneath it">
                <textarea className={field} style={{ ...fieldStyle, minHeight: 70, resize: "vertical" }}
                  value={value.subtitle} maxLength={140}
                  placeholder="One line, before they go in."
                  onChange={(e) => patch({ subtitle: e.target.value })} />
              </Field>

              <span className="h-px" style={{ background: EDGE }} />

              <Field label="The last line, once the camera pulls back">
                <input className={field} style={fieldStyle} value={value.endingLine} maxLength={160}
                  onChange={(e) => patch({ endingLine: e.target.value })} />
              </Field>
            </div>
          )}
        </div>

        {/* ---------------- the map ---------------- */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span style={stamp}>{step === "arrange" ? "Drag the buildings" : "The world"}</span>
            {owing > 0 && (
              <span style={{ ...stamp, color: ACCENT }}>
                {owing} to unlock
              </span>
            )}
          </div>
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{ border: `1px solid ${EDGE}`, aspectRatio: "4 / 3" }}
          >
            <WorldStage
              content={value}
              world={world}
              visited={new Set()}
              reduced={reduced}
              focus={null}
              interactive={false}
              onOpen={() => {}}
              onOpenSecret={() => {}}
              onDragDistrict={
                step === "arrange"
                  ? (id, x, y) => patchDistrict(id, { x, y })
                  : undefined
              }
            />
          </div>
          {step === "arrange" && (
            <p className="m-0 px-1" style={{ fontSize: 11.5, lineHeight: 1.5, color: MUTED }}>
              Positions are percentages, so the layout holds its shape on a phone.
            </p>
          )}
        </div>
      </div>

      {/* ---------------- one building's own editor ---------------- */}
      <AnimatePresence>
        {editingDistrict && (
          <DistrictSheet
            district={editingDistrict}
            uploadPhoto={uploadPhoto}
            onChange={(c) => patchDistrict(editingDistrict.id, { content: c })}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * The character builder.
 *
 * Every choice redraws the figure above it immediately, at the size it will
 * actually be in the world. Somebody making a tiny version of their partner is
 * not filling in a form; they are trying to get the hair right.
 */
function CharacterBuilder({
  ch,
  accent,
  onChange,
  onRemove,
}: {
  ch: Character;
  accent: string;
  onChange: (p: Partial<Character>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-3.5 rounded-xl p-4" style={{ background: "#fffefa", border: `1px solid ${EDGE}` }}>
      <div className="flex flex-wrap items-center gap-4">
        <svg viewBox="-10 -21 20 23" style={{ width: 96, height: 96, overflow: "visible" }}>
          <TinyPerson ch={ch} i={0} scale={1.1} />
        </svg>
        <div className="flex-1" style={{ minWidth: 160 }}>
          <Field label="Their name">
            <input className={field} style={fieldStyle} value={ch.name} maxLength={40}
              placeholder="Who is this?" onChange={(e) => onChange({ name: e.target.value })} />
          </Field>
        </div>
        <Tiny onClick={onRemove} danger>Remove</Tiny>
      </div>

      <Swatches label="Skin" colors={SKIN_TONES} value={ch.skin} onPick={(i) => onChange({ skin: i })} />
      <Chips label="Hair" ids={HAIR_IDS} labels={HAIR_LABELS} value={ch.hair} accent={accent}
        onPick={(v) => onChange({ hair: v })} />
      <Swatches label="Hair colour" colors={HAIR_COLORS} value={ch.hairColor} onPick={(i) => onChange({ hairColor: i })} />
      <Chips label="Outfit" ids={OUTFIT_IDS} labels={OUTFIT_LABELS} value={ch.outfit} accent={accent}
        onPick={(v) => onChange({ outfit: v })} />
      <Swatches label="Outfit colour" colors={OUTFIT_COLORS} value={ch.outfitColor} onPick={(i) => onChange({ outfitColor: i })} />
      <Chips label="Hat" ids={HAT_IDS} labels={HAT_LABELS} value={ch.hat} accent={accent}
        onPick={(v) => onChange({ hat: v })} />
      <Chips label="Carrying" ids={PROP_IDS} labels={PROP_LABELS} value={ch.prop} accent={accent}
        onPick={(v) => onChange({ prop: v })} />

      <label className="flex cursor-pointer items-center gap-2.5">
        <input type="checkbox" checked={ch.glasses} onChange={(e) => onChange({ glasses: e.target.checked })} />
        <span style={{ fontSize: 13.5, color: INK }}>Glasses</span>
      </label>
    </div>
  );
}

function Swatches({
  label,
  colors,
  value,
  onPick,
}: {
  label: string;
  colors: readonly string[];
  value: number;
  onPick: (i: number) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block" style={stamp}>{label}</span>
      <div className="flex flex-wrap gap-2">
        {colors.map((c, i) => (
          <button
            key={c}
            type="button"
            aria-label={`${label} ${i + 1}`}
            onClick={() => onPick(i)}
            className="cursor-pointer rounded-full"
            style={{
              width: 26,
              height: 26,
              background: c,
              border: value === i ? "2.5px solid #33240f" : `1px solid ${EDGE}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Chips<T extends string>({
  label,
  ids,
  labels,
  value,
  accent,
  onPick,
}: {
  label: string;
  ids: readonly T[];
  labels: Record<T, string>;
  value: T;
  accent: string;
  onPick: (v: T) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block" style={stamp}>{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            className="cursor-pointer rounded-full px-3 py-1.5 text-[12px]"
            style={{
              background: value === id ? accent : "#fffefa",
              color: value === id ? "#fff" : INK,
              border: `1px solid ${value === id ? accent : EDGE}`,
            }}
          >
            {labels[id]}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A building's own editor, mounted unchanged. Same contract as everywhere else. */
function DistrictSheet({
  district,
  onChange,
  onClose,
  uploadPhoto,
}: {
  district: District;
  onChange: (content: unknown) => void;
  onClose: () => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const reduced = useReducedMotion();
  const def = getSectionTemplate(district.type);
  if (!def) return null;

  const parsed = def.contentSchema.safeParse(district.content ?? def.emptyContent);
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
            <p className="m-0" style={stamp}>
              Inside {district.label || archetypeFor(district.type).name}
            </p>
            <h2 className="m-0 mt-1" style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 22, color: INK }}>
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
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button type="button" onClick={onClick}
      className="cursor-pointer self-start rounded-md px-2.5 py-1.5 text-[11.5px]"
      style={{ background: "transparent", border: `1px solid ${EDGE}`, color: danger ? ACCENT : "#7a6148" }}>
      {children}
    </button>
  );
}
