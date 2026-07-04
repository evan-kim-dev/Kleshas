import { DEFAULT_UPGRADES, type UpgradeLevels } from "./moktakUpgrades";

export const MOKTAK_STORAGE_KEY = "kleshas_moktak";

export type MoktakLevel = 1 | 2 | 3 | 4;

export type MoktakPersisted = {
  meritCount: number;
  spiritPoints: number;
  upgrades: UpgradeLevels;
  celebratedMilestones: number[];
};

export const LEVEL_THRESHOLDS: Record<MoktakLevel, number> = {
  1: 0,
  2: 108,
  3: 1080,
  4: 10800,
};

export const LEVEL_LABELS: Record<MoktakLevel, string> = {
  1: "초심자",
  2: "수행자",
  3: "깨달음",
  4: "해탈",
};

export const MILESTONES = [
  { at: 108, message: "108번의 번뇌를 흩어냈습니다." },
  { at: 1080, message: "1,080번의 집착을 놓아버렸습니다." },
  { at: 10800, message: "10,800번의 고요. 해탈의 문이 열립니다." },
] as const;

function normalizeUpgrades(raw?: Partial<UpgradeLevels>): UpgradeLevels {
  return {
    power: Math.max(0, raw?.power ?? 0),
    echo: Math.max(0, raw?.echo ?? 0),
    auto: Math.max(0, raw?.auto ?? 0),
  };
}

export function getMoktakLevel(meritCount: number): MoktakLevel {
  if (meritCount >= LEVEL_THRESHOLDS[4]) return 4;
  if (meritCount >= LEVEL_THRESHOLDS[3]) return 3;
  if (meritCount >= LEVEL_THRESHOLDS[2]) return 2;
  return 1;
}

export function getNextLevelThreshold(level: MoktakLevel): number | null {
  if (level >= 4) return null;
  return LEVEL_THRESHOLDS[(level + 1) as MoktakLevel];
}

export function defaultMoktakState(): MoktakPersisted {
  return {
    meritCount: 0,
    spiritPoints: 0,
    upgrades: { ...DEFAULT_UPGRADES },
    celebratedMilestones: [],
  };
}

export function loadMoktakState(): MoktakPersisted {
  if (typeof window === "undefined") return defaultMoktakState();

  try {
    const raw = localStorage.getItem(MOKTAK_STORAGE_KEY);
    if (!raw) return defaultMoktakState();

    const parsed = JSON.parse(raw) as Partial<MoktakPersisted>;
    const meritCount = Math.max(0, parsed.meritCount ?? 0);

    return {
      meritCount,
      // 구 저장 데이터: 영력 없으면 공덕과 동일하게 마이그레이션
      spiritPoints:
        parsed.spiritPoints !== undefined
          ? Math.max(0, parsed.spiritPoints)
          : meritCount,
      upgrades: normalizeUpgrades(parsed.upgrades),
      celebratedMilestones: Array.isArray(parsed.celebratedMilestones)
        ? parsed.celebratedMilestones
        : [],
    };
  } catch {
    return defaultMoktakState();
  }
}

export function saveMoktakState(state: MoktakPersisted): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOKTAK_STORAGE_KEY, JSON.stringify(state));
}

export function findNewMilestone(
  prevCount: number,
  nextCount: number,
  celebrated: number[]
): (typeof MILESTONES)[number] | null {
  for (const milestone of MILESTONES) {
    if (
      prevCount < milestone.at &&
      nextCount >= milestone.at &&
      !celebrated.includes(milestone.at)
    ) {
      return milestone;
    }
  }
  return null;
}

export function applyMeritGain(
  state: MoktakPersisted,
  amount: number
): { state: MoktakPersisted; milestone: (typeof MILESTONES)[number] | null } {
  const prev = state.meritCount;
  const next = prev + amount;
  const milestone = findNewMilestone(
    prev,
    next,
    state.celebratedMilestones
  );

  const celebratedMilestones = milestone
    ? [...state.celebratedMilestones, milestone.at]
    : state.celebratedMilestones;

  return {
    state: {
      ...state,
      meritCount: next,
      spiritPoints: state.spiritPoints + amount,
      celebratedMilestones,
    },
    milestone,
  };
}
