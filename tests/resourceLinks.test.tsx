import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ResourcesLibrary from "@/components/resources/ResourcesLibrary";

vi.mock("@/components/foundation/LessonDemo", () => ({ default: () => null }));

afterEach(cleanup);
beforeEach(() => {
  HTMLElement.prototype.scrollTo = vi.fn();
});

describe("crawlable links with the existing quick reader", () => {
  it("opens the reader from a real link and returns focus on close", async () => {
    render(<ResourcesLibrary />);
    const link = screen.getByRole("link", { name: "Read Read the Candle" });
    expect(link.getAttribute("href")).toBe("/resources/anatomy-of-a-candle");
    fireEvent.click(link);
    expect(screen.getByRole("dialog", { name: "Read the Candle" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Open full article page/ }).getAttribute("href"))
      .toBe("/resources/anatomy-of-a-candle");
    const related = screen.getByRole("link", { name: /Six Patterns.*Candlesticks/ });
    expect(related.getAttribute("href")).toBe("/resources/six-candlestick-patterns");
    fireEvent.click(related);
    expect(screen.getByRole("dialog", { name: "Six Patterns" })).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(link));
  });

  it("does not intercept modified clicks used to open another tab", () => {
    render(<ResourcesLibrary />);
    const link = screen.getByRole("link", { name: "Read Read the Candle" });
    const click = new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true });
    let intercepted: boolean | undefined;
    document.addEventListener("click", (event) => {
      intercepted = event.defaultPrevented;
      // jsdom cannot navigate; observe the app's decision before stopping its default.
      event.preventDefault();
    }, { once: true });
    link.dispatchEvent(click);
    expect(intercepted).toBe(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
