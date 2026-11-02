import { fileURLToPath } from "node:url";

/**
 * GitHub Pages serves a project site from /<repo-name>/, so CI sets
 * NEXT_PUBLIC_BASE_PATH=/<repo-name> at build time. Locally it is unset
 * and everything works from "/" as usual.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fully static site (written to ./out) — required for GitHub Pages.
  output: "export",
  basePath,
  // No image-optimisation server on static hosting.
  images: { unoptimized: true },
  // Pin the project root (a stray lockfile higher up the tree confuses detection).
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
};

export default nextConfig;
