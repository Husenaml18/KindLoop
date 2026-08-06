"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  boardFraction,
  boardShape,
  canSlide,
  clampToTable,
  fragmentClip,
  hintTarget,
  homeOf,
  jigsawPath,
  placePiece,
  scatterPieces,
  shuffleSliding,
  slide,
  snapsHome,
  wedgeClip,
  type Piece,
} from "./board";
import { clarityAt, percentDone, progressNote, type MemoryPuzzleContent, type Secret } from "./schema";
import { CUTS, DIFFICULTIES, MATERIALS, MONO_FONT, SURFACES, type Surface } from "./theme";

/* ------------------------------------------------------------------ */
/* One piece                                                           */
/* ------------------------------------------------------------------ */

/**
 * A piece shows its slice of the photograph by scaling the whole image up by the
 * grid size and offsetting it — so every piece is a window onto one shared
 * picture rather than a separately cropped image. That's what makes the seams
 * disappear when the last one goes in.
 */
function pieceBackground(imageUrl: string, piece: Piece, size: number) {
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: `${size * 100}% ${size * 100}%`,
    backgroundPosition: `${(piece.col / Math.max(1, size - 1)) * 100}% ${(piece.row / Math.max(1, size - 1)) * 100}%`,
  };
}

function PieceView({
  piece,
  content,
  surface,
  held,
  hinted,
  hasSecret,
  warmth,
  onPointerDown,
  onActivate,
  onRotate,
  selected,
  interactive,
}: {
  piece: Piece;
  content: MemoryPuzzleContent;
  surface: Surface;
  held: boolean;
  hinted: boolean;
  hasSecret: boolean;
  /** 0..1 — how much colour a placed piece currently has. */
  warmth: number;
  onPointerDown?: (e: React.PointerEvent) => void;
  onActivate?: () => void;
  onRotate?: () => void;
  selected: boolean;
  interactive: boolean;
}) {
  const reduced = useReducedMotion();
  const cut = CUTS[content.cut];
  const material = MATERIALS[content.material];
  const size = content.size;
  const shape = boardShape(size);
  const pct = shape.step * 100;

  /* Interlocking cuts need an SVG clip so the tabs actually overhang the cell;
     the flat cuts can use a cheap clip-path. */
  const clipId = `mp-${content.cut}-${size}-${piece.id}`;
  const usesSvgClip = cut.tabs;
  const clipPath = usesSvgClip
    ? `url(#${clipId})`
    : cut.radial
      ? wedgeClip(piece.row, piece.col, size)
      : content.cut === "fragment"
        ? fragmentClip(piece.id, content.imageUrl || "seed")
        : undefined;

  /* Tabs overhang, so the drawn box is larger than the cell it occupies. */
  const overhang = cut.tabs ? 0.17 : 0;
  const boxPct = pct * (1 + overhang * 2);

  const isPolaroid = content.cut === "polaroid";

  return (
    <motion.div
      className={`absolute ${interactive ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
      style={{
        left: `${piece.x * 100}%`,
        top: `${piece.y * 100}%`,
        width: `${boxPct}%`,
        height: `${boxPct}%`,
        marginLeft: `${-overhang * pct}%`,
        marginTop: `${-overhang * pct}%`,
        zIndex: held ? 40 : piece.placed ? 1 : 10 + (piece.id % 8),
        padding: cut.grout / 2,
      }}
      animate={{
        x: 0,
        y: 0,
        rotate: piece.rotation,
        scale: held ? 1.06 : 1,
        filter: hinted && !reduced ? `drop-shadow(0 0 12px ${surface.accent})` : "none",
      }}
      transition={{
        type: reduced ? "tween" : "spring",
        stiffness: 420,
        damping: 32,
        mass: 0.7,
        duration: reduced ? 0.2 : undefined,
      }}
      onPointerDown={onPointerDown}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : -1}
      aria-label={
        piece.placed
          ? `Piece ${piece.id + 1}, in place${hasSecret ? " — something is hidden here" : ""}`
          : `Piece ${piece.id + 1} of ${shape.total}${selected ? ", selected" : ""}`
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate?.();
        }
        if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          onRotate?.();
        }
      }}
    >
      <div className="relative h-full w-full" style={{ padding: isPolaroid ? "7% 7% 16%" : 0, background: isPolaroid ? "#fdf8ec" : undefined, borderRadius: isPolaroid ? 2 : material.radius }}>
        {usesSvgClip && (
          <svg width="0" height="0" className="absolute" aria-hidden>
            <defs>
              <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                {/* The 100-unit path is normalised into the 1+2×overhang box. */}
                <path
                  d={jigsawPath(piece.row, piece.col, size, cut)}
                  transform={`translate(${overhang / (1 + overhang * 2)},${overhang / (1 + overhang * 2)}) scale(${1 / (100 * (1 + overhang * 2))})`}
                />
              </clipPath>
            </defs>
          </svg>
        )}

        <div
          className="relative h-full w-full"
          style={{
            clipPath,
            borderRadius: usesSvgClip || cut.radial ? 0 : material.radius,
            boxShadow: piece.placed ? "none" : held ? material.shadow : `0 ${4 * material.heft}px ${10 * material.heft}px -${5 * material.heft}px rgba(24,16,8,.5)`,
          }}
        >
          {content.imageUrl ? (
            /* Story mode's "the photograph becomes clearer": a piece that's home
               starts muted and comes into full colour as the rest arrives. Loose
               pieces are always sharp — they're what you reason about. */
            <div
              className="absolute inset-0"
              style={{
                ...pieceBackground(content.imageUrl, piece, size),
                filter: piece.placed ? `saturate(${warmth.toFixed(2)}) brightness(${(0.76 + warmth * 0.24).toFixed(2)})` : "none",
                transition: "filter 900ms ease-out",
              }}
            />
          ) : (
            <div className="absolute inset-0" style={{ background: surface.accentSoft }} />
          )}
          {/* what the piece is cut from */}
          <span aria-hidden className="absolute inset-0" style={{ background: material.overlay, boxShadow: material.bevel }} />
          {/* a placed piece settles: its edges catch the light rather than casting */}
          {piece.placed && (
            <span
              aria-hidden
              className="absolute inset-0"
              style={{ boxShadow: `inset 0 0 0 0.5px ${surface.accentSoft}` }}
            />
          )}
          {hasSecret && piece.placed && (
            <motion.span
              aria-hidden
              className="absolute rounded-full"
              style={{ right: "12%", bottom: "12%", width: 5, height: 5, background: surface.accent }}
              animate={reduced ? { opacity: 0.6 } : { opacity: [0.25, 0.95, 0.25], scale: [1, 1.5, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}
        </div>

        {isPolaroid && (
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-[3%] text-center"
            style={{ fontFamily: MONO_FONT, fontSize: 7, letterSpacing: ".1em", color: "#8a7a62" }}
          >
            {String(piece.id + 1).padStart(2, "0")}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* The board                                                           */
/* ------------------------------------------------------------------ */

export interface BoardHandle {
  percent: number;
  placed: number;
  total: number;
}

export function PuzzleBoard({
  content,
  onProgress,
  onSecret,
  onSolved,
  storageKey,
}: {
  content: MemoryPuzzleContent;
  onProgress: (state: BoardHandle) => void;
  onSecret: (secret: Secret) => void;
  onSolved: () => void;
  /** Where to remember progress, so nobody loses a half-built puzzle. */
  storageKey?: string;
}) {
  const surface = SURFACES[content.surface] ?? SURFACES.woodDesk;
  const cut = CUTS[content.cut];
  const difficulty = DIFFICULTIES[content.difficulty];
  const shape = useMemo(() => boardShape(content.size), [content.size]);
  const seed = content.imageUrl || "kindloop";

  /* The starting layout is computed, not random, so it is identical on the server
     and in the browser. Sliding puzzles get a legal shuffle instead of a scatter. */
  const initial = useMemo(
    () =>
      cut.slide
        ? shuffleSliding(content.size, seed)
        : scatterPieces(content.size, seed, difficulty.rotate, (1 / content.size) * (1 + (cut.tabs ? 0.34 : 0))),
    [cut.slide, cut.tabs, content.size, seed, difficulty.rotate]
  );

  const [pieces, setPieces] = useState<Piece[]>(initial);
  const [history, setHistory] = useState<Piece[][]>([]);
  const [held, setHeld] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hinted, setHinted] = useState<number | null>(null);
  const [hintsLeft, setHintsLeft] = useState(difficulty.hints);
  const [zoom, setZoom] = useState(1);
  const [restored, setRestored] = useState(false);

  const trayRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; dx: number; dy: number } | null>(null);

  /* Reset when the puzzle itself changes — a new picture or size is a new puzzle. */
  const shapeKey = `${content.size}-${content.cut}-${seed}`;
  const prevShapeKey = useRef(shapeKey);
  useEffect(() => {
    if (prevShapeKey.current === shapeKey) return;
    prevShapeKey.current = shapeKey;
    const id = setTimeout(() => {
      setPieces(initial);
      setHistory([]);
      setHintsLeft(difficulty.hints);
    }, 0);
    return () => clearTimeout(id);
  }, [shapeKey, initial, difficulty.hints]);

  /* Autosave. Restored once, on mount, and only if it matches this puzzle. */
  useEffect(() => {
    if (!storageKey || restored) return;
    const id = setTimeout(() => {
      setRestored(true);
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return;
        const saved = JSON.parse(raw) as { key: string; pieces: Piece[] };
        if (saved.key !== shapeKey || !Array.isArray(saved.pieces) || saved.pieces.length !== shape.total) return;
        setPieces(saved.pieces);
      } catch {
        /* A corrupt save is not worth telling anyone about — just start fresh. */
      }
    }, 0);
    return () => clearTimeout(id);
  }, [storageKey, restored, shapeKey, shape.total]);

  useEffect(() => {
    if (!storageKey || !restored) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ key: shapeKey, pieces }));
    } catch {
      /* Private browsing, quota — losing autosave is survivable. */
    }
  }, [storageKey, restored, shapeKey, pieces]);

  /* ---------- how big the board is on the table ---------- */

  /* A piece covers this much of the board, tab overhang included. The board is
     then sized so the widest piece still fits in the margin beside it. */
  const pieceBox = shape.step * (1 + (cut.tabs ? 0.34 : 0));
  /* A sliding puzzle has no pile — nothing lies beside it, so it can fill the table. */
  const boardPct = cut.slide ? 0.86 : boardFraction(pieceBox);
  /* Tall enough for the board plus `tableSlack()` of table above and below it.
     The 0.16 here is that helper's 0.08 doubled — the scatter relies on the two
     agreeing, so changing one without the other deals pieces off the edge. */
  const tableRatio = cut.slide ? 1 : boardPct + 0.16;

  const placed = pieces.filter((p) => p.placed && p.group !== -2).length;
  const total = cut.slide ? shape.total - 1 : shape.total;
  const percent = percentDone(placed, total);

  /* Report upward after commit, never during render.
     The callbacks live in refs and are deliberately *not* dependencies: the
     parent recreates them on every render, so depending on them would re-run this
     effect, which sets parent state, which re-renders the parent — a loop with no
     exit. The numbers are the only thing worth reacting to. */
  const solvedRef = useRef(false);
  const cbRef = useRef({ onProgress, onSolved });
  useEffect(() => {
    cbRef.current = { onProgress, onSolved };
  }, [onProgress, onSolved]);
  useEffect(() => {
    cbRef.current.onProgress({ percent, placed, total });
    if (placed >= total && !solvedRef.current) {
      solvedRef.current = true;
      cbRef.current.onSolved();
    }
  }, [percent, placed, total]);

  const secretFor = useCallback(
    (id: number) => content.secrets.find((s) => s.piece === id),
    [content.secrets]
  );

  const push = (next: Piece[]) => {
    setHistory((h) => [...h.slice(-24), pieces]);
    setPieces(next);
  };

  /** Back to a heap of loose pieces, and forget the save. */
  const tipItOut = () => {
    setHistory((h) => [...h.slice(-24), pieces]);
    setPieces(initial);
    setHintsLeft(difficulty.hints);
    solvedRef.current = false;
    if (storageKey) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        /* Nothing to do — the board is reset either way. */
      }
    }
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      setPieces(h[h.length - 1]);
      return h.slice(0, -1);
    });
  };

  /* ---------- dragging ---------- */

  const fractionFromEvent = (e: PointerEvent | React.PointerEvent) => {
    const rect = trayRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  };

  const beginDrag = (piece: Piece) => (e: React.PointerEvent) => {
    if (piece.placed) {
      /* Already home — a click is for the secret, if there is one. */
      const s = secretFor(piece.id);
      if (s) onSecret(s);
      return;
    }
    if (cut.slide) {
      if (canSlide(pieces, piece.id, content.size)) push(slide(pieces, piece.id, content.size));
      return;
    }
    const at = fractionFromEvent(e);
    if (!at) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { id: piece.id, dx: at.x - piece.x, dy: at.y - piece.y };
    setHeld(piece.id);
    setSelected(piece.id);
    setHinted(null);
  };

  useEffect(() => {
    if (held === null) return;

    const move = (e: PointerEvent) => {
      const at = fractionFromEvent(e);
      const drag = dragRef.current;
      if (!at || !drag) return;
      setPieces((ps) => ps.map((p) => (p.id === drag.id ? { ...p, x: at.x - drag.dx, y: at.y - drag.dy } : p)));
    };

    const up = () => {
      const drag = dragRef.current;
      dragRef.current = null;
      setHeld(null);
      if (!drag) return;
      setPieces((ps) => {
        const piece = ps.find((p) => p.id === drag.id);
        if (!piece) return ps;
        if (snapsHome(piece, shape, difficulty)) {
          setHistory((h) => [...h.slice(-24), ps]);
          return placePiece(ps, piece.id, shape);
        }
        /* A miss stays where it was dropped — nothing bounces back and nothing
           scolds, which the brief was explicit about. It is only pulled back onto
           the table, so a piece can never be lost over the edge. */
        const on = clampToTable(piece.x, piece.y, pieceBox);
        if (on.x === piece.x && on.y === piece.y) return ps;
        return ps.map((p) => (p.id === piece.id ? { ...p, ...on } : p));
      });
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [held, shape, difficulty, pieceBox]);

  /* ---------- keyboard ---------- */

  /**
   * Keyboard play, which is the accessible route through the whole experience:
   * Tab to a piece, Enter to send it home, R to turn it. Nudging a piece pixel by
   * pixel with arrow keys would be a cruel way to solve a 10×10, so Enter simply
   * places the selected piece — the puzzle is the journey, not the obstacle.
   */
  const placeSelected = (id: number) => {
    const piece = pieces.find((p) => p.id === id);
    if (!piece || piece.placed) return;
    if (cut.slide) {
      if (canSlide(pieces, id, content.size)) push(slide(pieces, id, content.size));
      return;
    }
    push(placePiece(pieces, id, shape));
  };

  const rotateSelected = (id: number) => {
    if (!difficulty.rotate) return;
    push(pieces.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p)));
  };

  /* ---------- hints ---------- */

  const useHint = () => {
    if (hintsLeft === 0) return;
    const target = hintTarget(pieces, content.size);
    if (!target) return;
    setHinted(target.id);
    if (hintsLeft > 0) setHintsLeft((n) => n - 1);
  };

  useEffect(() => {
    if (hinted === null) return;
    const id = setTimeout(() => setHinted(null), 2600);
    return () => clearTimeout(id);
  }, [hinted]);

  /* ---------- how far into colour the assembled part has come ---------- */

  const clarity = clarityAt(percent);
  /**
   * How much colour a placed piece has, 0..1: it starts at `1 - settle` and
   * reaches 1 when the picture is finished. Harder settings hold more back, so
   * the last piece landing is a bigger moment.
   */
  const warmth = 1 - difficulty.settle + difficulty.settle * clarity;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/*
        The table, and the board on it.

        These are two separate things on purpose. The table is the whole surface;
        the board is the square you assemble in, centred on it, with the loose
        pieces lying on the table either side. Piece coordinates are fractions of
        the *board*, so a piece at x = -0.4 is out on the table to the left.
      */}
      <motion.div
        className="relative w-full overflow-hidden"
        style={{
          maxWidth: "min(1000px, 100%)",
          aspectRatio: `1 / ${tableRatio}`,
          background: surface.tray,
          border: `1px solid ${surface.trayEdge}`,
          borderRadius: 5,
          boxShadow: `inset 0 8px 26px rgba(0,0,0,.34), 0 34px 60px -30px rgba(0,0,0,.6)`,
          transformOrigin: "50% 50%",
        }}
        animate={{ scale: zoom }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div
          ref={trayRef}
          className="absolute"
          style={{
            width: `${boardPct * 100}%`,
            aspectRatio: "1",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            /* The board is a recess in the table, so it reads as somewhere to
               put things rather than as another rectangle. */
            boxShadow: `inset 0 0 0 1px ${surface.trayEdge}, inset 0 4px 14px rgba(0,0,0,.34)`,
            borderRadius: 3,
          }}
        >
          {/*
            Nothing of the picture is drawn here. There used to be a faint copy of
            it under the board as a guide, the way a jigsaw box lid sits on the
            table — but the whole premise is that this photograph is hidden until
            it's earned, and showing it emptied the experience. The board is an
            empty recess; the only trace of the picture anywhere on screen is on
            the pieces themselves.
          */}

          {/* light gathering in the recess as it fills — warmth, not information */}
          {percent > 0 && (
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 74% 62% at 50% 54%, ${surface.glow}, transparent 72%)`,
                opacity: clarity * 0.5,
                borderRadius: 3,
                transition: "opacity 700ms ease-out",
              }}
            />
          )}

          {/* faint cell rules, so there is somewhere to aim */}
          {!cut.radial && !cut.slide && (
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to right, ${surface.trayEdge} 1px, transparent 1px), linear-gradient(to bottom, ${surface.trayEdge} 1px, transparent 1px)`,
                backgroundSize: `${shape.step * 100}% ${shape.step * 100}%`,
                opacity: 0.3,
                borderRadius: 3,
              }}
            />
          )}

          {pieces
            .filter((p) => p.group !== -2)
            .map((piece) => (
              <PieceView
                key={piece.id}
                piece={piece}
                content={content}
                surface={surface}
                held={held === piece.id}
                hinted={hinted === piece.id}
                hasSecret={Boolean(secretFor(piece.id))}
                warmth={warmth}
                selected={selected === piece.id}
                interactive
                onPointerDown={beginDrag(piece)}
                onActivate={() => placeSelected(piece.id)}
                onRotate={() => rotateSelected(piece.id)}
              />
            ))}

          {/* where the hint says to look */}
          <AnimatePresence>
            {hinted !== null && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  left: `${homeOf(pieces.find((p) => p.id === hinted) ?? { row: 0, col: 0 }, shape).x * 100}%`,
                  top: `${homeOf(pieces.find((p) => p.id === hinted) ?? { row: 0, col: 0 }, shape).y * 100}%`,
                  width: `${shape.step * 100}%`,
                  height: `${shape.step * 100}%`,
                  border: `2px dashed ${surface.accent}`,
                  borderRadius: 2,
                  zIndex: 30,
                }}
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ---------- the tools, kept quiet ---------- */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {difficulty.hints !== 0 && (
          <button
            type="button"
            onClick={useHint}
            disabled={hintsLeft === 0}
            className="cursor-pointer rounded-full border bg-transparent px-3.5 py-2 disabled:cursor-default disabled:opacity-35"
            style={{ borderColor: surface.accentSoft, color: surface.inkSoft, fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase" }}
          >
            {hintsLeft < 0 ? "hint" : `hint · ${hintsLeft}`}
          </button>
        )}
        <button
          type="button"
          onClick={undo}
          disabled={history.length === 0}
          className="cursor-pointer rounded-full border bg-transparent px-3.5 py-2 disabled:cursor-default disabled:opacity-35"
          style={{ borderColor: surface.accentSoft, color: surface.inkSoft, fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase" }}
        >
          ↶ undo
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => (z > 1.2 ? 1 : 1.35))}
          className="cursor-pointer rounded-full border bg-transparent px-3.5 py-2"
          style={{ borderColor: surface.accentSoft, color: surface.inkSoft, fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase" }}
        >
          {zoom > 1.2 ? "− out" : "+ in"}
        </button>
        {/* Without this, a puzzle you've finished can never be done again — which
            for something you'd want to show someone else is a dead end. */}
        {placed > 0 && (
          <button
            type="button"
            onClick={tipItOut}
            className="cursor-pointer rounded-full border bg-transparent px-3.5 py-2"
            style={{ borderColor: surface.accentSoft, color: surface.inkSoft, fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase" }}
          >
            ↻ tip it out
          </button>
        )}
      </div>

      <p
        className="m-0 text-center"
        style={{ fontFamily: MONO_FONT, fontSize: 9.5, letterSpacing: ".2em", textTransform: "uppercase", color: surface.inkSoft }}
        role="status"
        aria-live="polite"
      >
        {progressNote(placed, total)}
      </p>

      {/* the keyboard route, stated rather than hidden */}
      <p className="sr-only">
        Use Tab to move between pieces, Enter to put the selected piece in place
        {difficulty.rotate ? ", and R to turn it" : ""}. {placed} of {total} placed.
      </p>
    </div>
  );
}
