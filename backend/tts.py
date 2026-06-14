import hashlib
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

_API_KEY = os.environ.get("TTS_API_KEY")
_BASE_URL = os.environ.get("TTS_BASE_URL", "https://api.openai.com/v1")
_MODEL = os.environ.get("TTS_MODEL", "tts-1")
_VOICE = os.environ.get("TTS_VOICE", "alloy")

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "audio")

def is_enabled() -> bool:
    return bool(_API_KEY)

def _hash(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:16]

def audio_url_for(text: str):
    name = _hash(text) + ".mp3"
    if os.path.exists(os.path.join(AUDIO_DIR, name)):
        return f"/audio/{name}"
    return None

def _client():
    from openai import OpenAI
    return OpenAI(api_key=_API_KEY, base_url=_BASE_URL, timeout=30.0)

def pregenerate() -> None:
    from content import WALKTHROUGHS

    if not is_enabled():
        print("TTS disabled (no TTS_API_KEY). The app will use browser speech.")
        return

    os.makedirs(AUDIO_DIR, exist_ok=True)
    client = _client()

    texts = []
    for beats in WALKTHROUGHS.values():
        for beat in beats:
            texts.append(beat["text"])

    made, skipped, failed = 0, 0, 0
    for text in texts:
        path = os.path.join(AUDIO_DIR, _hash(text) + ".mp3")
        if os.path.exists(path):
            skipped += 1
            continue
        try:
            resp = client.audio.speech.create(model=_MODEL, voice=_VOICE, input=text)
            resp.stream_to_file(path)
            made += 1
            print(f"  rendered: {text[:60]}...")
        except Exception as exc:  # noqa: BLE001 -- best-effort authoring step
            failed += 1
            print(f"  FAILED ({exc}): {text[:60]}...")

    print(f"Done. {made} rendered, {skipped} cached, {failed} failed. -> {AUDIO_DIR}")

if __name__ == "__main__":
    pregenerate()
