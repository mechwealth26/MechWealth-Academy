import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import CtaPattern from "@/components/ui/CtaPattern";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("CtaPattern", () => {
  it("starts only on entry and disconnects so re-entry cannot replay it", () => {
    let onIntersection: IntersectionObserverCallback;
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { onIntersection = callback; }
      observe = observe;
      disconnect = disconnect;
    });
    const { container, unmount } = render(<CtaPattern />);
    const pattern = container.firstElementChild as HTMLElement;
    expect(pattern.getAttribute("aria-hidden")).toBe("true");
    expect(observe).toHaveBeenCalledWith(pattern);
    const notify = (isIntersecting: boolean) => onIntersection(
      [{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver,
    );
    notify(false);
    expect(pattern.dataset.entered).toBeUndefined();
    notify(true);
    expect(pattern.dataset.entered).toBe("true");
    expect(disconnect).toHaveBeenCalledTimes(1);
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(2);
  });

  it("keeps the static decoration and creates no observer for reduced motion", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    const observer = vi.fn();
    vi.stubGlobal("IntersectionObserver", observer);
    const { container } = render(<CtaPattern />);
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
    expect(container.firstElementChild?.hasAttribute("data-entered")).toBe(false);
    expect(observer).not.toHaveBeenCalled();
  });
});
