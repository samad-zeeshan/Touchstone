import random
from typing import Optional

from .base import Concept, Problem, count_grader, closest_match
from . import _gametree as gt

LEAVES = 9

MISCONCEPTIONS = {
    "must-search-all":
        "It looks like you assumed every leaf has to be checked. Once a move's "
        "reply drops below a value you've already guaranteed, the rest of that "
        "branch can't change the root -- so alpha-beta skips it.",
}

def answer(params: dict, template: str) -> float:
    return float(gt.alphabeta_leaf_count(gt.children(params)))

def _wrong_values(params: dict) -> dict:
    return {"must-search-all": float(LEAVES)}

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = count_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    grid = gt.children(params)
    return (f"A maximizer's tree with three moves, each with three leaves -- "
            f"{gt.describe(grid)}. Scanning moves and leaves left to right, how "
            f"many of the {LEAVES} leaves does alpha-beta actually evaluate "
            f"before it can stop?")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    while True:
        grid = [[rng.randint(1, 9) for _ in range(3)] for _ in range(3)]
        if gt.alphabeta_leaf_count(grid) < LEAVES:
            break
    params = gt.flatten(grid)
    return Problem("alpha-beta", "leaves-evaluated", params, render(params, "leaves-evaluated"))

CONCEPT = Concept(
    id="alpha-beta",
    title="Alpha-beta pruning",
    area="Algorithms",
    depth="experience",
    widget="gametree",
    blurb="Same answer as minimax, fewer leaves - prune what can't change the result.",
    answer_unit="count",
    templates=("leaves-evaluated",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=count_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [],
    target_phrase=lambda params, template: "the number of leaves evaluated",
)
