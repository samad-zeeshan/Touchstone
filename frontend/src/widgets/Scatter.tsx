import { useMemo, useState, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, primaryBtn, secondaryBtn } from "../theme";

const MEAN = 100;
const N = 60;

function gauss(rand: () => number, sd: number): number {
  return (rand() + rand() + rand() - 1.5) * 2 * sd; 
}

export default function Scatter() {
  const [showExtreme, setShowExtreme] = useState(false);

  const { points, topIdx, slope } = useMemo(() => {
    let seed = 12345;
    const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const pts = Array.from({ length: N }, () => {
      const latent = MEAN + (rand() - 0.5) * 50;
      return { test: latent + gauss(rand, 9), retest: latent + gauss(rand, 9) };
    });
    let topIdx = 0;
    pts.forEach((p, i) => { if (p.test > pts[topIdx].test) topIdx = i; });
    
    const slope = 0.6;
    return { points: pts, topIdx, slope };
  }, []);

  const W = 460, H = 320, pad = 40;
  const lo = 60, hi = 140;
  const sx = (v: number) => pad + ((v - lo) / (hi - lo)) * (W - pad * 2);
  const sy = (v: number) => H - pad - ((v - lo) / (hi - lo)) * (H - pad * 2);
  const top = points[topIdx];

  return (
    <div style={{ width: "100%" }}>
      <div style={S.eyebrow}>Regression to the mean</div>
      <h1 style={S.headline}>Extremes drift back toward average.</h1>
      <p style={S.sub}>Test scores against retest scores. The standout scorers mostly had a lucky day - so they fall back next time, not because anything changed.</p>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", margin: "0 auto", maxWidth: 460 }}>
        
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={MUTED} />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke={MUTED} />
        <text x={W - pad} y={H - pad + 24} textAnchor="end" fontSize="11" fill={MUTED}>Test score →</text>
        <text x={pad - 8} y={pad - 8} textAnchor="start" fontSize="11" fill={MUTED}>Retest</text>

        <line x1={sx(lo)} y1={sy(lo)} x2={sx(hi)} y2={sy(hi)} stroke={MUTED} strokeWidth={1.5} strokeDasharray="5 4" />
        
        <line x1={sx(lo)} y1={sy(MEAN + slope * (lo - MEAN))} x2={sx(hi)} y2={sy(MEAN + slope * (hi - MEAN))} stroke={ACCENT} strokeWidth={2.5} />

        {points.map((p, i) => (
          <circle key={i} cx={sx(p.test)} cy={sy(p.retest)} r={i === topIdx && showExtreme ? 6 : 4}
            fill={i === topIdx && showExtreme ? GREEN : "rgba(37,99,235,0.55)"} />
        ))}

        {showExtreme && (
          <>
            <line x1={sx(top.test)} y1={sy(top.test)} x2={sx(top.test)} y2={sy(top.retest)} stroke={GREEN} strokeWidth={1.5} strokeDasharray="3 3" />
            <text x={sx(top.test) + 8} y={sy(top.retest)} fontSize="11" fill={GREEN}>retest {Math.round(top.retest)}</text>
          </>
        )}
      </svg>

      <div style={S.readout}>
        {showExtreme ? (
          <>The top scorer hit <strong style={{ color: INK }}>{Math.round(top.test)}</strong> on the test but only <strong style={{ color: GREEN }}>{Math.round(top.retest)}</strong> on the retest - pulled toward the mean of {MEAN}. The orange line (slope &lt; 1) predicts this; the dashed line would not.</>
        ) : (
          <>The cloud tilts shallower than the dashed equal-scores line - high scorers tend to fall, low scorers tend to rise.</>
        )}
      </div>

      <div style={S.buttons}>
        <button onClick={() => setShowExtreme((s) => !s)} style={showExtreme ? secondaryBtn : primaryBtn}>
          {showExtreme ? "Hide" : "Highlight the top scorer"}
        </button>
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 },
  headline: { margin: 0, fontSize: 25, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 18px", color: SUBTLE, fontSize: 15, lineHeight: 1.5 },
  readout: { marginTop: 16, fontSize: 16, lineHeight: 1.5, color: INK },
  buttons: { display: "flex", gap: 10, marginTop: 16 },
};
