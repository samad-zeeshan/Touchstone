import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, GRID, BORDER } from "../theme";

export interface DistributionConfig {
  eyebrow: string;
  headline: string;
  sub: string;
  outcomes: { value: number; label: string; color: string }[];
  sample: () => number;
  trueValue: number;
  refs: { value: number; label: string }[];
  axisMin: number;
  axisMax: number;
  footer: string;
}

const money = (v: number) => (v < 0 ? "-$" : "$") + Math.abs(Math.round(v)).toLocaleString("en-US");

export default function DistributionRunner({ config }: { config: DistributionConfig }) {
  const [stats, setStats] = useState({ sum: 0, total: 0, counts: config.outcomes.map(() => 0) });
  const st = useRef({ sum: 0, total: 0, remaining: 0, raf: 0, counts: config.outcomes.map(() => 0) });

  const reset = useCallback(() => {
    cancelAnimationFrame(st.current.raf);
    st.current = { sum: 0, total: 0, remaining: 0, raf: 0, counts: config.outcomes.map(() => 0) };
    setStats({ sum: 0, total: 0, counts: config.outcomes.map(() => 0) });
  }, [config.outcomes]);

  useEffect(() => reset(), [reset]);
  useEffect(() => () => cancelAnimationFrame(st.current.raf), []);

  const loop = useCallback(() => {
    const s = st.current;
    const batch = Math.min(60, Math.max(3, Math.round(s.total / 40)));
    for (let i = 0; i < batch && s.remaining > 0; i++) {
      const v = config.sample();
      s.sum += v;
      s.total += 1;
      s.remaining -= 1;
      const idx = config.outcomes.findIndex((o) => o.value === v);
      if (idx >= 0) s.counts[idx] += 1;
    }
    setStats({ sum: s.sum, total: s.total, counts: [...s.counts] });
    if (s.remaining > 0) s.raf = requestAnimationFrame(loop);
  }, [config]);

  const run = useCallback((n: number) => {
    st.current.remaining += n;
    cancelAnimationFrame(st.current.raf);
    st.current.raf = requestAnimationFrame(loop);
  }, [loop]);

  const { sum, total, counts } = stats;
  const avg = total > 0 ? sum / total : 0;

  const W = 560, H = 70;
  const span = config.axisMax - config.axisMin;
  const at = (v: number) => 30 + ((v - config.axisMin) / span) * (W - 60);
  const maxCount = Math.max(1, ...counts);

  return (
    <div style={{ width: "100%" }}>
      <div style={S.eyebrow}>{config.eyebrow}</div>
      <h1 style={S.headline}>{config.headline}</h1>
      <p style={S.sub}>{config.sub}</p>

      <div style={S.bigNumber}>{total > 0 ? money(avg) : "--"}</div>
      <div style={S.bigCaption}>average over {total.toLocaleString()} plays</div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", marginBottom: 6 }}>
        <line x1={30} y1={H - 24} x2={W - 30} y2={H - 24} stroke={GRID} strokeWidth={2} />
        {config.refs.map((r) => (
          <g key={r.label}>
            <line x1={at(r.value)} y1={H - 36} x2={at(r.value)} y2={H - 12} stroke={MUTED} strokeWidth={2} strokeDasharray="4 4" />
            <text x={at(r.value)} y={H - 42} textAnchor="middle" fontSize="10" fill={MUTED}>{r.label}</text>
          </g>
        ))}
        <line x1={at(config.trueValue)} y1={H - 40} x2={at(config.trueValue)} y2={H - 8} stroke={ACCENT} strokeWidth={2.5} />
        <text x={at(config.trueValue)} y={H - 46} textAnchor="middle" fontSize="10" fontWeight={700} fill={ACCENT}>EV</text>
        {total > 0 && <circle cx={at(avg)} cy={H - 24} r={6} fill={GREEN} stroke="#fff" strokeWidth={1.5} />}
      </svg>

      <div style={S.bars}>
        {config.outcomes.map((o, i) => (
          <div key={o.label} style={S.barRow}>
            <span style={S.barLabel}>{o.label} ({money(o.value)})</span>
            <div style={S.barTrack}>
              <div style={{ ...S.barFill, width: `${(counts[i] / maxCount) * 100}%`, background: o.color }} />
            </div>
            <span style={S.barCount}>{counts[i].toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div style={S.buttons}>
        <button onClick={() => run(100)} className="btn btn-secondary">Run 100</button>
        <button onClick={() => run(1000)} className="btn btn-primary">Run 1,000</button>
        <button onClick={reset} className="btn btn-secondary">Reset</button>
      </div>
      <div style={S.footer}>{config.footer}</div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 },
  headline: { margin: 0, fontSize: 25, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 20px", color: SUBTLE, fontSize: 15, lineHeight: 1.5 },
  bigNumber: { fontSize: 46, fontWeight: 700, color: GREEN, fontVariantNumeric: "tabular-nums", lineHeight: 1 },
  bigCaption: { fontSize: 14, color: SUBTLE, marginTop: 6, marginBottom: 18 },
  bars: { display: "flex", flexDirection: "column", gap: 8, marginTop: 4 },
  barRow: { display: "flex", alignItems: "center", gap: 10, fontSize: 13 },
  barLabel: { width: 150, color: SUBTLE, flexShrink: 0 },
  barTrack: { flex: 1, height: 16, background: GRID, borderRadius: 5, border: `1px solid ${BORDER}`, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 5, transition: "width 0.1s linear" },
  barCount: { width: 56, textAlign: "right", color: MUTED, fontVariantNumeric: "tabular-nums" },
  buttons: { display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" },
  footer: { marginTop: 16, fontSize: 12, color: MUTED },
};
