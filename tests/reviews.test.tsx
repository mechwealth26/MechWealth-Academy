import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Reviews from "@/components/sections/Reviews";
import { REVIEWS, reviewPreview } from "@/data/reviews";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function measuredTrack() {
  render(<Reviews />);
  const track = screen.getByLabelText(/Customer review cards/);
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

describe("customer review carousel", () => {
  it("caps the preview at 191 characters without cutting emoji or padding short reviews", () => {
    expect(reviewPreview("a".repeat(192))).toBe("a".repeat(188) + "...");
    expect(Array.from(reviewPreview("😊".repeat(192)))).toHaveLength(191);
    expect(reviewPreview("Short review.")).toBe("Short review.");
  });
  it("shows the six supplied names, ratings, dates and edited text with the Google action above the cards", () => {
    render(<Reviews />);
    const section = screen.getByRole("region", { name: /Their experience/ });
    expect(within(section).getAllByRole("article")).toHaveLength(6);
    const cards = within(section).getAllByRole("article");
    expect(REVIEWS.map((review) => review.name)).toEqual(["Deepak Shintre", "Annachar Adya sir", "Renuka Talawar", "Amit Uppin", "Mahantesh Halasangi", "Aravind Math"]);
    expect(REVIEWS.map((review) => review.rating)).toEqual([5, 5, 4, 4, 5, 5]);
    for (const [index, review] of REVIEWS.entries()) {
      expect(cards[index].textContent).toContain(review.name);
      expect(cards[index].textContent).toContain(review.dateLabel);
      const paragraph = cards[index].querySelector("blockquote p")!.textContent!;
      expect(Array.from(paragraph).length).toBeLessThanOrEqual(191);
      expect(paragraph).not.toMatch(/[“”\u2014]/);
      if (Array.from(review.text).length <= 191) expect(paragraph).toBe(review.text);
      else expect(paragraph.endsWith("...")).toBe(true);
      expect(within(cards[index]).getByLabelText(`${review.rating} out of 5 stars`)).toBeTruthy();
      expect(cards[index].querySelectorAll('svg[fill="currentColor"]')).toHaveLength(review.rating);
    }
    expect(section.querySelectorAll("blockquote")).toHaveLength(6);
    const controls = within(section).getByLabelText("Review carousel controls");
    const track = within(section).getByLabelText(/Customer review cards/);
    expect(controls.compareDocumentPosition(track) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(section.textContent).not.toMatch(/Sample reviewer|Rating pending|Illustrative copy/);
    expect(within(section).queryByText("Edited for grammar & spelling")).toBeNull();
    expect(section.textContent).toContain("STOCKPUNTERS is the previous name of MECHWEALTH");
    expect(section.textContent).toContain("not guaranteed or typical results");
    const link = within(section).getByRole("link", { name: /Read more reviews/ });
    expect(link.getAttribute("href")).toBe("https://share.google/MgfrDkMIV4qc46HFq");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.compareDocumentPosition(within(section).getAllByRole("article")[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(section.querySelector('[itemtype*="Review"]')).toBeNull();
  });

  it("lets readers expand and collapse the long review without changing its text", () => {
    render(<Reviews />);
    const expand = screen.getByRole("button", { name: "Read full review by Deepak Shintre" });
    expect(expand.getAttribute("aria-expanded")).toBe("false");
    const preview = document.getElementById(expand.getAttribute("aria-controls")!)!.textContent!;
    expect(Array.from(preview).length).toBeLessThanOrEqual(191);
    expect(preview.endsWith("...")).toBe(true);
    fireEvent.click(expand);
    const collapse = screen.getByRole("button", { name: "Collapse review by Deepak Shintre" });
    expect(collapse.getAttribute("aria-expanded")).toBe("true");
    expect(document.getElementById(collapse.getAttribute("aria-controls")!)?.textContent).toContain(REVIEWS[0].text);
    fireEvent.click(collapse);
    expect(screen.getByRole("button", { name: "Read full review by Deepak Shintre" }).getAttribute("aria-expanded")).toBe("false");
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
