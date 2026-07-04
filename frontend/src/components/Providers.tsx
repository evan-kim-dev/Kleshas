"use client";

import { AudioProvider } from "@/contexts/AudioProvider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <AudioProvider>{children}</AudioProvider>;
}
