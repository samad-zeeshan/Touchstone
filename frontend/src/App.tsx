import { useEffect, useState, type CSSProperties } from "react";
import { API, fetchConcepts, type ConceptMeta } from "./api";
import Catalog from "./Catalog";
import ConceptPage from "./ConceptPage";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, BG, BORDER, FONT } from "./theme";

export default function App() {
  const [concepts, setConcepts] = useState<ConceptMeta[] | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [selected, setSelected] = useState<ConceptMeta | null>(null);
  const [aiOn, setAiOn] = useState<boolean | null>(null);

  useEffect(() => {
    fetchConcepts().then(setConcepts).catch(() => setError(true));
    fetch(`${API}/health`)
      .then((r) => r.json())
      .then((h) => setAiOn(Boolean(h.ai_enabled)))
      .catch(() => setAiOn(null));
  }, []);

  return (
    <div style={S.app}>
      <header style={S.nav}>
        <button style={S.brand} onClick={() => setSelected(null)}>
          <span style={S.dot} /> AI&nbsp;Tutor
        </button>
        {aiOn !== null && (
          <span style={S.aiTag} title={aiOn ? "Live AI is configured" : "Running on the zero-cost templated fallback"}>
            <span style={{ ...S.aiDot, background: aiOn ? GREEN : MUTED }} />
            {aiOn ? "AI layer on" : "AI layer off"}
          </span>
        )}
      </header>

      <main>
        {error && <Centered>Couldn't reach the API. Start the backend: <code>uvicorn api:app --reload</code></Centered>}
        {!error && concepts === null && <Centered>Loading concepts…</Centered>}
        {!error && concepts !== null && (
          selected
            ? <ConceptPage concept={selected} onBack={() => setSelected(null)} />
            : <Catalog concepts={concepts} onSelect={setSelected} />
        )}
      </main>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div style={S.centered}>{children}</div>;
}

const S: Record<string, CSSProperties> = {
  app: { minHeight: "100vh", background: BG, fontFamily: FONT, color: INK },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 24px",
    borderBottom: `1px solid ${BORDER}`,
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(8px)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  brand: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 700, color: INK, background: "none", border: "none", cursor: "pointer", font: "inherit" },
  dot: { width: 12, height: 12, borderRadius: 999, background: ACCENT, display: "inline-block" },
  aiTag: { display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: SUBTLE },
  aiDot: { width: 8, height: 8, borderRadius: 999, display: "inline-block" },
  centered: { textAlign: "center", color: SUBTLE, padding: "80px 24px", fontSize: 15 },
};
