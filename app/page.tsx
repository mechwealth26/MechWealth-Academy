import type { Metadata } from "next";
import ProfessionalMarketHero from "@/components/sections/ProfessionalMarketHero";
import TechnicalAnalysis from "@/components/sections/TechnicalAnalysis";
import AcademyPrograms from "@/components/sections/AcademyPrograms";
import TradingMindset from "@/components/sections/TradingMindset";
import IndianMarkets from "@/components/sections/IndianMarkets";
import Mentor from "@/components/sections/Mentor";
import Reviews from "@/components/sections/Reviews";
import FinalCta from "@/components/sections/FinalCta";
import JsonLd from "@/components/seo/JsonLd";
import { organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Trading Academy India — Learn the Market the Engineering Way",
  description:
    "MECHWEALTH Trading Academy teaches NSE & BSE markets through structure: technical analysis, price action, risk management and backtesting. One teacher, one method — education only.",
  alternates: { canonical: "/" },
};

/**
 * Hero — a pinned Canvas 2D market lesson. Scroll reveals four chart
 * structures before the full-width chart resolves into a 60/40 learning CTA.
 */
export default function Home() {
  return (
    <main id="main" className="flex-1">
        <JsonLd data={organizationJsonLd()} />
        <section id="hero-scroll-track" className="relative h-[540vh]">
          <div className="sticky top-0 h-screen overflow-hidden">
            <ProfessionalMarketHero />
          </div>
        </section>

        <Mentor />

        <Reviews />

        <TechnicalAnalysis />

        <AcademyPrograms />

        <TradingMindset />

        <IndianMarkets />

        <FinalCta />
    </main>
  );
}
