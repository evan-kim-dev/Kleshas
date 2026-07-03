"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const MAX_CHARS = 500;

type Message = {
  id: string;
  role: "user" | "monk";
  text: string;
  sources?: string[];
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "monk",
      text: "안녕, 번뇌러. 나는 사이버 스님이다. 🧘‍♂️ 뭐가 마음에 걸려? 솔직히 말해봐.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "monk",
          text: data.reply,
          sources: data.sources,
        },
      ]);
    } catch (e) {
      const errText =
        e instanceof Error ? e.message : "알 수 없는 오류";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "monk",
          text: `연결이 끊겼다, 번뇌러. 백엔드 서버가 켜져 있는지 확인해봐. (${errText})`,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-void">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 border-b border-void-border bg-void-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-pink/20 border border-neon-cyan/50 flex items-center justify-center shadow-neon animate-pulse_neon">
            <span className="text-lg">🧘</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-neon-cyan uppercase">
              번뇌
            </h1>
            <p className="text-[10px] text-gray-500 tracking-wider">
              CYBER MONK · v0.1
            </p>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`selectable max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-neon-pink/10 border border-neon-pink/30 text-gray-100 rounded-br-sm"
                  : "bg-void-card border border-neon-cyan/20 text-gray-200 rounded-bl-sm shadow-neon"
              }`}
            >
              {msg.role === "monk" && (
                <span className="block text-[10px] text-neon-cyan/70 mb-1 tracking-widest uppercase">
                  사이버 스님
                </span>
              )}
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.sources && msg.sources.length > 0 && (
                <p className="mt-2 text-[10px] text-gray-600 border-t border-void-border pt-1">
                  📜 {msg.sources.join(" · ")}
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-void-card border border-neon-cyan/20 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="shrink-0 px-4 py-3 border-t border-void-border bg-void-card/80 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) =>
                setInput(e.target.value.slice(0, MAX_CHARS))
              }
              onKeyDown={handleKeyDown}
              placeholder="번뇌를 털어놔봐..."
              rows={1}
              className="selectable w-full resize-none bg-void border border-void-border rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-neon-cyan/50 focus:shadow-neon transition-all"
              disabled={loading}
            />
            <span className="absolute right-3 bottom-2 text-[10px] text-gray-600">
              {input.length}/{MAX_CHARS}
            </span>
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple text-void font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-neon transition-all active:scale-95"
            aria-label="전송"
          >
            ↑
          </button>
        </div>
      </footer>
    </div>
  );
}
