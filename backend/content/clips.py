"""
Mistake clips: short narrated explainers keyed by concept and misconception.

CLIPS holds beat templates with {placeholders}. render_clip fills them with values
from the live problem, so the prose is canned but every number is computed fresh.
"""

from collections import defaultdict

from compound_interest_problems import FREQUENCY_WORD

def _fmt(value: float, unit: str) -> str:
    if unit == "money":
        return "$" + format(round(value), ",")
    if unit == "percent":
        return str(round(value))
    if unit == "count":
        return format(round(value), ",")
    if abs(value - round(value)) < 1e-9:
        return format(round(value), ",")
    return f"{value:,.2f}"

def _subs(concept, params: dict, correct: float, submitted: float) -> dict:
    unit = concept.answer_unit
    subs = {"correct": _fmt(correct, unit), "submitted": _fmt(submitted, unit)}
    if "r" in params:
        subs["r"] = f"{params['r']:.1%}"
    if "n" in params and concept.id == "compound-interest":
        subs["freq"] = FREQUENCY_WORD[int(params["n"])]
    if "n" in params:
        subs["n"] = format(int(params["n"]), ",")
    for key in ("trials", "h", "t", "k"):
        if key in params:
            subs[key] = format(int(params[key]), ",")
    if "P" in params:
        subs["P"] = "$" + format(int(params["P"]), ",")
    return subs

def render_clip(concept, handle: str, params: dict, template: str, submitted: float):
    by_handle = CLIPS.get(concept.id)
    if not by_handle or handle not in by_handle:
        return None
    # The correct value comes from the oracle, never from the clip data. A missing
    # placeholder defaults to empty rather than raising on format_map.
    correct = concept.answer(params, template)
    subs = defaultdict(str, _subs(concept, params, correct, submitted))
    out = []
    for beat in by_handle[handle]:
        out.append({
            "text": beat["text"].format_map(subs),
            "caption": beat["caption"],
            "cue": beat.get("cue", {}),
        })
    return out

CLIPS = {
    "compound-interest": {
        "simple-interest": [
            {"text": "You answered {submitted}. That's simple interest -- the same dollars added every year, in a straight line.",
             "caption": "Straight line", "cue": {"highlight": "intuition"}},
            {"text": "But each period earns interest on the interest, so the curve pulls above the line. The real answer is {correct}.",
             "caption": "Compounding wins", "cue": {"highlight": "gap"}},
        ],
        "ignored-frequency": [
            {"text": "Your {submitted} is what you'd get compounding just once a year.",
             "caption": "Yearly only", "cue": {"highlight": "intuition"}},
            {"text": "This one compounds {freq}, so interest builds more often. The real answer is {correct}.",
             "caption": "More often, more growth", "cue": {"highlight": "gap"}},
        ],
        "full-rate-each-period": [
            {"text": "It looks like you applied the full {r} every single period -- that gives {submitted}, far too high.",
             "caption": "Full rate each step", "cue": {"highlight": "actual"}},
            {"text": "Each period gets only a slice of the rate. Spread correctly, the answer is {correct}.",
             "caption": "A slice each period", "cue": {"highlight": "gap"}},
        ],
        "balance-not-interest": [
            {"text": "You gave {submitted} -- but that's the final balance.",
             "caption": "That's the balance", "cue": {"highlight": "endpoint"}},
            {"text": "Interest earned is the balance minus the {P} you put in, which comes to {correct}.",
             "caption": "Subtract the principal", "cue": {"highlight": "gap"}},
        ],
    },
    "exponential-decay": {
        "two-halflives-gone": [
            {"text": "You answered {submitted}, treating the decay as a straight line that hits zero at two half-lives.",
             "caption": "Straight to zero", "cue": {"highlight": "intuition"}},
            {"text": "Each half-life removes half of what's LEFT, so a long tail survives: {correct} milligrams.",
             "caption": "Long tail", "cue": {"highlight": "gap"}},
        ],
        "halve-every-year": [
            {"text": "Your {submitted} halves the amount once every year.",
             "caption": "Halving yearly", "cue": {"highlight": "intuition"}},
            {"text": "But the half-life is {h} years -- you halve once per half-life, leaving {correct} milligrams.",
             "caption": "Per half-life", "cue": {"highlight": "actual"}},
        ],
    },
    "monty-hall": {
        "fifty-fifty": [
            {"text": "You answered {submitted}, about half -- as if the open door made it a coin flip.",
             "caption": "Feels 50/50", "cue": {"variant": 0, "settle": 0.5}},
            {"text": "Your first pick wins only a third of the time, so switching wins the rest: about {correct} of {trials}.",
             "caption": "Two thirds", "cue": {"variant": 0, "settle": 0.6667}},
        ],
        "swapped-the-odds": [
            {"text": "You answered {submitted} -- right idea, wrong direction.",
             "caption": "Backwards", "cue": {"variant": 0, "settle": 0.3333}},
            {"text": "Staying wins a third; switching wins two thirds. Here that's about {correct} of {trials}.",
             "caption": "Switch wins more", "cue": {"variant": 0, "settle": 0.6667}},
        ],
    },
    "birthday-paradox": {
        "linear-fraction": [
            {"text": "You answered about {submitted} percent -- comparing one person against three hundred sixty-five days.",
             "caption": "k / 365", "cue": {"variant": 0, "settle": 0.063}},
            {"text": "But it's every PAIR of people that can match, and pairs grow fast. The real chance is {correct} percent.",
             "caption": "Count the pairs", "cue": {"variant": 0, "settle": 0.507}},
        ],
    },
    "binary-search": {
        "linear-search": [
            {"text": "You answered {submitted}, counting items one at a time.",
             "caption": "Linear scan", "cue": {"step": 1}},
            {"text": "Binary search throws away half the list each step, so {n} items need just {correct} comparisons.",
             "caption": "Halve each step", "cue": {"step": 5}},
        ],
        "halved-once": [
            {"text": "Halving once gives {submitted}, but you don't stop there.",
             "caption": "Just once?", "cue": {"step": 1}},
            {"text": "You keep halving until one item is left -- that's {correct} steps for {n} items.",
             "caption": "Keep halving", "cue": {"step": 5}},
        ],
    },
    "sorting-race": {
        "all-sorts-similar": [
            {"text": "You answered {submitted}, expecting the two sorts to do about the same work.",
             "caption": "About the same?", "cue": {"n": 256, "focus": "merge"}},
            {"text": "Bubble grows like n squared, merge like n log n. On {n} items bubble does about {correct} times more work.",
             "caption": "Not even close", "cue": {"n": 256, "focus": "bubble"}},
        ],
    },
    "recursion-fib": {
        "recursion-is-looping": [
            {"text": "You answered {submitted}, one call per number -- as a loop would do.",
             "caption": "Like a loop", "cue": {"n": 5, "memo": False}},
            {"text": "Naive recursion recomputes the same subproblems again and again: {correct} calls for fib of {n}.",
             "caption": "Exponential blowup", "cue": {"n": 5, "memo": False}},
        ],
        "value-not-calls": [
            {"text": "You answered {submitted} -- but that's the VALUE of fib of {n}.",
             "caption": "That's the value", "cue": {"n": 5, "memo": False}},
            {"text": "We asked how many CALLS it takes to get there, which is {correct}.",
             "caption": "Count the calls", "cue": {"n": 5, "memo": True}},
        ],
    },
    "loan-amortization": {
        "ignores-interest": [
            {"text": "You answered {submitted}, dividing the loan evenly over the months.",
             "caption": "Forgot interest", "cue": {"slider": 0.06, "highlight": "intuition"}},
            {"text": "Each month you also pay interest on the balance still owed, so the real payment is {correct}.",
             "caption": "Interest each month", "cue": {"slider": 0.06, "highlight": "gap"}},
        ],
    },
    "base-rates": {
        "base-rate-neglect": [
            {"text": "You answered about {submitted} percent -- but that's the test's accuracy, the chance of a positive GIVEN you're sick.",
             "caption": "Read backwards", "cue": {"variant": 0, "settle": 0.90}},
            {"text": "The disease is rare, so most positives are false alarms. The chance you're sick GIVEN a positive is only {correct} percent.",
             "caption": "Base rate flips it", "cue": {"variant": 0, "settle": 0.155}},
        ],
    },
    "hashing-collisions": {
        "buckets-feel-safe": [
            {"text": "You answered about {submitted} percent, comparing keys to buckets one at a time.",
             "caption": "k / m", "cue": {"variant": 0, "settle": 0.16}},
            {"text": "But every PAIR of keys can collide, so the real chance is far higher: {correct} percent.",
             "caption": "Count the pairs", "cue": {"variant": 0, "settle": 0.47}},
        ],
    },
    "big-o": {
        "constants-dont-matter": [
            {"text": "You answered {submitted}, as if the n² algorithm were always the slower one.",
             "caption": "Ignored the constant", "cue": {"slider": 100, "highlight": "intuition"}},
            {"text": "Below the crossover, B's big constant makes IT slower. The two tie at n equal to {correct}.",
             "caption": "Crossover", "cue": {"slider": 100, "highlight": "actual"}},
        ],
    },
    "law-of-large-numbers": {
        "recent-rate-continues": [
            {"text": "You answered about {submitted} percent, carrying the recent streak forward.",
             "caption": "Hot hand", "cue": {"variant": 0, "settle": 0.70}},
            {"text": "A fair coin has no memory, so over many more flips it returns to {correct} percent.",
             "caption": "No memory", "cue": {"variant": 0, "settle": 0.5}},
        ],
    },
    "expected-value": {
        "best-case-only": [
            {"text": "You answered {submitted} -- but that's just the win on its own.",
             "caption": "Upside only", "cue": {"settle": 80}},
            {"text": "Expected value also subtracts the losses, weighted by how often they happen, leaving {correct} per play.",
             "caption": "Net of losses", "cue": {"settle": 8}},
        ],
        "ignored-probability": [
            {"text": "You answered {submitted} -- averaging the win and loss as if they were equally likely.",
             "caption": "Even average", "cue": {"settle": 20}},
            {"text": "Weight each outcome by its probability and the expected value is {correct}.",
             "caption": "Weight by chance", "cue": {"settle": 8}},
        ],
    },
    "minimax": {
        "ignores-opponent": [
            {"text": "You answered {submitted} -- the biggest leaf anywhere in the tree.",
             "caption": "Biggest leaf", "cue": {"show": "leaves"}},
            {"text": "But the minimizer avoids it. Back up each move's worst reply, then take the max: {correct}.",
             "caption": "Min, then max", "cue": {"show": "backup"}},
        ],
    },
    "alpha-beta": {
        "must-search-all": [
            {"text": "You answered {submitted}, assuming every leaf has to be checked.",
             "caption": "All leaves", "cue": {"show": "leaves"}},
            {"text": "Once a branch can't beat what's already secured, it's skipped -- alpha-beta evaluates only {correct}.",
             "caption": "Prune", "cue": {"show": "prune"}},
        ],
    },
    "supply-demand": {
        "demand-choke-price": [
            {"text": "You answered {submitted} -- the price where demand runs out, the most anyone would pay.",
             "caption": "Choke price", "cue": {"mode": "equilibrium", "highlight": "choke"}},
            {"text": "The market clears lower, where supply actually meets demand: {correct}.",
             "caption": "Where they cross", "cue": {"mode": "equilibrium", "highlight": "cross"}},
        ],
        "ignored-supply-slope": [
            {"text": "You answered {submitted} -- solving demand against supply's base quantity only.",
             "caption": "Supply fixed?", "cue": {"mode": "equilibrium", "highlight": "supply"}},
            {"text": "Supply rises with price too, so both slopes share the denominator. The clearing price is {correct}.",
             "caption": "Both respond", "cue": {"mode": "equilibrium", "highlight": "cross"}},
        ],
    },
    "tax-incidence": {
        "statutory-equals-economic": [
            {"text": "You answered {submitted} -- the entire tax, as if buyers pay all of it.",
             "caption": "Buyer pays all?", "cue": {"mode": "tax", "highlight": "wedge"}},
            {"text": "Some passes to sellers through a lower pre-tax price, so the buyers' price rises by only {correct}.",
             "caption": "Shared burden", "cue": {"mode": "tax", "highlight": "buyer"}},
        ],
        "split-evenly": [
            {"text": "You answered {submitted} -- splitting the tax evenly in half.",
             "caption": "50/50?", "cue": {"mode": "tax", "highlight": "wedge"}},
            {"text": "The burden splits by slope, not evenly. The buyers' price rises by {correct}.",
             "caption": "Slopes decide", "cue": {"mode": "tax", "highlight": "buyer"}},
        ],
    },
    "prisoners-dilemma": {
        "expects-cooperation": [
            {"text": "You answered {submitted} -- the reward for both cooperating.",
             "caption": "Both cooperate?", "cue": {"highlight": "reward"}},
            {"text": "But defecting beats cooperating no matter what, so a rational opponent defects too. You both land on {correct}.",
             "caption": "Both defect", "cue": {"highlight": "nash"}},
        ],
        "grabbed-temptation": [
            {"text": "You answered {submitted} -- the temptation payoff.",
             "caption": "Temptation", "cue": {"highlight": "temptation"}},
            {"text": "That needs the other player to cooperate, but they won't. Mutual defection gives {correct}.",
             "caption": "They defect too", "cue": {"highlight": "nash"}},
        ],
    },
    "grid-search": {
        "diagonal-shortcut": [
            {"text": "You answered {submitted}, letting yourself cut diagonally.",
             "caption": "Diagonal?", "cue": {"radius": 12, "highlight": "diagonal"}},
            {"text": "On a 4-directional grid a diagonal is one across plus one up, so the path is {correct} steps.",
             "caption": "Across + up", "cue": {"radius": 12, "highlight": "path"}},
        ],
        "straight-line": [
            {"text": "You answered {submitted}, the straight-line distance.",
             "caption": "As the crow flies", "cue": {"radius": 12, "highlight": "diagonal"}},
            {"text": "But the path has to follow grid steps, which always sum to {correct}.",
             "caption": "Grid steps", "cue": {"radius": 12, "highlight": "path"}},
        ],
    },
    "central-limit": {
        "no-shrink": [
            {"text": "You answered {submitted} -- the population's own spread.",
             "caption": "Same spread?", "cue": {"n": 1}},
            {"text": "Averaging cancels noise, so the mean varies less. The standard error is {correct}.",
             "caption": "Shrinks by √n", "cue": {"n": 9}},
        ],
        "divide-by-n": [
            {"text": "You answered {submitted} -- dividing the spread by n.",
             "caption": "Divide by n?", "cue": {"n": 9}},
            {"text": "Averaging shrinks it by the square root of n, not n, which gives {correct}.",
             "caption": "√n, not n", "cue": {"n": 16}},
        ],
    },
    "regression-mean": {
        "no-regression": [
            {"text": "You answered {submitted} -- the same extreme score again.",
             "caption": "Same score?", "cue": {"highlight": "extreme"}},
            {"text": "The lucky part won't repeat, so the retest drifts toward the mean: {correct}.",
             "caption": "Drifts back", "cue": {"highlight": "regress"}},
        ],
        "full-regression": [
            {"text": "You answered {submitted} -- all the way back to the mean.",
             "caption": "All the way?", "cue": {"highlight": "regress"}},
            {"text": "Only the luck regresses, not the skill, so it lands partway: {correct}.",
             "caption": "Partway back", "cue": {"highlight": "regress"}},
        ],
    },
    "projectile": {
        "must-be-45": [
            {"text": "You answered 45 -- that's the angle for the FARTHEST throw, not the matching one.",
             "caption": "45 is the max", "cue": {"slider": 45, "highlight": "actual"}},
            {"text": "Range is symmetric around 45, so the angle landing in the same spot is {correct} degrees.",
             "caption": "90 − θ", "cue": {"slider": 30, "highlight": "gap"}},
        ],
        "same-as-given": [
            {"text": "You repeated the original angle -- but a DIFFERENT angle reaches the same spot.",
             "caption": "A different angle", "cue": {"slider": 30, "highlight": "actual"}},
            {"text": "Reflect it across 45 degrees and you get {correct} degrees.",
             "caption": "Reflect across 45", "cue": {"slider": 30, "highlight": "gap"}},
        ],
    },
    "mcts": {
        "exploitation-only": [
            {"text": "You answered {submitted} -- the win rate on its own.",
             "caption": "Win rate only", "cue": {"mode": "exploit"}},
            {"text": "UCB1 adds an exploration bonus for under-visited nodes, giving {correct}.",
             "caption": "+ exploration", "cue": {"mode": "ucb"}},
        ],
    },
    "cipher": {
        "wrong-direction": [
            {"text": "You answered {submitted} -- shifting the wrong way along the alphabet.",
             "caption": "Wrong way", "cue": {"shift": 0}},
            {"text": "Go from E to the cipher letter, not back -- the shift is {correct}.",
             "caption": "E to cipher", "cue": {"shift": 7}},
        ],
    },
}
