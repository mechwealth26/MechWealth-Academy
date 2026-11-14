import type { HeroCandle, HeroPatternId } from "@/data/heroMarket";
import { getCanvasPalette } from "@/lib/theme";

export interface ChartPointer {
  active: boolean;
  x: number;
  y: number;
}

export interface ChartMetrics {
  left: number;
  right: number;
  priceTop: number;
  priceBottom: number;
  volumeTop: number;
  volumeBottom: number;
  candleStep: number;
  priceMin: number;
  priceMax: number;
  xForIndex: (index: number) => number;
  yForPrice: (price: number) => number;
  priceForY: (y: number) => number;
  indexForX: (x: number) => number;
}

export type PatternWeights = Record<HeroPatternId, number>;

let COLORS = {
  background: "#070a12",
  grid: "#74819b",
  text: "#dce5f4",
  muted: "#738098",
  bull: "#20d6a1",
  bear: "#ff4f74",
  teal: "#35dfbd",
  violet: "#a68cff",
  gold: "#e8c96a",
  pink: "#ff7192",
  panel: "#0c111d",
  backgroundStart: "#090d17",
  backgroundEnd: "#080b14",
  shadow: "rgba(5, 7, 13, 0)",
};

function syncThemeColors() {
  const palette = getCanvasPalette();
  COLORS = {
    background: palette.background,
    grid: palette.grid,
    text: palette.text,
    muted: palette.muted,
    bull: palette.bull,
    bear: palette.bear,
    teal: palette.isLight ? "#087d70" : "#35dfbd",
    violet: palette.isLight ? "#6750b8" : "#a68cff",
    gold: palette.gold,
    pink: palette.isLight ? "#aa2d60" : "#ff7192",
    panel: palette.panel,
    backgroundStart: palette.backgroundStart,
    backgroundEnd: palette.backgroundEnd,
    shadow: palette.shadow,
  };
}

const mono = '"SFMono-Regular", "Roboto Mono", ui-monospace, monospace';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const formatPrice = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatVolume = (value: number) => `${(value / 1_000_000).toFixed(2)}M`;

const rgba = (hex: string, alpha: number) => {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
};

function makeMetrics(
  width: number,
  height: number,
  candles: HeroCandle[]
): ChartMetrics {
  const compact = width < 640;
  const left = compact ? 14 : 26;
  const right = width - (compact ? 48 : 76);
  const priceTop = compact ? 54 : 62;
  const volumeBottom = height - (compact ? 28 : 34);
  const volumeTop = volumeBottom - Math.max(44, height * 0.13);
  const priceBottom = volumeTop - 18;
  const rawMin = Math.min(...candles.map((candle) => candle.l));
  const rawMax = Math.max(...candles.map((candle) => candle.h));
  const padding = (rawMax - rawMin) * 0.08;
  const priceMin = rawMin - padding;
  const priceMax = rawMax + padding;
  const candleStep = (right - left) / candles.length;

  return {
    left,
    right,
    priceTop,
    priceBottom,
    volumeTop,
    volumeBottom,
    candleStep,
    priceMin,
    priceMax,
    xForIndex: (index) => left + candleStep * (index + 0.5),
    yForPrice: (price) =>
      priceTop +
      ((priceMax - price) / (priceMax - priceMin)) *
        (priceBottom - priceTop),
    priceForY: (y) =>
      priceMax -
      ((y - priceTop) / (priceBottom - priceTop)) *
        (priceMax - priceMin),
    indexForX: (x) =>
      clamp(Math.floor((x - left) / candleStep), 0, candles.length - 1),
  };
}

function drawGrid(
  context: CanvasRenderingContext2D,
  metrics: ChartMetrics,
  width: number,
  candles: HeroCandle[]
) {
  context.save();
  context.lineWidth = 1;
  context.strokeStyle = rgba(COLORS.grid, 0.12);
  context.fillStyle = rgba(COLORS.muted, 0.58);
  context.font = `9px ${mono}`;
  context.textBaseline = "middle";

  const horizontalLines = 6;
  for (let index = 0; index < horizontalLines; index++) {
    const progress = index / (horizontalLines - 1);
    const y =
      metrics.priceTop + progress * (metrics.volumeBottom - metrics.priceTop);
    context.beginPath();
    context.moveTo(metrics.left, y + 0.5);
    context.lineTo(metrics.right, y + 0.5);
    context.stroke();

    if (index < horizontalLines - 1) {
      const price =
        metrics.priceMax - progress * (metrics.priceMax - metrics.priceMin);
      context.textAlign = "left";
      context.fillText(formatPrice(price), metrics.right + 10, y);
    }
  }

  const verticalLines = width < 640 ? 4 : 8;
  for (let index = 0; index <= verticalLines; index++) {
    const x =
      metrics.left +
      ((metrics.right - metrics.left) * index) / verticalLines;
    context.beginPath();
    context.moveTo(x + 0.5, metrics.priceTop);
    context.lineTo(x + 0.5, metrics.volumeBottom);
    context.stroke();
  }

  const labels = width < 640 ? [0, 28, 56, 83] : [0, 16, 32, 48, 64, 83];
  context.textAlign = "center";
  context.textBaseline = "top";
  for (const index of labels) {
    const date = new Date(candles[index].time);
    context.fillText(
      date.toLocaleDateString("en", { month: "short", day: "2-digit" }),
      metrics.xForIndex(index),
      metrics.volumeBottom + 9
    );
  }

  context.restore();
}

function drawVolume(
  context: CanvasRenderingContext2D,
  metrics: ChartMetrics,
  candles: HeroCandle[],
  liveCandle: HeroCandle
) {
  const maximum = Math.max(...candles.map((candle) => candle.v));
  const barWidth = Math.max(1.5, metrics.candleStep * 0.58);

  candles.forEach((original, index) => {
    const candle = index === candles.length - 1 ? liveCandle : original;
    const height =
      ((metrics.volumeBottom - metrics.volumeTop) * candle.v) / maximum;
    context.fillStyle = rgba(
      candle.c >= candle.o ? COLORS.bull : COLORS.bear,
      index === candles.length - 1 ? 0.62 : 0.28
    );
    context.fillRect(
      metrics.xForIndex(index) - barWidth / 2,
      metrics.volumeBottom - height,
      barWidth,
      height
    );
  });
}

function ema(values: number[], period: number) {
  const result: number[] = [];
  const alpha = 2 / (period + 1);
  let current = values[0];
  for (const value of values) {
    current += (value - current) * alpha;
    result.push(current);
  }
  return result;
}

function drawMovingAverage(
  context: CanvasRenderingContext2D,
  metrics: ChartMetrics,
  values: number[],
  color: string,
  opacity: number
) {
  context.save();
  context.beginPath();
  values.forEach((value, index) => {
    const x = metrics.xForIndex(index);
    const y = metrics.yForPrice(value);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.strokeStyle = rgba(color, opacity);
  context.lineWidth = 1.3;
  context.shadowColor = rgba(color, opacity * 0.65);
  context.shadowBlur = 8;
  context.stroke();
  context.restore();
}

function drawCandles(
  context: CanvasRenderingContext2D,
  metrics: ChartMetrics,
  candles: HeroCandle[],
  liveCandle: HeroCandle,
  time: number,
  reducedMotion: boolean
) {
  const bodyWidth = clamp(metrics.candleStep * 0.6, 2.2, 8);

  candles.forEach((original, index) => {
    const candle = index === candles.length - 1 ? liveCandle : original;
    const bullish = candle.c >= candle.o;
    const color = bullish ? COLORS.bull : COLORS.bear;
    const x = metrics.xForIndex(index);
    const openY = metrics.yForPrice(candle.o);
    const closeY = metrics.yForPrice(candle.c);
    const highY = metrics.yForPrice(candle.h);
    const lowY = metrics.yForPrice(candle.l);
    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.max(1.4, Math.abs(closeY - openY));
    const livePulse =
      index === candles.length - 1 && !reducedMotion
        ? 0.88 + Math.sin(time * 0.003) * 0.12
        : 0.82;

    context.save();
    context.strokeStyle = rgba(color, index === candles.length - 1 ? 1 : 0.72);
    context.lineWidth = Math.max(1, bodyWidth * 0.13);
    context.beginPath();
    context.moveTo(x, highY);
    context.lineTo(x, lowY);
    context.stroke();

    context.fillStyle = rgba(color, livePulse);
    if (index === candles.length - 1) {
      context.shadowColor = rgba(color, 0.62);
      context.shadowBlur = 14;
    }
    context.beginPath();
    context.roundRect(
      x - bodyWidth / 2,
      bodyTop,
      bodyWidth,
      bodyHeight,
      Math.min(1.5, bodyWidth * 0.2)
    );
    context.fill();
    context.restore();
  });
}

function drawLabel(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  align: "left" | "right" = "left"
) {
  context.save();
  context.font = `9px ${mono}`;
  context.textBaseline = "middle";
  const width = context.measureText(text).width + 14;
  const left = align === "right" ? x - width : x;
  context.fillStyle = COLORS.panel;
  context.strokeStyle = rgba(color, 0.38);
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(left, y - 11, width, 22, 5);
  context.fill();
  context.stroke();
  context.fillStyle = rgba(color, 0.92);
  context.textAlign = "left";
  context.fillText(text, left + 7, y);
  context.restore();
}

function drawLevels(
  context: CanvasRenderingContext2D,
  metrics: ChartMetrics,
  alpha: number
) {
  if (alpha <= 0.002) return;
  context.save();
  const levels = [24410, 25520];
  levels.forEach((price, index) => {
    const y = metrics.yForPrice(price);
    const gradient = context.createLinearGradient(metrics.left, 0, metrics.right, 0);
    gradient.addColorStop(0, rgba(COLORS.gold, 0.02 * alpha));
    gradient.addColorStop(0.25, rgba(COLORS.gold, 0.12 * alpha));
    gradient.addColorStop(1, rgba(COLORS.gold, 0.03 * alpha));
    context.fillStyle = gradient;
    context.fillRect(metrics.left, y - 7, metrics.right - metrics.left, 14);
    context.setLineDash([5, 6]);
    context.strokeStyle = rgba(COLORS.gold, 0.72 * alpha);
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(metrics.left, y);
    context.lineTo(metrics.right, y);
    context.stroke();
    drawLabel(
      context,
      index === 0 ? "SUPPORT" : "RESISTANCE",
      metrics.right - 8,
      y - 15,
      COLORS.gold,
      "right"
    );
  });
  context.restore();
}

function drawTrend(
  context: CanvasRenderingContext2D,
  metrics: ChartMetrics,
  alpha: number
) {
  if (alpha <= 0.002) return;
  const x1 = metrics.xForIndex(1);
  const x2 = metrics.xForIndex(29);
  const y1 = metrics.yForPrice(24710);
  const y2 = metrics.yForPrice(25440);
  const channelOffset = 52;

  context.save();
  context.strokeStyle = rgba(COLORS.teal, 0.8 * alpha);
  context.fillStyle = rgba(COLORS.teal, 0.045 * alpha);
  context.lineWidth = 1.4;
  context.setLineDash([7, 5]);
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.lineTo(x2, y2 - channelOffset);
  context.lineTo(x1, y1 - channelOffset);
  context.closePath();
  context.fill();
  context.stroke();
  context.setLineDash([]);
  drawLabel(context, "HIGHER HIGHS · HIGHER LOWS", x1 + 12, y1 - 72, COLORS.teal);
  context.restore();
}

function drawBreakout(
  context: CanvasRenderingContext2D,
  metrics: ChartMetrics,
  alpha: number
) {
  if (alpha <= 0.002) return;
  const resistanceY = metrics.yForPrice(25520);
  const startX = metrics.xForIndex(53);
  const endX = metrics.xForIndex(72);
  const breakout = {
    x: metrics.xForIndex(61),
    y: metrics.yForPrice(25625),
  };
  const retest = {
    x: metrics.xForIndex(66),
    y: metrics.yForPrice(25495),
  };

  context.save();
  context.strokeStyle = rgba(COLORS.violet, 0.78 * alpha);
  context.lineWidth = 1.2;
  context.setLineDash([5, 5]);
  context.beginPath();
  context.moveTo(startX, resistanceY);
  context.lineTo(endX, resistanceY);
  context.stroke();
  context.setLineDash([]);

  for (const point of [breakout, retest]) {
    context.beginPath();
    context.arc(point.x, point.y, 13, 0, Math.PI * 2);
    context.fillStyle = rgba(COLORS.violet, 0.08 * alpha);
    context.fill();
    context.strokeStyle = rgba(COLORS.violet, 0.88 * alpha);
    context.stroke();
  }

  context.beginPath();
  context.moveTo(breakout.x, breakout.y - 17);
  context.lineTo(breakout.x, breakout.y - 42);
  context.stroke();
  context.beginPath();
  context.moveTo(retest.x, retest.y + 17);
  context.lineTo(retest.x, retest.y + 42);
  context.stroke();
  drawLabel(context, "BREAKOUT", breakout.x - 38, breakout.y - 55, COLORS.violet);
  drawLabel(context, "RETEST HOLDS", retest.x - 40, retest.y + 56, COLORS.violet);
  context.restore();
}

function drawDoubleBottom(
  context: CanvasRenderingContext2D,
  metrics: ChartMetrics,
  alpha: number
) {
  if (alpha <= 0.002) return;
  const first = {
    x: metrics.xForIndex(42),
    y: metrics.yForPrice(24385),
  };
  const neckline = {
    x: metrics.xForIndex(47),
    y: metrics.yForPrice(24810),
  };
  const second = {
    x: metrics.xForIndex(51),
    y: metrics.yForPrice(24400),
  };
  const confirm = {
    x: metrics.xForIndex(57),
    y: metrics.yForPrice(25100),
  };

  context.save();
  context.strokeStyle = rgba(COLORS.pink, 0.9 * alpha);
  context.lineWidth = 2;
  context.shadowColor = rgba(COLORS.pink, 0.5 * alpha);
  context.shadowBlur = 12;
  context.beginPath();
  context.moveTo(metrics.xForIndex(38), metrics.yForPrice(24880));
  context.bezierCurveTo(
    first.x - 14,
    first.y - 22,
    first.x - 8,
    first.y,
    first.x,
    first.y
  );
  context.bezierCurveTo(
    first.x + 18,
    first.y,
    neckline.x - 16,
    neckline.y,
    neckline.x,
    neckline.y
  );
  context.bezierCurveTo(
    second.x - 12,
    second.y - 12,
    second.x - 7,
    second.y,
    second.x,
    second.y
  );
  context.bezierCurveTo(
    second.x + 18,
    second.y,
    confirm.x - 20,
    confirm.y,
    confirm.x,
    confirm.y
  );
  context.stroke();
  context.shadowBlur = 0;

  for (const [label, point] of [
    ["LOW 01", first],
    ["LOW 02", second],
  ] as const) {
    context.beginPath();
    context.arc(point.x, point.y, 4, 0, Math.PI * 2);
    context.fillStyle = rgba(COLORS.pink, alpha);
    context.fill();
    drawLabel(context, label, point.x - 25, point.y + 28, COLORS.pink);
  }
  context.setLineDash([4, 5]);
  context.strokeStyle = rgba(COLORS.pink, 0.65 * alpha);
  context.beginPath();
  context.moveTo(metrics.xForIndex(43), neckline.y);
  context.lineTo(confirm.x + 18, neckline.y);
  context.stroke();
  context.setLineDash([]);
  drawLabel(context, "NECKLINE", confirm.x - 20, neckline.y - 17, COLORS.pink);
  context.restore();
}

function drawPriceLine(
  context: CanvasRenderingContext2D,
  metrics: ChartMetrics,
  candle: HeroCandle
) {
  const bullish = candle.c >= candle.o;
  const color = bullish ? COLORS.bull : COLORS.bear;
  const y = metrics.yForPrice(candle.c);

  context.save();
  context.strokeStyle = rgba(color, 0.46);
  context.lineWidth = 1;
  context.setLineDash([6, 5]);
  context.beginPath();
  context.moveTo(metrics.left, y);
  context.lineTo(metrics.right, y);
  context.stroke();
  context.setLineDash([]);

  const text = formatPrice(candle.c);
  context.font = `9px ${mono}`;
  const labelWidth = context.measureText(text).width + 14;
  context.fillStyle = rgba(color, 0.16);
  context.strokeStyle = rgba(color, 0.58);
  context.beginPath();
  context.roundRect(metrics.right + 5, y - 11, labelWidth, 22, 4);
  context.fill();
  context.stroke();
  context.fillStyle = color;
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillText(text, metrics.right + 12, y);
  context.restore();
}

function drawHeader(
  context: CanvasRenderingContext2D,
  width: number,
  candle: HeroCandle,
  firstClose: number
) {
  const change = ((candle.c / firstClose - 1) * 100).toFixed(2);
  const color = candle.c >= candle.o ? COLORS.bull : COLORS.bear;

  context.save();
  context.font = `10px ${mono}`;
  context.textBaseline = "middle";
  context.textAlign = "left";
  context.fillStyle = rgba(COLORS.text, 0.84);
  context.fillText("NIFTY 50", 20, 24);
  context.fillStyle = rgba(COLORS.muted, 0.72);
  context.fillText("·  ILLUSTRATIVE  ·  1D", 77, 24);

  if (width >= 760) {
    context.fillStyle = rgba(COLORS.muted, 0.62);
    context.fillText(
      `O ${formatPrice(candle.o)}   H ${formatPrice(candle.h)}   L ${formatPrice(candle.l)}   C ${formatPrice(candle.c)}`,
      230,
      24
    );
  }

  context.textAlign = "right";
  context.fillStyle = COLORS.text;
  context.font = `600 16px ${mono}`;
  context.fillText(formatPrice(candle.c), width - 20, 20);
  context.fillStyle = color;
  context.font = `9px ${mono}`;
  context.fillText(`${Number(change) >= 0 ? "+" : ""}${change}%`, width - 20, 39);
  context.restore();
}

function drawCrosshair(
  context: CanvasRenderingContext2D,
  metrics: ChartMetrics,
  pointer: ChartPointer,
  candles: HeroCandle[],
  liveCandle: HeroCandle,
  width: number
) {
  if (
    !pointer.active ||
    pointer.x < metrics.left ||
    pointer.x > metrics.right ||
    pointer.y < metrics.priceTop ||
    pointer.y > metrics.volumeBottom
  ) {
    return;
  }

  const index = metrics.indexForX(pointer.x);
  const candle = index === candles.length - 1 ? liveCandle : candles[index];
  const x = metrics.xForIndex(index);
  const y = clamp(pointer.y, metrics.priceTop, metrics.priceBottom);
  const price = metrics.priceForY(y);
  const color = candle.c >= candle.o ? COLORS.bull : COLORS.bear;

  context.save();
  context.setLineDash([3, 4]);
  context.lineWidth = 1;
  context.strokeStyle = rgba(COLORS.text, 0.38);
  context.beginPath();
  context.moveTo(x, metrics.priceTop);
  context.lineTo(x, metrics.volumeBottom);
  context.moveTo(metrics.left, y);
  context.lineTo(metrics.right, y);
  context.stroke();
  context.setLineDash([]);

  context.beginPath();
  context.arc(x, metrics.yForPrice(candle.c), 3.5, 0, Math.PI * 2);
  context.fillStyle = color;
  context.shadowColor = color;
  context.shadowBlur = 10;
  context.fill();
  context.shadowBlur = 0;

  const priceLabel = formatPrice(price);
  context.font = `9px ${mono}`;
  const priceWidth = context.measureText(priceLabel).width + 14;
  context.fillStyle = COLORS.panel;
  context.strokeStyle = rgba(COLORS.muted, 0.32);
  context.beginPath();
  context.roundRect(metrics.right + 5, y - 11, priceWidth, 22, 4);
  context.fill();
  context.stroke();
  context.fillStyle = rgba(COLORS.text, 0.9);
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillText(priceLabel, metrics.right + 12, y);

  const date = new Date(candle.time).toLocaleDateString("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const tooltipWidth = 206;
  const tooltipHeight = 91;
  const tooltipX = clamp(
    x + 18,
    metrics.left + 6,
    width - tooltipWidth - 10
  );
  const tooltipY = clamp(
    pointer.y - tooltipHeight - 16,
    metrics.priceTop + 6,
    metrics.priceBottom - tooltipHeight - 4
  );

  context.fillStyle = COLORS.panel;
  context.strokeStyle = rgba(color, 0.32);
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 8);
  context.fill();
  context.stroke();

  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillStyle = rgba(COLORS.text, 0.92);
  context.font = `10px ${mono}`;
  context.fillText(date, tooltipX + 12, tooltipY + 11);
  context.fillStyle = rgba(COLORS.muted, 0.82);
  context.font = `9px ${mono}`;
  context.fillText(
    `O  ${formatPrice(candle.o)}    H  ${formatPrice(candle.h)}`,
    tooltipX + 12,
    tooltipY + 34
  );
  context.fillText(
    `L  ${formatPrice(candle.l)}    C  ${formatPrice(candle.c)}`,
    tooltipX + 12,
    tooltipY + 51
  );
  context.fillStyle = rgba(color, 0.9);
  context.fillText(`VOL  ${formatVolume(candle.v)}`, tooltipX + 12, tooltipY + 69);
  context.restore();
}

export function drawHeroChart({
  context,
  width,
  height,
  candles,
  weights,
  pointer,
  time,
  reducedMotion,
}: {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  candles: HeroCandle[];
  weights: PatternWeights;
  pointer: ChartPointer;
  time: number;
  reducedMotion: boolean;
}): ChartMetrics {
  syncThemeColors();
  const metrics = makeMetrics(width, height, candles);
  const originalLive = candles[candles.length - 1];
  const liveOffset = reducedMotion ? 0 : Math.sin(time * 0.00072) * 58;
  const liveClose = originalLive.c + liveOffset;
  const liveCandle: HeroCandle = {
    ...originalLive,
    c: liveClose,
    h: Math.max(originalLive.h, liveClose + 24),
    l: Math.min(originalLive.l, liveClose - 22),
    v: originalLive.v * (1 + Math.abs(liveOffset) / 420),
  };

  context.clearRect(0, 0, width, height);
  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, COLORS.backgroundStart);
  background.addColorStop(0.58, COLORS.background);
  background.addColorStop(1, COLORS.backgroundEnd);
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(
    width * 0.74,
    height * 0.36,
    0,
    width * 0.74,
    height * 0.36,
    width * 0.7
  );
  glow.addColorStop(0, rgba(COLORS.violet, 0.08));
  glow.addColorStop(1, COLORS.shadow);
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  drawGrid(context, metrics, width, candles);
  drawLevels(context, metrics, weights.levels);
  drawVolume(context, metrics, candles, liveCandle);

  const closes = candles.map((candle, index) =>
    index === candles.length - 1 ? liveCandle.c : candle.c
  );
  drawMovingAverage(context, metrics, ema(closes, 9), COLORS.teal, 0.55);
  drawMovingAverage(context, metrics, ema(closes, 21), COLORS.violet, 0.45);
  drawCandles(context, metrics, candles, liveCandle, time, reducedMotion);
  drawTrend(context, metrics, weights.trend);
  drawBreakout(context, metrics, weights.breakout);
  drawDoubleBottom(context, metrics, weights["double-bottom"]);
  drawPriceLine(context, metrics, liveCandle);

  const pointerIndex = pointer.active
    ? metrics.indexForX(pointer.x)
    : candles.length - 1;
  const headerCandle =
    pointer.active && pointerIndex === candles.length - 1
      ? originalLive
      : pointerIndex === candles.length - 1
        ? liveCandle
        : candles[pointerIndex];
  drawHeader(context, width, headerCandle, candles[0].c);
  drawCrosshair(
    context,
    metrics,
    pointer,
    candles,
    originalLive,
    width
  );

  return metrics;
}
