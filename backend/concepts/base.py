"""
The Concept contract and the shared grading helpers.

Every concept module builds one Concept. Generation, grading, and diagnosis are
callables that stay on the server, so the answer never travels with the problem.
"""

from dataclasses import dataclass, field
from typing import Callable, Optional
import random

# A Problem deliberately has no answer field. This is the oracle guarantee at the
# data level: what we hand the client cannot leak the value it is meant to find.
@dataclass(frozen=True)
class Problem:
    concept: str
    template: str
    params: dict
    prompt: str

Params = dict

@dataclass(frozen=True)
class Concept:
    id: str
    title: str
    area: str
    widget: str
    blurb: str
    answer_unit: str
    templates: tuple
    misconceptions: dict

    # The four oracle functions. generate makes a problem, answer computes the
    # truth from params, grade scores a submission, diagnose names the likely
    # mistake. answer is never serialized to the client.
    generate: Callable[[random.Random, Optional[str]], Problem]
    answer: Callable[[Params, str], float]
    grade: Callable[[float, float], bool]
    diagnose: Callable[[float, Params, str], Optional[str]]

    depth: str = "concept"

    render: Callable[[Params, str], str] = field(
        default=lambda params, template: f"a problem with parameters {params}"
    )

    key_tokens: Callable[[Params, str], list] = field(
        default=lambda params, template: []
    )
    target_phrase: Callable[[Params, str], str] = field(
        default=lambda params, template: "the answer"
    )

def make_grader(abs_floor: float, rel_fraction: float) -> Callable[[float, float], bool]:

    # Tolerance is the larger of a fixed floor and a fraction of the answer, so a
    # rounding slip is forgiven on both tiny answers and large ones.
    def band(correct: float) -> float:
        return max(abs_floor, rel_fraction * abs(correct))

    def grade(submitted: float, correct: float) -> bool:
        return abs(submitted - correct) <= band(correct)

    # Expose the band so diagnose() can match a near miss against a known
    # misconception using the exact same window grade() used.
    grade.band = band  # type: ignore[attr-defined]
    return grade

money_grader = make_grader(0.50, 0.001)
count_grader = make_grader(0.50, 0.0)
percent_grader = make_grader(1.0, 0.0)

def format_value(value: float, unit: str) -> str:
    if unit == "money":
        return f"${value:,.2f}"
    if unit == "percent":
        return f"{round(value)}%"
    if unit == "count":
        return f"{round(value):,}"
    if abs(value - round(value)) < 1e-9:
        return f"{round(value):,}"
    return f"{value:,.2f}"

# A wrong answer can sit within range of several misconceptions. Return the
# nearest one so the feedback points at the most likely slip.
def closest_match(submitted: float, candidates: dict, band: float) -> Optional[str]:
    matches = [
        (handle, abs(submitted - value))
        for handle, value in candidates.items()
        if abs(submitted - value) <= band
    ]
    if not matches:
        return None
    return min(matches, key=lambda pair: pair[1])[0]
