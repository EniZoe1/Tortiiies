"use client";

import { motion } from "framer-motion";
import { ArrowRight, AtSign, Check, Mail, Phone } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { DatePicker } from "@/components/DatePicker";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export function OrderPanel() {
  const { t } = useI18n();
  const uid = useId();
  const [sent, setSent] = useState(false);

  const id = (name: string) => `${uid}-${name}`;
  const [first, ...rest] = t.order.title.split(" ");

  // Opens the visitor's mail client with the request pre-filled.
  const submitOrder = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();

    const subject = `Tortiiies order — ${get("occasion")} (${get("date") || "date TBD"})`;
    const body = [
      `Name: ${get("name")}`,
      `Email: ${get("email")}`,
      `Occasion: ${get("occasion")}`,
      `Event date: ${get("date") || "—"}`,
      "",
      get("message"),
    ].join("\n");

    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <div className="mx-auto grid min-h-full w-full max-w-6xl content-center gap-8 px-6 pb-28 pt-10 sm:px-10 lg:grid-cols-2 lg:gap-x-20 lg:gap-y-10 lg:px-14">
      {/* left column on desktop: heading + steps */}
      <div className="flex flex-col gap-7 lg:col-start-1 lg:row-start-1 lg:self-end">
      <header>
        <p className="eyebrow">{t.order.eyebrow}</p>
        <h2 className="mt-4 font-serif text-[2.9rem] font-medium leading-[0.98] sm:text-6xl xl:text-7xl">
          {first}{" "}
          <span className="gold-text italic animate-shimmer">
            {rest.join(" ")}
          </span>
        </h2>
        <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-muted">
          {t.order.lead}
        </p>
      </header>

      <ol className="grid grid-cols-3 gap-3 border-y border-line/10 py-4">
        {t.order.steps.map((step, i) => (
          <li key={step} className="flex flex-col gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-gold/60 font-serif text-sm text-gold-text">
              {i + 1}
            </span>
            <span className="text-[0.72rem] leading-snug text-muted">
              {step}
            </span>
          </li>
        ))}
      </ol>
      </div>

      {/* right column on desktop: the form, spanning both rows */}
      <form
        onSubmit={submitOrder}
        className="space-y-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center lg:rounded-3xl lg:border lg:border-line/10 lg:bg-surface lg:p-9"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={id("name")} className="sr-only">
              {t.order.name}
            </label>
            <input
              id={id("name")}
              name="name"
              required
              autoComplete="name"
              placeholder={t.order.name}
              className="field"
            />
          </div>
          <div>
            <label htmlFor={id("email")} className="sr-only">
              {t.order.email}
            </label>
            <input
              id={id("email")}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={t.order.email}
              className="field"
            />
          </div>
          <div>
            <label htmlFor={id("occasion")} className="sr-only">
              {t.order.occasion}
            </label>
            <select
              id={id("occasion")}
              name="occasion"
              defaultValue={t.order.occasions[0]}
              key={t.order.occasions[0] /* re-sync default on language change */}
              className="field appearance-none"
            >
              {t.order.occasions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={id("date")} className="sr-only">
              {t.order.date}
            </label>
            <DatePicker id={id("date")} name="date" />
          </div>
        </div>

        <div>
          <label htmlFor={id("message")} className="sr-only">
            {t.order.message}
          </label>
          <textarea
            id={id("message")}
            name="message"
            rows={3}
            required
            placeholder={`${t.order.message} — ${t.order.messagePlaceholder}`}
            className="field resize-none"
          />
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
          className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-gold via-gold-soft to-gold bg-[length:200%_100%] px-8 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-black shadow-[0_14px_40px_-12px_rgb(var(--gold)/0.7)] transition-[background-position,box-shadow] duration-700 hover:bg-[position:100%_0]"
        >
          {t.order.submit}
          <ArrowRight
            size={17}
            strokeWidth={2}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </motion.button>

        {sent && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 rounded-xl border border-gold/40 bg-gold/10 p-3 text-xs leading-relaxed"
          >
            <Check size={16} className="mt-px shrink-0 text-gold-text" />
            {t.order.sent}
          </motion.p>
        )}
        <p className="text-center text-[0.7rem] text-muted">
          {t.order.leadTime}
        </p>
      </form>

      <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
        <p className="eyebrow mb-3 !tracking-[0.22em]">{t.order.orWrite}</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {[
            { icon: Mail, label: SITE.email, href: `mailto:${SITE.email}` },
            {
              icon: Phone,
              label: SITE.phone,
              href: `tel:${SITE.phone.replace(/\s/g, "")}`,
            },
            {
              icon: AtSign,
              label: SITE.handle,
              href: SITE.instagram,
            },
          ].map(({ icon: Icon, label, href }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted transition-colors hover:text-gold-text"
              >
                <Icon size={15} strokeWidth={1.6} />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
