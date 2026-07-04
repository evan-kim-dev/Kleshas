"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { RefreshCw } from "lucide-react";
import { toPng } from "html-to-image";
import {
  clearDailyKarma,
  getStoredDailyKarma,
  pickRandomQuotes,
  saveDailyKarma,
  getTodayDateKey,
  type KleshaQuote,
} from "@/lib/karmaDaily";

type Phase = "loading" | "select" | "animating" | "revealed";

function TarotBack() {
  return (
    <div className="karma-card-face karma-card-back">
      <div className="karma-card-back-frame" aria-hidden />
      <div className="karma-card-back-inner">
        <span className="karma-card-back-symbol material-symbols-outlined">
          brightness_3
        </span>
        <span className="karma-card-back-label font-serif">번뇌</span>
      </div>
    </div>
  );
}

function TarotFront({ quote }: { quote: KleshaQuote }) {
  return (
    <div className="karma-card-face karma-card-front">
      <p className="karma-card-quote font-serif">{quote.text}</p>
      <p className="karma-card-source font-serif">— {quote.source}</p>
    </div>
  );
}

function ReadingPanel({ quote }: { quote: KleshaQuote }) {
  return (
    <div className="karma-reading animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out fill-mode-both">
      <p className="karma-reading-label font-sans">오늘의 해석</p>
      <p className="karma-reading-text font-serif">{quote.modern_interpretation}</p>
    </div>
  );
}

function FlipCard({
  quote,
  index,
  flipped,
  fading,
  selected,
  revealed,
  onClick,
  disabled,
}: {
  quote: KleshaQuote;
  index: number;
  flipped: boolean;
  fading: boolean;
  selected: boolean;
  revealed: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`카드 ${index + 1} 선택`}
      className={[
        "karma-card-perspective zen-soft",
        `karma-card-perspective--slot-${index}`,
        fading ? "karma-card-fading" : "",
        selected ? "karma-card-perspective--selected" : "",
        revealed ? "karma-card-perspective--revealed" : "",
        !disabled && !selected ? "karma-card-perspective--hoverable" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={`karma-card-inner ${flipped ? "karma-card-inner--flipped" : ""}`}
      >
        <TarotBack />
        <TarotFront quote={quote} />
      </div>
    </button>
  );
}

function ExportTemplate({
  quote,
  innerRef,
}: {
  quote: KleshaQuote;
  innerRef: RefObject<HTMLDivElement | null>;
}) {
  const today = getTodayDateKey();

  return (
    <div
      ref={innerRef}
      className="karma-export-root pointer-events-none fixed left-[-9999px] top-0 z-[-1]"
      aria-hidden
    >
      <div className="karma-export-canvas flex flex-col items-center justify-center bg-[#eef5f2] px-12 py-16">
        <p className="font-serif text-[13px] tracking-[0.35em] text-teal-700/70">
          오늘의 인연
        </p>
        <p className="mt-3 font-serif text-[11px] tracking-widest text-stone-400">
          {today}
        </p>

        <div className="mt-10 w-full max-w-[520px] rounded-3xl border border-teal-100/40 bg-[#FDFBF7] p-10 shadow-none">
          <p className="text-center font-serif text-[22px] leading-[1.85] text-stone-800">
            {quote.text}
          </p>
          <p className="mt-6 text-center font-serif text-[14px] text-teal-700">
            — {quote.source}
          </p>
          <div className="mt-8 border-t border-stone-200/40 pt-8">
            <p className="text-center font-serif text-[15px] leading-[1.85] text-teal-700/90">
              {quote.modern_interpretation}
            </p>
          </div>
        </div>

        <p className="mt-12 font-serif text-[20px] tracking-[0.15em] text-stone-800/80">
          번뇌
        </p>
      </div>
    </div>
  );
}

export function KarmaCard() {
  const exportRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [returningVisitor, setReturningVisitor] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [drawnQuote, setDrawnQuote] = useState<KleshaQuote | null>(null);
  const [slotQuotes, setSlotQuotes] = useState<KleshaQuote[]>([]);
  const [showMist, setShowMist] = useState(false);
  const [exporting, setExporting] = useState(false);

  const startNewSpread = useCallback(() => {
    clearDailyKarma();
    setReturningVisitor(false);
    setSelectedIndex(null);
    setDrawnQuote(null);
    setSlotQuotes(pickRandomQuotes(3));
    setShowMist(false);
    setPhase("select");
  }, []);

  useEffect(() => {
    const existing = getStoredDailyKarma();
    if (existing) {
      setReturningVisitor(true);
      setDrawnQuote(existing.quote);
      setSelectedIndex(existing.selectedIndex);
      setPhase("revealed");
      return;
    }

    setSlotQuotes(pickRandomQuotes(3));
    setPhase("select");
  }, []);

  const handleRedraw = useCallback(() => {
    if (phase === "animating") return;
    startNewSpread();
  }, [phase, startNewSpread]);

  const handleSelect = useCallback(
    (index: number) => {
      if (phase !== "select" || selectedIndex !== null) return;

      const quote = slotQuotes[index] ?? pickRandomQuotes(1)[0];
      setSelectedIndex(index);
      setDrawnQuote(quote);
      setPhase("animating");
      setShowMist(true);

      window.setTimeout(() => setShowMist(false), 1200);

      window.setTimeout(() => {
        saveDailyKarma(quote, index);
        setPhase("revealed");
      }, 1100);
    },
    [phase, selectedIndex, slotQuotes]
  );

  const handleExport = useCallback(async () => {
    const node = exportRef.current;
    if (!node || !drawnQuote || exporting) return;

    setExporting(true);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#eef5f2",
      });

      const link = document.createElement("a");
      link.download = `kleshas-karma-${getTodayDateKey()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      /* export failed silently */
    } finally {
      setExporting(false);
    }
  }, [drawnQuote, exporting]);

  if (phase === "loading") {
    return (
      <div className="flex min-h-[55vh] items-center justify-center px-8 py-20">
        <p className="font-sans text-body text-outline/60 zen-soft">카드를 준비하는 중…</p>
      </div>
    );
  }

  const isRevealed = phase === "revealed" || phase === "animating";
  const showReading = phase === "revealed" && drawnQuote;

  return (
    <section className="karma-spread relative flex w-full min-h-[70vh] flex-col items-center justify-center px-4 py-10">
      <header className="karma-spread-header mb-10 w-full max-w-sm text-center">
        <p className="font-serif text-headline-md text-primary">오늘의 인연</p>
        <p className="mt-5 font-sans text-body leading-relaxed text-outline/75">
          {phase === "select"
            ? "마음을 가볍게 비운 뒤, 끌리는 카드 한 장을 골라 보세요."
            : "오늘 당신과 맺어진 인연입니다."}
        </p>
        {phase === "select" && (
          <p className="mt-3 font-sans text-caption tracking-wide text-outline/50">
            직감을 믿어도 괜찮아요
          </p>
        )}
        {phase === "select" && (
          <button
            type="button"
            onClick={handleRedraw}
            className="zen-soft mt-5 inline-flex items-center gap-1.5 rounded-full border border-teal-100/60 bg-white/60 px-4 py-2 font-sans text-[11px] text-teal-700 transition-colors hover:bg-teal-50"
          >
            <RefreshCw size={14} aria-hidden />
            카드 섞기
          </button>
        )}
      </header>

      {showMist && (
        <div className="karma-mist-overlay pointer-events-none" aria-hidden />
      )}

      <div
        className={[
          "karma-fan",
          isRevealed ? "karma-fan--revealed" : "",
          returningVisitor && phase === "revealed" ? "karma-fan--single" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {(returningVisitor && phase === "revealed" && drawnQuote
          ? [drawnQuote]
          : slotQuotes
        ).map((q, i) => {
          const slotIndex = returningVisitor ? 1 : i;
          const isSelected = returningVisitor || selectedIndex === i;
          const quote =
            drawnQuote && selectedIndex === i ? drawnQuote : q;

          return (
            <FlipCard
              key={returningVisitor ? "saved" : i}
              quote={quote}
              index={slotIndex}
              flipped={isSelected && phase !== "select"}
              fading={
                !returningVisitor &&
                selectedIndex !== null &&
                selectedIndex !== i
              }
              selected={isSelected && isRevealed}
              revealed={phase === "revealed" && isSelected}
              onClick={() => handleSelect(i)}
              disabled={phase !== "select" || returningVisitor}
            />
          );
        })}
      </div>

      {showReading && drawnQuote && (
        <ReadingPanel quote={drawnQuote} />
      )}

      {showReading && (
        <div className="mt-10 flex w-full max-w-sm animate-in fade-in duration-1000 delay-300 fill-mode-both flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleRedraw}
            className="zen-soft inline-flex items-center gap-2 rounded-full border border-teal-200/60 bg-teal-50/80 px-8 py-3 font-sans text-label text-teal-800 transition-colors hover:bg-teal-100/80"
          >
            <RefreshCw size={16} aria-hidden />
            다시 뽑기
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="zen-soft rounded-full border border-primary/15 bg-surface px-10 py-3.5 font-sans text-label text-primary-container shadow-sm transition-colors hover:bg-primary/5 disabled:opacity-50"
          >
            {exporting ? "저장 중…" : "카드 저장하기"}
          </button>
          <p className="max-w-xs text-center font-sans text-caption leading-relaxed text-outline/50">
            마음이 바뀌었다면 언제든 다시 뽑을 수 있어요
          </p>
        </div>
      )}

      {drawnQuote && <ExportTemplate quote={drawnQuote} innerRef={exportRef} />}
    </section>
  );
}
