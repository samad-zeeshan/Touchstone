/**
 * Shared design tokens and a few reused style objects.
 *
 * INK through MUTED are one ink on paper ramp. ACCENT is reserved for the active
 * or highlighted signal, GREEN and RED only ever mean correct and wrong.
 */
import type { CSSProperties } from "react";

export const INK = "#18181B";
export const MUTED = "#A1A1AA";
export const SUBTLE = "#52525B";
// One accent, one job: the line, value, or step the widget is pointing at. Adding
// a second use for it is what makes an interface read as noisy.
export const ACCENT = "#EA580C";
export const ACCENT_FILL = "rgba(234, 88, 12, 0.12)";
export const GRID = "#F0F0F2";
export const GREEN = "#16A34A";
export const RED = "#DC2626";
export const BG = "#F4F4F6";
export const BORDER = "#E4E4E7";

export const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export const card: CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 18,
  padding: "30px 32px 26px",
  maxWidth: 720,
  width: "100%",
  boxShadow: "0 12px 40px rgba(24, 24, 27, 0.10)",
  boxSizing: "border-box",
};

export const eyebrow: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: ACCENT,
  marginBottom: 8,
};

export const headline: CSSProperties = { margin: 0, fontSize: 26, fontWeight: 700, lineHeight: 1.2 };
export const sub: CSSProperties = { margin: "8px 0 22px", color: SUBTLE, fontSize: 15 };

export const primaryBtn: CSSProperties = {
  background: ACCENT,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "11px 20px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

export const secondaryBtn: CSSProperties = {
  background: "#fff",
  color: SUBTLE,
  border: `1.5px solid ${BORDER}`,
  borderRadius: 10,
  padding: "11px 20px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

export type Unit = "money" | "count" | "percent" | "number";

// Display only formatting. Money and counts round to whole numbers, plain numbers
// keep two decimals. Grading still happens on the raw value server side.
export function formatAnswer(value: number, unit: Unit): string {
  switch (unit) {
    case "money":
      return "$" + Math.round(value).toLocaleString("en-US");
    case "percent":
      return Math.round(value) + "%";
    case "count":
      return Math.round(value).toLocaleString("en-US");
    default:
      return (Math.round(value * 100) / 100).toLocaleString("en-US");
  }
}
