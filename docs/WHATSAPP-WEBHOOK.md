# WhatsApp webhook

`app/webhook/route.ts` exposes `GET` and `POST` at `https://mechwealth.com/webhook`. This is a server endpoint, not a website page. The existing GoDaddy Node.js application can run it; FTP/static hosting cannot execute this handler.

## Required runtime settings

Enter the following under the existing GoDaddy app's **Settings → Secrets**, separately for **Preview** and **Publish** as needed. Do not put real values in this document, commit them to GitHub, prefix them with `NEXT_PUBLIC_`, or send them in chat.

| Name | Value to obtain or set |
| --- | --- |
| `WHATSAPP_VERIFY_TOKEN` | An owner-chosen private verification value; enter exactly the same value in Meta's webhook Verify Token field. |
| `WHATSAPP_APP_SECRET` | The actual App Secret of the Meta app sending these events. This is different from the verification token. |
| `WHATSAPP_ACCESS_TOKEN` | The valid WhatsApp Cloud API access token authorized to send for the configured business number. |
| `WHATSAPP_PHONE_NUMBER_ID` | That business number's numeric Meta phone-number ID, not the displayed phone number. |

Missing configuration returns HTTP 503 and sends nothing. GET with the correct configured verification token, `hub.mode=subscribe` and a nonempty `hub.challenge` returns the challenge with HTTP 200; incorrect verification returns 403. All POST events require a valid `X-Hub-Signature-256` calculated from the exact raw request body using the Meta App Secret. Invalid signatures return 401 before JSON parsing or outbound requests. These mechanisms follow [Meta's webhook verification and payload validation guidance](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/).

After configuration, the owner must configure the callback URL in the correct Meta app and subscribe the relevant WhatsApp business account to message events. This repository does not perform that registration. Confirm Meta account, number, token permissions and any messaging costs in that account before activation; no account or billing settings are assumed here.

## Behaviour and limitations

- Only signed text messages for the configured `phone_number_id` and WhatsApp message field can trigger replies. Batched entries are processed. Delivery/status notifications and non-text events are acknowledged without replies, following the distinct payload types in [Meta's messages reference](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages).
- The supplied reply wording is preserved. It mentions **Investing Courses**, a **Free Demo**, booking a demo and team follow-up. These offers and operational promises are not confirmed by the current website catalog. Owner confirmation or approved replacement wording is needed before enabling automatic replies. This handler only sends replies; it does not book a demo, store leads or notify a team.
- Events with no numeric `from` value are ignored. Newer WhatsApp username/business-scoped identifiers are not implemented. [Meta documents that phone-number-only integrations cannot process users whose phone numbers are unavailable](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages).
- Outbound requests time out after 10 seconds. Rejection/network failure returns 502 rather than falsely reporting successful processing. Message bodies, senders, tokens and provider error bodies are not logged by this handler. Provider/hosting access-log retention is outside this code change.
- There is no durable queue, shared message-ID deduplication or established hosting-level request limit. Retried callbacks, partial batch failures or uncertain upstream acceptance can produce duplicate replies. Deployment/storage requirements and retry-safe processing remain unresolved; no in-memory map is presented as reliable protection. An event marked accepted by Meta is not proof of delivery to a user's device.
- The supplied Graph API version remains `v21.0`. [Meta's version table](https://developers.facebook.com/docs/graph-api/changelog/versions/) lists its Graph API availability through **21 January 2027**. Upgrade and retest before that date; no unsupported latest-version assumption was used.

## Safe checks

Run `npm run test:unit -- tests/whatsappWebhook.test.ts`. Every outbound request in that test file is mocked and all credentials/phone identifiers are fictitious. It checks verification, missing settings, signature tampering, malformed payloads, batches, ignored events, error handling and absence of payload logging.

For a deployed but unconfigured endpoint, opening `/webhook` or posting an unsigned `{}` should return **503 Webhook not configured**, not a page or a 404. After configuration, an unsigned POST should return **401 Invalid signature**. Neither check sends a WhatsApp message. End-to-end sending requires a separately approved controlled test after the owner has supplied settings and confirmed reply wording.
