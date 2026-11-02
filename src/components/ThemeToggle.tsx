"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const toggle = () => {
    // Enables the colour crossfade defined in globals.css for a moment only.
    const root = document.documentElement;
    root.classList.add("theme-transition");
    setTheme(isDark ? "light" : "dark");
    window.setTimeout(() => root.classList.remove("theme-transition"), 750);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t.nav.toLight : t.nav.toDark}
      className="relative grid h-10 w-10 place-items-center rounded-full border border-line/15 text-fg transition-colors hover:border-gold hover:text-gold-text"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -80, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 80, scale: 0.6 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="grid place-items-center"
        >
          {isDark ? (
            <Moon size={17} strokeWidth={1.6} />
          ) : (
            <Sun size={17} strokeWidth={1.6} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
