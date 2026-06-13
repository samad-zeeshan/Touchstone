"""
Optional AI layer. Rewords problem prose and writes fallback hints.

It never produces or touches a number. Every value the student sees still comes
from the deterministic oracle in concepts/.
"""

import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

_API_KEY = os.environ.get("DEEPSEEK_API_KEY")
_MODEL = os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-flash")
_REWORD = os.environ.get("REWORD", "true").lower() != "false"
_BASE_URL = "https://api.deepseek.com"

_client = None
if _API_KEY:
    try:
        from openai import OpenAI
        # Short timeout on purpose. A slow model should not stall a problem
        # fetch, and every caller already falls back to plain prose.
        _client = OpenAI(api_key=_API_KEY, base_url=_BASE_URL, timeout=12.0)
    except Exception:
        _client = None

def is_enabled() -> bool:
    return _client is not None

def _ask(prompt: str, max_tokens: int):
    if _client is None:
        return None
    try:
        resp = _client.chat.completions.create(
            model=_MODEL,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        text = (resp.choices[0].message.content or "").strip()
        return text or None
    except Exception:
        # Any failure returns None so callers drop back to deterministic text.
        return None

# The whole governance claim lives here. A rewording is only accepted if every
# key token (each number, unit, and target phrase) survives verbatim.
def _keeps_tokens(text: str, tokens) -> bool:
    return all(token in text for token in tokens)

def reword_problem(prompt: str, key_tokens) -> str:
    if _client is None or not _REWORD or not key_tokens:
        return prompt
    token_list = ", ".join(f'"{t}"' for t in key_tokens)
    ask = (
        "Reword this practice problem into a fresh, natural everyday scenario "
        "(a different character and setting), asking for the same thing. You "
        "MUST keep each of these exactly as written, unchanged: "
        f"{token_list}. Return only the reworded problem as one short "
        f"paragraph, with no preamble.\n\nProblem: {prompt}"
    )
    reworded = _ask(ask, max_tokens=220)
    if reworded and _keeps_tokens(reworded, key_tokens):
        return reworded
    # AI off, rewording disabled, or a dropped token all land here: the student
    # sees the original prompt unchanged.
    return prompt

def _format(value: float, unit: str) -> str:
    if unit == "money":
        return f"${value:,.2f}"
    if unit == "percent":
        return f"{value:.0f}%"
    if unit == "count":
        return f"{round(value):,}"
    return f"{value:,.2f}"

# Last resort hint, only reached when the concept has no deterministic diagnosis
# for this mistake. We hand it the answer but tell it not to spell out the steps.
def explain_mistake(concept_title: str, prompt: str, target_phrase: str,
                    correct: float, submitted: float, answer_unit: str):
    ask = (
        f"A student is practicing the concept '{concept_title}'. "
        f"The problem: {prompt} "
        f"The correct value for {target_phrase} is {_format(correct, answer_unit)}. "
        f"The student answered {_format(submitted, answer_unit)}. "
        "In 1-2 short, encouraging sentences, suggest what they most likely did "
        "wrong. Do not give a full step-by-step solution."
    )
    return _ask(ask, max_tokens=120)
