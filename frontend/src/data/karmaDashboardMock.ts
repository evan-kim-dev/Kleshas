/** Clear Temple 팔레트 — Recharts용 hex */
export const KARMA_CHART_COLORS = {
  teal600: "#0d9488",
  stone300: "#d6d3d1",
  amber100: "#fef3c7",
  teal400: "#2dd4bf",
} as const;

export type KarmaCategory = {
  id: string;
  label: string;
  count: number;
  percent: number;
  color: string;
};

/** 이번 달 번뇌 키워드 분포 (목업) */
export const MONTHLY_KARMA_DISTRIBUTION: KarmaCategory[] = [
  {
    id: "relationship",
    label: "인간관계",
    count: 12,
    percent: 40,
    color: KARMA_CHART_COLORS.teal600,
  },
  {
    id: "career",
    label: "진로/취업",
    count: 9,
    percent: 30,
    color: KARMA_CHART_COLORS.stone300,
  },
  {
    id: "desire",
    label: "애욕",
    count: 5,
    percent: 15,
    color: KARMA_CHART_COLORS.amber100,
  },
  {
    id: "money",
    label: "금전",
    count: 5,
    percent: 15,
    color: KARMA_CHART_COLORS.teal400,
  },
];

export const MONTHLY_KARMA_TOTAL = MONTHLY_KARMA_DISTRIBUTION.reduce(
  (sum, item) => sum + item.count,
  0
);

export type WeeklyMindfulnessDay = {
  date: string;
  dayLabel: string;
  /** 0–100 마음 챙김 달성도 */
  score: number;
  meditationDone: boolean;
  gardenDone: boolean;
};

function buildLast7Days(): WeeklyMindfulnessDay[] {
  const labels = ["일", "월", "화", "수", "목", "금", "토"];
  const scores = [42, 68, 55, 80, 72, 90, 63];
  const meditation = [false, true, true, true, false, true, true];
  const garden = [true, false, true, true, true, true, false];

  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return {
      date: `${month}/${day}`,
      dayLabel: labels[d.getDay()],
      score: scores[i],
      meditationDone: meditation[i],
      gardenDone: garden[i],
    };
  });
}

/** 최근 7일 마음 챙김 달성도 (목업) */
export const WEEKLY_MINDFULNESS: WeeklyMindfulnessDay[] = buildLast7Days();

export const MONK_INSIGHT = {
  topCategory: "인간관계",
  topKeyword: "타인의 시선",
  message:
    "이번 달, 당신의 마음을 가장 어지럽힌 것은 '타인의 시선(인간관계)'이었습니다. 바람에 흔들리지 않는 뿌리 깊은 나무를 생각하십시오.",
};
