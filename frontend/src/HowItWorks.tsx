/**
 * The thesis affordance. One line in the header opens this short note on the
 * oracle and the verbatim-number guard. The copy mirrors the in-code comments in
 * ai.py, base.py, and api.py on purpose, so the code and the interface tell the
 * same story to anyone who reads both.
 */
import { useEffect, useRef, type CSSProperties } from "react";
import {
  INK, SUBTLE, ACCENT, BORDER, PAPER, MONO, DISPLAY, fs, space, radius, dur,
} from "./theme";

export const THESIS = "The model handles the words. Tested code handles every number.";

export default function HowItWorks({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={S.backdrop} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hiw-title"
        style={{ ...S.panel, animationDuration: `${dur(200)}ms` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={S.eyebrow}>How it works</div>
        <p id="hiw-title" style={S.thesis}>{THESIS}</p>

        <p style={S.body}>
          Every problem is generated, graded, and diagnosed by a tested engine that runs only on the
          server. The answer is never sent to your browser, so it cannot leak into the page.
        </p>
        <p style={S.body}>
          The model is allowed to reword the prose into a fresh scenario, but a rewording is thrown out
          unless <em>every number, unit, and target survives it verbatim</em>. Words it may soften.
          Numbers it cannot touch.
        </p>
        <p style={S.tip}>
          Flip the AI toggle in the header to watch the same numbers re-render with the model's prose, then
          with the plain template.
        </p>

        <button ref={closeRef} onClick={onClose} style={S.close}>Got it</button>
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  backdrop: {
    position: "fixed", inset: 0, zIndex: 50,
    background: "rgba(27, 30, 28, 0.32)",
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    padding: "76px 20px 20px",
  },
  panel: {
    background: PAPER, border: `1px solid ${BORDER}`, borderRadius: radius.lg,
    maxWidth: 460, width: "100%", padding: "26px 28px 24px", boxSizing: "border-box",
    animationName: "hiw-rise", animationTimingFunction: "cubic-bezier(0.2,0,0,1)", animationFillMode: "both",
  },
  eyebrow: { fontFamily: MONO, fontSize: fs.micro, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: space.md },
  thesis: { fontFamily: DISPLAY, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.25, color: INK, margin: 0 },
  body: { fontSize: fs.sm, lineHeight: 1.6, color: SUBTLE, margin: `${space.lg}px 0 0` },
  tip: { fontSize: fs.sm, lineHeight: 1.6, color: INK, margin: `${space.lg}px 0 0` },
  close: { ...{ fontFamily: "inherit" }, marginTop: space.xl, background: ACCENT, color: PAPER, border: "none", borderRadius: radius.md, padding: "10px 18px", fontSize: fs.sm, fontWeight: 600, cursor: "pointer", minHeight: 44 },
};
