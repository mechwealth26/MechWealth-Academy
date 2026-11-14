import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Link from "next/link";
import { cleanup, fireEvent, render } from "@testing-library/react";
import ServiceCardIllustration from "@/components/services/ServiceCardIllustration";
import ServiceCardMotion from "@/components/services/ServiceCardMotion";
import { SERVICES } from "@/data/services";

it("renders all five complete decorative illustrations with independent gradient references before hydration", () => {
  const root = document.createElement("div");
  root.innerHTML = renderToStaticMarkup(<>{SERVICES.map(({ motif }) => <ServiceCardIllustration key={motif} motif={motif} />)}</>);
  const artwork = root.querySelectorAll('span[aria-hidden="true"] > svg');
  expect(artwork).toHaveLength(5);
  const ids = [...root.querySelectorAll("[id]")].map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  artwork.forEach((svg) => {
    expect(svg.querySelectorAll("path").length).toBeGreaterThan(5);
    svg.querySelectorAll("[fill], [stroke]").forEach((element) => {
      for (const attribute of ["fill", "stroke"]) {
        const match = element.getAttribute(attribute)?.match(/^url\(#(.+)\)$/);
        if (match) expect([...svg.querySelectorAll("[id]")].some((definition) => definition.id === match[1])).toBe(true);
      }
    });
  });
});

it("pauses and resumes the section without remounting its content", () => {
  const view = render(<ServiceCardMotion><Link href="/services/mutual-funds">Mutual Funds</Link></ServiceCardMotion>);
  const content = view.getByRole("link");
  const control = view.getByRole("button", { name: "Pause animations" });
  const region = document.getElementById(control.getAttribute("aria-controls")!)!;
  expect(region.contains(content)).toBe(true);
  const state = () => region.parentElement!.style.getPropertyValue("--service-motion-state");
  expect(state()).toBe("running");
  fireEvent.click(control);
  expect(state()).toBe("paused");
  fireEvent.click(view.getByRole("button", { name: "Resume animations" }));
  expect(state()).toBe("running");
  expect(view.getByRole("link")).toBe(content);
  cleanup();
});
