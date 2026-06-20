/**
 * Read only pseudocode panel that highlights one active line.
 *
 * The active index is the only thing that changes as an animation steps, which is
 * what makes this cheap to re render alongside a scrubber.
 */
import type { CSSProperties } from "react";
import { INK, MUTED, SUBTLE, ACCENT, BORDER } from "../theme";

export interface PseudocodeProps {
  title?: string;
  lines: string[];
  active?: number;
  accent?: string;
  accentFill?: string;
}

export default function Pseudocode({
  title,
  lines,
  active = -1,
  accent = ACCENT,
  accentFill = "rgba(234, 88, 12, 0.10)",
}: PseudocodeProps) {
  return (
    <div style={S.wrap}>
      {title && <div style={S.title}>{title}</div>}
      <div style={S.code}>
        {lines.map((ln, i) => {
          const on = i === active;
          return (
            <div
              key={i}
              style={{
                ...S.line,
                background: on ? accentFill : "transparent",
                // The inset left bar is the active line marker, the one accent
                // signal that says "this is the step running right now".
                boxShadow: on ? `inset 3px 0 0 ${accent}` : "none",
                color: on ? INK : SUBTLE,
              }}
            >
              <span style={S.num}>{i + 1}</span>
              {/* Blank lines fall back to a non breaking space so the row keeps its height. */}
              <span style={S.text}>{ln === "" ? " " : ln}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  wrap: { width: "100%" },
  title: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: MUTED,
    marginBottom: 6,
  },
  code: {
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    background: "#FCFCFD",
    padding: "8px 0",
    fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace",
    fontSize: 12.5,
    lineHeight: 1.5,
    overflowX: "auto",
  },
  line: {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
    padding: "1px 12px 1px 9px",
    whiteSpace: "pre",
    transition: "background 0.12s, box-shadow 0.12s, color 0.12s",
  },
  num: {
    color: MUTED,
    fontSize: 10.5,
    minWidth: 14,
    textAlign: "right",
    userSelect: "none",
    flexShrink: 0,
  },
  text: { whiteSpace: "pre" },
};
