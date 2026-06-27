/**
 * Player for a narrated walkthrough: a sequence of beats with captions and voice.
 *
 * Each beat drives one frame, spoken either from a prerecorded clip or the browser
 * speech voice, with a progress value the caller's renderFrame can animate against.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Beat } from "../api";
import {
  INK, MUTED, ACCENT, ACCENT_FILL, PAPER, BORDER, MONO,
  fs, space, radius, primaryBtn, secondaryBtn, prefersReducedMotion,
} from "../theme";

const VOICE_KEY = "aitutor:voice";
function readVoicePref(): boolean {
  try { return window.localStorage.getItem(VOICE_KEY) !== "off"; } catch { return true; }
}
function writeVoicePref(on: boolean): void {
  try { window.localStorage.setItem(VOICE_KEY, on ? "on" : "off"); } catch { void 0; }
}

export default function NarratedScene({ beats, renderFrame, compact, onClose }: {
  beats: Beat[];
  renderFrame: (cue: Beat["cue"], index: number, progress: number) => ReactNode;
  compact?: boolean;
  onClose?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [prog, setProg] = useState(0);
  const [voiceOn, setVoiceOn] = useState(readVoicePref);
  const raf = useRef(0);
  const timer = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const hasVoice = canSpeak || beats.some((b) => b.audio_url);

  // Fallback timing when there is no real audio length: roughly 340ms a word,
  // clamped so a one word beat still lingers and a long one does not drag.
  const durations = useMemo(
    () => beats.map((b) => Math.min(9000, Math.max(2800, b.text.trim().split(/\s+/).length * 340))),
    [beats],
  );

  // advance() reads the live index through a ref so the playback effect below
  // does not have to resubscribe every time the beat changes.
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const advance = useCallback(() => {
    if (idxRef.current < beats.length - 1) {
      setIdx((i) => i + 1);
      setProg(0);
    } else {
      setPlaying(false);
      setProg(1);
    }
  }, [beats.length]);

  useEffect(() => {
    // Tear down the previous beat's frame loop, audio, timer, and speech before
    // starting the next. The same teardown runs on unmount, which prevents leaks.
    cancelAnimationFrame(raf.current);
    clearTimeout(timer.current);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (canSpeak) window.speechSynthesis.cancel();
    if (!playing || beats.length === 0) return;

    const beat = beats[idx];
    const dur = durations[idx];

    let audio: HTMLAudioElement | null = null;
    if (voiceOn && beat.audio_url) {
      audio = new Audio(beat.audio_url);
      audioRef.current = audio;
      audio.play().catch(() => {  });
    } else if (voiceOn && canSpeak) {
      const u = new SpeechSynthesisUtterance(beat.text);
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }

    // Reduced motion path: skip the per-frame tween. The frame renders at its end
    // state straight away and we only schedule the beat to advance once, on the
    // audio finishing or on a single timer, so captions and voice still pace.
    if (prefersReducedMotion()) {
      // Jump to the end state in a single deferred frame (not synchronously in the
      // effect body), then schedule the beat to advance on the audio finishing or
      // a lone timer. No per-frame tween, so motion stays flat.
      raf.current = requestAnimationFrame(() => setProg(1));
      if (audio) audio.onended = advance;
      else timer.current = window.setTimeout(advance, dur);
      return () => {
        cancelAnimationFrame(raf.current);
        clearTimeout(timer.current);
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.onended = null; audioRef.current = null; }
        if (canSpeak) window.speechSynthesis.cancel();
      };
    }

    // Resume from wherever prog left off rather than snapping back to zero.
    const start = performance.now() - prog * dur;
    const loop = (now: number) => {
      const a = audio;
      // Drive progress from the real clip when one is playing, otherwise fall back
      // to wall clock against the estimated duration. Keeps captions in sync either way.
      const audioActive = !!a && a.currentTime > 0 && Number.isFinite(a.duration) && a.duration > 0;
      const p = audioActive ? Math.min(1, a!.currentTime / a!.duration) : Math.min(1, (now - start) / dur);
      setProg(p);
      if (p < 1) raf.current = requestAnimationFrame(loop);
      else advance();
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (canSpeak) window.speechSynthesis.cancel();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, playing, beats, durations, advance, canSpeak, voiceOn]);

  const atEnd = idx === beats.length - 1 && !playing && prog >= 1;
  const togglePlay = () => {
    if (atEnd) { setIdx(0); setProg(0); setPlaying(true); }
    else setPlaying((p) => !p);
  };
  const jump = (i: number) => { setIdx(i); setProg(0); };
  const toggleVoice = () => setVoiceOn((v) => { const next = !v; writeVoicePref(next); return next; });

  if (beats.length === 0) return null;
  const beat = beats[idx];

  return (
    <div style={{ width: "100%" }} aria-label="Narrated walkthrough" role="group">
      <div style={{ ...S.stage, minHeight: compact ? 200 : 300 }}>{renderFrame(beat.cue, idx, prog)}</div>

      <div style={S.captionBar}>
        <span style={S.captionTag}>{beat.caption}</span>
        <span style={S.captionText}>{beat.text}</span>
      </div>

      {/* Step markers double as the scrubber. Each is a 44px touch target with a
          small visual dot, so it stays tappable on a phone. */}
      <div style={S.dots} role="tablist" aria-label="Walkthrough steps">
        {beats.map((_, i) => (
          <button
            key={i}
            onClick={() => jump(i)}
            aria-label={`Step ${i + 1} of ${beats.length}`}
            aria-current={i === idx}
            style={S.dotHit}
          >
            <span
              style={{ ...S.dot, background: i === idx ? ACCENT : i < idx ? ACCENT_FILL : BORDER }}
            />
          </button>
        ))}
      </div>

      <div style={S.controls}>
        <button onClick={togglePlay} style={S.ctrlPrimary}>
          {atEnd ? "Replay" : playing ? "Pause" : "Play"}
        </button>
        {!atEnd && (
          <button onClick={() => { setIdx(0); setProg(0); setPlaying(true); }} style={S.ctrl}>
            Restart
          </button>
        )}
        {hasVoice && (
          <button
            onClick={toggleVoice}
            style={{ ...S.ctrl, color: voiceOn ? ACCENT : MUTED, borderColor: voiceOn ? ACCENT : BORDER }}
            aria-pressed={voiceOn}
            title={voiceOn ? "Mute the announcer" : "Turn the announcer on"}
          >
            {voiceOn ? "Voice on" : "Voice off"}
          </button>
        )}
        {onClose && <button onClick={onClose} style={{ ...S.ctrl, marginLeft: "auto" }}>Close</button>}
      </div>

      {hasVoice && !voiceOn && (
        <div style={S.note}>Announcer muted. Captions still follow along. Tap “Voice on” to switch it back.</div>
      )}
      {!hasVoice && (
        <div style={S.note}>Narration plays as captions here. Your browser doesn't expose a speech voice.</div>
      )}
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  stage: { display: "flex", alignItems: "center", justifyContent: "center", background: PAPER, border: `1px solid ${BORDER}`, borderRadius: radius.lg, padding: 16, boxSizing: "border-box" },
  captionBar: { display: "flex", gap: space.md, alignItems: "baseline", marginTop: space.lg, minHeight: 52 },
  captionTag: { flexShrink: 0, fontFamily: MONO, fontSize: fs.micro, fontWeight: 500, color: ACCENT, background: ACCENT_FILL, borderRadius: radius.sm, padding: "3px 8px", textTransform: "uppercase", letterSpacing: "0.04em" },
  captionText: { fontSize: fs.base, lineHeight: 1.5, color: INK },
  dots: { display: "flex", justifyContent: "center", marginTop: space.sm, flexWrap: "wrap" },
  dotHit: { width: 44, height: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", padding: 0, cursor: "pointer" },
  dot: { width: 9, height: 9, borderRadius: radius.pill, display: "inline-block", transition: "background 160ms" },
  controls: { display: "flex", gap: space.md, marginTop: space.sm, alignItems: "center", flexWrap: "wrap" },
  ctrlPrimary: { ...primaryBtn, minHeight: 44 },
  ctrl: { ...secondaryBtn, minHeight: 44 },
  note: { marginTop: space.md, fontSize: fs.xs, color: MUTED, lineHeight: 1.5 },
};
