import { useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ConceptMeta } from "./api";
import { interactiveModes } from "./interactivePractice";
import LessonIcon from "./LessonIcon";
import {
  INK, SUBTLE, MUTED, ACCENT, BORDER, PAPER, DISPLAY, MONO,
  fs, space, radius, EASE_OUT,
} from "./theme";

// Reader-facing names for the widget each concept ships with.
const WIDGET_LABEL: Record<string, string> = {
  curve: "Curve explorer",
  trials: "Trials runner",
  stepper: "Algorithm stepper",
  tree: "Tree explorer",
  distribution: "Distribution runner",
  gametree: "Game tree",
  equilibrium: "Equilibrium sim",
  payoff: "Payoff matrix",
  grid: "Grid search",
  histogram: "Histogram",
  scatter: "Scatter plot",
  mcts: "Search tree",
  cipher: "Cipher explorer",
};

// The meta line under a title. Carries what the experience contains as a quiet
// mono caption rather than a row of coloured chips.
function metaFor(c: ConceptMeta): string {
  const bits = [WIDGET_LABEL[c.widget] ?? c.widget, "Guided lesson", "Live pseudocode"];
  bits.push(interactiveModes(c.id).length > 0 ? "Interactive practice" : "Number drill");
  return bits.join("  ·  ");
}

export default function Catalog({ concepts, onSelect }: {
  concepts: ConceptMeta[];
  onSelect: (c: ConceptMeta) => void;
}) {
  const experiences = concepts.filter((c) => c.depth === "experience");
  const quick = concepts.filter((c) => c.depth !== "experience");

  return (
    <div style={S.page}>
      {experiences.length > 0 && (
        <section style={S.section} aria-label="Learning experiences">
          <SectionHead
            title="Learning experiences"
            note="Each one is a whole field worked end to end, from the guided lesson to running the algorithm yourself."
          />
          <Grid kind="hero">
            {experiences.map((c, i) => (
              <Card key={c.id} concept={c} featured={i === 0} onSelect={onSelect} />
            ))}
          </Grid>
        </section>
      )}

      {quick.length > 0 && (
        <section style={S.section} aria-label="Concepts and curiosities">
          <SectionHead
            title="Concepts & curiosities"
            note="Single-idea brain-teasers, one sharp insight each, with an interactive lesson and engine-graded practice."
          />
          <Grid kind="quick">
            {quick.map((c) => (
              <Card key={c.id} concept={c} onSelect={onSelect} />
            ))}
          </Grid>
        </section>
      )}
    </div>
  );
}

function SectionHead({ title, note }: { title: string; note: string }) {
  return (
    <div style={S.sectionHead}>
      <h2 style={S.tierTitle}>{title}</h2>
      <p style={S.tierNote}>{note}</p>
    </div>
  );
}

function Grid({ kind, children }: { kind: "hero" | "quick"; children: ReactNode }) {
  const reduce = useReducedMotion();
  const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
  };
  const motionProps = reduce
    ? {}
    : { variants: stagger, initial: "hidden" as const, whileInView: "show" as const, viewport: { once: true, amount: 0.12 } };

  return (
    <motion.div
      className={`bento ${kind === "hero" ? "bento-hero" : "bento-quick"}`}
      style={S.grid}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

function Card({ concept, featured, onSelect }: {
  concept: ConceptMeta;
  featured?: boolean;
  onSelect: (c: ConceptMeta) => void;
}) {
  const [hot, setHot] = useState(false);
  const reduce = useReducedMotion();

  const rise: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } },
  };
  const motionProps = reduce
    ? {}
    : { variants: rise, whileHover: { y: -4 }, whileTap: { scale: 0.99 } };

  const meta = <span style={S.meta}>{metaFor(concept)}</span>;
  const go = (
    <span style={{ ...S.go, color: hot ? ACCENT : MUTED }} aria-hidden>
      Open →
    </span>
  );

  return (
    <motion.button
      type="button"
      className={featured ? "bento-marquee" : undefined}
      onClick={() => onSelect(concept)}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
      style={{
        ...S.card,
        ...(featured ? S.cardFeatured : null),
        boxShadow: hot ? "var(--shadow-card)" : "none",
      }}
      {...motionProps}
    >
      {featured ? (
        <>
          <span style={S.iconWrapLg}>
            <LessonIcon id={concept.id} hot={hot} reduce={!!reduce} size={40} />
          </span>
          <span style={S.featuredBody}>
            <span style={{ ...S.title, fontSize: fs.xl, color: hot ? ACCENT : INK }}>{concept.title}</span>
            <span style={S.blurb}>{concept.blurb}</span>
            <span style={S.featuredFoot}>
              {meta}
              {go}
            </span>
          </span>
        </>
      ) : (
        <>
          <LessonIcon id={concept.id} hot={hot} reduce={!!reduce} size={30} />
          <span style={{ ...S.title, fontSize: fs.lg, color: hot ? ACCENT : INK }}>{concept.title}</span>
          <span style={S.blurb}>{concept.blurb}</span>
          <span style={S.foot}>
            {meta}
            {go}
          </span>
        </>
      )}
    </motion.button>
  );
}

const S: Record<string, CSSProperties> = {
  page: { maxWidth: 940, margin: "0 auto", padding: "4px 24px 72px", boxSizing: "border-box" },

  section: { marginBottom: space.xl },
  sectionHead: { marginBottom: space.sm },
  tierTitle: { fontFamily: DISPLAY, fontSize: fs.lg, fontWeight: 600, color: INK, margin: 0 },
  tierNote: { fontSize: fs.sm, color: SUBTLE, lineHeight: 1.55, margin: `${space.xs}px 0 0`, maxWidth: 560 },

  grid: { marginTop: space.md },

  card: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    textAlign: "left",
    width: "100%",
    background: PAPER,
    border: `1px solid ${BORDER}`,
    borderRadius: radius.lg,
    padding: `${space.lg}px ${space.lg}px ${space.md}px`,
    cursor: "pointer",
    font: "inherit",
    transition: "box-shadow 200ms cubic-bezier(0.2,0,0,1)",
  },
  cardFeatured: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.lg,
    padding: `${space.xl}px ${space.xl}px`,
  },
  iconWrapLg: { flexShrink: 0, marginTop: 2 },
  featuredBody: { display: "flex", flexDirection: "column", gap: space.sm, flex: 1, minWidth: 0 },
  featuredFoot: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: space.lg, flexWrap: "wrap", marginTop: space.xxs },

  title: { fontFamily: DISPLAY, fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.01em", transition: "color 160ms" },
  blurb: { fontSize: fs.sm, color: SUBTLE, lineHeight: 1.55 },
  foot: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: space.md, marginTop: "auto", paddingTop: space.xs },
  meta: { fontFamily: MONO, fontSize: fs.micro, color: MUTED, letterSpacing: "0.02em", lineHeight: 1.5, minWidth: 0 },
  go: { fontFamily: MONO, fontSize: fs.xs, fontWeight: 500, flexShrink: 0, transition: "color 160ms" },
};
