import { useState, type ChangeEvent, type CSSProperties, type ReactNode } from "react";
import { INK, MUTED, SUBTLE, ACCENT, ACCENT_FILL, GRID } from "../theme";

export interface CurveConfig {
  eyebrow: string;
  headline: string;
  sub: string;
  xMax: number;
  xTicks: number[];
  xTickLabel: (t: number) => string;
  slider: { label: string; min: number; max: number; step: number; initial: number; format: (v: number) => string };
  actual: (s: number, t: number) => number;
  intuition: (s: number, t: number) => number;
  actualLabel: string;
  intuitionLabel: string;
  yFormat: (v: number) => string;
  readout: (s: number, actualEnd: number, intuitionEnd: number) => { main: ReactNode; sub: ReactNode };
  footer: string;
}

const W = 640;
const H = 380;
const PAD = { top: 28, right: 24, bottom: 44, left: 72 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const STEPS = 120;

function niceCeil(v: number): number {
  if (v <= 10) return 10;
  const step = Math.pow(10, Math.floor(Math.log10(v)) - 1) * 2;
  return Math.ceil(v / step) * step;
}

export default function CurveExplorer({ config }: { config: CurveConfig }) {
  const [s, setS] = useState<number>(config.slider.initial);

  const ts = Array.from({ length: STEPS + 1 }, (_, i) => (i / STEPS) * config.xMax);
  const actualEnd = config.actual(s, config.xMax);
  const intuitionEnd = config.intuition(s, config.xMax);

  const peak = Math.max(
    ...ts.map((t) => config.actual(s, t)),
    ...ts.map((t) => config.intuition(s, t)),
  );
  const yMax = niceCeil(peak);

  const px = (t: number): number => PAD.left + (t / config.xMax) * PLOT_W;
  const py = (v: number): number => PAD.top + PLOT_H - (v / yMax) * PLOT_H;

  const actualPts = ts.map((t) => `${px(t).toFixed(1)},${py(config.actual(s, t)).toFixed(1)}`);
  const intuitionPts = ts.map((t) => `${px(t).toFixed(1)},${py(config.intuition(s, t)).toFixed(1)}`);
  const wedge = `M ${actualPts.join(" ")} L ${[...intuitionPts].reverse().join(" ")} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => yMax * f);
  const r = config.readout(s, actualEnd, intuitionEnd);

  return (
    <div style={S.wrap}>
      <div style={S.eyebrow}>{config.eyebrow}</div>
      <h1 style={S.headline}>{config.headline}</h1>
      <p style={S.sub}>{config.sub}</p>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {yTicks.map((v) => (
          <g key={`y${v}`}>
            <line x1={PAD.left} y1={py(v)} x2={W - PAD.right} y2={py(v)} stroke={GRID} />
            <text x={PAD.left - 12} y={py(v) + 4} textAnchor="end" fontSize="11" fill={MUTED}>
              {config.yFormat(v)}
            </text>
          </g>
        ))}
        {config.xTicks.map((t) => (
          <text key={`x${t}`} x={px(t)} y={H - PAD.bottom + 22} textAnchor="middle" fontSize="11" fill={MUTED}>
            {config.xTickLabel(t)}
          </text>
        ))}
        <path d={wedge} fill={ACCENT_FILL} />
        <polyline points={intuitionPts.join(" ")} fill="none" stroke={MUTED} strokeWidth="2" strokeDasharray="5 5" />
        <polyline points={actualPts.join(" ")} fill="none" stroke={ACCENT} strokeWidth="3" />
        <circle cx={px(config.xMax)} cy={py(actualEnd)} r="4.5" fill={ACCENT} />
      </svg>

      <div style={S.legend}>
        <span style={S.legendItem}>
          <span style={{ ...S.swatchSolid, background: ACCENT }} /> {config.actualLabel}
        </span>
        <span style={S.legendItem}>
          <span style={{ ...S.swatchDash, borderTopColor: MUTED }} /> {config.intuitionLabel}
        </span>
      </div>

      <div style={S.controlRow}>
        <span style={S.controlLabel}>{config.slider.label}</span>
        <span style={S.controlValue}>{config.slider.format(s)}</span>
      </div>
      <input
        type="range"
        min={config.slider.min}
        max={config.slider.max}
        step={config.slider.step}
        value={s}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setS(Number(e.target.value))}
        style={{ width: "100%", accentColor: ACCENT }}
      />

      <div style={S.readout}>{r.main}</div>
      <div style={S.readoutSub}>{r.sub}</div>
      <div style={S.footer}>{config.footer}</div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  wrap: { width: "100%" },
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 },
  headline: { margin: 0, fontSize: 25, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 18px", color: SUBTLE, fontSize: 15 },
  legend: { display: "flex", gap: 22, flexWrap: "wrap", fontSize: 13, color: "#3F3F46", margin: "12px 0 20px" },
  legendItem: { display: "inline-flex", alignItems: "center", gap: 8 },
  swatchSolid: { width: 20, height: 3, borderRadius: 2, display: "inline-block" },
  swatchDash: { width: 20, height: 0, borderTop: "2px dashed", display: "inline-block" },
  controlRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
  controlLabel: { fontSize: 14, color: SUBTLE },
  controlValue: { fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: INK },
  readout: { marginTop: 22, fontSize: 18, lineHeight: 1.4, color: INK },
  readoutSub: { marginTop: 6, fontSize: 14, color: SUBTLE },
  footer: { marginTop: 18, fontSize: 12, color: MUTED },
};
