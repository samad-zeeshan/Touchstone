import math
import random
from typing import Optional

from .base import Concept, Problem, count_grader, closest_match

MISCONCEPTIONS = {
    "diagonal-shortcut":
        "It looks like you let yourself move diagonally. On a 4-directional grid "
        "you can only step up, down, left, or right, so a diagonal counts as one "
        "across plus one up -- the distance is dx + dy.",
    "straight-line":
        "It looks like you measured the straight-line (Euclidean) distance. The "
        "path has to follow grid steps, so it's dx + dy, always at least as long "
        "as the diagonal.",
}

def shortest_path(dx: int, dy: int) -> int:
    return dx + dy

def answer(params: dict, template: str) -> float:
    return float(shortest_path(params["dx"], params["dy"]))

def _wrong_values(params: dict) -> dict:
    dx, dy = params["dx"], params["dy"]
    return {
        "diagonal-shortcut": float(max(dx, dy)),
        "straight-line": float(round(math.sqrt(dx * dx + dy * dy))),
    }

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = count_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"On a grid you can only move up, down, left, or right -- never "
            f"diagonally. A goal sits {params['dx']} columns across and "
            f"{params['dy']} rows away from the start. What is the length of the "
            f"shortest path, in steps?")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    while True:
        dx = rng.randint(2, 9)
        dy = rng.randint(2, 9)
        if max(dx, dy) != round(math.sqrt(dx * dx + dy * dy)):
            break
    params = {"dx": dx, "dy": dy}
    return Problem("grid-search", "shortest-path", params, render(params, "shortest-path"))

CONCEPT = Concept(
    id="grid-search",
    title="BFS & shortest paths",
    area="Algorithms",
    depth="experience",
    widget="grid",
    blurb="BFS expands in rings and finds the shortest path - no diagonal shortcuts.",
    answer_unit="count",
    templates=("shortest-path",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=count_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [],
    target_phrase=lambda params, template: "the shortest path length",
)
