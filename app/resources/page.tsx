import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import ResourcesLibrary from "@/components/resources/ResourcesLibrary";

export const metadata: Metadata = {
  title: "Stock Market Lessons — Charts, Risk & Market Mechanics",
  alternates: { canonical: "/resources" },
  description:
    "13 stock market lessons on candles, support and resistance, volume, exchange mechanics, position sizing, trading costs, behaviour and quarterly results.",
};

export default function ResourcesPage() {
  return (
    <main id="main" className="relative min-h-screen">
      <AboutHero
        eyebrow="The Library"
        titleLines={["Stock market lessons."]}
        intro="Thirteen lessons on charts, market mechanics, risk, trading costs, behaviour and company results. Interactive examples accompany selected lessons."
      />
      <ResourcesLibrary />
    </main>
  );
}
