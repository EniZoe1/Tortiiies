"use client";

import { useI18n } from "@/lib/i18n";
import { LangToggle } from "./LangToggle";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Fixed, minimalist bar with exactly three elements:
 * logo · language toggle · theme toggle.
 */
export function Navbar() {
  const { t } = useI18n();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] border-b border-line/10 bg-bg/70 backdrop-blur-xl transition-colors duration-500">
      <nav className="mx-auto flex h-full max-w-[1800px] items-center justify-between px-4 sm:px-8">
        <a
          href="#"
          aria-label={t.nav.home}
          className="block transition-transform duration-500 hover:scale-[1.04]"
        >
          <Logo className="h-[3.1rem] w-auto sm:h-[3.6rem]" title="Tortiiies" />
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <LangToggle />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
