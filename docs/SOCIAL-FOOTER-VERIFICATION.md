# Footer verification — 16 November 2026

## Confirmed live failure

Checked all 31 configured public routes with independent HTTPS requests. Only `/` serves “Follow along” and the three confirmed profile links. All 30 inner routes return HTTP 200 but still render “Social pages coming soon” with no social-profile anchors. This includes every course, service, resource article, About, Contact, Privacy and Terms page.

Repeated `/about` and `/courses` on both `https://mechwealth.com` and the existing GoDaddy production hostname, including fresh query strings and a `Cache-Control: no-cache` request header. These requests still returned the old inner-page footer. Responses reported `x-nextjs-cache: HIT`, `cf-cache-status: DYNAMIC` and `Cache-Control: s-maxage=31536000`. This is a serving/build-output inconsistency; the exact provider cache or deployment mechanism causing it has not been established. Clearing a visitor's browser is not an established solution.

Raw local results: `.godaddy/social-footer-live-2026-11-16.json` (ignored; no credentials).

## Source and build verification

The current workspace and GitHub checkout already use one `Footer` in `app/layout.tsx`. It mounts `FooterSocialLinks` once for every page using that root layout. `data/site.ts` contains these owner-confirmed URLs:

- Instagram: https://www.instagram.com/mechwealth_academy/
- Facebook: https://www.facebook.com/mechwealthacademy
- YouTube: https://www.youtube.com/@MechWealth

There is no separate inner-page footer to update. A fresh Next.js 16.4.3 Webpack production build includes the exact three links on all 31 indexable pages and the not-found page (32 HTML documents). The framework's separate global-error shell has no footer and was excluded from that supplemental inspection. The correct source has been on GitHub since `4caf450` and is preserved through `bf3d2fc`.

Added a permanent per-route regression assertion to `tests/prerender.test.ts`. It checks one shared footer, “Follow along”, no coming-soon text, exactly three social links, the exact URLs, accessible platform names, new-tab safeguards and SVG icons on every indexable route. No application code, visual styles, courses, APIs, secrets, DNS or hosting settings changed during this verification.

Validation passed: production build, lint, TypeScript and 84 prerender checks (53 existing plus 31 new route-specific footer checks). Prerender validation used `NEXT_PUBLIC_SITE_URL=https://mechwealth.com` to match the production build.

## Still required on GoDaddy

This is not resolved on the live website. This session has no authenticated GoDaddy browser-control tool; the existing CLI reports not logged in for production. No publication or cache clearing was performed.

Use the existing app at https://host.godaddy.com/nodejs/projects/xya3gs1vuu to update Preview from the latest GitHub main, wait until the build completes, verify the footer on an inner preview page and publish that release. After publication, recheck all 31 public routes. If inner pages still return the old footer, request a clean production rebuild/cache invalidation from GoDaddy for this app, providing the response evidence above. Do not change DNS or disable site-wide static generation to conceal this unverified hosting condition.

Completion requires all 31 live page checks to pass; a successful publish notification or homepage-only check is insufficient.
