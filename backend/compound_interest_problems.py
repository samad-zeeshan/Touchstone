from dataclasses import dataclass
from typing import Optional
import random

TEMPLATES = ("balance", "interest")

FREQUENCY_WORD = {1: "annually", 4: "quarterly", 12: "monthly"}

@dataclass(frozen=True)
class Problem:
    template: str
    P: int
    r: float
    n: int
    t: int
    prompt: str

def _render(template: str, P: int, r: float, n: int, t: int) -> str:
    setup = (f"You deposit ${P:,} at {r:.1%} annual interest, "
             f"compounded {FREQUENCY_WORD[n]}, for {t} years.")
    if template == "balance":
        return f"{setup} What is the balance at the end?"
    if template == "interest":
        return f"{setup} How much interest do you earn?"
    raise ValueError(f"unknown template: {template!r}")

def generate(rng: Optional[random.Random] = None,
             template: Optional[str] = None) -> Problem:
    rng = rng or random.Random()

    if template is None:
        template = rng.choice(TEMPLATES)
    elif template not in TEMPLATES:
        raise ValueError(f"unknown template: {template!r}")

    P = rng.randrange(500, 10_001, 500)
    r = rng.randrange(30, 101, 5) / 1000.0
    n = rng.choice((1, 4, 12))
    t = rng.randint(5, 20)

    return Problem(template, P, r, n, t, _render(template, P, r, n, t))
