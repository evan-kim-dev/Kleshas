"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useAmbientAudio } from "@/contexts/AudioProvider";

export function AmbientAudioButton() {
  const { volume, enabled, isPlaying, setVolume, toggleMute } = useAmbientAudio();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const muted = !enabled || volume === 0 || !isPlaying;

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label="앰비언트 사운드"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full text-teal-800/70 transition-colors hover:bg-teal-50"
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-teal-100/60 bg-white/95 p-4 shadow-mz-soft backdrop-blur-md">
          <p className="font-sans text-[10px] font-semibold tracking-wide text-stone-500">
            앰비언트
          </p>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="zen-volume-slider mt-3 w-full"
            aria-label="앰비언트 볼륨"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="font-sans text-[10px] text-stone-400">
              {Math.round(volume * 100)}%
            </span>
            <button
              type="button"
              onClick={toggleMute}
              className="font-sans text-[10px] text-teal-700"
            >
              {muted ? "켜기" : "끄기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
