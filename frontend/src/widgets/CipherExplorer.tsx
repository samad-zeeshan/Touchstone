import { useState, type ChangeEvent, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GREEN } from "../theme";
import Pseudocode from "./Pseudocode";

const CODE = [
  "count each letter in the ciphertext",
  "find the most common letter",
  "assume it stands for 'E'",
  "shift = (that letter − E) mod 26",
  "decode every letter by that shift",
];
const ENGLISH = [
  8.2, 1.5, 2.8, 4.3, 12.7, 2.2, 2.0, 6.1, 7.0, 0.15, 0.77, 4.0, 2.4,
  6.7, 7.5, 1.9, 0.095, 6.0, 6.3, 9.1, 2.8, 0.98, 2.4, 0.15, 2.0, 0.074,
];
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SECRET = 7; 
const cipherFreq = (c: number) => ENGLISH[(c - SECRET + 26) % 26];

export default function CipherExplorer() {
  const [g, setG] = useState(0); 

  const decoded = ENGLISH.map((_, p) => cipherFreq((p + g) % 26));
  const aligned = g === SECRET;
  const topCipher = ALPHA[(4 + SECRET) % 26]; 

  const W = 540, H = 170, pad = 28;
  const max = Math.max(...ENGLISH);
  const bw = (W - pad * 2) / 26;
  const yOf = (v: number) => H - 24 - (v / max) * (H - 44);

  return (
    <div style={{ width: "100%" }}>
      <div style={S.eyebrow}>Frequency analysis</div>
      <h1 style={S.headline}>A cipher hides less than you think.</h1>
      <p style={S.sub}>The bars are the message's letter frequencies, decoded under your guessed shift. Slide it until they snap onto the English profile (the outline).</p>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <line x1={pad} y1={H - 24} x2={W - pad} y2={H - 24} stroke={MUTED} />
        
        <polyline
          points={ENGLISH.map((v, i) => `${pad + i * bw + bw / 2},${yOf(v)}`).join(" ")}
          fill="none" stroke={MUTED} strokeWidth={1.5} strokeDasharray="3 3"
        />
        {decoded.map((v, i) => (
          <rect key={i} x={pad + i * bw + 1} y={yOf(v)} width={bw - 2} height={H - 24 - yOf(v)} rx={1.5}
            fill={aligned ? GREEN : ACCENT} opacity={0.8} />
        ))}
        {ALPHA.split("").map((ch, i) => (
          <text key={ch} x={pad + i * bw + bw / 2} y={H - 12} textAnchor="middle" fontSize="8" fill={i === 4 ? INK : MUTED} fontWeight={i === 4 ? 700 : 400}>{ch}</text>
        ))}
      </svg>

      <div style={S.controlRow}>
        <span style={S.controlLabel}>Guessed shift</span>
        <span style={S.controlValue}>{g}</span>
      </div>
      <input type="range" min={0} max={25} step={1} value={g} onChange={(e: ChangeEvent<HTMLInputElement>) => setG(Number(e.target.value))} style={{ width: "100%", accentColor: ACCENT }} />

      <div style={S.readout}>
        {aligned ? (
          <><strong style={{ color: GREEN }}>Decoded.</strong> The bars match English - the shift was <strong>{SECRET}</strong>, recovered just from frequencies.</>
        ) : (
          <>The tallest bar is '{topCipher}'. Align it to <strong>E</strong> (shift {SECRET}) and the whole profile snaps into place.</>
        )}
      </div>

      <div style={{ maxWidth: 360, marginTop: 18 }}>
        <Pseudocode title="The attack" lines={CODE} active={aligned ? 4 : 2} />
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 },
  headline: { margin: 0, fontSize: 25, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 18px", color: SUBTLE, fontSize: 15, lineHeight: 1.5 },
  controlRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "12px 0 8px" },
  controlLabel: { fontSize: 14, color: SUBTLE },
  controlValue: { fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: INK },
  readout: { marginTop: 16, fontSize: 16, lineHeight: 1.5, color: INK },
};
