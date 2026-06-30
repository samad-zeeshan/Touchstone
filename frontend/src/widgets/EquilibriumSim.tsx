import { useState, type ChangeEvent, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GREEN } from "../theme";

const A = 100; 
const C = 10;  
const D = 2;   
const BLUE = "#2563EB";

const W = 560, H = 320;
const PAD = { l: 52, r: 20, t: 18, b: 40 };
const QMAX = 100, PMAX = 52;
const px = (q: number) => PAD.l + (q / QMAX) * (W - PAD.l - PAD.r);
const py = (p: number) => PAD.t + (1 - p / PMAX) * (H - PAD.t - PAD.b);
const money = (v: number) => "$" + Math.round(v);

export default function EquilibriumSim({ mode }: { mode: "equilibrium" | "tax" }) {
  const [b, setB] = useState(3);     
  const [tax, setTax] = useState(mode === "tax" ? 20 : 0);

  const p0 = (A - C) / (b + D);
  const q0 = A - b * p0;
  const choke = A / b;
  const buyerBurden = (D * tax) / (b + D);
  const sellerBurden = tax - buyerBurden;
  const pBuyer = p0 + buyerBurden;
  const pSeller = pBuyer - tax;
  const qTax = A - b * pBuyer;

  const demand = [[0, A / b], [A, 0]] as const;        
  const supply = [[C, 0], [A, (A - C) / D]] as const;   
  const supplyTax = [[C, tax], [A, (A - C) / D + tax]] as const;

  return (
    <div style={{ width: "100%" }}>
      <div style={S.eyebrow}>{mode === "equilibrium" ? "Supply & demand" : "Tax incidence"}</div>
      <h1 style={S.headline}>
        {mode === "equilibrium" ? "The market clears where the curves cross." : "Who writes the cheque isn't who pays."}
      </h1>
      <p style={S.sub}>
        {mode === "equilibrium"
          ? "Drag demand's slope. The clearing price sits where supply meets demand - always below the choke price."
          : "Add a per-unit tax. It opens a wedge between what buyers pay and sellers keep; the steeper side bears more."}
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        
        <line x1={PAD.l} y1={py(0)} x2={W - PAD.r} y2={py(0)} stroke={MUTED} />
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={py(0)} stroke={MUTED} />
        <text x={W - PAD.r} y={py(0) + 24} textAnchor="end" fontSize="11" fill={MUTED}>Quantity →</text>
        <text x={PAD.l - 8} y={PAD.t + 4} textAnchor="end" fontSize="11" fill={MUTED}>Price</text>

        <line x1={px(demand[0][0])} y1={py(demand[0][1])} x2={px(demand[1][0])} y2={py(demand[1][1])} stroke={BLUE} strokeWidth={2.5} />
        
        <line x1={px(supply[0][0])} y1={py(supply[0][1])} x2={px(supply[1][0])} y2={py(supply[1][1])} stroke={ACCENT} strokeWidth={2.5} />

        {mode === "equilibrium" ? (
          <>
            <circle cx={px(q0)} cy={py(p0)} r={6} fill={GREEN} stroke="#fff" strokeWidth={1.5} />
            <line x1={PAD.l} y1={py(p0)} x2={px(q0)} y2={py(p0)} stroke={GREEN} strokeDasharray="3 3" />
            <text x={PAD.l + 6} y={py(p0) - 6} fontSize="11" fill={GREEN}>P* = {money(p0)}</text>
            <circle cx={px(0)} cy={py(choke)} r={4} fill={MUTED} />
            <text x={px(0) + 8} y={py(choke) - 4} fontSize="11" fill={MUTED}>choke {money(choke)}</text>
          </>
        ) : (
          <>
            
            <line x1={px(supplyTax[0][0])} y1={py(supplyTax[0][1])} x2={px(supplyTax[1][0])} y2={py(supplyTax[1][1])} stroke={ACCENT} strokeWidth={2} strokeDasharray="5 4" />
            
            <line x1={px(qTax)} y1={py(pBuyer)} x2={px(qTax)} y2={py(pSeller)} stroke={INK} strokeWidth={6} opacity={0.18} />
            <circle cx={px(qTax)} cy={py(pBuyer)} r={5} fill={BLUE} />
            <circle cx={px(qTax)} cy={py(pSeller)} r={5} fill={ACCENT} />
            <text x={px(qTax) + 8} y={py(pBuyer) - 2} fontSize="11" fill={BLUE}>buyer {money(pBuyer)}</text>
            <text x={px(qTax) + 8} y={py(pSeller) + 12} fontSize="11" fill={ACCENT}>seller {money(pSeller)}</text>
          </>
        )}
      </svg>

      <div style={S.legend}>
        <span style={S.item}><span style={{ ...S.sw, background: BLUE }} /> Demand</span>
        <span style={S.item}><span style={{ ...S.sw, background: ACCENT }} /> Supply</span>
        {mode === "tax" && <span style={S.item}><span style={{ ...S.sw, background: ACCENT, opacity: 0.5 }} /> Supply + tax</span>}
      </div>

      {mode === "equilibrium" ? (
        <>
          <Control label="Demand slope (b)" value={b.toString()} />
          <input type="range" min={2} max={6} step={1} value={b} onChange={(e: ChangeEvent<HTMLInputElement>) => setB(Number(e.target.value))} style={S.range} />
          <div style={S.readout}>
            Market clears at <strong style={{ color: GREEN }}>{money(p0)}</strong> (quantity {Math.round(q0)}). The choke price is a higher {money(choke)} - the market never reaches it.
          </div>
        </>
      ) : (
        <>
          <Control label="Demand slope (b)" value={b.toString()} />
          <input type="range" min={2} max={6} step={1} value={b} onChange={(e: ChangeEvent<HTMLInputElement>) => setB(Number(e.target.value))} style={S.range} />
          <div style={S.readout}>
            A {money(tax)} tax: buyers pay <strong style={{ color: BLUE }}>{money(buyerBurden)}</strong> more, sellers keep <strong style={{ color: ACCENT }}>{money(sellerBurden)}</strong> less.{" "}
            {buyerBurden > sellerBurden ? "Inelastic demand → buyers bear more." : "Elastic demand → sellers bear more."}
          </div>
          <div style={S.buttons}>
            <button onClick={() => setTax((t) => (t === 0 ? 20 : 0))} className={tax ? "btn btn-secondary" : "btn btn-primary"}>{tax ? "Remove tax" : "Add $20 tax"}</button>
          </div>
        </>
      )}
    </div>
  );
}

function Control({ label, value }: { label: string; value: string }) {
  return (
    <div style={S.controlRow}>
      <span style={S.controlLabel}>{label}</span>
      <span style={S.controlValue}>{value}</span>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 },
  headline: { margin: 0, fontSize: 25, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 18px", color: SUBTLE, fontSize: 15, lineHeight: 1.5 },
  legend: { display: "flex", gap: 18, fontSize: 13, color: "#3F3F46", margin: "10px 0 14px" },
  item: { display: "inline-flex", alignItems: "center", gap: 7 },
  sw: { width: 18, height: 3, borderRadius: 2, display: "inline-block" },
  controlRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
  controlLabel: { fontSize: 14, color: SUBTLE },
  controlValue: { fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: INK },
  range: { width: "100%", accentColor: ACCENT },
  readout: { marginTop: 18, fontSize: 16, lineHeight: 1.5, color: INK },
  buttons: { display: "flex", gap: 10, marginTop: 16 },
};
