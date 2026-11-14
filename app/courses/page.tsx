import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo";
import Container from "@/components/ui/Container";
import CoursesHero from "@/components/courses/CoursesHero";
import CoursesJourney from "@/components/courses/CoursesJourney";

export const metadata: Metadata = {
  title: "Stock-Market Courses — Beginner to Advanced",
  alternates: { canonical: "/courses" },
  description:
    "Explore beginner to advanced stock-market courses: market basics, chart reading, testing a trading plan and personal mentorship. Start with Foundation.",
};

export default function CoursesPage() {
  return (
    <main id="main">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: ["foundation", "practitioner", "method", "one-to-one"].map((slug, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/courses/${slug}`),
        })),
      }} />
      <CoursesHero />

      {/* Four-stage course overview */}
      <CoursesJourney />

      {/* Closing note */}
      <section className="border-t border-white/5 py-16">
        <Container>
          <p className="max-w-2xl font-mono text-xs leading-relaxed text-copy-muted">
            All course content is educational only — nothing on this page is
            trading advice, and no results or performance are promised.
            Stages build sequentially. Beginner, Intermediate and Advanced describe
            the learning stages, not qualifications or guaranteed expertise.
          </p>
        </Container>
      </section>
    </main>
  );
}
