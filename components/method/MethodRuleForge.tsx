"use client";

import { useEffect, useRef } from "react";
import { getCanvasPalette } from "@/lib/theme";

let BEAR = "#b03636";
let BULL = "#0fae7d";
let GOLD = "#e8c96a";
let IVORY = "#cfccc2";

/**
 * The Method experience: a vague trading sentence is deconstructed word by
 * word, rebuilt into a structured rule, tested on an illustrative chart, and
 * summarised as evidence. Scroll drives every phase. Illustrative data only.
 */

const QUOTE = "A rule you can't test isn't a rule.";
const VAGUE = "\u201CBuy when it looks strong near support.\u201D";

const WORDS = [
  { w: "STRONG", q: "Strong compared to what? Measured how?" },
  { w: "SUPPORT", q: "Which level? Which timeframe? How wide?" },
  { w: "ENTRY", q: "At the touch? On a close back above?" },
  { w: "RISK", q: "Where exactly are you wrong — in price?" },
  { w: "TEST", q: "Would this have worked? Says who? How often?" },
];

const RULE_LINES = [
  ["DIRECTION", "Long — only while daily structure holds higher lows"],
  ["CONDITION", "Prior swing low has held at least twice"],
  ["LOCATION", "Price inside the support zone (not a single line)"],
  ["ENTRY", "Daily close back above the zone's upper edge"],
  ["RISK", "Below the zone's lower edge — defined before entry"],
  ["EXIT", "At 2× risk, or on a daily close back below the zone"],
];

/** Phase boundaries over total progress [0..1]. */
const P = {
  quote: [0, 0.1],
  words: [0.1, 0.42],
  rule: [0.42, 0.55],
  test: [0.62, 0.85],
  evidence: [0.85, 1],
} as const;

const INITIAL_STORY_CANDLES = 16;

export default function MethodRuleForge() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef(0);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll progress (rAF-throttled)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight, 1);
      progressRef.current = Math.min(1, Math.max(0, -rect.top / total));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Caption crossfades driven directly via style (no React re-renders)
  useEffect(() => {
    // Skip style writes while the section is offscreen
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      rootMargin: "200px",
    });
    if (wrapRef.current) io.observe(wrapRef.current);

    let raf = 0;
    const fade = (
      el: HTMLDivElement | null,
      range: readonly number[],
      p: number,
      rise = 10
    ) => {
      if (!el) return;
      const [a, b] = range;
      let o = 0;
      if (p >= a && p <= b) {
        const fadeIn = Math.min(1, (p - a) / 0.03);
        const fadeOut = b >= 0.99 ? 1 : Math.min(1, (b - p) / 0.03);
        o = Math.min(fadeIn, fadeOut);
      }
      el.style.opacity = String(o);
      el.style.transform = `translateY(${(1 - o) * rise}px)`;
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const p = progressRef.current;
      fade(captionRefs.current[0], P.quote, p, 6);
      captionRefs.current.slice(1, 6).forEach((el, i) => {
        const span = (P.words[1] - P.words[0]) / 5;
        const start = P.words[0] + i * span;
        fade(el, [start, start + span + 0.02], p);
      });
      fade(captionRefs.current[6], P.rule, p);
      fade(captionRefs.current[7], [P.evidence[0], 1.01], p);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  // Animated illustrative chart, phase-driven by scroll
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let seed = 4021;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const candles: { o: number; h: number; l: number; c: number }[] = [];
    let price = 100;
    for (let i = 0; i < 120; i++) {
      const wave =
        Math.sin(i * 0.16) * 3 + Math.sin(i * 0.045 + 1.4) * 2.6 - i * 0.01;
      const o = price;
      const c = 100 + wave + (rand() - 0.5) * 1.1;
      candles.push({
        o,
        c,
        h: Math.max(o, c) + rand() * 0.9,
        l: Math.min(o, c) - rand() * 0.9,
      });
      price = c;
    }
    // Illustrative test outcomes at fixed indices (drawn for teaching)
    const setups = [
      { i: 22, win: true },
      { i: 41, win: false },
      { i: 63, win: true },
      { i: 84, win: false },
      { i: 102, win: true },
    ];

    const smooth = (v: number) => 1 - (1 - v) * (1 - v);
    const seg = (p: number, a: number, b: number) =>
      Math.min(1, Math.max(0, (p - a) / Math.max(b - a, 1e-6)));

    // Skip heavy drawing while the section is far offscreen
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      rootMargin: "240px",
    });
    if (wrapRef.current) io.observe(wrapRef.current);

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible) return;

      const palette = getCanvasPalette();
      BEAR = palette.bear;
      BULL = palette.bull;
      GOLD = palette.gold;
      IVORY = palette.ivory;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const p = progressRef.current;

      const padX = 60;
      const padY = h * 0.18;
      let lo = Infinity;
      let hi = -Infinity;
      for (const c of candles) {
        lo = Math.min(lo, c.l);
        hi = Math.max(hi, c.h);
      }
      const Y = (v: number) =>
        padY + (1 - (v - lo) / (hi - lo)) * (h - padY * 2);

      // Single-setup view before testing; full tape during testing
      const detail = p < 0.62;
      const count = detail ? 46 : candles.length;
      const start = detail ? 8 : 0;
      const cw = (w - padX * 2) / count;
      const wordSpan = (P.words[1] - P.words[0]) / WORDS.length;
      const completedWordSteps = Math.min(
        WORDS.length,
        Math.max(0, (p - P.words[0]) / wordSpan)
      );
      const ruleStep = seg(p, P.rule[0], P.rule[1]);
      const narrativeReveal =
        INITIAL_STORY_CANDLES + completedWordSteps + ruleStep;
      const revealCount = detail
        ? p < P.rule[1]
          ? narrativeReveal
          : narrativeReveal +
            seg(p, P.rule[1], P.test[0]) * (count - narrativeReveal)
        : count;
      const completeCandles = Math.min(count, Math.floor(revealCount));
      const formingIndex = Math.min(completeCandles, count - 1);
      const formingProgress = smooth(revealCount - completeCandles);

      ctx.globalAlpha = detail ? 0.9 : 0.75;
      for (let k = 0; k < count; k++) {
        const growth =
          k < completeCandles
            ? 1
            : k === formingIndex
              ? formingProgress
              : 0;
        if (growth <= 0) continue;
        const cd = candles[start + k];
        if (!cd) break;
        const x = padX + cw * (k + 0.5);
        const up = cd.c >= cd.o;
        const isForming = k === formingIndex && growth < 1;
        const candleColor = isForming ? GOLD : up ? BULL : BEAR;
        const openY = Y(cd.o);
        const closeY = openY + (Y(cd.c) - openY) * growth;
        const highY = openY + (Y(cd.h) - openY) * growth;
        const lowY = openY + (Y(cd.l) - openY) * growth;
        ctx.strokeStyle = candleColor;
        ctx.fillStyle = candleColor;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();
        const top = Math.min(openY, closeY);
        ctx.fillRect(
          x - cw * 0.28,
          top,
          cw * 0.56,
          Math.max(Math.abs(openY - closeY), 1.5)
        );
      }
      ctx.globalAlpha = 1;

      // Support zone + annotations while the rule assembles
      if (detail && p > 0.46 && p < 0.66) {
        const a = smooth(seg(p, 0.46, 0.52));
        const zx1 = padX + cw * 12;
        const zx2 = padX + cw * 34;
        const zTop = Y(97.2);
        const zBot = Y(95.4);
        ctx.fillStyle = BULL;
        ctx.globalAlpha = 0.1 * a;
        ctx.fillRect(zx1, zTop, zx2 - zx1, zBot - zTop);
        ctx.globalAlpha = 0.7 * a;
        ctx.strokeStyle = BULL;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(zx1, zTop, zx2 - zx1, zBot - zTop);
        ctx.setLineDash([]);
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillStyle = BULL;
        ctx.textAlign = "left";
        ctx.fillText("SUPPORT ZONE", zx1 + 4, zBot + 14);
        ctx.globalAlpha = 1;

        const b = smooth(seg(p, 0.53, 0.6));
        if (b > 0) {
          const ex = padX + cw * 30.5;
          const entryY = Y(97.6);
          ctx.globalAlpha = b;
          ctx.fillStyle = GOLD;
          ctx.beginPath();
          ctx.moveTo(ex, entryY - 10);
          ctx.lineTo(ex - 6, entryY);
          ctx.lineTo(ex + 6, entryY);
          ctx.closePath();
          ctx.fill();
          ctx.font = "10px ui-monospace, monospace";
          ctx.textAlign = "center";
          ctx.fillText("ENTRY", ex, entryY - 16);

          const riskY = Y(95.2);
          const exitY = Y(102.4);
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = BEAR;
          ctx.beginPath();
          ctx.moveTo(padX, riskY);
          ctx.lineTo(w - padX, riskY);
          ctx.stroke();
          ctx.strokeStyle = GOLD;
          ctx.beginPath();
          ctx.moveTo(padX, exitY);
          ctx.lineTo(w - padX, exitY);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = BEAR;
          ctx.fillText("RISK", ex, riskY + 14);
          ctx.fillStyle = GOLD;
          ctx.fillText("EXIT", ex, exitY - 10);
          ctx.globalAlpha = 1;
        }
      }

      // Test phase: outcome chips over each setup across the full tape
      if (!detail && p > 0.64) {
        const chipA = smooth(seg(p, 0.64, 0.78));
        setups.forEach((s, si) => {
          const x = padX + cw * (s.i + 0.5);
          const y = Y(candles[s.i].l) + 30;
          const o = Math.min(1, Math.max(0, chipA * setups.length - si));
          if (o <= 0) return;
          ctx.globalAlpha = o;
          ctx.fillStyle = s.win ? BULL : BEAR;
          ctx.strokeStyle = s.win ? BULL : BEAR;
          ctx.font = "bold 11px ui-monospace, monospace";
          ctx.textAlign = "center";
          ctx.fillText(s.win ? "W" : "L", x, y + 3);
          ctx.lineWidth = 1;
          ctx.strokeRect(x - 8, y - 9, 16, 15);
        });
        ctx.globalAlpha = 1;

        // Evidence tally
        const ev = smooth(seg(p, 0.85, 0.92));
        if (ev > 0) {
          const wins = setups.filter((s) => s.win).length;
          ctx.globalAlpha = ev;
          ctx.font = "12px ui-monospace, monospace";
          ctx.fillStyle = IVORY;
          ctx.textAlign = "left";
          const bx = padX;
          const by = h - 46;
          ctx.fillText(
            `ILLUSTRATIVE SAMPLE — ${setups.length} SETUPS · ${wins}W / ${setups.length - wins}L`,
            bx,
            by
          );
          ctx.font = "10px ui-monospace, monospace";
          ctx.globalAlpha = ev * 0.55;
          ctx.fillStyle = IVORY;
          ctx.fillText(
            "DRAWN FOR TEACHING. NOT REAL DATA, NOT PERFORMANCE, NOT ADVICE.",
            bx,
            by + 20
          );
          ctx.globalAlpha = 1;
        }
      }

    };
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <section aria-label="From idea to rule" className="relative">
      <div ref={wrapRef} className="relative h-[520vh]">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <canvas
            ref={canvasRef}
            aria-hidden
            className="absolute inset-0 h-full w-full"
          />
          <div
            aria-hidden
            className="theme-vignette pointer-events-none absolute inset-0"
          />

          {/* Captions */}
          <div className="pointer-events-none relative mx-auto w-full max-w-3xl px-6 text-center">
            <div
              ref={(el) => {
                captionRefs.current[0] = el;
              }}
              style={{ opacity: 0 }}
              className="mx-auto max-w-3xl bg-ink-950/45 px-5 py-7 backdrop-blur-[3px] shadow-[0_0_64px_28px_var(--theme-shadow)] [border-radius:var(--radius-lg)] sm:px-8"
            >
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-gold-400">
                The method philosophy
              </p>
              <h2 className="mt-4 font-display text-3xl uppercase tracking-wide text-cream-50 md:text-5xl">
                &ldquo;{QUOTE}&rdquo;
              </h2>
              <p className="mt-8 font-mono text-sm text-copy-secondary md:text-base">
                {VAGUE}
              </p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.25em] text-copy-muted">
                Every word is doing something. Let&apos;s find out what.
              </p>
            </div>

            {WORDS.map((item, i) => (
              <div
                key={item.w}
                ref={(el) => {
                  captionRefs.current[i + 1] = el;
                }}
                style={{ opacity: 0 }}
                className="absolute inset-x-4 top-1/2 mx-auto max-w-xl -translate-y-1/2 bg-ink-950/45 px-5 py-8 backdrop-blur-[3px] shadow-[0_0_64px_28px_var(--theme-shadow)] [border-radius:var(--radius-lg)] sm:inset-x-6 sm:px-8"
              >
                <p className="font-display text-5xl uppercase tracking-tight text-gold-400 md:text-7xl">
                  {item.w}
                </p>
                <p className="mx-auto mt-5 max-w-md font-mono text-sm leading-relaxed text-cream-100/80">
                  {item.q}
                </p>
                <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-copy-muted">
                  Define it, or delete it
                </p>
              </div>
            ))}

            {/* Structured rule card */}
            <div
              ref={(el) => {
                captionRefs.current[6] = el;
              }}
              style={{ opacity: 0 }}
              className="absolute inset-x-4 top-1/2 mx-auto max-w-xl -translate-y-1/2 border border-white/10 bg-ink-950/80 p-7 text-left backdrop-blur-md md:p-9"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold-400">
                The vague idea, engineered
              </p>
              <dl className="mt-5 space-y-3">
                {RULE_LINES.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                  >
                    <dt className="w-24 shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-gold-400/90">
                      {k}
                    </dt>
                    <dd className="text-sm leading-snug text-cream-100/85">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Evidence note */}
            <div
              ref={(el) => {
                captionRefs.current[7] = el;
              }}
              style={{ opacity: 0 }}
              className="absolute inset-x-4 bottom-14 mx-auto max-w-2xl bg-ink-950/45 px-5 py-4 backdrop-blur-[3px] shadow-[0_0_52px_20px_var(--theme-shadow)] [border-radius:var(--radius-lg)] sm:inset-x-6 sm:px-8"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold-400">
                Idea → definition → rule → test → evidence
              </p>
              <p className="mt-3 font-mono text-xs leading-relaxed text-copy-secondary">
                The chart behind this shows one illustrative example. Its
                numbers are drawn for teaching — they are not performance and
                they promise nothing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
