import { useEffect, useState } from "react";
import { audioUrl, fetchWalkthrough, type Beat, type ConceptMeta } from "./api";
import NarratedScene from "./widgets/NarratedScene";
import SceneStage from "./widgets/sceneFrames";
import { MUTED, SUBTLE, fs, space, card, eyebrow } from "./theme";

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
      <div style={eyebrow}>Walkthrough · {concept.title}</div>
      {error && <p style={{ color: MUTED, fontSize: fs.sm }}>Couldn't load the walkthrough. Check the backend is running.</p>}
      {!error && beats === null && <p style={{ color: MUTED, fontSize: fs.sm }}>Loading…</p>}
      {!error && beats && (
        <>
          <NarratedScene
            beats={beats}
            renderFrame={(cue, _i, progress) => <SceneStage conceptId={concept.id} cue={cue} progress={progress} />}
          />
          <p style={{ color: SUBTLE, fontSize: fs.xs, marginTop: space.lg, lineHeight: 1.5 }}>
            Narration is spoken by your browser, or pre-rendered audio when configured. The visuals are the
            same tested engine that powers the lesson and grades your practice, never a recorded video.
          </p>
        </>
      )}
    </div>
  );
}
