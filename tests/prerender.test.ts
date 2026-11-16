import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { SITE_ROUTES } from "@/lib/seo";
import { RESOURCES } from "@/data/resources";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ResourceArticleBody from "@/components/resources/ResourceArticleBody";
import { absoluteUrl } from "@/lib/seo";
import { COURSE_STAGES } from "@/data/courses";

/**
 * Prerender smoke (T-07): after `next build`, every indexable route's static
 * HTML must exist and contain exactly one <h1>. This suite intentionally fails
 * when `.next` is absent and must only run after the production build.
 */
const buildDir = path.resolve(__dirname, "../.next/server/app");

function htmlFor(routePath: string): string | null {
  const file =
    routePath === "/"
      ? path.join(buildDir, "index.html")
      : path.join(buildDir, `${routePath}.html`);
  return existsSync(file) ? readFileSync(file, "utf-8") : null;
}

describe("course selection initial HTML (requires a completed production build)", () => {
  it.each(COURSE_STAGES)("includes $title subject, audience, level and early enquiry link", (course) => {
    const document = new DOMParser().parseFromString(htmlFor(`/courses/${course.slug}`)!, "text/html");
    const hero = document.querySelector("main section")!;
    expect(hero.textContent).toContain(course.title);
    expect(hero.textContent).toContain(course.description);
    expect(hero.textContent).toContain(course.audience);
    expect(hero.textContent).toContain(course.level);
    expect(hero.textContent).toContain("Before joining");
    expect(hero.querySelector('a[href="/contact"]')?.textContent).toContain("Enquire about course");
  });

  it("explains each course in the comparison without JavaScript or hidden panels", () => {
    const document = new DOMParser().parseFromString(htmlFor("/courses")!, "text/html");
    for (const course of COURSE_STAGES) {
      const card = document.querySelector(`#stage-${course.num}`)!;
      expect(card.textContent).toContain(course.tagline);
      expect(card.textContent).toContain(course.audience);
      expect(card.textContent).toContain(course.level);
      expect(card.textContent).toContain(course.description);
      expect(card.querySelector("a")?.getAttribute("href")).toBe(`/courses/${course.slug}`);
    }
    expect(document.body.textContent).toContain("not qualifications or guaranteed expertise");
  });
});

describe("prerendered routes (requires a completed production build)", () => {
  it.each(SITE_ROUTES)("renders all confirmed social links in the shared footer on $path", (route) => {
    const document = new DOMParser().parseFromString(htmlFor(route.path)!, "text/html");
    expect(document.querySelectorAll("footer")).toHaveLength(1);
    const footer = document.querySelector("footer")!;
    expect(footer.textContent).toContain("Follow along");
    expect(footer.textContent).not.toContain("coming soon");
    const socials = footer.querySelector('ul[aria-label="Social media"]');
    expect(socials).not.toBeNull();
    expect(socials!.querySelectorAll("a")).toHaveLength(3);
    for (const [name, href] of [
      ["Instagram", "https://www.instagram.com/mechwealth_academy/"],
      ["Facebook", "https://www.facebook.com/mechwealthacademy"],
      ["YouTube", "https://www.youtube.com/@MechWealth"],
    ]) {
      const link = socials!.querySelector(`a[href="${href}"]`);
      expect(link, `${route.path}: missing ${name}`).not.toBeNull();
      expect(link!.getAttribute("aria-label")).toBe(`Follow MECHWEALTH on ${name} (opens in a new tab)`);
      expect(link!.getAttribute("target")).toBe("_blank");
      expect(link!.getAttribute("rel")).toBe("noopener noreferrer");
      expect(link!.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    }
  });

  it("ships a dark default and accessible icon controls on every indexable route", () => {
    for (const route of SITE_ROUTES) {
      const document = new DOMParser().parseFromString(htmlFor(route.path)!, "text/html");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme-preference")).toBe("dark");
      const theme = document.querySelector('header button[aria-haspopup="menu"]');
      expect(theme?.getAttribute("aria-label")).toBe("Theme: dark. Resolved to dark.");
      expect(theme?.textContent).toBe("");
      expect(document.querySelector('header a[href^="https://wa.me/"]')).toBeNull();
      const chat = document.querySelector('button[aria-label="Open website chat"]');
      expect(chat?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    }
  });

  it("finds the production prerender output", () => {
    expect(
      existsSync(path.join(buildDir, "index.html")),
      "missing .next/server/app/index.html; run `npm run build` before `npm run test:prerender`"
    ).toBe(true);
  });

  for (const route of SITE_ROUTES) {
    it(`prerenders ${route.path} with a single <h1>`, () => {
      const html = htmlFor(route.path);
      expect(html, `missing prerender output for ${route.path}`).toBeTruthy();
      const count = (html as string).match(/<h1[\s>]/g)?.length ?? 0;
      expect(count).toBe(1);
      expect((html as string)).toContain("</html>");
    });
  }

  it("emits a canonical link on each page", () => {
    for (const route of SITE_ROUTES) {
      const html = htmlFor(route.path);
      expect(html).toBeTruthy();
      expect(html).toContain('rel="canonical"');
    }
  });
});

describe("resource initial HTML (requires a completed production build)", () => {
  const parse = (html: string) => new DOMParser().parseFromString(html, "text/html");
  const normalize = (text: string | null | undefined) => text?.replace(/\s+/g, " ").trim();

  it.each(RESOURCES)("serves complete article and metadata for $slug without running scripts", (article) => {
    const route = `/resources/${article.slug}`;
    const document = parse(htmlFor(route)!);
    const expectedBody = parse(renderToStaticMarkup(createElement(ResourceArticleBody, { content: article.content })));
    // Read only real HTML elements, never the serialized React payload in scripts.
    const body = document.querySelector("[data-resource-body]");
    expect(body).not.toBeNull();
    expect(normalize(body?.textContent))
      .toBe(normalize(expectedBody.querySelector("[data-resource-body]")?.textContent));
    expect(document.querySelectorAll("h1")).toHaveLength(1);
    expect(document.title).toContain(article.content.split("\n")[0].replace(/^# /, ""));
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(article.summary);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(absoluteUrl(route));
    for (const slug of article.related) {
      expect(document.querySelector(`a[href="/resources/${slug}"]`)).not.toBeNull();
    }
    for (const source of article.sources ?? []) {
      expect(document.querySelector(`a[href="${source.url}"]`)).not.toBeNull();
    }
  });

  it("links all 13 articles from initial library HTML and includes them in the sitemap", () => {
    const document = parse(htmlFor("/resources")!);
    const sitemap = readFileSync(path.join(buildDir, "sitemap.xml.body"), "utf8");
    expect(RESOURCES).toHaveLength(13);
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const article of RESOURCES) {
      const route = `/resources/${article.slug}`;
      expect(document.querySelector(`a[href="${route}"]`)).not.toBeNull();
      expect(sitemap).toContain(`<loc>${absoluteUrl(route)}</loc>`);
      const page = parse(htmlFor(route)!);
      titles.add(page.title);
      descriptions.add(page.querySelector('meta[name="description"]')!.getAttribute("content")!);
    }
    expect(titles.size).toBe(13);
    expect(descriptions.size).toBe(13);
  });
});
