import { useState, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, BORDER, primaryBtn, secondaryBtn } from "../theme";

const REWARD = 3, SUCKER = 0, TEMPT = 5, PUNISH = 1;

const CELL = [
  [[REWARD, REWARD], [SUCKER, TEMPT]],
  [[TEMPT, SUCKER], [PUNISH, PUNISH]],
];

export default function PayoffMatrix() {
  const [step, setStep] = useState(0); 

  const highlight = (you: number, them: number): string => {
    if (step >= 2 && you === 1 && them === 1) return "rgba(22,163,74,0.16)";   
    if (step >= 1 && you === 1) return "rgba(11, 110, 97,0.12)";                  
    return "#fff";
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={S.eyebrow}>Prisoner's dilemma</div>
      <h1 style={S.headline}>Two rational players both lose.</h1>
      <p style={S.sub}>Each scores higher by defecting no matter what the other does - so both do, and both end up worse than if they'd cooperated.</p>

      <div style={S.grid}>
        <div style={S.corner} />
        <div style={{ ...S.colHead }}>They cooperate</div>
        <div style={{ ...S.colHead }}>They defect</div>

        <div style={S.rowHead}>You cooperate</div>
        {[0, 1].map((them) => (
          <Cell key={`c${them}`} you={0} them={them} bg={highlight(0, them)} />
        ))}

        <div style={S.rowHead}>You defect</div>
        {[0, 1].map((them) => (
          <Cell key={`d${them}`} you={1} them={them} bg={highlight(1, them)} />
        ))}
      </div>

      <div style={S.note}>Each cell shows <strong>(your score, their score)</strong>.</div>

      <div style={S.readout}>
        {step === 0 && <>Step through to see why cooperation collapses.</>}
        {step === 1 && (
          <>Whatever they do, defecting scores more for you ({TEMPT} &gt; {REWARD} if they cooperate, {PUNISH} &gt; {SUCKER} if they defect). Defecting <strong>dominates</strong>.</>
        )}
        {step === 2 && (
          <>Both reason identically, so both defect and score <strong style={{ color: GREEN }}>{PUNISH}</strong> each - worse than the <strong>{REWARD}</strong> they'd get by cooperating. That's the Nash equilibrium.</>
        )}
      </div>

      <div style={S.buttons}>
        <button onClick={() => setStep((s) => Math.min(2, s + 1))} disabled={step >= 2} style={step >= 2 ? secondaryBtn : primaryBtn}>
          {step === 0 ? "Show dominant strategy" : step === 1 ? "Show the outcome" : "Done"}
        </button>
        <button onClick={() => setStep(0)} style={secondaryBtn}>Reset</button>
      </div>
    </div>
  );
}

function Cell({ you, them, bg }: { you: number; them: number; bg: string }) {
  const [mine, theirs] = CELL[you][them];
  return (
    <div style={{ ...S.cell, background: bg }}>
      <span style={{ fontWeight: 700, color: ACCENT }}>{mine}</span>
      <span style={{ color: MUTED }}>, {theirs}</span>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 },
  headline: { margin: 0, fontSize: 25, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 22px", color: SUBTLE, fontSize: 15, lineHeight: 1.5 },
  grid: { display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 6, maxWidth: 460 },
  corner: {},
  colHead: { textAlign: "center", fontSize: 13, fontWeight: 600, color: SUBTLE, alignSelf: "end", paddingBottom: 4 },
  rowHead: { display: "flex", alignItems: "center", fontSize: 13, fontWeight: 600, color: SUBTLE },
  cell: { border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 0", textAlign: "center", fontSize: 22, fontVariantNumeric: "tabular-nums", transition: "background 0.2s" },
  note: { marginTop: 12, fontSize: 13, color: MUTED },
  readout: { marginTop: 16, fontSize: 16, lineHeight: 1.5, color: INK },
  buttons: { display: "flex", gap: 10, marginTop: 18 },
};
