"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { fraunces, spaceGrotesk, ibmPlexMono, gochiHand } from "@/app/fonts";
import {
  DECOR_KINDS,
  DOODLE_SHAPES,
  ITEM_KINDS,
  ITEM_LABELS,
  makeItem,
  spreadSchema,
  type DigitalScrapbookContent,
  type ItemKind,
  type ScrapItem,
} from "./schema";
import { PAGE_THEMES, THEME_IDS, getTheme, PAPER_GRAIN } from "./theme";
import { ScrapItemView } from "./items";
import { CraftDrawer, DragGhost } from "./CraftDrawer";
import { DigitalScrapbookView } from "./View";

/* ---- craft-table chrome: warm wood and paper, never a dark IDE ---- */
const TABLE = "#5c4029";
const TABLE_DARK = "#432d1c";
const CARD = "#f7efdd";
const CARD_EDGE = "rgba(74,50,26,.18)";
const INK = "#3a3026";
const INK_SOFT = "#7a6a52";

const KIND_GLYPH: Record<ItemKind, string> = {
  photo: "🖼", polaroid: "📸", note: "✍", journal: "📓", title: "🅣",
  ticket: "🎟", postcard: "📮", filmstrip: "🎞", sticky: "🗒", letter: "💌",
  cassette: "📼", pocket: "🧵", flower: "🌸", leaf: "🍃", tape: "🩹",
  clip: "📎", stain: "☕", doodle: "✎", stamp: "🔖", ribbon: "🎗", star: "✦",
  pin: "🧷", tag: "🏷", scrap: "📜",
};

const CONTENT_KINDS = ITEM_KINDS.filter((k) => !DECOR_KINDS.includes(k));

const label: CSSProperties = {
  fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: 9.5,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: INK_SOFT,
};

const fieldCls = "w-full rounded-md px-2.5 py-2 text-[13px] outline-none";
const fieldStyle: CSSProperties = {
  background: "#fffdf6",
  border: `1px solid ${CARD_EDGE}`,
  color: INK,
  fontFamily: "var(--font-space-grotesk), sans-serif",
};

function Btn({
  children,
  onClick,
  disabled,
  tone = "quiet",
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "quiet" | "solid" | "danger";
  title?: string;
}) {
  const tones: Record<string, CSSProperties> = {
    quiet: { background: "#fffdf6", border: `1px solid ${CARD_EDGE}`, color: INK },
    solid: { background: "#a8663c", border: "1px solid #a8663c", color: "#fffdf4" },
    danger: { background: "rgba(168,60,44,.1)", border: "1px solid rgba(168,60,44,.4)", color: "#a83c2c" },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className="cursor-pointer rounded-md px-2.5 py-1.5 text-[11.5px] disabled:cursor-not-allowed disabled:opacity-40"
      style={tones[tone]}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */

export function DigitalScrapbookEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: DigitalScrapbookContent;
  onChange: (value: DigitalScrapbookContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snap, setSnap] = useState(true);
  const [guides, setGuides] = useState<{ v: boolean; h: boolean }>({ v: false, h: false });
  const [tab, setTab] = useState<"book" | "page">("page");
  const [showPreview, setShowPreview] = useState(false);

  /** A supply lifted out of the drawer, in flight toward the page. */
  const [spawn, setSpawn] = useState<{ kind: ItemKind; color?: string; glyph: string; x: number; y: number } | null>(
    null
  );

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<"item" | "cover" | "closing">("item");

  /* Undo / redo over whole-content snapshots — small documents, so this is
     simpler and more predictable than a command log. Held in state, not refs,
     so the buttons actually enable and disable as the stacks change. */
  const [past, setPast] = useState<DigitalScrapbookContent[]>([]);
  const [future, setFuture] = useState<DigitalScrapbookContent[]>([]);

  /** Records the pre-change snapshot so the change can be undone. */
  const bank = useCallback(() => {
    setPast((p) => [...p.slice(-49), value]);
    setFuture([]);
  }, [value]);

  const commit = useCallback(
    (next: DigitalScrapbookContent) => {
      bank();
      onChange(next);
    },
    [bank, onChange]
  );

  /** Position/rotation nudges during a drag shouldn't each become an undo step. */
  const commitQuiet = (next: DigitalScrapbookContent) => onChange(next);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [value, ...f.slice(0, 49)]);
      onChange(prev);
      return p.slice(0, -1);
    });
  }, [onChange, value]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const [next, ...rest] = f;
      setPast((p) => [...p, value]);
      onChange(next);
      return rest;
    });
  }, [onChange, value]);

  const spread = value.spreads[spreadIndex];
  const items = spread?.items ?? [];
  const selected = items.find((i) => i.id === selectedId) ?? null;
  const theme = getTheme(spread?.theme ?? value.theme);

  const patch = (p: Partial<DigitalScrapbookContent>) => commit({ ...value, ...p });

  const patchSpread = (p: Partial<typeof spread>, quiet = false) => {
    if (!spread) return;
    const next = {
      ...value,
      spreads: value.spreads.map((s, i) => (i === spreadIndex ? { ...s, ...p } : s)),
    };
    (quiet ? commitQuiet : commit)(next);
  };

  const patchItem = (id: string, p: Partial<ScrapItem>, quiet = false) => {
    if (!spread) return;
    patchSpread({ items: spread.items.map((it) => (it.id === id ? { ...it, ...p } : it)) }, quiet);
  };

  const freshItemId = () => {
    const used = new Set(value.spreads.flatMap((s) => s.items.map((i) => i.id)));
    let n = used.size + 1;
    while (used.has(`it-${n}`)) n += 1;
    return `it-${n}`;
  };

  const addItem = (kind: ItemKind, at?: { x: number; y: number }, color?: string) => {
    if (!spread) return;
    const id = freshItemId();
    const topZ = items.reduce((m, i) => Math.max(m, i.z), 0);
    /* Placed pieces land where you dropped them; otherwise staggered near the
       middle so successive additions never stack exactly on top of each other. */
    const item = {
      ...makeItem(kind, id),
      x: at ? at.x : 42 + (items.length % 4) * 4,
      y: at ? at.y : 40 + (items.length % 3) * 6,
      rotate: [-4, 3, -2, 5][items.length % 4],
      z: topZ + 1,
      ...(color ? { color } : {}),
    };
    patchSpread({ items: [...items, item] });
    setSelectedId(id);
  };

  const removeItem = (id: string) => {
    patchSpread({ items: items.filter((i) => i.id !== id) });
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateItem = (id: string) => {
    const src = items.find((i) => i.id === id);
    if (!src) return;
    const nid = freshItemId();
    patchSpread({
      items: [...items, { ...src, id: nid, x: Math.min(112, src.x + 5), y: Math.min(112, src.y + 5), z: src.z + 1 }],
    });
    setSelectedId(nid);
  };

  const layer = (id: string, dir: 1 | -1) => {
    const src = items.find((i) => i.id === id);
    if (!src) return;
    patchItem(id, { z: Math.max(0, Math.min(999, src.z + dir)) });
  };

  /* ---- spreads ---- */
  const addSpread = () => {
    const used = new Set(value.spreads.map((s) => s.id));
    let n = value.spreads.length + 1;
    while (used.has(`sp-${n}`)) n += 1;
    const fresh = spreadSchema.parse({ id: `sp-${n}`, items: [] });
    patch({ spreads: [...value.spreads, fresh] });
    setSpreadIndex(value.spreads.length);
    setSelectedId(null);
  };

  const removeSpread = (i: number) => {
    patch({ spreads: value.spreads.filter((_, idx) => idx !== i) });
    setSpreadIndex((s) => Math.max(0, Math.min(s, value.spreads.length - 2)));
    setSelectedId(null);
  };

  const moveSpread = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.spreads.length) return;
    const next = [...value.spreads];
    [next[i], next[j]] = [next[j], next[i]];
    patch({ spreads: next });
    setSpreadIndex(j);
  };

  /* ---- dragging on the canvas ---- */
  const dragState = useRef<{ id: string; mode: "move" | "size"; startW: number; startX: number } | null>(null);

  const onItemPointerDown = (e: React.PointerEvent, item: ScrapItem, mode: "move" | "size") => {
    if (item.locked) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragState.current = { id: item.id, mode, startW: item.w, startX: e.clientX };
    setSelectedId(item.id);
  };

  const onCanvasPointerMove = (e: React.PointerEvent) => {
    const drag = dragState.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;

    if (drag.mode === "move") {
      let x = ((e.clientX - rect.left) / rect.width) * 100;
      let y = ((e.clientY - rect.top) / rect.height) * 100;
      const nearV = Math.abs(x - 50) < 1.6;
      const nearH = Math.abs(y - 50) < 1.6;
      if (snap) {
        if (nearV) x = 50;
        if (nearH) y = 50;
        x = Math.round(x * 2) / 2;
        y = Math.round(y * 2) / 2;
      }
      setGuides({ v: nearV, h: nearH });
      patchItem(drag.id, { x: Math.max(-15, Math.min(115, x)), y: Math.max(-15, Math.min(115, y)) }, true);
    } else {
      const delta = ((e.clientX - drag.startX) / rect.width) * 100;
      patchItem(drag.id, { w: Math.max(3, Math.min(96, drag.startW + delta * 2)) }, true);
    }
  };

  const endDrag = () => {
    if (dragState.current) {
      dragState.current = null;
      setGuides({ v: false, h: false });
      /* Bank one undo step for the whole gesture. */
      bank();
    }
  };

  /* ---- lifting a supply out of the drawer and dropping it on the page ---- */
  const pickUpSupply = (kind: ItemKind, color: string | undefined, e: React.PointerEvent) => {
    if (!spread) return;
    const glyph = KIND_GLYPH[kind];
    const hasPointer = typeof e.clientX === "number" && e.clientX !== 0;
    if (!hasPointer) {
      /* Keyboard path: drop it straight into the middle of the page. */
      addItem(kind, { x: 50, y: 50 }, color);
      return;
    }
    setSpawn({ kind, color, glyph, x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!spawn) return;

    const move = (e: PointerEvent) => setSpawn((s) => (s ? { ...s, x: e.clientX, y: e.clientY } : s));
    const drop = (e: PointerEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      setSpawn(null);
      if (!rect) return;
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) return; // dropped off the page — nothing happens, like missing the glue
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      addItem(spawn.kind, { x: Math.round(x * 2) / 2, y: Math.round(y * 2) / 2 }, spawn.color);
    };
    const cancel = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSpawn(null);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", drop);
    window.addEventListener("keydown", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", drop);
      window.removeEventListener("keydown", cancel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- addItem closes over the current spread on purpose
  }, [spawn, spreadIndex, value]);

  /* ---- keyboard ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;

      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (!selected || selected.locked) return;
      const step = e.shiftKey ? 4 : 1;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        patchItem(selected.id, { x: selected.x - step });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        patchItem(selected.id, { x: selected.x + step });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        patchItem(selected.id, { y: selected.y - step });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        patchItem(selected.id, { y: selected.y + step });
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeItem(selected.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers close over the current selection intentionally
  }, [selected, undo, redo, spreadIndex, value]);

  const pickFile = (target: "item" | "cover" | "closing") => {
    uploadTargetRef.current = target;
    fileRef.current?.click();
  };

  return (
    <div
      className={`${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${gochiHand.variable} rounded-2xl p-4 sm:p-5`}
      style={{
        background: `linear-gradient(160deg, ${TABLE}, ${TABLE_DARK})`,
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const url = await uploadPhoto(file);
          /* Empty means the upload was refused; the reason is already on screen. */
          if (!url) return;
          const target = uploadTargetRef.current;
          if (target === "cover") patch({ coverImageUrl: url });
          else if (target === "closing") patch({ closingImageUrl: url });
          else if (selected) patchItem(selected.id, { imageUrl: url });
          if (fileRef.current) fileRef.current.value = "";
        }}
      />

      {/* top rail */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span style={{ ...label, color: "rgba(255,236,203,.75)" }}>The craft table</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Btn onClick={undo} disabled={past.length === 0} title="Undo (Cmd+Z)">↶ Undo</Btn>
          <Btn onClick={redo} disabled={future.length === 0} title="Redo (Shift+Cmd+Z)">↷ Redo</Btn>
          <Btn onClick={() => setSnap((s) => !s)} tone={snap ? "solid" : "quiet"} title="Snap to guides">
            ⌗ Snap
          </Btn>
          <Btn onClick={() => setShowPreview((p) => !p)} tone={showPreview ? "solid" : "quiet"}>
            {showPreview ? "Close preview" : "▶ Preview as they'll see it"}
          </Btn>
        </div>
      </div>

      {showPreview ? (
        <div className="overflow-hidden rounded-xl" style={{ height: "min(72vh, 640px)", border: `1px solid ${CARD_EDGE}` }}>
          <DigitalScrapbookView content={value} embedded />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[230px_minmax(0,1fr)_270px]">
          {/* ---------------- left: pages + palette ---------------- */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl p-3" style={{ background: CARD, border: `1px solid ${CARD_EDGE}` }}>
              <div className="mb-2 flex items-center justify-between">
                <span style={label}>Pages</span>
                <Btn onClick={addSpread} tone="solid" title="Add a page">+</Btn>
              </div>
              <div className="flex max-h-44 flex-col gap-1.5 overflow-y-auto">
                {value.spreads.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-1 rounded-md p-1"
                    style={{
                      background: i === spreadIndex ? "rgba(168,102,60,.14)" : "transparent",
                      border: `1px solid ${i === spreadIndex ? "rgba(168,102,60,.45)" : "transparent"}`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSpreadIndex(i);
                        setSelectedId(null);
                      }}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 bg-transparent text-left"
                    >
                      <span style={{ ...label, fontSize: 9 }}>{String(i + 1).padStart(2, "0")}</span>
                      <span className="truncate text-[12.5px]" style={{ color: INK }}>
                        {s.tab || `${s.items.length} pieces`}
                      </span>
                    </button>
                    <button type="button" onClick={() => moveSpread(i, -1)} disabled={i === 0} aria-label="Move page earlier" className="cursor-pointer px-1 text-[8px] disabled:opacity-25" style={{ background: "transparent", color: INK_SOFT }}>▲</button>
                    <button type="button" onClick={() => moveSpread(i, 1)} disabled={i === value.spreads.length - 1} aria-label="Move page later" className="cursor-pointer px-1 text-[8px] disabled:opacity-25" style={{ background: "transparent", color: INK_SOFT }}>▼</button>
                    <button type="button" onClick={() => removeSpread(i)} aria-label="Delete page" className="cursor-pointer px-1 text-[11px]" style={{ background: "transparent", color: "#a83c2c" }}>×</button>
                  </div>
                ))}
                {value.spreads.length === 0 && (
                  <p className="m-0 py-2 text-center text-[12px]" style={{ color: INK_SOFT }}>
                    No pages yet.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl p-3" style={{ background: CARD, border: `1px solid ${CARD_EDGE}` }}>
              <span className="mb-2 block" style={label}>Pieces</span>
              <div className="grid grid-cols-3 gap-1.5">
                {CONTENT_KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => addItem(k)}
                    disabled={!spread}
                    title={ITEM_LABELS[k]}
                    className="flex cursor-pointer flex-col items-center gap-1 rounded-md py-2 text-[9px] disabled:opacity-40"
                    style={{ background: "#fffdf6", border: `1px solid ${CARD_EDGE}`, color: INK_SOFT }}
                  >
                    <span className="text-[15px]">{KIND_GLYPH[k]}</span>
                    {ITEM_LABELS[k].split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Decoration doesn't live in a toolbar — you open the drawer. */}
            <CraftDrawer theme={theme} disabled={!spread} onPickUp={pickUpSupply} />
          </div>

          {/* ---------------- middle: the spread ---------------- */}
          <div className="flex flex-col gap-3">
            <div
              ref={canvasRef}
              onPointerMove={onCanvasPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              onClick={() => setSelectedId(null)}
              className="relative w-full overflow-hidden rounded-[3px]"
              style={{
                aspectRatio: "3 / 2",
                background: `linear-gradient(100deg, ${theme.paperEdge}, ${theme.paper} 13%)`,
                boxShadow: "0 24px 50px -22px rgba(20,12,4,.7)",
                touchAction: "none",
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: PAPER_GRAIN, opacity: 0.3, mixBlendMode: "multiply" }}
              />
              {/* the gutter, so you can see where the fold lands */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2"
                style={{ width: 2, background: "rgba(74,50,26,.16)" }}
              />
              {/* snap guides */}
              {guides.v && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 w-px" style={{ background: "#a8663c" }} />}
              {guides.h && <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px" style={{ background: "#a8663c" }} />}

              {items.map((item) => (
                <div
                  key={item.id}
                  onPointerDown={(e) => onItemPointerDown(e, item, "move")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(item.id);
                  }}
                  className="absolute"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    width: `${item.w}%`,
                    zIndex: item.z,
                    transform: `translate(-50%,-50%) rotate(${item.rotate}deg)`,
                    cursor: item.locked ? "not-allowed" : "grab",
                    outline: selectedId === item.id ? "2px solid #a8663c" : "none",
                    outlineOffset: 3,
                  }}
                >
                  <div className="pointer-events-none">
                    <ScrapItemView item={{ ...item, x: 50, y: 50, w: 100, rotate: 0 }} theme={theme} />
                  </div>
                  {selectedId === item.id && !item.locked && (
                    <span
                      onPointerDown={(e) => onItemPointerDown(e, item, "size")}
                      role="slider"
                      aria-label="Resize"
                      aria-valuenow={Math.round(item.w)}
                      tabIndex={0}
                      className="absolute -bottom-2 -right-2 h-4 w-4 cursor-ew-resize rounded-full"
                      style={{ background: "#a8663c", border: "2px solid #fffdf6" }}
                    />
                  )}
                </div>
              ))}

              {items.length === 0 && (
                <p
                  className="absolute inset-0 m-0 flex items-center justify-center text-center text-[14px]"
                  style={{ fontFamily: theme.handFont, color: theme.inkSoft }}
                >
                  {spread ? "Pick a piece from the left and start laying it out." : "Add a page to begin."}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span style={{ ...label, color: "rgba(255,236,203,.7)" }}>
                Page {value.spreads.length ? spreadIndex + 1 : 0} of {value.spreads.length}
              </span>
              <span className="ml-auto text-[11px]" style={{ color: "rgba(255,236,203,.55)" }}>
                Drag to move · arrow keys to nudge · Cmd+Z to undo
              </span>
            </div>
          </div>

          {/* ---------------- right: inspector ---------------- */}
          <div className="flex flex-col gap-3 rounded-xl p-3" style={{ background: CARD, border: `1px solid ${CARD_EDGE}` }}>
            <div className="flex gap-1.5">
              {(["page", "book"] as const).map((tb) => (
                <button
                  key={tb}
                  type="button"
                  onClick={() => setTab(tb)}
                  className="flex-1 cursor-pointer rounded-md px-2 py-1.5 text-[10px] uppercase"
                  style={{
                    ...label,
                    background: tab === tb ? "rgba(168,102,60,.16)" : "transparent",
                    border: `1px solid ${tab === tb ? "rgba(168,102,60,.45)" : CARD_EDGE}`,
                    color: tab === tb ? "#a8663c" : INK_SOFT,
                  }}
                >
                  {tb === "page" ? "This piece" : "The book"}
                </button>
              ))}
            </div>

            {tab === "book" && (
              <div className="flex flex-col gap-3">
                <label className="block">
                  <span className="mb-1 block" style={label}>Style</span>
                  <select
                    value={value.theme}
                    onChange={(e) => patch({ theme: e.target.value as (typeof THEME_IDS)[number] })}
                    className={fieldCls}
                    style={fieldStyle}
                  >
                    {THEME_IDS.map((id) => (
                      <option key={id} value={id}>{PAGE_THEMES[id].label}</option>
                    ))}
                  </select>
                  <span className="mt-1 block text-[10.5px]" style={{ color: INK_SOFT }}>
                    Paper, ink, tape, fonts and the desk all change. Ambience: {PAGE_THEMES[value.theme].ambience}.
                  </span>
                </label>
                {[
                  { k: "title" as const, l: "Cover title" },
                  { k: "subtitle" as const, l: "Cover subtitle" },
                  { k: "nameTag" as const, l: "Name tag" },
                  { k: "openingNote" as const, l: "Note before it opens" },
                  { k: "closingNote" as const, l: "Last page line" },
                  { k: "closingSubnote" as const, l: "Last page follow-up" },
                ].map((f) => (
                  <label key={f.k} className="block">
                    <span className="mb-1 block" style={label}>{f.l}</span>
                    <input type="text" value={value[f.k]} onChange={(e) => patch({ [f.k]: e.target.value })} className={fieldCls} style={fieldStyle} />
                  </label>
                ))}
                <div className="flex gap-2">
                  <Btn onClick={() => pickFile("cover")}>Cover photo</Btn>
                  <Btn onClick={() => pickFile("closing")}>Last photo</Btn>
                </div>
                <label className="block">
                  <span className="mb-1 block" style={label}>Ambient sound URL</span>
                  <input type="text" value={value.ambientUrl} onChange={(e) => patch({ ambientUrl: e.target.value })} placeholder="optional, off by default" className={fieldCls} style={fieldStyle} />
                </label>
              </div>
            )}

            {tab === "page" && (
              <div className="flex flex-col gap-3">
                {spread && (
                  <label className="block">
                    <span className="mb-1 block" style={label}>Page tab</span>
                    <input type="text" value={spread.tab} onChange={(e) => patchSpread({ tab: e.target.value })} placeholder="e.g. summer" className={fieldCls} style={fieldStyle} />
                  </label>
                )}

                {!selected && (
                  <p className="m-0 text-[12.5px]" style={{ color: INK_SOFT }}>
                    Select a piece on the page to change it.
                  </p>
                )}

                {selected && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px]" style={{ color: INK }}>
                        {KIND_GLYPH[selected.kind]} {ITEM_LABELS[selected.kind]}
                      </span>
                      <Btn
                        onClick={() => patchItem(selected.id, { locked: !selected.locked })}
                        tone={selected.locked ? "solid" : "quiet"}
                        title={selected.locked ? "Unlock" : "Lock in place"}
                      >
                        {selected.locked ? "🔒" : "🔓"}
                      </Btn>
                    </div>

                    <label className="block">
                      <span className="mb-1 block" style={label}>Rotation · {Math.round(selected.rotate)}°</span>
                      <input type="range" min={-180} max={180} value={selected.rotate} onChange={(e) => patchItem(selected.id, { rotate: Number(e.target.value) }, true)} onPointerUp={endDrag} className="w-full accent-[#a8663c]" />
                    </label>
                    <label className="block">
                      <span className="mb-1 block" style={label}>Size · {Math.round(selected.w)}%</span>
                      <input type="range" min={3} max={96} value={selected.w} onChange={(e) => patchItem(selected.id, { w: Number(e.target.value) }, true)} onPointerUp={endDrag} className="w-full accent-[#a8663c]" />
                    </label>

                    {["photo", "polaroid", "postcard", "filmstrip"].includes(selected.kind) && (
                      <Btn onClick={() => pickFile("item")}>{selected.imageUrl ? "Replace photo" : "Add photo"}</Btn>
                    )}
                    {["note", "title", "journal", "sticky", "postcard", "pocket", "ticket"].includes(selected.kind) && (
                      <label className="block">
                        <span className="mb-1 block" style={label}>Words</span>
                        <textarea rows={selected.kind === "journal" ? 5 : 2} value={selected.text} onChange={(e) => patchItem(selected.id, { text: e.target.value })} className={`${fieldCls} resize-y`} style={fieldStyle} />
                      </label>
                    )}
                    {["photo", "polaroid", "cassette"].includes(selected.kind) && (
                      <label className="block">
                        <span className="mb-1 block" style={label}>Caption</span>
                        <input type="text" value={selected.caption} onChange={(e) => patchItem(selected.id, { caption: e.target.value })} className={fieldCls} style={fieldStyle} />
                      </label>
                    )}
                    {["ticket", "postcard", "stamp"].includes(selected.kind) && (
                      <label className="block">
                        <span className="mb-1 block" style={label}>Small print</span>
                        <input type="text" value={selected.meta} onChange={(e) => patchItem(selected.id, { meta: e.target.value })} className={fieldCls} style={fieldStyle} />
                      </label>
                    )}
                    {selected.kind === "cassette" && (
                      <label className="block">
                        <span className="mb-1 block" style={label}>Voice note URL</span>
                        <input type="text" value={selected.audioUrl} onChange={(e) => patchItem(selected.id, { audioUrl: e.target.value })} className={fieldCls} style={fieldStyle} />
                      </label>
                    )}
                    {["letter", "pocket"].includes(selected.kind) && (
                      <label className="block">
                        <span className="mb-1 block" style={label}>Hidden inside</span>
                        <textarea rows={3} value={selected.hiddenText} onChange={(e) => patchItem(selected.id, { hiddenText: e.target.value })} className={`${fieldCls} resize-y`} style={fieldStyle} />
                      </label>
                    )}
                    {selected.kind === "doodle" && (
                      <label className="block">
                        <span className="mb-1 block" style={label}>Shape</span>
                        <select value={selected.doodle} onChange={(e) => patchItem(selected.id, { doodle: e.target.value as ScrapItem["doodle"] })} className={fieldCls} style={fieldStyle}>
                          {DOODLE_SHAPES.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </label>
                    )}
                    <label className="block">
                      <span className="mb-1 block" style={label}>Colour override</span>
                      <input type="text" value={selected.color} onChange={(e) => patchItem(selected.id, { color: e.target.value })} placeholder="leave empty to follow the style" className={fieldCls} style={fieldStyle} />
                    </label>

                    <div className="flex flex-wrap gap-1.5">
                      <Btn onClick={() => layer(selected.id, 1)} title="Bring forward">↑ Forward</Btn>
                      <Btn onClick={() => layer(selected.id, -1)} title="Send backward">↓ Back</Btn>
                      <Btn onClick={() => duplicateItem(selected.id)}>Duplicate</Btn>
                      <Btn onClick={() => removeItem(selected.id)} tone="danger">Delete</Btn>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {spawn && <DragGhost glyph={spawn.glyph} x={spawn.x} y={spawn.y} />}
    </div>
  );
}
