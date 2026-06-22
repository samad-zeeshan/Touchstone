/**
 * The naive fib(n) call tree, with a memoize toggle that dims repeat calls.
 *
 * Builds the full recursion tree so the duplicated work is visible, then marks the
 * first computation of each value as the only one memoization would keep.
 */
import { useMemo, useState, type ChangeEvent, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, primaryBtn, secondaryBtn } from "../theme";
import Pseudocode from "./Pseudocode";

const CODE = [
  "fib(k):",
  "  if k ≤ 1: return k",
  "  return fib(k−1) + fib(k−2)",
];

interface Node {
  id: number;
  k: number;
  children: Node[];
  x: number;
  depth: number;
}

function buildTree(n: number): { root: Node; nodes: Node[] } {
  let id = 0;
  const nodes: Node[] = [];
  const build = (k: number, depth: number): Node => {
    const node: Node = { id: id++, k, children: [], x: 0, depth };
    nodes.push(node);
    if (k > 1) node.children = [build(k - 1, depth + 1), build(k - 2, depth + 1)];
    return node;
  };
  const root = build(n, 0);
  
  // Tidy tree placement: leaves get the next free column left to right, parents
  // center over their span of children.
  let leaf = 0;
  const layout = (node: Node) => {
    if (node.children.length === 0) {
      node.x = leaf++;
    } else {
      node.children.forEach(layout);
      node.x = (node.children[0].x + node.children[node.children.length - 1].x) / 2;
    }
  };
  layout(root);
  return { root, nodes };
}

export default function CallTree() {
  const [n, setN] = useState<number>(5);
  const [memoized, setMemoized] = useState<boolean>(false);

  const { nodes, firstOf, leaves, maxDepth, totalCalls, unique } = useMemo(() => {
    const { nodes } = buildTree(n);
    
    // Record the id of the first node to compute each k. In memoize mode only
    // these stay lit, every later recomputation of the same k is dimmed.
    const firstOf = new Map<number, number>();
    for (const node of nodes) if (!firstOf.has(node.k)) firstOf.set(node.k, node.id);
    const leaves = Math.max(1, ...nodes.map((nd) => nd.x)) + 1;
    const maxDepth = Math.max(...nodes.map((nd) => nd.depth));
    const unique = firstOf.size;
    return { nodes, firstOf, leaves, maxDepth, totalCalls: nodes.length, unique };
  }, [n]);

  const COL = 64;
  const ROW = 60;
  const R = 17;
  const W = leaves * COL;
  const H = (maxDepth + 1) * ROW;
  const cx = (node: Node) => node.x * COL + COL / 2;
  const cy = (node: Node) => node.depth * ROW + ROW / 2;

  const edges: { from: Node; to: Node }[] = [];
  for (const node of nodes) for (const ch of node.children) edges.push({ from: node, to: ch });

  const isReal = (node: Node) => firstOf.get(node.k) === node.id;

  return (
    <div style={{ width: "100%" }}>
      <div style={S.eyebrow}>Recursion & the call stack</div>
      <h1 style={S.headline}>Naive recursion does the same work over and over.</h1>
      <p style={S.sub}>
        Every node is a call to <code>fib</code>. Flip memoize to dim the repeats and see what's actually needed.
      </p>

      <div style={{ maxWidth: 320, marginBottom: 18 }}>
        <Pseudocode
          title="The definition"
          lines={CODE}
          active={2}
          accent={memoized ? GREEN : ACCENT}
          accentFill={memoized ? "rgba(22,163,74,0.10)" : "rgba(234,88,12,0.10)"}
        />
      </div>

      <div style={S.scroll}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }}>
          {edges.map((e, i) => (
            <line
              key={i}
              x1={cx(e.from)}
              y1={cy(e.from)}
              x2={cx(e.to)}
              y2={cy(e.to)}
              stroke="#D4D4D8"
              strokeWidth={1.5}
              opacity={memoized && !isReal(e.to) ? 0.18 : 1}
            />
          ))}
          {nodes.map((node) => {
            const dim = memoized && !isReal(node);
            const base = node.k <= 1 ? GREEN : ACCENT;
            return (
              <g key={node.id} opacity={dim ? 0.2 : 1}>
                <circle cx={cx(node)} cy={cy(node)} r={R} fill="#fff" stroke={base} strokeWidth={2} />
                <text x={cx(node)} y={cy(node) + 4} textAnchor="middle" fontSize="12" fontWeight={600} fill={base}>
                  {node.k}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={S.stats}>
        <div style={S.stat}>
          <div style={{ ...S.statNum, color: ACCENT }}>{totalCalls}</div>
          <div style={S.statLabel}>calls, naive</div>
        </div>
        <div style={S.stat}>
          <div style={{ ...S.statNum, color: GREEN }}>{unique}</div>
          <div style={S.statLabel}>unique, memoized</div>
        </div>
        <div style={S.stat}>
          <div style={{ ...S.statNum, color: INK }}>fib({n}) = {fibValue(n)}</div>
          <div style={S.statLabel}>the answer itself</div>
        </div>
      </div>

      <div style={S.controlRow}>
        <span style={S.controlLabel}>Compute fib(n) for n =</span>
        <span style={S.controlValue}>{n}</span>
      </div>
      <input
        type="range"
        min={3}
        max={7}
        step={1}
        value={n}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setN(Number(e.target.value))}
        style={{ width: "100%", accentColor: ACCENT }}
      />

      <div style={S.buttons}>
        <button onClick={() => setMemoized((m) => !m)} style={memoized ? primaryBtn : secondaryBtn}>
          {memoized ? "Memoized ✓" : "Memoize"}
        </button>
      </div>
      <div style={S.footer}>
        Green nodes are base cases. The call count explodes like the Fibonacci numbers themselves - memoization collapses it to one call per value.
      </div>
    </div>
  );
}

function fibValue(n: number): number {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}

const S: Record<string, CSSProperties> = {
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 },
  headline: { margin: 0, fontSize: 25, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 20px", color: SUBTLE, fontSize: 15 },
  scroll: { overflowX: "auto", padding: "4px 0 8px" },
  stats: { display: "flex", gap: 14, flexWrap: "wrap", margin: "18px 0 6px" },
  stat: { flex: "1 1 120px", background: "#FAFAFA", border: "1px solid #EFEFF1", borderRadius: 12, padding: "12px 14px" },
  statNum: { fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" },
  statLabel: { fontSize: 12, color: MUTED, marginTop: 2 },
  controlRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "16px 0 8px" },
  controlLabel: { fontSize: 14, color: SUBTLE },
  controlValue: { fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: INK },
  buttons: { display: "flex", gap: 10, marginTop: 18 },
  footer: { marginTop: 16, fontSize: 12, color: MUTED, lineHeight: 1.5 },
};
