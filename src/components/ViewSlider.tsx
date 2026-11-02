"use client";

import { MotionConfig, motion } from "framer-motion";
import {
  useRef,
  type KeyboardEvent,
  type ReactNode,
  useState,
} from "react";
import { useI18n } from "@/lib/i18n";
import { DiscoverPanel } from "./DiscoverPanel";
import { OrderPanel } from "./OrderPanel";

type View = "discover" | "order";
const VIEWS: View[] = ["discover", "order"];

/** Expo-ish ease: quick start, long soft landing — reads as "premium". */
const SLIDE = { duration: 0.8, ease: [0.65, 0, 0.35, 1] } as const;

/**
 * SINGLE-COLUMN LAYOUT
 * --------------------
 * Exactly one 100%-wide view is visible at a time. Both views live side by side
 * in a track that is 200% of the screen; switching tabs animates the track
 * between `0%` and `-50%` (i.e. -100% of the viewport). Nothing of the other
 * view is ever visible while idle.
 *
 * The hidden view is `inert`, so it can't take focus or be read by assistive tech.
 */
export function ViewSlider() {
  const { t } = useI18n();
  const [active, setActive] = useState<View>("discover");

  return (
    // Users with "reduce motion" get an instant switch instead of a slide.
    <MotionConfig reducedMotion="user">
      <main className="fixed inset-0 overflow-hidden pt-[var(--nav-h)]">
        <motion.div
          className="flex h-full w-[200%]"
          initial={false}
          animate={{ x: active === "order" ? "-50%" : "0%" }}
          transition={SLIDE}
        >
          <ViewPane id="discover" active={active === "discover"}>
            <DiscoverPanel />
          </ViewPane>
          <ViewPane id="order" active={active === "order"}>
            <OrderPanel />
          </ViewPane>
        </motion.div>

        <TabSwitcher
          active={active}
          onSelect={setActive}
          labels={{ discover: t.tabs.discover, order: t.tabs.order }}
          ariaLabel={t.tabs.label}
        />
      </main>
    </MotionConfig>
  );
}

/* ------------------------------------------------------------------ */

function ViewPane({
  id,
  active,
  children,
}: {
  id: View;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <motion.section
      id={`view-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      inert={!active}
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={SLIDE}
      className="h-full w-1/2 shrink-0"
    >
      <div className="hide-scrollbar h-full overflow-y-auto overscroll-contain">
        {children}
      </div>
    </motion.section>
  );
}

/** Pill-shaped bottom tab bar (a proper ARIA tablist with arrow-key support). */
function TabSwitcher({
  active,
  onSelect,
  labels,
  ariaLabel,
}: {
  active: View;
  onSelect: (v: View) => void;
  labels: Record<View, string>;
  ariaLabel: string;
}) {
  const refs = useRef<Record<View, HTMLButtonElement | null>>({
    discover: null,
    order: null,
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = VIEWS[(VIEWS.indexOf(active) + 1) % VIEWS.length];
    onSelect(next);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 gap-1 rounded-full border border-gold/30 bg-bg/80 p-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl"
    >
      {VIEWS.map((v) => {
        const selected = active === v;
        return (
          <button
            key={v}
            ref={(el) => {
              refs.current[v] = el;
            }}
            id={`tab-${v}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`view-${v}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(v)}
            className={`relative z-10 rounded-full px-5 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.22em] transition-colors duration-300 sm:px-8 sm:py-2.5 sm:text-[0.7rem] ${
              selected ? "text-black" : "text-muted hover:text-fg"
            }`}
          >
            {selected && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-gold-soft to-gold"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {labels[v]}
          </button>
        );
      })}
    </div>
  );
}
