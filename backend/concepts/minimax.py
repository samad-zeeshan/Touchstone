import random
from typing import Optional

from .base import Concept, Problem, count_grader, closest_match
from . import _gametree as gt

MISCONCEPTIONS = {
    "ignores-opponent":
        "It looks like you took the biggest leaf in the whole tree -- but the "
        "minimizer moves first and will avoid it. Each move is only worth its "
        "WORST reply, so back up the minimum of each branch, then take the max.",
}

def answer(params: dict, template: str) -> float:
    return float(gt.minimax_value(gt.children(params)))

def _wrong_values(params: dict) -> dict:
    grid = gt.children(params)
    return {"ignores-opponent": float(max(max(child) for child in grid))}

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = count_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    grid = gt.children(params)
    return (f"It's the maximizer's turn at the root. Each move leads to the "
            f"minimizer's reply with these leaf values -- {gt.describe(grid)}. "
            f"If both play optimally, what value backs up to the root?")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    while True:
        grid = [[rng.randint(1, 9) for _ in range(3)] for _ in range(3)]
        if gt.minimax_value(grid) != max(max(c) for c in grid):
            break
    params = gt.flatten(grid)
    return Problem("minimax", "root-value", params, render(params, "root-value"))

CONCEPT = Concept(
    id="minimax",
    title="Minimax",
    area="Algorithms",
    depth="experience",
    widget="gametree",
    blurb="The opponent moves too - each choice is only worth its worst reply.",
    answer_unit="number",
    templates=("root-value",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=count_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [],
    target_phrase=lambda params, template: "the value that backs up to the root",
)
