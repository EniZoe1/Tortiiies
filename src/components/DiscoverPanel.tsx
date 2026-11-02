"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CraftSection } from "./CraftSection";
import { SiteFooter } from "./SiteFooter";
import { StoryModal } from "./StoryModal";

/**
 * Gallery photos, in the same order as `t.discover.pieces`.
 * These are AI-generated stand-ins (extreme macro crops, no plate/base in
 * frame). Replace the files in /public/gallery with real photography of the
 * finished cakes — same filenames, ideally 3:4 portrait, ≥ 1200px wide.
 */
// With a static export, next/image does not add the basePath to plain URLs
// (needed on GitHub Pages, where the site lives under /<repo-name>/).
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const PHOTOS = [
  `${BASE}/gallery/golden-retriever.jpg`,
  `${BASE}/gallery/german-shepherd.jpg`,
  `${BASE}/gallery/maltese.jpg`,
  `${BASE}/gallery/akita.jpg`,
] as const;

export function DiscoverPanel() {
  const { t } = useI18n();
  const [storyOpen, setStoryOpen] = useState(false);
  const [first, ...rest] = t.discover.title.split(" ");

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-16 px-6 pb-28 pt-10 sm:px-10 lg:gap-24 lg:px-14 lg:pt-14">
      {/* ------------------------------ header ------------------------------ */}
      <header className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16">
        <div>
          <p className="eyebrow">{t.discover.eyebrow}</p>
          <h2 className="mt-4 font-serif text-[3.1rem] font-medium leading-[0.95] sm:text-7xl xl:text-8xl">
            {first}{" "}
            <span className="gold-text italic animate-shimmer">
              {rest.join(" ")}
            </span>
          </h2>
        </div>

        <div className="flex flex-col items-start gap-6">
          <p className="max-w-md text-[0.95rem] leading-relaxed text-muted">
            {t.discover.lead}
          </p>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
            <button
              type="button"
              onClick={() => setStoryOpen(true)}
              className="group inline-flex items-center gap-3 rounded-full border border-gold px-6 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-gold-text transition-all duration-300 hover:bg-gold hover:text-black"
            >
              <BookOpen size={16} strokeWidth={1.6} />
              {t.discover.story}
              <ArrowUpRight
                size={15}
                strokeWidth={1.6}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </button>
            <span className="font-serif text-lg italic text-muted">
              {t.discover.storyHint}
            </span>
          </div>
        </div>
      </header>

      {/* ------------------------------ gallery ----------------------------- */}
      <section aria-label={t.discover.galleryLabel}>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {t.discover.pieces.map((piece, i) => (
            <motion.li
              key={piece.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                delay: i * 0.08,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              // staggered "editorial" offset on wide screens
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-line/10 bg-surface shadow-[0_24px_60px_-34px_rgba(0,0,0,0.65)] transition-[border-color,box-shadow] duration-500 hover:border-gold/70 hover:shadow-[0_28px_70px_-26px_rgb(var(--gold)/0.55)] lg:even:mt-10"
            >
              <Image
                src={PHOTOS[i]}
                alt={piece.alt}
                fill
                sizes="(min-width: 1152px) 270px, (min-width: 640px) 45vw, 50vw"
                className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
              />
              {/* caption scrim — fixed light-on-dark so it reads over any photo */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-[#e8c670] sm:text-[0.64rem]">
                  {piece.trait}
                </p>
                <p className="mt-1.5 font-serif text-xl leading-tight text-[#f7f3ea] sm:text-2xl">
                  {piece.name}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </section>

      <CraftSection />

      <div className="mt-auto">
        <SiteFooter />
      </div>

      <StoryModal open={storyOpen} onClose={() => setStoryOpen(false)} />
    </div>
  );
}
