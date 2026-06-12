"""
Worked solution text, one writer per concept.

Each writer recomputes the answer and shows the steps. solution_for dispatches by
id and falls back to a one line statement of the value for concepts without a writer.
"""

import math
import string

from . import _gametree as gt
from .base import format_value as fmt

def _fib(k: int) -> int:
    a, b = 0, 1
    for _ in range(k):
        a, b = b, a + b
    return a

def _compound(p, t):
    P, r, n, yr = p["P"], p["r"], p["n"], p["t"]
    A = P * (1 + r / n) ** (n * yr)
    s = (f"Use A = P·(1 + r/n)^(n·t) = {int(P):,}·(1 + {r:.3g}/{n})^({n}·{yr}) "
         f"= {fmt(A, 'money')}.")
    if t == "interest":
        s += f" Interest earned is that minus your {fmt(P, 'money')} principal: {fmt(A - P, 'money')}."
    return s

def _decay(p, t):
    A0, h, tt = p["A0"], p["h"], p["t"]
    ans = A0 * 0.5 ** (tt / h)
    return (f"Each half-life keeps half of what's left. {tt} years is {tt}/{h} = "
            f"{tt / h:.3g} half-lives, so {A0}·(½)^({tt}/{h}) = {fmt(ans, 'number')} mg.")

def _monty(p, t):
    tr = p["trials"]
    if t == "switch":
        return (f"Your first pick is right 1/3 of the time, so switching wins the "
                f"other 2/3: 2/3 × {tr} = {fmt(tr * 2 / 3, 'count')}.")
    return (f"Staying wins only when your first pick was already right - 1/3 of the "
            f"time: 1/3 × {tr} = {fmt(tr / 3, 'count')}.")

def _no_clash_percent(k, m):
    prob = 1.0
    for i in range(k):
        prob *= (m - i) / m
    return (1 - prob) * 100

def _birthday(p, t):
    k = p["k"]
    prob = _no_clash_percent(k, 365)
    pairs = k * (k - 1) // 2
    return (f"Find the chance NO two match first: (365/365)(364/365)…(({365 - k + 1})/365). "
            f"One minus that is {fmt(prob, 'percent')} - those {k} people make {pairs} pairs that could collide.")

def _hashing(p, t):
    k, m = p["k"], p["m"]
    prob = _no_clash_percent(k, m)
    return (f"Chance no two of {k} keys share a bucket: ({m}/{m})(({m - 1})/{m})…. "
            f"One minus that is {fmt(prob, 'percent')} - about √{m} keys is enough for even odds.")

def _base_rates(p, t):
    prev, sens, fpr = p["prev"], p["sens"], p["fpr"]
    per = 10000
    sick = per * prev / 100
    tp = sick * sens / 100
    well = per - sick
    fp = well * fpr / 100
    ans = tp / (tp + fp) * 100
    return (f"Picture 10,000 people. {sick:.0f} are sick and ~{tp:.0f} of them test positive. "
            f"{well:.0f} are healthy and {fp:.0f} of them test positive by mistake. So of all "
            f"{tp + fp:.0f} positives, only {tp:.0f} are truly sick - {fmt(ans, 'percent')}.")

def _lln(p, t):
    return ("A fair coin lands heads 50% of the time on every flip, no matter the "
            "recent streak. Over the next many flips it's about 50%.")

def _ev(p, t):
    w, l, pp = p["win"], p["loss"], p["p"]
    ev = pp / 100 * w - (1 - pp / 100) * l
    return (f"EV = (win chance)×win − (loss chance)×loss = {pp}%×${w} − {100 - pp}%×${l} "
            f"= {fmt(ev, 'money')} per play.")

def _clt(p, t):
    sigma, n = p["sigma"], p["n"]
    se = sigma / math.sqrt(n)
    return (f"Standard error = σ/√n = {sigma}/√{n} = {sigma}/{int(math.sqrt(n))} "
            f"= {fmt(se, 'number')}.")

def _regression(p, t):
    mean, score, r = p["mean"], p["score"], p["r"]
    ans = mean + r * (score - mean)
    return (f"Predicted retest = mean + r×(score − mean) = {mean} + {r}×({score} − {mean}) "
            f"= {fmt(ans, 'number')}.")

def _binary(p, t):
    n = p["n"]
    ans = int(math.floor(math.log2(n))) + 1
    return f"Each comparison halves the list, so the worst case is ⌊log₂({n:,})⌋ + 1 = {ans} comparisons."

def _sorting(p, t):
    n = p["n"]
    ans = n / math.log2(n)
    return (f"Bubble does ≈ n² comparisons and merge ≈ n·log₂n, so the ratio is "
            f"n/log₂n = {n:,}/{int(math.log2(n))} = {fmt(ans, 'count')}× more.")

def _bigo(p, t):
    a = p["a"]
    return (f"Set the two costs equal: n² = {a}·n, so n = {a}. Below {a} the big "
            f"constant makes B slower; above it, n² runs away.")

def _recursion(p, t):
    n = p["n"]
    calls = 2 * _fib(n + 1) - 1
    return f"Total calls T(n) = 2·F(n+1) − 1. For n={n}: 2·{_fib(n + 1)} − 1 = {calls}."

def _minimax(p, t):
    grid = gt.children(p)
    mins = [min(c) for c in grid]
    return (f"Back up each move by its worst reply (its minimum): {mins}. The "
            f"maximizer then takes the best of those: {max(mins)}.")

def _alpha_beta(p, t):
    count = gt.alphabeta_leaf_count(gt.children(p))
    return (f"Scanning left to right, once a move's reply drops below a value already "
            f"secured, the rest of that branch can't change the root and is skipped. "
            f"Here {count} of the 9 leaves get evaluated.")

def _grid(p, t):
    dx, dy = p["dx"], p["dy"]
    return f"On a 4-direction grid the shortest path is the Manhattan distance: {dx} across + {dy} up = {dx + dy} steps."

def _mcts(p, t):
    w, n, N = int(p["w"]), int(p["n"]), int(p["N"])
    exploit = w / n
    explore = math.sqrt(2) * math.sqrt(math.log(N) / n)
    return (f"UCB1 = wins/visits + √2·√(ln N / visits) = {w}/{n} + √2·√(ln {N}/{n}) "
            f"= {exploit:.2f} + {explore:.2f} = {fmt(exploit + explore, 'number')}.")

def _projectile(p, t):
    th = p["theta"]
    return f"Range is symmetric about 45°, so the angle landing in the same spot is 90 − {th} = {90 - th}°."

def _cipher(p, t):
    idx = int(p["top_idx"])
    top = string.ascii_uppercase[idx % 26]
    ans = (idx - 4) % 26
    return (f"The most common cipher letter '{top}' is 'E' shifted. Shift = (position of "
            f"{top} − position of E) mod 26 = ({idx} − 4) mod 26 = {ans}.")

def _supply_demand(p, t):
    a, b, c, d = p["a"], p["b"], p["c"], p["d"]
    ans = (a - c) / (b + d)
    return (f"Set quantity demanded = quantity supplied: {a} − {b}P = {c} + {d}P. "
            f"Solve for P = ({a} − {c})/({b} + {d}) = {fmt(ans, 'money')}.")

def _tax(p, t):
    b, d, T = p["b"], p["d"], p["T"]
    ans = T * d / (b + d)
    return (f"The buyers' price rises by T·d/(b+d) = {T}·{d}/({b}+{d}) = {fmt(ans, 'money')}. "
            f"The rest of the tax falls on sellers.")

def _prisoners(p, t):
    return (f"Defecting outscores cooperating in BOTH columns ({p['T']} > {p['R']} and "
            f"{p['P']} > {p['S']}), so it's the dominant strategy. Both rational players "
            f"defect and land on the punishment payoff: {p['P']}.")

SOLUTIONS = {
    "compound-interest": _compound,
    "exponential-decay": _decay,
    "monty-hall": _monty,
    "birthday-paradox": _birthday,
    "hashing-collisions": _hashing,
    "base-rates": _base_rates,
    "law-of-large-numbers": _lln,
    "expected-value": _ev,
    "central-limit": _clt,
    "regression-mean": _regression,
    "binary-search": _binary,
    "sorting-race": _sorting,
    "big-o": _bigo,
    "recursion-fib": _recursion,
    "minimax": _minimax,
    "alpha-beta": _alpha_beta,
    "grid-search": _grid,
    "mcts": _mcts,
    "projectile": _projectile,
    "cipher": _cipher,
    "supply-demand": _supply_demand,
    "tax-incidence": _tax,
    "prisoners-dilemma": _prisoners,
    "loan-amortization": None,
}

def _loan(p, t):
    P, r, yr = p["P"], p["r"], p["t"]
    i = r / 12
    n = 12 * yr
    M = P * i / (1 - (1 + i) ** (-n))
    return (f"Monthly payment M = P·i / (1 − (1+i)^−n), with i = {r:.3g}/12 and n = 12×{yr} = {n}. "
            f"That gives {fmt(M, 'money')} a month.")

SOLUTIONS["loan-amortization"] = _loan

def solution_for(concept, params: dict, template: str) -> str:
    fn = SOLUTIONS.get(concept.id)
    if fn is None:
        value = concept.answer(params, template)
        return f"The correct {concept.target_phrase(params, template)} is {fmt(value, concept.answer_unit)}."
    return fn(params, template)
