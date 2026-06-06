import random
from typing import Optional

from .base import Concept, Problem, count_grader, closest_match

MISCONCEPTIONS = {
    "no-regression":
        "It looks like you predicted the same extreme score again. Part of an "
        "extreme result is luck that won't repeat, so the retest drifts back "
        "toward the mean by a factor of (1 - r).",
    "full-regression":
        "It looks like you predicted the mean exactly. The score doesn't fall "
        "all the way back -- only the share that was luck regresses, so the "
        "prediction lands between the score and the mean.",
}

def predicted(mean: float, score: float, r: float) -> float:
    return mean + r * (score - mean)

def answer(params: dict, template: str) -> float:
    return predicted(params["mean"], params["score"], params["r"])

def _wrong_values(params: dict) -> dict:
    return {
        "no-regression": float(params["score"]),
        "full-regression": float(params["mean"]),
    }

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = count_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"On a noisy test with an average score of {params['mean']}, someone "
            f"scored {params['score']}. The test-retest correlation is "
            f"{params['r']}. What score does regression to the mean predict for "
            f"their retest?")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    mean = rng.choice((50, 100))
    delta = rng.choice((20, 40))
    r = rng.choice((0.25, 0.5, 0.75))
    sign = rng.choice((1, -1))
    score = mean + sign * delta
    params = {"mean": mean, "score": score, "r": r}
    return Problem("regression-mean", "predicted-retest", params, render(params, "predicted-retest"))

CONCEPT = Concept(
    id="regression-mean",
    title="Regression to the mean",
    area="Probability & statistics",
    widget="scatter",
    blurb="Extremes drift back toward average - the luck doesn't repeat.",
    answer_unit="number",
    templates=("predicted-retest",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=count_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [],
    target_phrase=lambda params, template: "the predicted retest score",
)
