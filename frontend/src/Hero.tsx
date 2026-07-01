import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "motion/react";
import AiToggle from "./AiToggle";
import {
  INK, SUBTLE, MUTED, ACCENT, ACCENT_FILL, RED, BORDER, GRID, BG, PAPER,
  DISPLAY, FONT, MONO, fs, space, radius, eyebrow, EASE_OUT,
} from "./theme";

type Kind = "correct" | "trap" | "generic";

const DIAGNOSIS: Record<Kind, string> = {
  correct:
    "Exactly right. Most people blurt 10¢, but that leaves the bat only 90¢ more than the ball. 5¢ is the one value where both facts hold at once.",
  trap:
    "So close. $1.00 and 10¢ do add up to $1.10, but that makes the bat only 90¢ more than the ball, not a full dollar. Drop the ball to 5¢ and the bat becomes $1.05: the gap is exactly $1.00 and the total still lands on $1.10.",
  generic:
    "Not quite. Two facts have to hold at once: the pair costs $1.10, and the bat is $1.00 more than the ball. Together they force the ball to 5¢ and the bat to $1.05.",
};

function parseCents(raw: string): number | null {
  const s = raw.trim().toLowerCase();
  const num = s.replace(/[^0-9.]/g, "");
  if (!num || Number.isNaN(Number(num))) return null;
  const value = Number(num);
  const dollars = s.includes("$") || num.includes(".");
  return dollars ? Math.round(value * 100) : Math.round(value);
}

export default function Hero({ reword, aiConfigured, onRewordChange, onStart, onHow }: {
  reword: boolean;
  aiConfigured: boolean | null;
  onRewordChange: (next: boolean) => void;
  onStart: () => void;
  onHow: () => void;
}) {
  const reduce = useReducedMotion();
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState<{ correct: boolean; kind: Kind } | null>(null);
  const [attempt, setAttempt] = useState(0);

  function check() {
    const cents = parseCents(answer);
    if (cents === null) return;
    const correct = cents === 5;
    const kind: Kind = correct ? "correct" : cents === 10 ? "trap" : "generic";
    setChecked({ correct, kind });
    setAttempt((a) => a + 1);
  }

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
            <span style={S.demoLabel}>Try it</span>
            {aiConfigured !== null && (
              <AiToggle on={reword} configured={aiConfigured} onChange={onRewordChange} />
            )}
          </figcaption>

          <div style={S.card}>
            <p style={S.prose}>
              A bat and a ball cost <Num>$1.10</Num> together. The bat costs <Num>$1.00</Num> more
              than the ball. How much is the ball?
            </p>

            <div style={S.inputRow}>
              <input
                style={S.input}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") check(); }}
                placeholder="e.g. 10¢"
                aria-label="Your answer"
                inputMode="decimal"
              />
              <button className="btn btn-primary" style={S.check} onClick={check}>Check</button>
            </div>

            <AnimatePresence initial={false}>
              {checked && (
                <motion.div
                  key={attempt}
                  style={{ ...S.verdict, borderColor: checked.correct ? ACCENT : RED }}
                  initial={reduce ? false : { opacity: 0, y: 6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.26, ease: EASE_OUT }}
                >
                  <span style={{ ...S.verdictLabel, color: checked.correct ? ACCENT : RED }}>
                    {checked.correct ? "Correct" : "Not quite"}
                  </span>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={reword ? "ai" : "plain"}
                      style={S.verdictBody}
                      initial={reduce ? false : { opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -3 }}
                      transition={{ duration: 0.18, ease: EASE_OUT }}
                    >
                      {reword
                        ? <Typewriter key={attempt} text={DIAGNOSIS[checked.kind]} reduce={!!reduce} />
                        : "The ball costs $0.05."}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p style={S.foot}>
            Tested code sets the verdict and the real number every time. Turn the AI layer on to have
            it walk through your miss, off to just mark it.
          </p>
        </motion.figure>
      </div>
    </section>
  );
}

function Typewriter({ text, reduce }: { text: string; reduce: boolean }) {
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) return;
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      if (i >= text.length) {
        setN(text.length);
        clearInterval(id);
      } else {
        setN(i);
      }
    }, 16);
    return () => clearInterval(id);
  }, [text, reduce]);

  const done = n >= text.length;
  return (
    <>
      {text.slice(0, n)}
      {!done && (
        <motion.span
          aria-hidden
          style={S.caret}
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear", times: [0, 0.5, 0.5, 1] }}
        >
          ▍
        </motion.span>
      )}
    </>
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
    padding: `${space.lg}px ${space.lg}px`,
    display: "flex", flexDirection: "column", gap: space.md,
  },
  prose: { fontFamily: FONT, fontSize: fs.base, lineHeight: 1.6, color: INK, margin: 0 },

  inputRow: { display: "flex", gap: space.sm, alignItems: "center", flexWrap: "wrap" },
  input: {
    flex: 1, minWidth: 0,
    fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontSize: fs.base,
    color: INK, background: PAPER, border: `1px solid ${BORDER}`, borderRadius: radius.md,
    padding: "10px 12px",
  },
  check: { minHeight: 42 },

  verdict: { borderLeft: "2px solid", paddingLeft: space.md, overflow: "hidden" },
  verdictLabel: { display: "block", fontFamily: MONO, fontSize: fs.micro, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: space.xxs },
  verdictBody: { margin: 0, fontFamily: FONT, fontSize: fs.sm, lineHeight: 1.6, color: INK },
  caret: { display: "inline-block", width: "0.4ch", marginLeft: 1, color: ACCENT, fontWeight: 400 },

  foot: { fontSize: fs.xs, color: SUBTLE, lineHeight: 1.55, margin: `${space.md}px 0 0` },

  num: { fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: ACCENT, background: ACCENT_FILL, borderRadius: radius.sm, padding: "0 4px", fontWeight: 600 },
  numSmall: { fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: ACCENT, fontWeight: 600 },
};
