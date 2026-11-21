import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/webhook/route";
import { COURSE_STAGES } from "@/data/courses";
import { SERVICES } from "@/data/services";

const appSecret = "test-only-app-secret";
const phoneNumberId = "123456789";
const sender = "15555550123";
let messageNumber = 0;
function payload(text: unknown = " HI ") {
  return {
    object: "whatsapp_business_account",
    entry: [{ changes: [{ field: "messages", value: {
      messaging_product: "whatsapp", metadata: { phone_number_id: phoneNumberId },
      messages: [{ id: `test-message-${++messageNumber}`, from: sender, type: "text", text: { body: text } }],
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
  vi.useRealTimers();
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
  it("authenticates raw UTF-8 bytes and preserves the interactive language chooser without logging payloads", async () => {
    const log = vi.spyOn(console, "log");
    const error = vi.spyOn(console, "error");
    expect((await POST(post(payload("Hi")))).status).toBe(200);
    const options = vi.mocked(fetch).mock.calls[0][1]!;
    const reply = JSON.parse(String(options.body));
    expect(reply.interactive.action.buttons.map((item: { reply: { id: string } }) => item.reply.id)).toEqual(["lang_en", "lang_hi", "lang_kn"]);
    expect(reply.interactive.action.buttons[2].reply.title).toBe("ಕನ್ನಡ");
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(options.headers).toEqual({ Authorization: "Bearer test-only-access-token", "Content-Type": "application/json" });
    expect((await POST(post(payload("Hello 👋")))).status).toBe(200);
    expect(log).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled();
  });
  it.each(["lang_en", "lang_hi", "lang_kn"])("preserves %s interactive choices", async (choice) => {
    await POST(post(payload(choice)));
    const reply = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]!.body));
    expect(reply.interactive.action.buttons.map((item: { reply: { id: string } }) => item.reply.id)).toEqual(["trading", "investment", "demo"]);
    expect(reply.interactive.body.text).toContain(choice === "lang_hi" ? "नमस्ते" : choice === "lang_kn" ? "ಹಾಯ್" : "Welcome");
  });
  it("keeps both interactive lists aligned with confirmed courses and services", async () => {
    for (const [selection, titles] of [["trading", COURSE_STAGES.map(c => c.title)], ["investment", SERVICES.map(s => s.title)]] as const) {
      vi.mocked(fetch).mockClear(); await POST(post(payload(selection)));
      const reply = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]!.body));
      expect(reply.interactive.action.sections[0].rows.map((row: { title: string }) => row.title)).toEqual(titles);
    }
  });
  it.each(COURSE_STAGES)("supports existing list selection for $title using the website catalog", async (course) => {
    const id = ["trading_foundational", "trading_practitioner", "trading_advanced", "trading_onetoone"][Number(course.num) - 1];
    const event = payload();
    Object.assign(event.entry[0].changes[0].value.messages[0], { type: "interactive", interactive: { type: "list_reply", list_reply: { id } } });
    expect((await POST(post(event))).status).toBe(200);
    const reply = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]!.body)).interactive;
    expect(reply.body.text).toContain(course.description);
    expect(reply.body.text).toContain(`https://mechwealth.com/courses/${course.slug}`);
    expect(reply.action.buttons.map((b: { reply: { id: string } }) => b.reply.id)).toEqual(["yes_btn", "no_btn"]);
  });
  it.each(["demo", "yes", "yes_btn", "unknown", "Someone's private name"])("directs %s to enquiry without claiming a booking", async (choice) => {
    expect((await POST(post(payload(choice)))).status).toBe(200);
    const reply = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]!.body)).text.body;
    expect(reply).toContain("https://mechwealth.com/contact");
    expect(reply).not.toMatch(/booked|will call|auto-saved|Free Demo|share your Name/i);
    expect(reply).not.toContain("Someone's private name");
  });
  it("handles batched messages and ignores receipts, other numbers and invalid text/senders", async () => {
    const body = payload();
    const value = body.entry[0].changes[0].value;
    value.messages.push({ ...value.messages[0], id: "second-message", text: { body: "trading" } });
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

it("acknowledges retries and concurrent duplicates without sending a second reply in this process", async () => {
  let resolve: (value: Response) => void = () => {};
  vi.mocked(fetch).mockImplementationOnce(() => new Promise<Response>(done => { resolve = done; }));
  const event = payload("hi");
  const first = POST(post(event));
  const second = POST(post(event));
  await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  resolve(new Response("{}"));
  expect((await first).status).toBe(200); expect((await second).status).toBe(200);
  expect((await POST(post(event))).status).toBe(200);
  expect(fetch).toHaveBeenCalledTimes(1);
});
it("processes remaining entries after a failure and retries only failed messages in this process", async () => {
  const failed = payload("hi"); const good = payload("hi");
  const batch = { ...failed, entry: [...failed.entry, ...good.entry] };
  vi.mocked(fetch).mockResolvedValueOnce(new Response("rejected", { status: 429 }));
  expect((await POST(post(batch))).status).toBe(502);
  expect(fetch).toHaveBeenCalledTimes(2);
  expect((await POST(post(batch))).status).toBe(200);
  expect(fetch).toHaveBeenCalledTimes(3);
});
it("does not accept interactive payloads of unsupported types or missing message IDs", async () => {
  for (const type of ["image", "button", "unknown"]) {
    const event = payload(); event.entry[0].changes[0].value.messages[0].type = type;
    await POST(post(event));
  }
  const event = payload(); event.entry[0].changes[0].value.messages[0].id = "";
  await POST(post(event)); expect(fetch).not.toHaveBeenCalled();
});
it("expires process-local retry records instead of keeping them forever", async () => {
  vi.useFakeTimers();
  const event = payload("hi");
  await POST(post(event)); await POST(post(event)); expect(fetch).toHaveBeenCalledTimes(1);
  vi.setSystemTime(Date.now() + 31 * 60 * 1000);
  await POST(post(event)); expect(fetch).toHaveBeenCalledTimes(2);
});
it("bounds stored retry IDs under a stream of distinct authenticated messages", async () => {
  const oldest = payload("hi"); await POST(post(oldest));
  for (let i = 0; i < 1000; i++) await POST(post(payload("hi")));
  expect(fetch).toHaveBeenCalledTimes(1001);
  await POST(post(oldest)); expect(fetch).toHaveBeenCalledTimes(1002);
});
it.each(["inv_demat", "inv_mutual", "inv_insurance", "inv_physical", "inv_iepf"])("uses verified website copy for %s", async (id) => {
  const index = ["inv_demat", "inv_mutual", "inv_insurance", "inv_physical", "inv_iepf"].indexOf(id);
  await POST(post(payload(id)));
  const reply = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]!.body)).interactive.body.text;
  expect(reply).toContain(SERVICES[index].summary);
  expect(reply).toContain(`https://mechwealth.com/services/${SERVICES[index].slug}`);
  expect(reply).not.toContain("15 mins");
});
