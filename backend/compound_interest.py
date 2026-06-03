from typing import Optional

def balance(P: float, r: float, n: int, t: float) -> float:
    return P * (1 + r / n) ** (n * t)

def interest_earned(P: float, r: float, n: int, t: float) -> float:
    return balance(P, r, n, t) - P

def correct_answer(P: float, r: float, n: int, t: float, template: str) -> float:
    if template == "balance":
        return balance(P, r, n, t)
    if template == "interest":
        return interest_earned(P, r, n, t)
    raise ValueError(f"unknown template: {template!r}")

ABS_FLOOR = 0.50
REL_FRACTION = 0.001

def tolerance(correct: float) -> float:
    return max(ABS_FLOOR, REL_FRACTION * abs(correct))

def grade(submitted: float, correct: float) -> bool:
    return abs(submitted - correct) <= tolerance(correct)

def _wrong_values(P: float, r: float, n: int, t: float, template: str) -> dict:
    wrong_balance = {
        "simple-interest": P * (1 + r * t),
    }
    if n > 1:
        wrong_balance["ignored-frequency"] = P * (1 + r) ** t
        wrong_balance["full-rate-each-period"] = P * (1 + r) ** (n * t)

    if template == "balance":
        return wrong_balance

    values = {handle: bal - P for handle, bal in wrong_balance.items()}
    values["balance-not-interest"] = balance(P, r, n, t)
    return values

def diagnose(submitted: float, P: float, r: float, n: int, t: float,
             template: str) -> Optional[str]:
    band = tolerance(correct_answer(P, r, n, t, template))
    matches = [
        (handle, abs(submitted - value))
        for handle, value in _wrong_values(P, r, n, t, template).items()
        if abs(submitted - value) <= band
    ]
    if not matches:
        return None
    return min(matches, key=lambda pair: pair[1])[0]
