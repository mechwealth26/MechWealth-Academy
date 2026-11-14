import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ProfessionalMarketHero from "@/components/sections/ProfessionalMarketHero";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ProfessionalMarketHero keyboard chart", () => {
  it("exposes every candle through slider keyboard controls", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    render(<ProfessionalMarketHero />);

    const chart = screen.getByRole("slider", {
      name: "Candlestick data explorer",
    });
    expect(chart.getAttribute("aria-valuemin")).toBe("1");
    expect(chart.getAttribute("aria-valuemax")).toBe("84");
    expect(chart.getAttribute("aria-valuenow")).toBe("84");
    expect(chart.getAttribute("aria-valuetext")).toMatch(
      /Open .*High .*Low .*Close .*Volume/
    );

    fireEvent.keyDown(chart, { key: "Home" });
    expect(chart.getAttribute("aria-valuenow")).toBe("1");

    fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(chart.getAttribute("aria-valuenow")).toBe("2");

    fireEvent.keyDown(chart, { key: "PageUp" });
    expect(chart.getAttribute("aria-valuenow")).toBe("12");

    fireEvent.keyDown(chart, { key: "End" });
    expect(chart.getAttribute("aria-valuenow")).toBe("84");

    fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(chart.getAttribute("aria-valuenow")).toBe("84");

    fireEvent.keyDown(chart, { key: "PageDown" });
    expect(chart.getAttribute("aria-valuenow")).toBe("74");
  });

  it("provides keyboard instructions and a structured candle summary", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    render(<ProfessionalMarketHero />);

    const chart = screen.getByRole("slider", {
      name: "Candlestick data explorer",
    });
    expect(chart.getAttribute("aria-describedby")).toBe(
      "hero-chart-keyboard-help hero-chart-candle-details"
    );
    expect(screen.getByText(/Use the left and right arrow keys/)).toBeTruthy();
    expect(screen.getByText("Selected candle")).toBeTruthy();
    expect(screen.getByText("Date")).toBeTruthy();
    expect(screen.getByText("Open")).toBeTruthy();
    expect(screen.getByText("High")).toBeTruthy();
    expect(screen.getByText("Low")).toBeTruthy();
    expect(screen.getByText("Close")).toBeTruthy();
    expect(screen.getByText("Volume")).toBeTruthy();
  });
});
