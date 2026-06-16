import math
import random

import pytest

import concepts
from concepts import binary_search, birthday_paradox, exponential_decay
from concepts import monty_hall, recursion_fib, sorting_race
from concepts import base_rates, big_o, hashing_collisions, loan_amortization
from concepts import law_of_large_numbers, expected_value, minimax, alpha_beta
from concepts import supply_demand, tax_incidence, prisoners_dilemma
from concepts import grid_search, central_limit, regression_mean
from concepts import mcts, projectile, cipher

ALL = concepts.all_concepts()

def test_registry_has_every_concept():
    ids = set(concepts.REGISTRY)
    assert ids == {
        "compound-interest", "exponential-decay", "loan-amortization",
        "monty-hall", "birthday-paradox", "base-rates", "hashing-collisions",
        "law-of-large-numbers", "expected-value", "central-limit", "regression-mean",
        "binary-search", "sorting-race", "big-o", "recursion-fib",
        "minimax", "alpha-beta", "grid-search", "mcts", "projectile", "cipher",
        "supply-demand", "tax-incidence", "prisoners-dilemma",
    }

def test_every_concept_covers_a_known_widget_family():
    for c in ALL:
        assert c.widget in {
            "curve", "trials", "stepper", "tree", "distribution", "gametree",
            "equilibrium", "payoff", "grid", "histogram", "scatter",
            "mcts", "cipher",
        }

@pytest.mark.parametrize("concept", ALL, ids=[c.id for c in ALL])
def test_generated_problem_is_self_consistent(concept):
    rng = random.Random(0)
    for _ in range(50):
        p = concept.generate(rng, None)
        assert p.concept == concept.id
        assert p.template in concept.templates
        correct = concept.answer(p.params, p.template)
        assert concept.grade(correct, correct)
        assert concept.diagnose(correct, p.params, p.template) is None
        assert concept.render(p.params, p.template) == p.prompt

@pytest.mark.parametrize("concept", ALL, ids=[c.id for c in ALL])
def test_every_concept_has_a_worked_solution(concept):
    from concepts.solutions import solution_for
    import random as _r
    p = concept.generate(_r.Random(7), None)
    text = solution_for(concept, p.params, p.template)
    assert text and len(text) > 20

@pytest.mark.parametrize("concept", ALL, ids=[c.id for c in ALL])
def test_every_misconception_is_diagnosable(concept):
    rng = random.Random(1)
    seen = set()
    for _ in range(200):
        p = concept.generate(rng, None)
        mod_wrong = _wrong_values_for(concept.id, p.params, p.template)
        for handle, value in mod_wrong.items():
            if concept.diagnose(value, p.params, p.template) == handle:
                seen.add(handle)
    assert set(concept.misconceptions) <= seen

def _wrong_values_for(concept_id, params, template):
    if concept_id == "exponential-decay":
        return exponential_decay._wrong_values(params)
    if concept_id == "monty-hall":
        return monty_hall._wrong_values(params, template)
    if concept_id == "birthday-paradox":
        return birthday_paradox._wrong_values(params)
    if concept_id == "binary-search":
        return binary_search._wrong_values(params)
    if concept_id == "sorting-race":
        return sorting_race._wrong_values(params)
    if concept_id == "recursion-fib":
        return recursion_fib._wrong_values(params)
    if concept_id == "hashing-collisions":
        return hashing_collisions._wrong_values(params)
    if concept_id == "base-rates":
        return base_rates._wrong_values(params)
    if concept_id == "big-o":
        return big_o._wrong_values(params)
    if concept_id == "loan-amortization":
        return loan_amortization._wrong_values(params)
    if concept_id == "law-of-large-numbers":
        return law_of_large_numbers._wrong_values(params)
    if concept_id == "expected-value":
        return expected_value._wrong_values(params)
    if concept_id == "minimax":
        return minimax._wrong_values(params)
    if concept_id == "alpha-beta":
        return alpha_beta._wrong_values(params)
    if concept_id == "supply-demand":
        return supply_demand._wrong_values(params)
    if concept_id == "tax-incidence":
        return tax_incidence._wrong_values(params)
    if concept_id == "prisoners-dilemma":
        return prisoners_dilemma._wrong_values(params)
    if concept_id == "grid-search":
        return grid_search._wrong_values(params)
    if concept_id == "central-limit":
        return central_limit._wrong_values(params)
    if concept_id == "regression-mean":
        return regression_mean._wrong_values(params)
    if concept_id == "mcts":
        return mcts._wrong_values(params)
    if concept_id == "projectile":
        return projectile._wrong_values(params)
    if concept_id == "cipher":
        return cipher._wrong_values(params)
    import compound_interest as ci
    return ci._wrong_values(params["P"], params["r"], params["n"], params["t"], template)

def test_exponential_decay_two_halflives():
    assert exponential_decay.remaining(1000, 5, 10) == pytest.approx(250.0, abs=0.01)

def test_exponential_decay_diagnoses_linear():
    assert exponential_decay.CONCEPT.diagnose(0.0, {"A0": 1000, "h": 5, "t": 10}, "remaining") \
        == "two-halflives-gone"

def test_monty_hall_switch_two_thirds():
    assert monty_hall.answer({"trials": 600}, "switch") == pytest.approx(400.0)
    assert monty_hall.CONCEPT.diagnose(300.0, {"trials": 600}, "switch") == "fifty-fifty"
    assert monty_hall.CONCEPT.diagnose(200.0, {"trials": 600}, "switch") == "swapped-the-odds"

def test_birthday_paradox_23_people_above_half():
    assert birthday_paradox.collision_percent(23) == pytest.approx(50.7, abs=0.1)

def test_birthday_paradox_diagnoses_linear():
    assert birthday_paradox.CONCEPT.diagnose(8.2, {"k": 30}, "collision") == "linear-fraction"

def test_binary_search_million():
    assert binary_search.worst_case_steps(1_000_000) == 20
    assert binary_search.CONCEPT.diagnose(1_000_000, {"n": 1_000_000}, "steps") == "linear-search"

def test_sorting_race_speedup():
    assert sorting_race.speedup(1024) == pytest.approx(102.4, abs=0.1)
    assert sorting_race.CONCEPT.diagnose(1.0, {"n": 1024}, "speedup") == "all-sorts-similar"

def test_recursion_fib_call_count():
    assert recursion_fib.total_calls(10) == 177
    assert recursion_fib.CONCEPT.diagnose(55, {"n": 10}, "calls") == "value-not-calls"
    assert recursion_fib.CONCEPT.diagnose(10, {"n": 10}, "calls") == "recursion-is-looping"
