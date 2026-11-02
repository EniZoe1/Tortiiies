"use client";

import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { FacebookIcon, InstagramIcon, PinterestIcon } from "./SocialIcons";

const SOCIALS = [
  { label: "Instagram", href: SITE.instagram, Icon: InstagramIcon },
  { label: "Facebook", href: SITE.facebook, Icon: FacebookIcon },
  { label: "Pinterest", href: SITE.pinterest, Icon: PinterestIcon },
] as const;

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-line/15 pt-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-serif text-3xl italic leading-tight sm:text-4xl">
            {t.footer.tagline}
          </p>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-serif text-2xl text-gold-text transition-opacity hover:opacity-80"
          >
            {SITE.handle}
          </a>
        </div>

        <div>
          <p className="eyebrow mb-4">{t.footer.social}</p>
          <ul className="flex gap-3">
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-12 w-12 place-items-center rounded-full border border-gold/50 text-gold-text transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-black"
                >
                  <Icon className="h-[1.15rem] w-[1.15rem]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-10 text-[0.7rem] tracking-wide text-muted">
        © {new Date().getFullYear()} {SITE.name}. {t.footer.rights}
      </p>
    </footer>
  );
}
