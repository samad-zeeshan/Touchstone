import random
import pytest

from compound_interest_problems import generate, Problem, TEMPLATES, FREQUENCY_WORD
from compound_interest import correct_answer, grade, diagnose

N_SAMPLES = 300

def _many(seed=0):
    rng = random.Random(seed)
    return [generate(rng) for _ in range(N_SAMPLES)]

def test_parameters_stay_in_range():
    for p in _many():
        assert p.template in TEMPLATES
        assert 500 <= p.P <= 10_000 and p.P % 500 == 0
        pct_tenths = round(p.r * 1000)
        assert 30 <= pct_tenths <= 100 and pct_tenths % 5 == 0
        assert p.n in (1, 4, 12)
        assert 5 <= p.t <= 20

def test_prompt_mentions_the_numbers():
    for p in _many():
        assert isinstance(p.prompt, str) and p.prompt
        assert f"${p.P:,}" in p.prompt
        assert f"{p.t} years" in p.prompt
        assert FREQUENCY_WORD[p.n] in p.prompt

def test_template_is_honored_when_forced():
    rng = random.Random(1)
    assert generate(rng, template="balance").template == "balance"
    assert generate(rng, template="interest").template == "interest"

def test_unknown_template_is_rejected():
    with pytest.raises(ValueError):
        generate(template="nonsense")

def test_same_seed_gives_same_problem():
    assert generate(random.Random(7)) == generate(random.Random(7))

def test_generator_produces_variety():
    shapes = {(p.template, p.P, p.r, p.n, p.t) for p in _many()}
    assert len(shapes) > 1

def test_oracle_handles_every_generated_problem():
    for p in _many():
        correct = correct_answer(p.P, p.r, p.n, p.t, p.template)
        assert grade(correct, correct)
        assert not grade(correct + 10_000, correct)
        assert diagnose(correct, p.P, p.r, p.n, p.t, p.template) is None
