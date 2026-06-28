"""
FastAPI surface for the tutor.

Lists concepts, serves problems, and grades attempts. All scoring runs here against
the concept oracle, so the client only ever sends a submission and gets a verdict.
"""

import os
from typing import Optional, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import concepts
from concepts.solutions import solution_for
import ai
import tts
from content import WALKTHROUGHS, CLIPS, render_clip

app = FastAPI(title="AI Tutor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.path.isdir(tts.AUDIO_DIR):
    app.mount("/audio", StaticFiles(directory=tts.AUDIO_DIR), name="audio")

class ConceptOut(BaseModel):
    id: str
    title: str
    area: str
    widget: str
    blurb: str
    answer_unit: str
    templates: list
    depth: str = "concept"

# Note what is absent: no answer field. The problem goes out, the value stays
# server side. Adding a correct_answer here would quietly break the oracle.
# The seed is the one thing we add: it is the generator seed, not the answer, and
# it lets the client re-request the very same numbers with the prose reworded or
# plain. The value stays unreachable either way.
class ProblemOut(BaseModel):
    concept: str
    template: str
    params: Dict[str, float]
    prompt: str
    answer_unit: str
    seed: int

class AttemptIn(BaseModel):
    template: str
    params: Dict[str, float]
    submitted: float

class AttemptOut(BaseModel):
    correct: bool
    correct_answer: float
    diagnosis: Optional[str]
    diagnosis_text: Optional[str]
    feedback: Optional[str]
    has_clip: bool = False
    solution: Optional[str] = None

class Beat(BaseModel):
    text: str
    caption: str
    cue: dict = {}
    audio_url: Optional[str] = None

class WalkthroughOut(BaseModel):
    concept: str
    beats: list[Beat]

class ClipIn(BaseModel):
    handle: str
    template: str
    params: Dict[str, float]
    submitted: float

class ClipOut(BaseModel):
    diagnosis: str
    beats: list[Beat]

# JSON gives us floats even for whole numbers. Snap those back to int so a count
# of 12 does not grade or render as 12.0.
def _normalize(params: dict) -> dict:
    out = {}
    for key, value in params.items():
        if isinstance(value, float) and value.is_integer():
            out[key] = int(value)
        else:
            out[key] = value
    return out

def _require(concept_id: str):
    concept = concepts.get(concept_id)
    if concept is None:
        raise HTTPException(status_code=404, detail=f"unknown concept: {concept_id}")
    return concept

@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok", "ai_enabled": ai.is_enabled(), "concepts": len(concepts.REGISTRY)}

@app.get("/concepts", response_model=list[ConceptOut])
def list_concepts():
    # Catalog shows published concepts only. Hidden ones remain reachable through
    # the /concepts/{id}/... routes below.
    return [
        ConceptOut(
            id=c.id, title=c.title, area=c.area, widget=c.widget,
            blurb=c.blurb, answer_unit=c.answer_unit, templates=list(c.templates),
            depth=c.depth,
        )
        for c in concepts.published_concepts()
    ]

@app.get("/concepts/{concept_id}/problem", response_model=ProblemOut)
def get_problem(concept_id: str, template: Optional[str] = None,
                seed: Optional[int] = None, reword: bool = True):
    import random
    concept = _require(concept_id)
    if template is not None and template not in concept.templates:
        raise HTTPException(status_code=400, detail=f"unknown template: {template}")

    # Pin a seed so generation is reproducible. When the client does not supply
    # one we choose it here and return it, which is what lets the AI toggle ask
    # for the exact same numbers again with the prose reworded or plain.
    if seed is None:
        seed = random.randrange(2**31)
    problem = concept.generate(random.Random(seed), template)

    # The one place AI sees a prompt. reword=false skips the model and returns the
    # deterministic template prose. Either way the key-tokens guard means the
    # params above are what the student actually solves against.
    prompt = (
        ai.reword_problem(problem.prompt, concept.key_tokens(problem.params, problem.template))
        if reword else problem.prompt
    )
    return ProblemOut(
        concept=concept.id,
        template=problem.template,
        params=problem.params,
        prompt=prompt,
        answer_unit=concept.answer_unit,
        seed=seed,
    )

@app.post("/concepts/{concept_id}/attempt", response_model=AttemptOut)
def post_attempt(concept_id: str, attempt: AttemptIn):
    concept = _require(concept_id)
    if attempt.template not in concept.templates:
        raise HTTPException(status_code=400, detail=f"unknown template: {attempt.template}")

    params = _normalize(attempt.params)
    try:
        correct = concept.answer(params, attempt.template)
    except (KeyError, ValueError, TypeError) as exc:
        raise HTTPException(status_code=422, detail=f"bad params: {exc}")

    is_correct = concept.grade(attempt.submitted, correct)
    diagnosis = None if is_correct else concept.diagnose(attempt.submitted, params, attempt.template)
    diagnosis_text = concept.misconceptions.get(diagnosis) if diagnosis else None

    # Feedback chain. A deterministic diagnosis wins. AI is asked for a hint only
    # when the concept cannot name the mistake itself.
    feedback = None
    if not is_correct and diagnosis is None:
        feedback = ai.explain_mistake(
            concept.title,
            concept.render(params, attempt.template),
            concept.target_phrase(params, attempt.template),
            correct, attempt.submitted, concept.answer_unit,
        )

    has_clip = bool(diagnosis and CLIPS.get(concept.id, {}).get(diagnosis))

    return AttemptOut(
        correct=is_correct,
        correct_answer=correct,
        diagnosis=diagnosis,
        diagnosis_text=diagnosis_text,
        feedback=feedback,
        has_clip=has_clip,
        solution=solution_for(concept, params, attempt.template),
    )

@app.get("/concepts/{concept_id}/walkthrough", response_model=WalkthroughOut)
def get_walkthrough(concept_id: str):
    _require(concept_id)
    beats = WALKTHROUGHS.get(concept_id)
    if not beats:
        raise HTTPException(status_code=404, detail=f"no walkthrough for {concept_id}")
    return WalkthroughOut(
        concept=concept_id,
        beats=[
            Beat(text=b["text"], caption=b["caption"], cue=b.get("cue", {}),
                 audio_url=tts.audio_url_for(b["text"]))
            for b in beats
        ],
    )

@app.post("/concepts/{concept_id}/clip", response_model=ClipOut)
def get_clip(concept_id: str, body: ClipIn):
    concept = _require(concept_id)
    if body.template not in concept.templates:
        raise HTTPException(status_code=400, detail=f"unknown template: {body.template}")
    params = _normalize(body.params)
    beats = render_clip(concept, body.handle, params, body.template, body.submitted)
    if beats is None:
        raise HTTPException(status_code=404, detail=f"no clip for {concept_id}/{body.handle}")
    return ClipOut(
        diagnosis=body.handle,
        beats=[Beat(text=b["text"], caption=b["caption"], cue=b.get("cue", {})) for b in beats],
    )

@app.get("/problem", response_model=ProblemOut)
def get_problem_legacy(template: Optional[str] = None):
    return get_problem("compound-interest", template)

@app.post("/attempt", response_model=AttemptOut)
def post_attempt_legacy(attempt: AttemptIn):
    return post_attempt("compound-interest", attempt)
