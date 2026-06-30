/**
 * Lesson configs and the renderLesson dispatcher.
 *
 * Most concepts are one of a few reusable widgets (curve, trials, distribution)
 * driven by a config object here. renderLesson maps a concept id to its lesson.
 */
import type { ReactNode } from "react";
import CurveExplorer, { type CurveConfig } from "./widgets/CurveExplorer";
import TrialsRunner, { type TrialsConfig } from "./widgets/TrialsRunner";
import DistributionRunner, { type DistributionConfig } from "./widgets/DistributionRunner";
import GameTree from "./widgets/GameTree";
import BinarySearchStepper from "./widgets/BinarySearchStepper";
import SortingRace from "./widgets/SortingRace";
import CallTree from "./widgets/CallTree";
import EquilibriumSim from "./widgets/EquilibriumSim";
import PayoffMatrix from "./widgets/PayoffMatrix";
import GridSearch from "./widgets/GridSearch";
import SampleMeans from "./widgets/SampleMeans";
import Scatter from "./widgets/Scatter";
import MctsTree from "./widgets/MctsTree";
import CipherExplorer from "./widgets/CipherExplorer";
import { MUTED, SUBTLE, ACCENT, GREEN, RED } from "./theme";

const money = (v: number) => "$" + Math.round(v).toLocaleString("en-US");
const balance = (P: number, r: number, n: number, t: number) => P * Math.pow(1 + r / n, n * t);

function loanBalance(P: number, r: number, T: number, year: number): number {
  const i = r / 12;
  const N = 12 * T;
  const M = (P * i) / (1 - Math.pow(1 + i, -N));
  const k = 12 * year;
  return Math.max(0, P * Math.pow(1 + i, k) - (M * (Math.pow(1 + i, k) - 1)) / i);
}

const compoundConfig: CurveConfig = {
  eyebrow: "Compound interest",
  headline: "Your savings don't grow in a straight line.",
  sub: "Drag the interest rate and watch the curve pull away from what your intuition predicts.",
  xMax: 20,
  xTicks: [0, 5, 10, 15, 20],
  xTickLabel: (t) => (t === 0 ? "now" : `${t} yr`),
  slider: { label: "Interest rate", min: 0, max: 0.15, step: 0.005, initial: 0.06, format: (v) => `${(v * 100).toFixed(1)}%` },
  actual: (rate, t) => balance(1000, rate, 12, t),
  intuition: (rate, t) => 1000 * (1 + rate * t),
  actualLabel: "Actual growth",
  intuitionLabel: "If it grew in a straight line",
  yFormat: money,
  readout: (_s, aEnd, iEnd) => ({
    main: (
      <>
        After 20 years, {money(1000)} becomes <strong style={{ color: ACCENT }}>{money(aEnd)}</strong>.
      </>
    ),
    sub: <>A straight line would reach only {money(iEnd)} - compounding adds {money(aEnd - iEnd)}.</>,
  }),
  footer: "$1,000 to start · compounded monthly · 20 years",
};

const decayConfig: CurveConfig = {
  eyebrow: "Exponential decay & half-life",
  headline: "Half-life doesn't mean “gone after two.”",
  sub: "Drag the half-life. Each step removes half of what's left, so the tail never quite reaches zero.",
  xMax: 30,
  xTicks: [0, 10, 20, 30],
  xTickLabel: (t) => (t === 0 ? "now" : `${t} yr`),
  slider: { label: "Half-life", min: 2, max: 12, step: 1, initial: 5, format: (v) => `${v} yr` },
  actual: (h, t) => 1000 * Math.pow(0.5, t / h),
  intuition: (h, t) => 1000 * Math.max(0, 1 - t / (2 * h)),
  actualLabel: "Actual decay",
  intuitionLabel: "If it fell in a straight line",
  yFormat: (v) => `${Math.round(v)} mg`,
  readout: (h, aEnd) => ({
    main: (
      <>
        After 30 years, 1,000 mg decays to <strong style={{ color: ACCENT }}>{Math.round(aEnd)} mg</strong>.
      </>
    ),
    sub: <>A straight line would have hit zero at {2 * h} years - but real decay leaves a long tail.</>,
  }),
  footer: "1,000 mg to start · 30-year window",
};

const rand3 = () => Math.floor(Math.random() * 3);
const montyConfig: TrialsConfig = {
  eyebrow: "Monty Hall",
  headline: "Always switch - you'll win two times out of three.",
  sub: "Once a door opens it feels like a coin flip. Run a thousand games and watch where it really settles.",
  variants: [
    {
      label: "Always switch",
      trueValue: 2 / 3,
      trueLabel: "switch ≈ 67%",
      intuitionValue: 1 / 2,
      intuitionLabel: "feels like 50%",
      runTrial: () => {
        const prize = rand3();
        const pick = rand3();
        return pick !== prize; 
      },
    },
    {
      label: "Always stay",
      trueValue: 1 / 3,
      trueLabel: "stay ≈ 33%",
      intuitionValue: 1 / 2,
      intuitionLabel: "feels like 50%",
      runTrial: () => {
        const prize = rand3();
        const pick = rand3();
        return pick === prize; 
      },
    },
  ],
  footer: "3 doors · the host always opens a losing door",
};

const ROOM = 23;
const birthdayConfig: TrialsConfig = {
  eyebrow: "Birthday paradox",
  headline: "23 people, even odds of a shared birthday.",
  sub: "Our intuition compares one person to the rest. The real question is every pair - and pairs add up fast.",
  variants: [
    {
      label: "23 people",
      trueValue: 0.507,
      trueLabel: "actual ≈ 51%",
      intuitionValue: ROOM / 365,
      intuitionLabel: "feels like ~6%",
      runTrial: () => {
        const seen = new Set<number>();
        for (let i = 0; i < ROOM; i++) {
          const b = Math.floor(Math.random() * 365);
          if (seen.has(b)) return true;
          seen.add(b);
        }
        return false;
      },
    },
  ],
  footer: "rooms of 23 people",
};

const bigOConfig: CurveConfig = {
  eyebrow: "Big-O & the crossover",
  headline: "A bigger constant can't beat a worse growth class.",
  sub: "Algorithm A runs in n² steps; algorithm B in c·n. Slide the constant c and watch where n² overtakes.",
  xMax: 400,
  xTicks: [0, 100, 200, 300, 400],
  xTickLabel: (t) => (t === 0 ? "n=0" : `${t}`),
  slider: { label: "B's constant (c)", min: 50, max: 250, step: 25, initial: 100, format: (v) => `${v}·n` },
  actual: (_c, n) => n * n,
  intuition: (c, n) => c * n,
  actualLabel: "A: n²",
  intuitionLabel: "B: c·n",
  yFormat: (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${Math.round(v)}`),
  readout: (c) => ({
    main: (
      <>
        The two tie at <strong style={{ color: ACCENT }}>n = {c}</strong>.
      </>
    ),
    sub: <>Below the crossover, B's big constant makes it slower; above it, n² runs away for good.</>,
  }),
  footer: "A = n² steps · B = c·n steps",
};

const loanConfig: CurveConfig = {
  eyebrow: "Loan amortization",
  headline: "Early payments are almost all interest.",
  sub: "A $20,000 loan over 15 years. Drag the rate and watch the balance refuse to fall in a straight line.",
  xMax: 15,
  xTicks: [0, 5, 10, 15],
  xTickLabel: (t) => (t === 0 ? "now" : `${t} yr`),
  slider: { label: "Interest rate", min: 0.02, max: 0.12, step: 0.005, initial: 0.06, format: (v) => `${(v * 100).toFixed(1)}%` },
  actual: (rate, year) => loanBalance(20000, rate, 15, year),
  intuition: (_rate, year) => 20000 * (1 - year / 15),
  actualLabel: "Actual balance owed",
  intuitionLabel: "If it fell in a straight line",
  yFormat: money,
  readout: (rate) => ({
    main: (
      <>
        Halfway through, you still owe <strong style={{ color: ACCENT }}>{money(loanBalance(20000, rate, 15, 7.5))}</strong> of $20,000.
      </>
    ),
    sub: <>At {(rate * 100).toFixed(1)}%, early payments are mostly interest, so the balance lags the straight line.</>,
  }),
  footer: "$20,000 borrowed · 15 years · monthly payments",
};

const hashingConfig: TrialsConfig = {
  eyebrow: "Hashing & collisions",
  headline: "Collisions show up around √m keys.",
  sub: "Drop 8 keys into 50 buckets, over and over. A clash is far likelier than all that empty space suggests.",
  winLabel: "with a collision",
  trialLabel: "tables",
  variants: [
    {
      label: "8 keys, 50 buckets",
      trueValue: 0.45,
      trueLabel: "actual ≈ 45%",
      intuitionValue: 8 / 50,
      intuitionLabel: "feels ~16%",
      runTrial: () => {
        const seen = new Set<number>();
        for (let i = 0; i < 8; i++) {
          const b = Math.floor(Math.random() * 50);
          if (seen.has(b)) return true;
          seen.add(b);
        }
        return false;
      },
    },
  ],
  footer: "8 keys · 50 buckets",
};

const baseRatesConfig: TrialsConfig = {
  eyebrow: "Base rates & Bayes",
  headline: "A positive test usually means you're fine.",
  sub: "2% are sick; the test catches 90% of them but false-alarms on 10% of healthy people. Of everyone who tests positive, how many are actually sick?",
  winLabel: "actually sick",
  trialLabel: "positive tests",
  variants: [
    {
      label: "2% prevalence",
      trueValue: 0.155,
      trueLabel: "sick ≈ 16%",
      intuitionValue: 0.9,
      intuitionLabel: "feels 90%",
      runTrial: () => {
        const sick = Math.random() < 0.02;
        const positive = sick ? Math.random() < 0.9 : Math.random() < 0.1;
        if (!positive) return null; 
        return sick;
      },
    },
  ],
  footer: "2% prevalence · 90% sensitivity · 10% false-positive rate",
};

const lawConfig: TrialsConfig = {
  eyebrow: "Law of large numbers",
  headline: "A fair coin has no memory.",
  sub: "It just came up heads 8 of its last 10. Flip it thousands more times and watch the rate forget the streak.",
  variants: [
    {
      label: "fair coin",
      trueValue: 0.5,
      trueLabel: "settles at 50%",
      intuitionValue: 0.7,
      intuitionLabel: "streak feels predictive",
      runTrial: () => Math.random() < 0.5,
    },
  ],
  winLabel: "heads",
  trialLabel: "flips",
  footer: "fair coin · each flip independent",
};

const evConfig: DistributionConfig = {
  eyebrow: "Expected value",
  headline: "The average isn't the best case.",
  sub: "Win $80 four times in ten, otherwise lose $40. Run it and watch the average settle far below the upside.",
  outcomes: [
    { value: 80, label: "win", color: GREEN },
    { value: -40, label: "lose", color: RED },
  ],
  sample: () => (Math.random() < 0.4 ? 80 : -40),
  trueValue: 0.4 * 80 - 0.6 * 40, 
  refs: [
    { value: 80, label: "best case" },
    { value: 20, label: "even avg" },
  ],
  axisMin: -40,
  axisMax: 80,
  footer: "win $80 @ 40% · lose $40 @ 60% · EV = $8",
};

const traj = (deg: number, x: number): number => {
  const t = (deg * Math.PI) / 180;
  return Math.max(0, x * Math.tan(t) - (10 * x * x) / (2 * 900 * Math.cos(t) ** 2));
};
const projectileConfig: CurveConfig = {
  eyebrow: "Projectile motion",
  headline: "Two angles, the same landing spot.",
  sub: "Drag the launch angle. The faint arc is its complement (90° − θ) - they land together, and 45° flies farthest.",
  xMax: 95,
  xTicks: [0, 30, 60, 90],
  xTickLabel: (t) => (t === 0 ? "0" : `${t} m`),
  slider: { label: "Launch angle", min: 20, max: 70, step: 5, initial: 30, format: (v) => `${v}°` },
  actual: (deg, x) => traj(deg, x),
  intuition: (deg, x) => traj(90 - deg, x),
  actualLabel: "This angle",
  intuitionLabel: "Complement (90° − θ)",
  yFormat: (v) => `${Math.round(v)} m`,
  readout: (deg) => ({
    main: (
      <>
        At <strong style={{ color: ACCENT }}>{deg}°</strong> and <strong>{90 - deg}°</strong> the ball lands in the same place.
      </>
    ),
    sub: <>Range peaks at 45° - every other angle pairs with its reflection across 45°.</>,
  }),
  footer: "launch speed 30 m/s · g = 10 m/s²",
};

export function renderLesson(conceptId: string): ReactNode {
  switch (conceptId) {
    case "compound-interest":
      return <CurveExplorer config={compoundConfig} />;
    case "exponential-decay":
      return <CurveExplorer config={decayConfig} />;
    case "monty-hall":
      return <TrialsRunner config={montyConfig} />;
    case "birthday-paradox":
      return <TrialsRunner config={birthdayConfig} />;
    case "binary-search":
      return <BinarySearchStepper />;
    case "sorting-race":
      return <SortingRace />;
    case "recursion-fib":
      return <CallTree />;
    case "big-o":
      return <CurveExplorer config={bigOConfig} />;
    case "loan-amortization":
      return <CurveExplorer config={loanConfig} />;
    case "hashing-collisions":
      return <TrialsRunner config={hashingConfig} />;
    case "base-rates":
      return <TrialsRunner config={baseRatesConfig} />;
    case "law-of-large-numbers":
      return <TrialsRunner config={lawConfig} />;
    case "expected-value":
      return <DistributionRunner config={evConfig} />;
    case "minimax":
      return <GameTree mode="minimax" />;
    case "alpha-beta":
      return <GameTree mode="alphabeta" />;
    case "supply-demand":
      return <EquilibriumSim mode="equilibrium" />;
    case "tax-incidence":
      return <EquilibriumSim mode="tax" />;
    case "prisoners-dilemma":
      return <PayoffMatrix />;
    case "grid-search":
      return <GridSearch />;
    case "central-limit":
      return <SampleMeans />;
    case "regression-mean":
      return <Scatter />;
    case "projectile":
      return <CurveExplorer config={projectileConfig} />;
    case "mcts":
      return <MctsTree />;
    case "cipher":
      return <CipherExplorer />;
    default:
      return (
        <div style={{ padding: "12px 0" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: SUBTLE }}>Interactive lesson coming soon.</div>
          <p style={{ color: MUTED, fontSize: 14, marginTop: 8 }}>
            The engine, oracle, and adaptive practice for this concept are live - head to the Practice tab to try it.
          </p>
        </div>
      );
  }
}
