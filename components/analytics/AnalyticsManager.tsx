"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ANALYTICS_CONSENT_KEY, OPEN_CONSENT_EVENT, SUSPEND_CONSENT_EVENT, cookiePreferencesSuspended } from "@/lib/analyticsConsent";

type Consent = "accepted" | "rejected" | null;

function clearGoogleAnalyticsCookies() {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (!name?.startsWith("_ga")) return;
    const expire = (domain = "") => {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ""}`;
    };
    expire();
    const parts = window.location.hostname.split(".");
    while (parts.length > 1) { expire(parts.join(".")); parts.shift(); }
  });
}

function applyAnalyticsChoice(gaId: string | undefined, consent: Consent) {
  if (gaId && gaId !== "G-XXXXXXXXXX") {
    // Google's documented opt-out prevents an already loaded tag from sending or setting cookies.
    (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = consent !== "accepted";
  }
  if (consent !== "accepted") clearGoogleAnalyticsCookies();
}

export default function AnalyticsManager({ enableVercel }: { enableVercel: boolean }) {
  // Wait for saved consent before showing a choice the visitor may already have made.
  const [consent, setConsent] = useState<Consent | undefined>(undefined);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [suspended, setSuspended] = useState(cookiePreferencesSuspended);
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    } catch {
      // Storage can be unavailable in hardened browser modes. In that case,
      // keep analytics off and continue to offer the in-session choice.
    }
    let storageChanged = false;
    const apply = (value: string | null) => {
      const next = value === "accepted" || value === "rejected" ? value : null;
      applyAnalyticsChoice(gaId, next);
      setConsent(next);
    };
    const frame = window.requestAnimationFrame(() => {
      if (!storageChanged) apply(stored);
    });
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || (event.key !== ANALYTICS_CONSENT_KEY && event.key !== null)) return;
      storageChanged = true;
      apply(event.newValue);
    };
    window.addEventListener("storage", onStorage);

    const openPreferences = () => setPreferencesOpen(true);
    const suspendPreferences = (event: Event) =>
      setSuspended((event as CustomEvent<boolean>).detail === true);
    window.addEventListener(OPEN_CONSENT_EVENT, openPreferences);
    window.addEventListener(SUSPEND_CONSENT_EVENT, suspendPreferences);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(OPEN_CONSENT_EVENT, openPreferences);
      window.removeEventListener(SUSPEND_CONSENT_EVENT, suspendPreferences);
    };
  }, [gaId]);

  const choose = (next: Exclude<Consent, null>) => {
    applyAnalyticsChoice(gaId, next);
    try {
      window.localStorage.setItem(ANALYTICS_CONSENT_KEY, next);
    } catch {
      // The state still applies for this page view when persistent storage is blocked.
    }
    setConsent(next);
    setPreferencesOpen(false);
  };

  const showBanner = !suspended && consent !== undefined && (consent === null || preferencesOpen);

  return (
    <>
      {/* Vercel products are anonymous/cookieless and only load on Vercel. */}
      {enableVercel ? (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      ) : null}
      {consent === "accepted" && gaId && gaId !== "G-XXXXXXXXXX" ? (
        <GoogleAnalytics gaId={gaId} />
      ) : null}

      {showBanner ? (
        <section
          aria-label="Cookie preferences"
          className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-3xl rounded-2xl border border-gold-400/30 bg-ink-900/95 p-5 shadow-2xl backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:flex sm:items-center sm:gap-8 sm:p-6"
        >
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg text-cream-100">Your privacy choices</h2>
            <p className="mt-2 text-sm leading-6 text-copy-secondary">
              With your permission, we use Google Analytics cookies to understand visits and
              improve the website. You can accept or reject these optional cookies and change
              your choice at any time using Cookie preferences in the footer. Rejecting analytics
              does not limit your access to the website.
            </p>
          </div>
          <div className="mt-5 flex shrink-0 flex-wrap gap-3 sm:mt-0">
            <button
              type="button"
              onClick={() => choose("rejected")}
              className="min-h-11 rounded-full border border-white/20 px-5 py-2 text-sm text-cream-100 transition-colors hover:border-gold-400 hover:text-gold-300"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="min-h-11 rounded-full bg-action px-5 py-2 text-sm font-medium text-action-text transition-colors hover:bg-action-hover"
            >
              Accept analytics
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
