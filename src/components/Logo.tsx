import { useId } from "react";
import {
  LOGO_ASPECT,
  LOGO_HOLE,
  LOGO_PATHS,
  LOGO_VIEWBOX,
} from "./logo-data";

/**
 * The Tortiiies mark, inlined from /logo.svg (cropped viewBox, original paths).
 * Inline so the gold gradient can follow the light/dark theme via CSS vars
 * (--logo-1..4) — the original pale highlight would vanish on white.
 */
export function Logo({
  className,
  title = "Tortiiies",
}: {
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const grad = `${uid}-gold`;
  const mask = `${uid}-hole`;
  const fill = `url(#${grad})`;

  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      {...(title
        ? { role: "img", "aria-label": title }
        : { "aria-hidden": true })}
      className={className}
      style={{ aspectRatio: LOGO_ASPECT }}
    >
      <defs>
        <mask
          id={mask}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="1208"
          height="864"
        >
          <rect width="1208" height="864" fill="#fff" />
          <path transform={LOGO_HOLE.transform} d={LOGO_HOLE.d} fill="#000" />
        </mask>
        <linearGradient id={grad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "rgb(var(--logo-1))" }} />
          <stop offset="30%" style={{ stopColor: "rgb(var(--logo-2))" }} />
          <stop offset="62%" style={{ stopColor: "rgb(var(--logo-3))" }} />
          <stop offset="100%" style={{ stopColor: "rgb(var(--logo-4))" }} />
        </linearGradient>
      </defs>

      {LOGO_PATHS.filter((p) => !p.masked).map((p, i) => (
        <path key={i} transform={p.transform} d={p.d} fill={fill} />
      ))}
      <g mask={`url(#${mask})`}>
        {LOGO_PATHS.filter((p) => p.masked).map((p, i) => (
          <path key={i} transform={p.transform} d={p.d} fill={fill} />
        ))}
      </g>
    </svg>
  );
}
