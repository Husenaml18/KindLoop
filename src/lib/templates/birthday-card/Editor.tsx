"use client";

import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  CAKE_IDS,
  CAKE_LABELS,
  CANDLE_COLORS,
  CANDLE_STYLE_IDS,
  CANDLE_STYLE_LABELS,
  CARD_THEMES,
  CARD_THEME_IDS,
  DECOR_IDS,
  DECOR_LABELS,
  FROSTINGS,
  FROSTING_IDS,
} from "./theme";
import type { BirthdayCardContent } from "./schema";
import { BirthdayCardView } from "./View";

/**
 * Interactive Birthday Card — the workbench.
 *
 * Four steps that match the four surfaces of the card, so the thing being edited
 * is always the thing on screen next to it. The preview is the real `View`, not a
 * mock-up — the same component the recipient gets, in the same states — so there
 * is no way for the editor to promise something the card does not do.
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

type Step = "cover" | "letter" | "cake" | "wish";

const STEPS: { id: Step; n: string; label: string }[] = [
  { id: "cover", n: "01", label: "The front" },
  { id: "letter", n: "02", label: "The letter" },
  { id: "cake", n: "03", label: "The cake" },
  { id: "wish", n: "04", label: "The wish" },
];

export function BirthdayCardEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: BirthdayCardContent;
  onChange: (v: BirthdayCardContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [step, setStep] = useState<Step>("cover");
  const patch = (p: Partial<BirthdayCardContent>) => onChange({ ...value, ...p });
  const theme = CARD_THEMES[value.theme] ?? CARD_THEMES.ransom;

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
                background: on ? theme.accent : PAPER,
                color: on ? "#fff" : INK,
                border: `1px solid ${on ? theme.accent : EDGE}`,
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
        <div className="rounded-2xl p-5" style={{ background: PAPER, border: `1px solid ${EDGE}` }}>
          {/* ---------------- 01 · the front ---------------- */}
          {step === "cover" && (
            <div className="flex flex-col gap-4">
              <Note>Everything they see before they open it.</Note>

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

              <Field label="Cut-out heading">
                <input className={field} style={fieldStyle} value={value.coverHeading} maxLength={40}
                  placeholder="Happy Birthday" onChange={(e) => patch({ coverHeading: e.target.value })} />
              </Field>
              <Field label="The line under it">
                <input className={field} style={fieldStyle} value={value.coverMessage} maxLength={160}
                  placeholder="Made just for you" onChange={(e) => patch({ coverMessage: e.target.value })} />
              </Field>

              <PhotoField label="Photo on the front" url={value.coverPhotoUrl} accent={theme.accent}
                onPick={(url) => patch({ coverPhotoUrl: url })} uploadPhoto={uploadPhoto} />

              <div>
                <span className="mb-2 block" style={stamp}>Card</span>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {CARD_THEME_IDS.map((id) => {
                    const t = CARD_THEMES[id];
                    const on = value.theme === id;
                    return (
                      <button key={id} type="button" onClick={() => patch({ theme: id })}
                        className="cursor-pointer overflow-hidden rounded-xl text-left"
                        style={{ border: `1.5px solid ${on ? t.accent : EDGE}`, background: "#fffefa" }}>
                        <div style={{ height: 44, background: t.board, position: "relative" }}>
                          <div style={{ position: "absolute", inset: "auto 10px 8px", height: 8, background: t.accent, borderRadius: 2 }} />
                        </div>
                        <div className="p-3">
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: INK }}>{t.label}</div>
                          <p className="m-0 mt-1" style={{ fontSize: 12, lineHeight: 1.45, color: MUTED }}>{t.blurb}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Chips label="Stuck round the edges" ids={DECOR_IDS} labels={DECOR_LABELS}
                value={value.decor} accent={theme.accent} onPick={(v) => patch({ decor: v })} />
            </div>
          )}

          {/* ---------------- 02 · the letter ---------------- */}
          {step === "letter" && (
            <div className="flex flex-col gap-4">
              <Note>
                Tucked in the envelope on the left page. Leave it empty and the
                envelope simply isn&rsquo;t there — no gap, no placeholder.
              </Note>

              <Field label="On the envelope">
                <input className={field} style={fieldStyle} value={value.envelopeTeaser} maxLength={80}
                  placeholder="A little something for you…"
                  onChange={(e) => patch({ envelopeTeaser: e.target.value })} />
              </Field>
              <Field label="Letter heading">
                <input className={field} style={fieldStyle} value={value.letterHeading} maxLength={120}
                  placeholder="Happy birthday, you."
                  onChange={(e) => patch({ letterHeading: e.target.value })} />
              </Field>
              <Field label="The letter">
                <textarea className={field} style={{ ...fieldStyle, minHeight: 220, resize: "vertical", fontFamily: "var(--font-gochi), cursive", fontSize: 17 }}
                  value={value.letterBody} maxLength={2400}
                  placeholder="The part you'd actually write by hand."
                  onChange={(e) => patch({ letterBody: e.target.value })} />
              </Field>
              <Field label="Sign it">
                <input className={field} style={fieldStyle} value={value.letterSignature} maxLength={60}
                  placeholder={value.from ? `— ${value.from}` : "— you"}
                  onChange={(e) => patch({ letterSignature: e.target.value })} />
              </Field>

              <PhotoField label="Photo in the letter" url={value.letterPhotoUrl} accent={theme.accent}
                onPick={(url) => patch({ letterPhotoUrl: url })} uploadPhoto={uploadPhoto} />
            </div>
          )}

          {/* ---------------- 03 · the cake ---------------- */}
          {step === "cake" && (
            <div className="flex flex-col gap-4">
              <Note>They hold a breath to blow these out. Or tap, if holding is hard.</Note>

              <Chips label="Cake" ids={CAKE_IDS} labels={CAKE_LABELS} value={value.cake}
                accent={theme.accent} onPick={(v) => patch({ cake: v })} />

              <div>
                <span className="mb-2 block" style={stamp}>Frosting</span>
                <div className="flex flex-wrap gap-2">
                  {FROSTING_IDS.map((id) => {
                    const f = FROSTINGS[id];
                    const on = value.frosting === id;
                    return (
                      <button key={id} type="button" onClick={() => patch({ frosting: id })}
                        className="flex cursor-pointer items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-[12.5px]"
                        style={{ border: `1.5px solid ${on ? theme.accent : EDGE}`, background: "#fffefa", color: INK }}>
                        <span style={{ width: 20, height: 20, borderRadius: 999, background: f.icing, border: `1px solid ${f.icingDeep}` }} />
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field label={`Candles — ${value.candleCount}`}>
                <input type="range" min={1} max={12} value={value.candleCount} className="w-full"
                  style={{ accentColor: theme.accent }}
                  onChange={(e) => patch({ candleCount: Number(e.target.value) })} />
                <p className="m-0 mt-1" style={{ fontSize: 11.5, lineHeight: 1.5, color: MUTED }}>
                  Capped at twelve on purpose — past that they read as a fence rather
                  than candles, especially on a phone.
                </p>
              </Field>

              <Chips label="Candle style" ids={CANDLE_STYLE_IDS} labels={CANDLE_STYLE_LABELS}
                value={value.candleStyle} accent={theme.accent} onPick={(v) => patch({ candleStyle: v })} />

              <div>
                <span className="mb-2 block" style={stamp}>Wax colours — tap to add or remove</span>
                <div className="flex flex-wrap gap-2">
                  {CANDLE_COLORS.map((c, i) => {
                    const on = value.candleColors.includes(i);
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={on}
                        aria-label={`Wax colour ${i + 1}`}
                        onClick={() => {
                          const next = on
                            ? value.candleColors.filter((x) => x !== i)
                            : [...value.candleColors, i];
                          /* Never let them empty it — a cake with no wax colour
                             would fall back silently and look like a bug. */
                          patch({ candleColors: next.length ? next : [i] });
                        }}
                        className="cursor-pointer rounded-full"
                        style={{
                          width: 30,
                          height: 30,
                          background: c,
                          border: on ? `2.5px solid ${INK}` : `1px solid ${EDGE}`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- 04 · the wish ---------------- */}
          {step === "wish" && (
            <div className="flex flex-col gap-4">
              <Note>The last thing they see, once the candles are out.</Note>

              <Field label="Heading">
                <input className={field} style={fieldStyle} value={value.finalHeading} maxLength={80}
                  placeholder="Make a wish" onChange={(e) => patch({ finalHeading: e.target.value })} />
              </Field>
              <Field label="And underneath it">
                <textarea className={field} style={{ ...fieldStyle, minHeight: 130, resize: "vertical" }}
                  value={value.finalMessage} maxLength={600}
                  placeholder="The one sentence you'd want them to keep."
                  onChange={(e) => patch({ finalMessage: e.target.value })} />
              </Field>

              <PhotoField label="A last photo" url={value.finalPhotoUrl} accent={theme.accent}
                onPick={(url) => patch({ finalPhotoUrl: url })} uploadPhoto={uploadPhoto} />

              <span className="h-px" style={{ background: EDGE }} />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Somewhere to go next — optional">
                  <input className={field} style={fieldStyle} value={value.ctaLabel} maxLength={40}
                    placeholder="There's more →" onChange={(e) => patch({ ctaLabel: e.target.value })} />
                </Field>
                <Field label="Link">
                  <input className={field} style={fieldStyle} value={value.ctaHref} maxLength={600}
                    placeholder="https://…" onChange={(e) => patch({ ctaHref: e.target.value })} />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* ---------------- the card itself ---------------- */}
        <div className="flex flex-col gap-2">
          <span className="px-1" style={stamp}>The card</span>
          <div className="overflow-hidden rounded-2xl" style={{ border: `1px solid ${EDGE}` }}>
            <div style={{ height: "min(78vh, 760px)", overflowY: "auto" }}>
              <BirthdayCardView content={value} embedded />
            </div>
          </div>
          <p className="m-0 px-1" style={{ fontSize: 11.5, lineHeight: 1.5, color: MUTED }}>
            This is the real card, not a picture of one — open it, read the letter and
            blow the candles here exactly as they will.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- small pieces ---------- */

function PhotoField({
  label,
  url,
  accent,
  onPick,
  uploadPhoto,
}: {
  label: string;
  url: string;
  accent: string;
  onPick: (url: string) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <Field label={label}>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={busy} onClick={() => ref.current?.click()}
          className="cursor-pointer rounded-lg px-3.5 py-2 text-[12px] disabled:opacity-50"
          style={{ background: "rgba(138,49,22,.08)", border: `1px solid ${accent}`, color: accent }}>
          {url ? "Replace" : "Upload"}
        </button>
        {url && <Tiny onClick={() => onPick("")}>Remove</Tiny>}
        {busy && <span style={{ ...stamp, fontSize: 8.5 }}>uploading…</span>}
      </div>
      <input ref={ref} type="file" accept="image/*" className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (ref.current) ref.current.value = "";
          if (!f) return;
          setBusy(true);
          try {
            const next = await uploadPhoto(f);
            if (next) onPick(next);
          } finally {
            setBusy(false);
          }
        }} />
    </Field>
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
          <button key={id} type="button" onClick={() => onPick(id)}
            className="cursor-pointer rounded-full px-3 py-1.5 text-[12px]"
            style={{
              background: value === id ? accent : "#fffefa",
              color: value === id ? "#fff" : INK,
              border: `1px solid ${value === id ? accent : EDGE}`,
            }}>
            {labels[id]}
          </button>
        ))}
      </div>
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="m-0" style={{ fontSize: 13.5, lineHeight: 1.6, color: "#7a6148" }}>{children}</p>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block" style={stamp}>{label}</span>
      {children}
    </label>
  );
}

function Tiny({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="cursor-pointer self-start rounded-md px-2.5 py-1.5 text-[11.5px]"
      style={{ background: "transparent", border: `1px solid ${EDGE}`, color: ACCENT }}>
      {children}
    </button>
  );
}
