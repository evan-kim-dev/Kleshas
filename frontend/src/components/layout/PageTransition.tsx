"use client";

import { motion } from "framer-motion";

/** AnimatePresence 직계 자식으로 사용할 motion 컨테이너 */
export const PageTransition = motion.div;

export const pageFadeTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.28, ease: "easeInOut" },
} as const;
