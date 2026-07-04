"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AMBIENT_AUDIO_PATH,
  loadAmbientPrefs,
  saveAmbientPrefs,
} from "@/lib/ambientAudio";

type AudioContextValue = {
  volume: number;
  enabled: boolean;
  isPlaying: boolean;
  setVolume: (v: number) => void;
  toggleEnabled: () => void;
  toggleMute: () => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAmbientAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAmbientAudio must be used within AudioProvider");
  return ctx;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolumeState] = useState(0.28);
  const [lastVolume, setLastVolume] = useState(0.28);
  const [enabled, setEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const enabledRef = useRef(enabled);
  const volumeRef = useRef(volume);
  enabledRef.current = enabled;
  volumeRef.current = volume;

  useEffect(() => {
    const prefs = loadAmbientPrefs();
    setVolumeState(prefs.volume);
    setLastVolume(prefs.volume);
    setEnabled(prefs.enabled);
  }, []);

  useEffect(() => {
    saveAmbientPrefs({ enabled, volume });
  }, [enabled, volume]);

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !enabledRef.current || volumeRef.current === 0) return;
    audio.volume = volumeRef.current;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.loop = true;

    const boot = async () => {
      if (enabled && volume > 0) await tryPlay();
    };

    if (audio.readyState >= 3) void boot();
    else audio.addEventListener("canplaythrough", boot, { once: true });

    const onInteract = () => {
      if (enabledRef.current && audio.paused && volumeRef.current > 0) {
        void tryPlay();
      }
    };
    document.addEventListener("click", onInteract, { once: true });

    return () => {
      audio.removeEventListener("canplaythrough", boot);
      document.removeEventListener("click", onInteract);
    };
  }, [enabled, volume, tryPlay]);

  const setVolume = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(1, next));
      setVolumeState(clamped);
      if (clamped > 0) setLastVolume(clamped);
      const audio = audioRef.current;
      if (audio) audio.volume = clamped;
      if (clamped === 0) {
        audio?.pause();
        setIsPlaying(false);
      } else if (enabledRef.current) {
        void tryPlay();
      }
    },
    [tryPlay]
  );

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (next) void tryPlay();
      else {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
      return next;
    });
  }, [tryPlay]);

  const toggleMute = useCallback(() => {
    if (volume === 0) setVolume(lastVolume > 0 ? lastVolume : 0.28);
    else setVolume(0);
  }, [lastVolume, setVolume, volume]);

  return (
    <AudioContext.Provider
      value={{
        volume,
        enabled,
        isPlaying,
        setVolume,
        toggleEnabled,
        toggleMute,
      }}
    >
      <audio
        ref={audioRef}
        src={AMBIENT_AUDIO_PATH}
        preload="auto"
        className="hidden"
        aria-hidden
      />
      {children}
    </AudioContext.Provider>
  );
}
