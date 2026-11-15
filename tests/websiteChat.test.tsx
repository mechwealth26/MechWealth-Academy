import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import WebsiteChat from "@/components/WebsiteChat";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("website chat presentation", () => {
  it("uses a WhatsApp SVG and readable labels rather than internal action IDs", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ json: async () => ({ text: "Choose a language", buttons: [{ id: "lang_en", title: "English" }] }) })
      .mockResolvedValueOnce({ json: async () => ({ text: "Choose a course", buttons: [{ id: "trading", title: "Trading Course" }] }) }));
    const scrollIntoView = vi.spyOn(HTMLElement.prototype, "scrollIntoView");
    render(<WebsiteChat />);
    const launcher = screen.getByRole("button", { name: "Open website chat" });
    expect(launcher.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(launcher.textContent).not.toContain("💬");
    fireEvent.click(launcher);
    await screen.findByRole("button", { name: "English" });
    const panel = screen.getByRole("region", { name: "MECHWEALTH chat" });
    expect(panel.textContent).not.toContain("__start__");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close chat" }));
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    await screen.findByText("Choose a course");
    expect(panel.textContent).not.toContain("lang_en");
    expect(panel.textContent).toContain("English");
    expect(JSON.parse(vi.mocked(fetch).mock.calls[1][1]!.body as string).message).toBe("lang_en");
    expect(within(panel).getByRole("textbox", { name: "Message" })).toBeTruthy();
    expect(scrollIntoView).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Message" }), { key: "Escape" });
    expect(screen.queryByRole("region", { name: "MECHWEALTH chat" })).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open website chat" })));
  });
});
