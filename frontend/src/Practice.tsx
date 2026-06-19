import { useState, useEffect, useCallback, type ChangeEvent, type CSSProperties, type KeyboardEvent } from "react";
import { fetchProblem, gradeAttempt, type ConceptMeta, type Problem, type Outcome } from "./api";
import { INK, MUTED, SUBTLE, ACCENT, GREEN, RED, BORDER, primaryBtn, secondaryBtn, formatAnswer } from "./theme";
import MistakeClip from "./MistakeClip";
import { interactiveModes } from "./interactivePractice";

export default function Practice({ concept }: { concept: ConceptMeta }) {
  const interactive = interactiveModes(concept.id);
  const modes = [
    ...interactive,
    { id: "drill", label: "Number drill", render: () => <NumberDrill concept={concept} /> },
  ];
  const [active, setActive] = useState<string>(modes[0].id);

  if (interactive.length === 0) return <NumberDrill concept={concept} />;

  const current = modes.find((m) => m.id === active) ?? modes[modes.length - 1];
  return (
    <div style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}>
      <div style={W.modeRowWrap}>
        <div style={W.modeRow}>
          {modes.map((m) => (
            <button key={m.id} onClick={() => setActive(m.id)} style={modeBtn(m.id === active)}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
      {current.render()}
    </div>
  );
}

const W: Record<string, CSSProperties> = {
  modeRowWrap: { display: "flex", justifyContent: "center", marginBottom: 18 },
  modeRow: { display: "inline-flex", background: "#E4E4E7", borderRadius: 999, padding: 4, gap: 4, flexWrap: "wrap" },
};

function modeBtn(isActive: boolean): CSSProperties {
  return {
    border: "none",
    borderRadius: 999,
    padding: "7px 16px",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    background: isActive ? "#fff" : "transparent",
    color: isActive ? ACCENT : SUBTLE,
    boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
    fontFamily: "inherit",
  };
}

type Result =
  | { kind: "info"; message: string }
  | { kind: "outcome"; outcome: Outcome; submitted: number };

function NumberDrill({ concept }: { concept: ConceptMeta }) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [checking, setChecking] = useState<boolean>(false);
  const [showClip, setShowClip] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  const loadProblem = useCallback(async (): Promise<void> => {
    setProblem(null);
    setLoadError(false);
    setAnswer("");
    setResult(null);
    setShowClip(false);
    setShowSolution(false);
    try {
      setProblem(await fetchProblem(concept.id));
    } catch {
      setLoadError(true);
    }
  }, [concept.id]);

  useEffect(() => {
    loadProblem();
  }, [loadProblem]);

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
      setResult({ kind: "info", message: "Couldn't reach the practice server. Is it still running on port 8000?" });
    } finally {
      setChecking(false);
    }
  }

  const solved = result?.kind === "outcome" && result.outcome.correct;
  const showDollar = concept.answer_unit === "money";

  if (loadError) {
    return (
      <Shell concept={concept}>
        <p style={S.prompt}>Couldn't reach the practice server.</p>
        <p style={S.explain}>
          Start the backend - in a terminal in the <code>backend</code> folder: <code>uvicorn api:app --reload</code>
        </p>
        <button onClick={loadProblem} style={primaryBtn}>Try again</button>
      </Shell>
    );
  }

  if (!problem) {
    return (
      <Shell concept={concept}>
        <p style={{ ...S.prompt, color: MUTED }}>Loading a problem…</p>
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

      {result?.kind === "info" && <p style={{ ...S.feedback, color: MUTED }}>{result.message}</p>}

      {result?.kind === "outcome" && result.outcome.correct && (
        <div style={{ ...S.feedback, color: GREEN }}>
          <strong>Correct.</strong> The answer is {formatAnswer(result.outcome.correct_answer, concept.answer_unit)}.
        </div>
      )}

      {result?.kind === "outcome" && !result.outcome.correct && (
        <div style={S.feedback}>
          <div style={{ color: RED, fontWeight: 600 }}>
            Not quite - the answer is {formatAnswer(result.outcome.correct_answer, concept.answer_unit)}.
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
        <span style={{ ...S.tag, background: "#EFF6FF", color: "#1D4ED8" }}>AI hint</span>
        {outcome.feedback}
      </p>
    );
  }
  return <p style={S.explain}>Double-check your method, then try the next one.</p>;
}

function Shell({ concept, children }: { concept: ConceptMeta; children: React.ReactNode }) {
  return (
    <div style={S.card}>
      <div style={S.eyebrow}>Practice · {concept.title}</div>
      {children}
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  card: { background: "#FFFFFF", borderRadius: 18, padding: "30px 32px", maxWidth: 640, width: "100%", boxShadow: "0 12px 40px rgba(24,24,27,0.10)", boxSizing: "border-box" },
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 14 },
  prompt: { fontSize: 19, lineHeight: 1.5, margin: "0 0 22px", color: INK },
  inputRow: { display: "flex", alignItems: "center", border: `1.5px solid ${BORDER}`, borderRadius: 10, padding: "0 14px", marginBottom: 16 },
  dollar: { color: MUTED, fontSize: 18, marginRight: 6 },
  input: { flex: 1, border: "none", outline: "none", padding: "12px 0", fontSize: 18, fontFamily: "inherit", color: INK, background: "transparent" },
  buttons: { display: "flex", gap: 10 },
  feedback: { marginTop: 20, fontSize: 16, lineHeight: 1.5 },
  explain: { color: SUBTLE, fontSize: 15, margin: "10px 0 0", lineHeight: 1.55 },
  tag: { display: "inline-block", fontSize: 11, fontWeight: 600, background: "#FFF1E9", color: ACCENT, borderRadius: 6, padding: "2px 8px", marginRight: 8, verticalAlign: "middle", fontFamily: "ui-monospace, monospace" },
  actionRow: { display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" },
  solution: { marginTop: 14, padding: "14px 16px", background: "#F7F7F8", border: `1px solid ${BORDER}`, borderRadius: 12, fontSize: 15, lineHeight: 1.6, color: INK },
  solutionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: GREEN, marginBottom: 6 },
};
