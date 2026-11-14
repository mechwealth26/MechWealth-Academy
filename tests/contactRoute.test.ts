import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/contact/route";

const validPayload = {
  name: "Arun",
  email: "arun@example.com",
  phone: "2025550123",
  program: "Foundation",
  message: "I want to learn market structure.",
};

function request(body: unknown, contentType = "application/json") {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": contentType },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

afterEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_FORM_FROM_EMAIL;
  delete process.env.CONTACT_FORM_TO_EMAIL;
  delete process.env.CONTACT_FORM_WEBHOOK_URL;
  delete process.env.CONTACT_FORM_WEBHOOK_TOKEN;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("POST /api/contact", () => {
  it("accepts only JSON", async () => {
    const response = await POST(request(validPayload, "text/plain"));
    expect(response.status).toBe(415);
  });

  it("rejects malformed and invalid payloads", async () => {
    expect((await POST(request("{"))).status).toBe(400);
    for (const value of [null, [], 7, true]) {
      expect((await POST(request(value))).status).toBe(400);
    }
    expect((await POST(request({ name: "", email: "bad", message: "" }))).status).toBe(400);
  });

  it("accepts only name and phone and forwards empty optional fields", async () => {
    process.env.CONTACT_FORM_WEBHOOK_URL = "https://example.com/webhook";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request({ name: "Arun", phone: "2025550123" }));
    expect(response.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ name: "Arun", phone: "2025550123", email: "", program: "", message: "" });
  });

  it("rejects a missing phone and a malformed optional email", async () => {
    expect((await POST(request({ ...validPayload, phone: " " }))).status).toBe(400);
    expect((await POST(request({ ...validPayload, email: "invalid" }))).status).toBe(400);
  });

  it("requires webhook configuration", async () => {
    const response = await POST(request(validPayload));
    expect(response.status).toBe(503);
  });

  it("quietly accepts honeypot submissions without calling the webhook", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    process.env.CONTACT_FORM_WEBHOOK_URL = "https://example.com/webhook";

    const response = await POST(request({ ...validPayload, website: "https://spam.example" }));

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards a clean payload and optional credential", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    process.env.CONTACT_FORM_WEBHOOK_URL = "https://example.com/webhook";
    process.env.CONTACT_FORM_WEBHOOK_TOKEN = "secret";

    const response = await POST(request(validPayload));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/webhook",
      expect.objectContaining({
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer secret",
        },
        body: JSON.stringify(validPayload),
      })
    );
  });

  it("reports upstream failures without logging enquiry data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    process.env.CONTACT_FORM_WEBHOOK_URL = "https://example.com/webhook";
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(request(validPayload));

    expect(response.status).toBe(502);
    expect(consoleError).toHaveBeenCalledWith(
      "Contact delivery failed:",
      "Webhook returned 500"
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(validPayload.message);
  });
});


describe("Resend contact delivery", () => {
  function configure() {
    process.env.RESEND_API_KEY = "test-only-key";
    process.env.CONTACT_FORM_FROM_EMAIL = "onboarding@resend.dev";
    process.env.CONTACT_FORM_TO_EMAIL = "owner@example.com";
  }
  it("sends one plain-text notification with optional reply-to and fixed recipient", async () => {
    configure();
    const fetchMock = vi.fn().mockResolvedValue({ok:true, json:async()=>({id:"email-123"})});
    vi.stubGlobal("fetch", fetchMock);
    expect((await POST(request({...validPayload, message:"<script>hello</script>", to:"attacker@example.com"}))).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.headers.authorization).toBe("Bearer test-only-key");
    const body = JSON.parse(options.body);
    expect(body.to).toEqual(["owner@example.com"]);
    expect(body.reply_to).toBe(validPayload.email);
    expect(body.text).toContain("<script>hello</script>");
    expect(body).not.toHaveProperty("html");
  });
  it("accepts an enquiry without an optional email", async () => {
    configure();
    const mock = vi.fn().mockResolvedValue({ok:true,json:async()=>({id:"email-123"})});
    vi.stubGlobal("fetch",mock);
    expect((await POST(request({name:"Test",phone:"2025550123"}))).status).toBe(200);
    expect(JSON.parse(mock.mock.calls[0][1].body)).not.toHaveProperty("reply_to");
  });
  it("fails closed for incomplete Resend configuration, even with a legacy webhook", async () => {
    configure();
    delete process.env.CONTACT_FORM_TO_EMAIL;
    process.env.CONTACT_FORM_WEBHOOK_URL = "https://example.com/webhook";
    const mock = vi.fn();vi.stubGlobal("fetch",mock);
    expect((await POST(request(validPayload))).status).toBe(503);
    expect(mock).not.toHaveBeenCalled();
  });
  it("does not report success on rejection, missing ID or timeout, or expose provider details", async () => {
    configure();
    vi.spyOn(console,"error").mockImplementation(()=>{});
    for (const response of [{ok:false,status:429}, {ok:true,json:async()=>({})}]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
      const result=await POST(request(validPayload));
      expect(result.status).toBe(502);
      expect(await result.text()).not.toContain("test-only-key");
    }
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Timeout")));
    expect((await POST(request(validPayload))).status).toBe(502);
  });
  it("does not spend quota on honeypot submissions", async () => {
    configure();const mock=vi.fn();vi.stubGlobal("fetch",mock);
    expect((await POST(request({...validPayload,website:"spam"}))).status).toBe(200);
    expect(mock).not.toHaveBeenCalled();
  });
});
