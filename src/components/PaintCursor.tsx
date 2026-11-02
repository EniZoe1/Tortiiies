"use client";

import { PawPrint } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Tunables                                                            */
/* ------------------------------------------------------------------ */

/** Trail */
const TRAIL_LIFE_MS = 480; // how long a point of the stroke lives
const FOLLOW_MS = 16; // smoothing time-constant: lower = tighter, higher = silkier
const MAX_WIDTH = 13; // brush width (px) when moving slowly
const MIN_WIDTH = 5; // brush width (px) when moving fast
const MIN_STEP = 1.5; // min distance (px) between stored stroke points

/** Paw */
const PAW_HOLD_MS = 1500; // fully visible
const PAW_FADE_MS = 2000; // slow fade-out
const PAW_TOTAL_MS = PAW_HOLD_MS + PAW_FADE_MS;
const PAW_SIZE = 44;
const MAX_PAWS = 40; // hard cap so click-spamming can never bloat the DOM
/**
 * Lucide's PawPrint isn't drawn pointing "up": pad bottom-left, toes top-right,
 * so it faces ~32° above the +x axis (CSS/atan2 angles: negative = up).
 * Subtracting this makes the toes point exactly along the movement direction.
 */
const ICON_FACING_DEG = -32;
const HEADING_MIN_MOVE = 6; // px of travel before the heading is updated

const pct = (ms: number) => ((ms / PAW_TOTAL_MS) * 100).toFixed(3);

/** Everything the component needs in CSS, kept next to the code that uses it. */
const CSS = `
html.paint-cursor, html.paint-cursor * { cursor: none !important; }

@keyframes paw-life {
  0%   { opacity: 1; transform: scale(0.7); }
  ${pct(140)}% { opacity: 1; transform: scale(1.07); }
  ${pct(260)}% { opacity: 1; transform: scale(1); }
  ${pct(PAW_HOLD_MS)}% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1); }
}
@keyframes paw-life-calm {
  0%   { opacity: 1; }
  ${pct(PAW_HOLD_MS)}% { opacity: 1; }
  100% { opacity: 0; }
}
.paw-print {
  animation: paw-life ${PAW_TOTAL_MS}ms ease-in-out forwards;
  will-change: opacity, transform;
}
@media (prefers-reduced-motion: reduce) {
  .paw-print { animation-name: paw-life-calm; }
}
`;

/* ------------------------------------------------------------------ */
/* Types & helpers                                                     */
/* ------------------------------------------------------------------ */

type Point = { x: number; y: number; t: number; w: number };
type PawData = { id: number; x: number; y: number; rot: number };

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/**
 * Traces a smooth curve through a flat [x0,y0,x1,y1,…] list using the
 * "midpoint quadratic" technique (each point becomes a control point), which
 * removes the polyline kinks you'd otherwise see on fast mouse moves.
 */
function trace(
  ctx: CanvasRenderingContext2D,
  a: number[],
  reverse: boolean,
  first: boolean,
) {
  const m = a.length / 2;
  const X = (i: number) => a[2 * (reverse ? m - 1 - i : i)];
  const Y = (i: number) => a[2 * (reverse ? m - 1 - i : i) + 1];

  if (first) ctx.moveTo(X(0), Y(0));
  else ctx.lineTo(X(0), Y(0));

  for (let i = 1; i < m - 1; i++) {
    ctx.quadraticCurveTo(
      X(i),
      Y(i),
      (X(i) + X(i + 1)) / 2,
      (Y(i) + Y(i + 1)) / 2,
    );
  }
  if (m > 1) ctx.lineTo(X(m - 1), Y(m - 1));
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * PaintCursor
 * -----------
 *  • Hides the native cursor (fine pointers only) and paints a tapered,
 *    fading brush stroke on a <canvas> that follows the mouse.
 *  • Stamps a PawPrint at the exact click position: instant in, 1.5 s hold,
 *    2 s fade, then the element is unmounted.
 *  • Gold + glow in dark theme, solid black in light theme.
 *
 * The canvas and paws live on a `-z-10` fixed layer with pointer-events
 * disabled, so they sit behind all page content and never block a click.
 * A tiny tip dot (above everything) keeps the pointer visible when it is
 * over opaque cards where the trail itself is hidden.
 *
 * Must be rendered inside <ThemeProvider> (it is, via <Providers>).
 */
export function PaintCursor() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef(isLight);
  const nextId = useRef(0);
  const [paws, setPaws] = useState<PawData[]>([]);
  const [trailEnabled, setTrailEnabled] = useState(false);

  // The animation loop reads the theme from a ref, so a theme switch never
  // tears down listeners or restarts the loop.
  useEffect(() => {
    lightRef.current = isLight;
  }, [isLight]);

  /* Trail only for real mice/trackpads and only without "reduce motion". */
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setTrailEnabled(fine.matches && !calm.matches);
    update();
    fine.addEventListener("change", update);
    calm.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      calm.removeEventListener("change", update);
    };
  }, []);

  /* ---------------------------- paw prints --------------------------- */
  useEffect(() => {
    // Heading of the last meaningful mouse movement (radians, atan2 space).
    // `null` until the mouse has moved, e.g. on touch devices → random fallback.
    let heading: number | null = null;
    let hx = 0;
    let hy = 0;
    let hasRef = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (!hasRef) {
        hx = e.clientX;
        hy = e.clientY;
        hasRef = true;
        return;
      }
      const dx = e.clientX - hx;
      const dy = e.clientY - hy;
      // Ignore tiny jitters; only commit once the pointer travelled far enough.
      if (dx * dx + dy * dy < HEADING_MIN_MOVE * HEADING_MIN_MOVE) return;
      heading = Math.atan2(dy, dx);
      hx = e.clientX;
      hy = e.clientY;
    };

    const onLeave = () => {
      hasRef = false; // re-entry must not produce a bogus long-distance angle
    };

    const onClick = (e: MouseEvent) => {
      // Keyboard-activated clicks report (0,0) — don't stamp the corner.
      if (e.detail === 0) return;
      const touch = (e as PointerEvent).pointerType === "touch";
      const rot =
        heading !== null && !touch
          ? (heading * 180) / Math.PI - ICON_FACING_DEG
          : Math.random() * 360;
      const paw: PawData = {
        id: nextId.current++,
        x: e.clientX,
        y: e.clientY,
        rot,
      };
      setPaws((list) => [...list.slice(-(MAX_PAWS - 1)), paw]);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("click", onClick);
    };
  }, []);

  const removePaw = useCallback((id: number) => {
    setPaws((list) => list.filter((p) => p.id !== id));
  }, []);

  /* --------------------------- brush trail --------------------------- */
  useEffect(() => {
    if (!trailEnabled) return;
    const canvas = canvasRef.current;
    const tip = tipRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !tip || !ctx) return;

    const root = document.documentElement;
    root.classList.add("paint-cursor");

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const pts: Point[] = [];
    const L: number[] = [];
    const R: number[] = [];

    let raf = 0;
    let last = 0;
    let visible = false;
    let tx = 0; // raw pointer
    let ty = 0;
    let sx = 0; // smoothed pointer (what the brush actually follows)
    let sy = 0;
    let lx = 0; // last stored stroke point
    let ly = 0;
    let speed = 0; // px/ms, low-passed

    const halfWidth = (p: Point, now: number) =>
      0.5 * p.w * Math.pow(Math.max(0, 1 - (now - p.t) / TRAIL_LIFE_MS), 1.4);

    const draw = (now: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const n = pts.length;
      if (!n) return;

      const light = lightRef.current;
      const head = pts[n - 1];
      const tail = pts[0];
      const spans =
        n > 1 && Math.hypot(head.x - tail.x, head.y - tail.y) > 1;

      // Style: gradient head → tail, fading to transparent.
      let fill: string | CanvasGradient;
      if (spans) {
        const g = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y);
        if (light) {
          g.addColorStop(0, "rgba(0,0,0,1)");
          g.addColorStop(0.55, "rgba(0,0,0,0.92)");
          g.addColorStop(1, "rgba(0,0,0,0)");
        } else {
          g.addColorStop(0, "rgba(255,246,196,1)"); // hot highlight
          g.addColorStop(0.22, "rgba(255,215,64,1)"); // bright gold
          g.addColorStop(0.65, "rgba(228,168,28,0.62)");
          g.addColorStop(1, "rgba(212,160,20,0)");
        }
        fill = g;
      } else {
        fill = light ? "rgba(0,0,0,1)" : "rgba(255,215,64,1)";
      }
      ctx.fillStyle = fill;
      if (light) {
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
      } else {
        ctx.shadowColor = "rgba(255,196,40,0.85)";
        ctx.shadowBlur = 14 * dpr; // shadowBlur ignores the transform
      }

      // Tapered ribbon: one filled path, so there are no overlap seams.
      if (n > 1) {
        L.length = 0;
        R.length = 0;
        for (let i = 0; i < n; i++) {
          const p = pts[i];
          const a = pts[Math.max(i - 1, 0)];
          const b = pts[Math.min(i + 1, n - 1)];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;
          const hw = halfWidth(p, now);
          L.push(p.x + nx * hw, p.y + ny * hw);
          R.push(p.x - nx * hw, p.y - ny * hw);
        }
        ctx.beginPath();
        trace(ctx, L, false, true);
        trace(ctx, R, true, false);
        ctx.closePath();
        ctx.fill();
      }

      // Round brush tip.
      ctx.beginPath();
      ctx.arc(head.x, head.y, Math.max(0.01, halfWidth(head, now)), 0, Math.PI * 2);
      ctx.fill();
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = clamp(now - last, 1, 48);
      last = now;

      // Frame-rate independent exponential smoothing toward the pointer.
      const k = 1 - Math.exp(-dt / FOLLOW_MS);
      const px = sx;
      const py = sy;
      sx += (tx - sx) * k;
      sy += (ty - sy) * k;

      speed += (Math.hypot(sx - px, sy - py) / dt - speed) * 0.15;

      if (visible && Math.hypot(sx - lx, sy - ly) >= MIN_STEP) {
        pts.push({
          x: sx,
          y: sy,
          t: now,
          w: clamp(MAX_WIDTH - speed * 3.5, MIN_WIDTH, MAX_WIDTH),
        });
        lx = sx;
        ly = sy;
      }
      while (pts.length && now - pts[0].t >= TRAIL_LIFE_MS) pts.shift();

      draw(now);
      tip.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%)`;

      // Sleep when nothing is left to animate.
      const settled = Math.hypot(tx - sx, ty - sy) < 0.05;
      if (pts.length || !settled) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        // First move / re-entry: snap, so no streak from a stale position.
        visible = true;
        sx = lx = tx;
        sy = ly = ty;
        speed = 0;
        pts.length = 0;
        tip.style.opacity = "1";
      }
      wake();
    };

    const onLeave = () => {
      visible = false;
      tip.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      root.classList.remove("paint-cursor");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tip.style.opacity = "0";
    };
  }, [trailEnabled]);

  return (
    <>
      <style>{CSS}</style>

      {/* Shared gold gradient for the paw icons (24×24 = Lucide's viewBox). */}
      <svg
        aria-hidden
        width="0"
        height="0"
        style={{ position: "absolute" }}
        focusable="false"
      >
        <defs>
          <linearGradient
            id="paint-cursor-gold"
            gradientUnits="userSpaceOnUse"
            x1="3"
            y1="2"
            x2="21"
            y2="22"
          >
            <stop offset="0" stopColor="#fff3b0" />
            <stop offset="0.35" stopColor="#ffd740" />
            <stop offset="0.7" stopColor="#e8b020" />
            <stop offset="1" stopColor="#ffe27a" />
          </linearGradient>
        </defs>
      </svg>

      {/* Behind all content, never intercepts input. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <canvas ref={canvasRef} className="h-full w-full" />

        {paws.map((p) => (
          <Paw key={p.id} paw={p} light={isLight} onDone={removePaw} />
        ))}
      </div>

      {/* Pointer tip: above everything so the cursor is never lost. */}
      <div
        ref={tipRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full opacity-0 transition-[opacity,background-color,box-shadow] duration-300"
        style={{
          background: isLight ? "#000" : "#ffd740",
          boxShadow: isLight ? "none" : "0 0 8px 1px rgba(255,196,40,0.8)",
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */

function Paw({
  paw,
  light,
  onDone,
}: {
  paw: PawData;
  light: boolean;
  onDone: (id: number) => void;
}) {
  // Guaranteed unmount once the animation has finished.
  useEffect(() => {
    const timer = window.setTimeout(() => onDone(paw.id), PAW_TOTAL_MS);
    return () => window.clearTimeout(timer);
  }, [paw.id, onDone]);

  return (
    <div
      className="absolute left-0 top-0"
      style={{
        transform: `translate(${paw.x}px, ${paw.y}px) translate(-50%, -50%) rotate(${paw.rot}deg)`,
      }}
    >
      <div
        className="paw-print"
        style={{
          width: PAW_SIZE,
          height: PAW_SIZE,
          filter: light
            ? undefined
            : "drop-shadow(0 0 6px rgba(255,200,50,0.65)) drop-shadow(0 0 2px rgba(255,236,150,0.6))",
        }}
      >
        <PawPrint
          size={PAW_SIZE}
          strokeWidth={1.25}
          fill={light ? "#000" : "url(#paint-cursor-gold)"}
          stroke={light ? "#000" : "url(#paint-cursor-gold)"}
        />
      </div>
    </div>
  );
}
