/**
 * Design tokens for Touchstone.
 *
 * The name is the brief: a touchstone is the dark assay slate you rub gold
 * against to read its fineness against trusted reference marks. So the system is
 * ink on paper, near monochrome, with a single verdigris accent that means one
 * thing only: this is the true / correct / active reading. The split of type
 * roles carries the product thesis directly. The editorial serif speaks the
 * words a model may soften. The tabular monospace speaks the numbers the tested
 * oracle fixes and never lets the model touch.
 *
 * Every screen and widget imports from here. Nothing hard codes a hex.
 */
import type { CSSProperties } from "react";

// ---- Palette -------------------------------------------------------------
// Six considered values, near monochrome. Ink is a warm charcoal, not pure
// black. Paper is a cool patina grey, deliberately not the cream that AI
// interfaces default to. Contrast of ink, accent, clay, and subtle on paper all
// clear WCAG AA for body text.

export const INK = "#1B1E1C";      // primary text and headings (assay slate)
export const SUBTLE = "#565A56";   // secondary text, still AA on paper
export const MUTED = "#8A8F89";    // labels, disabled, decorative only
export const BORDER = "#D8DBD4";   // hairlines, used sparingly not on everything
export const GRID = "#E6E9E1";     // chart gridlines, quieter than a border
export const BG = "#EDEFE9";       // the page, a soft patina paper
export const PAPER = "#FAFBF7";    // raised surfaces, a warm off white

// One accent, one job: the line, value, or mark the system is reading as true.
// Reusing it for anything decorative is what makes an interface read as noisy,
// so it appears only where correctness or the active step is the point.
export const ACCENT = "#0B6E61";
export const ACCENT_FILL = "rgba(11, 110, 97, 0.10)";

// GREEN is kept as a named export for the widgets that import it, but it is the
// accent. Correct and active are the same signal here on purpose, so a reviewer
// learns one colour and trusts it everywhere.
export const GREEN = ACCENT;

// The only other tone with meaning: a wrong or missed reading. A muted oxidised
// clay, not a vermilion alarm, because a near miss is information, not a failure.
export const RED = "#A14A3C";

// ---- Type ----------------------------------------------------------------
// Three deliberate faces. Fraunces is an optical serif with real character for
// display and editorial voice. Hanken Grotesk is the clean text face that
// carries the interface, chosen over Inter so the body does not read as generic.
// IBM Plex Mono sets all code, pseudocode, and every number, always tabular, so
// figures line up like an instrument readout and never reflow as they change.

export const DISPLAY = "'Fraunces', 'Hoefler Text', Georgia, serif";
export const FONT = "'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif";
export const MONO = "'IBM Plex Mono', 'SFMono-Regular', 'Consolas', ui-monospace, monospace";

// Set on anything showing a number so the digits are tabular and do not jitter.
export const NUM: CSSProperties = { fontFamily: MONO, fontVariantNumeric: "tabular-nums" };

// One modular scale (roughly a 1.27 step from a 16px base). Sizes are named by
// role, not by number, so a reskin changes the value in one place.
export const fs = {
  micro: 11,
  xs: 12.5,
  sm: 14,
  base: 16,
  md: 18,
  lg: 21,
  xl: 27,
  xxl: 35,
  display: 46,
} as const;

// One spacing ramp on a 4px grid. Every margin and gap derives from this.
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 36,
  huge: 56,
} as const;

// Radii stay restrained. Big nested pills read as toy UI, so surfaces get a
// modest corner and controls a smaller one. Pill is reserved for true toggles.
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

// ---- Motion --------------------------------------------------------------
// Durations in milliseconds and two easings. The decelerate curve is for things
// arriving, the symmetric curve for things changing in place.
export const motion = {
  fast: 120,
  base: 200,
  slow: 360,
  ease: "cubic-bezier(0.2, 0, 0, 1)",
  easeInOut: "cubic-bezier(0.45, 0, 0.2, 1)",
} as const;

// The global reduced motion switch. Every animated duration in the app is routed
// through dur(), so a single OS level preference flattens all motion to instant
// without each widget reimplementing the check.
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function dur(ms: number): number {
  return prefersReducedMotion() ? 0 : ms;
}

// ---- Signature -----------------------------------------------------------
// The signature control built in Phase 3 is a quiet AI on / off toggle in the
// header. Flipping it on is literally the claim the product makes about itself,
// so its on state is the one accent and everything around it stays still. Only
// the tokens live here. The behaviour is wired later.
export const SIGNATURE = {
  trackOn: ACCENT,
  trackOff: BORDER,
  thumb: PAPER,
  thumbInk: INK,
} as const;

// ---- Reused style objects ------------------------------------------------
// A raised surface. A hairline plus the paper tone does the lifting, so we avoid
// the default drop shadow that makes every card look the same.
export const card: CSSProperties = {
  background: PAPER,
  border: `1px solid ${BORDER}`,
  borderRadius: radius.lg,
  padding: "30px 32px 26px",
  maxWidth: 720,
  width: "100%",
  boxSizing: "border-box",
};

// A small instrument label. Mono and letterspaced so it reads as a measured
// caption, not a heading.
export const eyebrow: CSSProperties = {
  fontFamily: MONO,
  fontSize: fs.micro,
  fontWeight: 500,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: ACCENT,
  marginBottom: space.sm,
};

export const headline: CSSProperties = {
  fontFamily: DISPLAY,
  margin: 0,
  fontSize: fs.xl,
  fontWeight: 600,
  lineHeight: 1.15,
  color: INK,
  letterSpacing: "-0.01em",
};

export const sub: CSSProperties = {
  margin: `${space.sm}px 0 ${space.xl}px`,
  color: SUBTLE,
  fontSize: fs.base,
  lineHeight: 1.55,
};

export const primaryBtn: CSSProperties = {
  fontFamily: FONT,
  background: ACCENT,
  color: PAPER,
  border: `1px solid ${ACCENT}`,
  borderRadius: radius.md,
  padding: "11px 20px",
  fontSize: fs.sm,
  fontWeight: 600,
  cursor: "pointer",
};

export const secondaryBtn: CSSProperties = {
  fontFamily: FONT,
  background: "transparent",
  color: INK,
  border: `1px solid ${BORDER}`,
  borderRadius: radius.md,
  padding: "11px 20px",
  fontSize: fs.sm,
  fontWeight: 600,
  cursor: "pointer",
};

export type Unit = "money" | "count" | "percent" | "number";

// Display only formatting. Money and counts round to whole numbers, plain
// numbers keep two decimals. Grading still happens on the raw value server side,
// so this never affects whether an answer is judged correct.
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
