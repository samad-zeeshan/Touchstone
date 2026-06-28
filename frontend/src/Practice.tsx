import { useState, useEffect, useCallback, useRef, type ChangeEvent, type CSSProperties, type KeyboardEvent } from "react";
import { fetchProblem, gradeAttempt, type ConceptMeta, type Problem, type Outcome } from "./api";
import {
  INK, SUBTLE, MUTED, ACCENT, GREEN, RED, BORDER, PAPER, MONO, NUM,
  fs, space, radius, card, eyebrow, primaryBtn, secondaryBtn, formatAnswer,
} from "./theme";
import MistakeClip from "./MistakeClip";
import { interactiveModes } from "./interactivePractice";

export default function Practice({ concept, reword }: { concept: ConceptMeta; reword: boolean }) {
  const interactive = interactiveModes(concept.id);
  const modes = [
    ...interactive,
    { id: "drill", label: "Number drill", render: () => <NumberDrill concept={concept} reword={reword} /> },
  ];
  const [active, setActive] = useState<string>(modes[0].id);

  // A concept with no interactive modes is the drill directly, no empty switcher.
  if (interactive.length === 0) return <NumberDrill concept={concept} reword={reword} />;

  const current = modes.find((m) => m.id === active) ?? modes[modes.length - 1];
  return (
    <div style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}>
      <div style={W.modeRow} role="tablist" aria-label="Practice modes">
        {modes.map((m) => {
          const on = m.id === active;
          return (
            <button
              key={m.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(m.id)}
              style={{ ...W.modeBtn, color: on ? INK : SUBTLE, borderBottomColor: on ? ACCENT : "transparent" }}
            >
              {m.label}
            </button>
          );
        })}
      </div>
      {current.render()}
    </div>
  );
}

const W: Record<string, CSSProperties> = {
  modeRow: { display: "flex", gap: space.lg, borderBottom: `1px solid ${BORDER}`, marginBottom: space.xl, flexWrap: "wrap" },
  modeBtn: {
    background: "none", border: "none", borderBottom: "2px solid transparent",
    padding: `0 0 ${space.md}px`, marginBottom: -1, fontSize: fs.sm, fontWeight: 600,
    cursor: "pointer", font: "inherit", transition: "color 160ms, border-color 160ms",
  },
};

type Result =
  | { kind: "info"; message: string }
  | { kind: "outcome"; outcome: Outcome; submitted: number };

function NumberDrill({ concept, reword }: { concept: ConceptMeta; reword: boolean }) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [checking, setChecking] = useState<boolean>(false);
  const [showClip, setShowClip] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  // Refs keep the AI toggle honest without re-fetching on every render. rewordRef
  // mirrors the current flag so a fresh problem respects the toggle; lastReword
  // only updates when the swap effect handles a real flip, which is how it tells a
  // toggle apart from a re-render. All three are synced in effects, never during
  // render, so they stay off the render path.
  const rewordRef = useRef(reword);
  const lastReword = useRef(reword);
  const problemRef = useRef<Problem | null>(null);
  useEffect(() => { rewordRef.current = reword; });
  useEffect(() => { problemRef.current = problem; }, [problem]);

  const loadProblem = useCallback(async (): Promise<void> => {
    setProblem(null);
    setLoadError(false);
    setAnswer("");
    setResult(null);
    setShowClip(false);
    setShowSolution(false);
    try {
      setProblem(await fetchProblem(concept.id, { reword: rewordRef.current }));
    } catch {
      setLoadError(true);
    }
  }, [concept.id]);

  useEffect(() => {
    loadProblem();
  }, [loadProblem]);

  // The demonstration. On an actual toggle, re-fetch the SAME seed with the new
  // reword flag so the numbers are byte-for-byte identical and only the prose
  // changes. Mount and concept switches are ignored, since reword is unchanged.
  useEffect(() => {
    if (lastReword.current === reword) return;
    lastReword.current = reword;
    const cur = problemRef.current;
    if (!cur) return;
    let live = true;
    fetchProblem(concept.id, { seed: cur.seed, reword })
      .then((p) => { if (live) setProblem(p); })
      .catch(() => { /* keep the current prose on a failed swap */ });
    return () => { live = false; };
  }, [reword, concept.id]);

  async function check(): Promise<void> {
    if (!problem) return;
    const submitted = Number(answer.replace(/[$,%\s]/g, ""));
    if (answer.trim() === "" || Number.isNaN(submitted)) {
      setResult({ kind: "info", message: "Enter a number to check." });
      return;
    }
    setChecking(true);
    setResult(null);
    setShowClip(false);
    setShowSolution(false);
    try {
      const outcome = await gradeAttempt(concept.id, problem, submitted);
      setResult({ kind: "outcome", outcome, submitted });
    } catch {
      setResult({ kind: "info", message: "Couldn't reach the grader. Check the backend is running, then retry." });
    } finally {
      setChecking(false);
    }
  }

  const solved = result?.kind === "outcome" && result.outcome.correct;
  const showDollar = concept.answer_unit === "money";

  if (loadError) {
    return (
      <Shell concept={concept}>
        <p style={S.prompt}>Couldn't reach the grader.</p>
        <p style={S.explain}>
          Start the backend in the <code>backend</code> folder: <code>uvicorn api:app --reload</code>
        </p>
        <button onClick={loadProblem} style={primaryBtn}>Retry</button>
      </Shell>
    );
  }

  if (!problem) {
    // Quiet skeleton: holds the prompt's height so nothing jumps when it loads.
    return (
      <Shell concept={concept}>
        <div style={S.skelLine} />
        <div style={{ ...S.skelLine, width: "72%" }} />
      </Shell>
    );
  }

  return (
    <Shell concept={concept}>
      <p style={S.prompt}>{problem.prompt}</p>

      <div style={S.inputRow}>
        {showDollar && <span style={S.dollar}>$</span>}
        <input
          value={answer}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setAnswer(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && !solved && !checking) check();
          }}
          placeholder="your answer"
          inputMode="decimal"
          aria-label={`Your answer for ${concept.title}`}
          disabled={solved}
          style={S.input}
        />
      </div>

      <div style={S.buttons}>
        {!solved && (
          <button onClick={check} disabled={checking} style={primaryBtn}>
            {checking ? "Checking…" : "Check"}
          </button>
        )}
        <button onClick={loadProblem} style={solved ? primaryBtn : secondaryBtn}>New problem</button>
      </div>

      {result?.kind === "info" && <p style={{ ...S.explain, color: MUTED }}>{result.message}</p>}

      {result?.kind === "outcome" && result.outcome.correct && (
        <div style={{ ...S.feedback, color: GREEN }} role="status">
          <strong>Correct.</strong> The answer is{" "}
          <span style={NUM}>{formatAnswer(result.outcome.correct_answer, concept.answer_unit)}</span>.
        </div>
      )}

      {result?.kind === "outcome" && !result.outcome.correct && (
        <div style={S.feedback} role="status">
          <div style={{ color: RED, fontWeight: 600 }}>
            Not quite. The answer is{" "}
            <span style={NUM}>{formatAnswer(result.outcome.correct_answer, concept.answer_unit)}</span>.
          </div>
          <Feedback outcome={result.outcome} />

          <div style={S.actionRow}>
            {result.outcome.solution && !showSolution && (
              <button onClick={() => setShowSolution(true)} style={secondaryBtn}>Show solution</button>
            )}
            {result.outcome.has_clip && result.outcome.diagnosis && problem && !showClip && (
              <button onClick={() => setShowClip(true)} style={secondaryBtn}>▶ Watch why</button>
            )}
          </div>

          {showSolution && result.outcome.solution && (
            <div style={S.solution}>
              <div style={S.solutionLabel}>Solution</div>
              {result.outcome.solution}
            </div>
          )}

          {showClip && result.outcome.has_clip && result.outcome.diagnosis && problem && (
            <MistakeClip
              concept={concept}
              problem={problem}
              handle={result.outcome.diagnosis}
              submitted={result.submitted}
              onClose={() => setShowClip(false)}
            />
          )}
        </div>
      )}
    </Shell>
  );
}

// The engine's named misconception is the trusted result, so it carries the
// accent. The AI hint is the soft fallback and stays quiet, which keeps the
// thesis legible even in the feedback: tested diagnosis first, words second.
function Feedback({ outcome }: { outcome: Outcome }) {
  if (outcome.diagnosis_text) {
    return (
      <p style={S.explain}>
        {outcome.diagnosis && <span style={S.tag}>{outcome.diagnosis}</span>}
        {outcome.diagnosis_text}
      </p>
    );
  }
  if (outcome.feedback) {
    return (
      <p style={S.explain}>
        <span style={S.tagSoft}>AI hint</span>
        {outcome.feedback}
      </p>
    );
  }
  return <p style={S.explain}>Double-check your method, then try the next one.</p>;
}

function Shell({ concept, children }: { concept: ConceptMeta; children: React.ReactNode }) {
  return (
    <div style={{ ...card, maxWidth: 640 }}>
      <div style={eyebrow}>Practice · {concept.title}</div>
      {children}
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  prompt: { fontSize: fs.md, lineHeight: 1.55, margin: "0 0 22px", color: INK },
  inputRow: { display: "flex", alignItems: "center", border: `1px solid ${BORDER}`, borderRadius: radius.md, padding: "0 14px", marginBottom: space.lg, background: PAPER },
  dollar: { ...NUM, color: MUTED, fontSize: fs.md, marginRight: 6 },
  input: { ...NUM, flex: 1, border: "none", outline: "none", padding: "13px 0", fontSize: fs.md, color: INK, background: "transparent" },
  buttons: { display: "flex", gap: space.md, flexWrap: "wrap" },
  feedback: { marginTop: space.xl, fontSize: fs.base, lineHeight: 1.5 },
  explain: { color: SUBTLE, fontSize: fs.sm, margin: "10px 0 0", lineHeight: 1.55 },
  tag: { fontFamily: MONO, display: "inline-block", fontSize: fs.micro, fontWeight: 500, background: ACCENT, color: PAPER, borderRadius: radius.sm, padding: "2px 7px", marginRight: 8, verticalAlign: "middle" },
  tagSoft: { fontFamily: MONO, display: "inline-block", fontSize: fs.micro, fontWeight: 500, background: "transparent", color: MUTED, border: `1px solid ${BORDER}`, borderRadius: radius.sm, padding: "1px 7px", marginRight: 8, verticalAlign: "middle" },
  actionRow: { display: "flex", gap: space.md, marginTop: space.lg, flexWrap: "wrap" },
  solution: { marginTop: space.md, padding: "14px 16px", background: PAPER, border: `1px solid ${BORDER}`, borderRadius: radius.md, fontSize: fs.sm, lineHeight: 1.6, color: INK },
  solutionLabel: { fontFamily: MONO, fontSize: fs.micro, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: ACCENT, marginBottom: 6 },
  skelLine: { height: 14, borderRadius: radius.sm, background: BORDER, opacity: 0.6, margin: "6px 0", width: "100%" },
};
