/** 명상 BGM — `public/meditation-bgm.mp3` 파일을 추가하면 재생됩니다. */
export const MEDITATION_BGM_PATH = "/meditation-bgm.mp3";

export const MEDITATION_BGM_STORAGE_KEY = "kleshas_meditation_bgm";

export type MeditationBgmPrefs = {
  enabled: boolean;
  volume: number;
};

const DEFAULT_PREFS: MeditationBgmPrefs = {
  enabled: true,
  volume: 0.35,
};

export function loadMeditationBgmPrefs(): MeditationBgmPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;

  try {
    const raw = localStorage.getItem(MEDITATION_BGM_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<MeditationBgmPrefs>;
    return {
      enabled: parsed.enabled ?? DEFAULT_PREFS.enabled,
      volume:
        typeof parsed.volume === "number"
          ? Math.max(0, Math.min(1, parsed.volume))
          : DEFAULT_PREFS.volume,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveMeditationBgmPrefs(prefs: MeditationBgmPrefs): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MEDITATION_BGM_STORAGE_KEY, JSON.stringify(prefs));
}
