import { describe, it, expect } from "vitest";
import { buttonClasses } from "@/lib/buttonStyles";
import { SITE_ROUTES, absoluteUrl, courseJsonLd } from "@/lib/seo";

describe("buttonClasses", () => {
  it("applies variant and size classes", () => {
    const cls = buttonClasses("primary", "lg");
    expect(cls).toContain("bg-action");
    expect(cls).toContain("text-action-text");
    expect(cls).toContain("h-13");
  });

  it("defaults to primary/md", () => {
    expect(buttonClasses()).toBe(buttonClasses("primary", "md"));
  });
});

describe("SEO route table", () => {
  it("starts with home at highest priority", () => {
    expect(SITE_ROUTES[0]).toEqual({ path: "/", priority: 1 });
  });

  it("builds absolute URLs without double slashes", () => {
    const url = absoluteUrl("/courses/method");
    expect(url).toMatch(/\/courses\/method$/);
    expect(url.includes("//courses")).toBe(false);
  });

  it("contains no duplicate paths", () => {
    const paths = SITE_ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});


describe("verified course facts", () => {
  it("does not infer price or teaching language", () => {
    const data = courseJsonLd({ name: "Method", description: "Test a trading plan", path: "/courses/method" });
    expect(data).not.toHaveProperty("isAccessibleForFree");
    expect(data).not.toHaveProperty("inLanguage");
  });
});
