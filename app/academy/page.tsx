import CtaPattern from "@/components/ui/CtaPattern";
import type { Metadata } from "next";
import Link from "next/link";
import AcademyHero from "@/components/academy/AcademyHero";
import ProgramCard from "@/components/sections/programs/ProgramCard";
import Container from "@/components/ui/Container";
import {
  ClickableCardAccent,
  ClickableCardArrow,
  clickableCardInteraction,
} from "@/components/ui/ClickableCard";
import JsonLd from "@/components/seo/JsonLd";
import { TEACHING_METHOD } from "@/data/teachingMethod";
import { COURSE_STAGES } from "@/data/courses";
import { PROGRAMS } from "@/data/programs";
import { buttonClasses } from "@/lib/buttonStyles";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "The Academy — Learn Markets Through One Connected Method",
  description:
    "Explore the MECHWEALTH Academy: five connected trading disciplines, four progressive learning stages and one evidence-led method for understanding Indian markets.",
  alternates: { canonical: "/academy" },
};

const DISCIPLINE_PATHS: Record<string, string> = {
  "01": "/courses/foundation",
  "02": "/courses/practitioner",
  "03": "/courses/practitioner",
  "04": "/courses/method",
  "05": "/courses/method",
};

const STAGE_PATHS: Record<string, string> = {
  "01": "/courses/foundation",
  "02": "/courses/practitioner",
  "03": "/courses/method",
  "04": "/courses/one-to-one",
};

const PRINCIPLES = [
  {
    num: "01",
    title: "One coherent curriculum",
    body: "Every discipline shares the same language, standards and decision framework. You never have to stitch together conflicting methods.",
  },
  {
    num: "02",
    title: "Learning through charts",
    body: "Concepts move from explanation to market examples, then into written observations and repeatable chart-reading practice.",
  },
  {
    num: "03",
    title: "Evidence over excitement",
    body: "Ideas are defined, tested and reviewed. Confidence comes from a process you can inspect—not from predictions or promises.",
  },
];

const breadcrumbs = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Academy", path: "/academy" },
]);

export default function AcademyPage() {
  return (
    <main id="main" className="relative min-h-screen overflow-hidden">
        <JsonLd data={breadcrumbs} />
        <AcademyHero />

        <section className="relative border-b border-white/[0.07] py-24 sm:py-32">
          <Container>
            <div className="grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-24">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400 sm:text-[11px]">
                  01 · The academy standard
                </p>
                <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-cream-100 sm:text-5xl lg:text-6xl">
                  Serious learning starts with a clear system.
                </h2>
              </div>
              <div className="border-l border-gold-400/35 pl-6 sm:pl-8">
                <p className="max-w-2xl text-base leading-7 text-copy-secondary sm:text-lg sm:leading-8">
                  Markets are complex enough. Your education should not add more
                  noise. The academy is designed as one continuous path—from
                  understanding how markets work to building, testing and
                  managing a method of your own.
                </p>
              </div>
            </div>

            <div className="mt-16 grid gap-px overflow-hidden border border-white/[0.08] bg-white/[0.08] [border-radius:var(--radius-lg)] md:grid-cols-3">
              {PRINCIPLES.map((principle) => (
                <article
                  key={principle.num}
                  className="group relative min-h-64 bg-ink-950 p-7 transition-colors duration-500 hover:bg-ink-900/85 sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.28em] text-gold-400/75">
                      {principle.num}
                    </span>
                    <span aria-hidden className="h-px w-10 bg-white/10 transition-all duration-500 group-hover:w-16 group-hover:bg-gold-400/50" />
                  </div>
                  <h3 className="mt-12 font-display text-xl font-medium text-cream-100 sm:text-2xl">
                    {principle.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-copy-secondary">
                    {principle.body}
                  </p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section id="disciplines" className="relative scroll-mt-20 border-b border-white/[0.07] py-24 sm:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.055),transparent_65%)]"
          />
          <Container className="relative">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400 sm:text-[11px]">
                  02 · Curriculum architecture
                </p>
                <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-cream-100 sm:text-5xl lg:text-6xl">
                  Five disciplines. One craft.
                </h2>
              </div>
              <p className="text-sm leading-6 text-copy-secondary lg:border-l lg:border-white/[0.1] lg:pl-7">
                Each discipline answers a different market question. Together,
                they form the complete language of analysis, execution and risk.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
              {PROGRAMS.map((program, index) => (
                <div
                  key={program.num}
                  className={`h-full ${
                    index < 3 ? "lg:col-span-2" : "sm:col-span-1 lg:col-span-3"
                  }`}
                >
                  <ProgramCard
                    program={program}
                    index={index}
                    href={DISCIPLINE_PATHS[program.num] ?? "/courses"}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl font-mono text-[10px] uppercase leading-5 tracking-[0.18em] text-cream-500">
                Start with the discipline you need. Progress through the system
                at a pace that protects understanding.
              </p>
              <Link
                href="/courses"
                className="group inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-gold-400 transition-colors hover:text-gold-300"
              >
                Compare learning stages
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </Container>
        </section>

        <section className="relative border-b border-white/[0.07] py-24 sm:py-32">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400 sm:text-[11px]">
                03 · The learning experience
              </p>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-cream-100 sm:text-5xl">
                Built to change how you think—not what you memorise.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl leading-7 text-copy-secondary">
                A professional learning environment makes the process visible.
                You know what you are studying, why it matters and how to check
                whether you truly understand it.
              </p>
            </div>

            <div className="mt-16 grid gap-5 lg:grid-cols-12">
              <article className="relative overflow-hidden border border-white/[0.08] bg-gradient-to-br from-gold-400/[0.075] via-ink-900/70 to-ink-950 p-7 [border-radius:var(--radius-lg)] sm:p-10 lg:col-span-7 lg:min-h-[28rem]">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold-400/85">
                  The working method
                </p>
                <h3 className="mt-5 max-w-lg font-display text-3xl font-semibold leading-tight text-cream-100 sm:text-4xl">
                  Every idea follows the same five steps.
                </h3>

                <div className="relative mt-12 grid gap-3 sm:grid-cols-5">
                  <div aria-hidden className="absolute left-[8%] right-[8%] top-7 hidden h-px bg-gradient-to-r from-transparent via-gold-400/45 to-transparent sm:block" />
                  {TEACHING_METHOD.map((step, index) => (
                    <div key={step.label} className="relative border border-white/[0.09] bg-ink-950/80 p-3 [border-radius:var(--radius-lg)]">
                      <span className="font-mono text-[9px] tracking-[0.2em] text-gold-400/70">
                        0{index + 1}
                      </span>
                      <p className="mt-8 font-display text-sm text-cream-100">{step.label}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-8 max-w-xl text-sm leading-6 text-copy-secondary">
                  Observe what price did. Define the idea without ambiguity.
                  Test it against history. Learn from the evidence and improve the rule.
                </p>
              </article>

              <article className="border border-white/[0.08] bg-ink-900/55 p-7 [border-radius:var(--radius-lg)] sm:p-9 lg:col-span-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold-400/80">
                  Learning formats
                </p>
                <h3 className="mt-4 font-display text-2xl font-medium text-cream-100">
                  Explanation becomes practice.
                </h3>
                <ul className="mt-8 divide-y divide-white/[0.07]">
                  {[
                    ["Live instruction", "Concepts taught in sequence"],
                    ["Chart laboratories", "Guided market reading"],
                    ["Written frameworks", "Turn ideas into rules"],
                    ["Review loops", "Find gaps and refine"],
                  ].map(([title, note], index) => (
                    <li key={title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-4 first:pt-0">
                      <span className="font-mono text-[9px] text-gold-400/65">0{index + 1}</span>
                      <div>
                        <p className="text-sm text-cream-100">{title}</p>
                        <p className="mt-1 text-xs text-cream-500">{note}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="border border-white/[0.08] bg-ink-900/55 p-7 [border-radius:var(--radius-lg)] sm:p-9 lg:col-span-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bull-500/85">
                  Indian-market context
                </p>
                <h3 className="mt-4 font-display text-2xl font-medium text-cream-100">
                  Grounded in NSE &amp; BSE charts.
                </h3>
                <p className="mt-5 text-sm leading-6 text-copy-secondary">
                  Examples, chart routines and classroom discussions stay close
                  to the markets Indian learners actually observe—while the
                  principles remain transferable.
                </p>
                <div className="mt-9 flex flex-wrap gap-2">
                  {["NSE", "BSE", "PRICE", "VOLUME"].map((item) => (
                    <span key={item} className="border border-white/[0.09] px-3 py-2 font-mono text-[8px] tracking-[0.2em] text-cream-500 [border-radius:var(--radius-lg)]">
                      {item}
                    </span>
                  ))}
                </div>
              </article>

              <article className="relative overflow-hidden border border-gold-400/20 bg-gold-400/[0.045] p-7 [border-radius:var(--radius-lg)] sm:p-9 lg:col-span-7">
                <div aria-hidden className="absolute -right-10 -top-10 font-display text-[12rem] leading-none text-gold-400/[0.035]">05</div>
                <p className="relative font-mono text-[10px] uppercase tracking-[0.28em] text-gold-400/80">
                  Risk is not an appendix
                </p>
                <blockquote className="relative mt-7 max-w-2xl font-display text-2xl leading-snug text-cream-100 sm:text-3xl">
                  “Risk management is present from the first chart—not added after the strategy.”
                </blockquote>
                <p className="relative mt-6 max-w-xl text-sm leading-6 text-copy-secondary">
                  Position size, invalidation and exposure belong inside the
                  decision process. That standard runs through every stage.
                </p>
              </article>
            </div>
          </Container>
        </section>

        <section id="learning-path" className="relative scroll-mt-20 border-b border-white/[0.07] py-24 sm:py-32">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400 sm:text-[11px]">
                  04 · Your progression
                </p>
                <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-cream-100 sm:text-5xl lg:text-6xl">
                  Start at the right level. Keep moving forward.
                </h2>
              </div>
              <p className="text-sm leading-6 text-copy-secondary lg:border-l lg:border-white/[0.1] lg:pl-7">
                New to markets? Start with Foundation. Build from market basics
                and chart reading to testing trading rules and reviewing your
                process with a mentor.
              </p>
            </div>

            <div className="relative mt-16">
              <ol className="grid gap-5 lg:grid-cols-4">
                {COURSE_STAGES.map((stage, index) => (
                  <li key={stage.num} className="relative flex">
                  <Link
                    href={STAGE_PATHS[stage.num] ?? "/courses"}
                    className={`flex w-full flex-col border border-white/[0.09] bg-gradient-to-b from-white/[0.025] to-transparent p-6 [border-radius:var(--radius-lg)] ${clickableCardInteraction}`}
                  >
                    <ClickableCardAccent />
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-400/45 bg-ink-950 font-mono text-[10px] tracking-[0.18em] text-gold-400">
                        {stage.num}
                      </span>
                      <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-cream-500">
                        Stage {index + 1} / 4
                      </span>
                    </div>
                    <h3 className="mt-8 font-display text-2xl text-cream-100 transition-colors group-hover:text-gold-300">
                      {stage.title}
                    </h3>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-gold-400/70">
                      {stage.level} · {stage.tagline}
                    </p>
                    <p className="mt-5 flex-1 text-sm leading-6 text-copy-secondary">
                      {stage.description}
                    </p>
                    <div className="mt-7">
                      <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-cream-500">
                        Who it&apos;s for
                      </p>
                      <p className="mt-2 text-sm leading-6 text-copy-secondary">
                        {stage.audience}
                      </p>
                    </div>
                    <span className="mt-7 pr-10 font-mono text-[9px] uppercase tracking-[0.22em] text-cream-500 transition-colors duration-300 group-hover:text-gold-400">
                      View course details
                    </span>
                    <ClickableCardArrow />
                  </Link>
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </section>

        <section className="relative py-24 sm:py-32">
          <Container>
            <div className="isolate relative overflow-hidden border border-gold-400/25 bg-gradient-to-br from-gold-400/[0.08] via-ink-900 to-ink-950 px-6 py-14 [border-radius:var(--radius-lg)] sm:px-10 sm:py-16 lg:px-16">
              <CtaPattern />
              <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
                <div className="flex flex-col items-center">
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-400">
                    Admissions · Find your starting point
                  </p>
                  <h2 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-cream-100 sm:text-5xl lg:text-6xl">
                    <span className="sm:block">Your first lesson is choosing</span>{" "}
                    <span className="sm:block">the right level.</span>
                  </h2>
                  <p className="mt-6 max-w-4xl text-sm leading-7 text-copy-secondary sm:text-base">
                    <span className="lg:block">
                      Tell us what you already understand, what you are trying to build,
                    </span>{" "}
                    <span className="lg:block">
                      and where your process currently breaks down. We will point you toward the honest starting point.
                    </span>
                  </p>
                </div>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <Link href="/contact" className={buttonClasses("primary", "lg")}>
                    Talk to the academy <span aria-hidden>→</span>
                  </Link>
                  <Link href="/courses" className={buttonClasses("secondary", "lg")}>
                    Browse courses
                  </Link>
                </div>
              </div>
              <p className="relative mt-10 border-t border-white/[0.08] pt-5 text-center font-mono text-[8px] uppercase leading-5 tracking-[0.2em] text-cream-500">
                Educational programs only · No tips, return promises or performance guarantees
              </p>
            </div>
          </Container>
        </section>
    </main>
  );
}
