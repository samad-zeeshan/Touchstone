import random
import string
from typing import Optional

from .base import Concept, Problem, count_grader, closest_match

_E = ord("E") - ord("A")

MISCONCEPTIONS = {
    "wrong-direction":
        "It looks like you shifted the wrong way. The cipher turned plaintext "
        "into ciphertext, so to recover the shift you go from E to the cipher "
        "letter, not the other way -- they're opposite directions mod 26.",
}

def answer(params: dict, template: str) -> float:
    return float((int(params["top_idx"]) - _E) % 26)

def _wrong_values(params: dict) -> dict:
    idx = int(params["top_idx"])
    return {"wrong-direction": float((_E - idx) % 26)}

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = count_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    top = string.ascii_uppercase[int(params["top_idx"]) % 26]
    return (f"A Caesar cipher shifted every letter by a fixed amount. In the "
            f"intercepted message the most common letter is '{top}'. "
            f"English's most common letter is 'E'. By how much was the alphabet "
            f"shifted? (0-25)")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    k = rng.randint(1, 25)
    while k == 13:
        k = rng.randint(1, 25)
    top_idx = (_E + k) % 26
    params = {"top_idx": top_idx, "shift": k}
    return Problem("cipher", "find-shift", params, render(params, "find-shift"))

CONCEPT = Concept(
    id="cipher",
    title="Frequency analysis",
    area="Algorithms",
    depth="experience",
    widget="cipher",
    blurb="Ciphers leak: the letter frequencies give the shift away.",
    answer_unit="number",
    templates=("find-shift",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=count_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [],
    target_phrase=lambda params, template: "the cipher's shift",
)
