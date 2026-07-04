/** 전역 앰비언트 — `public/ambient.mp3` 또는 `public/bgm.mp3` */
export const AMBIENT_AUDIO_PATH = "/bgm.mp3";

export const AMBIENT_STORAGE_KEY = "kleshas_ambient_audio";

export type AmbientPrefs = {
  enabled: boolean;
  volume: number;
};

const DEFAULT: AmbientPrefs = { enabled: true, volume: 0.28 };

export function loadAmbientPrefs(): AmbientPrefs {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(AMBIENT_STORAGE_KEY);
    if (!raw) return DEFAULT;
    const p = JSON.parse(raw) as Partial<AmbientPrefs>;
    return {
      enabled: p.enabled ?? DEFAULT.enabled,
      volume:
        typeof p.volume === "number"
          ? Math.max(0, Math.min(1, p.volume))
          : DEFAULT.volume,
    };
  } catch {
    return DEFAULT;
  }
}

export function saveAmbientPrefs(prefs: AmbientPrefs): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AMBIENT_STORAGE_KEY, JSON.stringify(prefs));
}
