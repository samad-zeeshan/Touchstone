import random
from typing import Optional

from .base import Concept, Problem, money_grader, closest_match

MISCONCEPTIONS = {
    "demand-choke-price":
        "It looks like you found the price where demand hits zero -- the most "
        "anyone would pay. The market clears lower than that, where supply and "
        "demand quantities actually meet.",
    "ignored-supply-slope":
        "It looks like you set demand against the supply's base quantity and "
        "forgot that supply rises with price too. Both sides respond to P, so "
        "both slopes belong in the denominator.",
}

def equilibrium_price(a: float, b: float, c: float, d: float) -> float:
    return (a - c) / (b + d)

def answer(params: dict, template: str) -> float:
    return equilibrium_price(params["a"], params["b"], params["c"], params["d"])

def _wrong_values(params: dict) -> dict:
    a, b, c, d = params["a"], params["b"], params["c"], params["d"]
    return {
        "demand-choke-price": a / b,
        "ignored-supply-slope": (a - c) / b,
    }

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = money_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"Demand is Qd = {params['a']} - {params['b']}*P and supply is "
            f"Qs = {params['c']} + {params['d']}*P. At what price P does the "
            f"market clear (quantity demanded equals quantity supplied)?")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    while True:
        b = rng.choice((1, 2, 3))
        d = rng.choice((1, 2, 3))
        a = rng.randrange(60, 121, 2)
        c = rng.randrange(0, 31, 2)
        if (a - c) % (b + d) != 0:
            continue
        p = (a - c) / (b + d)
        q = a - b * p
        wrong = {"choke": a / b, "ignore": (a - c) / b}
        if p > 0 and q > 0 and p != wrong["choke"] and p != wrong["ignore"]:
            break
    params = {"a": a, "b": b, "c": c, "d": d}
    return Problem("supply-demand", "equilibrium-price", params, render(params, "equilibrium-price"))

CONCEPT = Concept(
    id="supply-demand",
    title="Supply & demand equilibrium",
    area="Decisions & money",
    widget="equilibrium",
    blurb="The market clears where the curves cross - not where demand runs out.",
    answer_unit="money",
    templates=("equilibrium-price",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=money_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [],
    target_phrase=lambda params, template: "the equilibrium price",
)
