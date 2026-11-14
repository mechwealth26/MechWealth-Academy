import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ThemeProvider from "@/components/theme/ThemeProvider";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import { readFileSync } from "node:fs";
import path from "node:path";

const layoutSource = readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf8");
const initializationScript = layoutSource.match(/const themeInitializationScript = `([\s\S]*?)`;/)![1];

let prefersDark = false;
let mediaListener: (() => void) | undefined;

beforeEach(() => {
  prefersDark = false;
  mediaListener = undefined;
  localStorage.clear();
  document.documentElement.dataset.theme = "dark";
  document.documentElement.dataset.themePreference = "dark";
  document.documentElement.style.colorScheme = "dark";

  const meta = document.createElement("meta");
  meta.name = "theme-color";
  document.head.append(meta);

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-color-scheme") && prefersDark,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (_type: string, listener: () => void) => {
        mediaListener = listener;
      },
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.head.querySelector('meta[name="theme-color"]')?.remove();
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.themePreference;
  document.documentElement.style.colorScheme = "";
});

function renderSwitcher() {
  return render(
    <ThemeProvider>
      <ThemeSwitcher />
    </ThemeProvider>
  );
}

describe("theme preference", () => {
  it("starts in Dark even on a light device, with an icon-only named control", () => {
    renderSwitcher();
    const trigger = screen.getByRole("button", { name: /Theme: dark/i });
    expect(trigger.getAttribute("aria-label")).toContain("Resolved to dark");
    expect(trigger.textContent).toBe("");
    expect(trigger.querySelector('svg[aria-hidden]')).not.toBeNull();
    expect(localStorage.getItem("mechwealth-theme")).toBeNull();
    expect(mediaListener).toBeUndefined();
  });

  it("follows device-theme changes only after System is explicitly selected", () => {
    renderSwitcher();
    fireEvent.click(screen.getByRole("button", { name: /Theme: dark/i }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "System" }));
    expect(document.documentElement.dataset.theme).toBe("light");

    prefersDark = true;
    mediaListener?.();

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.themePreference).toBe("system");
  });

  it("persists explicit choices including System", () => {
    renderSwitcher();
    const trigger = screen.getByRole("button", { name: /Theme: dark/i });

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Dark" }));

    expect(localStorage.getItem("mechwealth-theme")).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.themePreference).toBe("dark");

    fireEvent.click(screen.getByRole("button", { name: /Theme: dark/i }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "System" }));

    expect(localStorage.getItem("mechwealth-theme")).toBe("system");
    expect(document.documentElement.dataset.themePreference).toBe("system");
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});

describe("initial theme before hydration", () => {
  it("uses Dark with no saved choice even when the device prefers Light", () => {
    new Function(initializationScript)();
    expect(document.documentElement.dataset.themePreference).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe("#05070f");
  });

  it.each(["light", "dark", "system"])("restores an explicit %s preference", (preference) => {
    localStorage.setItem("mechwealth-theme", preference);
    new Function(initializationScript)();
    expect(document.documentElement.dataset.themePreference).toBe(preference);
    expect(document.documentElement.dataset.theme).toBe(preference === "dark" ? "dark" : "light");
  });

  it("keeps Dark when storage is unavailable or invalid", () => {
    localStorage.setItem("mechwealth-theme", "invalid");
    new Function(initializationScript)();
    expect(document.documentElement.dataset.theme).toBe("dark");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    new Function(initializationScript)();
    expect(document.documentElement.dataset.themePreference).toBe("dark");
  });
});

