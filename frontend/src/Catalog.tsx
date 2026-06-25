import type { CSSProperties } from "react";
import type { ConceptMeta } from "./api";
import { interactiveModes } from "./interactivePractice";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, BORDER } from "./theme";

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

const HAS_LESSON = new Set([
  "compound-interest", "exponential-decay", "loan-amortization", "monty-hall",
  "birthday-paradox", "base-rates", "hashing-collisions", "law-of-large-numbers",
  "expected-value", "binary-search", "sorting-race", "big-o", "recursion-fib",
  "minimax", "alpha-beta", "supply-demand", "tax-incidence", "prisoners-dilemma",
  "grid-search", "central-limit", "regression-mean",
  "mcts", "projectile", "cipher",
]);

export default function Catalog({ concepts, onSelect }: {
  concepts: ConceptMeta[];
  onSelect: (c: ConceptMeta) => void;
}) {
  const experiences = concepts.filter((c) => c.depth === "experience");
  const quick = concepts.filter((c) => c.depth !== "experience");

  const areas: string[] = [];
  for (const c of quick) if (!areas.includes(c.area)) areas.push(c.area);

  return (
    <div style={S.page}>
      <header style={S.hero}>
        <h1 style={S.title}>Learn the things your gut gets wrong.</h1>
        <p style={S.lede}>
          Interactive lessons plus unlimited practice. Every problem is graded by a tested engine, and when
          you slip, the tutor names the exact misconception behind your answer - not just “wrong.”
        </p>
      </header>

      {experiences.length > 0 && (
        <section style={S.section}>
          <h2 style={S.tierTitle}>Learning experiences</h2>
          <p style={S.tierLede}>
            Deep dives into a whole field - a guided lesson with live pseudocode, plus hands-on practice
            where you run the algorithm yourself.
          </p>
          <div style={S.expGrid}>
            {experiences.map((c) => {
              const modes = interactiveModes(c.id).length;
              return (
                <button key={c.id} onClick={() => onSelect(c)} style={S.expCard}>
                  <div style={S.cardTop}>
                    <span style={S.badge}>{WIDGET_LABEL[c.widget] ?? c.widget}</span>
                    <span style={S.expTag}>Experience</span>
                  </div>
                  <div style={S.expTitle}>{c.title}</div>
                  <div style={S.cardBlurb}>{c.blurb}</div>
                  <div style={S.chipRow}>
                    <span style={S.chip}>Guided lesson</span>
                    <span style={S.chip}>Live pseudocode</span>
                    {modes > 0 ? (
                      <span style={S.chipHot}>{modes + 1} practice modes</span>
                    ) : (
                      <span style={S.chip}>Practice</span>
                    )}
                  </div>
                  <div style={S.expGo}>Open experience →</div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {quick.length > 0 && (
      <section style={S.section}>
        <h2 style={S.tierTitle}>Concepts &amp; curiosities</h2>
        <p style={S.tierLede}>
          Single-idea brain-teasers - one sharp insight each, with an interactive lesson and engine-graded practice.
        </p>
        {areas.map((area) => (
          <div key={area} style={S.areaBlock}>
            <h3 style={S.areaTitle}>{area}</h3>
            <div style={S.grid}>
              {quick.filter((c) => c.area === area).map((c) => (
                <button key={c.id} onClick={() => onSelect(c)} style={S.card}>
                  <div style={S.cardTop}>
                    <span style={S.badge}>{WIDGET_LABEL[c.widget] ?? c.widget}</span>
                    {HAS_LESSON.has(c.id) && <span style={S.lessonDot} title="Has an interactive lesson" />}
                  </div>
                  <div style={S.cardTitle}>{c.title}</div>
                  <div style={S.cardBlurb}>{c.blurb}</div>
                  <div style={S.cardGo}>Open →</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
      )}
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  page: { maxWidth: 980, margin: "0 auto", padding: "8px 24px 64px", boxSizing: "border-box" },
  hero: { maxWidth: 680, margin: "20px auto 44px", textAlign: "center" },
  title: { fontSize: 34, fontWeight: 700, color: INK, margin: 0, lineHeight: 1.15 },
  lede: { fontSize: 16, color: SUBTLE, lineHeight: 1.6, marginTop: 16 },

  section: { marginBottom: 48 },
  tierTitle: { fontSize: 22, fontWeight: 700, color: INK, margin: "0 0 4px" },
  tierLede: { fontSize: 14.5, color: SUBTLE, lineHeight: 1.55, margin: "0 0 20px", maxWidth: 620 },

  expGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 },
  expCard: {
    textAlign: "left",
    background: "linear-gradient(180deg, #FFFFFF 0%, #FFFBF8 100%)",
    border: `1px solid ${BORDER}`,
    borderLeft: `3px solid ${ACCENT}`,
    borderRadius: 16,
    padding: "20px 22px 18px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 9,
    boxShadow: "0 4px 16px rgba(234,88,12,0.07)",
    transition: "box-shadow 0.15s, transform 0.15s",
    font: "inherit",
  },
  expTag: { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ACCENT, background: "#FFF1E9", borderRadius: 6, padding: "3px 8px" },
  expTitle: { fontSize: 20, fontWeight: 700, color: INK, marginTop: 2 },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 },
  chip: { fontSize: 11, fontWeight: 600, color: SUBTLE, background: "#F4F4F5", borderRadius: 6, padding: "3px 8px" },
  chipHot: { fontSize: 11, fontWeight: 700, color: "#fff", background: ACCENT, borderRadius: 6, padding: "3px 8px" },
  expGo: { fontSize: 13, fontWeight: 700, color: ACCENT, marginTop: 6 },

  areaBlock: { marginBottom: 28 },
  areaTitle: { fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 14px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 },
  card: {
    textAlign: "left",
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "18px 20px 16px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    boxShadow: "0 1px 2px rgba(24,24,27,0.04)",
    transition: "box-shadow 0.15s, transform 0.15s",
    font: "inherit",
  },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  badge: { fontSize: 11, fontWeight: 600, color: SUBTLE, background: "#F4F4F5", borderRadius: 6, padding: "3px 8px" },
  lessonDot: { width: 8, height: 8, borderRadius: 999, background: GREEN, display: "inline-block" },
  cardTitle: { fontSize: 18, fontWeight: 700, color: INK, marginTop: 2 },
  cardBlurb: { fontSize: 14, color: SUBTLE, lineHeight: 1.5, flex: 1 },
  cardGo: { fontSize: 13, fontWeight: 600, color: ACCENT, marginTop: 4 },
};
