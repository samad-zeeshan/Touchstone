import random
from typing import Optional

from .base import Concept, Problem, count_grader, closest_match

MISCONCEPTIONS = {
    "recursion-is-looping":
        "It looks like you counted one call per value, as a loop would. Naive "
        "recursion re-derives fib(n-1) and fib(n-2) separately, so the same "
        "subproblems are recomputed again and again -- the call count explodes "
        "exponentially.",
    "value-not-calls":
        "That's the value of fib(n), not how many calls it took to get there. "
        "Computing it naively makes far more calls than the answer itself.",
}

def _fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

def total_calls(n: int) -> int:
    return 2 * _fib(n + 1) - 1

def answer(params: dict, template: str) -> float:
    return float(total_calls(params["n"]))

def _wrong_values(params: dict) -> dict:
    n = params["n"]
    return {
        "recursion-is-looping": float(n),
        "value-not-calls": float(_fib(n)),
    }

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = count_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"Using the naive definition fib(n) = fib(n-1) + fib(n-2) with "
            f"fib(1) = fib(2) = 1, how many total calls to fib are made when "
            f"computing fib({params['n']})?")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    params = {"n": rng.randint(6, 15)}
    return Problem(
        concept="recursion-fib",
        template="calls",
        params=params,
        prompt=render(params, "calls"),
    )

CONCEPT = Concept(
    id="recursion-fib",
    title="Recursion & the call stack",
    area="Algorithms",
    depth="experience",
    widget="tree",
    blurb="Naive fib(n) explodes into thousands of calls -- then memoization saves it.",
    answer_unit="count",
    templates=("calls",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=count_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [f"fib({params['n']})"],
    target_phrase=lambda params, template: "the total number of calls",
)
