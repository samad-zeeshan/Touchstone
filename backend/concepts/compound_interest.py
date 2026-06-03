import random
from typing import Optional

import compound_interest as _oracle
from compound_interest_problems import generate as _generate, FREQUENCY_WORD

from .base import Concept, Problem, money_grader, closest_match

MISCONCEPTIONS = {
    "simple-interest":
        "It looks like you added the same interest every year -- a straight "
        "line. With compounding, each year also earns interest on the previous "
        "years' interest, so it grows faster than a straight line.",
    "ignored-frequency":
        "It looks like you compounded once a year, but this one compounds more "
        "often. Each period earns interest on top of the last, so monthly or "
        "quarterly compounding earns a little more than yearly.",
    "full-rate-each-period":
        "It looks like you applied the full annual rate every period. Each "
        "period only gets a slice of the rate -- for monthly, that's the annual "
        "rate divided by 12.",
    "balance-not-interest":
        "That's the final balance. The question asked for the interest earned, "
        "which is the balance minus the amount you started with.",
}

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    p = _generate(rng=rng, template=template)
    return Problem(
        concept="compound-interest",
        template=p.template,
        params={"P": p.P, "r": p.r, "n": p.n, "t": p.t},
        prompt=p.prompt,
    )

def answer(params: dict, template: str) -> float:
    return _oracle.correct_answer(params["P"], params["r"], params["n"], params["t"], template)

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    return _oracle.diagnose(submitted, params["P"], params["r"], params["n"], params["t"], template)

def key_tokens(params: dict, template: str) -> list:
    return [
        f"${int(round(params['P'])):,}",
        f"{params['r']:.1%}",
        f"{params['t']} years",
        FREQUENCY_WORD[params["n"]],
    ]

def target_phrase(params: dict, template: str) -> str:
    return "the final balance" if template == "balance" else "the interest earned"

def render(params: dict, template: str) -> str:
    setup = (f"You deposit ${params['P']:,} at {params['r']:.1%} annual interest, "
             f"compounded {FREQUENCY_WORD[params['n']]}, for {params['t']} years.")
    tail = " What is the balance at the end?" if template == "balance" else " How much interest do you earn?"
    return setup + tail

CONCEPT = Concept(
    id="compound-interest",
    title="Compound interest",
    area="Probability & money",
    widget="curve",
    blurb="Savings don't grow in a straight line -- watch the curve pull away from your gut.",
    answer_unit="money",
    templates=("balance", "interest"),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=money_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=key_tokens,
    target_phrase=target_phrase,
)
