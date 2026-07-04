"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  PageTransition,
  pageFadeTransition,
} from "@/components/layout/PageTransition";

export default function MainTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <PageTransition
        key={pathname}
        {...pageFadeTransition}
        className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
      >
        {children}
      </PageTransition>
    </AnimatePresence>
  );
}
