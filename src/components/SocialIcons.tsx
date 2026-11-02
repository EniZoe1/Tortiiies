import type { SVGProps } from "react";

/**
 * lucide-react v1 no longer ships brand icons, so these three are drawn inline
 * in the same style (24px grid, 1.6 round stroke) and inherit `currentColor`.
 */
const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M17.5 3h-2.7A4.8 4.8 0 0 0 10 7.8V10H7v4h3v7.5h4V14h3l1-4h-4V7.8c0-.5.4-.8.9-.8h2.6z" />
    </svg>
  );
}

export function PinterestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M10.4 17.6 12 11" />
      <path d="M9.3 13.3C8.3 11.4 9 8.6 11.5 7.9c2.4-.7 4.5.8 4.4 3.1-.1 2.3-1.7 3.8-3.2 3.5-.9-.2-1.4-.8-1.5-1.5" />
    </svg>
  );
}
