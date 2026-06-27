import { useState, type CSSProperties } from "react";
import type { ConceptMeta } from "./api";
import { renderLesson } from "./lessons";
import Practice from "./Practice";
import Walkthrough from "./Walkthrough";
import {
  INK, SUBTLE, MUTED, ACCENT, BORDER, MONO, DISPLAY, fs, space, card,
} from "./theme";

type Tab = "lesson" | "walkthrough" | "practice";
const TABS: { id: Tab; label: string }[] = [
  { id: "lesson", label: "Lesson" },
  { id: "walkthrough", label: "Walkthrough" },
  { id: "practice", label: "Practice" },
];

export default function ConceptPage({ concept, onBack }: { concept: ConceptMeta; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("lesson");

  return (
    <div style={S.page}>
      <div style={S.bar}>
        <button onClick={onBack} style={S.back}>← Catalog</button>
        <span style={S.crumb}>{concept.title}</span>
      </div>

      {/* Underline tabs read as editorial section markers rather than toy pills.
          aria-selected keeps the active section announced to assistive tech. */}
      <div style={S.tabs} role="tablist" aria-label={`${concept.title} sections`}>
        {TABS.map(({ id, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              style={{ ...S.tab, color: active ? INK : SUBTLE, borderBottomColor: active ? ACCENT : "transparent" }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div style={S.stage} role="tabpanel">
        {tab === "lesson" && <div style={card}>{renderLesson(concept.id)}</div>}
        {tab === "walkthrough" && <Walkthrough concept={concept} />}
        {tab === "practice" && <Practice concept={concept} />}
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  page: { maxWidth: 820, margin: "0 auto", padding: "8px 24px 80px", boxSizing: "border-box" },
  bar: { display: "flex", alignItems: "baseline", gap: space.md, margin: `${space.sm}px 0 ${space.lg}px` },
  back: { background: "none", border: "none", color: SUBTLE, fontSize: fs.sm, fontWeight: 600, cursor: "pointer", padding: 0, font: "inherit" },
  crumb: { fontFamily: MONO, fontSize: fs.micro, color: MUTED, letterSpacing: "0.04em", textTransform: "uppercase" },

  tabs: { display: "flex", gap: space.xl, borderBottom: `1px solid ${BORDER}`, marginBottom: space.xl },
  tab: {
    fontFamily: DISPLAY,
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    padding: `0 0 ${space.md}px`,
    marginBottom: -1,
    fontSize: fs.md,
    fontWeight: 600,
    cursor: "pointer",
    transition: "color 160ms, border-color 160ms",
  },
  stage: { display: "flex", justifyContent: "center" },
};
