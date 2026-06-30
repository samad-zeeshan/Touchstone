import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, GRID, BORDER, PAPER, BG } from "../theme";
import Pseudocode from "./Pseudocode";

const N = 32;
const COLS = 16;
const VALUES = Array.from({ length: N }, (_, i) => i + 1); 

const CODE = [
  "lo = 0,  hi = n − 1",
  "while lo ≤ hi:",
  "  mid = (lo + hi) / 2",
  "  if a[mid] == target:  found",
  "  if a[mid] < target:   lo = mid + 1",
  "  else:                 hi = mid − 1",
];

interface Search {
  lo: number;
  hi: number;
  mid: number | null;
  steps: number;
  found: boolean;
}

const fresh = (): Search => ({ lo: 0, hi: N - 1, mid: null, steps: 0, found: false });
const worstCase = Math.floor(Math.log2(N)) + 1;

export default function BinarySearchStepper() {
  const [target, setTarget] = useState<number>(() => 1 + Math.floor(Math.random() * N));
  const [s, setS] = useState<Search>(fresh);
  const raf = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
  }, []);

  const step = useCallback(() => {
    setS((prev) => {
      if (prev.found || prev.lo > prev.hi) return prev;
      const mid = Math.floor((prev.lo + prev.hi) / 2);
      const steps = prev.steps + 1;
      if (VALUES[mid] === target) return { ...prev, mid, steps, found: true };
      if (VALUES[mid] < target) return { ...prev, lo: mid + 1, mid, steps };
      return { ...prev, hi: mid - 1, mid, steps };
    });
  }, [target]);

  const reset = useCallback(() => {
    stop();
    setTarget(1 + Math.floor(Math.random() * N));
    setS(fresh());
  }, [stop]);

  // Auto-step runs on requestAnimationFrame with a 650ms accumulator rather than
  // setInterval, so a backgrounded tab parks it. The completion effect below stops
  // the loop once the search settles, keeping that decision out of the updater.
  const auto = useCallback(() => {
    stop();
    let last = performance.now(), acc = 0;
    const loop = (now: number) => {
      acc += now - last;
      last = now;
      if (acc >= 650) { acc = 0; step(); }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  }, [stop, step]);

  useEffect(() => { if (s.found || s.lo > s.hi) stop(); }, [s, stop]);
  useEffect(() => stop, [stop]);

  const done = s.found || s.lo > s.hi;
  const survivors = Math.max(0, s.hi - s.lo + 1);

  let activeLine = 1; 
  if (s.mid !== null) {
    if (s.found) activeLine = 3;
    else if (VALUES[s.mid] < target) activeLine = 4;
    else activeLine = 5;
  }
  if (done && !s.found) activeLine = 1;

  return (
    <div style={{ width: "100%" }}>
      <div style={S.eyebrow}>Binary search</div>
      <h1 style={S.headline}>Each guess throws away half the list.</h1>
      <p style={S.sub}>
        Searching {N} sorted items for <strong style={{ color: ACCENT }}>{target}</strong>. Watch the window shrink.
      </p>

      <div style={S.grid}>
        {VALUES.map((v, i) => {
          const inWindow = i >= s.lo && i <= s.hi;
          const isMid = i === s.mid;
          let bg = PAPER;
          let color = MUTED;
          let border = GRID;
          if (!inWindow && !(isMid && s.found)) {
            bg = BG;
          } else {
            color = INK;
            border = BORDER;
          }
          if (isMid) {
            bg = s.found ? GREEN : ACCENT;
            color = "#fff";
            border = bg;
          }
          return (
            <div key={i} style={{ ...S.cell, background: bg, color, borderColor: border }}>
              {v}
            </div>
          );
        })}
      </div>

      <div style={S.readout}>
        {!s.steps ? (
          <>Step through it, or hit Auto.</>
        ) : s.found ? (
          <>
            Found <strong style={{ color: GREEN }}>{target}</strong> in{" "}
            <strong>{s.steps}</strong> comparison{s.steps === 1 ? "" : "s"}.
          </>
        ) : done ? (
          <>Not in the list - settled in <strong>{s.steps}</strong> comparisons.</>
        ) : (
          <>
            Step {s.steps}: checked the middle, <strong>{survivors}</strong> candidate{survivors === 1 ? "" : "s"} left.
          </>
        )}
      </div>
      <div style={S.readoutSub}>
        A linear scan could take up to {N} checks. Binary search never needs more than{" "}
        <strong>{worstCase}</strong> (that's ⌊log₂{N}⌋ + 1).
      </div>

      <div style={{ marginTop: 18 }}>
        <Pseudocode title="The algorithm" lines={CODE} active={activeLine} />
      </div>

      <div style={S.buttons}>
        <button onClick={step} disabled={done} className={done ? "btn btn-secondary" : "btn btn-primary"}>Step</button>
        <button onClick={auto} disabled={done} className="btn btn-secondary">Auto</button>
        <button onClick={reset} className="btn btn-secondary">New target</button>
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 },
  headline: { margin: 0, fontSize: 25, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 22px", color: SUBTLE, fontSize: 15 },
  grid: { display: "grid", gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 4, marginBottom: 22 },
  cell: {
    aspectRatio: "1 / 1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    border: "1px solid",
    fontSize: 12,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    transition: "background 0.2s, color 0.2s",
  },
  readout: { fontSize: 18, lineHeight: 1.4, color: INK },
  readoutSub: { marginTop: 6, fontSize: 14, color: SUBTLE },
  buttons: { display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" },
};
