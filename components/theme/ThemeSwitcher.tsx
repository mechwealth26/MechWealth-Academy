"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  useTheme,
  type ThemePreference,
} from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function ThemeIcon({ theme }: { theme: ThemePreference }) {
  if (theme === "light") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (theme === "dark") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      </svg>
    );
  }

  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

export default function ThemeSwitcher({
  className,
  menuAlign = "right",
}: {
  className?: string;
  menuAlign?: "left" | "right";
}) {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const labelId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme: ${preference}. Resolved to ${resolvedTheme}.`}
        title="Choose theme"
        onClick={() => setOpen((current) => !current)}
        className="theme-switcher-button inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-copy-secondary transition-colors hover:text-cream-100"
      >
        <ThemeIcon theme={preference} />
      </button>

      {open && (
        <div
          role="menu"
          aria-labelledby={labelId}
          className={cn(
            "theme-switcher-menu absolute top-[calc(100%+0.5rem)] z-[80] w-40 rounded-xl border p-1.5 shadow-2xl backdrop-blur-xl",
            menuAlign === "right" ? "right-0" : "left-0"
          )}
        >
          <p id={labelId} className="sr-only">Choose theme</p>
          {OPTIONS.map((option) => {
            const active = preference === option.value;
            return (
              <button
                key={option.value}
                role="menuitemradio"
                aria-checked={active}
                type="button"
                onClick={() => {
                  setPreference(option.value);
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
                className={cn(
                  "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors",
                  active
                    ? "bg-gold-500/15 text-gold-400"
                    : "text-copy-secondary hover:bg-white/5 hover:text-cream-100"
                )}
              >
                <ThemeIcon theme={option.value} />
                <span>{option.label}</span>
                {active && <span aria-hidden className="ml-auto text-gold-500">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

