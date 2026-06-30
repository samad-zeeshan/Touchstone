/**
 * SVG frames for the narrated walkthroughs, one renderer per concept.
 *
 * NarratedScene calls SceneStage for each beat. cue carries that beat's parameters
 * and progress runs 0 to 1 so a frame can draw itself in. A recurring move here is
 * to plot the true value against the naive intuition so the gap is the point.
 */
import type { Beat } from "../api";
import { INK, MUTED, ACCENT, ACCENT_FILL, GREEN, RED, GRID, BORDER, PAPER, BG } from "../theme";
import { EXAMPLE, minNodes, rootValue, prunedLeaves, evaluatedCount, layout } from "./gameTreeLogic";

const W = 560;
const H = 290;

export default function SceneStage({ conceptId, cue, progress }: {
  conceptId: string;
  cue: Beat["cue"];
  progress: number;
}) {
  // Route each concept to its frame. Several concepts share a renderer when their
  // visuals are the same shape, for example every growth or decay curve.
  let inner;
  switch (conceptId) {
    case "compound-interest":
    case "exponential-decay":
    case "loan-amortization":
    case "big-o":
    case "projectile":
      inner = <CurveFrame conceptId={conceptId} cue={cue} progress={progress} />;
      break;
    case "monty-hall":
    case "birthday-paradox":
    case "hashing-collisions":
    case "base-rates":
    case "law-of-large-numbers":
      inner = <RateFrame conceptId={conceptId} cue={cue} progress={progress} />;
      break;
    case "expected-value":
      inner = <DistFrame cue={cue} />;
      break;
    case "minimax":
    case "alpha-beta":
      inner = <GameTreeFrame cue={cue} />;
      break;
    case "supply-demand":
    case "tax-incidence":
      inner = <EquilibriumFrame cue={cue} />;
      break;
    case "prisoners-dilemma":
      inner = <PayoffFrame cue={cue} />;
      break;
    case "grid-search":
      inner = <GridFrame cue={cue} />;
      break;
    case "central-limit":
      inner = <HistFrame cue={cue} />;
      break;
    case "regression-mean":
      inner = <ScatterFrame cue={cue} />;
      break;
    case "mcts":
      inner = <MctsFrame cue={cue} />;
      break;
    case "cipher":
      inner = <CipherFrame cue={cue} />;
      break;
    case "binary-search":
      inner = <BinaryFrame cue={cue} />;
      break;
    case "sorting-race":
      inner = <SortFrame cue={cue} progress={progress} />;
      break;
    case "recursion-fib":
      inner = <TreeFrame cue={cue} />;
      break;
    default:
      inner = null;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {inner}
    </svg>
  );
}

const num = (v: unknown, d: number): number => (typeof v === "number" ? v : d);

const money = (v: number) => "$" + Math.round(v).toLocaleString("en-US");

function loanBalance(P: number, r: number, T: number, year: number): number {
  const i = r / 12;
  const N = 12 * T;
  const M = (P * i) / (1 - Math.pow(1 + i, -N));
  const k = 12 * year;
  return Math.max(0, P * Math.pow(1 + i, k) - (M * (Math.pow(1 + i, k) - 1)) / i);
}

// Per concept curve pair. actual is the real formula, intuition is the naive
// straight line guess. Drawing both is how the scene shows where intuition breaks.
const CURVE: Record<string, { years: number; actual: (s: number, t: number) => number; intuition: (s: number, t: number) => number; yfmt: (v: number) => string }> = {
  "compound-interest": {
    years: 20,
    actual: (s, t) => 1000 * Math.pow(1 + s / 12, 12 * t),
    intuition: (s, t) => 1000 * (1 + s * t),
    yfmt: money,
  },
  "exponential-decay": {
    years: 30,
    actual: (s, t) => 1000 * Math.pow(0.5, t / s),
    intuition: (s, t) => 1000 * Math.max(0, 1 - t / (2 * s)),
    yfmt: (v) => `${Math.round(v)} mg`,
  },
  "loan-amortization": {
    years: 15,
    actual: (rate, year) => loanBalance(20000, rate, 15, year),
    intuition: (_rate, year) => 20000 * (1 - year / 15),
    yfmt: money,
  },
  "big-o": {
    years: 400,           
    actual: (_a, n) => n * n,
    intuition: (a, n) => a * n,
    yfmt: (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${Math.round(v)}`),
  },
  "projectile": {
    years: 95,            
    actual: (deg, x) => sceneTraj(deg, x),
    intuition: (deg, x) => sceneTraj(90 - deg, x),
    yfmt: (v) => `${Math.round(v)} m`,
  },
};

function sceneTraj(deg: number, x: number): number {
  const t = (deg * Math.PI) / 180;
  return Math.max(0, x * Math.tan(t) - (10 * x * x) / (2 * 900 * Math.cos(t) ** 2));
}

function CurveFrame({ conceptId, cue, progress }: { conceptId: string; cue: Beat["cue"]; progress: number }) {
  const cfg = CURVE[conceptId];
  const s = num(cue.slider, conceptId === "compound-interest" ? 0.06 : 5);
  const highlight = (cue.highlight as string) ?? "actual";
  const N = 100;
  const px = (t: number) => 56 + (t / cfg.years) * (W - 96);
  const ts = Array.from({ length: N + 1 }, (_, i) => (i / N) * cfg.years);
  const yMax = Math.max(...ts.map((t) => cfg.actual(s, t)), ...ts.map((t) => cfg.intuition(s, t))) * 1.05 || 1;
  const py = (v: number) => 24 + (1 - v / yMax) * (H - 70);

  // Reveal the actual curve up to progress, but draw the intuition line in full so
  // the viewer watches the real path peel away from the guess.
  const shown = Math.max(1, Math.floor(progress * N));
  const actualPts = ts.slice(0, shown + 1).map((t) => `${px(t).toFixed(1)},${py(cfg.actual(s, t)).toFixed(1)}`);
  const intuPts = ts.map((t) => `${px(t).toFixed(1)},${py(cfg.intuition(s, t)).toFixed(1)}`);
  const showWedge = highlight === "gap";
  const showEnd = highlight === "gap" || highlight === "endpoint";
  const actualDim = highlight === "intuition" ? 0.25 : 1;
  const intuEmph = highlight === "intuition" ? ACCENT : MUTED;

  return (
    <g>
      <line x1={56} y1={py(0)} x2={W - 40} y2={py(0)} stroke={GRID} />
      {showWedge && (
        <path
          d={`M ${ts.map((t) => `${px(t)},${py(cfg.actual(s, t))}`).join(" L ")} L ${[...ts].reverse().map((t) => `${px(t)},${py(cfg.intuition(s, t))}`).join(" L ")} Z`}
          fill={ACCENT_FILL}
        />
      )}
      <polyline points={intuPts.join(" ")} fill="none" stroke={intuEmph} strokeWidth={2} strokeDasharray="5 5" opacity={highlight === "actual" ? 0.45 : 1} />
      <polyline points={actualPts.join(" ")} fill="none" stroke={ACCENT} strokeWidth={3} opacity={actualDim} />
      {showEnd && progress > 0.98 && (
        <>
          <circle cx={px(cfg.years)} cy={py(cfg.actual(s, cfg.years))} r={5} fill={ACCENT} />
          <text x={px(cfg.years) - 6} y={py(cfg.actual(s, cfg.years)) - 10} textAnchor="end" fontSize="12" fontWeight={700} fill={ACCENT}>
            {cfg.yfmt(cfg.actual(s, cfg.years))}
          </text>
        </>
      )}
    </g>
  );
}

const RATE: Record<string, { trueV: number; intV: number; trueLabel: string; intLabel: string }> = {
  "monty-hall": { trueV: 2 / 3, intV: 1 / 2, trueLabel: "switch ≈ 67%", intLabel: "feels 50%" },
  "birthday-paradox": { trueV: 0.507, intV: 23 / 365, trueLabel: "actual ≈ 51%", intLabel: "feels ~6%" },
  "hashing-collisions": { trueV: 0.47, intV: 0.16, trueLabel: "actual ≈ 47%", intLabel: "feels ~16%" },
  "base-rates": { trueV: 0.155, intV: 0.9, trueLabel: "sick ≈ 16%", intLabel: "test is 90%" },
  "law-of-large-numbers": { trueV: 0.5, intV: 0.7, trueLabel: "settles at 50%", intLabel: "feels ~70%" },
};

function RateFrame({ conceptId, cue, progress }: { conceptId: string; cue: Beat["cue"]; progress: number }) {
  const cfg = RATE[conceptId];
  const settle = num(cue.settle, cfg.trueV);
  const fill = settle * progress;
  const x0 = 50;
  const x1 = W - 50;
  const span = x1 - x0;
  const at = (v: number) => x0 + v * span;
  const barY = 150;

  return (
    <g>
      <text x={W / 2} y={70} textAnchor="middle" fontSize="46" fontWeight={700} fill={ACCENT}>
        {Math.round(fill * 100)}%
      </text>
      <rect x={x0} y={barY} width={span} height={22} rx={6} fill={GRID} />
      <rect x={x0} y={barY} width={Math.max(0, fill * span)} height={22} rx={6} fill="rgba(11, 110, 97,0.3)" />
      
      <line x1={at(cfg.intV)} y1={barY - 16} x2={at(cfg.intV)} y2={barY + 38} stroke={MUTED} strokeWidth={2} strokeDasharray="4 4" />
      <text x={at(cfg.intV)} y={barY - 22} textAnchor="middle" fontSize="11" fill={MUTED}>{cfg.intLabel}</text>
      
      <line x1={at(cfg.trueV)} y1={barY - 16} x2={at(cfg.trueV)} y2={barY + 38} stroke={ACCENT} strokeWidth={2} />
      <text x={at(cfg.trueV)} y={barY + 54} textAnchor="middle" fontSize="11" fill={ACCENT}>{cfg.trueLabel}</text>
    </g>
  );
}

const BVALUES = Array.from({ length: 32 }, (_, i) => i + 1);
const TARGET = 22;

// Replay binary search up to step N and return the live window, so the frame can
// show exactly which cells are still in play at that beat.
function windowAfter(step: number) {
  let lo = 0, hi = 31, mid = -1, found = false;
  for (let i = 0; i < step && lo <= hi; i++) {
    mid = Math.floor((lo + hi) / 2);
    if (BVALUES[mid] === TARGET) { found = true; break; }
    if (BVALUES[mid] < TARGET) lo = mid + 1; else hi = mid - 1;
  }
  return { lo, hi, mid, found };
}

function BinaryFrame({ cue }: { cue: Beat["cue"] }) {
  const step = num(cue.step, 0);
  const { lo, hi, mid, found } = windowAfter(step);
  const cols = 16;
  const cw = (W - 80) / cols;
  const size = Math.min(cw - 4, 28);
  return (
    <g>
      {BVALUES.map((v, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = 40 + col * cw;
        const y = 70 + row * (size + 16);
        const inWin = step === 0 || (i >= lo && i <= hi);
        const isMid = step > 0 && i === mid;
        let bg = PAPER, fg = MUTED, stroke = GRID;
        if (inWin) { fg = INK; stroke = "#D4D4D8"; }
        if (isMid) { bg = found ? GREEN : ACCENT; fg = "#fff"; stroke = bg; }
        return (
          <g key={i}>
            <rect x={x} y={y} width={size} height={size} rx={5} fill={inWin || isMid ? bg : BG} stroke={stroke} />
            <text x={x + size / 2} y={y + size / 2 + 4} textAnchor="middle" fontSize="11" fontWeight={600} fill={fg}>{v}</text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 14} textAnchor="middle" fontSize="13" fill={INK}>
        {step === 0 ? `Searching 32 items for ${TARGET}` : found ? `Found ${TARGET} in ${step} steps` : `${Math.max(0, hi - lo + 1)} candidates left after ${step} step${step === 1 ? "" : "s"}`}
      </text>
    </g>
  );
}

function SortFrame({ cue, progress }: { cue: Beat["cue"]; progress: number }) {
  const n = num(cue.n, 256);
  const focus = (cue.focus as string) ?? "both";
  const bubble = (n * (n - 1)) / 2;
  const merge = n * Math.log2(n);
  const c = bubble * progress;
  const x0 = 50, span = W - 180;
  const bar = (y: number, frac: number, color: string, label: string, count: number, dim: boolean) => (
    <g opacity={dim ? 0.3 : 1}>
      <text x={x0} y={y - 10} fontSize="13" fontWeight={600} fill={INK}>{label}</text>
      <rect x={x0} y={y} width={span} height={20} rx={6} fill={GRID} />
      <rect x={x0} y={y} width={Math.min(span, frac * span)} height={20} rx={6} fill={color} />
      <text x={x0 + span + 12} y={y + 15} fontSize="12" fill={MUTED}>{Math.round(count).toLocaleString()}</text>
    </g>
  );
  return (
    <g>
      {bar(70, Math.min(c, merge) / bubble, GREEN, "Merge  O(n log n)", Math.min(c, merge), focus === "bubble")}
      {bar(150, c / bubble, ACCENT, "Bubble  O(n²)", c, focus === "merge")}
      <text x={W / 2} y={H - 22} textAnchor="middle" fontSize="13" fill={INK}>
        {n.toLocaleString()} items · bubble does ~{Math.round(bubble / merge).toLocaleString()}× more work
      </text>
    </g>
  );
}

interface TNode { id: number; k: number; x: number; depth: number; children: TNode[] }

function buildFib(n: number): TNode[] {
  let id = 0;
  const nodes: TNode[] = [];
  const build = (k: number, depth: number): TNode => {
    const node: TNode = { id: id++, k, x: 0, depth, children: [] };
    nodes.push(node);
    if (k > 1) node.children = [build(k - 1, depth + 1), build(k - 2, depth + 1)];
    return node;
  };
  const root = build(n, 0);
  let leaf = 0;
  const layout = (nd: TNode) => {
    if (!nd.children.length) nd.x = leaf++;
    else { nd.children.forEach(layout); nd.x = (nd.children[0].x + nd.children[nd.children.length - 1].x) / 2; }
  };
  layout(root);
  return nodes;
}

function DistFrame({ cue }: { cue: Beat["cue"] }) {
  const settle = num(cue.settle, 8);
  const min = -40, max = 80;
  const at = (v: number) => 60 + ((v - min) / (max - min)) * (W - 120);
  const y = 150;
  const tick = (v: number, label: string, color: string, dash: boolean, bold: boolean) => (
    <g>
      <line x1={at(v)} y1={y - 26} x2={at(v)} y2={y + 12} stroke={color} strokeWidth={bold ? 2.5 : 2} strokeDasharray={dash ? "4 4" : undefined} />
      <text x={at(v)} y={y - 32} textAnchor="middle" fontSize="11" fontWeight={bold ? 700 : 400} fill={color}>{label}</text>
    </g>
  );
  return (
    <g>
      <text x={W / 2} y={70} textAnchor="middle" fontSize="40" fontWeight={700} fill={ACCENT}>
        {settle < 0 ? "-$" : "$"}{Math.abs(Math.round(settle))}
      </text>
      <line x1={60} y1={y} x2={W - 60} y2={y} stroke={GRID} strokeWidth={2} />
      <text x={at(-40)} y={y + 30} textAnchor="middle" fontSize="10" fill={MUTED}>-$40</text>
      <text x={at(0)} y={y + 30} textAnchor="middle" fontSize="10" fill={MUTED}>$0</text>
      <text x={at(80)} y={y + 30} textAnchor="middle" fontSize="10" fill={MUTED}>$80</text>
      {tick(80, "best case", MUTED, true, false)}
      {tick(20, "even average", MUTED, true, false)}
      {tick(8, "EV", ACCENT, false, true)}
      <circle cx={at(settle)} cy={y} r={7} fill={GREEN} stroke="#fff" strokeWidth={2} />
    </g>
  );
}

function GameTreeFrame({ cue }: { cue: Beat["cue"] }) {
  const show = (cue.show as string) ?? "leaves";
  const grid = EXAMPLE;
  const mins = minNodes(grid);
  const root = rootValue(grid);
  const pruned = prunedLeaves(grid);
  const L = layout(W, H - 16);

  return (
    <g>
      {L.mins.map((m, i) => (
        <line key={`rm${i}`} x1={L.root.x} y1={L.root.y} x2={m.x} y2={m.y} stroke="#D4D4D8" strokeWidth={1.5} />
      ))}
      {L.leaves.map((lf) => {
        const dim = show === "prune" && pruned.has(`${lf.i},${lf.j}`);
        return <line key={`e${lf.i}${lf.j}`} x1={L.mins[lf.i].x} y1={L.mins[lf.i].y} x2={lf.x} y2={lf.y} stroke="#D4D4D8" strokeWidth={1.5} opacity={dim ? 0.2 : 1} />;
      })}
      {L.leaves.map((lf) => {
        const v = grid[lf.i][lf.j];
        const dim = show === "prune" && pruned.has(`${lf.i},${lf.j}`);
        const isMin = show === "backup" && v === mins[lf.i];
        return (
          <g key={`l${lf.i}${lf.j}`} opacity={dim ? 0.22 : 1}>
            <rect x={lf.x - 15} y={lf.y - 15} width={30} height={30} rx={6} fill={isMin ? ACCENT : "#fff"} stroke={isMin ? ACCENT : BORDER} strokeWidth={1.5} />
            <text x={lf.x} y={lf.y + 4} textAnchor="middle" fontSize="13" fontWeight={600} fill={isMin ? "#fff" : INK}>{v}</text>
          </g>
        );
      })}
      {L.mins.map((m, i) => (
        <g key={`m${i}`}>
          <polygon points={`${m.x - 15},${m.y - 12} ${m.x + 15},${m.y - 12} ${m.x},${m.y + 14}`} fill="#fff" stroke={MUTED} strokeWidth={1.5} />
          {show === "backup" && <text x={m.x} y={m.y - 1} textAnchor="middle" fontSize="11" fontWeight={700} fill={RED}>{mins[i]}</text>}
        </g>
      ))}
      <polygon points={`${L.root.x - 16},${L.root.y + 13} ${L.root.x + 16},${L.root.y + 13} ${L.root.x},${L.root.y - 13}`} fill="#fff" stroke={INK} strokeWidth={1.8} />
      {(show === "backup" || show === "prune") && (
        <text x={L.root.x} y={L.root.y + 5} textAnchor="middle" fontSize="12" fontWeight={700} fill={GREEN}>{root}</text>
      )}
      {show === "prune" && (
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="12" fill={ACCENT}>{evaluatedCount(grid)} of 9 leaves evaluated</text>
      )}
    </g>
  );
}

const EQ_BLUE = "#2563EB";
function EquilibriumFrame({ cue }: { cue: Beat["cue"] }) {
  const mode = (cue.mode as string) ?? "equilibrium";
  const hi = (cue.highlight as string) ?? "cross";
  const padL = 48, padB = 30, padT = 16, padR = 18;
  const QMAX = 100, PMAX = 56;
  const x = (q: number) => padL + (q / QMAX) * (W - padL - padR);
  const y = (p: number) => padT + (1 - p / PMAX) * (H - padT - padB);
  const dim = (on: boolean) => (on ? 1 : 0.3);

  return (
    <g>
      <line x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} stroke={MUTED} />
      <line x1={padL} y1={padT} x2={padL} y2={y(0)} stroke={MUTED} />
      <text x={W - padR} y={y(0) + 20} textAnchor="end" fontSize="10" fill={MUTED}>Quantity</text>
      <text x={padL - 6} y={padT + 6} textAnchor="end" fontSize="10" fill={MUTED}>Price</text>

      <line x1={x(0)} y1={y(33.3)} x2={x(100)} y2={y(0)} stroke={EQ_BLUE} strokeWidth={2.5} opacity={dim(hi !== "supply")} />
      <line x1={x(10)} y1={y(0)} x2={x(100)} y2={y(45)} stroke={ACCENT} strokeWidth={2.5} opacity={dim(hi !== "demand")} />

      {mode === "equilibrium" ? (
        <>
          {hi === "choke" && <>
            <circle cx={x(0)} cy={y(33.3)} r={5} fill={MUTED} />
            <text x={x(0) + 8} y={y(33.3) - 4} fontSize="11" fill={MUTED}>choke $33</text>
          </>}
          {(hi === "cross") && <>
            <circle cx={x(46)} cy={y(18)} r={6} fill={GREEN} stroke="#fff" strokeWidth={1.5} />
            <line x1={padL} y1={y(18)} x2={x(46)} y2={y(18)} stroke={GREEN} strokeDasharray="3 3" />
            <text x={padL + 6} y={y(18) - 6} fontSize="11" fontWeight={700} fill={GREEN}>P* = $18</text>
          </>}
        </>
      ) : (
        <>
          
          <line x1={x(10)} y1={y(20)} x2={x(80)} y2={y(55)} stroke={ACCENT} strokeWidth={2} strokeDasharray="5 4" />
          {(hi === "wedge" || hi === "buyer" || hi === "seller" || hi === "cross") && <>
            <line x1={x(22)} y1={y(26)} x2={x(22)} y2={y(6)} stroke={INK} strokeWidth={7} opacity={0.16} />
            <circle cx={x(22)} cy={y(26)} r={5} fill={EQ_BLUE} />
            <circle cx={x(22)} cy={y(6)} r={5} fill={ACCENT} />
            <text x={x(22) + 8} y={y(26) - 2} fontSize="11" fill={EQ_BLUE}>buyer $26</text>
            <text x={x(22) + 8} y={y(6) + 12} fontSize="11" fill={ACCENT}>seller $6</text>
          </>}
        </>
      )}
    </g>
  );
}

const PD = { R: 3, S: 0, T: 5, P: 1 };
const PD_CELL = [[[PD.R, PD.R], [PD.S, PD.T]], [[PD.T, PD.S], [PD.P, PD.P]]];
function PayoffFrame({ cue }: { cue: Beat["cue"] }) {
  const hi = (cue.highlight as string) ?? "none";
  const x0 = 150, y0 = 70, cw = 150, ch = 80;
  const bg = (you: number, them: number): string => {
    if (hi === "nash" && you === 1 && them === 1) return "rgba(22,163,74,0.18)";
    if (hi === "reward" && you === 0 && them === 0) return "rgba(37,99,235,0.14)";
    if (hi === "temptation" && you === 1 && them === 0) return "rgba(11, 110, 97,0.16)";
    if (hi === "defect-row" && you === 1) return "rgba(11, 110, 97,0.12)";
    return PAPER;
  };
  return (
    <g>
      <text x={x0 + cw} y={y0 - 22} textAnchor="middle" fontSize="12" fill={MUTED}>They cooperate</text>
      <text x={x0 + cw * 2} y={y0 - 22} textAnchor="middle" fontSize="12" fill={MUTED}>They defect</text>
      <text x={x0 - 12} y={y0 + ch / 2 + 4} textAnchor="end" fontSize="12" fill={MUTED}>You coop.</text>
      <text x={x0 - 12} y={y0 + ch + ch / 2 + 4} textAnchor="end" fontSize="12" fill={MUTED}>You defect</text>
      {[0, 1].map((you) => [0, 1].map((them) => {
        const [mine, theirs] = PD_CELL[you][them];
        return (
          <g key={`${you}${them}`}>
            <rect x={x0 + them * cw} y={y0 + you * ch} width={cw - 8} height={ch - 8} rx={10} fill={bg(you, them)} stroke={BORDER} strokeWidth={1.5} />
            <text x={x0 + them * cw + (cw - 8) / 2} y={y0 + you * ch + ch / 2} textAnchor="middle" fontSize="20" fontWeight={700} fill={ACCENT}>
              {mine}<tspan fill={MUTED} fontWeight={400}>, {theirs}</tspan>
            </text>
          </g>
        );
      }))}
    </g>
  );
}

const G_COLS = 15, G_ROWS = 9, G_START = { x: 2, y: 6 }, G_GOAL = { x: 11, y: 1 };
const gMan = (x: number, y: number) => Math.abs(x - G_START.x) + Math.abs(y - G_START.y);
function GridFrame({ cue }: { cue: Beat["cue"] }) {
  const radius = num(cue.radius, 12);
  const hi = (cue.highlight as string) ?? "flood";
  const cell = Math.min((W - 40) / G_COLS, (H - 30) / G_ROWS);
  const ox = (W - cell * G_COLS) / 2, oy = 12;
  const cx = (x: number) => ox + x * cell, cy = (y: number) => oy + y * cell;
  const path: { x: number; y: number }[] = [];
  for (let x = G_START.x; x <= G_GOAL.x; x++) path.push({ x, y: G_START.y });
  for (let y = G_START.y - 1; y >= G_GOAL.y; y--) path.push({ x: G_GOAL.x, y });
  const cells = [];
  for (let y = 0; y < G_ROWS; y++) for (let x = 0; x < G_COLS; x++) {
    const d = gMan(x, y), on = d <= radius;
    cells.push(<rect key={`${x},${y}`} x={cx(x) + 1} y={cy(y) + 1} width={cell - 2} height={cell - 2} rx={3}
      fill={on ? `rgba(11, 110, 97,${0.12 + Math.max(0, 1 - d / 14) * 0.45})` : GRID} stroke={GRID} strokeWidth={0.5} />);
  }
  return (
    <g>
      {cells}
      {hi === "path" && path.map((c, i) => (
        <rect key={`p${i}`} x={cx(c.x) + 1} y={cy(c.y) + 1} width={cell - 2} height={cell - 2} rx={3} fill="none" stroke={GREEN} strokeWidth={2.5} />
      ))}
      {hi === "diagonal" && (
        <line x1={cx(G_START.x) + cell / 2} y1={cy(G_START.y) + cell / 2} x2={cx(G_GOAL.x) + cell / 2} y2={cy(G_GOAL.y) + cell / 2} stroke={MUTED} strokeWidth={2} strokeDasharray="5 4" />
      )}
      <circle cx={cx(G_START.x) + cell / 2} cy={cy(G_START.y) + cell / 2} r={cell / 3} fill={INK} />
      <circle cx={cx(G_GOAL.x) + cell / 2} cy={cy(G_GOAL.y) + cell / 2} r={cell / 3} fill={GREEN} />
    </g>
  );
}

function HistFrame({ cue }: { cue: Beat["cue"] }) {
  const n = num(cue.n, 1);
  const sd = Math.sqrt(35 / 12) / Math.sqrt(n);
  const x0 = 60, x1 = W - 60, base = H - 40, top = 28;
  const sx = (v: number) => x0 + ((v - 1) / 5) * (x1 - x0);
  const peak = 1 / (sd * Math.sqrt(2 * Math.PI));
  const pts = Array.from({ length: 81 }, (_, i) => {
    const v = 1 + (i / 80) * 5;
    const y = Math.exp(-((v - 3.5) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));
    return `${sx(v).toFixed(1)},${(base - (y / peak) * (base - top)).toFixed(1)}`;
  });
  return (
    <g>
      <line x1={x0} y1={base} x2={x1} y2={base} stroke={MUTED} />
      {[1, 2, 3, 4, 5, 6].map((v) => <text key={v} x={sx(v)} y={base + 16} textAnchor="middle" fontSize="10" fill={MUTED}>{v}</text>)}
      <polygon points={`${sx(1)},${base} ${pts.join(" ")} ${sx(6)},${base}`} fill={ACCENT_FILL} />
      <polyline points={pts.join(" ")} fill="none" stroke={ACCENT} strokeWidth={2.5} />
      <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fill={MUTED}>average of {n} {n === 1 ? "die" : "dice"}</text>
    </g>
  );
}

function ScatterFrame({ cue }: { cue: Beat["cue"] }) {
  const hi = (cue.highlight as string) ?? "cloud";
  const pad = 40, lo = 60, high = 140;
  const sx = (v: number) => pad + ((v - lo) / (high - lo)) * (W - pad * 2);
  const sy = (v: number) => H - 28 - ((v - lo) / (high - lo)) * (H - 56);
  let seed = 999;
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const g = (s: number) => (rand() + rand() + rand() - 1.5) * 2 * s;
  const pts = Array.from({ length: 36 }, () => { const l = 100 + (rand() - 0.5) * 50; return { test: l + g(9), retest: l + g(9) }; });
  let top = 0; pts.forEach((p, i) => { if (p.test > pts[top].test) top = i; });
  const slope = 0.6;
  return (
    <g>
      <line x1={pad} y1={H - 28} x2={W - pad} y2={H - 28} stroke={MUTED} />
      <line x1={pad} y1={28} x2={pad} y2={H - 28} stroke={MUTED} />
      <line x1={sx(lo)} y1={sy(lo)} x2={sx(high)} y2={sy(high)} stroke={MUTED} strokeWidth={1.5} strokeDasharray="5 4" />
      <line x1={sx(lo)} y1={sy(100 + slope * (lo - 100))} x2={sx(high)} y2={sy(100 + slope * (high - 100))} stroke={ACCENT} strokeWidth={2.5} />
      {pts.map((p, i) => (
        <circle key={i} cx={sx(p.test)} cy={sy(p.retest)} r={(hi !== "cloud") && i === top ? 6 : 3.5}
          fill={(hi !== "cloud") && i === top ? GREEN : "rgba(37,99,235,0.5)"} />
      ))}
      {hi === "regress" && (
        <line x1={sx(pts[top].test)} y1={sy(pts[top].test)} x2={sx(pts[top].test)} y2={sy(pts[top].retest)} stroke={GREEN} strokeWidth={1.5} strokeDasharray="3 3" />
      )}
    </g>
  );
}

const MCTS_KIDS = [{ label: "A", w: 20, n: 25 }, { label: "B", w: 6, n: 8 }, { label: "C", w: 2, n: 3 }, { label: "D", w: 10, n: 21 }];
const MCTS_N = MCTS_KIDS.reduce((s, k) => s + k.n, 0);
function MctsFrame({ cue }: { cue: Beat["cue"] }) {
  const ucb = (cue.mode as string) === "ucb";
  const rows = MCTS_KIDS.map((k) => {
    const exploit = k.w / k.n;
    const explore = ucb ? Math.SQRT2 * Math.sqrt(Math.log(MCTS_N) / k.n) : 0;
    return { ...k, exploit, explore, total: exploit + explore };
  });
  const max = Math.max(...rows.map((r) => r.total));
  const pick = rows.reduce((a, b) => (b.total > a.total ? b : a));
  const barX = 70, barW = W - barX - 120, rowH = 56;
  return (
    <g>
      {rows.map((r, i) => {
        const y = 24 + i * rowH;
        const ew = (r.exploit / max) * barW;
        const xw = (r.explore / max) * barW;
        const sel = r.label === pick.label;
        return (
          <g key={r.label}>
            <text x={26} y={y + 24} fontSize="15" fontWeight={700} fill={sel ? GREEN : INK}>{r.label}</text>
            <text x={26} y={y + 38} fontSize="10" fill={MUTED}>{r.w}/{r.n}</text>
            <rect x={barX} y={y + 8} width={barW} height={28} rx={5} fill={GRID} stroke={BORDER} strokeWidth={0.5} />
            <rect x={barX} y={y + 8} width={ew} height={28} rx={5} fill={ACCENT} />
            <rect x={barX + ew} y={y + 8} width={xw} height={28} fill="rgba(11, 110, 97,0.3)" />
            <text x={barX + barW + 12} y={y + 27} fontSize="14" fontWeight={sel ? 700 : 400} fill={sel ? GREEN : MUTED}>{r.total.toFixed(2)}{sel ? " ←" : ""}</text>
          </g>
        );
      })}
    </g>
  );
}

const C_ENGLISH = [8.2, 1.5, 2.8, 4.3, 12.7, 2.2, 2.0, 6.1, 7.0, 0.15, 0.77, 4.0, 2.4, 6.7, 7.5, 1.9, 0.095, 6.0, 6.3, 9.1, 2.8, 0.98, 2.4, 0.15, 2.0, 0.074];
const C_SECRET = 7;
function CipherFrame({ cue }: { cue: Beat["cue"] }) {
  const g = num(cue.shift, 0);
  const decoded = C_ENGLISH.map((_, p) => C_ENGLISH[(p + g - C_SECRET + 26) % 26]);
  const aligned = g === C_SECRET;
  const pad = 36, base = H - 30, max = Math.max(...C_ENGLISH);
  const bw = (W - pad * 2) / 26;
  const yOf = (v: number) => base - (v / max) * (H - 70);
  return (
    <g>
      <line x1={pad} y1={base} x2={W - pad} y2={base} stroke={MUTED} />
      <polyline points={C_ENGLISH.map((v, i) => `${pad + i * bw + bw / 2},${yOf(v)}`).join(" ")} fill="none" stroke={MUTED} strokeWidth={1.5} strokeDasharray="3 3" />
      {decoded.map((v, i) => (
        <rect key={i} x={pad + i * bw + 1} y={yOf(v)} width={bw - 2} height={base - yOf(v)} rx={1.5} fill={aligned ? GREEN : ACCENT} opacity={0.8} />
      ))}
      {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((ch, i) => (
        <text key={ch} x={pad + i * bw + bw / 2} y={base + 14} textAnchor="middle" fontSize="8" fill={i === 4 ? INK : MUTED} fontWeight={i === 4 ? 700 : 400}>{ch}</text>
      ))}
      <text x={W / 2} y={16} textAnchor="middle" fontSize="12" fill={aligned ? GREEN : MUTED}>{aligned ? "aligned with English - shift 7" : `shift guess: ${g}`}</text>
    </g>
  );
}

function TreeFrame({ cue }: { cue: Beat["cue"] }) {
  const n = num(cue.n, 5);
  const memo = cue.memo === true;
  const nodes = buildFib(n);
  const firstOf = new Map<number, number>();
  for (const nd of nodes) if (!firstOf.has(nd.k)) firstOf.set(nd.k, nd.id);
  const leaves = Math.max(...nodes.map((nd) => nd.x)) + 1;
  const maxDepth = Math.max(...nodes.map((nd) => nd.depth));
  const colW = (W - 60) / leaves;
  const rowH = (H - 60) / (maxDepth + 1);
  const cx = (nd: TNode) => 30 + nd.x * colW + colW / 2;
  const cy = (nd: TNode) => 24 + nd.depth * rowH + rowH / 2;
  const real = (nd: TNode) => firstOf.get(nd.k) === nd.id;
  const edges: [TNode, TNode][] = [];
  for (const nd of nodes) for (const ch of nd.children) edges.push([nd, ch]);

  return (
    <g>
      {edges.map(([a, b], i) => (
        <line key={i} x1={cx(a)} y1={cy(a)} x2={cx(b)} y2={cy(b)} stroke="#D4D4D8" strokeWidth={1.5} opacity={memo && !real(b) ? 0.15 : 1} />
      ))}
      {nodes.map((nd) => {
        const dim = memo && !real(nd);
        const color = nd.k <= 1 ? GREEN : ACCENT;
        return (
          <g key={nd.id} opacity={dim ? 0.18 : 1}>
            <circle cx={cx(nd)} cy={cy(nd)} r={15} fill="#fff" stroke={color} strokeWidth={2} />
            <text x={cx(nd)} y={cy(nd) + 4} textAnchor="middle" fontSize="11" fontWeight={600} fill={color}>{nd.k}</text>
          </g>
        );
      })}
    </g>
  );
}
