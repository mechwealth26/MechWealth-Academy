import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Footer from "@/components/navigation/Footer";
import Navbar from "@/components/navigation/Navbar";
import { siteConfig } from "@/data/site";
import AnalyticsManager from "@/components/analytics/AnalyticsManager";
import SkipLink from "@/components/navigation/SkipLink";
import ThemeProvider from "@/components/theme/ThemeProvider";
import "@/styles/globals.css";

/** Display / headings */
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

/** Body copy */
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

/** Numbers, tickers, code */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_IN",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

const themeInitializationScript = `
  (() => {
    const root = document.documentElement;
    let preference = "dark";
    try {
      const stored = localStorage.getItem("mechwealth-theme");
      if (stored === "light" || stored === "dark" || stored === "system") preference = stored;
    } catch {}
    const resolved = preference === "system"
      ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : preference;
    root.dataset.theme = resolved;
    root.dataset.themePreference = preference;
    root.style.colorScheme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", resolved === "light" ? "#fbfcfa" : "#05070f");
  })();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-theme-preference="dark"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#05070f" />
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <SmoothScrollProvider>
            <SkipLink />
            <Navbar />
            {children}
            <Footer />
            <AnalyticsManager enableVercel={Boolean(process.env.VERCEL)} />
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
