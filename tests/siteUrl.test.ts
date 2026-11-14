import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "@/lib/siteUrl";

describe("site origin validation", () => {
  it("requires a production origin and never infers a domain", () => {
    expect(() => resolveSiteUrl(undefined, true)).toThrow("NEXT_PUBLIC_SITE_URL");
    expect(() => resolveSiteUrl("", true)).toThrow("NEXT_PUBLIC_SITE_URL");
    expect(resolveSiteUrl(undefined, false)).toBe("http://localhost:3000");
  });

  it.each([
    "https://mechwealth.example", "https://www.example.com", "https://example.org",
    "https://preview.test", "not-a-url", "https://mechwealth.com/resources",
    "https://mechwealth.com?preview=1", "https://mechwealth.com#home",
    "https://user:password@mechwealth.com", "http://mechwealth.com",
  ])("rejects invalid or placeholder origin %s", (value) => {
    expect(() => resolveSiteUrl(value, true)).toThrow("NEXT_PUBLIC_SITE_URL");
  });

  it("normalizes the confirmed origin and permits explicit local validation", () => {
    expect(resolveSiteUrl("https://mechwealth.com/", true)).toBe("https://mechwealth.com");
    expect(resolveSiteUrl("http://localhost:3100", true)).toBe("http://localhost:3100");
  });
});
