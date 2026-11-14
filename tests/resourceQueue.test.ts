import { describe, expect, it } from "vitest";
import { includeResourceInQueue } from "@/components/resources/ResourcesLibrary";

describe("resource reader queue", () => {
  it("inserts a valid related resource after the current article", () => {
    const filteredQueue = [
      "anatomy-of-a-candle",
      "six-candlestick-patterns",
    ];
    const result = includeResourceInQueue(
      filteredQueue,
      "support-resistance-zones",
      "anatomy-of-a-candle"
    );

    expect(result).toEqual([
      "anatomy-of-a-candle",
      "support-resistance-zones",
      "six-candlestick-patterns",
    ]);
    expect(filteredQueue).toEqual([
      "anatomy-of-a-candle",
      "six-candlestick-patterns",
    ]);
  });

  it("does not duplicate an existing resource", () => {
    const queue = ["anatomy-of-a-candle", "support-resistance-zones"];
    expect(includeResourceInQueue(queue, "anatomy-of-a-candle")).toBe(queue);
  });

  it("rejects unknown resource slugs", () => {
    const queue = ["anatomy-of-a-candle"];
    expect(includeResourceInQueue(queue, "missing-resource")).toBe(queue);
  });
});
