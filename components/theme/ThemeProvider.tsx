"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
};

export const THEME_STORAGE_KEY = "mechwealth-theme";
export const THEME_CHANGE_EVENT = "mechwealth:theme-change";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
}

function preferenceSnapshot(): ThemePreference {
  const preference = document.documentElement.dataset.themePreference;
  return preference === "light" || preference === "system" ? preference : "dark";
}

function resolvedThemeSnapshot(): ResolvedTheme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolvedTheme = preference === "system" ? systemTheme() : preference;
  const root = document.documentElement;

  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolvedTheme;

  const themeColor = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]'
  );
  themeColor?.setAttribute(
    "content",
    resolvedTheme === "light" ? "#fbfcfa" : "#05070f"
  );

  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, { detail: { resolvedTheme } })
  );

  return resolvedTheme;
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useSyncExternalStore<ThemePreference>(
    subscribeToTheme,
    preferenceSnapshot,
    () => "dark"
  );
  const resolvedTheme = useSyncExternalStore<ResolvedTheme>(
    subscribeToTheme,
    resolvedThemeSnapshot,
    () => "dark"
  );

  useEffect(() => {
    if (preference !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    } catch {
      // Storage can be unavailable in hardened browser modes. The choice still
      // applies for the current page and Dark remains the next-load fallback.
    }

    applyTheme(nextPreference);
  }, []);

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
