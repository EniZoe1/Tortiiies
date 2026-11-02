"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

const reveal = (i: number) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
});

/**
 * "Our Ingredients & Craft" / "Sztuka Smaku" — a deliberately image-free,
 * typography-led section: oversized serif, hairlines and small gold numerals.
 */
export function CraftSection() {
  const { t } = useI18n();
  const c = t.craft;

  return (
    <section aria-labelledby="craft-title" className="relative">
      <header className="max-w-3xl">
        <p className="eyebrow">{c.eyebrow}</p>
        <h3
          id="craft-title"
          className="mt-4 font-serif text-5xl font-medium leading-[0.95] sm:text-6xl lg:text-7xl"
        >
          {c.title}{" "}
          <span className="gold-text italic animate-shimmer">{c.accent}</span>
        </h3>
      </header>

      <div className="mt-12 grid border-t border-line/15 lg:mt-16 lg:grid-cols-3">
        {/* 01 — Sponge */}
        <motion.div
          {...reveal(0)}
          className="border-b border-line/15 py-9 lg:border-b-0 lg:border-r lg:py-10 lg:pr-10"
        >
          <GroupLabel index="01" label={c.sponge.label} />
          <p className="mt-6 font-serif text-[1.65rem] italic leading-snug sm:text-3xl">
            <span
              aria-hidden
              className="mr-1 align-[-0.25em] font-serif text-6xl not-italic leading-[0] text-gold"
            >
              “
            </span>
            {c.sponge.text}
          </p>
        </motion.div>

        {/* 02 — Creams */}
        <motion.div
          {...reveal(1)}
          className="border-b border-line/15 py-9 lg:border-b-0 lg:border-r lg:px-10 lg:py-10"
        >
          <GroupLabel index="02" label={c.creams.label} />
          <List items={c.creams.items} />
        </motion.div>

        {/* 03 — Additions */}
        <motion.div {...reveal(2)} className="py-9 lg:py-10 lg:pl-10">
          <GroupLabel index="03" label={c.additions.label} />
          <List items={c.additions.items} />
        </motion.div>
      </div>
    </section>
  );
}

function GroupLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-serif text-lg italic text-gold-text">{index}</span>
      <span className="h-px w-8 bg-gold/60" />
      <h4 className="text-[0.72rem] font-semibold uppercase tracking-luxe text-fg">
        {label}
      </h4>
    </div>
  );
}

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-6 divide-y divide-line/10">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 py-3.5 font-serif text-[1.35rem] leading-snug first:pt-0 sm:text-2xl"
        >
          <span
            aria-hidden
            className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rotate-45 bg-gold"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
