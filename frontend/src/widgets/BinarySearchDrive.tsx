import { useCallback, useState, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, RED, GRID, BORDER, PAPER, BG } from "../theme";
import Pseudocode from "./Pseudocode";

const NSIZE = 16;
const VALUES = Array.from({ length: NSIZE }, (_, i) => i + 1);
const WORST = Math.floor(Math.log2(NSIZE)) + 1;

const CODE = [
  "lo = 0,  hi = n − 1",
  "while lo ≤ hi:",
  "  mid = (lo + hi) / 2   ← probe here",
  "  if a[mid] == target:  found",
  "  if a[mid] < target:   lo = mid + 1",
  "  else:                 hi = mid − 1",
];

type Note = { kind: "ok" | "err"; text: string } | null;

function freshTarget(): number {
  return 1 + Math.floor(Math.random() * NSIZE);
}

export default function BinarySearchDrive() {
  const [target, setTarget] = useState<number>(freshTarget);
  const [lo, setLo] = useState(0);
  const [hi, setHi] = useState(NSIZE - 1);
  const [mid, setMid] = useState<number | null>(null);
  const [probes, setProbes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [found, setFound] = useState(false);
  const [note, setNote] = useState<Note>(null);

  const done = found || lo > hi;

  const reset = useCallback(() => {
    setTarget(freshTarget());
    setLo(0); setHi(NSIZE - 1); setMid(null);
    setProbes(0); setMistakes(0); setFound(false); setNote(null);
  }, []);

  const probe = useCallback(
    (i: number) => {
      if (done) return;
      if (i < lo || i > hi) {
        setNote({ kind: "err", text: `Position ${i + 1} is already eliminated - probe inside the live window.` });
        return;
      }
      const correctMid = Math.floor((lo + hi) / 2);
      const onMiddle = i === correctMid;
      setProbes((p) => p + 1);
      if (!onMiddle) {
        setMistakes((m) => m + 1);
      }

      const val = VALUES[correctMid];
      setMid(correctMid);
      if (val === target) {
        setFound(true);
        setNote({ kind: "ok", text: `Found ${target} at position ${correctMid + 1}. ${onMiddle ? "" : "(the middle was the right place to look)"}`.trim() });
        return;
      }
      const dir = val < target ? "higher" : "lower";
      if (val < target) setLo(correctMid + 1);
      else setHi(correctMid - 1);

      if (onMiddle) {
        setNote({ kind: "ok", text: `${val} ${val < target ? "<" : ">"} ${target}, so the target is ${dir} - keep the ${val < target ? "right" : "left"} half.` });
      } else {
        setNote({ kind: "err", text: `Binary search probes the middle of the window - that's position ${correctMid + 1}, not ${i + 1}.` });
      }
    },
    [done, lo, hi, target],
  );

  const activeLine = found ? 3 : mid === null ? 1 : VALUES[mid] < target ? 4 : 5;

  return (
    <div style={S.card}>
      <div style={S.eyebrow}>Probe it · Binary search</div>
      <h2 style={S.headline}>Where does binary search look next?</h2>
      <p style={S.sub}>
        Find <strong style={{ color: ACCENT }}>{target}</strong> in this sorted row. Click the cell the algorithm
        would check - the <strong style={{ color: INK }}>middle of the live window</strong>. We&apos;ll narrow from there
        and flag any probe that isn&apos;t the middle.
      </p>

      <div style={S.row}>
        {VALUES.map((v, i) => {
          const inWindow = i >= lo && i <= hi;
          const isMid = i === mid;
          let bg = PAPER, color = INK, border = BORDER;
          if (!inWindow && !(isMid && found)) { bg = BG; color = MUTED; border = GRID; }
          if (isMid) { bg = found ? GREEN : ACCENT; color = "#fff"; border = bg; }
          return (
            <button
              key={i}
              onClick={() => probe(i)}
              disabled={done || !inWindow}
              style={{ ...S.cell, background: bg, color, borderColor: border, cursor: done || !inWindow ? "default" : "pointer" }}
              title={inWindow ? "Probe this position" : "Eliminated"}
            >
              {v}
            </button>
          );
        })}
      </div>

      {note && <div style={{ ...S.note, color: note.kind === "ok" ? GREEN : RED }}>{note.text}</div>}

      {done && (
        <div style={S.doneRow}>
          <div style={mistakes === 0 ? S.doneGood : S.doneOk}>
            {found
              ? mistakes === 0
                ? `Nailed it - ${probes} probe${probes === 1 ? "" : "s"}, all on the middle.`
                : `Found it in ${probes} probes, with ${mistakes} off-centre.`
              : "Window empty - not in the list."}
          </div>
          <button onClick={reset} className="btn btn-primary">New target</button>
        </div>
      )}

      <div style={S.stats}>
        <Stat label="probes" value={`${probes}`} color={INK} />
        <Stat label="off-centre" value={`${mistakes}`} color={mistakes ? RED : GREEN} />
        <Stat label="worst case" value={`≤ ${WORST}`} color={SUBTLE} />
      </div>

      <div style={{ marginTop: 18 }}>
        <Pseudocode title="What you're running" lines={CODE} active={activeLine} />
      </div>

      {!done && <button onClick={reset} className="btn btn-secondary" style={{ marginTop: 16 }}>New target</button>}
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
  card: { background: PAPER, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "30px 32px", maxWidth: 640, width: "100%", boxSizing: "border-box" },
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 },
  headline: { margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 20px", color: SUBTLE, fontSize: 15, lineHeight: 1.55 },
  row: { display: "grid", gridTemplateColumns: `repeat(${NSIZE}, 1fr)`, gap: 3 },
  cell: { aspectRatio: "1 / 1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, border: "1px solid", fontSize: 11, fontWeight: 600, fontVariantNumeric: "tabular-nums", fontFamily: "inherit", padding: 0, transition: "background 0.15s, color 0.15s" },
  note: { marginTop: 14, fontSize: 15, lineHeight: 1.5, fontWeight: 500 },
  doneRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginTop: 14 },
  doneGood: { fontSize: 16, fontWeight: 600, color: GREEN },
  doneOk: { fontSize: 16, fontWeight: 600, color: INK },
  stats: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 },
  stat: { flex: "1 1 90px", background: PAPER, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "10px 14px" },
  statNum: { fontSize: 19, fontWeight: 700, fontVariantNumeric: "tabular-nums" },
  statLabel: { fontSize: 11, color: MUTED, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" },
};
