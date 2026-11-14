"use client";

import { OPEN_CONSENT_EVENT } from "@/lib/analyticsConsent";

export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="min-h-11 text-left text-sm text-copy-secondary transition-colors hover:text-gold-300"
    >
      Cookie preferences
    </button>
  );
}
