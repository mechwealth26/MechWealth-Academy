import { siteConfig } from "@/data/site";
import { RESOURCES } from "@/data/resources";

/**
 * SEO helpers: canonical URLs, the authoritative route list, and
 * JSON-LD builders shared by page templates.
 */

/** Absolute URL for a path ("", "/" or "/courses/method"). */
export function absoluteUrl(path = "/"): string {
  const base = siteConfig.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Every indexable route. Update when a page is added or removed. */
export const SITE_ROUTES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/academy", priority: 0.8 },
  { path: "/courses", priority: 0.9 },
  { path: "/courses/foundation", priority: 0.8 },
  { path: "/courses/practitioner", priority: 0.8 },
  { path: "/courses/method", priority: 0.8 },
  { path: "/courses/one-to-one", priority: 0.8 },
  { path: "/services", priority: 0.9 },
  { path: "/services/demat-trading-account", priority: 0.7 },
  { path: "/services/mutual-funds", priority: 0.7 },
  { path: "/services/life-health-insurance", priority: 0.7 },
  { path: "/services/physical-share-services", priority: 0.7 },
  { path: "/services/iepf-claims", priority: 0.7 },
  { path: "/resources", priority: 0.7 },
  ...RESOURCES.map(({ slug }) => ({ path: `/resources/${slug}`, priority: 0.7 })),
  { path: "/about", priority: 0.6 },
  { path: "/contact", priority: 0.7 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];

type JsonLdObject = Record<string, unknown>;

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: absoluteUrl("/"),
    logo: absoluteUrl(siteConfig.logo),
    telephone: siteConfig.contact.telephone,
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.streetAddress,
      addressLocality: siteConfig.contact.addressLocality,
      addressRegion: siteConfig.contact.addressRegion,
      postalCode: siteConfig.contact.postalCode,
      addressCountry: siteConfig.contact.addressCountry,
    },
    sameAs: siteConfig.socialLinks,
    description: siteConfig.description,
    areaServed: "IN",
    knowsAbout: [
      "Stock market education",
      "Technical analysis",
      "Price action",
      "Risk management",
      "Backtesting",
    ],
  };
}

export function courseJsonLd(opts: {
  name: string;
  description: string;
  path: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: opts.name,
    description: opts.description,
    provider: {
      "@type": "EducationalOrganization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
    url: absoluteUrl(opts.path),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

