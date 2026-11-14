"use client";

import { useEffect, useRef } from "react";
import { getCanvasPalette } from "@/lib/theme";

/**
 * Restrained chart demonstrations for each Foundation lesson.
 * One small canvas, thin editorial lines, slow loops, no gimmicks.
 */

let BEAR = "#b03636";
let BULL = "#0fae7d";
let GOLD = "#e8c96a";
let IVORY = "#cfccc2";
let FAINT = "rgba(207,204,194,0.16)";

function alpha(hex: string, opacity: number) {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${opacity})`;
}

function syncThemeColors() {
  const palette = getCanvasPalette();
  BEAR = palette.bear;
  BULL = palette.bull;
  GOLD = palette.gold;
  IVORY = palette.ivory;
  FAINT = palette.faint;
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

function buildSeries(n: number) {
  const rand = mulberry32(202);
  const out: { o: number; h: number; l: number; c: number }[] = [];
  let price = 100;
  for (let i = 0; i < n; i++) {
    const wave = Math.sin(i * 0.42) * 2.4 + Math.sin(i * 0.13 + 1) * 1.6;
    const o = price;
    const c = 100 + wave + i * 0.12 + (rand() - 0.5) * 0.7;
    const h = Math.max(o, c) + rand() * 0.8;
    const l = Math.min(o, c) - rand() * 0.8;
    out.push({ o, h, l, c });
    price = c;
  }
  return out;
}

function drawCandle(
  ctx: CanvasRenderingContext2D,
  x: number,
  yO: number,
  yC: number,
  yH: number,
  yL: number,
  w: number,
  alpha: number,
  hot = false
) {
  const up = yC <= yO;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = hot ? GOLD : up ? BULL : BEAR;
  ctx.fillStyle = up ? BULL : BEAR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, yH);
  ctx.lineTo(x, yL);
  ctx.stroke();
  const top = Math.min(yO, yC);
  ctx.fillRect(x - w / 2, top, w, Math.max(Math.abs(yC - yO), 1.5));
  ctx.globalAlpha = 1;
}

export default function LessonDemo({
  variant,
  active,
  animate = true,
}: {
  variant: string;
  active: boolean;
  /** When false, draw a single static frame instead of looping (card previews). */
  animate?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const series = buildSeries(34);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    // Skip all drawing while this demo is far outside the viewport.
    // Without this, every lesson on the page keeps a live rAF+draw loop
    // running simultaneously (heavy jank on course pages).
    let visible = true;
    const io = new IntersectionObserver(
      ([e]) => {
        const was = visible;
        visible = e.isIntersecting;
        // Static-frame demos need an explicit repaint when they re-enter
        // the viewport (no self-scheduling loop to recover for them).
        if (!was && visible && !(animate && !reduce))
          raf = requestAnimationFrame(render);
      },
      { rootMargin: "120px" }
    );
    io.observe(canvas);

    const render = (t: number) => {
      syncThemeColors();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const loopsAgain = animate && !reduce;
      if (!visible || w === 0) {
        if (loopsAgain) raf = requestAnimationFrame(render);
        return;
      }
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const padX = 18;
      const padY = 22;
      const cw = (w - padX * 2) / series.length;
      let min = Infinity;
      let max = -Infinity;
      for (const c of series) {
        min = Math.min(min, c.l);
        max = Math.max(max, c.h);
      }
      const Y = (v: number) =>
        padY + (1 - (v - min) / (max - min)) * (h - padY * 2);
      const cycle = reduce ? 0.9 : (Math.sin(t * 0.00025) + 1) / 2;
      const reveal = reduce
        ? series.length
        : 4 + cycle * (series.length - 4);

      // Baseline grid
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      for (let g = 1; g < 4; g++) {
        const gy = padY + ((h - padY * 2) * g) / 4;
        ctx.beginPath();
        ctx.moveTo(padX, gy);
        ctx.lineTo(w - padX, gy);
        ctx.stroke();
      }

      const n = Math.max(1, Math.floor(reveal));

      if (variant === "chart") {
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const x = padX + cw * (i + 0.5);
          const y = Y((series[i].o + series[i].c) / 2);
          if (i === 0) ctx.moveTo(x, y);
          else {
            const px = padX + cw * (i - 0.5);
            const py = Y((series[i - 1].o + series[i - 1].c) / 2);
            ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
          }
        }
        ctx.stroke();
        if (n < series.length) {
          const lastY = Y((series[n - 1].o + series[n - 1].c) / 2);
          ctx.fillStyle = GOLD;
          ctx.beginPath();
          ctx.arc(padX + cw * (n - 0.5), lastY, 3, 0, 7);
          ctx.fill();
        }
        ctx.lineWidth = 1;
      } else if (variant === "candleAnatomy") {
        const up = cycle > 0.5;
        const cx = w / 2;
        const bodyTop = h * 0.3;
        const bodyBot = h * 0.68;
        const col = up ? BULL : BEAR;
        ctx.strokeStyle = col;
        ctx.fillStyle = col;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, h * 0.12);
        ctx.lineTo(cx, bodyBot);
        ctx.moveTo(cx, bodyTop);
        ctx.lineTo(cx, h * 0.88);
        ctx.stroke();
        ctx.globalAlpha = 0.9;
        ctx.fillRect(cx - 26, bodyTop, 52, bodyBot - bodyTop);
        ctx.globalAlpha = 1;
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillStyle = alpha(IVORY, 0.75);
        ctx.textAlign = "left";
        ctx.fillText("HIGH", cx + 44, h * 0.13);
        ctx.fillText(up ? "CLOSE" : "OPEN", cx + 44, bodyTop + 4);
        ctx.fillText(up ? "OPEN" : "CLOSE", cx + 44, bodyBot + 2);
        ctx.fillText("LOW", cx + 44, h * 0.89);
        ctx.strokeStyle = FAINT;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + 38, h * 0.11);
        ctx.lineTo(cx + 38, h * 0.9);
        ctx.stroke();
      } else if (variant === "rules") {
        // Dimmed tape + a rule checklist forming one line at a time
        ctx.globalAlpha = 0.22;
        for (let i = 0; i < series.length; i++) {
          const c = series[i];
          drawCandle(
            ctx,
            padX + cw * (i + 0.5),
            Y(c.o),
            Y(c.c),
            Y(c.h),
            Y(c.l),
            cw * 0.55,
            1
          );
        }
        ctx.globalAlpha = 1;
        const rules = [
          "Entry defined",
          "Exit defined",
          "Risk capped",
          "Size fixed",
        ];
        const shown = reduce ? 4 : Math.floor(cycle * 3.99);
        for (let r = 0; r <= shown && r < rules.length; r++) {
          const y = padY + 14 + r * 20;
          const on = r < shown;
          ctx.strokeStyle = on ? BULL : alpha(IVORY, 0.3);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(padX, y - 7, 10, 10);
          if (on) {
            ctx.beginPath();
            ctx.moveTo(padX + 2, y - 2);
            ctx.lineTo(padX + 4.5, y + 1);
            ctx.lineTo(padX + 9, y - 5);
            ctx.stroke();
          }
          ctx.font = "11px ui-monospace, monospace";
          ctx.fillStyle = alpha(IVORY, 0.85);
          ctx.textAlign = "left";
          ctx.fillText(rules[r], padX + 18, y + 3);
        }
        ctx.lineWidth = 1;
      } else if (
        variant === "backtest" ||
        variant === "probability" ||
        variant === "expectancy"
      ) {
        // Trade-by-trade result bars along a baseline
        const rand = mulberry32(77);
        const results: number[] = [];
        for (let i = 0; i < 24; i++) {
          results.push(rand() < 0.42 ? -(0.4 + rand()) : 0.6 + rand());
        }
        const baseY = h * (variant === "backtest" ? 0.72 : 0.62);
        const shown = reduce ? results.length : Math.floor(cycle * 23.99) + 1;
        let equity = 0;
        const pts: [number, number][] = [];
        for (let i = 0; i < shown; i++) {
          const v = results[i];
          equity += v;
          const x = padX + ((w - padX * 2) * (i + 0.5)) / results.length;
          const bh = Math.abs(v) * 12;
          ctx.fillStyle = v > 0 ? BULL : BEAR;
          ctx.globalAlpha = 0.8;
          if (v > 0) ctx.fillRect(x - 2, baseY - bh, 4, bh);
          else ctx.fillRect(x - 2, baseY, 4, bh);
          pts.push([x, baseY - equity * 6]);
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = FAINT;
        ctx.beginPath();
        ctx.moveTo(padX, baseY);
        ctx.lineTo(w - padX, baseY);
        ctx.stroke();

        if (variant === "backtest") {
          ctx.strokeStyle = GOLD;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          pts.forEach(([x, y], i) =>
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          );
          ctx.stroke();
          if (pts.length && !reduce) {
            const [lx, ly] = pts[pts.length - 1];
            ctx.fillStyle = GOLD;
            ctx.beginPath();
            ctx.arc(lx, ly, 3, 0, 7);
            ctx.fill();
          }
          ctx.lineWidth = 1;
        }
      } else if (variant === "probability") {
        // Histogram of trade outcomes with a mean marker
        const rand = mulberry32(77);
        const results: number[] = [];
        for (let i = 0; i < 24; i++)
          results.push(rand() < 0.42 ? -(0.4 + rand()) : 0.6 + rand());
        const baseY = h * 0.72;
        ctx.strokeStyle = FAINT;
        ctx.beginPath();
        ctx.moveTo(padX, baseY);
        ctx.lineTo(w - padX, baseY);
        ctx.stroke();
        const buckets = new Array(9).fill(0);
        for (const v of results)
          buckets[Math.min(8, Math.max(0, Math.floor(v * 3) + 4))]++;
        const bw = (w - padX * 2) / buckets.length;
        const maxB = Math.max(...buckets, 1);
        const grow = reduce ? 1 : cycle;
        buckets.forEach((b, i) => {
          const bh2 = (b / maxB) * h * 0.45 * grow;
          ctx.fillStyle = i < 4 ? BEAR : i > 4 ? BULL : GOLD;
          ctx.globalAlpha = 0.75;
          ctx.fillRect(padX + bw * i + bw * 0.2, baseY - bh2, bw * 0.6, bh2);
        });
        ctx.globalAlpha = 1;
        ctx.strokeStyle = IVORY;
        ctx.setLineDash([3, 4]);
        const mx = w / 2;
        ctx.beginPath();
        ctx.moveTo(mx, baseY - h * 0.5 * grow - 10);
        ctx.lineTo(mx, baseY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillStyle = alpha(IVORY, 0.7);
        ctx.textAlign = "center";
        ctx.fillText("MEAN", mx, baseY - h * 0.5 * grow - 16);
      } else if (variant === "expectancy") {
        // Avg win vs avg loss vs expectancy
        const rand = mulberry32(77);
        const results: number[] = [];
        for (let i = 0; i < 24; i++)
          results.push(rand() < 0.42 ? -(0.4 + rand()) : 0.6 + rand());
        const baseY = h * 0.68;
        const wins = results.filter((v) => v > 0);
        const losses = results.filter((v) => v <= 0);
        const avgW =
          wins.reduce((a, b) => a + b, 0) / Math.max(wins.length, 1);
        const avgL =
          Math.abs(losses.reduce((a, b) => a + b, 0)) /
          Math.max(losses.length, 1);
        const winRate = wins.length / results.length;
        const exp = winRate * avgW - (1 - winRate) * avgL;
        const bars: [string, number, string][] = [
          ["AVG WIN", avgW, BULL],
          ["AVG LOSS", avgL, BEAR],
          ["EXPECTANCY", exp, GOLD],
        ];
        const bw = (w - padX * 2) / 3;
        const grow = reduce ? 1 : Math.min(1, cycle * 1.6);
        bars.forEach(([label, val, col], i) => {
          const bh2 = Math.max(val, 0.05) * 60 * grow;
          const x = padX + bw * i + bw / 2;
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(x - 16, baseY - bh2, 32, bh2);
          ctx.globalAlpha = 1;
          ctx.font = "10px ui-monospace, monospace";
          ctx.fillStyle = alpha(IVORY, 0.75);
          ctx.textAlign = "center";
          ctx.fillText(label, x, baseY + 16);
          ctx.fillText(val.toFixed(2) + "R", x, baseY - bh2 - 8);
        });
        ctx.strokeStyle = FAINT;
        ctx.beginPath();
        ctx.moveTo(padX, baseY);
        ctx.lineTo(w - padX, baseY);
        ctx.stroke();
      } else if (variant === "mentor") {
        // Two nodes — you and the mentor — with a living connection
        const ax = w * 0.24;
        const bx = w * 0.76;
        const ay = h * 0.62;
        const by = h * 0.38;
        ctx.strokeStyle = GOLD;
        ctx.globalAlpha = 0.7;
        ctx.setLineDash([4, 5]);
        ctx.lineDashOffset = reduce ? 0 : -t * 0.02;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(w / 2, h * 0.28, bx, by);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
        ctx.globalAlpha = 1;

        for (const [x, y, label, col] of [
          [ax, ay, "YOU", IVORY],
          [bx, by, "MENTOR", GOLD],
        ] as [number, number, string, string][]) {
          const pulse = reduce ? 0 : ((Math.sin(t * 0.002 + x) + 1) / 2) * 3;
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.arc(x, y, 13 + pulse, 0, 7);
          ctx.stroke();
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.15;
          ctx.beginPath();
          ctx.arc(x, y, 13, 0, 7);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.font = "10px ui-monospace, monospace";
          ctx.fillStyle = alpha(IVORY, 0.8);
          ctx.textAlign = "center";
          ctx.fillText(label, x, y + 34);
        }
        ctx.lineWidth = 1;
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillStyle = alpha(GOLD, 0.8);
        ctx.textAlign = "center";
        ctx.fillText("PLAN · TRADES · JOURNAL", w / 2, h * 0.86);
      } else {
        for (let i = 0; i < n; i++) {
          const c = series[i];
          const a =
            variant === "composite"
              ? Math.max(0.55, 1 - (reveal - i) * 0.09)
              : Math.max(0.35, 1 - (reveal - i) * 0.09);
          drawCandle(
            ctx,
            padX + cw * (i + 0.5),
            Y(c.o),
            Y(c.c),
            Y(c.h),
            Y(c.l),
            cw * 0.55,
            a,
            i === n - 1
          );
        }
        // Current price hairline
        const last = series[n - 1];
        const py = Y((last.o + last.c) / 2);
        ctx.strokeStyle = GOLD;
        ctx.globalAlpha = reduce ? 0.6 : 0.45 + 0.3 * cycle;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(padX, py);
        ctx.lineTo(w - padX, py);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // Lesson overlays
        if (variant === "trend" || variant === "composite") {
          ctx.strokeStyle = GOLD;
          ctx.globalAlpha = 0.85;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(padX + cw * 5.5, Y(series[5].l));
          ctx.lineTo(padX + cw * 32, Y(series[20].l));
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }
        if (variant === "levels" || variant === "composite") {
          const pairs: [number, string][] = [
            [max - (max - min) * 0.14, BEAR],
            [min + (max - min) * 0.14, BULL],
          ];
          for (const [v, col] of pairs) {
            const y = Y(v);
            ctx.strokeStyle = col;
            ctx.globalAlpha = 0.7;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(padX, y);
            ctx.lineTo(w - padX, y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 0.08;
            ctx.fillStyle = col;
            ctx.fillRect(padX, y - 5, w - padX * 2, 10);
            ctx.globalAlpha = 1;
          }
        }
        if (variant === "indicator" || variant === "composite") {
          ctx.strokeStyle = IVORY;
          ctx.globalAlpha = 0.75;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          for (let i = 3; i < n; i++) {
            let sum = 0;
            for (let k = 0; k < 4; k++)
              sum += (series[i - k].o + series[i - k].c) / 2;
            const x = padX + cw * (i + 0.5);
            const y = Y(sum / 4);
            if (i === 3) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.lineWidth = 1;
        }
      }

      // Continue looping ONLY while animation is requested and motion is
      // allowed. The previous condition (`!reduce || !animate`) kept
      // "static preview" mode animating forever whenever reduce was off.
      if (animate && !reduce) raf = requestAnimationFrame(render);
    };

    if (animate && !reduce) {
      raf = requestAnimationFrame(render);
    } else {
      // Static frame (preview mode or prefers-reduced-motion)
      render(2600);
    }
    const onThemeChange = () => {
      if (!(animate && !reduce)) render(2600);
    };
    window.addEventListener("mechwealth:theme-change", onThemeChange);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("mechwealth:theme-change", onThemeChange);
    };
  }, [variant, animate]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="h-56 w-full md:h-full"
      style={{ opacity: active ? 1 : 0.45, transition: "opacity 400ms" }}
    />
  );
}
