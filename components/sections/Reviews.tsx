"use client";

import { useEffect, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/lib/buttonStyles";
import { GOOGLE_REVIEWS_URL, SAMPLE_REVIEWS } from "@/data/reviews";
import styles from "./Reviews.module.css";

export default function Reviews() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => setEdges({
      start: track.scrollLeft <= 1,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 1,
    });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    track.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", update);
    };
  }, []);

  const move = (direction: number) => {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (card.offsetWidth + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  return (
    <section id="reviews" aria-labelledby="reviews-heading" aria-roledescription="carousel" className="relative border-t border-white/5 py-24 sm:py-32">
      <Container>
        <div className="flex flex-col items-start justify-between gap-7 lg:flex-row lg:gap-12">
          <div className="min-w-0">
            <SectionHeading
              align="left"
              eyebrow="Reviews · Layout preview"
              title={<span id="reviews-heading">Their experience.<br />In their words.</span>}
              description="Sample content for layout preview. Actual customer reviews will replace these cards."
            />
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-4 lg:mt-9 lg:w-auto lg:shrink-0 lg:flex-col lg:items-end">
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "md", "shrink-0 whitespace-nowrap")}>
            Read more reviews <span aria-hidden="true">↗</span>
            <span className="sr-only"> on Google (opens in a new tab)</span>
          </a>
          <div className="ml-auto flex gap-3" aria-label="Review carousel controls">
            <button type="button" aria-label="Previous reviews" aria-controls="review-cards" disabled={edges.start} onClick={() => move(-1)} className={buttonClasses("secondary", "sm", "w-11 px-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400")}><span aria-hidden="true">←</span></button>
            <button type="button" aria-label="Next reviews" aria-controls="review-cards" disabled={edges.end} onClick={() => move(1)} className={buttonClasses("secondary", "sm", "w-11 px-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400")}><span aria-hidden="true">→</span></button>
          </div>
          </div>
        </div>

        <div
          id="review-cards"
          ref={trackRef}
          tabIndex={0}
          aria-label="Sample review cards. Use left and right arrow keys to browse."
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }}
          className={`${styles.track} mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400`}
        >
          {SAMPLE_REVIEWS.map((review, index) => (
            <article key={review.topic} aria-label={`Sample review ${index + 1} of ${SAMPLE_REVIEWS.length}`} aria-roledescription="slide" className="group relative flex min-w-0 basis-full shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-ink-850 to-ink-900 p-6 transition-colors duration-300 hover:border-gold-500/40 motion-reduce:transition-none sm:p-8 md:basis-[calc((100%_-_1.25rem)/2)] xl:basis-[calc((100%_-_2.5rem)/3)]">
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
              <header className="flex items-center gap-3">
                <div role="img" aria-label={`Placeholder avatar for sample reviewer ${index + 1}`} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-gradient-to-br from-gold-500/20 to-gold-500/5 text-gold-400">
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-7 w-7">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21v-2a8 8 0 0 1 16 0v2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-display text-base font-medium text-cream-100">Sample reviewer {String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-1 text-xs text-copy-muted">Reviewer details pending</p>
                </div>
              </header>
              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
                <div aria-hidden="true" className="flex gap-1 text-gold-500/60">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <svg key={star} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" strokeLinejoin="round" /></svg>
                  ))}
                </div>
                <span className="text-xs text-copy-muted">Rating pending</span>
              </div>
              <blockquote className="mb-7 mt-5 flex-1">
                <h3 className="font-display text-xl font-medium leading-snug text-cream-100">“{review.topic}”</h3>
                <p className="mt-4 text-base leading-relaxed text-copy-secondary">{review.text}</p>
              </blockquote>
              <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] pt-5">
                <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-copy-muted">Illustrative copy · Not a customer review</p>
                <span aria-hidden="true" className="font-display text-3xl leading-none text-gold-500/40">”</span>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-5 text-sm text-copy-muted">Six sample cards · Swipe or use the arrows to explore</p>
      </Container>
    </section>
  );
}
