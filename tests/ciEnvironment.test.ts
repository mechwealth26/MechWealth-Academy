import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "@/lib/siteUrl";

describe("QA production environment", () => {
  it("supplies the confirmed public origin at job scope for build and prerender checks", () => {
    const workflow = readFileSync(path.resolve(__dirname, "../.github/workflows/qa.yml"), "utf8");
    const jobSettings = workflow.match(/^  quality:\n([\s\S]*?)^    steps:/m)?.[1];
    const origin = jobSettings?.match(/^    env:\n      NEXT_PUBLIC_SITE_URL: (\S+)$/m)?.[1];

    expect(origin).toBe("https://mechwealth.com");
    expect(resolveSiteUrl(origin, true)).toBe("https://mechwealth.com");
    expect(workflow).toContain("run: npm run build");
    expect(workflow).toContain("run: npm run test:prerender");
  });
});
