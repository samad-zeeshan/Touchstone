/**
 * The signature control: a quiet AI on / off switch in the header.
 *
 * Flipping it is literally the claim the product makes about itself, so the
 * surface around it stays still and only the one accent moves. It flips whether
 * the client asks for the prose to be reworded; the oracle is never involved, so
 * the numbers are identical in both positions.
 */
import type { CSSProperties } from "react";
import { MUTED, ACCENT, MONO, fs, space, radius, SIGNATURE, dur } from "./theme";

export default function AiToggle({ on, configured, onChange }: {
  on: boolean;
  configured: boolean;
  onChange: (next: boolean) => void;
}) {
  const title = configured
    ? on ? "Rewording prose with the model. Flip to compare with the plain template."
          : "Plain template prose. Flip to let the model reword it."
    : "No model key configured, so prose stays templated either way.";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="AI rewording"
      title={title}
      onClick={() => onChange(!on)}
      style={S.wrap}
    >
      <span style={{ ...S.label, color: on ? ACCENT : MUTED }}>AI layer {on ? "on" : "off"}</span>
      <span style={{ ...S.track, background: on ? SIGNATURE.trackOn : SIGNATURE.trackOff, transitionDuration: `${dur(160)}ms` }}>
        <span style={{ ...S.thumb, transform: on ? "translateX(16px)" : "translateX(0)", transitionDuration: `${dur(160)}ms` }} />
      </span>
    </button>
  );
}

const S: Record<string, CSSProperties> = {
  wrap: { display: "inline-flex", alignItems: "center", gap: space.sm, background: "none", border: "none", cursor: "pointer", padding: space.xs, minHeight: 44 },
  label: { fontFamily: MONO, fontSize: fs.micro, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", transition: "color 160ms" },
  track: { position: "relative", width: 36, height: 20, borderRadius: radius.pill, transitionProperty: "background", flexShrink: 0 },
  thumb: { position: "absolute", top: 2, left: 2, width: 16, height: 16, borderRadius: radius.pill, background: SIGNATURE.thumb, boxShadow: "0 1px 2px rgba(27,30,28,0.25)", transitionProperty: "transform" },
};
