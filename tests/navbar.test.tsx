import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "@/components/navigation/Navbar";
import { siteConfig } from "@/data/site";

const lenis = vi.hoisted(() => ({ stop: vi.fn(), start: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/resources" }));
vi.mock("@/hooks/useLenis", () => ({ useLenis: () => lenis }));
vi.mock("@/components/theme/ThemeSwitcher", () => ({
  default: () => <button>Theme choices</button>,
}));

let desktop: boolean;
let mediaListeners: Set<() => void>;

beforeEach(() => {
  vi.useFakeTimers();
  desktop = false;
  mediaListeners = new Set();
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    media: query,
    get matches() { return query === "(min-width: 80rem)" && desktop; },
    addEventListener: (_event: string, listener: () => void) => mediaListeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) => mediaListeners.delete(listener),
  })));
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  document.documentElement.style.overflow = "";
});

function renderPage() {
  render(<>
    <a href="#main">Skip to content</a>
    <Navbar />
    <main id="main"><button>Page action</button></main>
    <footer>Footer</footer>
  </>);
}

function openMenu() {
  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  act(() => vi.advanceTimersByTime(100));
}

function crossBreakpoint(matches: boolean) {
  act(() => {
    desktop = matches;
    for (const listener of mediaListeners) listener();
  });
  act(() => vi.advanceTimersByTime(100));
}

describe("mobile menu cleanup", () => {
  it("links the header and open menu icons to the existing WhatsApp contact without changing the number", () => {
    renderPage();
    const name = "Chat with MECHWEALTH on WhatsApp (opens in a new tab)";
    const link = screen.getByRole("link", { name });
    expect(link.getAttribute("href")).toBe("https://wa.me/919164546528");
    expect(link.getAttribute("href")).toBe(`https://wa.me/${siteConfig.contact.telephone.replace(/\D/g, "")}`);
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    openMenu();
    expect(document.querySelector('#mobile-menu a[href="https://wa.me/919164546528"]')).not.toBeNull();
  });
  it("closes at the desktop breakpoint and restores page input, scrolling and visible focus", () => {
    renderPage();
    openMenu();
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeTruthy();
    expect(document.querySelector("main")!.inert).toBe(true);
    expect(document.querySelector("header")!.inert).toBe(true);
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(lenis.stop).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(screen.getByRole("link", { name: /01\s*Home/ }));

    crossBreakpoint(false);
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeTruthy();
    crossBreakpoint(true);

    expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull();
    for (const selector of ['a[href="#main"]', "header", "main", "footer"]) {
      expect(document.querySelector<HTMLElement>(selector)!.inert).toBe(false);
    }
    expect(document.documentElement.style.overflow).toBe("");
    expect(lenis.start).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(screen.getAllByRole("link", { name: "MECHWEALTH — home" })[0]);
    expect(mediaListeners.size).toBe(0);

    const tab = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
    window.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    screen.getByRole("button", { name: "Page action" }).focus();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Page action" }));

    crossBreakpoint(false);
    openMenu();
    crossBreakpoint(true);
    expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull();
    expect(lenis.start).toHaveBeenCalledTimes(2);
  });

  it("still returns focus to the mobile trigger after Escape", () => {
    renderPage();
    openMenu();
    fireEvent.keyDown(window, { key: "Escape" });
    act(() => vi.advanceTimersByTime(100));
    expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open menu" }));
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("preserves background isolation and a scroll lock owned by another overlay", () => {
    renderPage();
    document.querySelector("main")!.inert = true;
    document.documentElement.style.overflow = "hidden";
    openMenu();
    crossBreakpoint(true);
    expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull();
    expect(document.querySelector("main")!.inert).toBe(true);
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(lenis.start).not.toHaveBeenCalled();
  });
});
