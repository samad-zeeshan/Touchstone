import random
from typing import Optional

from .base import Concept, Problem, money_grader, closest_match

MISCONCEPTIONS = {
    "statutory-equals-economic":
        "It looks like you gave the buyer the whole tax. Who the tax is levied "
        "on doesn't decide who bears it -- the slopes do. Part of it gets "
        "passed to sellers through a lower pre-tax price.",
    "split-evenly":
        "It looks like you split the tax in half. The burden splits by relative "
        "slope, not evenly -- the more inelastic side (the steeper curve) bears "
        "the larger share.",
}

def buyer_burden(b: float, d: float, T: float) -> float:
    return T * d / (b + d)

def answer(params: dict, template: str) -> float:
    return buyer_burden(params["b"], params["d"], params["T"])

def _wrong_values(params: dict) -> dict:
    return {
        "statutory-equals-economic": params["T"],
        "split-evenly": params["T"] / 2,
    }

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = money_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"Demand slopes down with slope {params['b']} (Qd = a - {params['b']}*P) "
            f"and supply slopes up with slope {params['d']} (Qs = c + {params['d']}*P). "
            f"The government adds a ${params['T']} per-unit tax. By how much does "
            f"the price buyers pay rise?")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    b = rng.choice((1, 2, 3, 4))
    d = rng.choice((1, 2, 3, 4))
    while d == b:
        d = rng.choice((1, 2, 3, 4))
    k = rng.choice((3, 4, 5, 6))
    T = (b + d) * k
    params = {"b": b, "d": d, "T": T}
    return Problem("tax-incidence", "buyer-burden", params, render(params, "buyer-burden"))

CONCEPT = Concept(
    id="tax-incidence",
    title="Tax incidence",
    area="Decisions & money",
    widget="equilibrium",
    blurb="Who writes the cheque doesn't decide who pays - the slopes do.",
    answer_unit="money",
    templates=("buyer-burden",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=money_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [],
    target_phrase=lambda params, template: "the rise in the price buyers pay",
)
