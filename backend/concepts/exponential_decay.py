import random
from typing import Optional

from .base import Concept, Problem, make_grader, closest_match

_grade = make_grader(0.5, 0.005)

MISCONCEPTIONS = {
    "two-halflives-gone":
        "It looks like you treated decay as a straight line that hits zero at "
        "two half-lives. Each half-life only removes half of what's *left*, so "
        "the amount keeps halving and never fully disappears.",
    "halve-every-year":
        "It looks like you halved the amount once per year. The half-life here "
        "isn't one year -- you halve once per half-life, so divide the years by "
        "the half-life before halving.",
}

def remaining(A0: float, h: float, t: float) -> float:
    return A0 * 0.5 ** (t / h)

def answer(params: dict, template: str) -> float:
    return remaining(params["A0"], params["h"], params["t"])

def _wrong_values(params: dict) -> dict:
    A0, h, t = params["A0"], params["h"], params["t"]
    return {
        "two-halflives-gone": A0 * max(0.0, 1 - t / (2 * h)),
        "halve-every-year": A0 * 0.5 ** t,
    }

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = _grade.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"A sample starts at {params['A0']} mg of a radioactive isotope with "
            f"a half-life of {params['h']} years. How much remains after "
            f"{params['t']} years? (answer in mg)")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    A0 = rng.randrange(100, 1001, 100)
    h = rng.choice((2, 4, 5, 8, 10))
    t = rng.randint(2, 3 * h)
    while t == h:
        t = rng.randint(2, 3 * h)
    params = {"A0": A0, "h": h, "t": t}
    return Problem(
        concept="exponential-decay",
        template="remaining",
        params=params,
        prompt=render(params, "remaining"),
    )

def key_tokens(params: dict, template: str) -> list:
    return [f"{params['A0']} mg", f"{params['h']} years", f"{params['t']} years"]

CONCEPT = Concept(
    id="exponential-decay",
    title="Exponential decay & half-life",
    area="Probability & money",
    widget="curve",
    blurb="Half-life doesn't mean 'gone after two' -- the tail keeps halving forever.",
    answer_unit="number",
    templates=("remaining",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=_grade,
    diagnose=diagnose,
    render=render,
    key_tokens=key_tokens,
    target_phrase=lambda params, template: "the amount remaining",
)
