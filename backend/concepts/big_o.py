import random
from typing import Optional

from .base import Concept, Problem, count_grader, closest_match

MISCONCEPTIONS = {
    "constants-dont-matter":
        "It looks like you ignored B's constant factor and assumed the n² "
        "algorithm is always the slower one. Below the crossover the big "
        "constant actually makes B slower; they only tie at n equal to that "
        "constant.",
}

def crossover(a: int) -> int:
    return a

def answer(params: dict, template: str) -> float:
    return float(crossover(params["a"]))

def _wrong_values(params: dict) -> dict:
    return {"constants-dont-matter": 1.0}

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = count_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"Algorithm A takes n² steps. Algorithm B takes {params['a']} times "
            f"n steps. At what input size n do the two take the same number of "
            f"steps?")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    a = rng.choice((50, 100, 200, 400, 800))
    params = {"a": a}
    return Problem("big-o", "crossover", params, render(params, "crossover"))

CONCEPT = Concept(
    id="big-o",
    title="Big-O & the crossover",
    area="Algorithms",
    widget="curve",
    blurb="A bigger constant can't save a worse growth class - find where n² overtakes.",
    answer_unit="count",
    templates=("crossover",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=count_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [f"{params['a']} times n"],
    target_phrase=lambda params, template: "the crossover input size",
)
