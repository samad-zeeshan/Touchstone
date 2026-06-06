import random
from typing import Optional

from .base import Concept, Problem, percent_grader, closest_match

MISCONCEPTIONS = {
    "recent-rate-continues":
        "It looks like you carried the recent streak forward. A fair coin has no "
        "memory -- past flips don't change the odds, so over many more flips the "
        "rate settles back to 50%, whatever just happened.",
}

def answer(params: dict, template: str) -> float:
    return 50.0

def _wrong_values(params: dict) -> dict:
    return {"recent-rate-continues": params["h"] / params["n"] * 100}

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = percent_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"A fair coin came up heads {params['h']} of its last {params['n']} "
            f"flips. Over the next 10,000 flips, about what percentage will come "
            f"up heads? (whole-number %)")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    n = 10
    h = rng.choice((2, 3, 7, 8))
    params = {"h": h, "n": n}
    return Problem("law-of-large-numbers", "next-rate", params, render(params, "next-rate"))

CONCEPT = Concept(
    id="law-of-large-numbers",
    title="Law of large numbers",
    area="Probability & statistics",
    widget="trials",
    blurb="A coin has no memory - streaks don't make the next flips 'due'. Watch it converge.",
    answer_unit="percent",
    templates=("next-rate",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=percent_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [f"heads {params['h']} of its last {params['n']} flips"],
    target_phrase=lambda params, template: "the long-run percentage of heads",
)
