import random
from typing import Optional

from .base import Concept, Problem, count_grader, closest_match

MISCONCEPTIONS = {
    "expects-cooperation":
        "It looks like you assumed the other player cooperates so you both get "
        "the reward. But defecting beats cooperating no matter what they do, so "
        "a rational opponent defects too -- and so should you.",
    "grabbed-temptation":
        "It looks like you took the temptation payoff -- but that only happens "
        "if the other player cooperates while you defect. They won't: defecting "
        "is their dominant strategy as well.",
}

def answer(params: dict, template: str) -> float:
    return float(params["P"])

def _wrong_values(params: dict) -> dict:
    return {
        "expects-cooperation": float(params["R"]),
        "grabbed-temptation": float(params["T"]),
    }

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = count_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"A one-shot game; both players are rational and self-interested. "
            f"If you COOPERATE you score {params['R']} when they cooperate and "
            f"{params['S']} when they defect. If you DEFECT you score "
            f"{params['T']} when they cooperate and {params['P']} when they "
            f"defect. What payoff do you rationally end up with?")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    s = rng.randrange(0, 2)
    p = s + rng.randint(1, 2)
    r = p + rng.randint(1, 2)
    t = r + rng.randint(1, 2)
    params = {"R": r, "S": s, "T": t, "P": p}
    return Problem("prisoners-dilemma", "rational-payoff", params, render(params, "rational-payoff"))

CONCEPT = Concept(
    id="prisoners-dilemma",
    title="Prisoner's dilemma",
    area="Decisions & money",
    widget="payoff",
    blurb="Defecting dominates - two rational players both lose. See why.",
    answer_unit="number",
    templates=("rational-payoff",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=count_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [],
    target_phrase=lambda params, template: "the payoff you rationally end up with",
)
