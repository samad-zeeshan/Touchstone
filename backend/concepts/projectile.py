import random
from typing import Optional

from .base import Concept, Problem, count_grader, closest_match

MISCONCEPTIONS = {
    "must-be-45":
        "It looks like you reached for 45 degrees. 45 gives the *maximum* range, "
        "but it isn't the answer here -- range is symmetric around 45, so the "
        "matching angle is 90 minus the one you were given.",
    "same-as-given":
        "It looks like you repeated the original angle. A different angle reaches "
        "the same spot: because the range curve is symmetric about 45 degrees, "
        "theta and 90 minus theta land together.",
}

def matching_angle(theta: int) -> int:
    return 90 - theta

def answer(params: dict, template: str) -> float:
    return float(matching_angle(params["theta"]))

def _wrong_values(params: dict) -> dict:
    return {
        "must-be-45": 45.0,
        "same-as-given": float(params["theta"]),
    }

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = count_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"Thrown at {params['theta']} degrees on level ground, a ball lands a "
            f"certain distance away (ignore air resistance). At what OTHER launch "
            f"angle, at the same speed, does it land in exactly the same spot? "
            f"(in degrees)")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    theta = rng.choice((20, 25, 30, 35, 40))
    params = {"theta": theta}
    return Problem("projectile", "matching-angle", params, render(params, "matching-angle"))

CONCEPT = Concept(
    id="projectile",
    title="Projectile motion",
    area="Physics & motion",
    widget="curve",
    blurb="Two launch angles reach the same spot - range is symmetric around 45°.",
    answer_unit="number",
    templates=("matching-angle",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=count_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [],
    target_phrase=lambda params, template: "the matching launch angle",
)
