/**
 * Minimax and alpha beta math for the three by three game tree demo.
 *
 * The maximizer picks among three children, each a minimizer over three leaves.
 * The same grid feeds both the full minimax value and the pruned leaf set.
 */
export type Grid = number[][];

export const EXAMPLE: Grid = [
  [3, 7, 2],
  [6, 1, 9],
  [4, 8, 5],
];

export function minNodes(grid: Grid): number[] {
  return grid.map((child) => Math.min(...child));
}

// Minimax for two plies: the root takes the best (max) of each child's worst (min).
export function rootValue(grid: Grid): number {
  return Math.max(...minNodes(grid));
}

// Alpha beta over the same tree. alpha is the best score the maximizer can already
// guarantee. Once a child's running min drops to or below it, that child can never
// beat alpha, so every remaining leaf in it is pruned.
export function prunedLeaves(grid: Grid): Set<string> {
  const pruned = new Set<string>();
  let alpha = -Infinity;
  grid.forEach((child, i) => {
    let val = Infinity;
    let cut = false;
    child.forEach((leaf, j) => {
      // Once cut, the rest of this child is never read, so mark it pruned.
      if (cut) { pruned.add(`${i},${j}`); return; }
      val = Math.min(val, leaf);
      if (val <= alpha) cut = true;
    });
    alpha = Math.max(alpha, val);
  });
  return pruned;
}

export function evaluatedCount(grid: Grid): number {
  return 9 - prunedLeaves(grid).size;
}

interface Pt { x: number; y: number }
interface Leaf { x: number; y: number; i: number; j: number }

export interface Layout {
  root: Pt;
  mins: Pt[];
  leaves: Leaf[];
}

export function layout(W: number, H: number): Layout {
  const padX = 26;
  const topY = 30;
  const midY = H / 2;
  const leafY = H - 34;
  const span = W - 2 * padX;
  const leaves: Leaf[] = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const idx = i * 3 + j;
      leaves.push({ x: padX + (span * (idx + 0.5)) / 9, i, j, y: leafY });
    }
  }
  const mins: Pt[] = [0, 1, 2].map((i) => ({
    x: (leaves[i * 3].x + leaves[i * 3 + 2].x) / 2,
    y: midY,
  }));
  const root: Pt = { x: W / 2, y: topY };
  return { root, mins, leaves };
}
