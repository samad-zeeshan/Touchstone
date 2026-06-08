import math
import random
from typing import Optional

from .base import Concept, Problem, make_grader, closest_match

_grade = make_grader(0.05, 0.0)
_C = math.sqrt(2)

MISCONCEPTIONS = {
    "exploitation-only":
        "It looks like you used only the win rate. UCB1 adds an exploration "
        "bonus that's larger for less-visited children, so MCTS will try a "
        "promising move it hasn't sampled much -- it isn't pure greedy.",
}

def ucb1(w: int, n: int, N: int) -> float:
    return w / n + _C * math.sqrt(math.log(N) / n)

def answer(params: dict, template: str) -> float:
    return ucb1(int(params["w"]), int(params["n"]), int(params["N"]))

def _wrong_values(params: dict) -> dict:
    return {"exploitation-only": params["w"] / params["n"]}

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = _grade.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"MCTS uses the exploration constant sqrt(2). A child node has won "
            f"{params['w']} of its {params['n']} simulations, and its parent has "
            f"{params['N']} total visits. What is the child's UCB1 score? "
            f"(round to 2 decimals)")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    N = rng.choice((50, 100, 200))
    n = rng.choice((5, 10, 20, 25))
    w = rng.randint(1, n - 1)
    params = {"w": w, "n": n, "N": N}
    return Problem("mcts", "ucb1", params, render(params, "ucb1"))

CONCEPT = Concept(
    id="mcts",
    title="Monte Carlo Tree Search",
    area="Algorithms",
    depth="experience",
    widget="mcts",
    blurb="Not random - UCB1 balances win rate against trying the under-explored.",
    answer_unit="number",
    templates=("ucb1",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=_grade,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [],
    target_phrase=lambda params, template: "the UCB1 score",
)
