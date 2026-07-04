export type UpgradeId = "power" | "echo" | "auto";

export type UpgradeLevels = Record<UpgradeId, number>;

export type UpgradeDef = {
  id: UpgradeId;
  name: string;
  desc: string;
  icon: string;
  maxLevel: number;
  tiers: { cost: number; detail: string }[];
};

export const DEFAULT_UPGRADES: UpgradeLevels = {
  power: 0,
  echo: 0,
  auto: 0,
};

/** 탭당 공덕 — power: 1→2→3→5→8→12, echo: +0→+1→+2→+4→+7 */
export const UPGRADE_CATALOG: UpgradeDef[] = [
  {
    id: "power",
    name: "배력",
    desc: "한 번 두드릴 때 더 많은 공덕",
    icon: "bolt",
    maxLevel: 5,
    tiers: [
      { cost: 30, detail: "탭당 +2" },
      { cost: 120, detail: "탭당 +3" },
      { cost: 480, detail: "탭당 +5" },
      { cost: 1080, detail: "탭당 +8" },
      { cost: 5400, detail: "탭당 +12" },
    ],
  },
  {
    id: "echo",
    name: "메아리",
    desc: "울림이 되돌아와 공덕을 더함",
    icon: "graphic_eq",
    maxLevel: 4,
    tiers: [
      { cost: 108, detail: "추가 +1 (총 2배)" },
      { cost: 540, detail: "추가 +2" },
      { cost: 2160, detail: "추가 +4" },
      { cost: 10800, detail: "추가 +7" },
    ],
  },
  {
    id: "auto",
    name: "자동 염송",
    desc: "스스로 울리는 목탁",
    icon: "autorenew",
    maxLevel: 5,
    tiers: [
      { cost: 200, detail: "초당 +1" },
      { cost: 800, detail: "초당 +3" },
      { cost: 3200, detail: "초당 +8" },
      { cost: 10800, detail: "초당 +20" },
      { cost: 54000, detail: "초당 +50" },
    ],
  },
];

const POWER_YIELDS = [1, 2, 3, 5, 8, 12];
const ECHO_BONUS = [0, 1, 2, 4, 7];
const AUTO_RATES = [0, 1, 3, 8, 20, 50];

export function getPowerYield(level: number): number {
  return POWER_YIELDS[Math.min(level, POWER_YIELDS.length - 1)] ?? 1;
}

export function getEchoBonus(level: number): number {
  return ECHO_BONUS[Math.min(level, ECHO_BONUS.length - 1)] ?? 0;
}

export function getTapYield(upgrades: UpgradeLevels): number {
  return getPowerYield(upgrades.power) + getEchoBonus(upgrades.echo);
}

export function getAutoRate(upgrades: UpgradeLevels): number {
  return AUTO_RATES[Math.min(upgrades.auto, AUTO_RATES.length - 1)] ?? 0;
}

export function getUpgradeCost(
  id: UpgradeId,
  currentLevel: number
): number | null {
  const def = UPGRADE_CATALOG.find((u) => u.id === id);
  if (!def || currentLevel >= def.maxLevel) return null;
  return def.tiers[currentLevel].cost;
}

export function canAffordUpgrade(
  spiritPoints: number,
  id: UpgradeId,
  currentLevel: number
): boolean {
  const cost = getUpgradeCost(id, currentLevel);
  return cost !== null && spiritPoints >= cost;
}

export function purchaseUpgrade(
  spiritPoints: number,
  upgrades: UpgradeLevels,
  id: UpgradeId
): { spiritPoints: number; upgrades: UpgradeLevels; ok: boolean } {
  const cost = getUpgradeCost(id, upgrades[id]);
  if (cost === null || spiritPoints < cost) {
    return { spiritPoints, upgrades, ok: false };
  }

  return {
    spiritPoints: spiritPoints - cost,
    upgrades: { ...upgrades, [id]: upgrades[id] + 1 },
    ok: true,
  };
}

export function getUpgradeSummary(upgrades: UpgradeLevels): string {
  const tap = getTapYield(upgrades);
  const auto = getAutoRate(upgrades);
  const parts = [`탭당 +${tap}`];
  if (auto > 0) parts.push(`초당 +${auto}`);
  return parts.join(" · ");
}
