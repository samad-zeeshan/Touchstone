import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, BORDER, primaryBtn, secondaryBtn } from "../theme";
import Pseudocode from "./Pseudocode";

const COLS = 15, ROWS = 9;

const CODE = [
  "queue = [start];  dist[start] = 0",
  "while queue not empty:",
  "  cell = queue.pop_front()",
  "  for each neighbour (no diagonals):",
  "    if unseen: dist = dist + 1; enqueue",
  "stop when the goal is reached",
];
const START = { x: 2, y: 6 };
const GOAL = { x: 11, y: 1 };
const DIST = Math.abs(GOAL.x - START.x) + Math.abs(GOAL.y - START.y); 

const manhattan = (x: number, y: number) => Math.abs(x - START.x) + Math.abs(y - START.y);

export default function GridSearch() {
  const [radius, setRadius] = useState(0);
  const [diagonal, setDiagonal] = useState(false);
  const timer = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  }, []);

  const play = useCallback(() => {
    stop();
    setRadius(0);
    timer.current = window.setInterval(() => {
      setRadius((r) => {
        if (r >= DIST) { stop(); return r; }
        return r + 1;
      });
    }, 380);
  }, [stop]);

  useEffect(() => stop, [stop]);

  const W = 540, pad = 8;
  const cell = (W - pad * 2) / COLS;
  const H = ROWS * cell + pad * 2;
  const cx = (x: number) => pad + x * cell;
  const cy = (y: number) => pad + y * cell;

  let reached = 0;
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (manhattan(x, y) <= radius) reached++;
  const arrived = radius >= DIST;

  const pathCells: { x: number; y: number }[] = [];
  for (let x = START.x; x <= GOAL.x; x++) pathCells.push({ x, y: START.y });
  for (let y = START.y - 1; y >= GOAL.y; y--) pathCells.push({ x: GOAL.x, y });

  return (
    <div style={{ width: "100%" }}>
      <div style={S.eyebrow}>BFS & shortest paths</div>
      <h1 style={S.headline}>BFS floods outward and finds the shortest path.</h1>
      <p style={S.sub}>Every ring is one more step from the start. The first ring to reach the goal is the answer - and you can't cut diagonally.</p>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {Array.from({ length: ROWS }, (_, y) =>
          Array.from({ length: COLS }, (_, x) => {
            const d = manhattan(x, y);
            const on = d <= radius;
            const shade = on ? Math.max(0.12, 1 - d / (DIST + 2)) : 0;
            return (
              <rect key={`${x},${y}`} x={cx(x) + 1} y={cy(y) + 1} width={cell - 2} height={cell - 2} rx={4}
                fill={on ? `rgba(11, 110, 97,${0.1 + shade * 0.5})` : "#F7F7F8"} stroke={BORDER} strokeWidth={0.75} />
            );
          }),
        )}
        {arrived && pathCells.map((c, i) => (
          <rect key={`p${i}`} x={cx(c.x) + 1} y={cy(c.y) + 1} width={cell - 2} height={cell - 2} rx={4} fill="none" stroke={GREEN} strokeWidth={2.5} />
        ))}
        {diagonal && (
          <line x1={cx(START.x) + cell / 2} y1={cy(START.y) + cell / 2} x2={cx(GOAL.x) + cell / 2} y2={cy(GOAL.y) + cell / 2}
            stroke={MUTED} strokeWidth={2} strokeDasharray="5 4" />
        )}
        
        <circle cx={cx(START.x) + cell / 2} cy={cy(START.y) + cell / 2} r={cell / 3} fill={INK} />
        <text x={cx(START.x) + cell / 2} y={cy(START.y) + cell / 2 + 4} textAnchor="middle" fontSize="11" fill="#fff" fontWeight={700}>S</text>
        <circle cx={cx(GOAL.x) + cell / 2} cy={cy(GOAL.y) + cell / 2} r={cell / 3} fill={GREEN} />
        <text x={cx(GOAL.x) + cell / 2} y={cy(GOAL.y) + cell / 2 + 4} textAnchor="middle" fontSize="11" fill="#fff" fontWeight={700}>G</text>
      </svg>

      <div style={S.readout}>
        {arrived ? (
          <>BFS reached the goal in <strong style={{ color: GREEN }}>{DIST}</strong> steps ({Math.abs(GOAL.x - START.x)} across + {Math.abs(START.y - GOAL.y)} up).{diagonal && <> The diagonal looks shorter (~{Math.round(Math.hypot(GOAL.x - START.x, START.y - GOAL.y))}), but you can't move that way.</>}</>
        ) : (
          <>Frontier at distance <strong>{radius}</strong> - {reached} cells reached so far.</>
        )}
      </div>

      <div style={{ maxWidth: 360, marginTop: 18 }}>
        <Pseudocode title="The algorithm" lines={CODE} active={arrived ? 5 : radius === 0 ? 0 : 4} />
      </div>

      <div style={S.buttons}>
        <button onClick={play} style={primaryBtn}>Flood (BFS)</button>
        <button onClick={() => { stop(); setRadius(DIST); }} style={secondaryBtn}>Skip to goal</button>
        <button onClick={() => setDiagonal((d) => !d)} style={secondaryBtn}>{diagonal ? "Hide diagonal" : "Show diagonal"}</button>
        <button onClick={() => { stop(); setRadius(0); setDiagonal(false); }} style={secondaryBtn}>Reset</button>
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
