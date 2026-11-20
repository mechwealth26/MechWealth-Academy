import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Reviews from "@/components/sections/Reviews";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function measuredTrack() {
  render(<Reviews />);
  const track = screen.getByLabelText(/Sample review cards/);
  Object.defineProperties(track, {
    clientWidth: { configurable: true, value: 600 },
    scrollWidth: { configurable: true, value: 1900 },
    scrollLeft: { configurable: true, writable: true, value: 0 },
  });
  Object.defineProperty(track.firstElementChild, "offsetWidth", { configurable: true, value: 300 });
  track.style.columnGap = "20px";
  track.scrollBy = vi.fn();
  fireEvent.scroll(track);
  return track;
}

describe("sample review carousel", () => {
  it("labels all six samples and exposes the Google action before the cards", () => {
    render(<Reviews />);
    const section = screen.getByRole("region", { name: /Their experience/ });
    expect(within(section).getAllByRole("article")).toHaveLength(6);
    expect(within(section).getAllByRole("img", { name: /Placeholder avatar for sample reviewer/ })).toHaveLength(6);
    expect(within(section).getAllByText("Rating pending")).toHaveLength(6);
    expect(within(section).getAllByText("Reviewer details pending")).toHaveLength(6);
    expect(section.querySelectorAll("blockquote")).toHaveLength(6);
    const controls = within(section).getByLabelText("Review carousel controls");
    const track = within(section).getByLabelText(/Sample review cards/);
    expect(controls.compareDocumentPosition(track) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(section).getAllByText(/Not a customer review/)).toHaveLength(6);
    expect(section.textContent).toContain("Actual customer reviews will replace these cards");
    const link = within(section).getByRole("link", { name: /Read more reviews/ });
    expect(link.getAttribute("href")).toBe("https://share.google/MgfrDkMIV4qc46HFq");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.compareDocumentPosition(within(section).getAllByRole("article")[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(section.querySelector('[itemtype*="Review"]')).toBeNull();
  });

  it("moves one card with buttons or keyboard and disables the controls at each edge", () => {
    const track = measuredTrack();
    const previous = screen.getByRole("button", { name: "Previous reviews" }) as HTMLButtonElement;
    const next = screen.getByRole("button", { name: "Next reviews" }) as HTMLButtonElement;
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);
    fireEvent.click(next);
    expect(track.scrollBy).toHaveBeenLastCalledWith({ left: 320, behavior: "smooth" });
    fireEvent.keyDown(track, { key: "ArrowLeft" });
    expect(track.scrollBy).toHaveBeenLastCalledWith({ left: -320, behavior: "smooth" });
    track.scrollLeft = 1300;
    fireEvent.scroll(track);
    expect(next.disabled).toBe(true);
    expect(previous.disabled).toBe(false);
    fireEvent.click(previous);
    expect(track.scrollBy).toHaveBeenLastCalledWith({ left: -320, behavior: "smooth" });
  });

  it("uses immediate movement when reduced motion is requested", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    const track = measuredTrack();
    fireEvent.click(screen.getByRole("button", { name: "Next reviews" }));
    expect(track.scrollBy).toHaveBeenCalledWith({ left: 320, behavior: "instant" });
  });
});
