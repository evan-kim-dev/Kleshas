"use client";

import { useState } from "react";
import { ZenTimer } from "@/components/ZenTimer";
import { LotusGarden } from "@/components/LotusGarden";
import { MoktakClicker } from "@/components/MoktakClicker";
import { AmbientAudioButton } from "@/components/layout/AmbientAudioButton";
import { ScrollPage } from "@/components/layout/ScrollPage";

type PracticeTab = "timer" | "garden" | "moktak";

const TABS: { id: PracticeTab; label: string }[] = [
  { id: "timer", label: "호흡" },
  { id: "garden", label: "연못" },
  { id: "moktak", label: "목탁" },
];

export function PracticeHub() {
  const [tab, setTab] = useState<PracticeTab>("timer");

  return (
    <ScrollPage
      mainClassName="px-2 py-4 pb-8"
      header={
        <header className="border-b border-teal-100/40 bg-[#FDFBF7]/90 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="font-serif text-lg font-bold text-primary">정진</h1>
            <AmbientAudioButton />
          </div>
          <div className="flex gap-1 px-4 pb-3">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex-1 rounded-full py-2 font-sans text-xs font-semibold transition-colors ${
                  tab === id
                    ? "bg-teal-700 text-white"
                    : "bg-teal-50 text-teal-700/70"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>
      }
    >
      {tab === "timer" && <ZenTimer />}
      {tab === "garden" && <LotusGarden />}
      {tab === "moktak" && <MoktakClicker />}
    </ScrollPage>
  );
}
