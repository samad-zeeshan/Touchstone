import type { Unit } from "./theme";

export const API = "http://localhost:8000";

export interface ConceptMeta {
  id: string;
  title: string;
  area: string;
  widget: "curve" | "trials" | "stepper" | "tree";
  blurb: string;
  answer_unit: Unit;
  templates: string[];
  depth: "experience" | "concept";
}

export interface Problem {
  concept: string;
  template: string;
  params: Record<string, number>;
  prompt: string;
  answer_unit: Unit;
}

export interface Outcome {
  correct: boolean;
  correct_answer: number;
  diagnosis: string | null;
  diagnosis_text: string | null;
  feedback: string | null;
  has_clip: boolean;
  solution: string | null;
}

export interface Beat {
  text: string;
  caption: string;
  cue: Record<string, number | string | boolean>;
  audio_url: string | null;
}

export async function fetchConcepts(): Promise<ConceptMeta[]> {
  const res = await fetch(`${API}/concepts`);
  if (!res.ok) throw new Error("bad status");
  return (await res.json()) as ConceptMeta[];
}

export async function fetchProblem(conceptId: string): Promise<Problem> {
  const res = await fetch(`${API}/concepts/${conceptId}/problem`);
  if (!res.ok) throw new Error("bad status");
  return (await res.json()) as Problem;
}

export async function gradeAttempt(
  conceptId: string,
  problem: Problem,
  submitted: number,
): Promise<Outcome> {
  const res = await fetch(`${API}/concepts/${conceptId}/attempt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template: problem.template, params: problem.params, submitted }),
  });
  if (!res.ok) throw new Error("bad status");
  return (await res.json()) as Outcome;
}

export async function fetchWalkthrough(conceptId: string): Promise<Beat[]> {
  const res = await fetch(`${API}/concepts/${conceptId}/walkthrough`);
  if (!res.ok) throw new Error("bad status");
  return ((await res.json()) as { beats: Beat[] }).beats;
}

export async function fetchClip(
  conceptId: string,
  problem: Problem,
  handle: string,
  submitted: number,
): Promise<Beat[]> {
  const res = await fetch(`${API}/concepts/${conceptId}/clip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle, template: problem.template, params: problem.params, submitted }),
  });
  if (!res.ok) throw new Error("bad status");
  return ((await res.json()) as { beats: Beat[] }).beats;
}

export function audioUrl(path: string | null): string | null {
  return path ? `${API}${path}` : null;
}
