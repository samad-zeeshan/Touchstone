import random
from typing import Optional

from .base import Concept, Problem, money_grader, closest_match

MISCONCEPTIONS = {
    "best-case-only":
        "It looks like you only counted the win. Expected value also subtracts "
        "the losses, weighted by how often they happen -- the upside alone "
        "overstates what you'll make per play.",
    "ignored-probability":
        "It looks like you averaged the win and the loss as if they were equally "
        "likely. They're not -- each outcome has to be weighted by its "
        "probability before you combine them.",
}

def expected_value(win: float, loss: float, p_percent: float) -> float:
    p = p_percent / 100
    return p * win - (1 - p) * loss

def answer(params: dict, template: str) -> float:
    return expected_value(params["win"], params["loss"], params["p"])

def _wrong_values(params: dict) -> dict:
    win, loss = params["win"], params["loss"]
    return {
        "best-case-only": win,
        "ignored-probability": (win - loss) / 2,
    }

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = money_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"A bet wins ${params['win']} with probability {params['p']}%, and "
            f"loses ${params['loss']} otherwise. What is the expected value per "
            f"play? (in dollars; a loss is negative)")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    win = rng.randrange(20, 101, 10)
    loss = rng.randrange(20, 101, 10)
    p = rng.choice((20, 30, 40, 60, 70))
    params = {"win": win, "loss": loss, "p": p}
    return Problem("expected-value", "ev", params, render(params, "ev"))

CONCEPT = Concept(
    id="expected-value",
    title="Expected value of a bet",
    area="Probability & statistics",
    widget="distribution",
    blurb="Positive upside, negative expectation - the average per play isn't the best case.",
    answer_unit="money",
    templates=("ev",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=money_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [f"${params['win']}", f"{params['p']}%", f"${params['loss']}"],
    target_phrase=lambda params, template: "the expected value per play",
)
