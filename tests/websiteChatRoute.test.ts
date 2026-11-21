import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/chat/route";

async function send(sessionId: string, message: string) {
  const response = await POST(new Request("http://localhost/api/chat", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionId, message }),
  }));
  expect(response.status).toBe(200);
  return response.json();
}

describe("website chat route", () => {
  it("starts with language choices and returns the course list for the supplied UI", async () => {
    const start = await send("chat-test-courses", "__start__");
    expect(start.buttons.map((button: { id: string }) => button.id)).toEqual(["lang_en", "lang_hi", "lang_kn"]);
    const menu = await send("chat-test-courses", "lang_en");
    expect(menu.buttons.some((button: { id: string }) => button.id === "trading")).toBe(true);
    const courses = await send("chat-test-courses", "trading");
    expect(courses.list).toHaveLength(4);
    expect(courses.list.every((item: { id: string; title: string }) => item.id && item.title)).toBe(true);
  });

  it("keeps language state separate between two valid session IDs", async () => {
    await send("chat-test-hindi", "lang_hi");
    await send("chat-test-english", "lang_en");
    expect((await send("chat-test-hindi", "unknown")).text).toContain("नमस्ते");
    expect((await send("chat-test-english", "unknown")).text).toContain("Welcome");
  });

  it("allows restarting after an option is declined", async () => {
    await send("chat-test-restart", "lang_en");
    await send("chat-test-restart", "trading_foundational");
    const declined = await send("chat-test-restart", "no_btn");
    expect(declined.buttons).toContainEqual({ id: "__start__", title: "Start Again" });
    expect((await send("chat-test-restart", "__start__")).buttons).toHaveLength(3);
  });
});
