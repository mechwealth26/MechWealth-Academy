/**
 * Academy course stages — content only.
 * No pricing, results claims or statistics.
 */

export interface CourseStage {
  num: string;
  slug: string;
  title: string;
  tagline: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  audience: string;
  description: string;
  objective: string;
  curriculum: string[];
  details: string;
  cta: { label: string; href: string };
}

export const COURSE_STAGES: CourseStage[] = [
  {
    num: "01",
    slug: "foundation",
    title: "Foundation",
    tagline: "Stock-market basics and first charts",
    level: "Beginner",
    audience: "Beginners — no previous experience required.",
    description:
      "Learn how markets work and practise reading price charts, candlesticks, trends and important price levels.",
    objective: "Practise a basic chart-reading routine.",
    curriculum: [
      "Market mechanics & order flow",
      "Participants and market structure",
      "Reading your first charts",
      "The vocabulary of price",
    ],
    details: "4 weeks · Live sessions + self-paced material",
    cta: { label: "Request syllabus", href: "/contact" },
  },
  {
    num: "02",
    slug: "practitioner",
    title: "Practitioner",
    tagline: "Chart reading and technical analysis",
    level: "Intermediate",
    audience: "Learners who have completed Foundation.",
    description:
      "Build on Foundation with more detailed chart analysis. Practise identifying trends and price levels, using indicators as context, and following a repeatable chart-reading routine.",
    objective: "Build a repeatable routine for analysing charts.",
    curriculum: [
      "Market structure deep-dive",
      "Support, resistance & key levels",
      "Trendlines & momentum",
      "Building a daily chart routine",
    ],
    details: "6 weeks · Live sessions + guided chart practice",
    cta: { label: "Request syllabus", href: "/contact" },
  },
  {
    num: "03",
    slug: "method",
    title: "Method",
    tagline: "Build and test a trading plan",
    level: "Advanced",
    audience: "Learners who have completed Practitioner.",
    description:
      "Turn a trading idea into written rules. Test those rules using past market data, record the results and learn how to assess their limitations.",
    objective: "Test a written trading plan using past market data and assess the results.",
    curriculum: [
      "From idea to written rule",
      "Backtesting by hand",
      "Journaling & review loops",
      "Risk frameworks & position sizing",
    ],
    details: "6 weeks · Guided project + reviews",
    cta: { label: "Request syllabus", href: "/contact" },
  },
  {
    num: "04",
    slug: "one-to-one",
    title: "One-to-One",
    tagline: "Personal trading mentorship",
    level: "Advanced",
    audience: "Learners who have completed Method.",
    description:
      "Work directly with a mentor to review your trading plan, past trades and trading journal, and identify specific parts of your process to improve. Includes live market sessions together.",
    objective: "Review your trading plan, trades and journal directly with a mentor.",
    curriculum: [
      "Personal trading-plan review",
      "Live market sessions together",
      "Trade-by-trade breakdowns",
      "Ongoing mentorship cadence",
    ],
    details: "Ongoing · One-to-one mentorship",
    cta: { label: "Request details", href: "/contact" },
  },
];
