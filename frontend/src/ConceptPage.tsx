import { useState, type CSSProperties } from "react";
import type { ConceptMeta } from "./api";
import { renderLesson } from "./lessons";
import Practice from "./Practice";
import Walkthrough from "./Walkthrough";
import { SUBTLE, ACCENT, BORDER, card } from "./theme";

type Tab = "lesson" | "walkthrough" | "practice";

export default function ConceptPage({ concept, onBack }: { concept: ConceptMeta; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("lesson");

  return (
    <div style={S.page}>
      <div style={S.bar}>
        <button onClick={onBack} style={S.back}>← All concepts</button>
        <div style={S.pillWrap}>
          <button onClick={() => setTab("lesson")} style={pill(tab === "lesson")}>Lesson</button>
          <button onClick={() => setTab("walkthrough")} style={pill(tab === "walkthrough")}>Walkthrough</button>
          <button onClick={() => setTab("practice")} style={pill(tab === "practice")}>Practice</button>
        </div>
        <div style={{ width: 96 }} />
      </div>

      <div style={S.stage}>
        {tab === "lesson" && <div style={card}>{renderLesson(concept.id)}</div>}
        {tab === "walkthrough" && <Walkthrough concept={concept} />}
        {tab === "practice" && <Practice concept={concept} />}
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  page: { maxWidth: 820, margin: "0 auto", padding: "8px 24px 64px", boxSizing: "border-box" },
  bar: { display: "flex", alignItems: "center", justifyContent: "space-between", margin: "8px 0 24px" },
  back: { background: "none", border: "none", color: SUBTLE, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0, font: "inherit" },
  pillWrap: { display: "inline-flex", background: "#E4E4E7", borderRadius: 999, padding: 4, gap: 4 },
  stage: { display: "flex", justifyContent: "center" },
};

function pill(active: boolean): CSSProperties {
  return {
    border: `1px solid ${active ? BORDER : "transparent"}`,
    borderRadius: 999,
    padding: "8px 22px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    background: active ? "#fff" : "transparent",
    color: active ? ACCENT : SUBTLE,
    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
    fontFamily: "inherit",
  };
}
