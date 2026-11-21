import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AnalyticsManager from "@/components/analytics/AnalyticsManager";
import { ANALYTICS_CONSENT_KEY, OPEN_CONSENT_EVENT } from "@/lib/analyticsConsent";

vi.mock("@next/third-parties/google", () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => <span data-testid="google-analytics" data-measurement-id={gaId} />,
}));
vi.mock("@vercel/analytics/next", () => ({ Analytics: () => null }));
vi.mock("@vercel/speed-insights/next", () => ({ SpeedInsights: () => null }));

beforeEach(() => {
  localStorage.clear();
  vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-5NDD0P1VTN");
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("Google Analytics consent gate", () => {
  it.each(["accepted", "rejected"])("does not flash the banner while restoring saved %s consent", (saved) => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, saved);
    let restoreConsent: FrameRequestCallback | undefined;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      restoreConsent = callback;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    render(<AnalyticsManager enableVercel={false} />);
    expect(screen.queryByRole("region", { name: "Cookie preferences" })).toBeNull();
    expect(screen.queryByTestId("google-analytics")).toBeNull();
    act(() => { restoreConsent!(0); });
    expect(screen.queryByRole("region", { name: "Cookie preferences" })).toBeNull();
    expect(Boolean(screen.queryByTestId("google-analytics"))).toBe(saved === "accepted");
    act(() => { window.dispatchEvent(new Event(OPEN_CONSENT_EVENT)); });
    expect(screen.getByRole("button", { name: "Reject" })).toBeTruthy();
  });

  it.each([null, "invalid"])("keeps an unanswered banner visible after startup (%s)", async (saved) => {
    if (saved !== null) localStorage.setItem(ANALYTICS_CONSENT_KEY, saved);
    const page = render(<AnalyticsManager enableVercel={false} />);
    await screen.findByRole("button", { name: "Accept analytics" });
    await act(async () => {
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    });
    page.rerender(<AnalyticsManager enableVercel={false} />);
    expect(screen.getByRole("button", { name: "Accept analytics" })).toBeTruthy();
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe(saved);
    expect(screen.queryByTestId("google-analytics")).toBeNull();
  });

  it("waits for saved consent even when preferences are opened during startup", () => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "rejected");
    let restoreConsent: FrameRequestCallback | undefined;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      restoreConsent = callback;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    render(<AnalyticsManager enableVercel={false} />);
    act(() => { window.dispatchEvent(new Event(OPEN_CONSENT_EVENT)); });
    expect(screen.queryByRole("button", { name: "Accept analytics" })).toBeNull();
    act(() => { restoreConsent!(0); });
    fireEvent.click(screen.getByRole("button", { name: "Accept analytics" }));
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("accepted");
    expect(screen.getAllByTestId("google-analytics")).toHaveLength(1);
  });

  it("offers the in-session choice when browser storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    render(<AnalyticsManager enableVercel={false} />);
    fireEvent.click(await screen.findByRole("button", { name: "Accept analytics" }));
    expect(screen.getAllByTestId("google-analytics")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Reject" })).toBeNull();
  });

  it("keeps GA absent before consent and after rejection", async () => {
    render(<AnalyticsManager enableVercel={false} />);
    expect(screen.queryByTestId("google-analytics")).toBeNull();
    fireEvent.click(await screen.findByRole("button", { name: "Reject" }));
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("rejected");
    expect(screen.queryByTestId("google-analytics")).toBeNull();
  });

  it("mounts one tracker with the supplied ID only after acceptance", async () => {
    render(<AnalyticsManager enableVercel={false} />);
    fireEvent.click(await screen.findByRole("button", { name: "Accept analytics" }));
    expect(screen.getAllByTestId("google-analytics")).toHaveLength(1);
    expect(screen.getByTestId("google-analytics").getAttribute("data-measurement-id")).toBe("G-5NDD0P1VTN");
    act(() => { window.dispatchEvent(new Event(OPEN_CONSENT_EVENT)); });
    fireEvent.click(await screen.findByRole("button", { name: "Accept analytics" }));
    expect(screen.getAllByTestId("google-analytics")).toHaveLength(1);
  });

  it("restores a saved acceptance without adding a second tracker", async () => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "accepted");
    render(<AnalyticsManager enableVercel={false} />);
    await waitFor(() => expect(screen.getAllByTestId("google-analytics")).toHaveLength(1));
    expect(screen.queryByRole("button", { name: "Accept analytics" })).toBeNull();
  });

  it.each(["", "G-XXXXXXXXXX"])("does not mount an unconfigured tracker (%s)", async (gaId) => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", gaId);
    render(<AnalyticsManager enableVercel={false} />);
    fireEvent.click(await screen.findByRole("button", { name: "Accept analytics" }));
    expect(screen.queryByTestId("google-analytics")).toBeNull();
  });
});
