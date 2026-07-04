"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { AmbientAudioButton } from "@/components/layout/AmbientAudioButton";
import { ScrollPage } from "@/components/layout/ScrollPage";
import { loadLotusState } from "@/lib/lotusGarden";
import { getMoktakLevel, loadMoktakState } from "@/lib/moktakStorage";

type JournalMessage = {
  id: string;
  text: string;
  createdAt: Date;
};

function JournalList({
  entries,
  onDelete,
}: {
  entries: JournalMessage[];
  onDelete: (id: string) => void;
}) {
  if (entries.length === 0) {
    return (
      <p className="px-4 py-12 text-center font-sans text-body text-outline/70">
        아직 남긴 기록이 없습니다.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {[...entries].reverse().map((entry) => (
        <li key={entry.id}>
          <article className="msg-user selectable relative rounded-2xl px-5 py-4">
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              aria-label="기록 삭제"
              className="absolute right-3 top-3 rounded-full p-1.5 text-outline/50 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <span className="material-symbols-outlined text-[18px]">
                delete
              </span>
            </button>
            <p className="whitespace-pre-wrap pr-8 font-sans text-body text-on-surface/90">
              {entry.text}
            </p>
            <time
              dateTime={entry.createdAt.toISOString()}
              className="mt-4 block font-sans text-label text-outline/60"
            >
              {entry.createdAt.toLocaleString("ko-KR", {
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </time>
          </article>
        </li>
      ))}
    </ul>
  );
}

export function ArchiveDashboard() {
  const [entries, setEntries] = useState<JournalMessage[]>([]);
  const [stats, setStats] = useState({
    totalMessages: 0,
    lotusLevel: 0,
    lotusBlooms: 0,
    moktakMerit: 0,
    moktakLevel: 1,
  });

  const refresh = useCallback(() => {
    fetch("/api/messages")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.messages) return;
        const userMsgs = data.messages.filter(
          (m: { role: string }) => m.role === "user"
        );
        setEntries(
          userMsgs.map(
            (m: { id: string; text: string; createdAt: string }) => ({
              id: m.id,
              text: m.text,
              createdAt: new Date(m.createdAt),
            })
          )
        );
        setStats((prev) => ({
          ...prev,
          totalMessages: userMsgs.length,
        }));
      })
      .catch(() => {});

    const lotus = loadLotusState();
    const moktak = loadMoktakState();
    setStats((prev) => ({
      ...prev,
      lotusLevel: Math.round(lotus.lotusGrowth),
      lotusBlooms: lotus.totalBlooms,
      moktakMerit: moktak.meritCount,
      moktakLevel: getMoktakLevel(moktak.meritCount),
    }));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("이 기록을 삭제할까요?")) return;

      try {
        const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
        if (res.ok) {
          const data = (await res.json()) as { deletedIds?: string[] };
          const removed = new Set(data.deletedIds ?? [id]);
          setEntries((prev) => prev.filter((e) => !removed.has(e.id)));
          refresh();
          return;
        }
        if (res.status === 404) {
          setEntries((prev) => prev.filter((e) => e.id !== id));
        }
      } catch {
        /* ignore */
      }
    },
    [refresh]
  );

  return (
    <ScrollPage
      mainClassName="px-4 py-6 pb-8"
      header={
        <header className="border-b border-teal-100/40 bg-[#FDFBF7]/90 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="font-serif text-lg font-bold text-primary">기록</h1>
            <AmbientAudioButton />
          </div>
        </header>
      }
    >
      <Link
          href="/archive/dashboard"
          className="mb-6 flex items-center gap-3 rounded-2xl border border-teal-100/60 bg-gradient-to-r from-teal-50/80 to-amber-50/50 px-4 py-4 transition-colors hover:border-teal-200/80"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700/10 text-teal-700">
            <BarChart3 size={20} />
          </span>
          <span>
            <span className="block font-sans text-sm font-semibold text-teal-800">
              업보 대시보드
            </span>
            <span className="mt-0.5 block font-sans text-[10px] text-stone-400">
              번뇌 패턴 · 마음 챙김 시각화
            </span>
          </span>
          <span className="material-symbols-outlined ml-auto text-stone-300">
            chevron_right
          </span>
        </Link>

        <section aria-label="수행 통계" className="mb-8">
          <h2 className="mb-3 font-sans text-xs font-semibold tracking-wide text-stone-500">
            수행 통계
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-teal-100/60 bg-white/70 p-4">
              <p className="font-sans text-[10px] text-stone-400">사유 기록</p>
              <p className="mt-1 font-serif text-2xl font-bold text-teal-800">
                {stats.totalMessages}
              </p>
            </div>
            <div className="rounded-2xl border border-teal-100/60 bg-white/70 p-4">
              <p className="font-sans text-[10px] text-stone-400">연꽃 성장</p>
              <p className="mt-1 font-serif text-2xl font-bold text-teal-800">
                {stats.lotusLevel}%
              </p>
            </div>
            <div className="rounded-2xl border border-teal-100/60 bg-white/70 p-4">
              <p className="font-sans text-[10px] text-stone-400">연꽃 만개</p>
              <p className="mt-1 font-serif text-2xl font-bold text-teal-800">
                {stats.lotusBlooms}
              </p>
            </div>
            <div className="rounded-2xl border border-teal-100/60 bg-white/70 p-4">
              <p className="font-sans text-[10px] text-stone-400">목탁 공덕</p>
              <p className="mt-1 font-serif text-2xl font-bold text-teal-800">
                {stats.moktakMerit}
              </p>
            </div>
          </div>
        </section>

        <section aria-label="번뇌 기록">
          <h2 className="mb-3 font-sans text-xs font-semibold tracking-wide text-stone-500">
            번뇌 기록
          </h2>
          <JournalList entries={entries} onDelete={handleDelete} />
        </section>
    </ScrollPage>
  );
}
