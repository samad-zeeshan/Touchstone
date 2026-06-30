import { useState, type CSSProperties } from "react";
import type { ConceptMeta } from "./api";
import { interactiveModes } from "./interactivePractice";
import {
  INK, SUBTLE, MUTED, ACCENT, BORDER, DISPLAY, MONO,
  fs, space, eyebrow,
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
      <header style={S.hero}>
        <div style={eyebrow}>An assay for intuition</div>
        <h1 style={S.title}>Learn the things your intuition gets wrong.</h1>
        <p style={S.lede}>
          Guided lessons with live pseudocode, and practice graded by a tested engine. When you
          slip, it names the exact misconception behind your answer, not just <em>wrong</em>.
        </p>
      </header>

      {experiences.length > 0 && (
        <section style={S.section} aria-label="Learning experiences">
          <SectionHead
            title="Learning experiences"
            note="Each one is a whole field worked end to end, from the guided lesson to running the algorithm yourself."
          />
          <div style={S.list}>
            {experiences.map((c) => (
              <Row key={c.id} concept={c} onSelect={onSelect} />
            ))}
          </div>
        </section>
      )}

      {quick.length > 0 && (
        <section style={S.section} aria-label="Concepts and curiosities">
          <SectionHead
            title="Concepts & curiosities"
            note="Single-idea brain-teasers, one sharp insight each, with an interactive lesson and engine-graded practice."
          />
          <div style={S.list}>
            {quick.map((c) => (
              <Row key={c.id} concept={c} onSelect={onSelect} />
            ))}
          </div>
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

// A row is the whole hit target, so it stays keyboard reachable and gets the
// global focus ring. Hover and focus raise an accent streak and warm the title,
// which is all the affordance an editorial list needs.
function Row({ concept, onSelect }: { concept: ConceptMeta; onSelect: (c: ConceptMeta) => void }) {
  const [hot, setHot] = useState(false);
  return (
    <button
      onClick={() => onSelect(concept)}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
      style={S.row}
    >
      <span style={{ ...S.streak, background: hot ? ACCENT : "transparent" }} />
      <span style={S.rowBody}>
        <span style={{ ...S.rowTitle, color: hot ? ACCENT : INK }}>{concept.title}</span>
        <span style={S.rowBlurb}>{concept.blurb}</span>
        <span style={S.rowMeta}>{metaFor(concept)}</span>
      </span>
      <span style={{ ...S.go, color: hot ? ACCENT : MUTED }} aria-hidden>
        Open →
      </span>
    </button>
  );
}

const S: Record<string, CSSProperties> = {
  page: { maxWidth: 760, margin: "0 auto", padding: "8px 24px 80px", boxSizing: "border-box" },

  hero: { maxWidth: 600, margin: "40px auto 56px", textAlign: "center" },
  title: { fontFamily: DISPLAY, fontSize: fs.xxl, fontWeight: 600, color: INK, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" },
  lede: { fontSize: fs.md, color: SUBTLE, lineHeight: 1.6, marginTop: space.lg },

  section: { marginBottom: space.huge },
  sectionHead: { marginBottom: space.sm },
  tierTitle: { fontFamily: DISPLAY, fontSize: fs.lg, fontWeight: 600, color: INK, margin: 0 },
  tierNote: { fontSize: fs.sm, color: SUBTLE, lineHeight: 1.55, margin: `${space.xs}px 0 0`, maxWidth: 560 },

  list: { display: "flex", flexDirection: "column", marginTop: space.lg, borderTop: `1px solid ${BORDER}` },
  row: {
    display: "flex",
    alignItems: "flex-start",
    gap: space.lg,
    textAlign: "left",
    width: "100%",
    background: "none",
    border: "none",
    borderBottom: `1px solid ${BORDER}`,
    padding: `${space.xl}px ${space.xs}px`,
    cursor: "pointer",
    font: "inherit",
    transition: "padding-left 160ms cubic-bezier(0.2,0,0,1)",
  },
  streak: { flexShrink: 0, width: 3, alignSelf: "stretch", borderRadius: 2, transition: "background 160ms" },
  rowBody: { display: "flex", flexDirection: "column", gap: space.sm, flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: DISPLAY, fontSize: fs.lg, fontWeight: 600, transition: "color 160ms" },
  rowBlurb: { fontSize: fs.sm, color: SUBTLE, lineHeight: 1.55 },
  rowMeta: { fontFamily: MONO, fontSize: fs.micro, color: MUTED, letterSpacing: "0.02em", marginTop: space.xxs },
  go: { fontFamily: MONO, fontSize: fs.xs, fontWeight: 500, flexShrink: 0, alignSelf: "center", transition: "color 160ms" },
};
