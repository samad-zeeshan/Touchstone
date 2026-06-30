/**
 * One SVG game tree, drawn as either minimax or alpha beta from the mode prop.
 *
 * The math lives in gameTreeLogic. This file is only layout, reveal state, and the
 * two pseudocode panels.
 */
import { useMemo, useState, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, RED, BORDER } from "../theme";
import { type Grid, EXAMPLE, minNodes, rootValue, prunedLeaves, evaluatedCount, layout } from "./gameTreeLogic";
import Pseudocode from "./Pseudocode";

const W = 560;
const H = 280;

const MINIMAX_CODE = [
  "value(node):",
  "  if leaf: return its score",
  "  if MAX to move: return max of children",
  "  if MIN to move: return min of children",
];
const AB_CODE = [
  "scan a move's replies left to right",
  "α = best score MAX has secured so far",
  "for each reply under this move:",
  "  if reply ≤ α: skip the rest (prune)",
  "the unpruned leaves still fix the root",
];

function shuffledGrid(): Grid {
  return [0, 1, 2].map(() => [0, 1, 2].map(() => 1 + Math.floor(Math.random() * 9)));
}

export default function GameTree({ mode }: { mode: "minimax" | "alphabeta" }) {
  const [grid, setGrid] = useState<Grid>(EXAMPLE);
  // The root value and the pruning stay hidden until revealed, so the learner
  // predicts the outcome before the tree backs it up.
  const [revealed, setRevealed] = useState(false);

  const { mins, root, value, pruned, evaluated } = useMemo(() => ({
    mins: minNodes(grid),
    root: rootValue(grid),
    value: rootValue(grid),
    pruned: prunedLeaves(grid),
    evaluated: evaluatedCount(grid),
  }), [grid]);

  const L = layout(W, H); 

  return (
    <div style={{ width: "100%" }}>
      <div style={S.eyebrow}>{mode === "minimax" ? "Minimax" : "Alpha-beta pruning"}</div>
      <h1 style={S.headline}>
        {mode === "minimax" ? "The opponent moves too." : "Skip what can't change the answer."}
      </h1>
      <p style={S.sub}>
        {mode === "minimax"
          ? "The maximizer picks a move; the minimizer replies with its worst leaf. Reveal the backup and see why the biggest leaf is a trap."
          : "Scanning left to right, alpha-beta drops any branch that can't beat what's already secured - same answer, fewer leaves."}
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        
        {L.mins.map((m, i) => (
          <line key={`rm${i}`} x1={L.root.x} y1={L.root.y} x2={m.x} y2={m.y} stroke="#D4D4D8" strokeWidth={1.5} />
        ))}
        {L.leaves.map((lf) => {
          const dim = mode === "alphabeta" && revealed && pruned.has(`${lf.i},${lf.j}`);
          return (
            <line key={`ml${lf.i}${lf.j}`} x1={L.mins[lf.i].x} y1={L.mins[lf.i].y} x2={lf.x} y2={lf.y}
              stroke="#D4D4D8" strokeWidth={1.5} opacity={dim ? 0.2 : 1} />
          );
        })}

        {L.leaves.map((lf) => {
          const v = grid[lf.i][lf.j];
          // In alpha beta a pruned leaf fades out to show it was never read. In
          // minimax the leaf that wins each branch is filled with the accent.
          const dim = mode === "alphabeta" && revealed && pruned.has(`${lf.i},${lf.j}`);
          const isMin = mode === "minimax" && revealed && v === mins[lf.i];
          return (
            <g key={`l${lf.i}${lf.j}`} opacity={dim ? 0.22 : 1}>
              <rect x={lf.x - 15} y={lf.y - 15} width={30} height={30} rx={6}
                fill={isMin ? ACCENT : "#fff"} stroke={isMin ? ACCENT : BORDER} strokeWidth={1.5} />
              <text x={lf.x} y={lf.y + 4} textAnchor="middle" fontSize="13" fontWeight={600} fill={isMin ? "#fff" : INK}>{v}</text>
            </g>
          );
        })}

        {L.mins.map((m, i) => {
          const show = mode === "minimax" && revealed;
          return (
            <g key={`m${i}`}>
              <polygon points={`${m.x - 16},${m.y - 13} ${m.x + 16},${m.y - 13} ${m.x},${m.y + 15}`}
                fill="#fff" stroke={MUTED} strokeWidth={1.5} />
              {show && <text x={m.x} y={m.y - 1} textAnchor="middle" fontSize="12" fontWeight={700} fill={RED}>{mins[i]}</text>}
            </g>
          );
        })}

        <polygon points={`${L.root.x - 17},${L.root.y + 14} ${L.root.x + 17},${L.root.y + 14} ${L.root.x},${L.root.y - 14}`}
          fill="#fff" stroke={INK} strokeWidth={1.8} />
        {revealed && (
          <text x={L.root.x} y={L.root.y + 6} textAnchor="middle" fontSize="13" fontWeight={700} fill={GREEN}>{value}</text>
        )}

        <text x={20} y={H - 6} fontSize="11" fill={MUTED}>▲ maximizer</text>
        <text x={W - 90} y={H - 6} fontSize="11" fill={MUTED}>▽ minimizer</text>
      </svg>

      <div style={S.readout}>
        {mode === "minimax" ? (
          revealed ? (
            <>Each move backs up its worst reply ({mins.join(", ")}); the maximizer takes the best: <strong style={{ color: GREEN }}>{root}</strong>. The biggest leaf ({Math.max(...grid.flat())}) was unreachable.</>
          ) : (
            <>Reveal the backup to see what really reaches the root.</>
          )
        ) : revealed ? (
          <>Alpha-beta evaluated <strong style={{ color: ACCENT }}>{evaluated}</strong> of 9 leaves and still found the root value <strong style={{ color: GREEN }}>{root}</strong>.</>
        ) : (
          <>Reveal pruning to see which leaves never need to be checked.</>
        )}
      </div>

      <div style={{ maxWidth: 380, marginTop: 18 }}>
        {mode === "minimax" ? (
          <Pseudocode title="The algorithm" lines={MINIMAX_CODE} active={revealed ? 3 : -1} />
        ) : (
          <Pseudocode title="The algorithm" lines={AB_CODE} active={revealed ? 3 : -1} />
        )}
      </div>

      <div style={S.buttons}>
        <button onClick={() => setRevealed((r) => !r)} className="btn btn-primary">
          {revealed ? "Hide" : mode === "minimax" ? "Reveal backup" : "Reveal pruning"}
        </button>
        <button onClick={() => { setGrid(shuffledGrid()); setRevealed(false); }} className="btn btn-secondary">Shuffle</button>
        <button onClick={() => { setGrid(EXAMPLE); setRevealed(false); }} className="btn btn-secondary">Example</button>
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 },
  headline: { margin: 0, fontSize: 25, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 18px", color: SUBTLE, fontSize: 15, lineHeight: 1.5 },
  readout: { marginTop: 16, fontSize: 16, lineHeight: 1.5, color: INK },
  buttons: { display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" },
};
