import { useEffect, useState, type CSSProperties } from "react";
import { API, fetchConcepts, type ConceptMeta } from "./api";
import Catalog from "./Catalog";
import ConceptPage from "./ConceptPage";
import {
  INK, MUTED, SUBTLE, ACCENT, BG, BORDER, PAPER, FONT, DISPLAY, MONO,
  fs, space, radius,
} from "./theme";

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
        <button style={S.brand} onClick={() => setSelected(null)} aria-label="Touchstone home">
          {/* The mark is an assay streak, not a logo dot: the mark left on the
              stone is the whole metaphor. */}
          <span style={S.streak} />
          <span style={S.word}>Touchstone</span>
        </button>
        {aiOn !== null && (
          <span
            style={S.aiTag}
            title={aiOn ? "A live model is rewording the prose" : "Running on the zero-cost templated fallback"}
          >
            <span style={{ ...S.aiDot, background: aiOn ? ACCENT : MUTED }} />
            AI layer {aiOn ? "on" : "off"}
          </span>
        )}
      </header>

      <main>
        {error && (
          <Centered>
            Couldn't reach the API. Start the backend, then reload:
            <code style={S.code}>uvicorn api:app --reload</code>
          </Centered>
        )}
        {!error && concepts === null && <Centered muted>Loading the catalog…</Centered>}
        {!error && concepts !== null && (
          selected
            ? <ConceptPage concept={selected} onBack={() => setSelected(null)} />
            : <Catalog concepts={concepts} onSelect={setSelected} />
        )}
      </main>
    </div>
  );
}

function Centered({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <div style={{ ...S.centered, color: muted ? MUTED : SUBTLE }}>{children}</div>;
}

const S: Record<string, CSSProperties> = {
  app: { minHeight: "100vh", background: BG, fontFamily: FONT, color: INK },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${space.md}px ${space.xl}px`,
    borderBottom: `1px solid ${BORDER}`,
    background: "rgba(250, 251, 247, 0.82)",
    backdropFilter: "blur(8px)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  brand: {
    display: "inline-flex", alignItems: "center", gap: space.sm,
    background: "none", border: "none", cursor: "pointer", padding: 0,
  },
  streak: { width: 4, height: 18, borderRadius: 1, background: ACCENT, display: "inline-block" },
  word: { fontFamily: DISPLAY, fontSize: fs.md, fontWeight: 600, color: INK, letterSpacing: "-0.01em" },
  aiTag: { display: "inline-flex", alignItems: "center", gap: space.sm, fontFamily: MONO, fontSize: fs.micro, fontWeight: 500, letterSpacing: "0.04em", color: SUBTLE, textTransform: "uppercase" },
  aiDot: { width: 7, height: 7, borderRadius: radius.pill, display: "inline-block" },
  centered: { textAlign: "center", padding: "96px 24px", fontSize: fs.base, lineHeight: 1.6 },
  code: { display: "block", marginTop: space.md, fontFamily: MONO, fontSize: fs.sm, color: INK, background: PAPER, border: `1px solid ${BORDER}`, borderRadius: radius.md, padding: "8px 12px", width: "fit-content", marginInline: "auto" },
};
