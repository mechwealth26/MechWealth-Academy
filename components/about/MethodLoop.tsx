"use client";

import { useEffect, useRef } from "react";
import { TEACHING_METHOD as STEPS } from "@/data/teachingMethod";

/**
 * The academy's method as a living diagram:
 * Observe → Define → Test → Learn → Improve.
 * A quiet gold pulse travels the loop; nodes brighten as it passes.
 * Pure SVG driven by rAF through refs — no React re-renders per frame.
 */

export default function MethodLoop() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const loopPathRef = useRef<SVGPathElement>(null);
  const glowRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const pulse = pulseRef.current;
    if (!wrap || !pulse) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      STEPS.forEach((_, i) => {
        const g = glowRefs.current[i];
        if (g) g.setAttribute("opacity", i === 2 ? "1" : "0.35");
      });
      return;
    }

    let raf = 0;
    let t = 0;
    // Pulse travels node→node; dwells a moment on each
    const DWELL = 90;
    const TRAVEL = 55;
    const SEG = DWELL + TRAVEL;
    const TOTAL = SEG * STEPS.length;

    const tick = () => {
      t = (t + 1) % TOTAL;
      const segIndex = Math.floor(t / SEG);
      const local = t % SEG;
      const next = (segIndex + 1) % STEPS.length;
      const k =
        local < DWELL ? 0 : (local - DWELL) / TRAVEL;

      const path = loopPathRef.current;
      if (
        segIndex === STEPS.length - 1 &&
        path &&
        typeof path.getTotalLength === "function" &&
        path.getTotalLength() > 0
      ) {
        // Improve → Observe: ride the drawn loop-back around the bottom
        // edge instead of shooting straight across through every node.
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(
          Math.min(1, Math.max(0, k)) * len
        );
        pulse.setAttribute("cx", String(pt.x));
        pulse.setAttribute("cy", String(pt.y));
      } else {
        const x1 = 100 + segIndex * 200;
        const x2 = 100 + next * 200;
        // gentle arc while travelling
        const lift = Math.sin(k * Math.PI) * 26;
        pulse.setAttribute("cx", String(x1 + (x2 - x1) * k));
        pulse.setAttribute("cy", String(70 - lift));
      }
      pulse.setAttribute("opacity", String(0.9));

      glowRefs.current.forEach((g, i) => {
        if (!g) return;
        const active = i === segIndex ? 1 : i === next && k > 0.6 ? 0.7 : 0.3;
        g.setAttribute("opacity", String(active));
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <svg
        viewBox="0 0 1000 190"
        className="hidden w-full sm:block"
        role="img"
        aria-label="The MECHWEALTH method: Observe, Define, Test, Learn, Improve — a continuous loop."
      >
        {/* Blueprint grid */}
        <defs>
          <pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--theme-border)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="1000" height="190" fill="url(#bp-grid)" />

        {/* Connectors */}
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={100 + i * 200}
            y1={70}
            x2={300 + i * 200}
            y2={70}
            stroke="var(--color-gold-400)"
            opacity="0.25"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
        ))}
        {/* Loop-back connector */}
        <path
          ref={loopPathRef}
          d="M 900 70 C 960 70 980 130 900 150 L 140 150 C 60 150 40 110 100 70"
          fill="none"
          stroke="var(--color-cream-300)"
          opacity="0.18"
          strokeWidth="1"
          strokeDasharray="3 7"
        />
        <text
          x={500}
          y={172}
          textAnchor="middle"
          fill="var(--color-cream-500)"
          fontSize="11"
          fontFamily="ui-monospace, monospace"
          letterSpacing="3"
        >
          AND AGAIN
        </text>

        {/* Nodes */}
        {STEPS.map((s, i) => (
          <g key={s.label}>
            <circle
              ref={(el) => {
                glowRefs.current[i] = el;
              }}
              cx={100 + i * 200}
              cy={70}
              r={30}
              fill="none"
              stroke="var(--color-gold-400)"
              strokeWidth="1.5"
              opacity={0.3}
            />
            <circle cx={100 + i * 200} cy={70} r={22} fill="var(--theme-surface)" stroke="var(--theme-border)" />
            <text
              x={100 + i * 200}
              y={75}
              textAnchor="middle"
              fill="var(--color-cream-300)"
              fontSize="13"
              fontFamily="ui-monospace, monospace"
            >
              {String(i + 1).padStart(2, "0")}
            </text>
            <text
              x={100 + i * 200}
              y={122}
              textAnchor="middle"
              fill="var(--color-cream-100)"
              fontSize="16"
              fontFamily="var(--font-display), serif"
            >
              {s.label}
            </text>
          </g>
        ))}

        {/* Travelling pulse */}
        <circle ref={pulseRef} r={5} fill="var(--color-gold-400)" opacity={0.9} />
      </svg>

      {/* Notes under each step */}
      <div className="mt-2 grid gap-4 sm:grid-cols-5 sm:gap-3 sm:text-center">
        {STEPS.map((s) => (
          <p
            key={s.label}
            className="text-sm leading-6 text-copy-secondary sm:font-mono sm:text-[10px] sm:uppercase sm:tracking-[0.12em]"
          >
            <span className="mr-3 font-display text-base text-cream-100 sm:hidden">{s.label}</span>
            {s.note}
          </p>
        ))}
      </div>
    </div>
  );
}
