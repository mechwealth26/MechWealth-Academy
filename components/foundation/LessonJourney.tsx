"use client";

import { useEffect, useRef, useState } from "react";
import LessonDemo from "@/components/foundation/LessonDemo";
import { FOUNDATION_LESSONS } from "@/data/foundationCourse";

/**
 * Scroll-driven learning journey used by every course page: a sticky progress
 * rail tracks which lesson is in view; each lesson pairs its explanation with
 * a live chart demonstration. Lessons are passed per-course.
 */
export default function LessonJourney({
  lessons = FOUNDATION_LESSONS,
}: {
  lessons?: {
    num: string;
    title: string;
    summary: string;
    points: string[];
    demo: string;
  }[];
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = Number(
              (e.target as HTMLElement).dataset.idx ?? "0"
            );
            setActiveIdx(idx);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    for (const el of sectionRefs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative lg:grid lg:grid-cols-[13rem_1fr] lg:gap-12">
      {/* Sticky progress rail */}
      <aside
        aria-label="Lesson progress"
        className="sticky top-24 hidden h-fit flex-col gap-1 self-start lg:flex"
      >
        {lessons.map((l, i) => (
          <a
            key={l.num}
            href={`#lesson-${l.num}`}
            aria-current={i === activeIdx ? "step" : undefined}
            className={`group flex items-center gap-3 border-l py-2 pl-4 font-mono text-xs tracking-wider transition-colors ${
              i === activeIdx
                ? "border-gold-400 text-gold-400"
                : "border-white/10 text-copy-muted hover:border-white/25 hover:text-cream-100/75"
            }`}
          >
            <span>{l.num}</span>
            <span className="uppercase">{l.title}</span>
          </a>
        ))}
        <p className="mt-6 border-l border-white/10 pl-4 pt-4 font-mono text-[11px] leading-relaxed text-copy-muted">
          LESSON {(activeIdx + 1).toString().padStart(2, "0")} /{" "}
          {lessons.length.toString().padStart(2, "0")}
        </p>
      </aside>

      {/* Lessons */}
      <div className="flex flex-col">
        {lessons.map((lesson, i) => (
          <section
            key={lesson.num}
            id={`lesson-${lesson.num}`}
            data-idx={i}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            aria-label={`Lesson ${lesson.num} ${lesson.title}`}
            className="scroll-mt-20 border-t border-white/5 py-16 first:border-t-0 md:py-20"
          >
            <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
              <div>
                <div className="flex items-center gap-4">
                  <span
                    className={`font-display text-sm transition-colors duration-300 ${
                      i === activeIdx ? "text-gold-400" : "text-copy-muted"
                    }`}
                  >
                    {lesson.num}
                  </span>
                  <span
                    aria-hidden
                    className={`h-px w-8 transition-colors duration-300 ${
                      i === activeIdx ? "bg-gold-400" : "bg-white/15"
                    }`}
                  />
                  <h3 className="font-display text-2xl uppercase tracking-wide text-cream-50 md:text-3xl">
                    {lesson.title}
                  </h3>
                </div>
                <p className="mt-5 max-w-md leading-relaxed text-cream-100/80">
                  {lesson.summary}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {lesson.points.map((pt) => (
                    <li
                      key={pt}
                      className="flex items-baseline gap-3 text-sm text-cream-100/70"
                    >
                      <span
                        aria-hidden
                        className="mt-[7px] h-px w-3 shrink-0 bg-gold-400/60"
                      />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="overflow-hidden rounded-sm border border-white/8 bg-ink-950/60 p-4 md:h-[22rem] md:p-5">
                <LessonDemo variant={lesson.demo} active={i === activeIdx} />
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.25em] text-copy-muted">
                  Fig. {lesson.num} — illustrative demonstration
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
