import { describe, expect, it } from "vitest";
import { buildHeroCandles, HERO_PATTERNS } from "@/data/heroMarket";

describe("homepage hero market data", () => {
  it("is deterministic and contains the declared four learning chapters", () => {
    expect(buildHeroCandles()).toEqual(buildHeroCandles());
    expect(HERO_PATTERNS.map((pattern) => pattern.id)).toEqual([
      "levels",
      "trend",
      "breakout",
      "double-bottom",
    ]);
  });

  it("produces valid OHLCV candles", () => {
    const candles = buildHeroCandles();
    expect(candles).toHaveLength(84);
    for (const candle of candles) {
      expect(candle.h).toBeGreaterThanOrEqual(Math.max(candle.o, candle.c));
      expect(candle.l).toBeLessThanOrEqual(Math.min(candle.o, candle.c));
      expect(candle.v).toBeGreaterThan(0);
    }
  });

  it("preserves the authored double bottom and breakout/retest sequence", () => {
    const candles = buildHeroCandles();
    expect(Math.abs(candles[42].c - candles[51].c)).toBeLessThan(150);
    expect(candles[61].c).toBeGreaterThan(25_520);
    expect(Math.abs(candles[66].c - 25_520)).toBeLessThan(120);
    expect(candles[74].c).toBeGreaterThan(candles[61].c);
  });
});
