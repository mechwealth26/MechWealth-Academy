"use client";

import { useEffect, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/lib/buttonStyles";
import { GOOGLE_REVIEWS_URL, SAMPLE_REVIEWS } from "@/data/reviews";

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
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "md", "shrink-0 whitespace-nowrap lg:mt-9")}>
            Read more reviews <span aria-hidden="true">↗</span>
            <span className="sr-only"> on Google (opens in a new tab)</span>
          </a>
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
          className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
        >
          {SAMPLE_REVIEWS.map((review, index) => (
            <article key={review.topic} aria-label={`Sample review ${index + 1} of ${SAMPLE_REVIEWS.length}`} aria-roledescription="slide" className="group flex min-w-0 basis-full shrink-0 snap-start flex-col rounded-2xl border border-white/[0.08] bg-ink-900/60 p-6 transition-colors duration-300 hover:border-gold-500/40 motion-reduce:transition-none sm:p-8 md:basis-[calc((100%_-_1.25rem)/2)] xl:basis-[calc((100%_-_2.5rem)/3)]">
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold-500">Sample {String(index + 1).padStart(2, "0")}</p>
                <span aria-hidden="true" className="font-display text-4xl leading-none text-gold-500/40">“</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-medium text-cream-100">{review.topic}</h3>
              <p className="mb-8 mt-4 text-base leading-relaxed text-copy-secondary">{review.text}</p>
              <p className="mt-auto border-t border-white/[0.08] pt-5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-copy-muted">Illustrative copy · Not a customer review</p>
            </article>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
          <p className="text-sm text-copy-muted">Six sample cards · Swipe or use the arrows to explore</p>
          <div className="flex gap-3" aria-label="Review carousel controls">
            <button type="button" aria-label="Previous reviews" aria-controls="review-cards" disabled={edges.start} onClick={() => move(-1)} className={buttonClasses("secondary", "sm", "w-11 px-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400")}><span aria-hidden="true">←</span></button>
            <button type="button" aria-label="Next reviews" aria-controls="review-cards" disabled={edges.end} onClick={() => move(1)} className={buttonClasses("secondary", "sm", "w-11 px-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400")}><span aria-hidden="true">→</span></button>
          </div>
        </div>
      </Container>
    </section>
  );
}
