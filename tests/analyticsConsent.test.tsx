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
  vi.unstubAllEnvs();
});

describe("Google Analytics consent gate", () => {
  it("keeps GA absent before consent and after rejection", () => {
    render(<AnalyticsManager enableVercel={false} />);
    expect(screen.queryByTestId("google-analytics")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("rejected");
    expect(screen.queryByTestId("google-analytics")).toBeNull();
  });

  it("mounts one tracker with the supplied ID only after acceptance", () => {
    render(<AnalyticsManager enableVercel={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Accept analytics" }));
    expect(screen.getAllByTestId("google-analytics")).toHaveLength(1);
    expect(screen.getByTestId("google-analytics").getAttribute("data-measurement-id")).toBe("G-5NDD0P1VTN");
    act(() => { window.dispatchEvent(new Event(OPEN_CONSENT_EVENT)); });
    fireEvent.click(screen.getByRole("button", { name: "Accept analytics" }));
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
    fireEvent.click(screen.getByRole("button", { name: "Accept analytics" }));
    expect(screen.queryByTestId("google-analytics")).toBeNull();
  });
});
