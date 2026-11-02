"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n";
import { Logo } from "./Logo";

/**
 * Rendered through a portal: the mobile slider track is transformed, and a
 * transformed ancestor would otherwise break `position: fixed`.
 */
export function StoryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // minimal focus trap: the close button is the only focusable element
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      returnFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-title"
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="relative max-h-[88dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-gold/40 bg-surface p-8 shadow-[0_30px_120px_-20px_rgba(212,175,55,0.35)] sm:rounded-3xl sm:p-12"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t.story.close}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-line/15 text-fg transition-colors hover:border-gold hover:text-gold-text"
            >
              <X size={18} strokeWidth={1.6} />
            </button>

            <Logo className="mx-auto mb-5 h-20 w-auto" title="" />
            <h2
              id="story-title"
              className="text-center font-serif text-4xl font-medium leading-tight sm:text-5xl"
            >
              {t.story.title}
            </h2>

            <div className="mt-8 space-y-5 text-[0.95rem] leading-relaxed text-muted">
              {t.story.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="mt-8 text-center font-serif text-xl italic text-gold-text">
              {t.story.signature}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
