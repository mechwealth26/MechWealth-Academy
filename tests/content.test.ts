import { describe, it, expect } from "vitest";
import { RESOURCES, RESOURCE_CATEGORIES } from "@/data/resources";
import {
  PRACTITIONER_PAGE,
  METHOD_PAGE,
  ONE_TO_ONE_PAGE,
  type CoursePageContent,
} from "@/data/coursePages";
import { coursePageMetadata } from "@/components/courses/CoursePageTemplate";

const COURSE_PAGES: CoursePageContent[] = [
  PRACTITIONER_PAGE,
  METHOD_PAGE,
  ONE_TO_ONE_PAGE,
];

describe("resource data integrity", () => {
  it("covers every declared category at least once", () => {
    for (const cat of RESOURCE_CATEGORIES) {
      expect(
        RESOURCES.some((r) => r.category === cat),
        `no resource for category: ${cat}`
      ).toBe(true);
    }
  });

  it("has unique slugs", () => {
    const slugs = RESOURCES.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves every related slug to a real resource", () => {
    const slugs = new Set(RESOURCES.map((r) => r.slug));
    for (const r of RESOURCES) {
      for (const rel of r.related) {
        expect(slugs.has(rel), `${r.slug} → unknown related slug '${rel}'`).toBe(true);
      }
    }
  });

  it("gives every resource a non-empty summary and article", () => {
    for (const r of RESOURCES) {
      expect(r.summary.length).toBeGreaterThan(0);
      expect(r.content.length).toBeGreaterThan(0);
    }
  });
});

describe("coursePageMetadata", () => {
  it.each(COURSE_PAGES)("builds canonical metadata for $slug", (content) => {
    const meta = coursePageMetadata(content);
    const canonical = (
      meta.alternates as { canonical?: string } | undefined
    )?.canonical;
    expect(canonical).toBe(`/courses/${content.slug}`);
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
  });
});
