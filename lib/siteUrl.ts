/** Validate an origin, without inferring a deployment domain from contact details. */
export function resolveSiteUrl(value: string | undefined, production: boolean): string {
  if (!value?.trim()) {
    if (production) throw new Error("NEXT_PUBLIC_SITE_URL must be set before a production build.");
    return "http://localhost:3000";
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) origin.");
  }
  const host = url.hostname.toLowerCase();
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(host);
  const placeholder = /(^|\.)(example\.(com|org|net)|example|invalid|test)$/.test(host);
  if (
    (url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
    url.username || url.password || url.pathname !== "/" || url.search || url.hash ||
    placeholder || (!local && !host.includes("."))
  ) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a non-placeholder HTTPS origin without a path, query or credentials. Explicit localhost origins are allowed for local validation only.");
  }
  return url.origin;
}
