"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Deterministic decorative tape for the hero backdrop */
const CANDLES = Array.from({ length: 48 }, (_, i) => {
  const c = 200 + Math.sin(i * 0.35) * 60 + i * 2.2;
  const o = 200 + Math.sin(i * 0.35 + 0.5) * 60 + i * 2.2;
  return {
    x: 24 + i * 25,
    up: c >= o,
    top: Math.min(o, c),
    h: Math.max(Math.abs(c - o), 6),
    hi: Math.max(o, c) + 14,
    lo: Math.min(o, c) - 14,
  };
});
// Close-line points through the tape
const LINE = CANDLES.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x + 5} ${360 - c.top}`).join(" ");
const LAST_CANDLE = CANDLES[CANDLES.length - 1];

export default function AboutHero({
  eyebrow,
  titleLines,
  intro,
  children,
}: {
  eyebrow: string;
  titleLines: string[];
  intro: string;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <header className="relative isolate overflow-hidden border-b border-white/[0.08]">
      {/* Backdrop: blueprint grid + drawing market line */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(var(--theme-grid) 1px, transparent 1px), linear-gradient(90deg, var(--theme-grid) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        {/* Keep the complete tape in frame even when hero content changes its height. */}
        <svg
          viewBox="0 0 1228 400"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 z-0 h-[70%] w-full"
        >
          {CANDLES.map((c, i) => (
            <g key={i} opacity={reduce ? 0.12 : 0.16}>
              <line x1={c.x + 5} y1={360 - c.hi} x2={c.x + 5} y2={360 - c.lo}
                stroke={c.up ? "var(--color-bull-500)" : "var(--color-bear-500)"} strokeWidth="1" />
              <rect x={c.x} y={360 - c.top - c.h} width="10" height={c.h}
                fill={c.up ? "var(--color-bull-500)" : "var(--color-bear-500)"} opacity="0.55" />
            </g>
          ))}
          <motion.path
            d={LINE}
            fill="none"
            stroke="var(--color-gold-400)"
            strokeWidth="2"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.8, ease: "easeInOut", delay: 0.9 }}
          />
          <circle r="4" fill="var(--color-gold-400)" cx={LAST_CANDLE.x + 5} cy={360 - LAST_CANDLE.top}>
            {!reduce && (
              <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
            )}
          </circle>
        </svg>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-24 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8 lg:pb-32">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-mono text-[11px] uppercase tracking-[0.35em] text-gold-400"
        >
          {eyebrow}
        </motion.p>

        <h1 className="mt-4 font-display text-5xl leading-[1.02] text-stone-100 sm:text-7xl lg:text-8xl">
          {titleLines.map((line, i) => (
            <span key={line} className="block pb-1">
              <motion.span
                className="block"
                initial={reduce ? false : { y: 24 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.12 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Gold rule draws under the headline */}
        <motion.div
          aria-hidden
          className="mt-10 h-px origin-left bg-gradient-to-r from-gold-400 to-transparent"
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.8 }}
        />

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 1.05 }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-stone-400"
        >
          {intro}
        </motion.p>

        {children && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 1.18 }}
            className="mt-10"
          >
            {children}
          </motion.div>
        )}
      </div>
    </header>
  );
}
