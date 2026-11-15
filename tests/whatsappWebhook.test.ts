import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/webhook/route";

const appSecret = "test-only-app-secret";
const phoneNumberId = "123456789";
const sender = "15555550123";
function payload(text: unknown = " HI ") {
  return {
    object: "whatsapp_business_account",
    entry: [{ changes: [{ field: "messages", value: {
      messaging_product: "whatsapp", metadata: { phone_number_id: phoneNumberId },
      messages: [{ id: "test-message", from: sender, type: "text", text: { body: text } }],
    } }] }],
  };
}
function post(body: unknown, signature?: string) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("https://example.com/webhook", {
    method: "POST", body: raw,
    headers: { "x-hub-signature-256": signature ?? `sha256=${createHmac("sha256", appSecret).update(raw).digest("hex")}` },
  });
}
function get(query = "hub.mode=subscribe&hub.verify_token=test-only-verify&hub.challenge=12345") {
  return new Request(`https://example.com/webhook?${query}`);
}

beforeEach(() => {
  vi.stubEnv("WHATSAPP_APP_SECRET", appSecret);
  vi.stubEnv("WHATSAPP_ACCESS_TOKEN", "test-only-access-token");
  vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", phoneNumberId);
  vi.stubEnv("WHATSAPP_VERIFY_TOKEN", "test-only-verify");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("WhatsApp webhook verification", () => {
  it("echoes only a valid subscription challenge", async () => {
    const response = await GET(get());
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("12345");
    for (const query of ["", "hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345", "hub.mode=other&hub.verify_token=test-only-verify&hub.challenge=12345", "hub.mode=subscribe&hub.verify_token=test-only-verify"]) {
      expect((await GET(get(query))).status).toBe(403);
    }
  });
  it("has no fallback verification token", async () => {
    vi.stubEnv("WHATSAPP_VERIFY_TOKEN", "");
    expect((await GET(get())).status).toBe(503);
  });
});

describe("WhatsApp webhook messages (all outbound requests mocked)", () => {
  it.each(["WHATSAPP_APP_SECRET", "WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"])("fails closed without %s", async (key) => {
    vi.stubEnv(key, "");
    expect((await POST(post(payload()))).status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects missing, malformed, incorrect and tampered signatures before sending", async () => {
    const signature = `sha256=${createHmac("sha256", appSecret).update(JSON.stringify(payload())).digest("hex")}`;
    for (const request of [
      new Request("https://example.com/webhook", { method: "POST", body: "{}" }),
      post(payload(), "sha256=invalid"), post(payload(), `sha256=${"0".repeat(64)}`),
      post(payload("modified"), signature),
    ]) expect((await POST(request)).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects signed invalid JSON and wrong envelopes without sending", async () => {
    for (const body of ["{", null, [], { object: "page", entry: [] }]) {
      expect((await POST(post(body))).status).toBe(400);
    }
    expect(fetch).not.toHaveBeenCalled();
  });
  it("authenticates raw UTF-8 bytes and preserves the supplied greeting flow", async () => {
    const log = vi.spyOn(console, "log");
    const error = vi.spyOn(console, "error");
    const unicodeResponse = await POST(post(JSON.stringify(payload("  Hello 👋  "))));
    expect(unicodeResponse.status).toBe(200);
    expect((await POST(post(payload()))).status).toBe(200);
    expect(fetch).toHaveBeenLastCalledWith(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, expect.objectContaining({
      method: "POST", headers: { Authorization: "Bearer test-only-access-token", "Content-Type": "application/json" },
      signal: expect.any(AbortSignal),
      body: JSON.stringify({ messaging_product: "whatsapp", to: sender, type: "text", text: { body: "Hi! Welcome to MechWealth 👋\n\nWhat do you want to learn?\n1. Trading Courses\n2. Investing Courses\n3. Free Demo\n4. Talk to Team\n\nReply with 1, 2, 3 or 4" } }),
    }));
    expect(log).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
  it("handles batched messages and ignores receipts, other numbers and invalid text/senders", async () => {
    const body = payload();
    const value = body.entry[0].changes[0].value;
    value.messages.push({ ...value.messages[0], id: "second-message", text: { body: "1" } });
    expect((await POST(post(body))).status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(2);
    vi.mocked(fetch).mockClear();
    const receipt = { ...value, messages: undefined, statuses: [{ status: "delivered" }] };
    const wrongNumber = { ...value, metadata: { phone_number_id: "987654321" } };
    for (const event of [receipt, wrongNumber]) {
      const eventBody = { ...body, entry: [{ changes: [{ field: "messages", value: event }] }] };
      expect((await POST(post(eventBody))).status).toBe(200);
    }
    for (const text of [7, null, {}, []]) expect((await POST(post(payload(text)))).status).toBe(200);
    const invalidSender = payload();
    invalidSender.entry[0].changes[0].value.messages[0].from = "not-a-phone";
    expect((await POST(post(invalidSender))).status).toBe(200);
    const image = payload();
    image.entry[0].changes[0].value.messages[0].type = "image";
    expect((await POST(post(image))).status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("returns an error on rejected or interrupted delivery without exposing private details", async () => {
    const log = vi.spyOn(console, "error");
    vi.mocked(fetch).mockResolvedValueOnce(new Response("private provider details", { status: 429 }));
    const rejected = await POST(post(payload()));
    expect(rejected.status).toBe(502);
    expect(await rejected.text()).toBe("Reply delivery failed");
    vi.mocked(fetch).mockRejectedValueOnce(new Error("private token or phone"));
    expect((await POST(post(payload()))).status).toBe(502);
    expect(log).not.toHaveBeenCalled();
  });
});
