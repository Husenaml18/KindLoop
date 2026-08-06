"use client";

import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  CHARACTER_IDS,
  CHARACTER_LABELS,
  DOODLE_IDS,
  MOODS,
  MOOD_IDS,
} from "./theme";
import type {
  Aside,
  Cute,
  Keepsake,
  Panel,
  Promise_,
  Regret,
  WinYouBackContent,
} from "./schema";
import { WinYouBackView } from "./View";

/**
 * The workbench.
 *
 * Written for somebody who is not in a good mood. Every list starts with real
 * suggestions rather than an empty box, because "write five things you should have
 * done" is a hard prompt to face cold — and the suggestions are deliberately
 * slightly funny, so the first thing that happens is a small exhale rather than a
 * blank page.
 *
 * Nothing is required. The preview updates as you go and always shows the real
 * experience, so what you are looking at is what they will see.
 */

const DESK = "#e7d9df";
const CARD = "#fffbfa";
const EDGE = "rgba(120,86,94,.2)";
const INK = "#4d363c";
const SOFT = "#8a6d74";
const ACCENT = "#c25c73";

const label: CSSProperties = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: 9.5,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: SOFT,
};

const field = "w-full rounded-md px-2.5 py-2 text-[13px] outline-none";
const fieldStyle: CSSProperties = {
  background: "#fffdfd",
  border: `1px solid ${EDGE}`,
  color: INK,
  fontFamily: "var(--font-space-grotesk), sans-serif",
};

/* Suggestions, so nothing starts empty. Written to be usable as they are. */
const SUGGESTED_REGRETS = [
  "listened",
  "called instead of texting",
  "hugged you",
  "trusted you",
  "asked how you were, and meant it",
  "said it out loud instead of assuming",
];
const SUGGESTED_PROMISES = [
  "I'll say the thing instead of sitting on it",
  "I'll stop replying “K”",
  "I'll ask before I assume",
  "I'll remember you haven't eaten",
  "I'll put the phone down",
];
const SUGGESTED_ASIDES = [
  "I practised this 27 times.",
  "I did briefly ask an AI for help. It was no use.",
  "I deleted my ego for this.",
  "There were three drafts. This is the least dramatic one.",
];

let seq = 0;
const nextId = () => `w${Date.now().toString(36)}${(seq += 1).toString(36)}`;

export function WinYouBackEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: WinYouBackContent;
  onChange: (v: WinYouBackContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [tab, setTab] = useState<"story" | "chapters" | "extras" | "look">("story");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingKeepsake = useRef<string | null>(null);

  const patch = (p: Partial<WinYouBackContent>) => onChange({ ...value, ...p });

  const upload = async (file: File, done: (url: string) => void) => {
    setBusy(true);
    try {
      done(await uploadPhoto(file));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      {/* ---------------- the controls ---------------- */}
      <div
        className="rounded-2xl p-5"
        style={{ background: DESK, border: `1px solid ${EDGE}` }}
      >
        <div className="mb-5 flex flex-wrap gap-1.5">
          {(
            [
              ["story", "The story"],
              ["chapters", "Chapters"],
              ["extras", "Extras"],
              ["look", "Look"],
            ] as const
          ).map(([id, name]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className="cursor-pointer rounded-full px-3.5 py-2 text-[12px]"
              style={{
                background: tab === id ? ACCENT : CARD,
                color: tab === id ? "#fff" : INK,
                border: `1px solid ${tab === id ? ACCENT : EDGE}`,
              }}
            >
              {name}
            </button>
          ))}
        </div>

        {tab === "story" && (
          <div className="flex flex-col gap-4">
            <Row>
              <Field label="To">
                <input
                  className={field}
                  style={fieldStyle}
                  value={value.to}
                  maxLength={60}
                  onChange={(e) => patch({ to: e.target.value })}
                  placeholder="Their name"
                />
              </Field>
              <Field label="From">
                <input
                  className={field}
                  style={fieldStyle}
                  value={value.from}
                  maxLength={60}
                  onChange={(e) => patch({ from: e.target.value })}
                  placeholder="Yours"
                />
              </Field>
            </Row>

            <Field label="The first line">
              <input
                className={field}
                style={fieldStyle}
                value={value.openingBroke}
                maxLength={120}
                onChange={(e) => patch({ openingBroke: e.target.value })}
              />
            </Field>
            <Field label="…and the second, after a pause">
              <input
                className={field}
                style={fieldStyle}
                value={value.openingFix}
                maxLength={120}
                onChange={(e) => patch({ openingFix: e.target.value })}
              />
            </Field>

            <Divider />

            <Field label="The letter — the plain part, at the end">
              <textarea
                className={field}
                style={{ ...fieldStyle, minHeight: 170, lineHeight: 1.6, resize: "vertical" }}
                value={value.letter}
                maxLength={2500}
                onChange={(e) => patch({ letter: e.target.value })}
                placeholder={"Say it the way you'd say it out loud.\n\nLeave a blank line between paragraphs."}
              />
            </Field>
            <Field label="Sign it">
              <input
                className={field}
                style={fieldStyle}
                value={value.letterSignoff}
                maxLength={80}
                onChange={(e) => patch({ letterSignoff: e.target.value })}
                placeholder="Yours, still"
              />
            </Field>
            <Field label="The last line of all">
              <textarea
                className={field}
                style={{ ...fieldStyle, minHeight: 62, resize: "vertical" }}
                value={value.closingLine}
                maxLength={240}
                onChange={(e) => patch({ closingLine: e.target.value })}
              />
            </Field>
          </div>
        )}

        {tab === "chapters" && (
          <div className="flex flex-col gap-5">
            {/* ---- 1 ---- */}
            <Group title="1 · What happened">
              <Field label="The admission, in one line">
                <input
                  className={field}
                  style={fieldStyle}
                  value={value.oopsLine}
                  maxLength={200}
                  onChange={(e) => patch({ oopsLine: e.target.value })}
                  placeholder="I know. Not my finest moment."
                />
              </Field>
              <Field label="And the rest of it">
                <textarea
                  className={field}
                  style={{ ...fieldStyle, minHeight: 76, resize: "vertical" }}
                  value={value.oopsAdmission}
                  maxLength={400}
                  onChange={(e) => patch({ oopsAdmission: e.target.value })}
                />
              </Field>
            </Group>

            {/* ---- 2 ---- */}
            <Group title="2 · What I was thinking">
              <Field label="Set it up">
                <textarea
                  className={field}
                  style={{ ...fieldStyle, minHeight: 62, resize: "vertical" }}
                  value={value.replayIntro}
                  maxLength={300}
                  onChange={(e) => patch({ replayIntro: e.target.value })}
                  placeholder="Here's what was going on in my head. It doesn't excuse it."
                />
              </Field>

              {value.panels.map((p, i) => (
                <Item key={p.id} onRemove={() => patch({ panels: value.panels.filter((x) => x.id !== p.id) })}>
                  <span style={{ ...label, fontSize: 8.5 }}>Panel {i + 1}</span>
                  <input
                    className={`${field} mt-1.5`}
                    style={fieldStyle}
                    value={p.bubble}
                    maxLength={120}
                    onChange={(e) => patchList<Panel>(value, patch, "panels", p.id, { bubble: e.target.value })}
                    placeholder="What was said, or thought"
                  />
                  <input
                    className={`${field} mt-1.5`}
                    style={fieldStyle}
                    value={p.caption}
                    maxLength={160}
                    onChange={(e) => patchList<Panel>(value, patch, "panels", p.id, { caption: e.target.value })}
                    placeholder="What's happening, underneath"
                  />
                  <select
                    className={`${field} mt-1.5`}
                    style={fieldStyle}
                    value={p.doodle}
                    onChange={(e) => patchList<Panel>(value, patch, "panels", p.id, { doodle: e.target.value as Panel["doodle"] })}
                  >
                    {DOODLE_IDS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Item>
              ))}

              {value.panels.length < 6 && (
                <Add
                  onClick={() =>
                    patch({ panels: [...value.panels, { id: nextId(), caption: "", bubble: "", doodle: "cloud" }] })
                  }
                >
                  Add a panel
                </Add>
              )}
            </Group>

            {/* ---- 3 ---- */}
            <Group title="3 · What I should've done">
              <Field label="Set it up">
                <textarea
                  className={field}
                  style={{ ...fieldStyle, minHeight: 56, resize: "vertical" }}
                  value={value.regretIntro}
                  maxLength={300}
                  onChange={(e) => patch({ regretIntro: e.target.value })}
                  placeholder="Open the ones you want to."
                />
              </Field>

              {value.regrets.map((r) => (
                <Item key={r.id} onRemove={() => patch({ regrets: value.regrets.filter((x) => x.id !== r.id) })}>
                  <input
                    className={field}
                    style={fieldStyle}
                    value={r.label}
                    maxLength={60}
                    onChange={(e) => patchList<Regret>(value, patch, "regrets", r.id, { label: e.target.value })}
                    placeholder="listened"
                  />
                  <textarea
                    className={`${field} mt-1.5`}
                    style={{ ...fieldStyle, minHeight: 64, resize: "vertical" }}
                    value={r.body}
                    maxLength={600}
                    onChange={(e) => patchList<Regret>(value, patch, "regrets", r.id, { body: e.target.value })}
                    placeholder="What you'd say if they opened this one"
                  />
                </Item>
              ))}

              {value.regrets.length < 6 && (
                <Suggestions
                  items={SUGGESTED_REGRETS.filter((s) => !value.regrets.some((r) => r.label === s))}
                  onPick={(s) => patch({ regrets: [...value.regrets, { id: nextId(), label: s, body: "" }] })}
                />
              )}
            </Group>

            {/* ---- 4 ---- */}
            <Group title="4 · The things I miss">
              <Field label="Set it up">
                <textarea
                  className={field}
                  style={{ ...fieldStyle, minHeight: 56, resize: "vertical" }}
                  value={value.missIntro}
                  maxLength={300}
                  onChange={(e) => patch({ missIntro: e.target.value })}
                />
              </Field>

              {value.keepsakes.map((k) => (
                <Item key={k.id} onRemove={() => patch({ keepsakes: value.keepsakes.filter((x) => x.id !== k.id) })}>
                  <select
                    className={field}
                    style={fieldStyle}
                    value={k.kind}
                    onChange={(e) => patchList<Keepsake>(value, patch, "keepsakes", k.id, { kind: e.target.value as Keepsake["kind"] })}
                  >
                    <option value="note">A note</option>
                    <option value="photo">A photo</option>
                    <option value="ticket">A ticket stub</option>
                    <option value="song">A song</option>
                    <option value="voice">A voice note</option>
                  </select>
                  <input
                    className={`${field} mt-1.5`}
                    style={fieldStyle}
                    value={k.caption}
                    maxLength={160}
                    onChange={(e) => patchList<Keepsake>(value, patch, "keepsakes", k.id, { caption: e.target.value })}
                    placeholder="The handwriting under it"
                  />
                  {(k.kind === "ticket" || k.kind === "song") && (
                    <input
                      className={`${field} mt-1.5`}
                      style={fieldStyle}
                      value={k.detail}
                      maxLength={120}
                      onChange={(e) => patchList<Keepsake>(value, patch, "keepsakes", k.id, { detail: e.target.value })}
                      placeholder="The second line"
                    />
                  )}
                  {(k.kind === "photo" || k.kind === "voice") && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        pendingKeepsake.current = k.id;
                        fileRef.current?.click();
                      }}
                      className="mt-1.5 w-full cursor-pointer rounded-md px-3 py-2 text-[11px]"
                      style={{ background: "rgba(194,92,115,.12)", border: `1px solid ${ACCENT}`, color: ACCENT }}
                    >
                      {k.url ? "Replace the file" : k.kind === "photo" ? "Upload a photo" : "Upload a voice note"}
                    </button>
                  )}
                </Item>
              ))}

              {value.keepsakes.length < 12 && (
                <Add
                  onClick={() =>
                    patch({
                      keepsakes: [
                        ...value.keepsakes,
                        { id: nextId(), kind: "note", url: "", caption: "", detail: "", tilt: value.keepsakes.length % 2 ? 2 : -2 },
                      ],
                    })
                  }
                >
                  Pin something up
                </Add>
              )}
            </Group>

            {/* ---- 5 ---- */}
            <Group title="5 · The promise">
              <Field label="Set it up">
                <textarea
                  className={field}
                  style={{ ...fieldStyle, minHeight: 56, resize: "vertical" }}
                  value={value.promiseIntro}
                  maxLength={300}
                  onChange={(e) => patch({ promiseIntro: e.target.value })}
                />
              </Field>

              {value.promises.map((p) => (
                <Item key={p.id} onRemove={() => patch({ promises: value.promises.filter((x) => x.id !== p.id) })}>
                  <input
                    className={field}
                    style={fieldStyle}
                    value={p.text}
                    maxLength={120}
                    onChange={(e) => patchList<Promise_>(value, patch, "promises", p.id, { text: e.target.value })}
                    placeholder="The promise"
                  />
                  <textarea
                    className={`${field} mt-1.5`}
                    style={{ ...fieldStyle, minHeight: 56, resize: "vertical" }}
                    value={p.detail}
                    maxLength={240}
                    onChange={(e) => patchList<Promise_>(value, patch, "promises", p.id, { detail: e.target.value })}
                    placeholder="What that looks like on an ordinary Tuesday"
                  />
                </Item>
              ))}

              {value.promises.length < 8 && (
                <Suggestions
                  items={SUGGESTED_PROMISES.filter((s) => !value.promises.some((p) => p.text === s))}
                  onPick={(s) =>
                    patch({ promises: [...value.promises, { id: nextId(), text: s, detail: "", doodle: "heart" }] })
                  }
                />
              )}
            </Group>
          </div>
        )}

        {tab === "extras" && (
          <div className="flex flex-col gap-5">
            <Group title="Notes round the edges">
              <p className="m-0 mb-2" style={{ fontSize: 11.5, lineHeight: 1.5, color: SOFT }}>
                The bits you&apos;d mutter. They drift in the margins — four at most,
                and never over the words.
              </p>
              {value.asides.map((a) => (
                <Item key={a.id} onRemove={() => patch({ asides: value.asides.filter((x) => x.id !== a.id) })}>
                  <input
                    className={field}
                    style={fieldStyle}
                    value={a.text}
                    maxLength={120}
                    onChange={(e) => patchList<Aside>(value, patch, "asides", a.id, { text: e.target.value })}
                  />
                </Item>
              ))}
              {value.asides.length < 8 && (
                <Suggestions
                  items={SUGGESTED_ASIDES.filter((s) => !value.asides.some((a) => a.text === s))}
                  onPick={(s) => patch({ asides: [...value.asides, { id: nextId(), text: s }] })}
                />
              )}
            </Group>

            <Group title="Emergency cute mode">
              <Toggle
                on={value.cuteEnabled}
                onChange={(on) => patch({ cuteEnabled: on })}
                label="Offer the teddy in the corner"
              />
              {value.cuteEnabled && (
                <>
                  <Field label="What the button says">
                    <input
                      className={field}
                      style={fieldStyle}
                      value={value.cuteLabel}
                      maxLength={60}
                      onChange={(e) => patch({ cuteLabel: e.target.value })}
                    />
                  </Field>

                  {value.cute.map((c) => (
                    <Item key={c.id} onRemove={() => patch({ cute: value.cute.filter((x) => x.id !== c.id) })}>
                      <select
                        className={field}
                        style={fieldStyle}
                        value={c.kind}
                        onChange={(e) => patchList<Cute>(value, patch, "cute", c.id, { kind: e.target.value as Cute["kind"] })}
                      >
                        <option value="joke">An inside joke</option>
                        <option value="image">A picture or GIF</option>
                        <option value="voice">A voice note</option>
                      </select>
                      <textarea
                        className={`${field} mt-1.5`}
                        style={{ ...fieldStyle, minHeight: 52, resize: "vertical" }}
                        value={c.text}
                        maxLength={240}
                        onChange={(e) => patchList<Cute>(value, patch, "cute", c.id, { text: e.target.value })}
                        placeholder="What it says"
                      />
                      {c.kind !== "joke" && (
                        <input
                          className={`${field} mt-1.5`}
                          style={fieldStyle}
                          value={c.url}
                          maxLength={600}
                          onChange={(e) => patchList<Cute>(value, patch, "cute", c.id, { url: e.target.value })}
                          placeholder="Paste a link"
                        />
                      )}
                    </Item>
                  ))}

                  {value.cute.length < 8 && (
                    <Add onClick={() => patch({ cute: [...value.cute, { id: nextId(), kind: "joke", url: "", text: "" }] })}>
                      Hide something behind it
                    </Add>
                  )}
                </>
              )}
            </Group>

            <Group title="The small stuff">
              <Toggle on={value.rating} onChange={(on) => patch({ rating: on })} label={"Show “Rate my apology”"} />
              <Toggle
                on={value.replyEnabled}
                onChange={(on) => patch({ replyEnabled: on })}
                label="Offer the three reply buttons"
              />
              {value.replyEnabled && (
                <>
                  <Field label="Where a reply should go">
                    <input
                      className={field}
                      style={fieldStyle}
                      value={value.replyTo}
                      maxLength={160}
                      onChange={(e) => patch({ replyTo: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <p className="m-0" style={{ fontSize: 11, lineHeight: 1.5, color: SOFT }}>
                    Leave it blank and the buttons still appear — they just say
                    plainly that nothing is sent from here. Kindloop never tells you
                    what was pressed either way.
                  </p>
                </>
              )}
            </Group>
          </div>
        )}

        {tab === "look" && (
          <div className="flex flex-col gap-5">
            <Field label="The palette">
              <div className="flex flex-wrap gap-2">
                {MOOD_IDS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => patch({ mood: m })}
                    className="cursor-pointer rounded-lg px-3 py-2 text-[12px]"
                    style={{
                      background: MOODS[m].paper,
                      border: `2px solid ${value.mood === m ? MOODS[m].accent : EDGE}`,
                      color: MOODS[m].ink,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: MOODS[m].accent,
                        marginRight: 7,
                      }}
                    />
                    {MOODS[m].label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Who you are, in the comic">
              <div className="flex flex-wrap gap-2">
                {CHARACTER_IDS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => patch({ character: c })}
                    className="cursor-pointer rounded-lg px-3 py-2 text-[12px]"
                    style={{
                      background: value.character === c ? ACCENT : CARD,
                      color: value.character === c ? "#fff" : INK,
                      border: `1px solid ${value.character === c ? ACCENT : EDGE}`,
                    }}
                  >
                    {CHARACTER_LABELS[c]}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* One input, pointed at whichever keepsake asked for it. */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,audio/*"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            const id = pendingKeepsake.current;
            if (fileRef.current) fileRef.current.value = "";
            if (!f || !id) return;
            await upload(f, (url) => {
              onChange({
                ...value,
                keepsakes: value.keepsakes.map((k) => (k.id === id ? { ...k, url } : k)),
              });
            });
          }}
        />
      </div>

      {/* ---------------- the preview ---------------- */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ border: `1px solid ${EDGE}`, minHeight: 560, background: MOODS[value.mood].paper }}
      >
        <div style={{ height: "100%", minHeight: 560 }}>
          <WinYouBackView content={value} embedded />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces of the workbench                                       */
/* ------------------------------------------------------------------ */

/** One typed helper instead of six near-identical map callbacks. */
function patchList<T extends { id: string }>(
  value: WinYouBackContent,
  patch: (p: Partial<WinYouBackContent>) => void,
  key: "panels" | "regrets" | "keepsakes" | "promises" | "asides" | "cute",
  id: string,
  changes: Partial<T>
) {
  const list = value[key] as unknown as T[];
  patch({ [key]: list.map((x) => (x.id === id ? { ...x, ...changes } : x)) } as Partial<WinYouBackContent>);
}

function Field({ label: text, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block" style={label}>{text}</span>
      {children}
    </label>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: CARD, border: `1px solid ${EDGE}` }}>
      <p className="m-0 mb-3" style={{ ...label, color: ACCENT }}>{title}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Divider() {
  return <span className="block h-px" style={{ background: EDGE }} />;
}

function Item({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <div className="relative rounded-lg p-3 pr-9" style={{ background: "rgba(255,255,255,.6)", border: `1px solid ${EDGE}` }}>
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="absolute right-2 top-2 cursor-pointer rounded-md border-0 bg-transparent px-1.5 py-0.5 text-[13px]"
        style={{ color: SOFT }}
      >
        ×
      </button>
    </div>
  );
}

function Add({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full cursor-pointer rounded-md px-3 py-2 text-[12px]"
      style={{ background: "rgba(194,92,115,.1)", border: `1px dashed ${ACCENT}`, color: ACCENT }}
    >
      + {children}
    </button>
  );
}

/**
 * Ready-made lines, offered rather than imposed.
 *
 * Somebody opening this is being asked to write down what they got wrong. A blank
 * box is the wrong first thing to meet; one tap that puts a real sentence on the
 * page and lets it be edited is a much easier place to start from.
 */
function Suggestions({ items, onPick }: { items: string[]; onPick: (s: string) => void }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="m-0 mb-2" style={{ ...label, fontSize: 8.5 }}>Or start from one of these</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="cursor-pointer rounded-full px-3 py-1.5 text-[11.5px]"
            style={{ background: CARD, border: `1px solid ${EDGE}`, color: INK }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ on, onChange, label: text }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} style={{ accentColor: ACCENT }} />
      <span style={{ fontSize: 12.5, color: INK }}>{text}</span>
    </label>
  );
}
