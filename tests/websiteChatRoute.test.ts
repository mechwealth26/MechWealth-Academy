import { expect, it, vi, afterEach } from "vitest";
import { POST } from "@/app/api/chat/route";
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it("keeps the retired chat endpoint disabled without parsing input or notifying anyone", async () => {
  vi.stubEnv("WHATSAPP_ACCESS_TOKEN", "test-only-token");
  vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "12345");
  vi.stubEnv("ADMIN_WHATSAPP_NUMBER", "15555550123");
  vi.stubGlobal("fetch", vi.fn());
  for (let i = 0; i < 3; i++) {
    const response = POST();
    expect(response.status).toBe(410);
    expect(await response.json()).toEqual(expect.objectContaining({ error: expect.stringContaining("WhatsApp") }));
  }
  expect(fetch).not.toHaveBeenCalled();
});
