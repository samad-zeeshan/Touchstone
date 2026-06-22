/**
 * You be the algorithm: at each pair the user calls swap or keep.
 *
 * The cursor walks bubble sort's real position and the list always follows the
 * correct move, so a wrong guess is flagged without derailing the sort.
 */
import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, RED, primaryBtn, secondaryBtn } from "../theme";
import Pseudocode from "./Pseudocode";

const NSIZE = 7;

const CODE = [
  "for each adjacent pair, left to right:",
  "  if left > right:  swap",
  "  else:             keep",
  "after each pass the largest sinks to the end",
];

interface Cursor {
  i: number;
  j: number;
  done: boolean;
}

function shuffled(): number[] {
  const a = Array.from({ length: NSIZE }, (_, i) => i + 1);
  for (let i = a.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1));
    [a[i], a[k]] = [a[k], a[i]];
  }
  // Reroll an already sorted deal so there is always at least one decision to make.
  if (a.every((v, i) => i === 0 || a[i - 1] <= v)) return shuffled();
  return a;
}

// Step the cursor across one pass, then start the next pass one cell shorter
// since the tail is settled. done once the last pass is complete.
function advance(c: Cursor, n: number): Cursor {
  if (c.j < n - 2 - c.i) return { ...c, j: c.j + 1 };
  const ni = c.i + 1;
  if (ni > n - 2) return { i: ni, j: 0, done: true };
  return { i: ni, j: 0, done: false };
}

type Note = { kind: "ok" | "err"; text: string } | null;

export default function SortDriver() {
  const [arr, setArr] = useState<number[]>(shuffled);
  const [cursor, setCursor] = useState<Cursor>({ i: 0, j: 0, done: false });
  const [comparisons, setComparisons] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [note, setNote] = useState<Note>(null);

  const n = arr.length;
  const totalComparisons = (n * (n - 1)) / 2;

  const reset = useCallback(() => {
    setArr(shuffled());
    setCursor({ i: 0, j: 0, done: false });
    setComparisons(0);
    setMistakes(0);
    setNote(null);
  }, []);

  const act = useCallback(
    (userSwaps: boolean) => {
      if (cursor.done) return;
      const { j } = cursor;
      const left = arr[j];
      const right = arr[j + 1];
      // shouldSwap is ground truth from bubble sort. We grade the user against it
      // but apply it regardless, so the list stays correctly sorted either way.
      const shouldSwap = left > right;
      const correct = userSwaps === shouldSwap;

      if (shouldSwap) {
        setArr((prev) => {
          const next = [...prev];
          [next[j], next[j + 1]] = [next[j + 1], next[j]];
          return next;
        });
      }
      setComparisons((c) => c + 1);

      if (correct) {
        setNote({
          kind: "ok",
          text: shouldSwap
            ? `Right — ${left} > ${right}, so they swap.`
            : `Right — ${left} ≤ ${right}, leave them.`,
        });
      } else {
        setMistakes((m) => m + 1);
        setNote({
          kind: "err",
          text: shouldSwap
            ? `Not quite — ${left} > ${right}, so bubble sort swaps them.`
            : `Not quite — ${left} ≤ ${right}, so they stay put.`,
        });
      }

      setCursor((c) => advance(c, n));
    },
    [arr, cursor, n],
  );

  // After i passes the last i bars are in final position, so paint them green.
  const settledFrom = n - cursor.i;
  const bars = useMemo(() => {
    const W = 420, H = 150;
    const gap = 8;
    const bw = (W - (n - 1) * gap) / n;
    return { W, H, gap, bw };
  }, [n]);

  const activeLine = cursor.done ? -1 : 1;
  const left = !cursor.done ? arr[cursor.j] : 0;
  const right = !cursor.done ? arr[cursor.j + 1] : 0;

  return (
    <div style={S.card}>
      <div style={S.eyebrow}>Drive the algorithm · Bubble sort</div>
      <h2 style={S.headline}>You be the algorithm.</h2>
      <p style={S.sub}>
        Bubble sort compares the two highlighted bars. At each step decide what it would do:
        <strong style={{ color: INK }}> swap</strong> if the left is taller, otherwise
        <strong style={{ color: INK }}> keep</strong>. We&apos;ll flag any move that isn&apos;t what bubble sort does.
      </p>

      <svg viewBox={`0 0 ${bars.W} ${bars.H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {arr.map((v, idx) => {
          const h = (v / n) * (bars.H - 26);
          const x = idx * (bars.bw + bars.gap);
          const settled = idx >= settledFrom;
          const active = !cursor.done && (idx === cursor.j || idx === cursor.j + 1);
          const fill = cursor.done ? GREEN : active ? ACCENT : settled ? GREEN : "#D4D4D8";
          return (
            <g key={idx}>
              <rect x={x} y={bars.H - h - 18} width={bars.bw} height={h} rx={3} fill={fill} />
              <text
                x={x + bars.bw / 2}
                y={bars.H - 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight={600}
                fill={active ? ACCENT : settled || cursor.done ? GREEN : MUTED}
              >
                {v}
              </text>
            </g>
          );
        })}
      </svg>

      {!cursor.done ? (
        <>
          <div style={S.question}>
            Compare <strong style={{ color: ACCENT }}>{left}</strong> and{" "}
            <strong style={{ color: ACCENT }}>{right}</strong> — what does bubble sort do?
          </div>
          <div style={S.buttons}>
            <button onClick={() => act(true)} style={primaryBtn}>Swap them</button>
            <button onClick={() => act(false)} style={secondaryBtn}>Keep order</button>
          </div>
        </>
      ) : (
        <div style={S.doneRow}>
          <div style={mistakes === 0 ? S.doneGood : S.doneOk}>
            {mistakes === 0 ? (
              <>Sorted — a flawless run in {comparisons} comparisons.</>
            ) : (
              <>
                Sorted in {comparisons} comparisons, with {mistakes} wrong call{mistakes === 1 ? "" : "s"} along the way.
              </>
            )}
          </div>
          <button onClick={reset} style={primaryBtn}>New list</button>
        </div>
      )}

      {note && (
        <div style={{ ...S.note, color: note.kind === "ok" ? GREEN : RED }}>{note.text}</div>
      )}

      <div style={S.stats}>
        <Stat label="comparisons" value={`${comparisons} / ${totalComparisons}`} color={INK} />
        <Stat label="wrong calls" value={`${mistakes}`} color={mistakes ? RED : GREEN} />
        <Stat label="passes" value={`${Math.min(cursor.i, n - 1)} / ${n - 1}`} color={SUBTLE} />
      </div>

      <div style={{ marginTop: 18 }}>
        <Pseudocode title="What you're running" lines={CODE} active={activeLine} />
      </div>

      {!cursor.done && (
        <button onClick={reset} style={{ ...secondaryBtn, marginTop: 16 }}>New list</button>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={S.stat}>
      <div style={{ ...S.statNum, color }}>{value}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  card: { background: "#FFFFFF", borderRadius: 18, padding: "30px 32px", maxWidth: 640, width: "100%", boxShadow: "0 12px 40px rgba(24,24,27,0.10)", boxSizing: "border-box" },
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 },
  headline: { margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 20px", color: SUBTLE, fontSize: 15, lineHeight: 1.55 },
  question: { fontSize: 17, color: INK, margin: "6px 0 14px" },
  buttons: { display: "flex", gap: 10, flexWrap: "wrap" },
  doneRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginTop: 4 },
  doneGood: { fontSize: 17, fontWeight: 600, color: GREEN },
  doneOk: { fontSize: 17, fontWeight: 600, color: INK },
  note: { marginTop: 14, fontSize: 15, lineHeight: 1.5, fontWeight: 500 },
  stats: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 },
  stat: { flex: "1 1 90px", background: "#FAFAFA", border: "1px solid #EFEFF1", borderRadius: 12, padding: "10px 14px" },
  statNum: { fontSize: 19, fontWeight: 700, fontVariantNumeric: "tabular-nums" },
  statLabel: { fontSize: 11, color: MUTED, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" },
};
