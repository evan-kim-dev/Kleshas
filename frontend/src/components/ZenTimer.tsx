"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  computeBreathRuntime,
  getPhaseKey,
  MEDITATION_MODES,
  PHASE_THEME,
  type BreathPhase,
  type BreathRuntime,
  type MeditationMode,
} from "@/lib/zenTimer";
import { MeditationBgm } from "@/components/MeditationBgm";

const DURATION_OPTIONS = [3, 5, 10] as const;

type DurationMin = (typeof DURATION_OPTIONS)[number];
type TimerStatus = "idle" | "running" | "paused" | "completed";

type SutraQuote = { text: string; source: string };

const COMPLETION_QUOTES: SutraQuote[] = [
  { text: "마음에 걸림이 없고, 걸림이 없으므로 두려움이 없어…", source: "반야심경" },
  { text: "색즉시공, 공즉시색. 형태와 비어 있음은 하나이니…", source: "반야심경" },
  { text: "심은 무노애, 고는 무노애, 무는 무노애.", source: "법구경" },
  { text: "마음이 고요하면 온 세상이 고요하다.", source: "선어록" },
  { text: "일념불생, 만법자재.", source: "선어록" },
];

function formatCountdown(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function pickRandomQuote(): SutraQuote {
  return COMPLETION_QUOTES[Math.floor(Math.random() * COMPLETION_QUOTES.length)];
}

function triggerPhaseHaptic(phase: BreathPhase) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (phase === "hold") {
    navigator.vibrate([20, 30, 20]);
  } else {
    navigator.vibrate(40);
  }
}

function ColorBreathOrb({
  runtime,
  active,
  mode,
  count,
}: {
  runtime: BreathRuntime;
  active: boolean;
  mode: MeditationMode;
  count: number;
}) {
  const theme = PHASE_THEME[runtime.phase];
  const scale = 0.68 + runtime.level * 0.52;
  const ringProgress = runtime.phaseProgress * 100;

  return (
    <div className="relative flex h-44 w-44 items-center justify-center md:h-48 md:w-48">
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="rgba(6, 95, 70, 0.08)"
          strokeWidth="3"
        />
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke={theme.ring}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${(ringProgress / 100) * 276} 276`}
          className="transition-[stroke] duration-300"
        />
      </svg>

      <div
        className="relative flex items-center justify-center rounded-full transition-[transform,background-color,box-shadow] duration-200 ease-linear"
        style={{
          width: "7rem",
          height: "7rem",
          transform: `scale(${active ? scale : 1})`,
          backgroundColor: active ? theme.bg : "rgba(6, 95, 70, 0.06)",
          boxShadow: active ? `0 0 48px ${theme.glow}` : "none",
          border: `2px solid ${active ? theme.ring : "rgba(6,95,70,0.15)"}`,
        }}
      >
        {mode === "counting" && active && (
          <span
            className="font-serif text-headline-md tabular-nums transition-colors duration-300"
            style={{ color: theme.core }}
            aria-hidden
          >
            {count}
          </span>
        )}
        <span className="sr-only">
          {runtime.phase === "inhale"
            ? "들이마시기"
            : runtime.phase === "hold"
              ? "참기"
              : "내쉬기"}
        </span>
      </div>
    </div>
  );
}

function PhaseDots({ mode }: { mode: MeditationMode }) {
  const segments =
    mode === "478"
      ? (["inhale", "hold", "exhale"] as BreathPhase[])
      : (["inhale", "exhale"] as BreathPhase[]);

  return (
    <div className="flex items-center justify-center gap-3" aria-hidden>
      {segments.map((p) => (
        <span
          key={p}
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: PHASE_THEME[p].ring, opacity: 0.55 }}
        />
      ))}
    </div>
  );
}

function CompletionScreen({
  durationMin,
  quote,
}: {
  durationMin: number;
  quote: SutraQuote;
}) {
  return (
    <div className="flex max-w-sm flex-col items-center text-center">
      <p className="animate-in fade-in font-serif text-body-lg leading-relaxed text-primary">
        오늘 {durationMin}분간 마음의 먼지를 닦아내셨습니다.
      </p>
      <blockquote className="animate-in fade-in mt-10 font-serif text-body leading-relaxed text-outline/80 [animation-delay:400ms] [animation-fill-mode:both]">
        {quote.text}
        <footer className="mt-4 font-sans text-caption text-primary-container">
          — {quote.source}
        </footer>
      </blockquote>
    </div>
  );
}

export function ZenTimer() {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [mode, setMode] = useState<MeditationMode>("awareness");
  const [durationMin, setDurationMin] = useState<DurationMin>(5);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const [breath, setBreath] = useState<BreathRuntime>({
    phase: "inhale",
    phaseProgress: 0,
    level: 0,
    segmentIndex: 0,
    secondsLeftInPhase: 4,
  });
  const [breathCount, setBreathCount] = useState(1);
  const [completedDuration, setCompletedDuration] = useState(5);
  const [completionQuote, setCompletionQuote] = useState(COMPLETION_QUOTES[0]);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [circleExiting, setCircleExiting] = useState(false);

  const statusRef = useRef(status);
  const modeRef = useRef(mode);
  const sessionDurationRef = useRef(durationMin);
  const breathCycleStartRef = useRef(0);
  const lastPhaseKeyRef = useRef("");
  const hapticEnabledRef = useRef(hapticEnabled);

  statusRef.current = status;
  modeRef.current = mode;
  sessionDurationRef.current = durationMin;
  hapticEnabledRef.current = hapticEnabled;

  const resetBreathCycle = useCallback(() => {
    breathCycleStartRef.current = performance.now();
    lastPhaseKeyRef.current = "";
    setBreathCount(1);
    setBreath(
      computeBreathRuntime(modeRef.current, breathCycleStartRef.current, performance.now())
    );
  }, []);

  const handleStart = useCallback(() => {
    if (status === "idle") {
      sessionDurationRef.current = durationMin;
      setSecondsLeft(durationMin * 60);
      setCircleExiting(false);
      resetBreathCycle();
      setStatus("running");
      return;
    }
    if (status === "paused") resetBreathCycle();
    setStatus("running");
  }, [durationMin, resetBreathCycle, status]);

  const handlePause = useCallback(() => setStatus("paused"), []);
  const handleStop = useCallback(() => {
    setStatus("idle");
    setSecondsLeft(durationMin * 60);
    setCircleExiting(false);
    setBreathCount(1);
    setBreath({
      phase: "inhale",
      phaseProgress: 0,
      level: 0,
      segmentIndex: 0,
      secondsLeftInPhase: 4,
    });
  }, [durationMin]);

  const handleRestart = useCallback(() => {
    setStatus("idle");
    setSecondsLeft(durationMin * 60);
    setCircleExiting(false);
    setBreathCount(1);
  }, [durationMin]);

  useEffect(() => {
    if (status !== "running") return;

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setCircleExiting(true);
          window.setTimeout(() => {
            if (statusRef.current === "running") {
              setCompletedDuration(sessionDurationRef.current);
              setCompletionQuote(pickRandomQuote());
              setStatus("completed");
            }
          }, 700);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status !== "running") return;

    let raf = 0;
    const tick = (now: number) => {
      const next = computeBreathRuntime(
        modeRef.current,
        breathCycleStartRef.current,
        now
      );
      setBreath(next);

      const phaseKey = getPhaseKey(next);
      if (phaseKey !== lastPhaseKeyRef.current) {
        const prevKey = lastPhaseKeyRef.current;
        lastPhaseKeyRef.current = phaseKey;

        if (hapticEnabledRef.current && prevKey !== "") {
          triggerPhaseHaptic(next.phase);
        }

        if (
          modeRef.current === "counting" &&
          prevKey !== "" &&
          next.phase === "inhale" &&
          next.segmentIndex === 0
        ) {
          setBreathCount((c) => (c >= 10 ? 1 : c + 1));
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status]);

  const showSetup = status === "idle" || status === "paused";
  const breathActive = status === "running" && !circleExiting;
  const hapticSupported =
    typeof navigator !== "undefined" && "vibrate" in navigator;
  const selectedMode = MEDITATION_MODES.find((m) => m.id === mode)!;

  return (
    <section className="flex min-h-[62vh] flex-col items-center px-4 py-8">
      {showSetup && (
        <>
          <div className="mb-6 w-full max-w-sm space-y-2">
            {MEDITATION_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={status === "paused"}
                onClick={() => setMode(m.id)}
                className={`zen-soft flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                  mode === m.id
                    ? "border-primary-container/25 bg-primary-container/8"
                    : "border-primary/8 bg-surface/70 hover:bg-surface"
                } ${status === "paused" ? "opacity-60" : ""}`}
              >
                <span className="material-symbols-outlined text-[22px] text-primary-container">
                  {m.icon}
                </span>
                <span>
                  <span className="block font-sans text-body font-semibold text-primary">
                    {m.name}
                  </span>
                  <span className="mt-0.5 block font-sans text-caption text-outline/65">
                    {m.desc}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="mb-8 flex gap-6">
            {DURATION_OPTIONS.map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => {
                  setDurationMin(min);
                  setSecondsLeft(min * 60);
                }}
                disabled={status === "paused"}
                className={`zen-soft font-sans text-label ${
                  durationMin === min
                    ? "text-primary-container"
                    : "text-outline/50 hover:text-primary-container"
                }`}
              >
                {min}분
              </button>
            ))}
          </div>
        </>
      )}

      {status !== "idle" && status !== "completed" && (
        <p className="mb-2 font-sans text-caption tracking-[0.15em] text-outline/50">
          {formatCountdown(secondsLeft)}
        </p>
      )}

      {status !== "idle" && status !== "completed" && (
        <p className="mb-6 font-sans text-[11px] text-outline/55">
          {selectedMode.name}
        </p>
      )}

      {status === "completed" ? (
        <CompletionScreen durationMin={completedDuration} quote={completionQuote} />
      ) : (
        <div className="flex w-full max-w-sm flex-col items-center gap-6">
          <div
            className={`transition-opacity duration-700 ${
              circleExiting ? "scale-90 opacity-0" : "opacity-100"
            }`}
          >
            <ColorBreathOrb
              runtime={breath}
              active={breathActive}
              mode={mode}
              count={breathCount}
            />
          </div>

          {breathActive && <PhaseDots mode={mode} />}

          {!breathActive && status === "idle" && (
            <p className="max-w-xs text-center font-sans text-caption leading-relaxed text-outline/55">
              {mode === "awareness" &&
                "색이 차가워지면 들이마시고, 따뜻해지면 내쉬어 보세요."}
              {mode === "478" &&
                "청록 → 호박색(참) → 연두색 순으로 색이 바뀝니다."}
              {mode === "counting" &&
                "한 호흡 주기마다 가운데 숫자가 1부터 10까지 올라갑니다."}
            </p>
          )}

          <div className="flex flex-col items-center gap-3">
            <MeditationBgm sessionStatus={status} />

            {hapticSupported && showSetup && (
              <button
                type="button"
                onClick={() => setHapticEnabled((v) => !v)}
                className="zen-soft flex items-center gap-2 rounded-full border border-primary/10 px-4 py-2 font-sans text-[11px] text-outline/60"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {hapticEnabled ? "vibration" : "mobile_off"}
                </span>
                {hapticEnabled ? "단계 전환 진동 켜짐" : "단계 전환 진동 꺼짐"}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="zen-soft mt-10 flex items-center gap-10">
        {status === "idle" && (
          <button
            type="button"
            onClick={handleStart}
            className="rounded-full bg-primary-container px-8 py-3 font-sans text-label text-white shadow-sm hover:opacity-90"
          >
            명상 시작
          </button>
        )}
        {status === "running" && (
          <>
            <button
              type="button"
              onClick={handlePause}
              className="font-sans text-label text-outline/60 hover:text-primary-container"
            >
              멈춤
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="font-sans text-label text-outline/60 hover:text-primary-container"
            >
              종료
            </button>
          </>
        )}
        {status === "paused" && (
          <>
            <button
              type="button"
              onClick={handleStart}
              className="rounded-full bg-primary-container px-8 py-3 font-sans text-label text-white"
            >
              이어하기
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="font-sans text-label text-outline/60"
            >
              종료
            </button>
          </>
        )}
        {status === "completed" && (
          <button
            type="button"
            onClick={handleRestart}
            className="font-sans text-label text-outline/60"
          >
            다시
          </button>
        )}
      </div>
    </section>
  );
}
