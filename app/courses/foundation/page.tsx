import type { Metadata } from "next";
import Link from "next/link";
import CourseClosingCta from "@/components/courses/CourseClosingCta";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Container from "@/components/ui/Container";
import LessonJourney from "@/components/foundation/LessonJourney";
import { breadcrumbJsonLd, courseJsonLd } from "@/lib/seo";
import { buttonClasses } from "@/lib/buttonStyles";
import {
  FOUNDATION_OVERVIEW,
  FOUNDATION_LEARN,
  FOUNDATION_FAQ,
} from "@/data/foundationCourse";

export const metadata: Metadata = {
  title: "Foundation — Stock-Market Basics",
  description:
    "Start with the market. A four-week foundation in market mechanics, charts, candlesticks and structure — no prior experience required.",
  alternates: { canonical: "/courses/foundation" },
};

const { facts } = FOUNDATION_OVERVIEW;

export default function FoundationCoursePage() {
  return (
    <main id="main">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Courses", path: "/courses" },
          { name: "Foundation Course", path: "/courses/foundation" },
        ])}
      />
      <JsonLd
        data={courseJsonLd({
          name: "Foundation Course — MECHWEALTH",
          description:
            "A four-week foundation in market mechanics, charts, candlesticks and structure — no prior experience required.",
          path: "/courses/foundation",
        })}
      />
      {/* Hero */}
      <section className="relative flex min-h-[68svh] items-start overflow-hidden border-b border-white/5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(15,174,125,0.08),transparent_55%),radial-gradient(ellipse_at_top_left,rgba(212,175,55,0.05),transparent_50%)]"
        />
        <Container className="relative pb-16 pt-24 sm:pt-28">
          <Breadcrumbs
            className="mb-10"
            items={[
              { label: "Home", href: "/" },
              { label: "Courses", href: "/courses" },
              { label: "Foundation Course" },
            ]}
          />
          <p className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.35em] text-gold-400">
            <span aria-hidden className="h-px w-10 bg-gold-400/60" />
            {FOUNDATION_OVERVIEW.eyebrow}
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl uppercase leading-[0.95] tracking-tight text-cream-50 md:text-7xl">
            Stock-market
            <br />
            basics<span className="text-gold-400">.</span>
          </h1>
          <p className="mt-6 max-w-xl leading-relaxed text-cream-100/75">
            {FOUNDATION_OVERVIEW.description}
          </p>
          <p className="mt-6 max-w-xl leading-relaxed text-cream-100/75">
            <span className="font-medium text-cream-100">Who it&apos;s for: </span>
            {FOUNDATION_OVERVIEW.audience}
          </p>

          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-10 gap-y-6 border-t border-white/8 pt-8 md:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-copy-muted">
                  {f.label}
                </dt>
                <dd className="mt-1.5 text-sm text-cream-100/85">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className={buttonClasses("primary")}>
              Enquire about course <span aria-hidden>→</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* What you'll learn */}
      <section className="border-b border-white/5 py-20">
        <Container>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-400">
            What you&apos;ll learn
          </p>
          <ul className="mt-8 grid gap-x-14 gap-y-5 md:grid-cols-2">
            {FOUNDATION_LEARN.map((item) => (
              <li
                key={item}
                className="flex items-baseline gap-4 border-b border-white/5 pb-4 text-cream-100/85"
              >
                <span aria-hidden className="font-display text-sm text-gold-400">
                  →
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Curriculum journey */}
      <section className="py-20">
        <Container>
          <header className="mb-12 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-400">
              Curriculum · Seven lessons
            </p>
            <h2 className="mt-4 font-display text-3xl uppercase tracking-wide text-cream-50 md:text-4xl">
              One idea at a time.
            </h2>
            <p className="mt-4 leading-relaxed text-cream-100/70">
              Each lesson builds on the last — scroll through the course as it
              unfolds, from raw price to a complete chart read.
            </p>
          </header>
          <LessonJourney />
        </Container>
      </section>

      {/* Format + FAQ */}
      <section className="border-t border-white/5 py-20">
        <Container className="grid gap-16 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl uppercase tracking-wide text-cream-50 md:text-3xl">
              Learning format
            </h2>
            <ul className="mt-7 space-y-5">
              {facts.map((f) => (
                <li key={f.label} className="flex items-baseline gap-4">
                  <span className="w-28 shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-copy-muted">
                    {f.label}
                  </span>
                  <span className="text-sm text-cream-100/85">{f.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 border-l border-gold-400/40 pl-4 text-sm leading-relaxed text-cream-100/70">
              Sessions are taught live and recorded for review. Between
              sessions you practise on charts — the demonstrations above are
              drawn from the same material.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl uppercase tracking-wide text-cream-50 md:text-3xl">
              Questions
            </h2>
            <div className="mt-7 divide-y divide-white/5 border-y border-white/5">
              {FOUNDATION_FAQ.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="cursor-pointer list-none font-medium text-cream-100/90 transition-colors hover:text-gold-300 [&::-webkit-details-marker]:hidden">
                    <span className="mr-3 font-mono text-xs text-gold-400">+</span>
                    {f.q}
                  </summary>
                  <p className="mt-3 pl-7 text-sm leading-relaxed text-cream-100/70">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <CourseClosingCta
        eyebrow="Foundation · Stage 01 of 04"
        headline="Begin where every trader should."
        primaryLabel="Request the syllabus"
      />
    </main>
  );
}
