/**
 * Academy Programs — content only.
 * Deliberately no pricing, reviews or statistics at this stage.
 */

export type ProgramVisualKind =
  | "foundations"
  | "technical"
  | "priceaction"
  | "advanced"
  | "risk";

export interface Program {
  num: string;
  title: string;
  tag: string;
  description: string;
  visual: ProgramVisualKind;
}

export const PROGRAMS: Program[] = [
  {
    num: "01",
    title: "Market Foundations",
    tag: "Beginner",
    description:
      "Start from zero — how markets actually work, how orders flow, and what a moving price really represents.",
    visual: "foundations",
  },
  {
    num: "02",
    title: "Technical Analysis",
    tag: "Core",
    description:
      "Read charts the way professionals do — structure, levels, momentum, and the story connecting them.",
    visual: "technical",
  },
  {
    num: "03",
    title: "Price Action",
    tag: "Intermediate",
    description:
      "Strip the indicators away. Learn to interpret raw candles, context and confirmation as they print.",
    visual: "priceaction",
  },
  {
    num: "04",
    title: "Advanced Trading",
    tag: "Advanced",
    description:
      "Multi-timeframe confluence, scenario planning and trade construction for experienced students.",
    visual: "advanced",
  },
  {
    num: "05",
    title: "Risk Management",
    tag: "Essential",
    description:
      "The discipline behind longevity — position sizing, exposure control and protecting capital first.",
    visual: "risk",
  },
];
