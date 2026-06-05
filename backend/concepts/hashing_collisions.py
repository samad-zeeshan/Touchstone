import math
import random
from typing import Optional

from .base import Concept, Problem, percent_grader, closest_match

MISCONCEPTIONS = {
    "buckets-feel-safe":
        "It looks like you compared keys to buckets one at a time (about k/m). "
        "Collisions are about every PAIR of keys landing together, and pairs "
        "grow far faster than keys -- so even with plenty of buckets a clash is "
        "likely much sooner than it feels.",
}

def collision_percent(k: int, m: int) -> float:
    p_no_clash = 1.0
    for i in range(k):
        p_no_clash *= (m - i) / m
    return (1 - p_no_clash) * 100

def answer(params: dict, template: str) -> float:
    return collision_percent(params["k"], params["m"])

def _wrong_values(params: dict) -> dict:
    return {"buckets-feel-safe": (params["k"] / params["m"]) * 100}

def diagnose(submitted: float, params: dict, template: str) -> Optional[str]:
    band = percent_grader.band(answer(params, template))  # type: ignore[attr-defined]
    return closest_match(submitted, _wrong_values(params), band)

def render(params: dict, template: str) -> str:
    return (f"A hash table has {params['m']} buckets. You insert {params['k']} "
            f"keys, each landing in a uniformly random bucket. What is the "
            f"probability that at least two keys collide? (whole-number %)")

def generate(rng: random.Random, template: Optional[str] = None) -> Problem:
    m = rng.choice((30, 50, 75, 100))
    root = int(round(math.sqrt(m)))
    k = rng.randint(max(5, root), int(round(1.8 * root)))
    params = {"k": k, "m": m}
    return Problem("hashing-collisions", "collision", params, render(params, "collision"))

CONCEPT = Concept(
    id="hashing-collisions",
    title="Hashing & collisions",
    area="Probability & statistics",
    widget="trials",
    blurb="With m buckets, collisions appear around √m keys - far sooner than it feels.",
    answer_unit="percent",
    templates=("collision",),
    misconceptions=MISCONCEPTIONS,
    generate=generate,
    answer=answer,
    grade=percent_grader,
    diagnose=diagnose,
    render=render,
    key_tokens=lambda params, template: [f"{params['m']} buckets", f"{params['k']} keys"],
    target_phrase=lambda params, template: "the collision probability",
)
