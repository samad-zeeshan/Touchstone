import random
from typing import Optional

from .base import Concept, Problem, percent_grader, closest_match

MISCONCEPTIONS = {
    "base-rate-neglect":
        "It looks like you read the test's accuracy as your chance of being "
        "sick -- that's P(positive given sick), not P(sick given positive). "
        "Because the disease is rare, most positives are healthy people caught "
        "by the false-positive rate, so the real chance is far lower.",
}

def posterior_percent(prev: float, sens: float, fpr: float) -> float:
    ps, se, fp = prev / 100, sens / 100, fpr / 100
    return (ps * se) / (ps * se + (1 - ps) * fp) * 100

def answer(params: dict, template: str) -> float:
    return posterior_percent(params["prev"], params["sens"], params["fpr"])

def _wrong_values(params: dict) -> dict:
    return {"base-rate-neglect": params["sens"]}

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = percent_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"A disease affects {params['prev']}% of people. A test catches "
            f"{params['sens']}% of true cases but also flags {params['fpr']}% of "
            f"healthy people. You test positive. What is the chance you actually "
            f"have the disease? (whole-number %)")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    prev = rng.choice((1, 2, 5))
    sens = rng.choice((90, 95, 99))
    fpr = rng.choice((5, 10))
    params = {"prev": prev, "sens": sens, "fpr": fpr}
    return Problem("base-rates", "posterior", params, render(params, "posterior"))

CONCEPT = Concept(
    id="base-rates",
    title="Base rates & Bayes",
    area="Probability & statistics",
    widget="trials",
    blurb="A positive test on a rare disease usually means you're fine. Run the patients.",
    answer_unit="percent",
    templates=("posterior",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=percent_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [f"{params['prev']}%", f"{params['sens']}%", f"{params['fpr']}%"],
    target_phrase=lambda params, template: "the chance you actually have the disease",
)
