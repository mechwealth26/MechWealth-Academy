import { afterEach, expect, it, vi } from "vitest";
import { trackConversion } from "@/lib/analytics";
import { ANALYTICS_CONSENT_KEY } from "@/lib/analyticsConsent";
const ga = vi.hoisted(() => vi.fn());
vi.mock("@next/third-parties/google", () => ({ sendGAEvent: ga }));
vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));
afterEach(() => { localStorage.clear(); vi.unstubAllEnvs(); vi.clearAllMocks(); });
it("sends accepted conversion events using the GA command API and excludes personal details", () => {
  vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST");
  localStorage.setItem(ANALYTICS_CONSENT_KEY, "accepted");
  trackConversion("contact_form_submit", { program: "Foundation" });
  expect(ga).toHaveBeenCalledWith("event", "contact_form_submit", { program: "Foundation" });
  localStorage.setItem(ANALYTICS_CONSENT_KEY, "rejected");
  trackConversion("contact_form_submit"); expect(ga).toHaveBeenCalledTimes(1);
});
