"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadMeditationBgmPrefs,
  MEDITATION_BGM_PATH,
  saveMeditationBgmPrefs,
} from "@/lib/meditationBgm";

type SessionStatus = "idle" | "running" | "paused" | "completed";

type MeditationBgmProps = {
  sessionStatus: SessionStatus;
};

export function MeditationBgm({ sessionStatus }: MeditationBgmProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.35);
  const [showPanel, setShowPanel] = useState(false);
  const [fileMissing, setFileMissing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const enabledRef = useRef(enabled);
  const volumeRef = useRef(volume);
  enabledRef.current = enabled;
  volumeRef.current = volume;

  useEffect(() => {
    const prefs = loadMeditationBgmPrefs();
    setEnabled(prefs.enabled);
    setVolume(prefs.volume);
  }, []);

  useEffect(() => {
    saveMeditationBgmPrefs({ enabled, volume });
  }, [enabled, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !enabledRef.current) return;

    audio.volume = volumeRef.current;
    try {
      await audio.play();
      setFileMissing(false);
    } catch {
      setFileMissing(true);
    }
  }, []);

  const pauseAndReset = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  useEffect(() => {
    if (sessionStatus === "running" && enabled) {
      void tryPlay();
      return;
    }
    if (sessionStatus === "paused") {
      audioRef.current?.pause();
      return;
    }
    if (sessionStatus === "idle" || sessionStatus === "completed") {
      pauseAndReset();
    }
  }, [sessionStatus, enabled, tryPlay, pauseAndReset]);

  useEffect(() => {
    if (!showPanel) return;
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showPanel]);

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (!next) pauseAndReset();
      else if (sessionStatus === "running") void tryPlay();
      return next;
    });
  }, [pauseAndReset, sessionStatus, tryPlay]);

  const applyVolume = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(1, next));
      setVolume(clamped);
      const audio = audioRef.current;
      if (audio) audio.volume = clamped;
    },
    []
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <audio
        ref={audioRef}
        src={MEDITATION_BGM_PATH}
        loop
        preload="none"
        className="hidden"
      />

      <div ref={panelRef} className="relative">
        <button
          type="button"
          onClick={() => setShowPanel((p) => !p)}
          aria-label="명상 배경음악 설정"
          aria-expanded={showPanel}
          className="zen-soft flex items-center gap-2 rounded-full border border-primary/10 px-4 py-2 font-sans text-[11px] text-outline/60 transition-colors hover:border-primary/20 hover:text-primary-container"
        >
          <span className="material-symbols-outlined text-[16px]">
            {enabled && !fileMissing ? "music_note" : "music_off"}
          </span>
          명상 BGM {enabled ? "켜짐" : "꺼짐"}
        </button>

        {showPanel && (
          <div className="zen-panel-floating absolute bottom-full left-1/2 z-50 mb-3 w-56 -translate-x-1/2 rounded-xl px-4 py-4">
            <p className="font-sans text-[10px] font-semibold tracking-wide text-outline/60">
              명상 배경음
            </p>

            <button
              type="button"
              onClick={toggleEnabled}
              className="zen-soft mt-3 w-full rounded-lg border border-primary/10 py-2 font-sans text-[11px] text-primary-container"
            >
              {enabled ? "BGM 끄기" : "BGM 켜기"}
            </button>

            <div className="mt-4">
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onChange={(e) => applyVolume(Number(e.target.value) / 100)}
                disabled={!enabled}
                className="zen-volume-slider w-full"
                aria-label="명상 BGM 볼륨"
              />
              <p className="mt-1 text-right font-sans text-[10px] text-outline/50">
                {Math.round(volume * 100)}%
              </p>
            </div>

            <p className="mt-3 font-sans text-[10px] leading-relaxed text-outline/50">
              {fileMissing
                ? `public/meditation-bgm.mp3 파일을 추가해 주세요.`
                : `파일: ${MEDITATION_BGM_PATH}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
