/**
 * Memory Puzzle — the board's rules, with no React in them.
 *
 * Kept separate from the rendering because the interesting decisions here are
 * geometric (where does a piece belong, is this close enough, which pieces are
 * now neighbours) and are far easier to reason about — and to get right — as
 * plain functions over plain data.
 *
 * Everything is deterministic. The scatter, the rotations and the tab directions
 * all come from a seeded hash of the piece index, because a puzzle whose pieces
 * moved between the server render and the client render would be unusable.
 */

import type { Cut, Difficulty } from "./theme";

export interface Piece {
  /** Index in reading order, which is also its home. */
  id: number;
  row: number;
  col: number;
  /** Where it is now, as a fraction of the tray: 0..1 within, negative or >1 outside. */
  x: number;
  y: number;
  /** Degrees. Only ever a multiple of 90, and only on Master. */
  rotation: number;
  placed: boolean;
  /** Pieces that have been snapped together move as one. -1 means unattached. */
  group: number;
}

export interface BoardShape {
  size: number;
  total: number;
  /** Fraction of the tray one piece occupies. */
  step: number;
}

export function boardShape(size: number): BoardShape {
  return { size, total: size * size, step: 1 / size };
}

/** Deterministic 0..1 from any key. */
export function seeded(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/** Where a piece belongs, as a fraction of the tray. */
export function homeOf(piece: { row: number; col: number }, shape: BoardShape) {
  return { x: piece.col * shape.step, y: piece.row * shape.step };
}

/**
 * How wide the board should be as a fraction of the table it sits on.
 *
 * The pile has to lie *beside* the board, on the table, and a piece is a
 * meaningful fraction of the board when the grid is small — a 3 × 3 piece is a
 * third of it. So the board shrinks just enough that the widest piece still fits
 * in the margin beside it, and grows as the pieces get smaller. Hard-coding one
 * number is what made the board come out the size of a postage stamp.
 */
export function boardFraction(pieceBox: number): number {
  /* The margin has to hold a piece, the gap that keeps it clear of the board, and
     the jitter that stops the pile looking machine-stacked. */
  const need = pieceBox + PILE_GAP + PILE_JITTER;
  return Math.max(0.34, Math.min(0.72, 1 / (1 + 2 * need)));
}

/** How far clear of the board the pile sits. */
const PILE_GAP = 0.02;
/** How much a piece may wander from its place in the pile, either way. */
const PILE_JITTER = 0.015;

/**
 * Table above and below the board, in board units, given a board fraction.
 * Mirrors the table's aspect ratio in `Board.tsx` — the two have to agree or
 * pieces get dealt over the edge.
 */
export function tableSlack(boardPct: number): number {
  return 0.08 / boardPct;
}

/**
 * The starting layout: pieces lying on the table either side of the board, in two
 * loose columns. Coordinates are fractions of the *board*, so negative and
 * greater-than-one values put a piece out on the table.
 *
 * `pieceBox` is how much of the board one piece covers including any tab
 * overhang; the pile is placed and its depth limited from that, so nothing is
 * ever dealt off the edge of the table however big the pieces are.
 */
export function scatterPieces(size: number, seed: string, rotate: boolean, pieceBox = 1 / size): Piece[] {
  const shape = boardShape(size);
  const pieces: Piece[] = [];

  /* Just clear of the board on each side. */
  const leftAt = -(pieceBox + PILE_GAP);
  const rightAt = 1 + PILE_GAP;
  /* Deal down only as far as the table reaches. Pieces may overlap each other —
     that is what a pile does — but none of them may leave the table. */
  const slack = tableSlack(boardFraction(pieceBox));
  const top = -slack + PILE_JITTER;
  const bottom = Math.max(top, 1 + slack - pieceBox - PILE_JITTER);
  const perSide = Math.max(1, Math.ceil(shape.total / 2));

  for (let i = 0; i < shape.total; i += 1) {
    const row = Math.floor(i / size);
    const col = i % size;
    const side = i % 2 === 0 ? -1 : 1;
    const depth = perSide === 1 ? 0 : Math.floor(i / 2) / (perSide - 1 || 1);
    const jitterX = (seeded(`${seed}x${i}`) - 0.5) * 2 * PILE_JITTER;
    const jitterY = (seeded(`${seed}y${i}`) - 0.5) * 2 * PILE_JITTER;

    pieces.push({
      id: i,
      row,
      col,
      x: (side < 0 ? leftAt : rightAt) + jitterX,
      y: top + depth * (bottom - top) + jitterY,
      rotation: rotate ? Math.floor(seeded(`${seed}r${i}`) * 4) * 90 : 0,
      placed: false,
      group: -1,
    });
  }
  return pieces;
}

/**
 * Is this piece close enough to home to snap?
 *
 * Snapping is deliberately forgiving — the brief said incorrect placement must
 * never be frustrating, so the tolerance scales with difficulty and a near miss
 * simply doesn't take rather than being punished.
 */
export function snapsHome(piece: Piece, shape: BoardShape, difficulty: Difficulty): boolean {
  if (difficulty.rotate && piece.rotation % 360 !== 0) return false;
  const home = homeOf(piece, shape);
  const tolerance = shape.step * difficulty.snap;
  return Math.abs(piece.x - home.x) <= tolerance && Math.abs(piece.y - home.y) <= tolerance;
}

/** Place a piece exactly, and pull in any already-placed neighbours as a group. */
export function placePiece(pieces: Piece[], id: number, shape: BoardShape): Piece[] {
  const piece = pieces.find((p) => p.id === id);
  if (!piece) return pieces;
  const home = homeOf(piece, shape);

  /* Every placed piece belongs to group 0 — the assembled picture. Grouping
     matters for the *feel* (placed pieces are inert and lit) rather than for
     dragging clusters around, which would fight the "one photograph" illusion. */
  return pieces.map((p) =>
    p.id === id ? { ...p, x: home.x, y: home.y, rotation: 0, placed: true, group: 0 } : p
  );
}

/** Neighbours of a piece, for the "grouping" polish: a placed piece lights its edges. */
export function neighboursOf(piece: Piece, size: number): number[] {
  const out: number[] = [];
  if (piece.row > 0) out.push((piece.row - 1) * size + piece.col);
  if (piece.row < size - 1) out.push((piece.row + 1) * size + piece.col);
  if (piece.col > 0) out.push(piece.row * size + piece.col - 1);
  if (piece.col < size - 1) out.push(piece.row * size + piece.col + 1);
  return out;
}

/**
 * Which piece to hint at. Prefers one that touches something already placed,
 * because that's the piece a person is actually looking for — and failing that,
 * a corner, which is where everyone starts.
 */
export function hintTarget(pieces: Piece[], size: number): Piece | null {
  const loose = pieces.filter((p) => !p.placed);
  if (loose.length === 0) return null;

  const placedIds = new Set(pieces.filter((p) => p.placed).map((p) => p.id));
  if (placedIds.size > 0) {
    const adjacent = loose.find((p) => neighboursOf(p, size).some((n) => placedIds.has(n)));
    if (adjacent) return adjacent;
  }

  const corners = [0, size - 1, size * (size - 1), size * size - 1];
  const corner = loose.find((p) => corners.includes(p.id));
  return corner ?? loose[0];
}

/* ------------------------------------------------------------------ */
/* Sliding puzzles are a different game                               */
/* ------------------------------------------------------------------ */

/**
 * A sliding puzzle has one empty cell and pieces move into it. The shuffle walks
 * the empty cell around with legal moves only, which guarantees the result is
 * solvable — shuffling by permutation does not, and an unsolvable puzzle would be
 * a cruel thing to send someone.
 */
export function shuffleSliding(size: number, seed: string, moves = 120): Piece[] {
  const shape = boardShape(size);
  const grid: number[] = Array.from({ length: shape.total }, (_, i) => i);
  /* The last cell is the gap. */
  let gap = shape.total - 1;

  for (let m = 0; m < moves; m += 1) {
    const gr = Math.floor(gap / size);
    const gc = gap % size;
    const options: number[] = [];
    if (gr > 0) options.push(gap - size);
    if (gr < size - 1) options.push(gap + size);
    if (gc > 0) options.push(gap - 1);
    if (gc < size - 1) options.push(gap + 1);
    const pick = options[Math.floor(seeded(`${seed}m${m}`) * options.length) % options.length];
    grid[gap] = grid[pick];
    grid[pick] = shape.total - 1;
    gap = pick;
  }

  return grid.map((pieceId, cell) => {
    const row = Math.floor(pieceId / size);
    const col = pieceId % size;
    return {
      id: pieceId,
      row,
      col,
      x: (cell % size) * shape.step,
      y: Math.floor(cell / size) * shape.step,
      rotation: 0,
      /* The gap piece is never rendered; everything else is "on the board" from
         the start, and `placed` here means "in its correct cell". */
      placed: pieceId === cell,
      group: pieceId === shape.total - 1 ? -2 : 0,
    };
  });
}

/** In a sliding puzzle, can this piece move right now? */
export function canSlide(pieces: Piece[], id: number, size: number): boolean {
  const shape = boardShape(size);
  const gapPiece = pieces.find((p) => p.group === -2);
  const piece = pieces.find((p) => p.id === id);
  if (!gapPiece || !piece) return false;
  const dx = Math.abs(Math.round((piece.x - gapPiece.x) / shape.step));
  const dy = Math.abs(Math.round((piece.y - gapPiece.y) / shape.step));
  return dx + dy === 1;
}

/** Swap a piece with the gap. */
export function slide(pieces: Piece[], id: number, size: number): Piece[] {
  if (!canSlide(pieces, id, size)) return pieces;
  const shape = boardShape(size);
  const gapPiece = pieces.find((p) => p.group === -2);
  const piece = pieces.find((p) => p.id === id);
  if (!gapPiece || !piece) return pieces;

  return pieces.map((p) => {
    if (p.id === piece.id) {
      const home = homeOf(p, shape);
      const at = { x: gapPiece.x, y: gapPiece.y };
      return { ...p, ...at, placed: Math.abs(at.x - home.x) < 0.001 && Math.abs(at.y - home.y) < 0.001 };
    }
    if (p.id === gapPiece.id) return { ...p, x: piece.x, y: piece.y };
    return p;
  });
}

/* ------------------------------------------------------------------ */
/* The cut                                                            */
/* ------------------------------------------------------------------ */

/**
 * A jigsaw piece's outline as an SVG path, in a 100×100 box.
 *
 * Tabs alternate deterministically from the piece's position, so adjacent pieces
 * always agree: if my right edge has a tab, my neighbour's left edge has the
 * matching blank. That agreement is the whole reason it reads as a real cut.
 */
export function jigsawPath(row: number, col: number, size: number, cut: Cut): string {
  if (!cut.tabs) {
    return "M0,0 H100 V100 H0 Z";
  }

  /* +1 = tab pushes outward, -1 = blank pushes inward, 0 = straight (border). */
  const edge = (r: number, c: number, side: "t" | "r" | "b" | "l"): number => {
    if (side === "t" && r === 0) return 0;
    if (side === "b" && r === size - 1) return 0;
    if (side === "l" && c === 0) return 0;
    if (side === "r" && c === size - 1) return 0;
    /* Horizontal edges keyed by the cell above; vertical by the cell to the left,
       so both pieces sharing an edge compute the same key. */
    const key =
      side === "t" ? `h${r - 1}-${c}` : side === "b" ? `h${r}-${c}` : side === "l" ? `v${r}-${c - 1}` : `v${r}-${c}`;
    const outward = seeded(key) > 0.5 ? 1 : -1;
    /* The two pieces either side must disagree in direction to interlock. */
    return side === "t" || side === "l" ? -outward : outward;
  };

  const t = edge(row, col, "t");
  const r = edge(row, col, "r");
  const b = edge(row, col, "b");
  const l = edge(row, col, "l");

  /* Walk the outline clockwise from the top-left corner. A tab is three cubic
     curves bulging 17 units past the edge; a blank is the same curve inverted. */
  const TAB = 17;
  return [
    "M0,0",
    t === 0 ? "H100" : `L38,0 C30,${-t * TAB} 70,${-t * TAB} 62,0 L100,0`,
    r === 0 ? "V100" : `L100,38 C${100 + r * TAB},30 ${100 + r * TAB},70 100,62 L100,100`,
    b === 0 ? "H0" : `L62,100 C70,${100 + b * TAB} 30,${100 + b * TAB} 38,100 L0,100`,
    l === 0 ? "V0" : `L0,62 C${-l * TAB},70 ${-l * TAB},30 0,38 L0,0`,
    "Z",
  ].join(" ");
}

/**
 * The clip-path for a piece, as a percentage polygon — used for the cuts that
 * don't interlock (mosaic, tile, polaroid, fragment).
 */
export function fragmentClip(id: number, seed: string): string {
  const j = (k: string, spread: number) => (seeded(`${seed}${k}${id}`) - 0.5) * spread;
  return `polygon(${j("a", 8)}% ${j("b", 8)}%, ${100 + j("c", 8)}% ${j("d", 8)}%, ${100 + j("e", 8)}% ${100 + j("f", 8)}%, ${j("g", 8)}% ${100 + j("h", 8)}%)`;
}

/** Radial cuts: each piece is a wedge of a ring. */
export function wedgeClip(row: number, col: number, size: number): string {
  const rings = size;
  const perRing = size;
  const inner = (row / rings) * 50;
  const outer = ((row + 1) / rings) * 50;
  const from = (col / perRing) * 360;
  const to = ((col + 1) / perRing) * 360;

  const pt = (radius: number, deg: number) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return `${(50 + radius * Math.cos(rad)).toFixed(2)}% ${(50 + radius * Math.sin(rad)).toFixed(2)}%`;
  };

  const steps = 6;
  const outerArc = Array.from({ length: steps + 1 }, (_, i) => pt(outer, from + ((to - from) * i) / steps));
  const innerArc = Array.from({ length: steps + 1 }, (_, i) => pt(inner, to - ((to - from) * i) / steps));
  return `polygon(${[...outerArc, ...innerArc].join(", ")})`;
}

/**
 * Keep a piece on the table.
 *
 * The table clips at its edge, so a piece dropped past it would be invisible and
 * unreachable — a lost piece, which in a puzzle is fatal. Dropping is otherwise
 * free-form (a near miss simply stays where it landed), so this is the one
 * constraint applied on release.
 */
export function clampToTable(x: number, y: number, pieceBox: number): { x: number; y: number } {
  const b = boardFraction(pieceBox);
  const margin = (1 - b) / (2 * b);
  const slack = tableSlack(b);
  return {
    x: Math.max(-margin, Math.min(1 + margin - pieceBox, x)),
    y: Math.max(-slack, Math.min(1 + slack - pieceBox, y)),
  };
}
