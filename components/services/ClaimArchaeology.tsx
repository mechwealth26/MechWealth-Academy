"use client";

import LineArt, { type LineArtDefinition } from "./LineArt";

const VIEWBOX = { width: 1000, height: 1000 } as const;

// Keep the bag graphite and use gold only for the recovered asset and upward
// movement, matching the restrained accent treatment of the other cards.
const ACCENT_PATHS = new Set([
  7, 8, 9, 10,
  11, 12, 13, 14,
  15, 16, 17, 18,
  19, 20, 21, 22,
  23, 24, 25, 26,
]);

// Exact MONEY_BAG artwork and animation order supplied by the user.
const PATHS = [
  "M 372 288 C 362 230, 368 150, 386 108 C 430 140, 520 152, 578 122 C 608 176, 612 240, 606 288",
  "M 364 289 L 614 289",
  "M 434 370 C 430 322, 452 298, 478 291",
  "M 512 291 C 530 314, 532 344, 524 370",
  "M 368 293 C 300 342, 232 442, 206 562 C 182 682, 202 782, 302 828 C 402 872, 562 872, 660 830 C 718 804, 748 762, 754 702",
  "M 608 293 C 660 332, 706 402, 730 492",
  "M 744 550 C 752 592, 756 652, 754 702",
  "M 490 430 C 581 430, 655 504, 655 595 C 655 686, 581 760, 490 760 C 399 760, 325 686, 325 595 C 325 504, 399 430, 490 430 Z",
  "M 432 519 L 548 519",
  "M 432 560 L 548 560",
  "M 456 519 C 511 514, 533 548, 533 583 C 533 620, 502 644, 456 644 L 539 695",
  "M 228 192 L 270 150 L 312 192",
  "M 270 152 L 270 250",
  "M 270 292 L 270 322",
  "M 270 350 L 270 362",
  "M 673 192 L 715 150 L 757 192",
  "M 715 152 L 715 250",
  "M 715 292 L 715 322",
  "M 715 350 L 715 362",
  "M 123 292 L 165 250 L 207 292",
  "M 165 252 L 165 352",
  "M 165 394 L 165 424",
  "M 165 452 L 165 464",
  "M 780 292 L 822 250 L 864 292",
  "M 822 252 L 822 352",
  "M 822 394 L 822 424",
  "M 822 452 L 822 464",
] as const;

const ARTWORK: LineArtDefinition = {
  paths: PATHS,
  accentPaths: ACCENT_PATHS,
  viewBox: VIEWBOX,
  framing: { width: 960, height: 860, x: 493, y: 510 },
  grid: { step: 100, x: 500, y: 500 },
  penLift: 34,
  sampleSpacing: 3,
  drawSeconds: 4.1,
  strokeWidth: 13.5,
  opacity: 0.84,
  headLength: 0.05,
  playThreshold: 0.4,
};

export default function ClaimArchaeology({ active }: { active: boolean }) {
  return <LineArt active={active} artwork={ARTWORK} />;
}
