import random
from typing import Optional

from .base import Concept, Problem, money_grader, closest_match

MISCONCEPTIONS = {
    "ignores-interest":
        "It looks like you split the principal evenly over the months and "
        "forgot the interest. Each month you also pay interest on the balance "
        "that's still outstanding, so the real payment is higher.",
}

def monthly_payment(P: float, r: float, t: int) -> float:
    i = r / 12
    n = 12 * t
    return P * i / (1 - (1 + i) ** (-n))

def answer(params: dict, template: str) -> float:
    return monthly_payment(params["P"], params["r"], params["t"])

def _wrong_values(params: dict) -> dict:
    return {"ignores-interest": params["P"] / (12 * params["t"])}

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = money_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"You borrow ${params['P']:,} at {params['r']:.1%} annual interest, "
            f"repaid in equal monthly payments over {params['t']} years. What is "
            f"the monthly payment?")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    P = rng.randrange(5000, 30001, 1000)
    r = rng.choice((0.04, 0.05, 0.06, 0.07, 0.08))
    t = rng.choice((5, 10, 15, 20))
    params = {"P": P, "r": r, "t": t}
    return Problem("loan-amortization", "payment", params, render(params, "payment"))

CONCEPT = Concept(
    id="loan-amortization",
    title="Loan amortization",
    area="Probability & money",
    widget="curve",
    blurb="Early payments are almost all interest - the balance doesn't fall in a line.",
    answer_unit="money",
    templates=("payment",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=money_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [f"${params['P']:,}", f"{params['r']:.1%}", f"{params['t']} years"],
    target_phrase=lambda params, template: "the monthly payment",
)
