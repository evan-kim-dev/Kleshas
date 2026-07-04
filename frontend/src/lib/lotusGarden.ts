export const LOTUS_STORAGE_KEY = "kleshas_lotus_garden";

export const MAX_KLESHA = 20;
export const DAILY_GROWTH = 15;
export const MICRO_GROWTH_PER_CLEAR = 0.05;
export const MINUTES_PER_KLESHA = 20;

export type KleshaKind = "worry" | "anger" | "desire" | "doubt" | "fatigue";

export type KleshaItem = {
  id: string;
  x: number;
  y: number;
  kind: KleshaKind;
};

export const KLESHA_KINDS: KleshaKind[] = [
  "worry",
  "anger",
  "desire",
  "doubt",
  "fatigue",
];

export const KLESHA_DISPLAY: Record<
  KleshaKind,
  { emoji: string; label: string; color: string }
> = {
  worry: { emoji: "🌫️", label: "걱정", color: "bg-stone-400/60" },
  anger: { emoji: "🔥", label: "짜증", color: "bg-orange-400/50" },
  desire: { emoji: "💭", label: "욕망", color: "bg-violet-400/45" },
  doubt: { emoji: "🌀", label: "의심", color: "bg-slate-400/55" },
  fatigue: { emoji: "😮‍💨", label: "피로", color: "bg-teal-400/40" },
};

export const POND_DECOR = [
  { id: "pad-1", type: "pad" as const, x: 8, y: 72, rotate: -12 },
  { id: "pad-2", type: "pad" as const, x: 78, y: 68, rotate: 18 },
  { id: "pad-3", type: "pad" as const, x: 82, y: 22, rotate: -8 },
  { id: "pad-4", type: "pad" as const, x: 10, y: 18, rotate: 14 },
  { id: "stone-1", type: "stone" as const, x: 6, y: 48, rotate: 0 },
  { id: "stone-2", type: "stone" as const, x: 88, y: 44, rotate: 0 },
  { id: "reed-1", type: "reed" as const, x: 4, y: 32, rotate: -6 },
  { id: "reed-2", type: "reed" as const, x: 92, y: 58, rotate: 8 },
];

export type LotusGardenState = {
  lastVisited: number;
  lotusGrowth: number;
  lastGrowthDate: string | null;
  kleshaItems: KleshaItem[];
  totalBlooms: number;
};

export type LotusStage = "seed" | "sprout" | "bud" | "bloom";

export function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function defaultState(): LotusGardenState {
  return {
    lastVisited: Date.now(),
    lotusGrowth: 0,
    lastGrowthDate: null,
    kleshaItems: [],
    totalBlooms: 0,
  };
}

export function loadLotusState(): LotusGardenState {
  if (typeof window === "undefined") return defaultState();

  try {
    const raw = localStorage.getItem(LOTUS_STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as LotusGardenState;
    return {
      ...defaultState(),
      ...parsed,
      kleshaItems: (parsed.kleshaItems ?? []).map((k) =>
        normalizeKleshaItem(k as KleshaItem)
      ),
    };
  } catch {
    return defaultState();
  }
}

export function saveLotusState(state: LotusGardenState): void {
  localStorage.setItem(
    LOTUS_STORAGE_KEY,
    JSON.stringify({ ...state, lastVisited: Date.now() })
  );
}

function pickKleshaKind(): KleshaKind {
  return KLESHA_KINDS[Math.floor(Math.random() * KLESHA_KINDS.length)];
}

function normalizeKleshaItem(item: Partial<KleshaItem> & { id: string; x: number; y: number }): KleshaItem {
  return {
    id: item.id,
    x: item.x,
    y: item.y,
    kind: item.kind && KLESHA_KINDS.includes(item.kind) ? item.kind : pickKleshaKind(),
  };
}

function randomPosition(existing: KleshaItem[]): { x: number; y: number } {
  for (let attempt = 0; attempt < 24; attempt++) {
    const x = 12 + Math.random() * 76;
    const y = 12 + Math.random() * 76;
    const tooClose = existing.some(
      (k) => Math.hypot(k.x - x, k.y - y) < 12
    );
    if (!tooClose) return { x, y };
  }
  return { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 };
}

export function spawnKlesha(count: number, existing: KleshaItem[]): KleshaItem[] {
  const items = [...existing];
  const room = MAX_KLESHA - items.length;
  const toAdd = Math.min(room, count);
  for (let i = 0; i < toAdd; i++) {
    const pos = randomPosition(items);
    items.push({
      id: crypto.randomUUID(),
      x: pos.x,
      y: pos.y,
      kind: pickKleshaKind(),
    });
  }
  return items;
}

/** 연못이 비어 있으면 체험용 번뇌를 깔아 둠 */
export function ensurePondActivity(state: LotusGardenState): LotusGardenState {
  const today = getTodayKey();
  if (
    state.kleshaItems.length === 0 &&
    state.lastGrowthDate !== today &&
    state.lotusGrowth < 100
  ) {
    return {
      ...state,
      kleshaItems: spawnKlesha(3, []),
    };
  }
  return state;
}

export function daysUntilBloom(growth: number): number {
  if (growth >= 100) return 0;
  const remaining = 100 - growth;
  return Math.ceil(remaining / DAILY_GROWTH);
}

/** 부재 시간에 따라 번뇌(물거품) 누적 */
export function applyIdleKlesha(state: LotusGardenState): LotusGardenState {
  const now = Date.now();
  const minutesAway = Math.max(0, (now - state.lastVisited) / 60_000);

  if (minutesAway < 5) {
    return { ...state, lastVisited: now };
  }

  const newCount = Math.min(
    MAX_KLESHA,
    Math.floor(minutesAway / MINUTES_PER_KLESHA)
  );

  return {
    ...state,
    kleshaItems: spawnKlesha(newCount, state.kleshaItems),
    lastVisited: now,
  };
}

export function getLotusStage(growth: number): LotusStage {
  if (growth >= 100) return "bloom";
  if (growth >= 50) return "bud";
  if (growth >= 25) return "sprout";
  return "seed";
}

export function getLotusDisplay(stage: LotusStage): {
  emoji: string;
  scale: number;
  label: string;
} {
  switch (stage) {
    case "seed":
      return { emoji: "🌱", scale: 0.55, label: "씨앗" };
    case "sprout":
      return { emoji: "🌿", scale: 0.72, label: "작은 봉오리" };
    case "bud":
      return { emoji: "🪷", scale: 0.92, label: "큰 봉오리" };
    case "bloom":
      return { emoji: "🪷", scale: 1.2, label: "만개" };
  }
}

export function clearKlesha(
  state: LotusGardenState,
  id: string
): { next: LotusGardenState; allCleared: boolean; reachedFull: boolean } {
  const kleshaItems = state.kleshaItems.filter((k) => k.id !== id);
  let lotusGrowth = Math.min(
    100,
    state.lotusGrowth + MICRO_GROWTH_PER_CLEAR
  );

  const today = getTodayKey();
  let lastGrowthDate = state.lastGrowthDate;
  const allCleared = kleshaItems.length === 0;

  if (allCleared && lastGrowthDate !== today) {
    lotusGrowth = Math.min(100, lotusGrowth + DAILY_GROWTH);
    lastGrowthDate = today;
  }

  const next: LotusGardenState = {
    ...state,
    kleshaItems,
    lotusGrowth,
    lastGrowthDate,
    lastVisited: Date.now(),
  };

  return {
    next,
    allCleared,
    reachedFull: lotusGrowth >= 100,
  };
}

export function resetAfterBloom(state: LotusGardenState): LotusGardenState {
  return {
    ...state,
    lotusGrowth: 0,
    lastGrowthDate: null,
    totalBlooms: state.totalBlooms + 1,
    lastVisited: Date.now(),
  };
}

export const BLESSING_MESSAGES = [
  "연꽃은 진흙 속에서도 맑게 피어납니다. 당신의 마음도 그러하니, 오늘 하루를 가볍게 걸어가십시오.",
  "일곱 날의 정진이 만개로 이어졌습니다. 번뇌가 일어나도, 그것을 알아차리는 마음이 곧 연꽃입니다.",
  "맑은 연못처럼, 잠깐 스치는 생각에 온전히 휘둘리지 마십시오. 당신은 이미 충분히 자라고 있습니다.",
  "무아(無我)의 가르침처럼, 집착을 내려놓을수록 마음의 수면은 더 고요해집니다.",
];

export function pickBlessing(): string {
  return BLESSING_MESSAGES[
    Math.floor(Math.random() * BLESSING_MESSAGES.length)
  ];
}
