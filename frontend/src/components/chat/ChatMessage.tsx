"use client";

const SOURCE_EMOJI = "📜";

type ParsedMonkMessage = {
  mainText: string;
  sourceText: string | null;
};

function parseMonkMessage(content: string): ParsedMonkMessage {
  const idx = content.indexOf(SOURCE_EMOJI);
  if (idx === -1) {
    return { mainText: content.trim(), sourceText: null };
  }
  return {
    mainText: content.slice(0, idx).trim(),
    sourceText: content.slice(idx + SOURCE_EMOJI.length).trim() || null,
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

type ChatMessageProps = {
  id: string;
  text: string;
  createdAt: Date;
  persistable?: boolean;
  animationDelay?: string;
};

export function ChatMessage({
  text,
  createdAt,
  animationDelay,
}: ChatMessageProps) {
  const { mainText, sourceText } = parseMonkMessage(text);

  return (
    <div
      className="animate-mz-fade-in flex flex-col items-start gap-2 pr-12"
      style={animationDelay ? { animationDelay } : undefined}
    >
      <div className="flex items-center gap-2 pl-2">
        <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-primary-container/10">
          <span
            className="material-symbols-outlined text-[16px] text-primary-container"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            self_improvement
          </span>
        </div>
        <span className="font-sans text-label font-bold tracking-widest text-primary">
          Cyber Monk
        </span>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
      </div>

      <div className="relative msg-cyber-monk selectable max-w-full rounded-2xl rounded-tl-sm px-5 py-4">
        {mainText && (
          <p className="selectable font-serif text-quote-scripture text-primary-container/90 whitespace-pre-wrap">
            {mainText}
          </p>
        )}

        {!mainText && !sourceText && (
          <p className="selectable font-serif text-quote-scripture text-primary-container/90 whitespace-pre-wrap">
            {text.trim()}
          </p>
        )}

        {sourceText && (
          <div className={`${mainText ? "mt-4 pt-3" : ""} border-t border-primary-container/10`}>
            <p className="font-sans text-right text-caption text-outline/70">
              {SOURCE_EMOJI} {sourceText}
            </p>
          </div>
        )}
      </div>

      <span className="ml-2 font-sans text-label text-outline/60">
        {formatTime(createdAt)}
      </span>
    </div>
  );
}
