/**
 * Side by side bubble vs merge sort on the same shuffled list.
 *
 * Each sort is precomputed into an array of frames. A single scrubber position
 * indexes both, so the race is measured in comparisons not wall clock time.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, BORDER, primaryBtn, secondaryBtn } from "../theme";
import Pseudocode from "./Pseudocode";

const N = 18;

const BUBBLE_CODE = [
  "repeat n−1 passes:",
  "  for each adjacent pair:",
  "    compare the two values",
  "    if left > right, swap them",
];
const MERGE_CODE = [
  "split the list in half",
  "sort each half (recursively)",
  "merge the sorted halves:",
  "  take the smaller front value",
];

// One snapshot of a sort mid run. line is the pseudocode row to highlight, so the
// code panel and the bars stay in step. a and b are the two cells being touched.
interface Frame {
  arr: number[];
  a: number;
  b: number;
  comps: number;
  line: number;
}

function shuffled(): number[] {
  const a = Array.from({ length: N }, (_, i) => i + 1);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Run the sort to completion up front, pushing a frame at every comparison. The
// UI then just replays the array, which is why scrubbing and stepping are free.
function bubbleFrames(input: number[]): Frame[] {
  const a = [...input];
  const frames: Frame[] = [];
  let comps = 0;
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      comps++;
      const willSwap = a[j] > a[j + 1];
      frames.push({ arr: [...a], a: j, b: j + 1, comps, line: willSwap ? 3 : 2 });
      if (willSwap) [a[j], a[j + 1]] = [a[j + 1], a[j]];
    }
  }
  frames.push({ arr: [...a], a: -1, b: -1, comps, line: -1 });
  return frames;
}

function mergeFrames(input: number[]): Frame[] {
  const a = [...input];
  const frames: Frame[] = [];
  let comps = 0;
  const merge = (lo: number, mid: number, hi: number) => {
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      comps++;
      frames.push({ arr: [...a], a: lo + i, b: mid + 1 + j, comps, line: 3 });
      if (left[i] <= right[j]) a[k++] = left[i++];
      else a[k++] = right[j++];
    }
    while (i < left.length) { a[k++] = left[i++]; frames.push({ arr: [...a], a: k - 1, b: -1, comps, line: 2 }); }
    while (j < right.length) { a[k++] = right[j++]; frames.push({ arr: [...a], a: k - 1, b: -1, comps, line: 2 }); }
  };
  const sort = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  };
  sort(0, a.length - 1);
  frames.push({ arr: [...a], a: -1, b: -1, comps, line: -1 });
  return frames;
}

export default function SortingRace() {
  const [input, setInput] = useState<number[]>(shuffled);
  const bubble = useMemo(() => bubbleFrames(input), [input]);
  const merge = useMemo(() => mergeFrames(input), [input]);
  // Bubble produces far more frames. Run to the longer of the two and clamp the
  // shorter one at its end, so the loser visibly keeps going after merge is done.
  const maxLen = Math.max(bubble.length, merge.length);

  const [pos, setPos] = useState(0); 
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); 
  const timer = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (pos >= maxLen - 1) setPos(0);
    setPlaying(true);
  }, [pos, maxLen]);

  const stepTo = useCallback((p: number) => {
    stop();
    setPos(Math.max(0, Math.min(maxLen - 1, p)));
  }, [stop, maxLen]);

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setPos((p) => {
        if (p >= maxLen - 1) { setPlaying(false); return p; }
        return p + 1;
      });
    }, Math.round(45 / speed));
    // Always clear the interval on unmount or replay so a paused tab does not
    // leave a timer running.
    return () => { if (timer.current !== null) window.clearInterval(timer.current); timer.current = null; };
  }, [playing, maxLen, speed]);

  const shuffle = useCallback(() => { stop(); setPos(0); setInput(shuffled()); }, [stop]);

  const bFrame = bubble[Math.min(pos, bubble.length - 1)];
  const mFrame = merge[Math.min(pos, merge.length - 1)];
  const bDone = pos >= bubble.length - 1;
  const mDone = pos >= merge.length - 1;

  return (
    <div style={{ width: "100%" }}>
      <div style={S.eyebrow}>Sorting race</div>
      <h1 style={S.headline}>Watch them sort. One finishes first by a mile.</h1>
      <p style={S.sub}>
        Same {N} numbers, same speed. Bubble sort compares neighbours over and over; merge sort splits and
        recombines. Hit play and see the n log n vs n² gap with your own eyes.
      </p>

      <div style={S.panels}>
        <Panel
          title="Merge sort"
          complexity="O(n log n)"
          frame={mFrame}
          done={mDone}
          accent={GREEN}
          accentFill="rgba(22, 163, 74, 0.10)"
          code={MERGE_CODE}
        />
        <Panel
          title="Bubble sort"
          complexity="O(n²)"
          frame={bFrame}
          done={bDone}
          accent={ACCENT}
          accentFill="rgba(234, 88, 12, 0.10)"
          code={BUBBLE_CODE}
        />
      </div>

      <input
        type="range"
        min={0}
        max={maxLen - 1}
        value={pos}
        onChange={(e) => stepTo(Number(e.target.value))}
        style={{ width: "100%", accentColor: ACCENT, marginTop: 18 }}
        aria-label="Scrub the animation"
      />
      <div style={S.opClock}>op {pos + 1} / {maxLen}</div>

      <div style={S.buttons}>
        <button onClick={playing ? stop : play} style={primaryBtn}>
          {playing ? "Pause" : pos >= maxLen - 1 ? "Replay" : "Play"}
        </button>
        <button onClick={() => stepTo(pos - 1)} disabled={pos === 0} style={secondaryBtn}>◀ Step</button>
        <button onClick={() => stepTo(pos + 1)} disabled={pos >= maxLen - 1} style={secondaryBtn}>Step ▶</button>
        <span style={S.speedWrap}>
          {[0.5, 1, 2, 4].map((sp) => (
            <button key={sp} onClick={() => setSpeed(sp)} style={speedBtn(sp === speed)}>{sp}×</button>
          ))}
        </span>
        <button onClick={shuffle} style={secondaryBtn}>Shuffle</button>
      </div>

      <div style={S.readout}>
        Merge finished in <strong style={{ color: GREEN }}>{merge[merge.length - 1].comps}</strong> comparisons;
        bubble needed <strong style={{ color: ACCENT }}>{bubble[bubble.length - 1].comps}</strong> -{" "}
        about {Math.round(bubble[bubble.length - 1].comps / merge[merge.length - 1].comps)}× more.
      </div>
    </div>
  );
}

function Panel({ title, complexity, frame, done, accent, accentFill, code }: {
  title: string; complexity: string; frame: Frame; done: boolean;
  accent: string; accentFill: string; code: string[];
}) {
  const W = 300, H = 150;
  const gap = 3;
  const bw = (W - (N - 1) * gap) / N;
  return (
    <div style={S.panel}>
      <div style={S.panelHead}>
        <span style={{ fontWeight: 600, color: INK }}>{title}</span>
        <span style={{ color: MUTED, fontSize: 12 }}>{complexity}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: SUBTLE, fontVariantNumeric: "tabular-nums" }}>
          {frame.comps} comparisons{done ? " ✓" : ""}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {frame.arr.map((v, i) => {
          const h = (v / N) * (H - 8);
          const active = i === frame.a || i === frame.b;
          const fill = done ? GREEN : active ? accent : "#D4D4D8";
          return <rect key={i} x={i * (bw + gap)} y={H - h} width={bw} height={h} rx={2} fill={fill} />;
        })}
      </svg>
      <div style={{ marginTop: 12 }}>
        <Pseudocode lines={code} active={done ? -1 : frame.line} accent={accent} accentFill={accentFill} />
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 },
  headline: { margin: 0, fontSize: 25, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 22px", color: SUBTLE, fontSize: 15, lineHeight: 1.5 },
  panels: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 },
  panel: { border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px", background: "#FCFCFD" },
  panelHead: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 14 },
  opClock: { fontSize: 12, color: MUTED, fontVariantNumeric: "tabular-nums", marginTop: 2, marginBottom: 12 },
  buttons: { display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap", alignItems: "center" },
  speedWrap: { display: "inline-flex", gap: 4, background: "#F4F4F5", borderRadius: 999, padding: 3 },
  readout: { marginTop: 18, fontSize: 16, lineHeight: 1.5, color: INK },
};

function speedBtn(active: boolean): CSSProperties {
  return {
    border: "none",
    borderRadius: 999,
    padding: "5px 11px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
    fontVariantNumeric: "tabular-nums",
    background: active ? "#fff" : "transparent",
    color: active ? ACCENT : SUBTLE,
    boxShadow: active ? "0 1px 2px rgba(0,0,0,0.12)" : "none",
    fontFamily: "inherit",
  };
}
