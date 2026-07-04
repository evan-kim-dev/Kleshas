export type MeditationMode = "awareness" | "478" | "counting";

export type BreathPhase = "inhale" | "hold" | "exhale";

export type PhaseSegment = {
  phase: BreathPhase;
  durationSec: number;
};

export type MeditationModeInfo = {
  id: MeditationMode;
  name: string;
  desc: string;
  icon: string;
};

export const MEDITATION_MODES: MeditationModeInfo[] = [
  {
    id: "awareness",
    name: "호흡 알아차리기",
    desc: "코끝 공기의 차가움과 따뜻함",
    icon: "air",
  },
  {
    id: "478",
    name: "4-7-8 호흡",
    desc: "불안·수면 전 신경 안정",
    icon: "nightlight",
  },
  {
    id: "counting",
    name: "수식관",
    desc: "1부터 10까지 숫자 세기",
    icon: "filter_1",
  },
];

export const PHASE_THEME: Record<
  BreathPhase,
  { core: string; ring: string; glow: string; bg: string }
> = {
  inhale: {
    core: "#0d9488",
    ring: "#2dd4bf",
    glow: "rgba(45, 212, 191, 0.45)",
    bg: "rgba(13, 148, 136, 0.12)",
  },
  hold: {
    core: "#d97706",
    ring: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.4)",
    bg: "rgba(217, 119, 6, 0.14)",
  },
  exhale: {
    core: "#b45309",
    ring: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.38)",
    bg: "rgba(180, 83, 9, 0.12)",
  },
};

export function getModeSegments(mode: MeditationMode): PhaseSegment[] {
  switch (mode) {
    case "awareness":
      return [
        { phase: "inhale", durationSec: 4 },
        { phase: "exhale", durationSec: 4 },
      ];
    case "478":
      return [
        { phase: "inhale", durationSec: 4 },
        { phase: "hold", durationSec: 7 },
        { phase: "exhale", durationSec: 8 },
      ];
    case "counting":
      return [
        { phase: "inhale", durationSec: 4 },
        { phase: "exhale", durationSec: 4 },
      ];
  }
}

export function getCycleDurationMs(mode: MeditationMode): number {
  const segments = getModeSegments(mode);
  return segments.reduce((sum, s) => sum + s.durationSec, 0) * 1000;
}

export type BreathRuntime = {
  phase: BreathPhase;
  phaseProgress: number;
  level: number;
  segmentIndex: number;
  secondsLeftInPhase: number;
};

export function computeBreathRuntime(
  mode: MeditationMode,
  cycleStartMs: number,
  nowMs: number
): BreathRuntime {
  const segments = getModeSegments(mode);
  const cycleMs = getCycleDurationMs(mode);
  const elapsed = Math.max(0, nowMs - cycleStartMs) % cycleMs;

  let acc = 0;
  for (let i = 0; i < segments.length; i++) {
    const segMs = segments[i].durationSec * 1000;
    if (elapsed < acc + segMs) {
      const phaseProgress = (elapsed - acc) / segMs;
      const phase = segments[i].phase;
      let level: number;

      if (phase === "inhale") level = phaseProgress;
      else if (phase === "hold") level = 1;
      else level = 1 - phaseProgress;

      return {
        phase,
        phaseProgress,
        level,
        segmentIndex: i,
        secondsLeftInPhase: Math.ceil(segments[i].durationSec * (1 - phaseProgress)),
      };
    }
    acc += segMs;
  }

  return {
    phase: segments[0].phase,
    phaseProgress: 0,
    level: 0,
    segmentIndex: 0,
    secondsLeftInPhase: segments[0].durationSec,
  };
}

export function getPhaseKey(runtime: BreathRuntime): string {
  return `${runtime.segmentIndex}-${runtime.phase}`;
}
