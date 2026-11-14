import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import FinalCta from "@/components/sections/FinalCta";
const preload = vi.hoisted(() => vi.fn().mockResolvedValue({}));
vi.mock("@/hooks/useSectionProgress", () => ({ useSectionProgress: () => ({ current: 0 }) }));
vi.mock("@/components/3d/outro/MarketStructureScene.lazy", () => ({
  preloadMarketStructureScene: preload,
  default: ({ reducedMotion }: { reducedMotion: boolean }) =>
    <div data-testid="closing-scene" data-reduced-motion={String(reducedMotion)} />,
}));
let reduced = true;
let motionListeners: Set<() => void>;
let observers: IntersectionObserverCallback[];
beforeEach(() => {
  reduced = true;
  motionListeners = new Set();
  observers = [];
  preload.mockClear();
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    get matches() { return reduced; },
    addEventListener: (_type: string, listener: () => void) => motionListeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => motionListeners.delete(listener),
  })));
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { observers.push(callback); }
    observe() {}
    disconnect() {}
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("fetches on the first scroll only, while keeping the offscreen canvas uninitialised", () => {
  render(<FinalCta />);
  expect(preload).not.toHaveBeenCalled();
  act(() => window.dispatchEvent(new Event("scroll")));
  expect(preload).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId("closing-scene")).toBeNull();
  act(() => window.dispatchEvent(new Event("scroll")));
  expect(preload).toHaveBeenCalledTimes(1);
  act(() => observers[0]([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(screen.getByTestId("closing-scene")).not.toBeNull();
});
it("warms the code immediately when scroll position is already restored", () => {
  vi.stubGlobal("scrollY", 6000);
  render(<FinalCta />);
  expect(preload).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId("closing-scene")).toBeNull();
});
it("defers the scene until nearby and leaves reduced-motion navigation available", () => {
  render(<FinalCta />);
  expect(screen.queryByTestId("closing-scene")).toBeNull();
  expect(screen.getByRole("link", {name: "Enter the Academy"}).closest("[inert]")).toBeNull();
  act(() => observers[0]([{isIntersecting:true} as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(screen.getByTestId("closing-scene")).not.toBeNull();
  expect(screen.getByTestId("closing-scene").dataset.reducedMotion).toBe("true");
});
it("updates the scene preference and readable copy without requiring a page reload", () => {
  reduced = false;
  const { unmount } = render(<FinalCta />);
  act(() => observers[0]([{isIntersecting:true} as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(screen.getByTestId("closing-scene").dataset.reducedMotion).toBe("false");
  act(() => {
    reduced = true;
    for (const listener of motionListeners) listener();
  });
  expect(screen.getByTestId("closing-scene").dataset.reducedMotion).toBe("true");
  const link = screen.getByRole("link", {name: "Enter the Academy"});
  expect(link.closest("[inert]")).toBeNull();
  expect(link.parentElement!.parentElement!.style.opacity).toBe("1");
  expect(link.parentElement!.parentElement!.style.transform).toBe("none");
  act(() => {
    reduced = false;
    for (const listener of motionListeners) listener();
  });
  expect(screen.getByTestId("closing-scene").dataset.reducedMotion).toBe("false");
  unmount();
  expect(motionListeners.size).toBe(0);
});
