import { useCallback, useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, primaryBtn, secondaryBtn } from "../theme";

const NS = [1, 2, 4, 9, 16, 25];
const BINS = 24;
const DIE_SD = Math.sqrt(35 / 12); 

const binOf = (mean: number) => Math.max(0, Math.min(BINS - 1, Math.floor(((mean - 1) / 5) * BINS)));

export default function SampleMeans() {
  const [n, setN] = useState(1);
  const [counts, setCounts] = useState<number[]>(() => Array(BINS).fill(0));
  const st = useRef({ counts: Array(BINS).fill(0) as number[], total: 0, remaining: 0, raf: 0 });

  const reset = useCallback(() => {
    cancelAnimationFrame(st.current.raf);
    st.current = { counts: Array(BINS).fill(0), total: 0, remaining: 0, raf: 0 };
    setCounts(Array(BINS).fill(0));
  }, []);

  useEffect(() => reset(), [n, reset]);
  useEffect(() => () => cancelAnimationFrame(st.current.raf), []);

  const loop = useCallback(() => {
    const s = st.current;
    const batch = 40;
    for (let i = 0; i < batch && s.remaining > 0; i++) {
      let sum = 0;
      for (let k = 0; k < n; k++) sum += 1 + Math.floor(Math.random() * 6);
      s.counts[binOf(sum / n)] += 1;
      s.total += 1;
      s.remaining -= 1;
    }
    setCounts([...s.counts]);
    if (s.remaining > 0) s.raf = requestAnimationFrame(loop);
  }, [n]);

  const draw = useCallback(() => {
    st.current.remaining += 2000;
    cancelAnimationFrame(st.current.raf);
    st.current.raf = requestAnimationFrame(loop);
  }, [loop]);

  const W = 540, H = 200, pad = 28;
  const maxC = Math.max(1, ...counts);
  const bw = (W - pad * 2) / BINS;
  const se = DIE_SD / Math.sqrt(n);

  return (
    <div style={{ width: "100%" }}>
      <div style={S.eyebrow}>Central Limit Theorem</div>
      <h1 style={S.headline}>Averages pile into a bell.</h1>
      <p style={S.sub}>A single die is flat. Average several and the means cluster in the middle - and the more you average, the tighter the bell.</p>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <line x1={pad} y1={H - 20} x2={W - pad} y2={H - 20} stroke={MUTED} />
        {[1, 2, 3, 4, 5, 6].map((v) => (
          <text key={v} x={pad + ((v - 1) / 5) * (W - pad * 2)} y={H - 6} textAnchor="middle" fontSize="10" fill={MUTED}>{v}</text>
        ))}
        {counts.map((c, i) => {
          const h = (c / maxC) * (H - 40);
          return <rect key={i} x={pad + i * bw + 1} y={H - 20 - h} width={bw - 2} height={h} rx={2} fill={ACCENT} opacity={0.85} />;
        })}
      </svg>

      <div style={S.controlRow}>
        <span style={S.controlLabel}>Dice averaged (n)</span>
        <span style={S.controlValue}>{n}</span>
      </div>
      <input type="range" min={0} max={NS.length - 1} step={1} value={NS.indexOf(n)}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setN(NS[Number(e.target.value)])} style={{ width: "100%", accentColor: ACCENT }} />

      <div style={S.readout}>
        Averaging <strong>{n}</strong> {n === 1 ? "die" : "dice"} gives a standard error of <strong style={{ color: ACCENT }}>{se.toFixed(2)}</strong> - the single-die spread {DIE_SD.toFixed(2)} divided by √{n}.
      </div>

      <div style={S.buttons}>
        <button onClick={draw} style={primaryBtn}>Draw 2,000</button>
        <button onClick={reset} style={secondaryBtn}>Reset</button>
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 },
  headline: { margin: 0, fontSize: 25, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 18px", color: SUBTLE, fontSize: 15, lineHeight: 1.5 },
  controlRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "10px 0 8px" },
  controlLabel: { fontSize: 14, color: SUBTLE },
  controlValue: { fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: INK },
  readout: { marginTop: 16, fontSize: 16, lineHeight: 1.5, color: INK },
  buttons: { display: "flex", gap: 10, marginTop: 16 },
};
