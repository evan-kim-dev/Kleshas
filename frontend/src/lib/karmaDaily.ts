import quotes from "@/data/klesha_quotes.json";

export type KleshaQuote = {
  id: number;
  text: string;
  source: string;
  modern_interpretation: string;
};

export type StoredDailyKarma = {
  date: string;
  quote: KleshaQuote;
  selectedIndex: number;
};

const STORAGE_KEY = "kleshas_daily_karma";

export const KLESHA_QUOTES = quotes as KleshaQuote[];

/** 로컬 타임존 기준 오늘 날짜 (YYYY-MM-DD) */
export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getStoredDailyKarma(): StoredDailyKarma | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredDailyKarma;
    if (parsed.date !== getTodayDateKey()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveDailyKarma(
  quote: KleshaQuote,
  selectedIndex: number
): StoredDailyKarma {
  const payload: StoredDailyKarma = {
    date: getTodayDateKey(),
    quote,
    selectedIndex,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function clearDailyKarma(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function pickRandomQuote(): KleshaQuote {
  const index = Math.floor(Math.random() * KLESHA_QUOTES.length);
  return KLESHA_QUOTES[index];
}

export function pickRandomQuotes(count: number): KleshaQuote[] {
  const shuffled = [...KLESHA_QUOTES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
