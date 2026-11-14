export interface HeroCandle {
  time: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export type HeroPatternId =
  | "levels"
  | "trend"
  | "breakout"
  | "double-bottom";

export interface HeroPattern {
  id: HeroPatternId;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  color: string;
  start: number;
  end: number;
}

export const HERO_PATTERNS: HeroPattern[] = [
  {
    id: "levels",
    number: "01",
    eyebrow: "Decision zones",
    title: "Support & resistance",
    description:
      "Repeated reactions reveal where buyers and sellers are prepared to defend price.",
    color: "#e8c96a",
    start: 0.08,
    end: 0.25,
  },
  {
    id: "trend",
    number: "02",
    eyebrow: "Directional structure",
    title: "Trend",
    description:
      "Higher highs and higher lows turn isolated candles into a readable market direction.",
    color: "#35dfbd",
    start: 0.24,
    end: 0.41,
  },
  {
    id: "breakout",
    number: "03",
    eyebrow: "Confirmation",
    title: "Breakout & retest",
    description:
      "Expansion through resistance matters most when price returns, holds and continues.",
    color: "#a68cff",
    start: 0.4,
    end: 0.58,
  },
  {
    id: "double-bottom",
    number: "04",
    eyebrow: "Reversal structure",
    title: "Double bottom",
    description:
      "Two failed pushes lower expose weakening supply before the neckline confirms reversal.",
    color: "#ff7192",
    start: 0.57,
    end: 0.76,
  },
];

const PRICE_ANCHORS = [
  [0, 24840],
  [8, 25120],
  [16, 25480],
  [23, 25290],
  [28, 25515],
  [35, 24920],
  [42, 24385],
  [47, 24810],
  [51, 24400],
  [57, 25100],
  [61, 25625],
  [66, 25495],
  [74, 26110],
  [83, 26420],
] as const;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function closeAt(index: number) {
  for (let i = 0; i < PRICE_ANCHORS.length - 1; i++) {
    const [fromIndex, fromPrice] = PRICE_ANCHORS[i];
    const [toIndex, toPrice] = PRICE_ANCHORS[i + 1];
    if (index > toIndex) continue;
    const progress = (index - fromIndex) / (toIndex - fromIndex);
    const eased = progress * progress * (3 - 2 * progress);
    return fromPrice + (toPrice - fromPrice) * eased;
  }
  return PRICE_ANCHORS[PRICE_ANCHORS.length - 1][1];
}

/**
 * Stable, illustrative NIFTY-like OHLCV data designed around the four teaching
 * structures used by the hero. It is deterministic for reliable visual QA.
 */
export function buildHeroCandles(): HeroCandle[] {
  const random = mulberry32(2187);
  const candles: HeroCandle[] = [];
  const firstDay = Date.UTC(2026, 4, 4);

  for (let index = 0; index < 84; index++) {
    const structuralClose = closeAt(index);
    const texture = Math.sin(index * 1.73) * 22 + (random() - 0.5) * 34;
    const close = structuralClose + texture;
    const previous = candles[index - 1]?.c ?? close - 24;
    const gap = (random() - 0.5) * 38;
    const open = previous + gap;
    const range = 44 + random() * 48;
    const high = Math.max(open, close) + range * (0.45 + random() * 0.55);
    const low = Math.min(open, close) - range * (0.45 + random() * 0.55);
    const breakoutVolume = index >= 59 && index <= 63 ? 1.7 : 1;
    const reversalVolume = index >= 40 && index <= 53 ? 1.35 : 1;
    const volume =
      (780_000 + random() * 560_000 + Math.abs(close - open) * 4_800) *
      breakoutVolume *
      reversalVolume;

    candles.push({
      time: firstDay + index * 86_400_000,
      o: open,
      h: high,
      l: low,
      c: close,
      v: volume,
    });
  }

  return candles;
}
