# Ponytail must-fix implementation — findings 1–9

> Follow-up: Next.js has now been patched to 16.4.6; see [release preparation](RELEASE-PREPARATION.md) for current validation and hosting blockers. The original implementation results below are historical.

Scope: the nine Must fix items in the audit in this chat. No deployment, hosting configuration, real email/WhatsApp sends, dependency upgrade, new lessons or visual redesign. The four pending URL redirects are preserved, as are the pre-existing Terms and technical-analysis redirects.

## Completed locally

| Finding | Change | Evidence |
| --- | --- | --- |
| 1 — Forged webhook events | Require runtime Meta configuration; verify HMAC-SHA256 over raw bytes with a constant-time comparison; validate account envelope, phone ID, event type, sender and selection. Remove fallback verify token. | Missing/tampered signatures rejected, missing configuration fails closed, signed malformed input rejected. |
| 2 — Lost messages and hidden delivery failures | Iterate all entries/changes/messages; ignore receipts/other numbers; check provider HTTP status; use a 10-second timeout; return 502 on failure while continuing other batch messages. | Mocked provider rejection/network failure, batched entries and retry tests. Bounded process-local retry tracking skips completed IDs and coordinates concurrent duplicates. |
| 3 — False bookings | Keep English/Hindi/Kannada language choices and interactive course/service lists/buttons. Reuse website catalog copy for details; send enquiry links instead of collecting names and claiming bookings. | Interactive button/list tests, all four course and five service selections, unknown/private-name inputs and enquiry actions. |
| 4 — Different source copies | Reconcile application changes in both copies. Document `.godaddy/repository` as the release checkout. Add `npm run check:source-sync`. Preserve each existing README. | Source comparison passes; temporary matching/drifting fixtures return success/failure respectively, with paths only in failure output. |
| 5 — Private raw logs | Remove raw request, sender and provider-body logging from the webhook. | Console spies observe no logs on tested successful and failed paths. |
| 6 — Retired website chat | Replace its stateful handler with a 410 response; do not parse input, retain sessions or send notifications. Keep the floating `wa.me` link unchanged. | Unit tests with synthetic configured secrets and mocked fetch; local HTTP malformed POST returns 410. |
| 7 — GA conversions | Call `sendGAEvent("event", name, properties)` under the existing consent gate. | Mock asserts command arguments and no GA conversion after rejection. |
| 8 — Menu/banner conflict | Both menu and reader acquire an owned cookie-banner suspension. Closing one cannot expose consent behind another. No CSS/design changes. | Menu Escape/resize, late manager mount, multiple overlay owners and existing reader tests; actual browser mobile menu hides banner and restores it on exit. |
| 9 — Cross-tab consent | Listen for local-storage choice changes/clear; synchronously apply Google's measurement-specific disable flag; unmount tracker and clear accessible GA cookies. Remove reload on withdrawal. | Mocked cross-tab/local withdrawal, startup race, reacceptance and input/focus preservation tests. No real GA account/network validation claimed. |

## Exact material bot copy changes

- The former third main-menu button `Free Demo` / `फ्री डेमो` / `ಉಚಿತ ಡೆಮೊ` is now `Enquire` / `पूछताछ` / `ವಿಚಾರಣೆ`; the existing `demo` action ID remains compatible. No free-demo offering is assumed.
- Before: `We have your number auto-saved. Please share your Name to book your slot.`
- After: `For course and service enquiries, please use https://mechwealth.com/contact` followed by `Reply HI to see the menu again.` Hindi/Kannada equivalents follow the selected language.
- Before: `Your request for ... is booked. Our team will call you on this same WhatsApp number.`
- After: the same enquiry link and menu instruction. No booking or callback is promised; private incoming names are not echoed.
- Existing course action IDs remain; displayed names/details come from `data/courses.ts`. Service details come from `data/services.ts`. This also removes unverified bot claims such as account opening in 15 minutes.

## Validation

- Lint: passed, no warnings.
- Unit tests: 155 passed, 26 files. All outbound provider requests mocked with synthetic credentials; no real sends.
- TypeScript: passed.
- Production build: Next.js 16.4.3, Webpack. First attempt compiled and prerendered then stopped on the known Next.js security advisory; retry passed with the advisory warning. Framework patching is audit finding 10 and outside this batch.
- Prerender suite: 91 passed, including article HTML/metadata/footer links and all requested redirects.
- GoDaddy packaging: 5 passed.
- Local source-sync check: passed. Checker fixture verified that a changed application file fails without printing contents. Documentation and generated/hidden metadata files are excluded from code comparison; secrets are never compared.
- Local production HTTP: 31 sitemap routes return 200; four unknown routes return 404; six redirects return 308 and preserve query strings; retired chat returns 410; unsigned webhook cannot trigger delivery.
- Actual in-app browser: contact page at 390×844 and 1366×900. Opening the mobile menu hides the cookie banner; Escape restores the trigger and banner. Crossing the desktop breakpoint closes the menu and returns focus to the home logo. Form focus/input work afterward; no form submitted. Quick-reader nested Escape and return to the article opener pass. Direct WhatsApp link still targets https://wa.me/919164546528; no message sent. Temporary viewport override reset.
- Screenshot: `qa/must-fix-mobile-menu.jpg` (actual local browser capture).

## Changed files

- `app/webhook/route.ts`, `app/api/chat/route.ts`
- `components/analytics/AnalyticsManager.tsx`, `components/navigation/Navbar.tsx`, `components/resources/ResourcesLibrary.tsx`
- `lib/analytics.ts`, `lib/analyticsConsent.ts`
- `tests/whatsappWebhook.test.ts`, `tests/websiteChatRoute.test.ts`, `tests/analyticsConsent.test.tsx`, `tests/analyticsEvents.test.ts`, `tests/navbar.test.tsx`
- `scripts/check-source-sync.py`, `package.json`, `README.md`, this report and screenshot.
- Previously prepared `next.config.ts` and `tests/prerender.test.ts` changes remain present; not reverted or published.

## Limits and remaining deployment work

- Meta deployment secrets are unverified: `WHATSAPP_APP_SECRET`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`. Correct configuration must be securely verified before publishing this handler. Missing configuration returns 503, not a fallback or unauthenticated send. Do not paste secrets into chat.
- Deduplication is an optimisation confined to one process, at most 1,000 incoming message IDs for 30 minutes. Restarts, other workers, expiry, capacity eviction, or a provider accepting a message before a network timeout can still cause duplicate replies. Exactly-once delivery needs established durable storage/provider guarantees; neither is assumed or provisioned. Language preferences have the same process-local retention/capacity limit.
- No current GoDaddy worker count, request limits, storage, WAF or bot protection verified. The separate contact-form abuse-protection finding remains unresolved. No hosting protections or billing changed.
- No real Meta template/account delivery, GA dashboard receipt or live release verified. Cross-tab accepted-tracker withdrawal is tested with a mocked SDK, not a production GA network capture. Browser checks did not accept analytics cookies or send messages.
- The existing moderate Next.js security advisory still needs the separate framework patch. Reduced-motion follow-up and unfinished Terms/business facts remain outside findings 1–9.
- No source commit, GitHub push or deployment performed.

## Primary references

- Meta signature and webhook guidance: https://developers.facebook.com/docs/graph-api/webhooks/getting-started/
- Next.js GA event arguments: https://nextjs.org/docs/app/guides/third-party-libraries#sending-events-1
- Google's documented Analytics disable flag: https://developers.google.com/tag-platform/security/guides/privacy#turn_off_google_analytics
