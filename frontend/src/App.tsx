import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence } from "motion/react";
import { API, fetchConcepts, type ConceptMeta } from "./api";
import Catalog from "./Catalog";
import Hero from "./Hero";
import AiToggle from "./AiToggle";
import ThemeToggle from "./ThemeToggle";

// Code-split the heavy routes. ConceptPage pulls in every lesson and widget, so
// keeping it (and the on-demand How-it-works dialog) out of the initial chunk
// lets the catalog ship light. They load on first navigation.
const ConceptPage = lazy(() => import("./ConceptPage"));
const HowItWorks = lazy(() => import("./HowItWorks"));
import {
  INK, MUTED, SUBTLE, ACCENT, BG, BORDER, PAPER, FONT, DISPLAY, MONO,
  fs, space, radius, prefersReducedMotion, readTheme, applyTheme,
} from "./theme";

export default function App() {
  const [concepts, setConcepts] = useState<ConceptMeta[] | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [selected, setSelected] = useState<ConceptMeta | null>(null);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  // Whether the client asks for reworded prose. Seeded from whether a key is
  // configured, then owned by the header toggle. Threaded into Practice so a
  // flip re-renders the same numbers with the model's words or the plain template.
  const [reword, setReword] = useState<boolean>(true);
  const [howOpen, setHowOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState(() => readTheme());
  const rootRef = useRef<HTMLDivElement>(null);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  function scrollToCatalog() {
    const el = document.getElementById("catalog");
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }

  useEffect(() => {
    fetchConcepts().then(setConcepts).catch(() => setError(true));
    fetch(`${API}/health`)
      .then((r) => r.json())
      .then((h) => { const on = Boolean(h.ai_enabled); setAiConfigured(on); setReword(on); })
      .catch(() => setAiConfigured(null));
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || prefersReducedMotion()) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} style={S.app}>
      <header style={S.nav}>
        <button style={S.brand} onClick={() => setSelected(null)} aria-label="Touchstone home">
          {/* The mark is an assay streak, not a logo dot: the mark left on the
              stone is the whole metaphor. */}
          <span style={S.streak} />
          <span style={S.word}>Touchstone</span>
        </button>

        <div style={S.right}>
          <button className="btn-ghost" style={S.howBtn} onClick={() => setHowOpen(true)}>How it works</button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          {aiConfigured !== null && (
            <AiToggle on={reword} configured={aiConfigured} onChange={setReword} />
          )}
        </div>
      </header>

      <main>
        {selected ? (
          <Suspense fallback={<Centered muted>Loading…</Centered>}>
            <ConceptPage concept={selected} reword={reword} onBack={() => setSelected(null)} />
          </Suspense>
        ) : (
          <>
            <Hero
              reword={reword}
              aiConfigured={aiConfigured}
              onRewordChange={setReword}
              onStart={scrollToCatalog}
              onHow={() => setHowOpen(true)}
            />
            <div id="catalog">
              {error && (
                <Centered>
                  Couldn't reach the API. Start the backend, then reload:
                  <code style={S.code}>uvicorn api:app --reload</code>
                </Centered>
              )}
              {!error && concepts === null && <Centered muted>Loading the catalog…</Centered>}
              {!error && concepts !== null && <Catalog concepts={concepts} onSelect={setSelected} />}
            </div>
          </>
        )}
      </main>

      <Suspense fallback={null}>
        <AnimatePresence>
          {howOpen && <HowItWorks onClose={() => setHowOpen(false)} />}
        </AnimatePresence>
      </Suspense>
    </div>
  );
}

function Centered({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <div style={{ ...S.centered, color: muted ? MUTED : SUBTLE }}>{children}</div>;
}

const S: Record<string, CSSProperties> = {
  app: {
    minHeight: "100vh",
    fontFamily: FONT,
    color: INK,
    background: `radial-gradient(560px circle at var(--mx, 50%) var(--my, 50%), var(--glow), transparent 60%), ${BG}`,
    backgroundAttachment: "fixed",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${space.sm}px ${space.xl}px`,
    borderBottom: `1px solid ${BORDER}`,
    background: "var(--nav-bg)",
    backdropFilter: "blur(8px)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  brand: { display: "inline-flex", alignItems: "center", gap: space.sm, background: "none", border: "none", cursor: "pointer", padding: 0 },
  streak: { width: 4, height: 18, borderRadius: 1, background: ACCENT, display: "inline-block" },
  word: { fontFamily: DISPLAY, fontSize: fs.md, fontWeight: 600, color: INK, letterSpacing: "-0.01em" },
  right: { display: "inline-flex", alignItems: "center", gap: space.lg },
  howBtn: { padding: `${space.sm}px 0`, minHeight: 44 },
  centered: { textAlign: "center", padding: "96px 24px", fontSize: fs.base, lineHeight: 1.6 },
  code: { display: "block", marginTop: space.md, fontFamily: MONO, fontSize: fs.sm, color: INK, background: PAPER, border: `1px solid ${BORDER}`, borderRadius: radius.md, padding: "8px 12px", width: "fit-content", marginInline: "auto" },
};
