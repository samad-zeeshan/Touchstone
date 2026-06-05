import random
from typing import Optional

from .base import Concept, Problem, percent_grader, closest_match

MISCONCEPTIONS = {
    "linear-fraction":
        "It looks like you compared one person against the others (about "
        "k/365). The paradox is about *every pair* of people, and the number of "
        "pairs grows much faster than the number of people -- so the real "
        "probability is far higher.",
}

def collision_percent(k: int) -> float:
    p_no_match = 1.0
    for i in range(k):
        p_no_match *= (365 - i) / 365
    return (1 - p_no_match) * 100

def answer(params: dict, template: str) -> float:
    return collision_percent(params["k"])

def _wrong_values(params: dict) -> dict:
    k = params["k"]
    return {"linear-fraction": (k / 365) * 100}

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = percent_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"In a room of {params['k']} people, what is the probability that "
            f"at least two of them share a birthday? (answer as a whole-number "
            f"percentage from 0 to 100)")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    params = {"k": rng.randint(18, 45)}
    return Problem(
        concept="birthday-paradox",
        template="collision",
        params=params,
        prompt=render(params, "collision"),
    )

CONCEPT = Concept(
    id="birthday-paradox",
    title="Birthday paradox",
    area="Probability & statistics",
    widget="trials",
    blurb="23 people is enough for a coin-flip chance of a shared birthday.",
    answer_unit="percent",
    templates=("collision",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=percent_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [f"{params['k']} people"],
    target_phrase=lambda params, template: "the probability of a shared birthday",
)
