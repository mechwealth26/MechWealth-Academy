"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildLesson } from "@/data/marketLesson";
import { useSectionProgress } from "@/hooks/useSectionProgress";
import {
  drawLesson,
  activeChapter,
  chapterUiAlpha,
  type LessonViewState,
} from "./technicalAnalysis/renderer";

/**
 * Technical Analysis — scroll-driven interactive chart lesson.
 * A tall wrapper pins the viewport while overall progress drives a
 * canvas renderer that progressively layers each concept onto one
 * illustrative chart: structure → levels → trendline → breakout →
 * pullback → moving averages → volume.
 */
export default function TechnicalAnalysis() {
  const wrapRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement | null>(null);

  const progressRef = useSectionProgress(wrapRef);
  const viewRef = useRef<LessonViewState>({ p: -1, yMin: 97, yMax: 124 });
  const data = useMemo(() => buildLesson(), []);
  // Honour prefers-reduced-motion: no eased scrubbing, no ambient motion,
  // chart state follows scroll position directly.
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const chart = chartRef.current;
    if (!canvas || !chart) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = chart.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(chart);

    let visible = true;
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      if (!visible) {
        raf = 0;
        last = now;
        return;
      }
      if (w === 0 || h === 0) {
        last = now;
        raf = requestAnimationFrame(loop);
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const v = viewRef.current;
      if (reduced) {
        v.p = progressRef.current;
      } else {
        if (v.p < 0) v.p = progressRef.current;
        v.p += (progressRef.current - v.p) * (1 - Math.exp(-4 * dt));
      }

      drawLesson(
        {
          ctx,
          w,
          h,
          time: reduced ? 0 : now / 1000,
          dt: reduced ? 0 : dt,
          p: v.p,
        },
        data,
        v
      );

      // Mirror layer alphas onto the editorial rail (no React re-renders):
      // only the active chapter is visible, crossfading at boundaries
      for (let i = 0; i < data.chapters.length; i++) {
        const el = chapterRefs.current[i];
        if (!el) continue;
        const a = chapterUiAlpha(v.p, i);
        el.style.opacity = String(a);
        el.style.transform = `translateY(${(1 - a) * 12}px)`;
      }
      const act = Math.max(activeChapter(v.p) + 1, 0);
      if (counterRef.current) {
        counterRef.current.textContent = `${String(act).padStart(2, "0")} / 07`;
      }

      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!entry.isIntersecting) {
          cancelAnimationFrame(raf);
          raf = 0;
        } else if (!raf) {
          last = performance.now();
          raf = requestAnimationFrame(loop);
        }
      },
      { rootMargin: "120px" }
    );
    io.observe(chart);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [data, progressRef, reduced]);

  return (
    <section
      id="technical-analysis"
      ref={wrapRef}
      className="relative scroll-mt-20"
      style={{ height: "480vh" }}
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 lg:flex-row">
        {/* Editorial rail — compact, everything flows top-down */}
        <aside className="relative z-10 flex w-full shrink-0 flex-col gap-10 px-6 py-14 sm:px-10 lg:w-[400px] lg:border-r lg:border-white/5 xl:w-[460px]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-gold-500">
              Technical Analysis · An illustrated lesson
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.08] text-cream-100 sm:text-4xl xl:text-5xl">
              SEE WHAT OTHERS <span className="text-gold-500">MISS.</span>
            </h2>
            <div className="mt-6 h-px w-16 bg-gold-500/60" />
          </div>

          {/* Chapter readout */}
          <div>
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.3em] text-cream-500">
              <span>Lesson</span>
              <span ref={counterRef} className="text-gold-500">
                00 / 07
              </span>
            </div>
            <div className="relative mt-4 h-44">
              {data.chapters.map((ch, i) => (
                <div
                  key={ch.num}
                  ref={(el) => {
                    chapterRefs.current[i] = el;
                  }}
                  className="absolute inset-0"
                  style={{ opacity: 0 }}
                >
                  <p className="font-mono text-xs tracking-[0.35em] text-gold-500">
                    {ch.num}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-cream-100">
                    {ch.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream-300">
                    {ch.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 hidden gap-1 lg:flex">
              {data.chapters.map((ch) => (
                <span key={ch.num} className="h-px flex-1 bg-white/10" />
              ))}
            </div>
          </div>
        </aside>

        {/* Chart stage */}
        <div ref={chartRef} className="relative min-h-[46vh] flex-1">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          <p className="pointer-events-none absolute bottom-3 left-6 right-6 font-mono text-[11px] leading-relaxed tracking-wide text-copy-muted">
            Illustrative data only. This chart does not show live prices,
            trading advice or performance of any kind.
          </p>
        </div>
      </div>
    </section>
  );
}
