"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { AmbientAudioButton } from "@/components/layout/AmbientAudioButton";
import { ScrollPage } from "@/components/layout/ScrollPage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const MAX_CHARS = 500;

type Message = {
  id: string;
  role: "user" | "monk";
  text: string;
  sources?: string[];
  createdAt: Date;
  persistable?: boolean;
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "monk",
  text: "어서 오십시오. 이곳은 마음의 짐을 내려놓는 자리입니다. 무엇이 당신을 괴롭히고 있습니까?",
  createdAt: new Date(),
  persistable: false,
};

function createWelcomeMessage(): Message {
  return { ...WELCOME_MESSAGE, createdAt: new Date() };
}

function BreathingLoader() {
  return (
    <div className="animate-mz-fade-in flex flex-col items-start gap-2 pr-12">
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
      <div className="msg-cyber-monk max-w-full rounded-2xl rounded-tl-sm px-5 py-4">
        <p className="animate-zen-text-breathe text-center font-sans text-caption text-outline/70">
          깨달음을 모으는 중...
        </p>
      </div>
    </div>
  );
}

function UserMessage({
  text,
  createdAt,
  animationDelay,
}: {
  text: string;
  createdAt: Date;
  animationDelay?: string;
}) {
  return (
    <div
      className="animate-mz-fade-in flex flex-col items-end gap-1 pl-12"
      style={animationDelay ? { animationDelay } : undefined}
    >
      <div className="msg-user selectable max-w-full rounded-2xl rounded-tr-sm px-4 py-3">
        <p className="selectable whitespace-pre-wrap font-sans text-body text-on-surface/90">
          {text}
        </p>
      </div>
      <span className="mr-2 font-sans text-label text-outline/60">
        {formatTime(createdAt)}
      </span>
    </div>
  );
}

export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([createWelcomeMessage()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/messages")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.messages?.length) return;

        const loaded: Message[] = data.messages.map(
          (m: {
            id: string;
            text: string;
            role: string;
            createdAt: string;
          }) => ({
            id: m.id,
            role: m.role === "ai" ? ("monk" as const) : ("user" as const),
            text: m.text,
            createdAt: new Date(m.createdAt),
            persistable: m.role === "ai",
          })
        );

        setMessages(loaded);
      })
      .catch(() => {});
  }, []);

  const handleNewChat = useCallback(async () => {
    if (loading) return;
    if (
      messages.length > 1 &&
      !window.confirm("새 대화를 시작할까요? 지금까지의 대화 기록이 지워집니다.")
    ) {
      return;
    }

    try {
      await fetch("/api/messages", { method: "DELETE" });
    } catch {
      /* UI는 초기화 */
    }

    setMessages([createWelcomeMessage()]);
    setInput("");
    inputRef.current?.focus();
  }, [loading, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const chatHistory = messages.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    let persistedUserId: string | null = null;

    try {
      const userSaveRes = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, role: "user" }),
      });

      if (userSaveRes.ok) {
        const userSaved = await userSaveRes.json();
        persistedUserId = userSaved.id;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsg.id ? { ...m, id: userSaved.id } : m
          )
        );
      }

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, chat_history: chatHistory }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `HTTP ${res.status}`);
      }

      const data = await res.json();

      const monkMsg: Message = {
        id: crypto.randomUUID(),
        role: "monk",
        text: data.reply,
        sources: data.sources,
        createdAt: new Date(),
        persistable: true,
      };

      setMessages((prev) => [...prev, monkMsg]);

      const aiSaveRes = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: data.reply,
          role: "ai",
          pairedUserId: persistedUserId ?? undefined,
        }),
      });

      if (aiSaveRes.ok) {
        const aiSaved = await aiSaveRes.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === monkMsg.id ? { ...m, id: aiSaved.id } : m
          )
        );
      }
    } catch (e) {
      const errText = e instanceof Error ? e.message : "알 수 없는 오류";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "monk",
          text: `연결이 끊어졌습니다. 백엔드 서버가 실행 중인지 확인해 주십시오. (${errText})`,
          createdAt: new Date(),
          persistable: false,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <ScrollPage
      mainClassName="px-4 pt-4 pb-2"
      header={
        <header className="border-b border-teal-100/40 bg-[#FDFBF7]/90 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-teal-700">
              <span className="material-symbols-outlined text-[22px]">
                local_florist
              </span>
            </div>

            <h1 className="font-serif text-lg font-bold tracking-tight text-primary">
              번뇌
            </h1>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNewChat}
                aria-label="새 대화"
                className="flex h-10 w-10 items-center justify-center rounded-full text-teal-700 transition-colors hover:bg-teal-50"
              >
                <span className="material-symbols-outlined text-[22px]">
                  edit_square
                </span>
              </button>
              <AmbientAudioButton />
            </div>
          </div>
        </header>
      }
      footer={
        <div className="border-t border-teal-100/30 bg-[#FDFBF7]/95 backdrop-blur-md">
          <div className="px-4 pb-4 pt-3">
            <div className="mz-input-shell flex items-end gap-2 rounded-xl p-2">
              <button
                type="button"
                aria-label="첨부"
                className="p-2 text-outline transition-colors hover:text-primary-container"
              >
                <span className="material-symbols-outlined">add_circle</span>
              </button>
              <div className="min-w-0 flex-1 pb-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                  onKeyDown={handleKeyDown}
                  placeholder="마음을 전하세요..."
                  rows={1}
                  disabled={loading}
                  className="ghost-input selectable w-full px-2 py-2 font-sans text-body text-on-surface"
                />
              </div>
              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                aria-label="전송"
                className="group relative mz-send-btn overflow-hidden rounded-lg p-2 shadow-sm"
              >
                <div className="absolute inset-0 bg-modern-gold opacity-0 transition-opacity group-hover:opacity-20" />
                <span
                  className="material-symbols-outlined relative z-10 text-[22px] text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  send
                </span>
              </button>
            </div>
            <p className="mt-2 text-right font-sans text-[10px] text-outline/50">
              {input.length}/{MAX_CHARS}
            </p>
          </div>
        </div>
      }
    >
        <div className="relative flex flex-col gap-6 py-2">
          {messages.map((msg, i) => {
            const delay = `${0.1 + i * 0.15}s`;
            return msg.role === "user" ? (
              <UserMessage
                key={msg.id}
                text={msg.text}
                createdAt={msg.createdAt}
                animationDelay={delay}
              />
            ) : (
              <ChatMessage
                key={msg.id}
                id={msg.id}
                text={msg.text}
                createdAt={msg.createdAt}
                persistable={
                  msg.persistable !== false &&
                  msg.role === "monk" &&
                  msg.id !== "welcome"
                }
                animationDelay={delay}
              />
            );
          })}

          {loading && <BreathingLoader />}
          <div ref={bottomRef} />
        </div>
    </ScrollPage>
  );
}
