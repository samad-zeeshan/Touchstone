import type { CSSProperties, ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "motion/react";
import AiToggle from "./AiToggle";
import {
  INK, SUBTLE, MUTED, ACCENT, ACCENT_FILL, BORDER, GRID, BG, PAPER,
  DISPLAY, FONT, MONO, fs, space, radius, eyebrow, EASE_OUT,
} from "./theme";

export default function Hero({ reword, aiConfigured, onRewordChange, onStart, onHow }: {
  reword: boolean;
  aiConfigured: boolean | null;
  onRewordChange: (next: boolean) => void;
  onStart: () => void;
  onHow: () => void;
}) {
  const reduce = useReducedMotion();

  const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
  };
  const rise: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE_OUT } },
  };

  return (
    <section style={S.hero} aria-label="What Touchstone is">
      <div style={S.grid}>
        <motion.div
          style={S.copy}
          variants={stagger}
          initial={reduce ? false : "hidden"}
          animate="show"
        >
          <motion.div style={eyebrow} variants={rise}>Lessons that grade your intuition</motion.div>
          <motion.h1 style={S.title} variants={rise}>Learn the things your intuition gets wrong.</motion.h1>
          <motion.p style={S.lede} variants={rise}>
            Guided lessons with live pseudocode, practice graded by tested code. Slip, and it names
            the exact idea you got wrong, not just the answer.
          </motion.p>
          <motion.div style={S.ctaRow} variants={rise}>
            <button className="btn btn-primary" style={S.cta} onClick={onStart}>Start practicing</button>
            <button className="btn btn-secondary" style={S.cta} onClick={onHow}>How it works</button>
          </motion.div>
        </motion.div>

        <motion.figure
          style={S.demo}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: EASE_OUT, delay: reduce ? 0 : 0.18 }}
        >
          <figcaption style={S.demoHead}>
            <span style={S.demoLabel}>One problem, two wordings</span>
            {aiConfigured !== null && (
              <AiToggle on={reword} configured={aiConfigured} onChange={onRewordChange} />
            )}
          </figcaption>

          <div style={S.card}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={reword ? "ai" : "plain"}
                style={S.prose}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
              >
                {reword ? (
                  <>
                    A bat and a ball cost <Num>$1.10</Num> together, and the bat costs{" "}
                    <Num>$1.00</Num> more than the ball. How much is the ball?
                  </>
                ) : (
                  <>
                    A bat and a ball cost <Num>$1.10</Num> in total. The bat costs <Num>$1.00</Num>{" "}
                    more than the ball. What does the ball cost?
                  </>
                )}
              </motion.p>
            </AnimatePresence>
          </div>

          <p style={S.foot}>
            Only the wording changes. The numbers stay fixed by tested code, and the answer is not the{" "}
            <Num small>10¢</Num> most people blurt out.
          </p>
        </motion.figure>
      </div>
    </section>
  );
}

function Num({ children, small }: { children: ReactNode; small?: boolean }) {
  return <span style={small ? S.numSmall : S.num}>{children}</span>;
}

const S: Record<string, CSSProperties> = {
  hero: {
    maxWidth: 940,
    margin: "0 auto",
    padding: `${space.huge}px ${space.xl}px ${space.xl}px`,
    boxSizing: "border-box",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: `${space.xxl}px ${space.huge}px`,
    alignItems: "start",
  },

  copy: { maxWidth: 460 },
  title: {
    fontFamily: DISPLAY, fontSize: fs.xxl, fontWeight: 600, color: INK,
    margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em", textWrap: "balance",
  },
  lede: { fontSize: fs.md, color: SUBTLE, lineHeight: 1.6, margin: `${space.lg}px 0 0` },
  ctaRow: { display: "flex", flexWrap: "wrap", gap: space.md, marginTop: space.xl },
  cta: { minHeight: 44 },

  demo: { margin: 0, background: PAPER, border: `1px solid ${BORDER}`, borderRadius: radius.lg, padding: `${space.lg}px ${space.lg}px ${space.md}px` },
  demoHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: space.sm, marginBottom: space.md },
  demoLabel: { fontFamily: MONO, fontSize: fs.micro, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED },
  card: {
    background: BG, border: `1px solid ${GRID}`, borderRadius: radius.md,
    padding: `${space.lg}px ${space.lg}px`, minHeight: 128,
    display: "flex", alignItems: "center",
  },
  prose: { fontFamily: FONT, fontSize: fs.base, lineHeight: 1.6, color: INK, margin: 0 },
  foot: { fontSize: fs.xs, color: SUBTLE, lineHeight: 1.55, margin: `${space.md}px 0 0` },

  num: { fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: ACCENT, background: ACCENT_FILL, borderRadius: radius.sm, padding: "0 4px", fontWeight: 600 },
  numSmall: { fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: ACCENT, fontWeight: 600 },
};
