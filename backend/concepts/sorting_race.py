import math
import random
from typing import Optional

from .base import Concept, Problem, count_grader, closest_match

MISCONCEPTIONS = {
    "all-sorts-similar":
        "It looks like you expected the two sorts to be about the same. They "
        "share the goal but not the cost: bubble sort's work grows like n² "
        "while merge sort's grows like n·log₂(n), so the slower one falls "
        "further behind as the list gets longer.",
}

_SIZES = (64, 128, 256, 1024, 4096, 65536)

def speedup(n: int) -> float:
    return n / math.log2(n)

def answer(params: dict, template: str) -> float:
    return speedup(params["n"])

def _wrong_values(params: dict) -> dict:
    return {"all-sorts-similar": 1.0}

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = count_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"Bubble sort makes about n² comparisons; merge sort about "
            f"n·log₂(n). On a list of {params['n']:,} items, how many times "
            f"MORE comparisons does bubble sort make? (round to the nearest "
            f"whole number)")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    params = {"n": rng.choice(_SIZES)}
    return Problem(
        concept="sorting-race",
        template="speedup",
        params=params,
        prompt=render(params, "speedup"),
    )

CONCEPT = Concept(
    id="sorting-race",
    title="Sorting race",
    area="Algorithms",
    depth="experience",
    widget="stepper",
    blurb="Bubble vs merge: the gap between O(n²) and O(n log n), raced side by side.",
    answer_unit="count",
    templates=("speedup",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=count_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [f"{params['n']:,}"],
    target_phrase=lambda params, template: "how many times more comparisons bubble sort makes",
)
