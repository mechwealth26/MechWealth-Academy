"use client";

import LineArt, { type LineArtDefinition } from "./LineArt";

const VIEWBOX = { width: 1000, height: 640 } as const;
const ACCENT_PATHS = new Set([6, 7, 10, 11, 12]);

const PATHS = [
  "M 150 208 L 150 500 L 432 500",
  "M 172 500 L 172 432 L 208 432 L 208 500",
  "M 220 500 L 220 396 L 256 396 L 256 500",
  "M 268 500 L 268 352 L 304 352 L 304 500",
  "M 316 500 L 316 302 L 352 302 L 352 500",
  "M 364 500 L 364 250 L 400 250 L 400 500",
  "M 136 432 C 200 416, 268 362, 314 286 C 344 236, 368 190, 386 158",
  "M 348 172 L 392 146 L 388 196",
  "M 492 300 L 916 300 L 916 486 L 492 486 Z",
  "M 512 318 L 896 318 L 896 468 L 512 468 Z",
  "M 704 336 C 736 336, 760 361, 760 393 C 760 426, 736 450, 704 450 C 672 450, 648 426, 648 393 C 648 361, 672 336, 704 336 Z",
  "M 681 364 L 729 364",
  "M 681 381 L 729 381",
  "M 690 364 C 712 365, 723 372, 723 384 C 723 397, 710 405, 689 405 L 729 437",
] as const;

const ARTWORK: LineArtDefinition = {
  paths: PATHS,
  accentPaths: ACCENT_PATHS,
  viewBox: VIEWBOX,
  framing: { width: VIEWBOX.width * 1.06, height: VIEWBOX.height * 1.06, x: 500, y: 320 },
  grid: { step: 80, x: 480, y: 320 },
  penLift: 32,
  sampleSpacing: 3,
  drawSeconds: 3.8,
  strokeWidth: 2.8,
  opacity: 0.82,
  headLength: 0.055,
  playThreshold: 0.38,
};

export default function MarketAccessVault({ active }: { active: boolean }) {
  return <LineArt active={active} artwork={ARTWORK} />;
}
