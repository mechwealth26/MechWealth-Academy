import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import CoursesJourney from "@/components/courses/CoursesJourney";
import { COURSE_STAGES } from "@/data/courses";
import { FOUNDATION_OVERVIEW } from "@/data/foundationCourse";
import { PRACTITIONER_PAGE, METHOD_PAGE, ONE_TO_ONE_PAGE } from "@/data/coursePages";

afterEach(cleanup);

const courses = [FOUNDATION_OVERVIEW, PRACTITIONER_PAGE, METHOD_PAGE, ONE_TO_ONE_PAGE];

describe("course selection", () => {
  it("uses the owner-confirmed levels and retains the sequential entry requirements", () => {
    expect(COURSE_STAGES.map(({ level }) => level)).toEqual([
      "Beginner", "Intermediate", "Advanced", "Advanced",
    ]);
    expect(courses.map(({ facts }) => facts.find(({ label }) => label === "Before joining")?.value)).toEqual([
      "No previous experience required", "Foundation", "Practitioner", "Method",
    ]);
  });

  it.each(COURSE_STAGES)("explains $title and exposes its subject, audience and level to assistive technology", (stage) => {
    render(<CoursesJourney />);
    const card = screen.getByRole("link", { name: `${stage.title} View course details` });
    expect(card.getAttribute("href")).toBe(`/courses/${stage.slug}`);
    expect(within(card).getByText(stage.description)).toBeTruthy();
    expect(within(card).getByText(stage.level)).toBeTruthy();
    const description = card.getAttribute("aria-describedby")!.split(" ")
      .map((id) => document.getElementById(id)?.textContent).join(" ");
    expect(description).toContain(stage.tagline);
    expect(description).toContain(stage.audience);
    expect(description).toContain(stage.level);
    const details = courses[Number(stage.num) - 1];
    for (const { label, value } of details.facts.filter(({ label }) => ["Length", "Format", "Before joining"].includes(label))) {
      expect(within(card).getByText(label)).toBeTruthy();
      expect(within(card).getByText(value)).toBeTruthy();
    }
  });
});
