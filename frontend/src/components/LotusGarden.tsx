"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyIdleKlesha,
  clearKlesha,
  daysUntilBloom,
  ensurePondActivity,
  getLotusDisplay,
  getLotusStage,
  getTodayKey,
  KLESHA_DISPLAY,
  loadLotusState,
  pickBlessing,
  POND_DECOR,
  resetAfterBloom,
  saveLotusState,
  type KleshaItem,
  type LotusGardenState,
} from "@/lib/lotusGarden";

type FloatFeedback = {
  id: string;
  x: number;
  y: number;
  text: string;
};

async function saveToArchive(message: string): Promise<void> {
  try {
    await fetch("/api/lotus-bloom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  } catch {
    /* best-effort */
  }
}

function Ripple({ id, onDone }: { id: string; onDone: (id: string) => void }) {
  return (
    <motion.span
      className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary-container/30"
      initial={{ scale: 0.2, opacity: 0.7 }}
      animate={{ scale: 3, opacity: 0 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
      onAnimationComplete={() => onDone(id)}
    />
  );
}

function PondDecor({
  type,
  x,
  y,
  rotate,
}: {
  type: (typeof POND_DECOR)[number]["type"];
  x: number;
  y: number;
  rotate: number;
}) {
  if (type === "pad") {
    return (
      <div
        className="lotus-pond-decor pointer-events-none absolute"
        style={{ left: `${x}%`, top: `${y}%`, transform: `rotate(${rotate}deg)` }}
        aria-hidden
      >
        <div className="h-7 w-10 rounded-[50%] bg-primary-container/15 md:h-8 md:w-12" />
      </div>
    );
  }
  if (type === "stone") {
    return (
      <div
        className="lotus-pond-decor pointer-events-none absolute"
        style={{ left: `${x}%`, top: `${y}%` }}
        aria-hidden
      >
        <div className="h-3 w-5 rounded-full bg-stone-500/25 md:h-3.5 md:w-6" />
      </div>
    );
  }
  return (
    <div
      className="lotus-pond-decor pointer-events-none absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <span className="font-serif text-lg text-primary-container/35 md:text-xl">|</span>
    </div>
  );
}

function KleshaBubble({
  item,
  onClear,
}: {
  item: KleshaItem;
  onClear: (id: string, x: number, y: number) => void;
}) {
  const meta = KLESHA_DISPLAY[item.kind];

  return (
    <motion.button
      type="button"
      drag
      dragElastic={0.12}
      initial={{ opacity: 0, scale: 0.5, y: 8 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -4, 0],
      }}
      exit={{ opacity: 0, scale: 0.2 }}
      transition={{
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
        y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
      }}
      onClick={() => onClear(item.id, item.x, item.y)}
      onDragEnd={(_, info) => {
        if (Math.hypot(info.offset.x, info.offset.y) > 32) {
          onClear(item.id, item.x, item.y);
        }
      }}
      aria-label={`${meta.label} 치우기`}
      className={`absolute z-20 flex h-12 w-12 flex-col items-center justify-center rounded-full border border-white/40 shadow-sm backdrop-blur-sm md:h-14 md:w-14 ${meta.color}`}
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <span className="text-lg leading-none md:text-xl">{meta.emoji}</span>
      <span className="mt-0.5 font-sans text-[8px] font-semibold text-stone-700/80">
        {meta.label}
      </span>
    </motion.button>
  );
}

function StatusChip({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col items-center rounded-xl border px-2 py-2.5 ${
        accent
          ? "border-primary-container/20 bg-primary-container/8"
          : "border-primary/8 bg-surface/80"
      }`}
    >
      <span className="material-symbols-outlined text-[18px] text-primary-container/70">
        {icon}
      </span>
      <span className="mt-1 font-sans text-[9px] tracking-wide text-outline/55">
        {label}
      </span>
      <span className="mt-0.5 font-serif text-caption font-semibold text-primary">
        {value}
      </span>
    </div>
  );
}

function BloomModal({
  blessing,
  onConfirm,
}: {
  blessing: string;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 px-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-w-md rounded-2xl border border-primary/10 bg-surface p-8 text-center shadow-mz-soft md:p-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-5xl">🪷</p>
        <h2 className="mt-6 font-serif text-body-lg leading-relaxed text-primary">
          7일간의 정진으로
          <br />
          연꽃이 만개했습니다
        </h2>
        <p className="mt-6 font-serif text-body leading-relaxed text-outline/80">
          {blessing}
        </p>
        <button
          type="button"
          onClick={onConfirm}
          className="zen-soft mt-10 rounded-full bg-primary-container px-8 py-3 font-sans text-label text-white"
        >
          확인
        </button>
      </motion.div>
    </motion.div>
  );
}

export function LotusGarden() {
  const [state, setState] = useState<LotusGardenState | null>(null);
  const [ripples, setRipples] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<FloatFeedback[]>([]);
  const [showWhiteout, setShowWhiteout] = useState(false);
  const [showBloomModal, setShowBloomModal] = useState(false);
  const [blessing, setBlessing] = useState("");
  const pendingBloomRef = useRef(false);
  const stateRef = useRef<LotusGardenState | null>(null);

  useEffect(() => {
    let loaded = loadLotusState();
    loaded = applyIdleKlesha(loaded);
    loaded = ensurePondActivity(loaded);
    stateRef.current = loaded;
    setState(loaded);
    saveLotusState(loaded);

    const interval = window.setInterval(() => {
      if (stateRef.current) {
        const next = { ...stateRef.current, lastVisited: Date.now() };
        stateRef.current = next;
        saveLotusState(next);
      }
    }, 30_000);

    const onUnload = () => {
      if (stateRef.current) saveLotusState(stateRef.current);
    };
    window.addEventListener("beforeunload", onUnload);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("beforeunload", onUnload);
      onUnload();
    };
  }, []);

  const addFeedback = useCallback((x: number, y: number, text: string) => {
    const id = crypto.randomUUID();
    setFeedbacks((f) => [...f, { id, x, y, text }]);
    window.setTimeout(() => {
      setFeedbacks((f) => f.filter((item) => item.id !== id));
    }, 900);
  }, []);

  const handleClearKlesha = useCallback(
    (id: string, x: number, y: number) => {
      setState((prev) => {
        if (!prev) return prev;

        const { next, allCleared, reachedFull } = clearKlesha(prev, id);
        stateRef.current = next;
        saveLotusState(next);

        addFeedback(
          x,
          y,
          allCleared ? "오늘 정진 +15%" : "성장 +0.05%"
        );

        if (reachedFull && !pendingBloomRef.current) {
          pendingBloomRef.current = true;
          setBlessing(pickBlessing());
          window.setTimeout(() => setShowWhiteout(true), 300);
          window.setTimeout(() => {
            setShowWhiteout(false);
            setShowBloomModal(true);
          }, 1400);
        }

        return next;
      });

      setRipples((r) => [...r, crypto.randomUUID()]);
    },
    [addFeedback]
  );

  const handleRippleDone = useCallback((id: string) => {
    setRipples((r) => r.filter((x) => x !== id));
  }, []);

  const handleBloomConfirm = useCallback(async () => {
    await saveToArchive(blessing);

    setState((prev) => {
      if (!prev) return prev;
      const next = resetAfterBloom(prev);
      stateRef.current = next;
      saveLotusState(next);
      return ensurePondActivity(next);
    });

    pendingBloomRef.current = false;
    setShowBloomModal(false);
  }, [blessing]);

  if (!state) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-sans text-body text-outline/60">연못을 준비하는 중…</p>
      </div>
    );
  }

  const stage = getLotusStage(state.lotusGrowth);
  const lotus = getLotusDisplay(stage);
  const today = getTodayKey();
  const clearedToday =
    state.kleshaItems.length === 0 && state.lastGrowthDate === today;
  const daysLeft = daysUntilBloom(state.lotusGrowth);
  const growthPct = Math.round(state.lotusGrowth);

  return (
    <section className="relative flex min-h-[62vh] flex-col items-center px-4 py-8 md:px-6">
      <header className="mb-6 w-full max-w-sm text-center">
        <h2 className="font-serif text-headline-md text-primary">마음의 연못</h2>
        <p className="mt-2 font-sans text-caption leading-relaxed text-outline/65">
          번뇌를 치우면 연꽃이 자라요
        </p>
      </header>

      <div className="mb-6 grid w-full max-w-sm grid-cols-3 gap-2">
        <StatusChip
          icon="spa"
          label="연꽃 성장"
          value={`${growthPct}%`}
          accent
        />
        <StatusChip
          icon="bubble_chart"
          label="떠 있는 번뇌"
          value={`${state.kleshaItems.length}개`}
        />
        <StatusChip
          icon="local_florist"
          label="만개 횟수"
          value={`${state.totalBlooms}회`}
        />
      </div>

      <div className="relative mx-auto h-[min(58vw,340px)] w-[min(94vw,380px)] md:h-[360px] md:w-[400px]">
        <div
          className="lotus-pond-water absolute inset-0 rounded-full border border-primary-container/12"
          aria-hidden
        />

        <svg
          className="pointer-events-none absolute inset-0 z-[5] h-full w-full -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(6, 95, 70, 0.08)"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(6, 95, 70, 0.45)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${(growthPct / 100) * 289} 289`}
            className="transition-all duration-700"
          />
        </svg>

        {POND_DECOR.map((d) => (
          <PondDecor key={d.id} type={d.type} x={d.x} y={d.y} rotate={d.rotate} />
        ))}

        <motion.div
          className="lotus-pond-fish pointer-events-none absolute z-[6]"
          style={{ left: "22%", top: "58%" }}
          animate={{ x: [0, 18, 0], y: [0, -6, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <span className="text-sm opacity-40">🐟</span>
        </motion.div>

        {ripples.map((id) => (
          <Ripple key={id} id={id} onDone={handleRippleDone} />
        ))}

        <motion.div
          className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          animate={{ scale: lotus.scale }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <motion.span
            className="text-5xl md:text-6xl"
            role="img"
            aria-label={lotus.label}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {lotus.emoji}
          </motion.span>
          <p className="mt-2 rounded-full bg-surface/80 px-3 py-1 font-sans text-[10px] text-primary-container">
            {lotus.label}
          </p>
        </motion.div>

        <AnimatePresence>
          {state.kleshaItems.map((item) => (
            <KleshaBubble key={item.id} item={item} onClear={handleClearKlesha} />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {feedbacks.map((f) => (
            <motion.span
              key={f.id}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -28 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85 }}
              className="pointer-events-none absolute z-30 font-serif text-caption font-semibold text-primary-container"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {f.text}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 w-full max-w-sm rounded-2xl border border-primary/8 bg-surface/70 px-5 py-4">
        <p className="font-sans text-[11px] font-semibold tracking-wide text-primary-container">
          {clearedToday
            ? "✓ 오늘 정진 완료"
            : state.kleshaItems.length > 0
              ? "번뇌를 터치하거나 밖으로 스와이프하세요"
              : "연못이 고요합니다"}
        </p>
        <p className="mt-2 font-sans text-caption leading-relaxed text-outline/60">
          {clearedToday
            ? "내일 다시 방문하면 새 번뇌가 일어날 수 있어요."
            : state.kleshaItems.length > 0
              ? "오늘 번뇌를 모두 치우면 연꽃 성장 +15%. 100%가 되면 만개합니다."
              : daysLeft > 0
                ? `현재 약 ${daysLeft}일 정진 남음 · 20분마다 번뇌가 조금씩 일어납니다.`
                : "곧 만개합니다!"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.values(KLESHA_DISPLAY).map((k) => (
            <span
              key={k.label}
              className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2 py-0.5 font-sans text-[10px] text-outline/70"
            >
              {k.emoji} {k.label}
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showWhiteout && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[90] bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBloomModal && (
          <BloomModal blessing={blessing} onConfirm={handleBloomConfirm} />
        )}
      </AnimatePresence>
    </section>
  );
}
