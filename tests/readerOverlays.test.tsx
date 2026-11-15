import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Link from "next/link";
import ResourcesLibrary from "@/components/resources/ResourcesLibrary";
import AnalyticsManager from "@/components/analytics/AnalyticsManager";
import CookiePreferencesButton from "@/components/analytics/CookiePreferencesButton";
import ThemeProvider from "@/components/theme/ThemeProvider";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import { ANALYTICS_CONSENT_KEY } from "@/lib/analyticsConsent";

vi.mock("@/components/foundation/LessonDemo", () => ({ default: () => null }));
vi.mock("@next/third-parties/google", () => ({ GoogleAnalytics: () => null }));
vi.mock("@vercel/analytics/next", () => ({ Analytics: () => null }));
vi.mock("@vercel/speed-insights/next", () => ({ SpeedInsights: () => null }));

beforeEach(() => {
  localStorage.clear();
  HTMLElement.prototype.scrollTo = vi.fn();
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

function renderPage() {
  render(<ThemeProvider><header><Link href="/">Home</Link><ThemeSwitcher /></header></ThemeProvider>);
  const page = render(<main><ResourcesLibrary /></main>);
  render(<footer><CookiePreferencesButton /></footer>);
  render(<AnalyticsManager enableVercel={false} />);
  return page;
}

describe("reader overlay coordination", () => {
  it("suspends unanswered consent, confines focus, then restores usable consent without choosing for the visitor", async () => {
    const page = renderPage();
    await screen.findByRole("button", { name: "Reject" });
    const opener = screen.getByRole("link", { name: "Read Read the Candle" });
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Read the Candle" });
    expect(screen.queryByRole("button", { name: "Reject" })).toBeNull();
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBeNull();
    expect(page.container.inert).toBe(true);
    const close = within(dialog).getByRole("button", { name: /Resources/ });
    expect(document.activeElement).toBe(close);

    const theme = screen.getByRole("button", { name: /Theme:/ });
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(theme);
    fireEvent.keyDown(theme, { key: "Tab" });
    expect(document.activeElement).toBe(close);
    const last = within(dialog).getAllByRole("link").at(-1)!;
    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Home" }));

    fireEvent.keyDown(close, { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(opener));
    expect(page.container.inert).toBeFalsy();
    const reject = await screen.findByRole("button", { name: "Reject" });
    reject.focus();
    expect(document.activeElement).toBe(reject);
    fireEvent.click(reject);
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("rejected");
    fireEvent.click(opener);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("button", { name: "Reject" })).toBeNull();
  });

  it("preserves an explicitly reopened preferences banner while the reader temporarily suspends it", async () => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "rejected");
    renderPage();
    await waitFor(() => expect(screen.queryByRole("button", { name: "Reject" })).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Cookie preferences" }));
    expect(await screen.findByRole("button", { name: "Reject" })).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: "Read Read the Candle" }));
    expect(screen.queryByRole("button", { name: "Reject" })).toBeNull();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(await screen.findByRole("button", { name: "Reject" })).toBeTruthy();
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("rejected");
  });

  it("dismisses the theme menu before the reader, restoring focus at both steps", async () => {
    renderPage();
    const opener = screen.getByRole("link", { name: "Read Read the Candle" });
    fireEvent.click(opener);
    const theme = screen.getByRole("button", { name: /Theme:/ });
    fireEvent.click(theme);
    const option = screen.getByRole("menuitemradio", { name: "Light" });
    option.focus();
    fireEvent.keyDown(option, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByRole("dialog", { name: "Read the Candle" })).toBeTruthy();
    expect(document.activeElement).toBe(theme);
    fireEvent.keyDown(theme, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });
});
