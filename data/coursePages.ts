import { COURSE_STAGES } from "@/data/courses";

/**
 * Content for the Practitioner / Method / One-to-One course pages.
 * Reuses the Foundation page architecture via CoursePageTemplate.
 * Educational content only — no outcomes, statistics or guarantees.
 */

export interface CourseLesson {
  num: string;
  title: string;
  summary: string;
  points: string[];
  demo: string;
}

export interface CoursePageContent {
  slug: string;
  eyebrow: string;
  headlineTop: string;
  headlineBottom: string;
  description: string;
  audience: string;
  metaDescription: string;
  facts: { label: string; value: string }[];
  learn: string[];
  curriculumTitle: string;
  curriculumIntro: string;
  lessons: CourseLesson[];
  faq: { q: string; a: string }[];
  ctaHeadline: string;
  ctaLabel: string;
}

export const PRACTITIONER_PAGE: CoursePageContent = {
  slug: "practitioner",
  eyebrow: "Practitioner · Stage 02 of 04",
  headlineTop: "Read price",
  headlineBottom: "charts.",
  description: COURSE_STAGES[1].description,
  audience: COURSE_STAGES[1].audience,
  metaDescription:
    "Practitioner: technical analysis, chart reading and market structure — built into a repeatable daily routine.",
  facts: [
    { label: "Level", value: COURSE_STAGES[1].level },
    { label: "Format", value: "Live sessions + guided chart practice" },
    { label: "Length", value: "6 weeks" },
    { label: "Before joining", value: "Foundation" },
    { label: "Next stage", value: "Method" },
  ],
  learn: [
    "Define trend and range from swing structure alone",
    "Mark support and resistance as zones, not lines",
    "Draw and use trendlines without wishful thinking",
    "Read candlestick context instead of memorising names",
    "Combine structure and momentum into one coherent read",
    "Run a complete top-down chart routine in minutes",
  ],
  curriculumTitle: "From looking to seeing.",
  curriculumIntro:
    "Six lessons that move up the ladder — from individual candles to full market structure, ending in daily practice.",
  lessons: [
    {
      num: "01",
      title: "Market Structure",
      summary:
        "Every chart is swings: highs, lows and the relationship between them. You'll learn to label structure objectively — the backbone of everything else in this course.",
      points: [
        "Swing highs and lows as building blocks",
        "Uptrend, downtrend and range by definition",
        "Structure breaks and what they change",
      ],
      demo: "trend",
    },
    {
      num: "02",
      title: "Chart Reading",
      summary:
        "Reading a chart is a sequence, not a glance. You'll learn a top-down order of operations: timeframe, context, then detail.",
      points: [
        "Which timeframe answers which question",
        "Context before detail, always",
        "Building a repeatable reading sequence",
      ],
      demo: "chart",
    },
    {
      num: "03",
      title: "Price Action",
      summary:
        "Candles in context tell you who is in control. You'll read bodies and wicks where they form — not as isolated patterns to memorise.",
      points: [
        "Conviction and rejection at a location",
        "Why the same candle means different things elsewhere",
        "Reaction vs anticipation",
      ],
      demo: "candleAnatomy",
    },
    {
      num: "04",
      title: "Levels & Trendlines",
      summary:
        "Support, resistance and trendlines are tools for framing decisions. You'll learn to draw them honestly and treat them as zones.",
      points: [
        "Pivot clusters and zone width",
        "Trendline validity: touches and angle",
        "Role reversal after breaks",
      ],
      demo: "levels",
    },
    {
      num: "05",
      title: "Momentum Context",
      summary:
        "Moving averages and momentum don't predict — they describe. You'll learn to use them as a second opinion on what structure already says.",
      points: [
        "What smoothing reveals and hides",
        "Momentum agreement vs divergence",
        "Keeping indicators subordinate to structure",
      ],
      demo: "indicator",
    },
    {
      num: "06",
      title: "The Daily Routine",
      summary:
        "Everything converges into practice: a short, repeatable chart routine you run every day — the same steps, the same order, on any instrument.",
      points: [
        "A fixed top-down checklist",
        "Chart labs: applying it live with guidance",
        "What to record after each session",
      ],
      demo: "composite",
    },
  ],
  faq: [
    {
      q: "Is this beginner-friendly?",
      a: "It builds directly on Foundation. If you can read candles and define a trend from Foundation, you're ready — we start with structure and move fast from there.",
    },
    {
      q: "What are chart labs?",
      a: "Live sessions where we apply the lesson's framework to real charts together, then you do it yourself and compare. Practice is the point of this stage.",
    },
    {
      q: "Does this cover intraday trading?",
      a: "The frameworks apply to any timeframe. The focus is on reading charts correctly first — timeframe choice is a personal decision we discuss in the routine lesson.",
    },
    {
      q: "Are signals or calls included?",
      a: "No. Practitioner teaches analysis and process. We never provide calls, tips or signals of any kind.",
    },
  ],
  ctaHeadline: "See charts the way professionals do.",
  ctaLabel: "Request the syllabus",
};

export const METHOD_PAGE: CoursePageContent = {
  slug: "method",
  eyebrow: "Method · Stage 03 of 04",
  headlineTop: "Build and",
  headlineBottom: "test a plan.",
  description: COURSE_STAGES[2].description,
  audience: COURSE_STAGES[2].audience,
  metaDescription:
    "Method: a six-week course in writing trading rules, testing them using past market data and assessing results and limitations. Follows Practitioner.",
  facts: [
    { label: "Level", value: COURSE_STAGES[2].level },
    { label: "Format", value: "Guided project + reviews" },
    { label: "Length", value: "6 weeks" },
    { label: "Before joining", value: "Practitioner" },
    { label: "Next stage", value: "One-to-One" },
  ],
  learn: [
    "Write trading ideas as unambiguous rules",
    "Backtest by hand and record every result",
    "Think in probabilities instead of single outcomes",
    "Judge a method by expectancy, not win rate",
    "Understand why sample size changes conclusions",
    "Make decisions from evidence, not recent memory",
  ],
  curriculumTitle: "Rules before opinions.",
  curriculumIntro:
    "Five lessons that take a trading idea from written rules to testing using past market data — known as backtesting. Historical results do not establish future performance.",
  lessons: [
    {
      num: "01",
      title: "From Idea to Rule",
      summary:
        "\"It usually works\" is not a rule. You'll rewrite your chart observations as precise, testable statements — entry, exit, risk, nothing left to mood.",
      points: [
        "Ambiguity is where discipline dies",
        "Entry, exit and size as explicit conditions",
        "A rule someone else could follow exactly",
      ],
      demo: "rules",
    },
    {
      num: "02",
      title: "Backtesting by Hand",
      summary:
        "Before any tool, you test by hand — bar by bar, trade by trade. You'll learn how to log every result honestly, including the trades you'd rather skip.",
      points: [
        "Manual testing and what it teaches",
        "Recording every signal, not just the clean ones",
        "Journals as raw data",
      ],
      demo: "backtest",
    },
    {
      num: "03",
      title: "Probability",
      summary:
        "Any single trade is noise; a series of trades is information. You'll learn to think in distributions and stop judging methods on individual outcomes.",
      points: [
        "Outcomes form a distribution, not a verdict",
        "Streaks happen inside good methods",
        "Separating process quality from result luck",
      ],
      demo: "probability",
    },
    {
      num: "04",
      title: "Expectancy & Sample Size",
      summary:
        "Win rate alone tells you almost nothing. You'll compute expectancy from your own data and learn how many samples an honest conclusion actually needs.",
      points: [
        "Expectancy: read it alongside drawdown, costs and sample size",
        "Why small samples lie convincingly",
        "When is enough data enough?",
      ],
      demo: "expectancy",
    },
    {
      num: "05",
      title: "Decision Making",
      summary:
        "The final skill is judgement under uncertainty: following your tested method when it feels wrong, and revising it only when the evidence says so.",
      points: [
        "Recency bias and how to counter it",
        "Revision rules: changing a method properly",
        "The review loop that keeps you honest",
      ],
      demo: "composite",
    },
  ],
  faq: [
    {
      q: "Do I need coding or tools?",
      a: "No. Backtesting in this course is done deliberately by hand — the friction is part of the learning. You'll keep a structured log of every hypothetical trade.",
    },
    {
      q: "Will my method become profitable?",
      a: "We make no promises about results of any kind. The course teaches you to test and evaluate a method honestly — whatever the numbers turn out to be, you'll know them.",
    },
    {
      q: "How much time does the project take?",
      a: "Plan for the six weeks plus regular practice between sessions. The guided project is completed across the stage, not crammed into its end.",
    },
    {
      q: "What if my test fails?",
      a: "Then the course worked. A failed test that saves you years is the best possible outcome — we teach you to see it that way.",
    },
  ],
  ctaHeadline: "Opinions are cheap. Methods are tested.",
  ctaLabel: "Request the syllabus",
};

export const ONE_TO_ONE_PAGE: CoursePageContent = {
  slug: "one-to-one",
  eyebrow: "One-to-One · Stage 04 of 04",
  headlineTop: "Work with",
  headlineBottom: "a mentor.",
  description: COURSE_STAGES[3].description,
  audience: COURSE_STAGES[3].audience,
  metaDescription:
    "One-to-One mentorship: your plan, your trades and your journal reviewed personally, with live market sessions together.",
  facts: [
    { label: "Level", value: COURSE_STAGES[3].level },
    { label: "Format", value: "Private mentorship" },
    { label: "Length", value: "Ongoing" },
    { label: "Before joining", value: "Method" },
    { label: "Cadence", value: "Agreed individually" },
  ],
  learn: [
    "Refine your own written trading plan line by line",
    "Review real trades — yours, not textbook examples",
    "Build a journaling habit that survives contact with markets",
    "Sit through live market sessions with your mentor",
    "Identify and work on your specific weak points",
    "Stay accountable to a process, week after week",
  ],
  curriculumTitle: "Built around one trader: you.",
  curriculumIntro:
    "There is no fixed syllabus here — the curriculum is your own plan and history. These are the threads we work on, together.",
  lessons: [
    {
      num: "01",
      title: "Your Plan, Reviewed",
      summary:
        "We start with your written plan — every entry, exit and sizing rule examined line by line until it matches how you actually intend to trade.",
      points: [
        "Line-by-line plan review",
        "Where the plan and behaviour disagree",
        "Rewriting for clarity you can follow",
      ],
      demo: "rules",
    },
    {
      num: "02",
      title: "Your Trades, Broken Down",
      summary:
        "Trade-by-trade breakdowns of your own history: what the market offered, what you did, and whether the two matched your plan.",
      points: [
        "Process errors vs outcome noise",
        "Patterns hiding inside your journal",
        "One correction at a time",
      ],
      demo: "backtest",
    },
    {
      num: "03",
      title: "Your Numbers",
      summary:
        "We look at your expectancy and sample honestly — not to grade you, but to show you which part of your game deserves attention next.",
      points: [
        "Reading your own distribution",
        "Small-sample honesty",
        "Choosing the next thing to fix",
      ],
      demo: "expectancy",
    },
    {
      num: "04",
      title: "Live Sessions Together",
      summary:
        "We sit through live markets together — narrating reads, questioning decisions in the moment, and letting you experience accountability while it matters.",
      points: [
        "Real-time narration and second-guessing",
        "Making decisions with someone watching",
        "Post-session review",
      ],
      demo: "chart",
    },
    {
      num: "05",
      title: "An Ongoing Path",
      summary:
        "Mentorship doesn't end at a syllabus. We set a cadence — reviews, check-ins and new goals — shaped entirely around where you are and where you're stuck.",
      points: [
        "A cadence agreed between us",
        "Goals revised as you grow",
        "Someone who knows your whole story",
      ],
      demo: "mentor",
    },
  ],
  faq: [
    {
      q: "Who is this for?",
      a: "Traders who have completed Method and want direct, personal scrutiny of their plan and execution — people at the stage where generic teaching has little left to offer.",
    },
    {
      q: "How is the schedule decided?",
      a: "Individually. Cadence and session times are agreed directly, around live Indian market hours wherever sessions are live.",
    },
    {
      q: "Will you tell me what to trade?",
      a: "Never. Mentorship sharpens your plan and your execution — it does not replace them. No calls, no tips, no signals.",
    },
    {
      q: "How do we start?",
      a: "Reach out through the contact page. We begin with your plan and your journal — that's where every mentorship here starts.",
    },
  ],
  ctaHeadline: "Bring your plan. We'll start there.",
  ctaLabel: "Request details",
};
