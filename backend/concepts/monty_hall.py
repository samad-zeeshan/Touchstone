import random
from typing import Optional

from .base import Concept, Problem, count_grader, closest_match

MISCONCEPTIONS = {
    "fifty-fifty":
        "Once a door opens, two doors are left and it feels like a coin flip -- "
        "but the host's choice wasn't random. Your first pick is still right "
        "only 1/3 of the time, so the other door carries the remaining 2/3.",
    "swapped-the-odds":
        "You've got the two outcomes backwards. Staying wins only when your "
        "first guess happened to be right (1/3 of the time); switching wins the "
        "other 2/3.",
}

_TRIALS = (300, 600, 900, 1200)

def answer(params: dict, template: str) -> float:
    trials = params["trials"]
    return trials * (2 / 3) if template == "switch" else trials / 3

def _wrong_values(params: dict, template: str) -> dict:
    trials = params["trials"]
    swapped = trials / 3 if template == "switch" else trials * (2 / 3)
    return {"fifty-fifty": trials / 2, "swapped-the-odds": swapped}

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = count_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params, template), band)

def render(params: dict, template: str) -> str:
    strategy = "ALWAYS switch" if template == "switch" else "ALWAYS stay with your first pick"
    return (f"You play {params['trials']} rounds of the 3-door Monty Hall game "
            f"and {strategy} after the host opens a losing door. About how many "
            f"rounds do you win?")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    if template is None:
        template = rng.choice(("switch", "stay"))
    params = {"trials": rng.choice(_TRIALS)}
    return Problem(
        concept="monty-hall",
        template=template,
        params=params,
        prompt=render(params, template),
    )

CONCEPT = Concept(
    id="monty-hall",
    title="Monty Hall",
    area="Probability & statistics",
    widget="trials",
    blurb="Switching doors wins 2/3 of the time. Run a thousand games and watch.",
    answer_unit="count",
    templates=("switch", "stay"),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=count_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [str(params["trials"])],
    target_phrase=lambda params, template: "the number of rounds you win",
)
