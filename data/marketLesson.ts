/**
 * Illustrative market lesson data for the Technical Analysis section.
 *
 * Deterministic (seeded) synthetic series authored to tell a specific
 * teaching story: uptrend with higher highs/higher lows → consolidation
 * under resistance → breakout → pullback/retest → continuation.
 * NOT real market data. No live prices, no performance claims.
 */

export interface LessonCandle {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface LessonPivot {
  i: number;
  price: number;
  type: "H" | "L";
  label: string; // HH / HL / LH / LL
}

export interface ChapterCopy {
  num: string;
  title: string;
  desc: string;
}

const N = 64;

/** Small deterministic PRNG so the illustration never changes between loads. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Piecewise-linear close-price path telling the lesson story. */
const PATH_KEYS: [number, number][] = [
  [0, 100],
  [4, 103],
  [7, 101.2], // pullback → higher low
  [10, 101.8],
  [16, 108],
  [19, 106], // pullback → higher low
  [22, 111.8], // top of advance → resistance forms
  [27, 110.6], // consolidation, lower high tests
  [31, 111.6],
  [35, 111.2],
  [38, 115.5], // breakout above 112
  [41, 117.5], // post-breakout extension
  [45, 112.4], // pullback → retest of old resistance
  [48, 113.2], // hold above the level
  [53, 116],
  [57, 115.1], // minor shakeout
  [63, 120.5], // continuation
];

function closePath(): number[] {
  const out: number[] = [];
  for (let i = 0; i < N; i++) {
    let a = PATH_KEYS[0];
    let b = PATH_KEYS[PATH_KEYS.length - 1];
    for (let k = 0; k < PATH_KEYS.length - 1; k++) {
      if (i >= PATH_KEYS[k][0] && i <= PATH_KEYS[k + 1][0]) {
        a = PATH_KEYS[k];
        b = PATH_KEYS[k + 1];
        break;
      }
    }
    const f = b[0] === a[0] ? 0 : (i - a[0]) / (b[0] - a[0]);
    const eased = f * f * (3 - 2 * f); // soften segment joints
    out.push(a[1] + (b[1] - a[1]) * eased);
  }
  return out;
}

function ema(values: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const out: (number | null)[] = [];
  let prev: number | null = null;
  values.forEach((v, i) => {
    if (i < period - 1) {
      out.push(null);
      return;
    }
    if (prev === null) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += values[j];
      prev = sum / period;
    } else {
      prev = v * k + prev * (1 - k);
    }
    out.push(prev);
  });
  return out;
}

function detectPivots(candles: LessonCandle[], k = 3): LessonPivot[] {
  const pivots: LessonPivot[] = [];
  let lastHigh: LessonPivot | null = null;
  let lastLow: LessonPivot | null = null;

  for (let i = k; i < candles.length - k; i++) {
    let isHigh = true;
    let isLow = true;
    for (let j = i - k; j <= i + k; j++) {
      if (j === i) continue;
      if (candles[j].h >= candles[i].h) isHigh = false;
      if (candles[j].l <= candles[i].l) isLow = false;
    }

    if (isHigh) {
      const prev = lastHigh;
      const label = !prev ? "H" : candles[i].h > prev.price ? "HH" : "LH";
      const p: LessonPivot = { i, price: candles[i].h, type: "H", label };
      pivots.push(p);
      lastHigh = p;
    }
    if (isLow) {
      const prev = lastLow;
      const label = !prev ? "L" : candles[i].l > prev.price ? "HL" : "LL";
      const p: LessonPivot = { i, price: candles[i].l, type: "L", label };
      pivots.push(p);
      lastLow = p;
    }
  }
  // Only label pivots once a comparison exists (drop the first raw ones)
  return pivots.filter((p) => p.label !== "H" && p.label !== "L");
}

export const LESSON_LEVELS = {
  /** Resistance formed by the top of the advance, later broken. */
  resistance: 112,
  /** Early higher-low shelf from the first pullback. */
  support: 101.2,
  breakoutIdx: 37,
  retestIdx: 45,
};

/** Camera keyframes per timeline boundary (intro, chapters 1–7, finale). */
export const CAMERA_KEYS = [
  { c: 31, s: 70 }, // intro
  { c: 31, s: 70 }, // 01 structure
  { c: 31, s: 70 }, // 02 support & resistance
  { c: 14, s: 42 }, // 03 trendlines
  { c: 39, s: 26 }, // 04 breakout
  { c: 43, s: 26 }, // 05 pullback
  { c: 31, s: 66 }, // 06 moving averages
  { c: 31, s: 70 }, // 07 volume
  { c: 31, s: 74 }, // finale
];

export const CHAPTERS: ChapterCopy[] = [
  {
    num: "01",
    title: "Market Structure",
    desc: "Every move leaves footprints. Swing highs and lows reveal who is in control — and when control changes hands.",
  },
  {
    num: "02",
    title: "Support & Resistance",
    desc: "Floors where buyers defend. Ceilings where sellers wait. Price remembers these levels long after the crowd forgets.",
  },
  {
    num: "03",
    title: "Trendlines",
    desc: "Connect the higher lows and momentum reveals its slope. A trend is a rhythm, not a guess.",
  },
  {
    num: "04",
    title: "Breakouts",
    desc: "When price escapes a ceiling with conviction, the old wall becomes the new floor.",
  },
  {
    num: "05",
    title: "Pullbacks",
    desc: "Markets breathe. The return to a broken level is where preparation meets opportunity.",
  },
  {
    num: "06",
    title: "Moving Averages",
    desc: "Average memory. Moving averages smooth the noise until the underlying trend becomes unmistakable.",
  },
  {
    num: "07",
    title: "Volume",
    desc: "Effort behind price. Volume tells you whether a move carries conviction — or doubt.",
  },
];

export interface LessonData {
  candles: LessonCandle[];
  closes: number[];
  ema20: (number | null)[];
  ema50: (number | null)[];
  pivots: LessonPivot[];
  levels: typeof LESSON_LEVELS;
  chapters: ChapterCopy[];
  cameraKeys: typeof CAMERA_KEYS;
}

let cache: LessonData | null = null;

export function buildLesson(): LessonData {
  if (cache) return cache;

  const rand = mulberry32(1337);
  const path = closePath();
  const candles: LessonCandle[] = [];

  let prevClose = path[0];
  for (let i = 0; i < N; i++) {
    const c = path[i];
    const o = i === 0 ? c - 0.3 : prevClose + (rand() - 0.5) * 0.25;
    const wickUp = 0.1 + rand() * 0.35;
    const wickDn = 0.1 + rand() * 0.35;
    const h = Math.max(o, c) + wickUp;
    const l = Math.min(o, c) - wickDn;

    // Volume: calm base, expansion in trends, spike on the breakout,
    // fading through the pullback (conviction narrative).
    let v = 34 + rand() * 18;
    if (i > 9 && i < 23) v += 14;
    if (i >= 36 && i <= 39) v += 55 + rand() * 40;
    if (i > 41 && i < 46) v -= 12;
    if (i > 49 && i < 60) v += 10;

    candles.push({ o, h, l, c, v });
    prevClose = c;
  }

  const closes = candles.map((c) => c.c);

  cache = {
    candles,
    closes,
    ema20: ema(closes, 12),
    ema50: ema(closes, 30),
    pivots: detectPivots(candles),
    levels: LESSON_LEVELS,
    chapters: CHAPTERS,
    cameraKeys: CAMERA_KEYS,
  };
  return cache;
}
