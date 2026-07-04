"use client";

import type { ReactNode } from "react";

type ScrollPageProps = {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  mainClassName?: string;
};

/** 헤더 고정 + 본문만 세로 스크롤되는 페이지 골격 */
export function ScrollPage({
  header,
  children,
  footer,
  className = "",
  mainClassName = "",
}: ScrollPageProps) {
  return (
    <div className={`flex h-full min-h-0 flex-col ${className}`}>
      <div className="z-40 shrink-0">{header}</div>
      <main
        className={`min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] ${mainClassName}`}
      >
        {children}
      </main>
      {footer ? <div className="z-40 shrink-0">{footer}</div> : null}
    </div>
  );
}
