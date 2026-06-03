import pytest
from compound_interest import balance, interest_earned, grade, diagnose

def test_ex1_balance_monthly():
    assert balance(1000, 0.06, 12, 8) == pytest.approx(1614.14, abs=0.01)

def test_ex1_interest_monthly():
    assert interest_earned(1000, 0.06, 12, 8) == pytest.approx(614.14, abs=0.01)

def test_ex2_balance_quarterly():
    assert balance(5000, 0.04, 4, 10) == pytest.approx(7444.32, abs=0.01)

def test_ex3_interest_annual():
    assert interest_earned(2000, 0.05, 1, 15) == pytest.approx(2157.86, abs=0.01)

def test_grade_accepts_exact():
    correct = balance(1000, 0.06, 12, 8)
    assert grade(correct, correct)

def test_grade_accepts_reasonable_rounding():
    assert grade(1614.0, balance(1000, 0.06, 12, 8))

def test_grade_rejects_simple_interest_answer():
    assert not grade(1480.00, balance(1000, 0.06, 12, 8))

def test_diagnose_simple_interest():
    assert diagnose(1480.00, 1000, 0.06, 12, 8, "balance") == "simple-interest"

def test_diagnose_ignored_frequency():
    assert diagnose(1593.85, 1000, 0.06, 12, 8, "balance") == "ignored-frequency"

def test_diagnose_full_rate_each_period():
    wrong = 1000 * (1.06) ** (12 * 8)
    assert diagnose(wrong, 1000, 0.06, 12, 8, "balance") == "full-rate-each-period"

def test_diagnose_balance_not_interest_on_interest_template():
    reported_balance = balance(2000, 0.05, 1, 15)
    assert diagnose(reported_balance, 2000, 0.05, 1, 15, "interest") == "balance-not-interest"

def test_diagnose_long_tail_returns_none():
    assert diagnose(1234.56, 1000, 0.06, 12, 8, "balance") is None

def test_correct_answer_is_not_diagnosed_as_a_mistake():
    correct = balance(2000, 0.05, 1, 15)
    assert diagnose(correct, 2000, 0.05, 1, 15, "balance") is None
