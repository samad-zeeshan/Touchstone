import { useEffect, useState, type CSSProperties } from "react";
import { fetchClip, type Beat, type ConceptMeta, type Problem } from "./api";
import NarratedScene from "./widgets/NarratedScene";
import SceneStage from "./widgets/sceneFrames";
import { MUTED, ACCENT, BORDER } from "./theme";

export default function MistakeClip({ concept, problem, handle, submitted, onClose }: {
  concept: ConceptMeta;
  problem: Problem;
  handle: string;
  submitted: number;
  onClose: () => void;
}) {
  const [beats, setBeats] = useState<Beat[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let live = true;
    fetchClip(concept.id, problem, handle, submitted)
      .then((bs) => live && setBeats(bs))
      .catch(() => live && setError(true));
    return () => { live = false; };
  }, [concept.id, problem, handle, submitted]);

  return (
    <div style={S.wrap}>
      <div style={S.head}>
        <span style={S.tag}>Mistake clip · {handle}</span>
      </div>
      {error && <p style={{ color: MUTED, fontSize: 14 }}>Couldn't load the clip.</p>}
      {!error && beats === null && <p style={{ color: MUTED, fontSize: 14 }}>Loading clip…</p>}
      {!error && beats && (
        <NarratedScene
          beats={beats}
          compact
          onClose={onClose}
          renderFrame={(cue, _i, progress) => <SceneStage conceptId={concept.id} cue={cue} progress={progress} />}
        />
      )}
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  wrap: { marginTop: 18, padding: "16px 16px 18px", border: `1px solid ${BORDER}`, borderRadius: 14, background: "#fff" },
  head: { marginBottom: 12 },
  tag: { fontSize: 11, fontWeight: 700, color: ACCENT, background: "#FFF1E9", borderRadius: 6, padding: "4px 9px", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "ui-monospace, monospace" },
};
