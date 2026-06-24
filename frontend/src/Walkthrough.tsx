import { useEffect, useState } from "react";
import { audioUrl, fetchWalkthrough, type Beat, type ConceptMeta } from "./api";
import NarratedScene from "./widgets/NarratedScene";
import SceneStage from "./widgets/sceneFrames";
import { MUTED, SUBTLE, ACCENT, card } from "./theme";

export default function Walkthrough({ concept }: { concept: ConceptMeta }) {
  const [beats, setBeats] = useState<Beat[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let live = true;
    setBeats(null);
    setError(false);
    fetchWalkthrough(concept.id)
      .then((bs) => live && setBeats(bs.map((b) => ({ ...b, audio_url: audioUrl(b.audio_url) }))))
      .catch(() => live && setError(true));
    return () => { live = false; };
  }, [concept.id]);

  return (
    <div style={card}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 14 }}>
        Walkthrough · {concept.title}
      </div>
      {error && <p style={{ color: MUTED }}>Couldn't load the walkthrough. Is the backend running?</p>}
      {!error && beats === null && <p style={{ color: MUTED }}>Loading…</p>}
      {!error && beats && (
        <>
          <NarratedScene
            beats={beats}
            renderFrame={(cue, _i, progress) => <SceneStage conceptId={concept.id} cue={cue} progress={progress} />}
          />
          <p style={{ color: SUBTLE, fontSize: 13, marginTop: 16, lineHeight: 1.5 }}>
            Narration is spoken by your browser (or pre-rendered audio when configured). The visuals are the same
            tested engine that powers the lesson and grades your practice - never a recorded video.
          </p>
        </>
      )}
    </div>
  );
}
