export const ANALYTICS_CONSENT_KEY = "mechwealth_analytics_consent";
export const OPEN_CONSENT_EVENT = "mechwealth:open-cookie-preferences";
export const SUSPEND_CONSENT_EVENT = "mechwealth:suspend-cookie-preferences";

// Each overlay owns one suspension; closing one must not expose consent behind another.
const suspensions = new Set<symbol>();
export function cookiePreferencesSuspended() { return suspensions.size > 0; }
export function suspendCookiePreferences() {
  const owner = Symbol();
  suspensions.add(owner);
  window.dispatchEvent(new CustomEvent(SUSPEND_CONSENT_EVENT, { detail: true }));
  return () => {
    suspensions.delete(owner);
    window.dispatchEvent(new CustomEvent(SUSPEND_CONSENT_EVENT, { detail: cookiePreferencesSuspended() }));
  };
}
