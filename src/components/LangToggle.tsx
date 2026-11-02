"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function LangToggle() {
  const { lang, toggleLang, t } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={t.nav.switchLang}
      className="relative flex h-10 items-center rounded-full border border-line/15 p-1 text-[0.68rem] font-medium tracking-[0.18em] transition-colors hover:border-gold"
    >
      {(["en", "pl"] as const).map((code) => {
        const active = lang === code;
        return (
          <span
            key={code}
            className={`relative z-10 grid h-8 w-9 place-items-center transition-colors duration-300 ${
              active ? "text-black" : "text-muted"
            }`}
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-gold-soft to-gold"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {code.toUpperCase()}
          </span>
        );
      })}
    </button>
  );
}
