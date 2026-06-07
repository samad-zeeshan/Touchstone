import math
import random
from typing import Optional

from .base import Concept, Problem, count_grader, closest_match

MISCONCEPTIONS = {
    "linear-search":
        "It looks like you counted checking items one at a time. Binary search "
        "throws away half the remaining items every comparison, so the count "
        "grows like log2(n), not n -- a million items need only about 20.",
    "halved-once":
        "Halving once isn't the whole story -- you halve again and again until "
        "one item is left. That's log2(n) halvings, not n/2.",
}

def worst_case_steps(n: int) -> int:
    return int(math.floor(math.log2(n))) + 1

def answer(params: dict, template: str) -> float:
    return float(worst_case_steps(params["n"]))

def _wrong_values(params: dict) -> dict:
    n = params["n"]
    return {"linear-search": float(n), "halved-once": n / 2}

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = count_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

_SIZES = (16, 50, 100, 256, 1000, 4096, 100_000, 1_000_000)

def render(params: dict, template: str) -> str:
    return (f"A sorted list has {params['n']:,} items. In the worst case, how "
            f"many comparisons does binary search make to find an item "
            f"(or report that it's missing)?")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    params = {"n": rng.choice(_SIZES)}
    return Problem(
        concept="binary-search",
        template="steps",
        params=params,
        prompt=render(params, "steps"),
    )

CONCEPT = Concept(
    id="binary-search",
    title="Binary search",
    area="Algorithms",
    depth="experience",
    widget="stepper",
    blurb="A million sorted items, found in about 20 steps. Watch the window collapse.",
    answer_unit="count",
    templates=("steps",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=count_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [f"{params['n']:,}"],
    target_phrase=lambda params, template: "the number of comparisons",
)
