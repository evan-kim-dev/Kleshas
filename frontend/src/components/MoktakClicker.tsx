"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  applyMeritGain,
  getMoktakLevel,
  getNextLevelThreshold,
  LEVEL_LABELS,
  LEVEL_THRESHOLDS,
  loadMoktakState,
  saveMoktakState,
  type MoktakLevel,
} from "@/lib/moktakStorage";
import {
  canAffordUpgrade,
  getAutoRate,
  getTapYield,
  getUpgradeCost,
  getUpgradeSummary,
  purchaseUpgrade,
  UPGRADE_CATALOG,
  type UpgradeId,
  type UpgradeLevels,
} from "@/lib/moktakUpgrades";

type FloatingText = {
  id: string;
  x: number;
  y: number;
  label: string;
};

type MilestoneToast = { id: string; message: string };

type ViewTab = "tap" | "shop";

const LEVEL_STYLES: Record<
  MoktakLevel,
  { bg: string; border: string; shadow: string; crack: string }
> = {
  1: {
    bg: "bg-stone-300",
    border: "border-stone-400",
    shadow: "",
    crack: "bg-stone-500/25",
  },
  2: {
    bg: "bg-stone-800",
    border: "border-stone-700",
    shadow: "shadow-[0_0_20px_rgba(41,37,36,0.2)]",
    crack: "bg-stone-400/30",
  },
  3: {
    bg: "bg-teal-600",
    border: "border-teal-500",
    shadow: "shadow-[0_0_30px_rgba(15,118,110,0.5)]",
    crack: "bg-teal-200/35",
  },
  4: {
    bg: "bg-amber-400",
    border: "border-amber-300",
    shadow: "shadow-[0_0_40px_rgba(245,158,11,0.8)]",
    crack: "bg-amber-100/40",
  },
};

let moktakAudio: HTMLAudioElement | null = null;

function playMoktakSound() {
  if (typeof window === "undefined") return;
  try {
    if (!moktakAudio) {
      moktakAudio = new Audio("/moktak.mp3");
      moktakAudio.volume = 0.45;
    }
    moktakAudio.currentTime = 0;
    void moktakAudio.play().catch(() => {});
  } catch {
    /* noop */
  }
}

function formatNum(n: number): string {
  return n.toLocaleString("ko-KR");
}

function UpgradeShop({
  spiritPoints,
  upgrades,
  onPurchase,
}: {
  spiritPoints: number;
  upgrades: UpgradeLevels;
  onPurchase: (id: UpgradeId) => void;
}) {
  return (
    <div className="w-full max-w-sm space-y-3">
      <p className="mb-4 text-center font-sans text-caption text-outline/60">
        영력 {formatNum(spiritPoints)} · {getUpgradeSummary(upgrades)}
      </p>

      {UPGRADE_CATALOG.map((def) => {
        const level = upgrades[def.id];
        const maxed = level >= def.maxLevel;
        const cost = getUpgradeCost(def.id, level);
        const affordable = cost !== null && spiritPoints >= cost;
        const nextTier = maxed ? null : def.tiers[level];

        return (
          <div
            key={def.id}
            className="flex items-center gap-3 rounded-2xl border border-primary/8 bg-surface/80 px-4 py-3.5"
          >
            <span className="material-symbols-outlined shrink-0 text-[22px] text-primary-container">
              {def.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-body font-semibold text-primary">
                  {def.name}
                </span>
                <span className="font-sans text-[10px] text-outline/50">
                  Lv.{level}/{def.maxLevel}
                </span>
              </div>
              <p className="mt-0.5 font-sans text-caption text-outline/65">
                {def.desc}
              </p>
              {nextTier && (
                <p className="mt-1 font-sans text-[10px] text-primary-container/80">
                  다음: {nextTier.detail}
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={maxed || !affordable}
              onClick={() => onPurchase(def.id)}
              className={`zen-soft shrink-0 rounded-full px-3 py-2 font-sans text-[11px] font-semibold transition-colors ${
                maxed
                  ? "bg-primary/5 text-outline/40"
                  : affordable
                    ? "bg-primary-container text-white hover:opacity-90"
                    : "bg-primary/8 text-outline/45"
              }`}
            >
              {maxed ? "MAX" : formatNum(cost ?? 0)}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function MoktakClicker() {
  const [meritCount, setMeritCount] = useState(0);
  const [spiritPoints, setSpiritPoints] = useState(0);
  const [upgrades, setUpgrades] = useState<UpgradeLevels>({
    power: 0,
    echo: 0,
    auto: 0,
  });
  const [celebratedMilestones, setCelebratedMilestones] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<ViewTab>("tap");
  const [floaters, setFloaters] = useState<FloatingText[]>([]);
  const [milestone, setMilestone] = useState<MilestoneToast | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const meritRef = useRef(0);
  const spiritRef = useRef(0);
  const upgradesRef = useRef(upgrades);
  const celebratedRef = useRef(celebratedMilestones);

  useEffect(() => {
    const saved = loadMoktakState();
    setMeritCount(saved.meritCount);
    setSpiritPoints(saved.spiritPoints);
    setUpgrades(saved.upgrades);
    setCelebratedMilestones(saved.celebratedMilestones);
    meritRef.current = saved.meritCount;
    spiritRef.current = saved.spiritPoints;
    upgradesRef.current = saved.upgrades;
    celebratedRef.current = saved.celebratedMilestones;
    setHydrated(true);
  }, []);

  useEffect(() => {
    meritRef.current = meritCount;
    spiritRef.current = spiritPoints;
    upgradesRef.current = upgrades;
    celebratedRef.current = celebratedMilestones;
  }, [meritCount, spiritPoints, upgrades, celebratedMilestones]);

  useEffect(() => {
    if (!hydrated) return;
    saveMoktakState({
      meritCount,
      spiritPoints,
      upgrades,
      celebratedMilestones,
    });
  }, [meritCount, spiritPoints, upgrades, celebratedMilestones, hydrated]);

  useEffect(() => {
    if (!milestone) return;
    const id = window.setTimeout(() => setMilestone(null), 3200);
    return () => window.clearTimeout(id);
  }, [milestone]);

  const addMerit = useCallback(
    (amount: number, x: number, y: number, label?: string) => {
      const base = {
        meritCount: meritRef.current,
        spiritPoints: spiritRef.current,
        upgrades: upgradesRef.current,
        celebratedMilestones: celebratedRef.current,
      };

      const { state: next, milestone: hit } = applyMeritGain(base, amount);
      setMeritCount(next.meritCount);
      setSpiritPoints(next.spiritPoints);
      setCelebratedMilestones(next.celebratedMilestones);

      if (hit) {
        setMilestone({ id: crypto.randomUUID(), message: hit.message });
      }

      const floaterId = crypto.randomUUID();
      setFloaters((prev) => [
        ...prev,
        {
          id: floaterId,
          x,
          y,
          label: label ?? `+${formatNum(amount)} 공덕`,
        },
      ]);
      window.setTimeout(() => {
        setFloaters((prev) => prev.filter((f) => f.id !== floaterId));
      }, 900);
    },
    []
  );

  const handleTap = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      playMoktakSound();

      const rect = areaRef.current?.getBoundingClientRect();
      const x = rect ? e.clientX - rect.left : e.clientX;
      const y = rect ? e.clientY - rect.top : e.clientY;
      const yield_ = getTapYield(upgradesRef.current);

      addMerit(yield_, x, y);
    },
    [addMerit]
  );

  const handlePurchase = useCallback((id: UpgradeId) => {
    const result = purchaseUpgrade(spiritRef.current, upgradesRef.current, id);
    if (!result.ok) return;
    setSpiritPoints(result.spiritPoints);
    setUpgrades(result.upgrades);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const id = window.setInterval(() => {
      const rate = getAutoRate(upgradesRef.current);
      if (rate <= 0) return;

      const el = areaRef.current;
      const x = el ? el.clientWidth / 2 : 160;
      const y = el ? el.clientHeight / 2 : 160;
      addMerit(rate, x, y, `+${rate} 자동`);
    }, 1000);

    return () => window.clearInterval(id);
  }, [hydrated, addMerit]);

  const moktakLevel = getMoktakLevel(meritCount);
  const levelStyle = LEVEL_STYLES[moktakLevel];
  const nextThreshold = getNextLevelThreshold(moktakLevel);
  const currentMin = LEVEL_THRESHOLDS[moktakLevel];
  const progressToNext =
    nextThreshold === null
      ? 100
      : Math.min(
          100,
          ((meritCount - currentMin) / (nextThreshold - currentMin)) * 100
        );
  const tapYield = getTapYield(upgrades);
  const autoRate = getAutoRate(upgrades);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-sans text-body text-outline/60">목탁을 닦는 중…</p>
      </div>
    );
  }

  return (
    <section className="relative flex min-h-[62vh] flex-col items-center px-6 py-8">
      <header className="mb-6 text-center">
        <p className="font-serif text-headline-md text-primary">디지털 목탁</p>
        <p className="mt-2 font-sans text-caption text-outline/65">
          두드리고, 업그레이드하고, 더 빠르게 수행하세요
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full border border-primary/10 bg-surface px-3 py-1 font-sans text-label text-primary-container">
          Lv.{moktakLevel} {LEVEL_LABELS[moktakLevel]}
        </span>
        <span className="rounded-full border border-primary/10 bg-surface px-3 py-1 font-sans text-[11px] text-outline/70">
          공덕 {formatNum(meritCount)}
        </span>
        <span className="rounded-full border border-lotus-pink/20 bg-lotus-pink/8 px-3 py-1 font-sans text-[11px] text-primary-container">
          영력 {formatNum(spiritPoints)}
        </span>
      </div>

      <div className="mb-6 flex rounded-full border border-primary/10 bg-surface p-1">
        <button
          type="button"
          onClick={() => setView("tap")}
          className={`zen-soft rounded-full px-5 py-2 font-sans text-[11px] font-semibold ${
            view === "tap"
              ? "bg-primary-container text-white"
              : "text-outline/60"
          }`}
        >
          목탁
        </button>
        <button
          type="button"
          onClick={() => setView("shop")}
          className={`zen-soft rounded-full px-5 py-2 font-sans text-[11px] font-semibold ${
            view === "shop"
              ? "bg-primary-container text-white"
              : "text-outline/60"
          }`}
        >
          수행 상점
        </button>
      </div>

      {view === "tap" ? (
        <>
          <div className="mb-2 flex gap-3 font-sans text-[10px] text-primary-container/80">
            <span>탭당 +{tapYield}</span>
            {autoRate > 0 && <span>· 초당 +{autoRate}</span>}
          </div>

          {nextThreshold !== null && (
            <div className="mb-8 w-full max-w-[220px]">
              <div className="h-1 overflow-hidden rounded-full bg-primary/8">
                <div
                  className="h-full rounded-full bg-primary-container transition-all duration-500"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
              <p className="mt-2 text-center font-sans text-[10px] text-outline/50">
                다음 진화까지 {formatNum(nextThreshold - meritCount)}
              </p>
            </div>
          )}

          <div
            ref={areaRef}
            className="relative flex h-56 w-full max-w-xs items-center justify-center md:h-64"
          >
            <motion.button
              type="button"
              onPointerDown={handleTap}
              aria-label="목탁 두드리기"
              whileTap={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 520, damping: 18 }}
              className={[
                "relative flex h-40 w-40 items-center justify-center rounded-full border-4 transition-all duration-1000 md:h-44 md:w-44",
                levelStyle.bg,
                levelStyle.border,
                levelStyle.shadow,
              ].join(" ")}
            >
              <span
                className={`h-16 w-px rounded-full transition-all duration-1000 ${levelStyle.crack}`}
                aria-hidden
              />
              <span
                className={`absolute h-px w-16 rounded-full transition-all duration-1000 ${levelStyle.crack}`}
                aria-hidden
              />
            </motion.button>

            <AnimatePresence>
              {floaters.map((f) => (
                <motion.span
                  key={f.id}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -50 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="pointer-events-none absolute whitespace-nowrap font-serif text-body text-primary-container"
                  style={{
                    left: `${f.x}%`,
                    top: `${f.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {f.label}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          <p className="mt-4 text-center font-sans text-caption text-outline/55">
            {moktakLevel === 1 && "나무 목탁 — 수행 상점에서 배력을 올려 보세요"}
            {moktakLevel === 2 && "흑단목 — 메아리로 한 번에 더 많은 공덕"}
            {moktakLevel === 3 && "청자 목탁 — 자동 염송으로 고요히 쌓이는 공덕"}
            {moktakLevel === 4 && "해탈의 목탁 — 황금빛 고요가 가득합니다"}
          </p>
        </>
      ) : (
        <UpgradeShop
          spiritPoints={spiritPoints}
          upgrades={upgrades}
          onPurchase={handlePurchase}
        />
      )}

      <AnimatePresence>
        {milestone && (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-8"
          >
            <div className="max-w-sm rounded-2xl border border-primary/10 bg-surface/95 px-8 py-7 text-center shadow-mz-soft backdrop-blur-md">
              <span className="material-symbols-outlined mb-3 text-[28px] text-primary-container">
                auto_awesome
              </span>
              <p className="font-serif text-body-lg leading-relaxed text-primary">
                {milestone.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
