import { useCallback, useState, type CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, RED, BORDER, primaryBtn, secondaryBtn } from "../theme";

const CODE = [
  "function bubbleSort(a):",
  "  for i from 0 to n−2:",
  "    for j from 0 to n−2−i:",
  "      if a[j] > a[j+1]:",
  "        swap a[j] and a[j+1]",
];

function scrambled(): number[] {
  const order = CODE.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1));
    [order[i], order[k]] = [order[k], order[i]];
  }
  if (order.every((v, i) => v === i)) return scrambled();
  return order;
}

type Check = { solved: boolean; firstWrong: number } | null;

export default function SortParsons() {
  const [order, setOrder] = useState<number[]>(scrambled);
  const [check, setCheck] = useState<Check>(null);

  const move = useCallback((pos: number, dir: -1 | 1) => {
    setOrder((prev) => {
      const t = pos + dir;
      if (t < 0 || t >= prev.length) return prev;
      const next = [...prev];
      [next[pos], next[t]] = [next[t], next[pos]];
      return next;
    });
    setCheck(null);
  }, []);

  const verify = () => {
    const firstWrong = order.findIndex((v, i) => v !== i);
    setCheck(firstWrong === -1 ? { solved: true, firstWrong: -1 } : { solved: false, firstWrong });
  };

  const shuffle = useCallback(() => { setOrder(scrambled()); setCheck(null); }, []);

  return (
    <div style={S.card}>
      <div style={S.eyebrow}>Order the code · Bubble sort</div>
      <h2 style={S.headline}>Put bubble sort back together.</h2>
      <p style={S.sub}>
        The lines are shuffled. Use the arrows to order them the way the algorithm runs, then check.
        We&apos;ll point to the first line that isn&apos;t where it belongs.
      </p>

      <div style={S.list}>
        {order.map((codeIdx, pos) => {
          const wrong = check && !check.solved && pos === check.firstWrong;
          const solved = check?.solved;
          return (
            <div
              key={codeIdx}
              style={{
                ...S.row,
                borderColor: wrong ? RED : solved ? GREEN : BORDER,
                background: wrong ? "rgba(161, 74, 60, 0.08)" : solved ? "rgba(11, 110, 97, 0.10)" : "#FAFBF7",
              }}
            >
              <span style={S.lineNo}>{pos + 1}</span>
              <code style={S.code}>{CODE[codeIdx]}</code>
              <div style={S.arrows}>
                <button onClick={() => move(pos, -1)} disabled={pos === 0} style={arrowBtn(pos === 0)} aria-label="move up">↑</button>
                <button onClick={() => move(pos, 1)} disabled={pos === order.length - 1} style={arrowBtn(pos === order.length - 1)} aria-label="move down">↓</button>
              </div>
            </div>
          );
        })}
      </div>

      {check?.solved ? (
        <div style={S.solved}>That&apos;s exactly bubble sort. Outer pass, inner scan, compare, swap.</div>
      ) : check ? (
        <div style={S.hint}>
          Line {check.firstWrong + 1} isn&apos;t where bubble sort would have it yet. Keep going.
        </div>
      ) : null}

      <div style={S.buttons}>
        {!check?.solved && <button onClick={verify} style={primaryBtn}>Check order</button>}
        <button onClick={shuffle} style={check?.solved ? primaryBtn : secondaryBtn}>Shuffle again</button>
      </div>
    </div>
  );
}

function arrowBtn(disabled: boolean): CSSProperties {
  return {
    border: `1px solid ${BORDER}`,
    background: "#fff",
    borderRadius: 7,
    width: 28,
    height: 24,
    fontSize: 13,
    lineHeight: 1,
    cursor: disabled ? "default" : "pointer",
    color: disabled ? "#D4D4D8" : SUBTLE,
    padding: 0,
  };
}

const S: Record<string, CSSProperties> = {
  card: { background: "#FAFBF7", border: "1px solid #D8DBD4", borderRadius: 12, padding: "30px 32px", maxWidth: 640, width: "100%", boxSizing: "border-box" },
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 },
  headline: { margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: INK },
  sub: { margin: "8px 0 20px", color: SUBTLE, fontSize: 15, lineHeight: 1.55 },
  list: { display: "flex", flexDirection: "column", gap: 8 },
  row: { display: "flex", alignItems: "center", gap: 12, border: "1px solid", borderRadius: 10, padding: "10px 12px", transition: "background 0.15s, border-color 0.15s" },
  lineNo: { fontSize: 11, color: MUTED, minWidth: 14, textAlign: "right", fontVariantNumeric: "tabular-nums" },
  code: { flex: 1, fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace", fontSize: 13.5, color: INK, whiteSpace: "pre" },
  arrows: { display: "flex", flexDirection: "column", gap: 3 },
  solved: { marginTop: 16, fontSize: 15, fontWeight: 600, color: GREEN, lineHeight: 1.5 },
  hint: { marginTop: 16, fontSize: 15, color: RED, lineHeight: 1.5 },
  buttons: { display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" },
};
