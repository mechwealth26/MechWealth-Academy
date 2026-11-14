import type { LessonData } from "@/data/marketLesson";
import { getCanvasPalette } from "@/lib/theme";

/**
 * Editorial 2D-canvas renderer for the Technical Analysis lesson.
 * Pure draw code — no React, no DOM. The component owns the rAF loop
 * and the damped view state; this module transforms state into pixels.
 */

export interface LessonViewState {
  p: number; // damped overall progress 0..1
  yMin: number;
  yMax: number;
}

export interface LessonFrame {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  time: number;
  dt: number;
  p: number; // overall progress 0..1
}

let BULL = "#0fae7d";
let BEAR = "#b03636";
let GOLD = "#d4af37";
let STEEL = "#8fa3bf";
let IVORY = "#cfccc2";
let INK_LINE = "rgba(244,242,236,0.05)";
let LABEL = "rgba(207,204,194,0.5)";
const MONO = '500 9px "JetBrains Mono", monospace';
const MONO_S = '500 8px "JetBrains Mono", monospace';

/** Alpha kept on layers from already-completed chapters. */
const PAST = 0.38;

const INTRO_END = 0.06;
const FINALE_START = 0.94;
const CHAPTER_COUNT = 7;

const boundary = (i: number) => INTRO_END + ((FINALE_START - INTRO_END) * i) / CHAPTER_COUNT;

function chapterRange(i: number): [number, number] {
  return [boundary(i), boundary(i + 1)];
}

function ramp(v: number, a: number, b: number) {
  return Math.min(1, Math.max(0, (v - a) / (b - a)));
}
function smooth(v: number) {
  return v * v * (3 - 2 * v);
}

/** Layer alpha: fade in as its chapter starts, settle to PAST afterwards,
 *  lifted again during the finale when everything composites together. */
export function layerAlpha(p: number, i: number): number {
  const [s, e] = chapterRange(i);
  const fadeIn = smooth(ramp(p, s, s + (e - s) * 0.32));
  const active = p >= s && p < e ? 1 : PAST;
  const finale = ramp(p, FINALE_START, 0.985) * 0.78;
  return Math.min(1, Math.max(fadeIn * active, fadeIn > 0 ? finale : 0));
}

/**
 * DOM-rail variant: chapters are absolutely stacked, so only the active
 * one may be visible. Crossfades in at the start of a chapter and out
 * into the next; the final chapter stays up through the finale.
 */
export function chapterUiAlpha(p: number, i: number): number {
  const [s, e] = chapterRange(i);
  const fadeIn = smooth(ramp(p, s, s + (e - s) * 0.18));
  const fadeOut =
    i === CHAPTER_COUNT - 1 ? 1 : 1 - smooth(ramp(p, e - (e - s) * 0.1, e));
  return Math.min(1, fadeIn * fadeOut);
}

export function activeChapter(p: number): number {
  for (let i = CHAPTER_COUNT - 1; i >= 0; i--) {
    if (p >= boundary(i)) return i;
  }
  return -1;
}

function camera(data: LessonData, p: number): { c: number; s: number } {
  const keys = data.cameraKeys;
  const seg = Math.min(Math.max(p, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(seg), keys.length - 2);
  const f = smooth(seg - i);
  return {
    c: keys[i].c + (keys[i + 1].c - keys[i].c) * f,
    s: keys[i].s + (keys[i + 1].s - keys[i].s) * f,
  };
}

function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min;
  if (span <= 0) return [];
  const step = Math.pow(10, Math.floor(Math.log10(span / count)));
  const err = span / count / step;
  const mult = err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
  const inc = step * mult;
  const out: number[] = [];
  for (let v = Math.ceil(min / inc) * inc; v <= max; v += inc) out.push(v);
  return out;
}

/* ------------------------------------------------------------------ */

export function drawLesson(
  frame: LessonFrame,
  data: LessonData,
  view: LessonViewState
): void {
  const palette = getCanvasPalette();
  BULL = palette.bull;
  BEAR = palette.bear;
  GOLD = palette.gold;
  STEEL = palette.steel;
  IVORY = palette.ivory;
  INK_LINE = palette.faint;
  LABEL = hexA(palette.ivory, 0.5);

  const { ctx, w, h, time, dt, p } = frame;
  ctx.clearRect(0, 0, w, h);

  // --- camera & scales ---------------------------------------------
  const cam = camera(data, p);
  const i0 = cam.c - cam.s / 2;
  const padL = w * 0.07;
  const padR = w * 0.04;
  const plotW = w - padL - padR;
  const volPaneH = h * 0.17;
  const volTop = h - volPaneH;
  const priceTop = h * 0.09;
  const priceBot = volTop - h * 0.05;
  const priceH = priceBot - priceTop;

  const spacing = plotW / cam.s;
  const bodyW = Math.max(2, Math.min(spacing * 0.52, 14));

  const xOf = (i: number) => padL + ((i - i0) / cam.s) * plotW;
  const yOf = (price: number) =>
    priceTop + (1 - (price - view.yMin) / (view.yMax - view.yMin)) * priceH;

  // Fit y to the visible window; the caller damps between frames
  let lo = Infinity;
  let hi = -Infinity;
  for (
    let i = Math.max(0, Math.floor(i0));
    i <= Math.min(data.candles.length - 1, Math.ceil(i0 + cam.s));
    i++
  ) {
    lo = Math.min(lo, data.candles[i].l);
    hi = Math.max(hi, data.candles[i].h);
  }
  if (!isFinite(lo) || !isFinite(hi)) return;
  const padY = Math.max((hi - lo) * 0.14, 0.8);
  const kFit = 1 - Math.exp(-6 * dt);
  view.yMin += (lo - padY - view.yMin) * kFit;
  view.yMax += (hi + padY - view.yMax) * kFit;

  // --- grid ---------------------------------------------------------
  ctx.font = MONO;
  for (const tick of niceTicks(view.yMin, view.yMax, 5)) {
    const y = Math.round(yOf(tick)) + 0.5;
    ctx.strokeStyle = INK_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();
    ctx.fillStyle = LABEL;
    ctx.textAlign = "right";
    ctx.fillText(tick.toFixed(1), w - 8, y - 4);
  }

  // --- candles (revealed progressively through the intro) ------------
  const reveal = ramp(p, 0.004, INTRO_END) * data.candles.length;
  const bIdx = data.levels.breakoutIdx;

  for (let i = 0; i < data.candles.length; i++) {
    const ca = Math.min(1, Math.max(0, reveal - i));
    if (ca <= 0) continue;
    const cd = data.candles[i];
    const x = xOf(i);
    const bull = cd.c >= cd.o;
    ctx.globalAlpha = ca * (i === bIdx && p > boundary(3) ? 1 : 0.92);

    ctx.strokeStyle = bull ? BULL : BEAR;
    ctx.fillStyle = bull ? BULL : BEAR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, yOf(cd.h));
    ctx.lineTo(x, yOf(cd.l));
    ctx.stroke();

    const yo = yOf(cd.o);
    const yc = yOf(cd.c);
    const top = Math.min(yo, yc);
    const bh = Math.max(Math.abs(yc - yo), 1);
    if (bull) {
      ctx.fillRect(x - bodyW / 2, top, bodyW, bh);
    } else {
      ctx.strokeRect(x - bodyW / 2, top, bodyW, bh);
    }
  }
  ctx.globalAlpha = 1;

  const m: Mappers = { xOf, yOf };
  drawStructure(frame, data, view, m);
  drawLevels(frame, data, view, m, { padL, padR });
  drawTrendline(frame, data, m);
  drawBreakout(frame, data, m, time);
  drawPullback(frame, data, m);
  drawMovingAverages(frame, data, m);
  drawVolume(frame, data, m, { xOf, bodyW, volTop, volPaneH, padL, padR });
}

type Mappers = { xOf: (i: number) => number; yOf: (p: number) => number };

/* --- 01 · market structure ----------------------------------------- */

function drawStructure(
  frame: LessonFrame,
  data: LessonData,
  _view: LessonViewState,
  m: Mappers
) {
  const a = layerAlpha(frame.p, 0);
  if (a <= 0.01 || data.pivots.length < 2) return;
  const { ctx } = frame;

  // Dotted spine through the pivots
  ctx.strokeStyle = hexA(IVORY, a * 0.5);
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 5]);
  ctx.beginPath();
  data.pivots.forEach((pv, k) => {
    const x = m.xOf(pv.i);
    const y = m.yOf(pv.price);
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = MONO_S;
  ctx.textAlign = "center";
  for (const pv of data.pivots) {
    const x = m.xOf(pv.i);
    const isTop = pv.type === "H";
    const y = m.yOf(pv.price) + (isTop ? -8 : 14);
    ctx.fillStyle =
      pv.label === "HH" || pv.label === "HL"
        ? `rgba(212,175,55,${a * 0.9})`
        : `rgba(176,54,54,${a * 0.85})`;
    ctx.fillText(pv.label, x, y);
  }
}

/* --- 02 · support & resistance -------------------------------------- */

function drawLevels(
  frame: LessonFrame,
  data: LessonData,
  view: LessonViewState,
  m: Mappers,
  pads: { padL: number; padR: number }
) {
  void view;
  const a = layerAlpha(frame.p, 1);
  if (a <= 0.01) return;
  const { ctx, w, p } = frame;

  // Resistance transforms: red ceiling before the break, gold floor after
  const [bs, be] = chapterRange(3);
  const broken = ramp(p, bs + (be - bs) * 0.45, be);
  const rColor = broken > 0.02 ? GOLD : "#c05050";
  const rY = m.yOf(data.levels.resistance);

  ctx.setLineDash([7, 6]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = hexA(rColor, a * (0.75 + broken * 0.2));
  ctx.beginPath();
  ctx.moveTo(pads.padL, rY);
  ctx.lineTo(w - pads.padR, rY);
  ctx.stroke();

  // Zone band
  const bandH = Math.abs(m.yOf(data.levels.resistance - 0.9) - rY);
  const g = ctx.createLinearGradient(0, rY, 0, rY + bandH);
  g.addColorStop(0, hexA(rColor, a * 0.07));
  g.addColorStop(1, hexA(rColor, 0));
  ctx.fillStyle = g;
  ctx.fillRect(pads.padL, rY, w - pads.padL - pads.padR, bandH);
  ctx.setLineDash([]);

  // Crossfading label
  ctx.font = MONO;
  ctx.textAlign = "left";
  const labelX = pads.padL + 10;
  ctx.fillStyle = hexA("#c05050", a * (1 - broken));
  ctx.fillText("RESISTANCE", labelX, rY - 6);
  ctx.fillStyle = hexA(GOLD, a * broken);
  ctx.fillText("RESISTANCE → SUPPORT", labelX, rY - 6);

  // Support shelf
  const sY = m.yOf(data.levels.support);
  ctx.setLineDash([7, 6]);
  ctx.strokeStyle = hexA(BULL, a * 0.55);
  ctx.beginPath();
  ctx.moveTo(pads.padL, sY);
  ctx.lineTo(w - pads.padR, sY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = hexA(BULL, a * 0.7);
  ctx.fillText("SUPPORT", labelX, sY + 14);

  // Early structure low markers on both levels
  for (const pv of data.pivots) {
    const nearR = Math.abs(pv.price - data.levels.resistance) < 0.6 && pv.type === "H";
    const nearS = Math.abs(pv.price - data.levels.support) < 0.6 && pv.type === "L";
    if (!nearR && !nearS) continue;
    const x = m.xOf(pv.i);
    const y = m.yOf(pv.price);
    ctx.strokeStyle = hexA(nearR ? rColor : BULL, a * 0.8);
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x + 4, y);
    ctx.stroke();
  }
}

/* --- 03 · trendline -------------------------------------------------- */

function drawTrendline(frame: LessonFrame, data: LessonData, m: Mappers) {
  const a = layerAlpha(frame.p, 2);
  if (a <= 0.01) return;
  const { ctx } = frame;

  const lows = data.pivots.filter((p) => p.type === "L" && p.label === "HL");
  if (lows.length < 2) return;
  const p1 = lows[0];
  const p2 = lows[1];
  const slope = (p2.price - p1.price) / (p2.i - p1.i);

  // Extend the ray a little past both ends of the tape
  const iStart = p1.i - 3;
  const iEnd = data.candles.length + 5;
  const x1 = m.xOf(iStart);
  const x2 = m.xOf(iEnd);
  const y1 = m.yOf(p1.price + slope * (iStart - p1.i));
  const y2 = m.yOf(p1.price + slope * (iEnd - p1.i));

  ctx.setLineDash([4, 7]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = hexA(GOLD, a * 0.8);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = MONO_S;
  ctx.textAlign = "right";
  ctx.fillStyle = hexA(GOLD, a * 0.85);
  ctx.fillText("TRENDLINE", x2 - 4, y2 - 6);
}

/* --- 04 · breakout ---------------------------------------------------- */

function drawBreakout(
  frame: LessonFrame,
  data: LessonData,
  m: Mappers,
  time: number
) {
  const a = layerAlpha(frame.p, 3);
  if (a <= 0.01) return;
  const { ctx } = frame;

  const i = data.levels.breakoutIdx;
  const x = m.xOf(i);
  const rY = m.yOf(data.levels.resistance);

  // Expanding pulse ring at the break point
  const phase = (time * 0.55) % 1;
  const ringR = 8 + phase * 34;
  ctx.strokeStyle = hexA(GOLD, a * (1 - phase) * 0.55);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, rY, ringR, 0, Math.PI * 2);
  ctx.stroke();

  // Vertical hairline through the break candle
  ctx.setLineDash([3, 6]);
  ctx.strokeStyle = hexA(GOLD, a * 0.35);
  const cdY = m.yOf(data.candles[i].h);
  ctx.beginPath();
  ctx.moveTo(x, cdY - 26);
  ctx.lineTo(x, cdY - 8);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = MONO;
  ctx.textAlign = "center";
  ctx.fillStyle = hexA(GOLD, a * 0.95);
  ctx.fillText("BREAKOUT", x, cdY - 32);
}

/* --- 05 · pullback / retest -------------------------------------------- */

function drawPullback(frame: LessonFrame, data: LessonData, m: Mappers) {
  const a = layerAlpha(frame.p, 4);
  if (a <= 0.01) return;
  const { ctx } = frame;

  const bIdx = data.levels.breakoutIdx + 2; // post-breakout swing high area
  const rIdx = data.levels.retestIdx;
  const x1 = m.xOf(bIdx);
  const y1 = m.yOf(data.closes[bIdx]);
  const x2 = m.xOf(rIdx);
  const y2 = m.yOf(data.levels.resistance);
  const cx = (x1 + x2) / 2;
  const cy = Math.min(y1, y2) - 46;

  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = hexA(STEEL, a * 0.85);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x1, y1 - 10);
  ctx.quadraticCurveTo(cx, cy, x2, y2 - 6);
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrowhead pointing into the retest
  ctx.fillStyle = hexA(STEEL, a * 0.9);
  ctx.beginPath();
  ctx.moveTo(x2, y2 - 2);
  ctx.lineTo(x2 - 5, y2 - 12);
  ctx.lineTo(x2 + 5, y2 - 11);
  ctx.closePath();
  ctx.fill();

  ctx.font = MONO_S;
  ctx.textAlign = "center";
  ctx.fillStyle = hexA(STEEL, a * 0.95);
  ctx.fillText("PULLBACK · RETEST", (x1 + x2) / 2, cy - 8);
}

/* --- 06 · moving averages ----------------------------------------------- */

function drawMovingAverages(
  frame: LessonFrame,
  data: LessonData,
  m: Mappers
) {
  const a = layerAlpha(frame.p, 5);
  if (a <= 0.01) return;
  const { ctx } = frame;

  const drawLine = (series: (number | null)[], color: string, lw: number) => {
    ctx.strokeStyle = hexA(color, a * 0.9);
    ctx.lineWidth = lw;
    ctx.beginPath();
    let started = false;
    series.forEach((v, i) => {
      if (v === null) return;
      const x = m.xOf(i);
      const y = m.yOf(v);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  };

  drawLine(data.ema20, GOLD, 1.4);
  drawLine(data.ema50, STEEL, 1.1);

  // Minimal legend
  ctx.font = MONO_S;
  ctx.textAlign = "left";
  ctx.fillStyle = hexA(GOLD, a * 0.95);
  ctx.fillText("— EMA FAST", 16, 22);
  ctx.fillStyle = hexA(STEEL, a * 0.95);
  ctx.fillText("— EMA SLOW", 16, 36);
}

/* --- 07 · volume ----------------------------------------------------------- */

function drawVolume(
  frame: LessonFrame,
  data: LessonData,
  _m: Mappers,
  opts: {
    xOf: (i: number) => number;
    bodyW: number;
    volTop: number;
    volPaneH: number;
    padL: number;
    padR: number;
  }
) {
  void _m;
  const a = layerAlpha(frame.p, 6);
  if (a <= 0.01) return;
  const { ctx } = frame;

  let maxV = 0;
  for (const c of data.candles) maxV = Math.max(maxV, c.v);

  // Hairline separating the volume pane
  ctx.strokeStyle = hexA(IVORY, 0.08);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(opts.padL, opts.volTop);
  ctx.lineTo(frame.w - opts.padR, opts.volTop);
  ctx.stroke();

  for (let i = 0; i < data.candles.length; i++) {
    const cd = data.candles[i];
    const bh = (cd.v / maxV) * (opts.volPaneH - 14);
    const bull = cd.c >= cd.o;
    const spike = cd.v > 80;
    ctx.fillStyle = hexA(bull ? BULL : BEAR, a * (spike ? 0.75 : 0.38));
    ctx.fillRect(opts.xOf(i) - (opts.bodyW * 0.7) / 2, frame.h - 6 - bh, opts.bodyW * 0.7, bh);
  }

  ctx.font = MONO_S;
  ctx.textAlign = "left";
  ctx.fillStyle = hexA(IVORY, a * 0.7);
  ctx.fillText("VOLUME", opts.padL + 10, opts.volTop + 12);
}

/* --- watermark & utils ------------------------------------------------------- */

/** #rrggbb + alpha → rgba() string */
function hexA(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  if (hex.startsWith("rgba")) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}
