import Link from "next/link";
import Container from "@/components/ui/Container";
import {
  ClickableCardAccent,
  clickableCardInteraction,
} from "@/components/ui/ClickableCard";
import { COURSE_STAGES } from "@/data/courses";
import { FOUNDATION_OVERVIEW } from "@/data/foundationCourse";
import {
  PRACTITIONER_PAGE,
  METHOD_PAGE,
  ONE_TO_ONE_PAGE,
} from "@/data/coursePages";

// Read comparison facts from the same content used on each course page.
const COURSE_DETAILS: Record<string, {
  slug: string;
  facts: { label: string; value: string }[];
}> = {
  "01": { slug: "foundation", facts: FOUNDATION_OVERVIEW.facts },
  "02": PRACTITIONER_PAGE,
  "03": METHOD_PAGE,
  "04": ONE_TO_ONE_PAGE,
};

export default function CoursesJourney() {
  return (
    <section aria-labelledby="course-overview-title" className="py-12 sm:py-16">
      <Container>
        <header className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <h2 id="course-overview-title" className="font-display text-3xl font-semibold tracking-tight text-cream-100 sm:text-4xl">
            Find the course for your next step.
          </h2>
          <p className="font-mono text-xs text-copy-secondary">
            Foundation → Practitioner → Method → One-to-One
          </p>
        </header>
        <p className="mb-7 max-w-3xl text-sm leading-6 text-copy-secondary">
          Foundation introduces chart reading. Practitioner builds a more detailed
          routine. Method focuses on writing and testing trading rules. One-to-One
          focuses on reviewing your own process with a mentor.
        </p>

        <ol className="grid gap-5 md:grid-cols-2">
          {COURSE_STAGES.map((stage) => {
            const details = COURSE_DETAILS[stage.num];
            return (
              <li key={stage.num} id={`stage-${stage.num}`} className="flex min-w-0 scroll-mt-24">
                <Link
                  href={`/courses/${details.slug}`}
                  aria-labelledby={`course-${stage.num}-title course-${stage.num}-link`}
                  aria-describedby={`course-${stage.num}-subject course-${stage.num}-audience course-${stage.num}-level`}
                  className={`flex w-full flex-col overflow-hidden rounded-xl border border-white/[0.09] bg-gradient-to-b from-white/[0.025] to-transparent p-5 ${clickableCardInteraction}`}
                >
                  <ClickableCardAccent />
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <h3 id={`course-${stage.num}-title`} className="font-display text-2xl font-semibold text-cream-100 sm:text-3xl">
                      {stage.title}
                    </h3>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-gold-400">
                      Stage {stage.num} / 04
                    </span>
                  </div>
                  <p id={`course-${stage.num}-subject`} className="mt-2 text-sm text-gold-400">{stage.tagline}</p>
                  <p className="mt-3 flex-1 text-sm leading-6 text-copy-secondary">
                    {stage.description}
                  </p>
                  <p id={`course-${stage.num}-audience`} className="mt-3 text-sm leading-6 text-copy-secondary">
                    <span className="font-medium text-cream-100">Who it&apos;s for: </span>
                    {stage.audience}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 border-t border-white/[0.08] pt-3">
                    <div className="col-span-2">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-copy-muted">Level</dt>
                      <dd id={`course-${stage.num}-level`} className="mt-1 text-sm leading-5 text-cream-100">{stage.level}</dd>
                    </div>
                    {details.facts.filter((fact) => ["Length", "Before joining", "Format"].includes(fact.label)).map((fact) => (
                      <div key={fact.label} className={fact.label === "Format" ? "col-span-2" : ""}>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-copy-muted">
                          {fact.label}
                        </dt>
                        <dd className="mt-1 text-sm leading-5 text-cream-100">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <span id={`course-${stage.num}-link`} className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3 text-sm font-medium text-gold-400">
                    View course details
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1">→</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
          <p className="text-sm text-copy-secondary">Need help choosing your next stage?</p>
          <Link href="/contact" className="inline-flex min-h-11 items-center gap-3 rounded-full border border-gold-400/30 px-5 text-sm text-gold-400 transition-colors hover:border-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400">
            Enquire about courses <span aria-hidden>→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
