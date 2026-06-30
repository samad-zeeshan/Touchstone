import type { CSSProperties } from "react";
import { SUBTLE, MUTED, ACCENT, MONO, fs, space, type Theme } from "./theme";

export default function ThemeToggle({ theme, onToggle }: {
  theme: Theme;
  onToggle: () => void;
}) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      aria-pressed={dark}
      title={dark ? "Dark theme. Tap for light." : "Light theme. Tap for dark."}
      onClick={onToggle}
      style={S.wrap}
    >
      <span style={{ ...S.icon, color: dark ? ACCENT : SUBTLE }} aria-hidden>
        {dark ? <Sun /> : <Moon />}
      </span>
      <span style={S.label}>{dark ? "Dark" : "Light"}</span>
    </button>
  );
}

function Moon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden>
      <path
        d="M12.6 9.3A5.3 5.3 0 0 1 5.7 2.4 5.3 5.3 0 1 0 12.6 9.3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Sun() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden>
      <circle cx="7.5" cy="7.5" r="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <line x1="7.5" y1="0.6" x2="7.5" y2="2.4" />
        <line x1="7.5" y1="12.6" x2="7.5" y2="14.4" />
        <line x1="0.6" y1="7.5" x2="2.4" y2="7.5" />
        <line x1="12.6" y1="7.5" x2="14.4" y2="7.5" />
        <line x1="2.6" y1="2.6" x2="3.9" y2="3.9" />
        <line x1="11.1" y1="11.1" x2="12.4" y2="12.4" />
        <line x1="12.4" y1="2.6" x2="11.1" y2="3.9" />
        <line x1="3.9" y1="11.1" x2="2.6" y2="12.4" />
      </g>
    </svg>
  );
}

const S: Record<string, CSSProperties> = {
  wrap: {
    display: "inline-flex", alignItems: "center", gap: space.sm,
    background: "none", border: "none", cursor: "pointer", padding: space.xs, minHeight: 44,
  },
  icon: { display: "inline-flex", transition: "color 160ms" },
  label: {
    fontFamily: MONO, fontSize: fs.micro, fontWeight: 500,
    letterSpacing: "0.04em", textTransform: "uppercase", color: MUTED,
  },
};
