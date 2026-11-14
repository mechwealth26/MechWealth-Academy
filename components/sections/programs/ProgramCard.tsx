"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ClickableCardAccent,
  ClickableCardArrow,
  clickableCardInteraction,
} from "@/components/ui/ClickableCard";
import { getCanvasPalette } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Program, ProgramVisualKind } from "@/data/programs";

/* ------------------------------------------------------------------ */
/*  Mini market visuals — one bespoke animated motif per program.      */
/*  Thin-line editorial style; motion accelerates gently on hover.     */
/* ------------------------------------------------------------------ */

let BULL = "#0fae7d";
let BEAR = "#b03636";
let GOLD = "#d4af37";
let STEEL = "#8fa3bf";
let IVORY = "#cfccc2";
let FAINT = "rgba(244,242,236,0.07)";
let HOT = "#eafff5";

function syncThemeColors() {
  const palette = getCanvasPalette();
  BULL = palette.bull;
  BEAR = palette.bear;
  GOLD = palette.gold;
  STEEL = palette.steel;
  IVORY = palette.ivory;
  FAINT = palette.faint;
  HOT = palette.isLight ? "#ffffff" : "#eafff5";
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexA(hex: string, a: number): string {
  const clamped = Math.max(0, Math.min(1, a));
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${clamped.toFixed(3)})`;
}

function ramp(v: number, a: number, b: number) {
  return Math.min(1, Math.max(0, (v - a) / (b - a)));
}

function ease(v: number) {
  return v * v * (3 - 2 * v);
}

interface MiniCandle {
  o: number;
  h: number;
  l: number;
  c: number;
}

function genCandles(n: number, seed: number, drift = 0.35): MiniCandle[] {
  const rand = mulberry32(seed);
  const out: MiniCandle[] = [];
  let price = 50;
  for (let i = 0; i < n; i++) {
    const o = price;
    const c = o + drift + (rand() - 0.5) * 4.2;
    const h = Math.max(o, c) + rand() * 2.4;
    const l = Math.min(o, c) - rand() * 2.4;
    out.push({ o, h, l, c });
    price = c;
  }
  return out;
}

function bounds(candles: MiniCandle[]) {
  let min = Infinity;
  let max = -Infinity;
  for (const c of candles) {
    min = Math.min(min, c.l);
    max = Math.max(max, c.h);
  }
  return { min, max };
}

type YFn = (v: number) => number;

/** Candle drawer shared by the motifs. Bull bodies filled, bears hollow. */
function candle(
  ctx: CanvasRenderingContext2D,
  cd: MiniCandle,
  x: number,
  bodyW: number,
  Y: YFn,
  alpha: number,
  colorOverride?: string
) {
  const bull = cd.c >= cd.o;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = colorOverride ?? (bull ? BULL : BEAR);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, Y(cd.h));
  ctx.lineTo(x, Y(cd.l));
  ctx.stroke();

  const yo = Y(cd.o);
  const yc = Y(cd.c);
  const top = Math.min(yo, yc);
  const bh = Math.max(Math.abs(yc - yo), 1);
  if (bull || colorOverride) {
    ctx.fillStyle = colorOverride ?? BULL;
    ctx.fillRect(x - bodyW / 2, top, bodyW, bh);
  } else {
    ctx.strokeRect(x - bodyW / 2, top, bodyW, bh);
  }
  ctx.globalAlpha = 1;
}

type Motif = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
) => void;

const PAD = 10;

/** 01 · Foundations — candles print one by one, then the tape resets. */
function drawFoundations(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const candles = genCandles(24, 11);
  const { min, max } = bounds(candles);
  const Y: YFn = (v) => PAD + (1 - (v - min) / (max - min)) * (h - PAD * 2);
  const step = (w - 24) / candles.length;
  const bodyW = Math.max(3, step * 0.5);

  // Baseline hairline
  ctx.strokeStyle = FAINT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(12, h - PAD);
  ctx.lineTo(w - 12, h - PAD);
  ctx.stroke();

  const cycle = (t * 5) % (candles.length + 8);
  candles.forEach((cd, i) => {
    const alpha = Math.min(1, Math.max(0, cycle - i));
    if (alpha <= 0) return;
    candle(ctx, cd, 12 + step * (i + 0.5), bodyW, Y, alpha * 0.9);
  });
}

/** 02 · Technical — a choreographed analysis sequence on loop:
 *  the price line draws itself, levels fade in, a trendline connects the
 *  lows, then a gold scan dot sweeps the chart reading the structure. */
function drawTechnical(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const candles = genCandles(30, 22, 0.55);
  const { min, max } = bounds(candles);
  const Y: YFn = (v) => PAD + (1 - (v - min) / (max - min)) * (h - PAD * 2);
  const X = (i: number) => 12 + ((w - 24) / (candles.length - 1)) * i;
  const n = candles.length;

  const D = 9; // cycle length (s)
  const c = t % D;
  const gAlpha = Math.min(1, c * 2.5) * (1 - ramp(c, D - 0.8, D));

  const drawP = ease(ramp(c, 0.2, 3)); // price line draws itself
  const levelsP = ramp(c, 2.4, 3.4); // levels fade in
  const trendP = ease(ramp(c, 3.6, 5)); // trendline draws
  const sweep = ramp(c, 5.2, 7.6); // scan dot sweep

  // Price line — partial draw with a bright leading edge
  const lastIdx = drawP * (n - 1);
  const iFull = Math.min(Math.floor(lastIdx), n - 1);
  const frac = lastIdx - iFull;
  ctx.strokeStyle = hexA(IVORY, 0.6 * gAlpha);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= iFull; i++) {
    const x = X(i);
    const y = Y(candles[i].c);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  if (iFull < n - 1) {
    const x = X(iFull) + (X(iFull + 1) - X(iFull)) * frac;
    const y =
      Y(candles[iFull].c) + (Y(candles[iFull + 1].c) - Y(candles[iFull].c)) * frac;
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Support & resistance — dashed, breathing once revealed
  const rY = Y(max - 1.4);
  const sY = Y(min + 1.4);
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = hexA(GOLD, (0.35 + 0.2 * Math.sin(t * 3)) * levelsP * gAlpha);
  ctx.beginPath();
  ctx.moveTo(12, rY);
  ctx.lineTo(w - 12, rY);
  ctx.stroke();
  ctx.strokeStyle = hexA(BULL, 0.3 * levelsP * gAlpha);
  ctx.beginPath();
  ctx.moveTo(12, sY);
  ctx.lineTo(w - 12, sY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Trendline through the lows, drawn progressively
  const l1 = candles[4];
  const l2 = candles[18];
  const slope = (l2.l - l1.l) / (18 - 4);
  const tx1 = X(2);
  const tx2 = tx1 + (X(29) - X(2)) * trendP;
  ctx.setLineDash([4, 7]);
  ctx.strokeStyle = hexA(GOLD, 0.55 * gAlpha);
  ctx.beginPath();
  ctx.moveTo(tx1, Y(l1.l + slope * -2));
  ctx.lineTo(tx2, Y(l1.l + slope * -2 + slope * ((tx2 - tx1) / ((X(29) - X(2)) / 27))));
  ctx.stroke();
  ctx.setLineDash([]);

  // Swing-point markers
  ctx.fillStyle = hexA(IVORY, 0.55 * levelsP * gAlpha);
  for (const i of [4, 9, 14, 18, 24]) {
    ctx.beginPath();
    ctx.arc(X(i), Y(candles[i].c), 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Scan dot sweeping along the price line
  const si = sweep * (n - 1);
  const si0 = Math.min(Math.floor(si), n - 2);
  const sf = si - si0;
  const sx = X(si0) + (X(si0 + 1) - X(si0)) * sf;
  const sy =
    Y(candles[si0].c) + (Y(candles[si0 + 1].c) - Y(candles[si0].c)) * sf;
  const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 9);
  g.addColorStop(0, hexA(GOLD, 0.9 * gAlpha));
  g.addColorStop(1, hexA(GOLD, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(sx, sy, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexA("#ffd97a", gAlpha);
  ctx.beginPath();
  ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
  ctx.fill();
}

/** 03 · Price Action — dim tape with a sliding pattern spotlight. */
function drawPriceAction(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const candles = genCandles(22, 33, 0.15);
  const { min, max } = bounds(candles);
  const Y: YFn = (v) => PAD + (1 - (v - min) / (max - min)) * (h - PAD * 2);
  const step = (w - 24) / candles.length;
  const bodyW = Math.max(3, step * 0.5);

  candles.forEach((cd, i) => {
    candle(ctx, cd, 12 + step * (i + 0.5), bodyW, Y, 0.38);
  });

  // Sliding gold spotlight — a "pattern" travelling through the tape
  const hk = (t * 1.4) % candles.length;
  const x = 12 + step * (hk + 0.5);
  const idx = Math.min(candles.length - 1, Math.round(hk));

  candle(ctx, candles[idx], x, bodyW * 1.15, Y, 0.95, GOLD);
  ctx.strokeStyle = hexA(GOLD, 0.55 + 0.35 * Math.sin(t * 4));
  ctx.strokeRect(
    x - step / 2 - 3,
    Y(candles[idx].h) - 6,
    step + 6,
    Y(candles[idx].l) - Y(candles[idx].h) + 12
  );
}

/** 04 · Advanced — two moving averages weaving and crossing. */
function drawAdvanced(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const N = 60;
  const mid = h / 2;
  const f: number[] = [];
  const s: number[] = [];
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    f.push(mid + Math.sin(x * 7 + t * 1.5) * h * 0.16 + Math.sin(x * 17 + t) * h * 0.05);
    s.push(mid + Math.sin(x * 7 - t * 0.9 + 2.1) * h * 0.16);
  }
  const X = (i: number) => 12 + ((w - 24) / N) * i;

  ctx.lineWidth = 1.3;
  ctx.strokeStyle = STEEL;
  ctx.beginPath();
  s.forEach((v, i) => (i === 0 ? ctx.moveTo(X(i), v) : ctx.lineTo(X(i), v)));
  ctx.stroke();

  ctx.strokeStyle = GOLD;
  ctx.beginPath();
  f.forEach((v, i) => (i === 0 ? ctx.moveTo(X(i), v) : ctx.lineTo(X(i), v)));
  ctx.stroke();

  // Soft glow dots at crossovers
  for (let i = 1; i <= N; i++) {
    const dPrev = f[i - 1] - s[i - 1];
    const dNow = f[i] - s[i];
    if (dPrev * dNow < 0 || dNow === 0) {
      const x = X(i);
      const y = (f[i] + s[i]) / 2;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
      g.addColorStop(0, hexA(GOLD, 0.85));
      g.addColorStop(1, hexA(GOLD, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** 05 · Risk — the equity curve draws itself with a glowing head,
 *  drawdowns shade in as they happen, and the deepest dip pulses once
 *  passed — risk made visible. */
function drawRisk(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const rand = mulberry32(77);
  const N = 48;
  let eq = 50;
  let peak = eq;
  const pts: { v: number; peak: number }[] = [];
  for (let i = 0; i <= N; i++) {
    eq += rand() < 0.72 ? 0.6 + rand() * 1.4 : -(1.5 + rand() * 3.4);
    peak = Math.max(peak, eq);
    pts.push({ v: eq, peak });
  }
  const min = Math.min(...pts.map((p) => p.v)) - 2;
  const max = Math.max(...pts.map((p) => p.peak)) + 2;
  const Y: YFn = (v) => PAD + (1 - (v - min) / (max - min)) * (h - PAD * 2);
  const X = (i: number) => 12 + ((w - 24) / N) * i;

  const D = 10; // cycle length (s)
  const c = t % D;
  const gAlpha = Math.min(1, c * 2.5) * (1 - ramp(c, D - 0.9, D));
  const head = ease(ramp(c, 0.2, 4.5)) * N;
  const headI = Math.min(Math.floor(head), N);
  const headF = head - headI;

  // Deepest drawdown point — pulses softly once the curve has passed it
  let ddIdx = -1;
  let ddDepth = 0;
  for (let i = 1; i <= N; i++) {
    const depth = pts[i].peak - pts[i].v;
    if (depth > ddDepth) {
      ddDepth = depth;
      ddIdx = i;
    }
  }

  // Drawdown shading appears as the curve draws past each segment
  for (let i = 1; i <= headI; i++) {
    if (pts[i].v >= pts[i].peak) continue;
    ctx.fillStyle = hexA(BEAR, 0.16 * gAlpha);
    ctx.fillRect(
      X(i - 1),
      Y(pts[i].peak),
      X(i) - X(i - 1) + 0.5,
      Y(pts[i].v) - Y(pts[i].peak)
    );
  }

  // Deepest-drawdown pulse
  if (ddIdx >= 0 && headI > ddIdx) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.6);
    const dx = X(ddIdx);
    const dy = Y(pts[ddIdx].v);
    const g = ctx.createRadialGradient(dx, dy, 0, dx, dy, 14);
    g.addColorStop(0, hexA(BEAR, 0.4 * pulse * gAlpha));
    g.addColorStop(1, hexA(BEAR, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(dx, dy, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  // Running-peak dashed line, drawn with the curve
  ctx.setLineDash([3, 5]);
  ctx.strokeStyle = hexA(IVORY, 0.32 * gAlpha);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= headI; i++) {
    const x = X(i);
    const y = Y(pts[i].peak);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Equity curve, drawn progressively
  ctx.strokeStyle = BULL;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let i = 0; i <= headI; i++) {
    const x = X(i);
    const y = Y(pts[i].v);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  if (headI < N) {
    const x = X(headI) + (X(headI + 1) - X(headI)) * headF;
    const y = Y(pts[headI].v) + (Y(pts[headI + 1].v) - Y(pts[headI].v)) * headF;
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Glowing head dot riding the curve
  const hx = X(headI) + (headI < N ? (X(headI + 1) - X(headI)) * headF : 0);
  const hy =
    Y(pts[headI].v) +
    (headI < N ? (Y(pts[headI + 1].v) - Y(pts[headI].v)) * headF : 0);
  const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 10);
  g.addColorStop(0, hexA(HOT, 0.95 * gAlpha));
  g.addColorStop(1, hexA(BULL, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(hx, hy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexA(HOT, gAlpha);
  ctx.beginPath();
  ctx.arc(hx, hy, 2.2, 0, Math.PI * 2);
  ctx.fill();
}

const MOTIFS: Record<ProgramVisualKind, Motif> = {
  foundations: drawFoundations,
  technical: drawTechnical,
  priceaction: drawPriceAction,
  advanced: drawAdvanced,
  risk: drawRisk,
};

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

export function ProgramCard({
  program,
  index,
  href,
}: {
  program: Program;
  index: number;
  href: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const hoverRef = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const motif = MOTIFS[program.visual];

    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = box.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(() => {
      resize();
      // Reduced-motion path draws a single static frame: without redrawing
      // here the canvas would go blank on every container resize.
      if (reduced && w > 0) {
        syncThemeColors();
        ctx.clearRect(0, 0, w, h);
        motif(ctx, w, h, 8);
      }
    });
    ro.observe(box);

    let visible = true;
    let raf = 0;
    let last = performance.now();
    let tt = 4; // start mid-story so cards never look empty
    let speed = 1;

    const loop = (now: number) => {
      if (!visible) {
        raf = 0;
        last = now;
        return;
      }
      if (w === 0) {
        last = now;
        raf = requestAnimationFrame(loop);
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Hover eases the animation faster/brighter rather than snapping
      speed += (1 + hoverRef.current * 1.3 - speed) * Math.min(1, dt * 5);
      tt += dt * speed;

      ctx.clearRect(0, 0, w, h);
      syncThemeColors();
      ctx.globalAlpha = 1 + hoverRef.current * 0.15;
      motif(ctx, w, h, tt);
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      // Respect reduced motion: render a single static frame
      resize();
      syncThemeColors();
      ctx.clearRect(0, 0, w, h);
      motif(ctx, w, h, 8);
      const onThemeChange = () => {
        syncThemeColors();
        ctx.clearRect(0, 0, w, h);
        motif(ctx, w, h, 8);
      };
      window.addEventListener("mechwealth:theme-change", onThemeChange);
      return () => {
        ro.disconnect();
        window.removeEventListener("mechwealth:theme-change", onThemeChange);
      };
    }

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
      { rootMargin: "80px" }
    );
    io.observe(box);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [program.visual, reduced]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link
        href={href}
        aria-label={`Explore ${program.title}`}
        onMouseEnter={() => (hoverRef.current = 1)}
        onMouseLeave={() => (hoverRef.current = 0)}
        onFocus={() => (hoverRef.current = 1)}
        onBlur={() => (hoverRef.current = 0)}
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-b from-ink-900 to-ink-950 p-7",
          clickableCardInteraction
        )}
      >
        <ClickableCardAccent />
        <div className="flex items-baseline justify-between">
        <span className="font-mono text-xs tracking-[0.3em] text-gold-500/80 transition-colors duration-300 group-hover:text-gold-400">
          {program.num}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-copy-muted">
          {program.tag}
        </span>
        </div>

        <h3 className="mt-7 font-display text-xl font-semibold tracking-wide text-cream-100 transition-colors duration-300 group-hover:text-gold-400">
          {program.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-cream-500 transition-colors duration-300 group-hover:text-cream-300">
          {program.description}
        </p>

        <div ref={boxRef} className="relative mt-8 h-28" aria-hidden>
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/5 transition-colors duration-300 group-hover:bg-gold-500/30" />
        </div>

        <span className="mt-6 pr-10 font-mono text-[9px] uppercase tracking-[0.22em] text-cream-500 transition-colors duration-300 group-hover:text-gold-400">
          Explore program
        </span>
        <ClickableCardArrow />
      </Link>
    </motion.div>
  );
}

export default ProgramCard;
