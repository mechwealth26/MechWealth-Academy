# Release preparation — 21 November 2026

## Ready locally

- Upgrade Next.js, @next/bundle-analyzer, @next/third-parties and eslint-config-next from 16.4.3 to exactly 16.4.6. Lockfile updated; both local copies use the patched dependencies.
- Production build passes on the first attempt without the earlier Next.js security warning.
- Lint: passed. Unit tests: 155 passed. Prerender checks: 91 passed. Type generation and TypeScript: passed. GoDaddy packaging: 5 passed. Source-sync: passed.
- Local patched production HTTP: all 31 sitemap routes return 200 with a canonical tag; four representative unknown routes return 404.
- `npm audit --omit=dev`: zero known reported production vulnerabilities at this check. Full audit: 14 development-tool advisories (9 moderate, 5 high), still unresolved; no broad dependency upgrade performed. These counts are registry results, not a guarantee of security.
- The prior must-fix implementation and four pending URL redirects are included. No paid services, DNS changes, real email or WhatsApp sends.

## Hosting observations / live blocker

GoDaddy Settings → Secrets lists WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_VERIFY_TOKEN in both Preview and Publish. WHATSAPP_APP_SECRET was absent at the initial check in this release task. Values were not revealed. Presence alone does not validate any value.

The owner must enter the existing Meta App Secret directly in GoDaddy for both environments. It must correspond to the Meta app that signs the webhook; it is not the access token or verification token. No secret should be pasted into chat or committed. The secured handler deliberately returns 503 if required configuration is absent.

GitHub Sync shows mechwealth26/MechWealth-Academy (main) connected and instructs pulling the latest repository changes to update the app; ZIP upload is paused while GitHub is connected. The CLI login is expired, so use the existing signed-in dashboard for preview updates. Do not assume the dashboard's old Overview Source label proves the active release commit.

Hold live publication until the missing secret is configured and the updated preview is verified. No real Meta delivery test has been authorised in this release task; signed requests are covered by mocked tests only. Process-local deduplication and the separate enquiry-abuse protection limitation remain as documented in PONYTAIL-MUST-FIX-REPORT.md.

## Sources

- Release: https://github.com/vercel/next.js/releases/tag/v16.4.6
- Installed package versions and official npm registry version/audit responses.
- GoDaddy's visible Settings → Secrets and Integrations screens (names/status only).
