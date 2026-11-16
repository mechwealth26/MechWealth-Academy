import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import WebsiteChat from "@/components/WebsiteChat";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("floating WhatsApp link", () => {
  it("links directly to the confirmed number without opening a website chat or calling its API", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(<WebsiteChat />);
    const link = screen.getByRole("link", { name: "Chat with MECHWEALTH on WhatsApp (opens in a new tab)" });
    expect(link.getAttribute("href")).toBe("https://wa.me/919164546528");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(link.style.position).toBe("fixed");
    expect(link.style.bottom).toBe("20px");
    expect(link.style.right).toBe("20px");
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);
    expect(screen.queryByRole("region", { name: "MECHWEALTH chat" })).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});
