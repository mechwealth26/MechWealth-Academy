import { resolveSiteUrl } from "@/lib/siteUrl";

export const siteConfig = {
  name: "MECHWEALTH Trading Academy",
  shortName: "MECHWEALTH",
  description:
    "A premium Indian stock-market trading academy — learn to trade NSE & BSE markets with discipline, strategy and risk management.",
  // Local development can use localhost; production requires an explicit origin.
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, process.env.NODE_ENV === "production"),
  logo: "/images/mechwealth-logo.svg",
  socialLinks: (process.env.NEXT_PUBLIC_SOCIAL_LINKS ?? "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  privacyEmail:
    process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? "privacy@mechwealth.example",
  nav: [
    { label: "Home", href: "/" },
    { label: "Academy", href: "/academy" },
    { label: "Courses", href: "/courses" },
    { label: "Services", href: "/services" },
    { label: "Resources", href: "/resources" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  cta: { label: "Explore Academy", href: "/academy" },
  contact: {
    phone: "+91 91645 46528",
    telephone: "+919164546528",
    email: "info@mechwealth.com",
    streetAddress: "Tribhuvan Das Building, Shikarkhane road",
    addressLocality: "Vijayapura",
    addressRegion: "Karnataka",
    postalCode: "586104",
    addressCountry: "IN",
  },
  founder: {
    eyebrow: "02 — Who you're learning from",
    name: "Kirankumar Kajagar",
    headline: "One person teaches every session. This is him.",
    bio: "I'm Kirankumar Kajagar. I hold an MTech in Mechanical Engineering from VTU Belagavi, and I don't practise engineering. What I kept from it is the method — study the facts, follow a process, test the thing before you deploy it. I teach markets that way.",
    initials: "KK",
    // Displayed by the founder profile in components/sections/Mentor.tsx.
    portraitCaption: "FIG. 02 — Shikarkhane Road, Vijayapura",
    credentials: [
      {
        label: "Mutual Funds · AMFI",
        lines: ["ARN-195327"],
      },
      {
        label: "Broking · IIFL Authorised Person",
        lines: ["NSE AP1493095781", "BSE AP0101790169847"],
      },
      {
        label: "Insurance · IRDAI POSP",
        lines: ["EI00076707"],
      },
    ],
  },
} as const;
