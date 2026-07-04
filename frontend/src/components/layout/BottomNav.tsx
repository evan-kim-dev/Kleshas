"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Flower2, MessageCircle, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "사유", icon: MessageCircle },
  { href: "/practice", label: "정진", icon: Flower2 },
  { href: "/daily", label: "괘시", icon: Sparkles },
  { href: "/archive", label: "기록", icon: BookOpen },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="z-50 flex h-[4.5rem] shrink-0 items-center justify-around border-t border-teal-100/50 bg-white/80 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.02)]"
      aria-label="메인 네비게이션"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <motion.div key={href} whileTap={{ scale: 0.9 }}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-[4rem] flex-col items-center justify-center gap-0.5 px-2 py-1 transition-colors ${
                active ? "text-teal-700" : "text-stone-400"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.25 : 1.75}
                aria-hidden
              />
              <span className="text-[10px] font-semibold tracking-wide">
                {label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
