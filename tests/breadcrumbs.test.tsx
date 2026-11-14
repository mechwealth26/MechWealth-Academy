import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";

afterEach(cleanup);

describe("Breadcrumbs", () => {
  it("links ancestors and marks the current page without linking it", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Courses", href: "/courses" },
          { label: "The Method" },
        ]}
      />
    );

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav.textContent?.replace(/\s+/g, "").startsWith("←Home/Courses/TheMethod")).toBe(true);
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute("href")).toBe("/");
    expect(links[1].getAttribute("href")).toBe("/courses");

    const current = within(nav).getByText("The Method");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(within(nav).queryByRole("link", { name: "The Method" })).toBeNull();
  });
});
