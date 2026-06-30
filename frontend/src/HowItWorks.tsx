/**
 * The thesis affordance. One line in the header opens this short note on the
 * oracle and the verbatim-number guard. The copy mirrors the in-code comments in
 * ai.py, base.py, and api.py on purpose, so the code and the interface tell the
 * same story to anyone who reads both.
 */
import { useEffect, useRef, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  INK, SUBTLE, ACCENT, BORDER, PAPER, MONO, DISPLAY, fs, space, radius, EASE_OUT,
} from "./theme";

export const THESIS = "The model handles the words. Tested code handles every number.";

export default function HowItWorks({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      style={S.backdrop}
      onClick={onClose}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.2, ease: EASE_OUT }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hiw-title"
        style={S.panel}
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: reduce ? 0 : 0.22, ease: EASE_OUT }}
      >
        <div style={S.eyebrow}>How it works</div>
        <p id="hiw-title" style={S.thesis}>{THESIS}</p>

        <p style={S.body}>
          Every problem is written, graded, and explained by tested code that runs on the server. The
          answer never reaches your browser, so it can't slip into the page.
        </p>
        <p style={S.body}>
          The AI is only allowed to rephrase the question. If a reword changes any number, it is thrown
          out and you see the plain version instead. <em>The words can shift; the math never does.</em>
        </p>
        <p style={S.tip}>
          Flip the AI toggle in the header to see the same problem in the model's words, then in the
          plain template.
        </p>

        <button ref={closeRef} onClick={onClose} className="btn btn-primary" style={S.close}>Got it</button>
      </motion.div>
    </motion.div>
  );
}

const S: Record<string, CSSProperties> = {
  backdrop: {
    position: "fixed", inset: 0, zIndex: 50,
    background: "var(--backdrop)",
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    padding: "76px 20px 20px",
  },
  panel: {
    background: PAPER, border: `1px solid ${BORDER}`, borderRadius: radius.lg,
    maxWidth: 460, width: "100%", padding: "26px 28px 24px", boxSizing: "border-box",
  },
  eyebrow: { fontFamily: MONO, fontSize: fs.micro, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: space.md },
  thesis: { fontFamily: DISPLAY, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.25, color: INK, margin: 0 },
  body: { fontSize: fs.sm, lineHeight: 1.6, color: SUBTLE, margin: `${space.lg}px 0 0` },
  tip: { fontSize: fs.sm, lineHeight: 1.6, color: INK, margin: `${space.lg}px 0 0` },
  close: { marginTop: space.xl, minHeight: 44 },
};
