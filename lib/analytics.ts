"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { track } from "@vercel/analytics";
import { ANALYTICS_CONSENT_KEY } from "@/lib/analyticsConsent";

type EventProperties = Record<string, string | number | boolean>;

export function trackConversion(name: string, properties: EventProperties = {}) {
  track(name, properties);

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  let analyticsAccepted = false;
  try {
    analyticsAccepted =
      window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === "accepted";
  } catch {
    // GA remains disabled when the visitor's browser blocks storage access.
  }
  if (
    analyticsAccepted &&
    gaId &&
    gaId !== "G-XXXXXXXXXX"
  ) {
    sendGAEvent({ event: name, ...properties });
  }
}
