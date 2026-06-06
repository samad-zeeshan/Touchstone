import math
import random
from typing import Optional

from .base import Concept, Problem, count_grader, closest_match

MISCONCEPTIONS = {
    "no-shrink":
        "It looks like you used the population's own spread. Averaging several "
        "values cancels out some of the noise, so the mean varies LESS than a "
        "single observation -- by a factor of sqrt(n).",
    "divide-by-n":
        "It looks like you divided the spread by n. Averaging shrinks the "
        "standard deviation by sqrt(n), not n -- so four times the sample size "
        "halves the spread, not quarters it.",
}

def standard_error(sigma: float, n: int) -> float:
    return sigma / math.sqrt(n)

def answer(params: dict, template: str) -> float:
    return standard_error(params["sigma"], params["n"])

def _wrong_values(params: dict) -> dict:
    return {
        "no-shrink": float(params["sigma"]),
        "divide-by-n": params["sigma"] / params["n"],
    }

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = count_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"A population of measurements has a standard deviation of "
            f"{params['sigma']}. You repeatedly take the mean of {params['n']} of "
            f"them. What is the standard deviation of those sample means (the "
            f"standard error)?")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    m = rng.choice((2, 3, 4, 5))
    a = rng.randint(4, 12)
    sigma = m * a
    n = m * m
    params = {"sigma": sigma, "n": n}
    return Problem("central-limit", "standard-error", params, render(params, "standard-error"))

CONCEPT = Concept(
    id="central-limit",
    title="Central Limit Theorem",
    area="Probability & statistics",
    widget="histogram",
    blurb="Averages cluster into a bell - and their spread shrinks like √n, not n.",
    answer_unit="number",
    templates=("standard-error",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=count_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [],
    target_phrase=lambda params, template: "the standard error of the mean",
)
