import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import CourseClosingCta from "@/components/courses/CourseClosingCta";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import Container from "@/components/ui/Container";
import LessonJourney from "@/components/foundation/LessonJourney";
import JsonLd from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  courseJsonLd,
} from "@/lib/seo";
import type { CoursePageContent } from "@/data/coursePages";
import { siteConfig } from "@/data/site";
import { buttonClasses } from "@/lib/buttonStyles";
import { COURSE_STAGES } from "@/data/courses";

/**
 * Shared architecture for every course page (Foundation, Practitioner,
 * Method, One-to-One). Content is passed in per course; the visual system
 * is identical across the academy.
 */
export function coursePageMetadata(content: CoursePageContent): Metadata {
  const path = `/courses/${content.slug}`;
  const course = COURSE_STAGES.find((course) => course.slug === content.slug);
  return {
    title: course ? `${course.title} — ${course.tagline}` : content.eyebrow.split("·")[0].trim(),
    description: content.metaDescription,
    alternates: { canonical: path },
  };
}

function CourseHero({
  content,
}: {
  content: CoursePageContent;
}) {
  const headlineBottom = content.headlineBottom.replace(/\.$/, "");
  const courseName = content.eyebrow.split("·")[0].trim();

  return (
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
            { label: courseName },
          ]}
        />
        <p className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.35em] text-gold-400">
          <span aria-hidden className="h-px w-10 bg-gold-400/60" />
          {content.eyebrow}
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-5xl uppercase leading-[0.95] tracking-tight text-cream-50 md:text-7xl">
          {content.headlineTop}
          <br />
          {headlineBottom}
          <span className="text-gold-400">.</span>
        </h1>
        <p className="mt-6 max-w-xl leading-relaxed text-cream-100/75">
          {content.description}
        </p>
        <p className="mt-6 max-w-xl leading-relaxed text-cream-100/75">
          <span className="font-medium text-cream-100">Who it&apos;s for: </span>
          {content.audience}
        </p>

        <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-10 gap-y-6 border-t border-white/8 pt-8 md:grid-cols-4">
          {content.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-copy-muted">
                {fact.label}
              </dt>
              <dd className="mt-1.5 text-sm text-cream-100/85">
                {fact.value}
              </dd>
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
  );
}

export default function CoursePageTemplate({
  content,
  interlude,
}: {
  content: CoursePageContent;
  /** Optional immersive section rendered before the curriculum. */
  interlude?: ReactNode;
}) {
  return (
    <main id="main">
      {/* Structured data: Course, breadcrumbs and FAQ */}
      <JsonLd
        data={courseJsonLd({
          name: `${content.eyebrow.split("·")[0].trim()} Course — ${siteConfig.shortName}`,
          description: content.metaDescription,
          path: `/courses/${content.slug}`,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Courses", path: "/courses" },
          { name: content.eyebrow.split("·")[0].trim(), path: `/courses/${content.slug}` },
        ])}
      />

      {/* Hero */}
      <CourseHero content={content} />

      {/* What you'll learn */}
      <section className="border-b border-white/5 py-20">
        <Container>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-400">
            What you&apos;ll work on
          </p>
          <ul className="mt-8 grid gap-x-14 gap-y-5 md:grid-cols-2">
            {content.learn.map((item) => (
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

      {interlude}

      {/* Curriculum journey */}
      <section className="py-20">
        <Container>
          <header className="mb-12 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-400">
              Curriculum · {content.lessons.length} lessons
            </p>
            <h2 className="mt-4 font-display text-3xl uppercase tracking-wide text-cream-50 md:text-4xl">
              {content.curriculumTitle}
            </h2>
            <p className="mt-4 leading-relaxed text-cream-100/70">
              {content.curriculumIntro}
            </p>
          </header>
          <LessonJourney lessons={content.lessons} />
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/5 py-20">
        <Container className="max-w-3xl">
          <h2 className="font-display text-2xl uppercase tracking-wide text-cream-50 md:text-3xl">
            Questions
          </h2>
          <div className="mt-7 divide-y divide-white/5 border-y border-white/5">
            {content.faq.map((f) => (
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
        </Container>
      </section>

      {/* CTA */}
      <CourseClosingCta
        eyebrow={content.eyebrow}
        headline={content.ctaHeadline}
        primaryLabel={content.ctaLabel}
      />
    </main>
  );
}
