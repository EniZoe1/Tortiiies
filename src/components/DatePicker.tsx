"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useI18n, type Lang } from "@/lib/i18n";

/**
 * The calendar's locale comes from the site's language state, never from the
 * browser. "en-GB" keeps English month names with a Monday-first week, which
 * matches Polish.
 */
const LOCALE: Record<Lang, string> = { en: "en-GB", pl: "pl-PL" };

/* ---- local-date helpers (avoid toISOString, which shifts by timezone) ---- */
const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => {
  // clamp the day so Jan 31 + 1 month -> Feb 28/29
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), last));
};
const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth();

type DatePickerProps = {
  id: string;
  name: string;
  /** Earliest selectable date. Defaults to today. */
  min?: Date;
};

export function DatePicker({ id, name, min }: DatePickerProps) {
  const { t, lang } = useI18n();
  const locale = LOCALE[lang];

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(""); // ISO yyyy-mm-dd or ""
  const [view, setView] = useState(() => startOfDay(new Date())); // month shown
  const [focusDate, setFocusDate] = useState(() => startOfDay(new Date()));
  const [dir, setDir] = useState(0);

  const today = useMemo(() => startOfDay(new Date()), [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const minDate = useMemo(() => startOfDay(min ?? today), [min, today]);

  const fmtDisplay = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [locale],
  );
  const fmtMonth = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
    [locale],
  );
  const fmtWeekday = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale],
  );
  const fmtFull = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [locale],
  );

  // Mon..Sun headers (2024-01-01 was a Monday)
  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        fmtWeekday.format(new Date(2024, 0, 1 + i)).replace(".", ""),
      ),
    [fmtWeekday],
  );

  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const lead = (first.getDay() + 6) % 7; // Monday-first offset
    const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const out: (Date | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= count; d++) {
      out.push(new Date(view.getFullYear(), view.getMonth(), d));
    }
    while (out.length % 7) out.push(null);
    return out;
  }, [view]);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const openPicker = () => {
    const base = value ? fromISO(value) : minDate;
    const start = base < minDate ? minDate : base;
    setView(start);
    setFocusDate(start);
    setDir(0);
    setOpen(true);
  };

  const select = (d: Date) => {
    setValue(toISO(d));
    close();
  };

  const goMonth = (n: number) => {
    setDir(n);
    setView((v) => new Date(v.getFullYear(), v.getMonth() + n, 1));
  };

  const moveFocus = (next: Date) => {
    const clamped = next < minDate ? minDate : next;
    setDir(Math.sign(monthIndex(clamped) - monthIndex(view)));
    setFocusDate(clamped);
    setView(clamped);
  };

  // Move DOM focus onto the roving day button.
  useEffect(() => {
    if (!open) return;
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-iso="${toISO(focusDate)}"]`)
      ?.focus();
  }, [open, focusDate]);

  // Close on outside press / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, Date> = {
      ArrowLeft: addDays(focusDate, -1),
      ArrowRight: addDays(focusDate, 1),
      ArrowUp: addDays(focusDate, -7),
      ArrowDown: addDays(focusDate, 7),
      PageUp: addMonths(focusDate, -1),
      PageDown: addMonths(focusDate, 1),
      Home: addDays(focusDate, -((focusDate.getDay() + 6) % 7)),
      End: addDays(focusDate, 6 - ((focusDate.getDay() + 6) % 7)),
    };
    const next = map[e.key];
    if (next) {
      e.preventDefault();
      moveFocus(next);
    }
  };

  const canGoPrev = monthIndex(view) > monthIndex(minDate);
  const selected = value ? fromISO(value) : null;
  const dialogId = `${id}-calendar`;

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />

      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        onClick={() => (open ? close(false) : openPicker())}
        className={`field flex items-center justify-between gap-3 text-left ${
          open ? "!border-gold ring-4 ring-gold/15" : ""
        }`}
      >
        <span className={`truncate ${selected ? "" : "text-muted/70"}`}>
          {selected ? fmtDisplay.format(selected) : t.order.date}
        </span>
        <CalendarDays
          size={16}
          strokeWidth={1.6}
          className={`shrink-0 transition-colors duration-300 ${
            open || selected ? "text-gold-text" : "text-muted"
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={dialogId}
            role="dialog"
            aria-label={t.order.date}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(21rem,calc(100vw-3rem))] rounded-2xl border border-gold/30 bg-raised p-4 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.5)] outline-none"
          >
            {/* hairline gold accent */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
            />

            {/* header */}
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => goMonth(-1)}
                disabled={!canGoPrev}
                aria-label={t.order.calPrev}
                className="grid h-9 w-9 place-items-center rounded-full text-muted outline-none transition-colors hover:bg-gold/15 hover:text-gold-text focus-visible:ring-2 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft size={18} strokeWidth={1.6} />
              </button>
              <p
                aria-live="polite"
                className="font-serif text-lg font-medium capitalize tracking-wide"
              >
                {fmtMonth.format(view)}
              </p>
              <button
                type="button"
                onClick={() => goMonth(1)}
                aria-label={t.order.calNext}
                className="grid h-9 w-9 place-items-center rounded-full text-muted outline-none transition-colors hover:bg-gold/15 hover:text-gold-text focus-visible:ring-2 focus-visible:ring-gold"
              >
                <ChevronRight size={18} strokeWidth={1.6} />
              </button>
            </div>

            {/* weekday row */}
            <div className="mb-1 grid grid-cols-7 border-b border-line/10 pb-2 text-center">
              {weekdays.map((w, i) => (
                <span
                  key={i}
                  className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-gold-text"
                >
                  {w}
                </span>
              ))}
            </div>

            {/* days */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" initial={false} custom={dir}>
                <motion.div
                  key={`${view.getFullYear()}-${view.getMonth()}`}
                  ref={gridRef}
                  role="grid"
                  aria-label={fmtMonth.format(view)}
                  onKeyDown={onGridKey}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -18 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="grid grid-cols-7 gap-y-1 pt-1"
                >
                  {cells.map((d, i) => {
                    if (!d) return <span key={i} role="gridcell" aria-hidden />;
                    const iso = toISO(d);
                    const disabled = d < minDate;
                    const isSelected = value === iso;
                    const isToday = iso === toISO(today);
                    return (
                      <div key={i} role="gridcell" className="grid place-items-center">
                        <button
                          type="button"
                          data-iso={iso}
                          disabled={disabled}
                          tabIndex={iso === toISO(focusDate) ? 0 : -1}
                          aria-label={fmtFull.format(d)}
                          aria-pressed={isSelected}
                          aria-current={isToday ? "date" : undefined}
                          onClick={() => select(d)}
                          className={[
                            "relative grid h-9 w-9 place-items-center rounded-full text-sm tabular-nums outline-none transition-[background-color,color,box-shadow,transform] duration-200",
                            "focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-raised",
                            disabled
                              ? "cursor-not-allowed text-muted/35"
                              : isSelected
                                ? "bg-gradient-to-br from-gold-soft via-gold to-gold font-semibold text-black shadow-[0_6px_18px_-6px_rgb(var(--gold)/0.8)]"
                                : "text-fg hover:bg-gold/15 hover:text-gold-text active:scale-95",
                            isToday && !isSelected && !disabled
                              ? "ring-1 ring-gold/60"
                              : "",
                          ].join(" ")}
                        >
                          {d.getDate()}
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* footer */}
            <div className="mt-3 flex items-center justify-between border-t border-line/10 pt-3 text-[0.7rem] font-medium uppercase tracking-[0.18em]">
              <button
                type="button"
                onClick={() => {
                  setValue("");
                  close();
                }}
                disabled={!value}
                className="rounded-full px-3 py-1.5 text-muted outline-none transition-colors hover:text-gold-text focus-visible:ring-2 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-30"
              >
                {t.order.calClear}
              </button>
              <button
                type="button"
                onClick={() => select(today < minDate ? minDate : today)}
                className="rounded-full px-3 py-1.5 text-gold-text outline-none transition-colors hover:bg-gold/15 focus-visible:ring-2 focus-visible:ring-gold"
              >
                {t.order.calToday}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
