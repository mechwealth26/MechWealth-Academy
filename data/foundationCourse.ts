import { COURSE_STAGES } from "@/data/courses";

/**
 * Foundation course content — the seven-lesson learning journey.
 * Educational content only; no claims, results or statistics.
 */

export interface FoundationLesson {
  num: string;
  title: string;
  /** Concise explanation shown alongside the visual demonstration. */
  summary: string;
  /** Key takeaways for the lesson. */
  points: string[];
  /** Which chart demonstration to render. */
  demo:
    | "tape"
    | "chart"
    | "candleAnatomy"
    | "trend"
    | "levels"
    | "indicator"
    | "composite";
}

export const FOUNDATION_LESSONS: FoundationLesson[] = [
  {
    num: "01",
    title: "Market Basics",
    summary:
      "What a market actually is: buyers, sellers and the price they agree on. You'll learn how orders become fills and why price moves — before any chart appears.",
    points: [
      "Participants and their intent",
      "Bid, ask and the last traded price",
      "Why prices move: order flow imbalance",
    ],
    demo: "tape",
  },
  {
    num: "02",
    title: "Charts",
    summary:
      "Price plotted over time becomes a chart. You'll learn to read timeframes and see structure where most people see noise.",
    points: [
      "Timeframes and what they compress",
      "From raw price to a readable chart",
      "Zooming out before zooming in",
    ],
    demo: "chart",
  },
  {
    num: "03",
    title: "Candlesticks",
    summary:
      "Each candle is a story of a fight between buyers and sellers. You'll learn to read the body, the wicks and what each combination implies.",
    points: [
      "Open, high, low, close — anatomy",
      "Bodies vs wicks: conviction vs rejection",
      "Single-candle context reading",
    ],
    demo: "candleAnatomy",
  },
  {
    num: "04",
    title: "Trend",
    summary:
      "Markets move in swings. You'll learn what an uptrend and downtrend actually are — and how higher highs and higher lows define direction.",
    points: [
      "Swing highs and swing lows",
      "Defining trend by structure, not feeling",
      "Range: the third state",
    ],
    demo: "trend",
  },
  {
    num: "05",
    title: "Support & Resistance",
    summary:
      "Levels where price repeatedly reacts. You'll learn why prior turning points matter and how broken resistance becomes support.",
    points: [
      "Zones, not exact lines",
      "Reaction vs breakout",
      "Role reversal after a break",
    ],
    demo: "levels",
  },
  {
    num: "06",
    title: "Indicators",
    summary:
      "Indicators are calculations on price — not magic. You'll learn what a moving average actually shows and how to use it as context, not a signal.",
    points: [
      "What moving averages smooth and hide",
      "Momentum as rate of change",
      "Context first, indicator second",
    ],
    demo: "indicator",
  },
  {
    num: "07",
    title: "Practical Understanding",
    summary:
      "Everything together: structure, levels and context on one chart. You'll walk through a full top-down read — the daily routine this course builds toward.",
    points: [
      "A repeatable top-down chart routine",
      "Asking better questions of a chart",
      "Where Practitioner takes over",
    ],
    demo: "composite",
  },
];

export const FOUNDATION_OVERVIEW = {
  eyebrow: "Foundation · Stage 01 of 04",
  headline: "Stock-market basics.",
  description: COURSE_STAGES[0].description,
  audience: COURSE_STAGES[0].audience,
  facts: [
    { label: "Level", value: COURSE_STAGES[0].level },
    { label: "Format", value: "Live sessions + self-paced material" },
    { label: "Length", value: "4 weeks · 7 lessons" },
    { label: "Before joining", value: "No previous experience required" },
    { label: "Next stage", value: "Practitioner" },
  ],
};

export const FOUNDATION_LEARN = [
  "Explain what moves a price on any given day",
  "Read any chart: timeframes, candles and structure",
  "Identify trend and range from swing structure",
  "Mark support and resistance zones with confidence",
  "Use moving averages as context, never as signals",
  "Run a simple top-down daily chart routine",
];

export const FOUNDATION_FAQ = [
  {
    q: "Do I need any trading experience?",
    a: "None. Lesson one assumes you have never opened a chart. Concepts are introduced only when the groundwork for them exists.",
  },
  {
    q: "Is this specific to Indian markets?",
    a: "Examples and sessions use NSE and BSE instruments, but everything taught — structure, levels, candles — applies to any market.",
  },
  {
    q: "What happens after the 7 lessons?",
    a: "You move into Practitioner, where the same ideas are deepened into a technical-analysis toolkit and a daily chart routine.",
  },
  {
    q: "Are trading calls or tips included?",
    a: "No. MECHWEALTH courses are educational only — we teach comprehension and process, never signals.",
  },
];

