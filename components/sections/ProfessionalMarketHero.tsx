"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { buttonClasses } from "@/lib/buttonStyles";
import { useSectionProgress } from "@/hooks/useSectionProgress";
import { buildHeroCandles, HERO_PATTERNS } from "@/data/heroMarket";
import {
  drawHeroChart,
  type ChartMetrics,
  type ChartPointer,
  type PatternWeights,
} from "./heroMarket/renderer";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
};
const range = (value: number, from: number, to: number) =>
  smoothstep((value - from) / (to - from));

function chapterWeight(progress: number, start: number, end: number) {
  const fade = Math.min(0.045, (end - start) * 0.28);
  return (
    range(progress, start, start + fade) *
    (1 - range(progress, end - fade, end))
  );
}

const candlePriceFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const candleVolumeFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

function formatCandleDate(time: number) {
  return new Date(time).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Scroll-led market lesson built on one deterministic Canvas 2D chart.
 * Canvas owns high-frequency drawing and pointer interaction; DOM refs own
 * layout/card choreography so scrolling never drives React re-renders.
 */
export default function ProfessionalMarketHero() {
  const progressRef = useSectionProgress("hero-scroll-track");
  const reducedMotion = useReducedMotion();
  const candles = useMemo(() => buildHeroCandles(), []);
  const [activeCandleIndex, setActiveCandleIndex] = useState(
    candles.length - 1
  );
  const activeCandle = candles[activeCandleIndex];
  const activeCandleDate = formatCandleDate(activeCandle.time);
  const activeCandleValue = [
    activeCandleDate,
    `Open ${candlePriceFormatter.format(activeCandle.o)}`,
    `High ${candlePriceFormatter.format(activeCandle.h)}`,
    `Low ${candlePriceFormatter.format(activeCandle.l)}`,
    `Close ${candlePriceFormatter.format(activeCandle.c)}`,
    `Volume ${candleVolumeFormatter.format(activeCandle.v)}`,
  ].join(", ");
  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartShellRef = useRef<HTMLDivElement>(null);
  const chartVisualRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const learningPanelRef = useRef<HTMLDivElement>(null);
  const chapterLabelRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const visibleRef = useRef(true);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const metricsRef = useRef<ChartMetrics | null>(null);
  const keyboardInspectionActiveRef = useRef(false);
  const pointerTarget = useRef<ChartPointer>({ active: false, x: 0, y: 0 });
  const pointerDisplay = useRef<ChartPointer>({ active: false, x: 0, y: 0 });

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const chartShell = chartShellRef.current;
    const stage = stageRef.current;
    const mentor = document.getElementById("mentor");
    if (!root || !canvas || !chartShell || !stage) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let previousTime = performance.now();
    let smoothProgress = progressRef.current;

    const render = (time: number) => {
      if (!visibleRef.current) {
        frame = 0;
        previousTime = time;
        return;
      }

      const delta = Math.min((time - previousTime) / 1000, 0.1);
      previousTime = time;
      const damping = reducedMotion ? 1 : 1 - Math.exp(-delta * 6.5);
      smoothProgress += (progressRef.current - smoothProgress) * damping;

      const target = pointerTarget.current;
      const displayed = pointerDisplay.current;
      displayed.active = target.active;
      const pointerDamping = reducedMotion ? 1 : 1 - Math.exp(-delta * 15);
      displayed.x += (target.x - displayed.x) * pointerDamping;
      displayed.y += (target.y - displayed.y) * pointerDamping;

      const weights = {} as PatternWeights;
      let strongestIndex = -1;
      let strongestWeight = 0;

      HERO_PATTERNS.forEach((pattern, index) => {
        const weight = chapterWeight(
          smoothProgress,
          pattern.start,
          pattern.end
        );
        weights[pattern.id] = weight;
        if (weight > strongestWeight) {
          strongestIndex = index;
          strongestWeight = weight;
        }
      });

      const finalTransition = range(smoothProgress, 0.77, 0.94);
      const compact = window.innerWidth < 768;
      chartShell.style.width = compact
        ? "100%"
        : `${100 - finalTransition * 40}%`;

      const initialStageTop = compact ? 170 : 205;
      // Navbar occupies the first 64px. Keep an additional 64px desktop gap
      // between navigation and the chart in the final learning state.
      const finalStageTop = compact ? 80 : 128;
      stage.style.top = `${
        initialStageTop + (finalStageTop - initialStageTop) * finalTransition
      }px`;

      const header = headerRef.current;
      if (header) {
        header.style.opacity = String(1 - finalTransition);
        header.style.transform = `translate3d(0, ${-18 * finalTransition}px, 0)`;
        header.style.visibility = finalTransition > 0.98 ? "hidden" : "visible";
      }

      const scrollCue = scrollCueRef.current;
      if (scrollCue) {
        const mentorTop = mentor?.getBoundingClientRect().top ?? window.innerHeight;
        const mentorArrival = reducedMotion
          ? Number(mentorTop < window.innerHeight)
          : range(window.innerHeight - mentorTop, 0, 96);
        const cueVisibility = 1 - mentorArrival;
        scrollCue.style.opacity = String(cueVisibility);
        scrollCue.style.transform = reducedMotion
          ? "none"
          : `translate3d(0, ${-4 * mentorArrival}px, 0)`;
        scrollCue.style.visibility =
          cueVisibility < 0.01 ? "hidden" : "visible";
      }

      const chartVisual = chartVisualRef.current;
      if (chartVisual) {
        chartVisual.inert = compact && finalTransition > 0.85;
        chartVisual.style.opacity = compact
          ? String(1 - finalTransition)
          : "1";
        chartVisual.style.transform = compact
          ? `translate3d(0, ${-8 * finalTransition}px, 0) scale(${1 - finalTransition * 0.008})`
          : "none";
      }

      const panel = learningPanelRef.current;
      if (panel) {
        panel.style.opacity = String(finalTransition);
        panel.style.transform = compact
          ? `translate3d(0, ${(1 - finalTransition) * 20}px, 0)`
          : `translate3d(${(1 - finalTransition) * 28}px, 0, 0)`;
        panel.style.pointerEvents = finalTransition > 0.85 ? "auto" : "none";
        panel.inert = finalTransition <= 0.85;
      }

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const weight = weights[HERO_PATTERNS[index].id] * (1 - finalTransition);
        card.style.opacity = String(weight);
        card.style.transform = `translate3d(0, ${(1 - weight) * 14}px, 0)`;
      });

      markerRefs.current.forEach((marker, index) => {
        if (!marker) return;
        const pattern = HERO_PATTERNS[index];
        const completed = range(smoothProgress, pattern.start, pattern.end - 0.025);
        marker.style.transform = `scaleX(${0.12 + completed * 0.88})`;
        marker.style.opacity = String(0.2 + completed * 0.8);
      });

      if (chapterLabelRef.current) {
        chapterLabelRef.current.textContent =
          finalTransition > 0.5
            ? "Build the method"
            : strongestIndex >= 0 && strongestWeight > 0.08
              ? HERO_PATTERNS[strongestIndex].title
              : "Scroll to reveal structure";
      }

      // Resize and redraw in the same frame. A separate ResizeObserver can
      // clear the bitmap after drawing while the 100% → 60% width is moving.
      const rect = canvas.getBoundingClientRect();
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.max(1, Math.round(rect.width * nextDpr));
      const pixelHeight = Math.max(1, Math.round(rect.height * nextDpr));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        sizeRef.current = {
          width: rect.width,
          height: rect.height,
          dpr: nextDpr,
        };
      }

      const { width, height, dpr } = sizeRef.current;
      if (width > 0 && height > 0) {
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        metricsRef.current = drawHeroChart({
          context,
          width,
          height,
          candles,
          weights,
          pointer: displayed,
          time,
          reducedMotion: Boolean(reducedMotion),
        });
      }

      frame = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          cancelAnimationFrame(frame);
          frame = 0;
        } else if (!frame) {
          previousTime = performance.now();
          frame = requestAnimationFrame(render);
        }
      },
      { rootMargin: "120px" }
    );
    observer.observe(root);
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [candles, progressRef, reducedMotion]);

  const inspectCandle = (index: number) => {
    const boundedIndex = Math.min(candles.length - 1, Math.max(0, index));
    setActiveCandleIndex(boundedIndex);

    const metrics = metricsRef.current;
    if (!metrics) return;
    const candle = candles[boundedIndex];
    pointerTarget.current.active = true;
    pointerTarget.current.x = metrics.xForIndex(boundedIndex);
    pointerTarget.current.y = metrics.yForPrice(candle.c);
  };

  const onChartFocus = () => {
    keyboardInspectionActiveRef.current = true;
    inspectCandle(activeCandleIndex);
  };

  const onChartBlur = () => {
    keyboardInspectionActiveRef.current = false;
    pointerTarget.current.active = false;
  };

  const onChartKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let nextIndex = activeCandleIndex;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        nextIndex -= 1;
        break;
      case "ArrowRight":
      case "ArrowUp":
        nextIndex += 1;
        break;
      case "PageDown":
        nextIndex -= 10;
        break;
      case "PageUp":
        nextIndex += 10;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = candles.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    inspectCandle(nextIndex);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerTarget.current.active = true;
    pointerTarget.current.x = event.clientX - rect.left;
    pointerTarget.current.y = event.clientY - rect.top;
  };

  const onPointerLeave = () => {
    if (keyboardInspectionActiveRef.current) {
      inspectCandle(activeCandleIndex);
    } else {
      pointerTarget.current.active = false;
    }
  };

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 overflow-hidden bg-ink-950"
    >
      <header
        ref={headerRef}
        className="absolute inset-x-4 top-24 z-20 will-change-[opacity,transform] md:inset-x-16 md:top-20"
      >
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <p className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.32em] text-copy-muted sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#20d6a1] shadow-[0_0_12px_rgba(32,214,161,0.7)]" />
              Interactive market lesson
            </p>
            <h1 className="mt-3 whitespace-nowrap text-left font-display text-[clamp(1rem,3.2vw,3rem)] font-semibold leading-none tracking-[-0.035em] text-cream-100">
              Learn to see what the market is saying.
            </h1>
          </div>

          <div className="mb-1 hidden w-72 justify-self-end lg:block">
            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-copy-muted">
              <span ref={chapterLabelRef}>Scroll to reveal structure</span>
              <span>04 patterns</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {HERO_PATTERNS.map((pattern, index) => (
                <span
                  key={pattern.id}
                  className="h-px overflow-hidden bg-white/10"
                >
                  <span
                    ref={(node) => {
                      markerRefs.current[index] = node;
                    }}
                    className="block h-full origin-left bg-gold-400"
                    style={{ opacity: 0.2, transform: "scaleX(0.12)" }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div
        ref={stageRef}
        className="absolute bottom-3 left-4 right-4 z-10 flex flex-col md:bottom-8 md:left-16 md:right-16"
        style={{ top: 205 }}
      >
          <div
            ref={chartShellRef}
            className="relative min-h-0 flex-1 overflow-hidden border-y border-white/[0.07] [background:var(--theme-panel)] [border-radius:var(--radius-lg)] will-change-[width]"
            style={{ width: "100%" }}
          >
            <div
              ref={chartVisualRef}
              className="absolute inset-0 overflow-hidden [border-radius:var(--radius-lg)] will-change-[opacity,transform]"
            >
              <canvas
                ref={canvasRef}
                className="h-full w-full cursor-crosshair touch-pan-y"
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                aria-hidden="true"
              />

              <div
                role="slider"
                tabIndex={0}
                aria-label="Candlestick data explorer"
                aria-orientation="horizontal"
                aria-valuemin={1}
                aria-valuemax={candles.length}
                aria-valuenow={activeCandleIndex + 1}
                aria-valuetext={activeCandleValue}
                aria-describedby="hero-chart-keyboard-help hero-chart-candle-details"
                onFocus={onChartFocus}
                onBlur={onChartBlur}
                onKeyDown={onChartKeyDown}
                className="pointer-events-none absolute inset-0 z-30 rounded-[var(--radius-lg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-gold-400"
              />
              <p id="hero-chart-keyboard-help" className="sr-only">
                Use the left and right arrow keys to inspect each candle. Use
                Home and End to jump to the first or last candle, and Page Up
                or Page Down to move ten candles.
              </p>
              <dl id="hero-chart-candle-details" className="sr-only">
                <div>
                  <dt>Selected candle</dt>
                  <dd>
                    {activeCandleIndex + 1} of {candles.length}
                  </dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{activeCandleDate}</dd>
                </div>
                <div>
                  <dt>Open</dt>
                  <dd>{candlePriceFormatter.format(activeCandle.o)}</dd>
                </div>
                <div>
                  <dt>High</dt>
                  <dd>{candlePriceFormatter.format(activeCandle.h)}</dd>
                </div>
                <div>
                  <dt>Low</dt>
                  <dd>{candlePriceFormatter.format(activeCandle.l)}</dd>
                </div>
                <div>
                  <dt>Close</dt>
                  <dd>{candlePriceFormatter.format(activeCandle.c)}</dd>
                </div>
                <div>
                  <dt>Volume</dt>
                  <dd>{candleVolumeFormatter.format(activeCandle.v)}</dd>
                </div>
              </dl>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink-900/45 to-transparent" />

              {HERO_PATTERNS.map((pattern, index) => (
                <div
                  key={pattern.id}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  className="pointer-events-none absolute left-4 top-16 z-10 w-[min(21rem,calc(100%-2rem))] rounded-lg border border-white/[0.1] bg-ink-900/92 p-4 opacity-0 shadow-[0_18px_54px_var(--theme-shadow)] backdrop-blur-md will-change-[opacity,transform] sm:left-6 sm:top-[4.5rem] sm:p-5 lg:left-8"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="font-mono text-[10px] tracking-[0.24em]"
                      style={{ color: pattern.color }}
                    >
                      {pattern.number}
                    </span>
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-copy-muted sm:text-[9px]">
                        {pattern.eyebrow}
                      </p>
                      <h2 className="mt-1.5 font-display text-lg font-medium text-cream-100 sm:text-xl">
                        {pattern.title}
                      </h2>
                      <p className="mt-2 text-xs leading-5 text-copy-secondary sm:text-sm sm:leading-6">
                        {pattern.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <p className="pointer-events-none absolute bottom-3 right-4 hidden font-mono text-[8px] uppercase tracking-[0.2em] text-copy-muted sm:block">
                Move cursor or use arrow keys to inspect candles
              </p>
            </div>
          </div>

          <div
            ref={scrollCueRef}
            className="mt-2.5 flex shrink-0 items-center justify-center gap-3 text-center will-change-[opacity,transform] sm:mt-3"
          >
            <span
              aria-hidden="true"
              className="h-px w-6 bg-gradient-to-r from-transparent to-gold-400/70 sm:w-10"
            />
            <span className="font-mono text-[9px] font-medium uppercase tracking-[0.24em] text-cream-300 sm:text-[10px] sm:tracking-[0.28em]">
              Scroll down to explore
            </span>
            <motion.span
              aria-hidden="true"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-gold-400/65 text-gold-400 shadow-[0_0_16px_rgba(213,180,92,0.12)]"
              animate={
                reducedMotion
                  ? undefined
                  : { y: [0, 4, 0], opacity: [0.7, 1, 0.7] }
              }
              transition={
                reducedMotion
                  ? undefined
                  : { duration: 1.6, ease: "easeInOut", repeat: Infinity }
              }
            >
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="m4 6 4 4 4-4" />
              </svg>
            </motion.span>
            <span
              aria-hidden="true"
              className="h-px w-6 bg-gradient-to-l from-transparent to-gold-400/70 sm:w-10"
            />
          </div>

          <aside
            ref={learningPanelRef}
            inert
            className="pointer-events-none absolute inset-0 z-20 flex translate-y-5 flex-col justify-center bg-ink-950 px-5 opacity-0 will-change-[opacity,transform] md:left-auto md:right-0 md:w-[40%] md:translate-x-7 md:px-8 lg:px-[clamp(2.5rem,4vw,5rem)]"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold-400/78">
              From observation to method
            </p>
            <h2 className="mt-4 max-w-md font-display text-3xl font-semibold leading-[1.03] tracking-[-0.025em] text-cream-100 lg:text-5xl">
              Learn the logic behind every move.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-copy-secondary lg:text-base lg:leading-7">
              Structure turns a moving chart into a repeatable decision process.
              Learn to identify context, confirmation and risk before taking action.
            </p>

            <div className="mt-6 grid max-w-sm grid-cols-3 gap-2 border-y border-white/[0.07] py-4 font-mono text-[8px] uppercase tracking-[0.14em] text-copy-muted lg:text-[9px]">
              <span>Read structure</span>
              <span>Define risk</span>
              <span>Test the idea</span>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#technical-analysis"
                className={buttonClasses("primary", "lg")}
              >
                Start Learning
              </a>
              <Link
                href="/courses"
                className={buttonClasses("secondary", "lg")}
              >
                Explore Courses
              </Link>
            </div>

            <p className="mt-5 font-mono text-[8px] uppercase tracking-[0.22em] text-copy-muted">
              Illustrative market data · Education only
            </p>
          </aside>
      </div>
    </div>
  );
}
