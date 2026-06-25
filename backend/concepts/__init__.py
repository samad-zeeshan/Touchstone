"""
Concept registry. Imports every concept module and indexes it by id.

Membership is the explicit _MODULES tuple, not auto discovery, so adding a concept
is a deliberate edit here.
"""

from typing import Optional

from .base import Concept, Problem
from . import (
    compound_interest,
    exponential_decay,
    loan_amortization,
    monty_hall,
    birthday_paradox,
    base_rates,
    hashing_collisions,
    law_of_large_numbers,
    expected_value,
    central_limit,
    regression_mean,
    binary_search,
    sorting_race,
    big_o,
    recursion_fib,
    minimax,
    alpha_beta,
    grid_search,
    mcts,
    projectile,
    cipher,
    supply_demand,
    tax_incidence,
    prisoners_dilemma,
)

_MODULES = (
    compound_interest,
    exponential_decay,
    loan_amortization,
    monty_hall,
    birthday_paradox,
    base_rates,
    hashing_collisions,
    law_of_large_numbers,
    expected_value,
    central_limit,
    regression_mean,
    binary_search,
    sorting_race,
    big_o,
    recursion_fib,
    minimax,
    alpha_beta,
    grid_search,
    mcts,
    projectile,
    cipher,
    supply_demand,
    tax_incidence,
    prisoners_dilemma,
)

REGISTRY: dict = {}
for _module in _MODULES:
    _concept: Concept = _module.CONCEPT
    # The id is the public handle in URLs and tests. Fail loud on a collision
    # rather than letting one concept silently shadow another.
    if _concept.id in REGISTRY:
        raise ValueError(f"duplicate concept id: {_concept.id}")
    REGISTRY[_concept.id] = _concept

# The single source of truth for catalog visibility. Only these ids surface in
# the listing. Everything else stays registered, tested, and reachable by direct
# id, just hidden from the catalog until it is flagged here.
PUBLISHED_IDS = frozenset({
    "sorting-race", "binary-search",   # the two with full interactive practice
    "minimax", "alpha-beta", "mcts",   # the game-AI cluster
    "cipher",                          # the cryptanalysis experience
})

def get(concept_id: str) -> Optional[Concept]:
    return REGISTRY.get(concept_id)

def all_concepts() -> list:
    return list(REGISTRY.values())

# Catalog listing draws from this. Direct-id endpoints keep using the full
# REGISTRY, so hidden concepts stay reachable, just unlisted.
def published_concepts() -> list:
    return [c for c in REGISTRY.values() if c.id in PUBLISHED_IDS]

__all__ = ["REGISTRY", "Concept", "Problem", "get", "all_concepts",
           "published_concepts", "PUBLISHED_IDS"]
