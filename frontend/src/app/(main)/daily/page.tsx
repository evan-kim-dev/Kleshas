"use client";

import { KarmaCard } from "@/components/KarmaCard";
import { AmbientAudioButton } from "@/components/layout/AmbientAudioButton";
import { ScrollPage } from "@/components/layout/ScrollPage";

export default function DailyPage() {
  return (
    <ScrollPage
      mainClassName="flex flex-col items-center px-2 py-4 pb-8"
      header={
        <header className="border-b border-teal-100/40 bg-[#FDFBF7]/90 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="font-serif text-lg font-bold text-primary">괘시</h1>
            <AmbientAudioButton />
          </div>
        </header>
      }
    >
      <KarmaCard />
    </ScrollPage>
  );
}
