import { useEffect, useState, type CSSProperties } from "react";
import { fetchClip, type Beat, type ConceptMeta, type Problem } from "./api";
import NarratedScene from "./widgets/NarratedScene";
import SceneStage from "./widgets/sceneFrames";
import { MUTED, ACCENT, ACCENT_FILL, BORDER, PAPER, MONO, fs, space, radius } from "./theme";

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
      {error && <p style={{ color: MUTED, fontSize: fs.sm }}>Couldn't load the clip.</p>}
      {!error && beats === null && <p style={{ color: MUTED, fontSize: fs.sm }}>Loading clip…</p>}
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
  wrap: { marginTop: space.lg, padding: "16px 16px 18px", border: `1px solid ${BORDER}`, borderRadius: radius.lg, background: PAPER },
  head: { marginBottom: space.md },
  tag: { fontFamily: MONO, fontSize: fs.micro, fontWeight: 500, color: ACCENT, background: ACCENT_FILL, borderRadius: radius.sm, padding: "3px 8px", textTransform: "uppercase", letterSpacing: "0.04em" },
};
