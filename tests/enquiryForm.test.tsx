import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import EnquiryForm from "@/components/contact/EnquiryForm";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});


function fill(labelText: string, value: string) {
  const input = screen.getByLabelText(new RegExp(labelText, "i"));
  fireEvent.change(input, { target: { value } });
}

describe("EnquiryForm", () => {
  it("lets a beginner leave the course optional or select an existing course", () => {
    render(<EnquiryForm />);
    const course = screen.getByRole("combobox", { name: /Course you are interested in/i }) as HTMLSelectElement;
    expect(course.required).toBe(false);
    expect(course.value).toBe("General Enquiry");
    expect(screen.getAllByRole("option")).toHaveLength(5);
    expect(screen.getByRole("option", { name: "Foundation — Beginner · Stock-market basics and first charts" }).getAttribute("value")).toBe("Foundation");
    expect(screen.getByRole("option", { name: "Method — Advanced · Build and test a trading plan" }).getAttribute("value")).toBe("Method");
    fireEvent.change(course, { target: { value: "Method" } });
    expect(new FormData(document.querySelector("form")!).get("program")).toBe("Method");
  });

  it("shows validation errors and keeps the form when submitted empty", () => {
    const scrollIntoView = vi.spyOn(HTMLElement.prototype, "scrollIntoView");
    render(<EnquiryForm />);
    const form = document.querySelector("form")!;
    // Bypass native constraint UI to exercise our onSubmit handler
    fireEvent.submit(form);
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    // No success state
    expect(screen.queryByText(/Enquiry Received/i)).toBeNull();
    // Focus moved to first invalid field
    expect(document.activeElement?.id).toBe("name");
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  });

  it("reveals invalid fields without animation when reduced motion is requested", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    const scrollIntoView = vi.spyOn(HTMLElement.prototype, "scrollIntoView");
    render(<EnquiryForm />);

    fireEvent.submit(document.querySelector("form")!);

    expect(document.activeElement?.id).toBe("name");
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "center",
      inline: "nearest",
    });
  });

  it("flags an invalid email format", () => {
    render(<EnquiryForm />);
    fill("Name", "Arun");
    fill("Phone", "2025550123");
    fill("Email", "not-an-email");
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: "Learn charts" } });
    const form = document.querySelector("form")!;
    fireEvent.submit(form);
    expect(screen.getByText(/doesn't look valid/i)).toBeTruthy();
  });

  it("submits successfully and shows the announced confirmation", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ ok: true }) })
    );
    render(<EnquiryForm />);
    fill("Name", "Arun");
    fill("Phone", "2025550123");
    fill("Email", "arun@example.com");
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Practitioner" } });
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: "Learn charts" } });
    fireEvent.click(screen.getByRole("button", { name: /Send Enquiry/i }));

    return waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole("status"));
      expect(screen.getByText(/Enquiry Received/i)).toBeTruthy();
      expect(screen.getByText(/Thank you for reaching out to MECHWEALTH/i)).toBeTruthy();
    });
  });

  it("keeps entered details after a delivery failure and lets the visitor retry", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Enquiries are temporarily unavailable." }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<EnquiryForm />);
    fill("Name", "  Arun  ");
    fill("Phone", "2025550123");
    fill("Email", "arun@example.com");
    fill("Message", "  Which course covers charts?  ");
    fireEvent.submit(screen.getByRole("form"));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("temporarily unavailable");
    expect(document.activeElement).toBe(alert);
    expect((screen.getByLabelText(/Message/i) as HTMLTextAreaElement).value).toBe("  Which course covers charts?  ");
    expect(screen.queryByRole("status")).toBeNull();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ name: "Arun", message: "Which course covers charts?", program: "General Enquiry" });
    fireEvent.submit(screen.getByRole("form"));
    await screen.findByRole("status");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("explains a network failure without exposing the browser error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    render(<EnquiryForm />);
    fill("Name", "Arun");
    fill("Phone", "2025550123");
    fill("Email", "arun@example.com");
    fill("Message", "Learn charts");
    fireEvent.submit(screen.getByRole("form"));
    expect((await screen.findByRole("alert")).textContent).toContain("Check your connection and try again");
    expect(screen.queryByText("Failed to fetch")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("does not claim success without the endpoint's delivery acknowledgement", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    render(<EnquiryForm />);
    fill("Name", "Arun");
    fill("Phone", "2025550123");
    fill("Email", "arun@example.com");
    fill("Message", "Learn charts");
    fireEvent.submit(screen.getByRole("form"));
    expect((await screen.findByRole("alert")).textContent).toContain("Your message was not sent");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("submits with only name and phone while leaving the other fields optional", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<EnquiryForm />);
    expect([...document.querySelectorAll("[required]")].map(field => field.id)).toEqual(["name", "phone"]);
    fill("Name", "Arun");
    fill("Phone", "2025550123");
    fireEvent.submit(screen.getByRole("form"));
    await screen.findByRole("status");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ name: "Arun", phone: "2025550123", email: "", message: "" });
  });

  it("requires a phone number even when the optional fields are filled", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<EnquiryForm />);
    fill("Name", "Arun");
    fill("Email", "arun@example.com");
    fill("Message", "Learn charts");
    fireEvent.submit(screen.getByRole("form"));
    expect(screen.getByRole("alert").textContent).toContain("phone number");
    expect(document.activeElement?.id).toBe("phone");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("starts only one request for same-turn duplicate submits", () => {
    const fetchMock = vi.fn(() => new Promise(() => {}));
    vi.stubGlobal("fetch", fetchMock);
    render(<EnquiryForm />);
    const form = document.querySelector("form")!;
    fill("Name", "Arun");
    fill("Phone", "2025550123");
    fill("Email", "arun@example.com");
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: "x" } });

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(
      (screen.getByRole("button", { name: /Sending…/i }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });

  it("aborts a pending request when unmounted", () => {
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: RequestInit) => {
        requestSignal = init?.signal as AbortSignal;
        return new Promise(() => {});
      })
    );
    const { unmount } = render(<EnquiryForm />);
    const form = document.querySelector("form")!;
    fill("Name", "Arun");
    fill("Phone", "2025550123");
    fill("Email", "arun@example.com");
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: "x" } });

    fireEvent.submit(form);
    unmount();

    expect(requestSignal?.aborted).toBe(true);
  });
});
