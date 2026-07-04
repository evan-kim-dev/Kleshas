"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AmbientAudioButton } from "@/components/layout/AmbientAudioButton";
import { ScrollPage } from "@/components/layout/ScrollPage";
import { KarmaDonutChart } from "@/components/archive/KarmaDonutChart";
import { MindfulnessTrendChart } from "@/components/archive/MindfulnessTrendChart";
import {
  MONK_INSIGHT,
  MONTHLY_KARMA_DISTRIBUTION,
} from "@/data/karmaDashboardMock";

export function KarmaDataDashboard() {
  return (
    <ScrollPage
      mainClassName="px-4 py-6 pb-8"
      header={
        <header className="border-b border-teal-100/40 bg-[#FDFBF7]/90 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-1">
              <Link
                href="/archive"
                aria-label="기록으로 돌아가기"
                className="flex h-10 w-10 items-center justify-center rounded-full text-teal-700 transition-colors hover:bg-teal-50"
              >
                <ChevronLeft size={22} />
              </Link>
              <h1 className="font-serif text-lg font-bold text-primary">
                업보 대시보드
              </h1>
            </div>
            <AmbientAudioButton />
          </div>
        </header>
      }
    >
      <div className="space-y-6">
        <section
          aria-label="스님의 통찰"
          className="rounded-2xl border border-teal-100/50 bg-gradient-to-br from-amber-50/80 via-white/60 to-teal-50/40 px-5 py-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[18px] text-teal-700"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              self_improvement
            </span>
            <span className="font-sans text-[10px] font-semibold tracking-widest text-teal-700/80">
              스님의 통찰
            </span>
          </div>
          <p className="font-serif text-sm leading-relaxed text-stone-700">
            {MONK_INSIGHT.message}
          </p>
        </section>

        <section
          aria-label="번뇌 키워드 분포"
          className="rounded-2xl border border-teal-100/50 bg-white/50 px-4 py-5"
        >
          <h2 className="mb-1 font-sans text-xs font-semibold tracking-wide text-stone-500">
            이번 달 번뇌 분포
          </h2>
          <p className="mb-4 font-sans text-[10px] text-stone-400">
            사유 기록에서 추출한 키워드 패턴
          </p>

          <KarmaDonutChart />

          <ul className="mt-4 grid grid-cols-2 gap-2">
            {MONTHLY_KARMA_DISTRIBUTION.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-sans text-[11px] text-stone-600">
                  {item.label}
                </span>
                <span className="ml-auto font-serif text-xs font-semibold text-teal-800">
                  {item.percent}%
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-label="마음 챙김 달성도"
          className="rounded-2xl border border-teal-100/50 bg-white/50 px-2 py-5"
        >
          <h2 className="mb-1 px-2 font-sans text-xs font-semibold tracking-wide text-stone-500">
            최근 7일 마음 챙김
          </h2>
          <p className="mb-4 px-2 font-sans text-[10px] text-stone-400">
            명상 · 연못 가꾸기 참여도
          </p>

          <MindfulnessTrendChart />

          <ul className="mt-3 flex flex-wrap justify-center gap-3 px-2 pb-2">
            {[
              { color: "#0d9488", label: "달성도", opacity: 0.6 },
              { color: "#fef3c7", label: "흐름", opacity: 0.35 },
            ].map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-1.5 font-sans text-[10px] text-stone-400"
              >
                <span
                  className="h-2 w-4 rounded-sm"
                  style={{
                    backgroundColor: item.color,
                    opacity: item.opacity,
                  }}
                />
                {item.label}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ScrollPage>
  );
}
