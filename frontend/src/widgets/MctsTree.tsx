/**
 * UCB1 selection across four fixed child moves.
 *
 * The point of the demo is that the exploration bonus can outvote raw win rate, so
 * dragging C changes which child gets picked.
 */
import { useState, type ChangeEvent, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, GRID, BORDER } from "../theme";
import Pseudocode from "./Pseudocode";

const CODE = [
  "for each child move:",
  "  exploit = wins / visits",
  "  explore = C · √(ln N / visits)",
  "  score = exploit + explore",
  "play the child with the highest score",
];
const CHILDREN = [
  { label: "A", w: 20, n: 25 },
  { label: "B", w: 6, n: 8 },
  { label: "C", w: 2, n: 3 },
  { label: "D", w: 10, n: 21 },
];
const N = CHILDREN.reduce((s, c) => s + c.n, 0);

export default function MctsTree() {
  const [c, setC] = useState(1.41);

  const rows = CHILDREN.map((ch) => {
    // UCB1: exploit is the measured win rate, explore is a bonus that grows for
    // moves tried fewer times. Their sum is the score we actually rank on.
    const exploit = ch.w / ch.n;
    const explore = c * Math.sqrt(Math.log(N) / ch.n);
    return { ...ch, exploit, explore, ucb: exploit + explore };
  });
  const maxUcb = Math.max(...rows.map((r) => r.ucb));
  // pick is what UCB1 chooses, greedy is what pure win rate would. Showing both
  // is the whole lesson when they disagree.
  const pick = rows.reduce((a, b) => (b.ucb > a.ucb ? b : a));
  const greedy = rows.reduce((a, b) => (b.exploit > a.exploit ? b : a));

  const W = 540, rowH = 46, barX = 70, barW = W - barX - 110;

  return (
    <div style={{ width: "100%" }}>
      <div style={S.eyebrow}>Monte Carlo Tree Search</div>
      <h1 style={S.headline}>Not greedy - deliberately curious.</h1>
      <p style={S.sub}>UCB1 = win rate + an exploration bonus that rewards the moves tried least. Drag the exploration constant and watch the choice change.</p>

      <svg viewBox={`0 0 ${W} ${rows.length * rowH + 10}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {rows.map((r, i) => {
          const y = i * rowH + 8;
          const ew = (r.exploit / maxUcb) * barW;
          const xw = (r.explore / maxUcb) * barW;
          const selected = r.label === pick.label;
          return (
            <g key={r.label}>
              <text x={20} y={y + 22} fontSize="14" fontWeight={700} fill={selected ? GREEN : INK}>{r.label}</text>
              <text x={20} y={y + 36} fontSize="10" fill={MUTED}>{r.w}/{r.n}</text>
              <rect x={barX} y={y + 6} width={barW} height={26} rx={5} fill={GRID} stroke={BORDER} strokeWidth={0.5} />
              <rect x={barX} y={y + 6} width={ew} height={26} rx={5} fill={ACCENT} />
              <rect x={barX + ew} y={y + 6} width={xw} height={26} fill="rgba(234,88,12,0.3)" />
              <text x={barX + barW + 10} y={y + 23} fontSize="13" fontWeight={selected ? 700 : 400} fill={selected ? GREEN : SUBTLE}>
                {r.ucb.toFixed(2)}{selected ? " ←" : ""}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={S.legend}>
        <span style={S.item}><span style={{ ...S.sw, background: ACCENT }} /> win rate</span>
        <span style={S.item}><span style={{ ...S.sw, background: "rgba(234,88,12,0.3)" }} /> exploration bonus</span>
      </div>

      <div style={S.controlRow}>
        <span style={S.controlLabel}>Exploration constant (C)</span>
        <span style={S.controlValue}>{c.toFixed(2)}</span>
      </div>
      <input type="range" min={0} max={2} step={0.01} value={c} onChange={(e: ChangeEvent<HTMLInputElement>) => setC(Number(e.target.value))} style={{ width: "100%", accentColor: ACCENT }} />

      <div style={S.readout}>
        Greedy would pick <strong>{greedy.label}</strong> (best win rate). UCB1 picks <strong style={{ color: GREEN }}>{pick.label}</strong>
        {pick.label !== greedy.label ? <> - exploring a move it has only tried {pick.n} times.</> : <> - here exploration doesn't change the choice.</>}
      </div>

      <div style={{ maxWidth: 360, marginTop: 18 }}>
        <Pseudocode title="The selection rule (UCB1)" lines={CODE} active={4} />
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 },
  headline: { margin: 0, fontSize: 25, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 18px", color: SUBTLE, fontSize: 15, lineHeight: 1.5 },
  legend: { display: "flex", gap: 18, fontSize: 13, color: "#3F3F46", margin: "8px 0 14px" },
  item: { display: "inline-flex", alignItems: "center", gap: 7 },
  sw: { width: 18, height: 10, borderRadius: 3, display: "inline-block" },
  controlRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "8px 0 8px" },
  controlLabel: { fontSize: 14, color: SUBTLE },
  controlValue: { fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: INK },
  readout: { marginTop: 16, fontSize: 16, lineHeight: 1.5, color: INK },
};
