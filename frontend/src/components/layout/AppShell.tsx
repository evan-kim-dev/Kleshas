"use client";

import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-md flex-col overflow-hidden bg-[#FDFBF7] shadow-2xl">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="mz-ambient-ring" />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>

      <BottomNav />
    </div>
  );
}
