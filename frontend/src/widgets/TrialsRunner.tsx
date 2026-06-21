import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GRID, BORDER, primaryBtn, secondaryBtn } from "../theme";

export interface TrialVariant {
  label: string;
  trueValue: number;
  trueLabel: string;
  intuitionValue: number;
  intuitionLabel: string;
  runTrial: () => boolean | null;
}

export interface TrialsConfig {
  eyebrow: string;
  headline: string;
  sub: string;
  variants: TrialVariant[];
  footer: string;
  winLabel?: string;
  trialLabel?: string;
}

const pct = (v: number) => (v * 100).toFixed(1) + "%";

export default function TrialsRunner({ config }: { config: TrialsConfig }) {
  const [variantIdx, setVariantIdx] = useState(0);
  const variant = config.variants[variantIdx];
  const [stats, setStats] = useState({ wins: 0, total: 0 });
  const st = useRef({ wins: 0, total: 0, remaining: 0, raf: 0, run: variant.runTrial });

  const reset = useCallback(() => {
    cancelAnimationFrame(st.current.raf);
    st.current = { wins: 0, total: 0, remaining: 0, raf: 0, run: variant.runTrial };
    setStats({ wins: 0, total: 0 });
  }, [variant.runTrial]);

  useEffect(() => reset(), [reset]);
  useEffect(() => () => cancelAnimationFrame(st.current.raf), []);

  const loop = useCallback(() => {
    const s = st.current;
    const batch = Math.min(60, Math.max(3, Math.round(s.total / 40)));
    for (let i = 0; i < batch && s.remaining > 0; i++) {
      const r = s.run();
      s.remaining--;
      if (r === null) continue;
      if (r) s.wins++;
      s.total++;
    }
    setStats({ wins: s.wins, total: s.total });
    if (s.remaining > 0) s.raf = requestAnimationFrame(loop);
  }, []);

  const run = useCallback(
    (n: number) => {
      st.current.remaining += n;
      cancelAnimationFrame(st.current.raf);
      st.current.raf = requestAnimationFrame(loop);
    },
    [loop],
  );

  const { wins, total } = stats;
  const proportion = total > 0 ? wins / total : 0;

  return (
    <div style={{ width: "100%" }}>
      <div style={S.eyebrow}>{config.eyebrow}</div>
      <h1 style={S.headline}>{config.headline}</h1>
      <p style={S.sub}>{config.sub}</p>

      {config.variants.length > 1 && (
        <div style={S.tabs}>
          {config.variants.map((v, i) => (
            <button key={v.label} onClick={() => setVariantIdx(i)} style={tab(i === variantIdx)}>
              {v.label}
            </button>
          ))}
        </div>
      )}

      <div style={S.bigNumber}>{total > 0 ? pct(proportion) : "--"}</div>
      <div style={S.bigCaption}>
        {wins.toLocaleString()} {config.winLabel ?? "wins"} in {total.toLocaleString()} {config.trialLabel ?? "trials"}
      </div>

      <div style={S.track}>
        <div style={{ ...S.fill, width: `${proportion * 100}%` }} />
        <Marker at={variant.intuitionValue} color={MUTED} dashed label={variant.intuitionLabel} />
        <Marker at={variant.trueValue} color={ACCENT} label={variant.trueLabel} />
      </div>

      <div style={S.buttons}>
        <button onClick={() => run(100)} style={secondaryBtn}>Run 100</button>
        <button onClick={() => run(1000)} style={primaryBtn}>Run 1,000</button>
        <button onClick={reset} style={secondaryBtn}>Reset</button>
      </div>

      <div style={S.footer}>{config.footer}</div>
    </div>
  );
}

function Marker({ at, color, label, dashed }: { at: number; color: string; label: string; dashed?: boolean }) {
  return (
    <div style={{ position: "absolute", left: `${at * 100}%`, top: 0, bottom: 0 }}>
      <div style={{ width: 0, height: "100%", borderLeft: `2px ${dashed ? "dashed" : "solid"} ${color}` }} />
      <div style={{ position: "absolute", top: -22, left: 0, transform: "translateX(-50%)", fontSize: 11, color, whiteSpace: "nowrap" }}>
        {label}
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 },
  headline: { margin: 0, fontSize: 25, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 20px", color: SUBTLE, fontSize: 15 },
  tabs: { display: "inline-flex", background: "#E4E4E7", borderRadius: 999, padding: 4, gap: 4, marginBottom: 24 },
  bigNumber: { fontSize: 52, fontWeight: 700, color: ACCENT, fontVariantNumeric: "tabular-nums", lineHeight: 1 },
  bigCaption: { fontSize: 14, color: SUBTLE, marginTop: 6, marginBottom: 40 },
  track: { position: "relative", height: 22, background: GRID, borderRadius: 6, border: `1px solid ${BORDER}`, marginBottom: 40 },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0, background: "rgba(234,88,12,0.25)", borderRadius: 6 },
  buttons: { display: "flex", gap: 10, flexWrap: "wrap" },
  footer: { marginTop: 20, fontSize: 12, color: MUTED },
};

function tab(active: boolean): CSSProperties {
  return {
    border: "none",
    borderRadius: 999,
    padding: "7px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    background: active ? "#fff" : "transparent",
    color: active ? ACCENT : SUBTLE,
    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
  };
}
