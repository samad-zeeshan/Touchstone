import random

import pytest
from fastapi.testclient import TestClient

import api
import concepts
from content import WALKTHROUGHS, CLIPS, render_clip

client = TestClient(api.app)
ALL = concepts.all_concepts()

@pytest.mark.parametrize("concept", ALL, ids=[c.id for c in ALL])
def test_every_concept_has_a_walkthrough(concept):
    beats = WALKTHROUGHS.get(concept.id)
    assert beats and all(b["text"] and b["caption"] for b in beats)

@pytest.mark.parametrize("concept", ALL, ids=[c.id for c in ALL])
def test_every_misconception_has_a_clip(concept):
    clips = CLIPS.get(concept.id, {})
    assert set(concept.misconceptions) == set(clips), \
        f"{concept.id}: clips must cover exactly the misconception list"

@pytest.mark.parametrize("concept", ALL, ids=[c.id for c in ALL])
def test_clips_fill_cleanly_with_real_numbers(concept):
    rng = random.Random(3)
    p = concept.generate(rng, None)
    correct = concept.answer(p.params, p.template)
    for handle in CLIPS[concept.id]:
        beats = render_clip(concept, handle, p.params, p.template, submitted=correct + 1)
        assert beats, f"{concept.id}/{handle} produced no beats"
        for b in beats:
            assert "{" not in b["text"] and "}" not in b["text"], \
                f"unfilled placeholder in {concept.id}/{handle}: {b['text']}"
        joined = " ".join(b["text"] for b in beats)
        from content.clips import _fmt
        assert _fmt(correct, concept.answer_unit) in joined

def test_render_clip_unknown_handle_is_none():
    c = concepts.get("monty-hall")
    assert render_clip(c, "no-such-mistake", {"trials": 600}, "switch", 100) is None

@pytest.mark.parametrize("concept", ALL, ids=[c.id for c in ALL])
def test_walkthrough_endpoint(concept):
    r = client.get(f"/concepts/{concept.id}/walkthrough")
    assert r.status_code == 200
    beats = r.json()["beats"]
    assert len(beats) >= 3
    assert all("text" in b and "cue" in b for b in beats)

def test_clip_endpoint_personalizes():
    r = client.post("/concepts/monty-hall/clip",
                    json={"handle": "fifty-fifty", "template": "switch",
                          "params": {"trials": 600}, "submitted": 300})
    assert r.status_code == 200
    body = r.json()
    assert body["diagnosis"] == "fifty-fifty"
    joined = " ".join(b["text"] for b in body["beats"])
    assert "400" in joined and "600" in joined

def test_clip_endpoint_unknown_handle_404():
    r = client.post("/concepts/monty-hall/clip",
                    json={"handle": "nope", "template": "switch",
                          "params": {"trials": 600}, "submitted": 300})
    assert r.status_code == 404

def test_attempt_flags_available_clip():
    r = client.post("/concepts/monty-hall/attempt",
                    json={"template": "switch", "params": {"trials": 600}, "submitted": 300})
    body = r.json()
    assert body["diagnosis"] == "fifty-fifty"
    assert body["has_clip"] is True
