import { motion, type Transition } from "motion/react";
import { SUBTLE, ACCENT } from "./theme";

const EASE: [number, number, number, number] = [0.2, 0, 0, 1];
const tr = (reduce: boolean, extra: Partial<Transition> = {}): Transition => ({
  duration: reduce ? 0 : 0.45,
  ease: EASE,
  ...extra,
});

type IconProps = { hot: boolean; reduce: boolean };

function BinarySearch({ hot, reduce }: IconProps) {
  return (
    <>
      <line x1="3" y1="14" x2="25" y2="14" opacity="0.35" />
      <motion.line y1="8" y2="20" initial={false} animate={{ x1: hot ? 11.5 : 5, x2: hot ? 11.5 : 5 }} transition={tr(reduce)} />
      <motion.line y1="8" y2="20" initial={false} animate={{ x1: hot ? 16.5 : 23, x2: hot ? 16.5 : 23 }} transition={tr(reduce)} />
      <motion.circle cx="14" cy="14" fill="currentColor" stroke="none" initial={false} animate={{ r: hot ? 2.4 : 1.4, opacity: hot ? 1 : 0 }} transition={tr(reduce)} />
    </>
  );
}

function SortingRace({ hot, reduce }: IconProps) {
  const rest = [13, 6, 17, 9];
  const sorted = [6, 10, 14, 18];
  const xs = [5, 11, 17, 23];
  return (
    <>
      {xs.map((x, i) => {
        const h = hot ? sorted[i] : rest[i];
        return (
          <motion.rect
            key={x}
            x={x}
            width="3.4"
            rx="1"
            fill="currentColor"
            stroke="none"
            initial={false}
            animate={{ height: h, y: 24 - h }}
            transition={tr(reduce, { delay: reduce ? 0 : i * 0.05 })}
          />
        );
      })}
    </>
  );
}

function Minimax({ hot, reduce }: IconProps) {
  return (
    <>
      <line x1="14" y1="7.2" x2="7" y2="13" />
      <line x1="14" y1="7.2" x2="21" y2="13" />
      <circle cx="14" cy="5" r="2.2" />
      <motion.circle cx="21" cy="15" r="2" initial={false} animate={{ opacity: hot ? 0.3 : 0.6 }} transition={tr(reduce)} />
      <motion.circle
        cx="7"
        cy="15"
        fill="currentColor"
        initial={false}
        animate={{ r: hot ? 2.6 : 2, fillOpacity: hot ? 1 : 0 }}
        transition={tr(reduce)}
      />
    </>
  );
}

function AlphaBeta({ hot, reduce }: IconProps) {
  return (
    <>
      <line x1="14" y1="7.2" x2="7" y2="13" />
      <circle cx="14" cy="5" r="2.2" />
      <circle cx="7" cy="15" r="2" />
      <motion.g initial={false} animate={{ opacity: hot ? 0.15 : 0.6 }} transition={tr(reduce)}>
        <line x1="14" y1="7.2" x2="21" y2="13" />
        <circle cx="21" cy="15" r="2" />
      </motion.g>
      <motion.g stroke="currentColor" initial={false} animate={{ opacity: hot ? 1 : 0 }} transition={tr(reduce)}>
        <line x1="16.5" y1="8.5" x2="19.5" y2="11.5" />
        <line x1="19.5" y1="8.5" x2="16.5" y2="11.5" />
      </motion.g>
    </>
  );
}

function Mcts({ hot, reduce }: IconProps) {
  return (
    <>
      <line x1="14" y1="7" x2="14" y2="12" opacity="0.5" />
      <line x1="14" y1="16" x2="14" y2="21" opacity="0.5" />
      <circle cx="14" cy="5" r="2" opacity="0.6" />
      <circle cx="14" cy="14" r="2" opacity="0.6" />
      <circle cx="14" cy="23" r="2" opacity="0.6" />
      <motion.circle
        cx="14"
        r="1.7"
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={{ cy: hot && !reduce ? [5, 14, 23] : 5 }}
        transition={{ duration: reduce ? 0 : 0.9, ease: EASE }}
      />
    </>
  );
}

function Cipher({ hot, reduce }: IconProps) {
  return (
    <>
      <line x1="4" y1="17" x2="24" y2="17" opacity="0.35" />
      {[6, 11, 16, 21].map((x) => (
        <line key={x} x1={x} y1="15" x2={x} y2="19" opacity="0.5" />
      ))}
      <motion.path
        d="M6 11 q3 -3 6 0"
        fill="none"
        initial={false}
        animate={{ opacity: hot ? 1 : 0.4, d: hot ? "M11 11 q3 -3 6 0" : "M6 11 q3 -3 6 0" }}
        transition={tr(reduce)}
      />
      <motion.circle cy="17" r="2" fill="currentColor" stroke="none" initial={false} animate={{ cx: hot ? 11 : 6 }} transition={tr(reduce)} />
    </>
  );
}

function Streak({ hot, reduce }: IconProps) {
  return (
    <>
      <motion.rect x="9" width="3.4" rx="1.7" fill="currentColor" stroke="none" initial={false} animate={{ height: hot ? 20 : 14, y: hot ? 4 : 7 }} transition={tr(reduce)} />
      <motion.rect x="16" width="3.4" rx="1.7" fill="currentColor" stroke="none" initial={false} animate={{ height: hot ? 14 : 20, y: hot ? 7 : 4 }} transition={tr(reduce)} />
    </>
  );
}

const ICONS: Record<string, (p: IconProps) => React.ReactNode> = {
  "binary-search": BinarySearch,
  "sorting-race": SortingRace,
  minimax: Minimax,
  "alpha-beta": AlphaBeta,
  mcts: Mcts,
  cipher: Cipher,
};

export default function LessonIcon({ id, hot, reduce, size = 30 }: {
  id: string;
  hot: boolean;
  reduce: boolean;
  size?: number;
}) {
  const Draw = ICONS[id] ?? Streak;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ color: hot ? ACCENT : SUBTLE, transition: "color 160ms", display: "block", flexShrink: 0 }}
    >
      <Draw hot={hot} reduce={reduce} />
    </svg>
  );
}
