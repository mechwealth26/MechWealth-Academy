import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of the MECHWEALTH website and its educational content.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Terms of Use", path: "/terms" },
        ])}
      />
      <LegalPage
        eyebrow="Terms · Last updated 5 September 2026"
        title="Terms of Use"
        intro="These terms govern access to this website. By using it, you agree to use its content lawfully and with the limits below in mind."
      >
        <h2>Educational content only</h2>
        <p>
          Website content, courses, charts, examples, visualisations and commentary are provided
          for general education. They are not personalised investment advice, research,
          recommendations, tips, calls, an offer to buy or sell a security, or a promise of returns.
          Examples may be simplified, delayed, simulated or selected to explain a concept and must
          not be treated as live market information.
        </p>

        <h2>Market risk and independent decisions</h2>
        <p>
          Securities and other financial products involve risk, including loss of capital. Past or
          simulated performance does not predict future results. You remain responsible for your
          own decisions and should obtain advice from an appropriately registered professional
          before acting where advice is required.
        </p>

        <h2>Permitted use</h2>
        <p>
          You may view and use the website for personal, lawful, non-commercial learning. You must
          not interfere with its operation, attempt unauthorised access, introduce harmful code,
          scrape it at a disruptive scale, misrepresent its content or reuse protected material in
          a way that infringes intellectual-property rights.
        </p>

        <h2>Accuracy and availability</h2>
        <p>
          We aim to keep the website clear and accurate, but educational content can become
          outdated and the site may be changed, suspended or unavailable. No representation is
          made that every page is complete, error-free or suitable for a particular purpose.
        </p>

        <h2>Third-party services and links</h2>
        <p>
          The website may link to or rely on third-party services. Their content, availability and
          privacy practices are controlled by their operators. A link does not by itself mean that
          MECHWEALTH endorses everything on the destination site.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by applicable law, MECHWEALTH will not be liable for
          trading losses, lost profits, lost data, business interruption or indirect or
          consequential loss arising from reliance on educational content or inability to use the
          website. Nothing in these terms excludes liability that cannot lawfully be excluded.
        </p>

        <h2>Privacy and changes</h2>
        <p>
          Personal data is handled as described in the Privacy Policy. These terms may be updated
          to reflect changes in the website, services or law; the current date appears above.
        </p>

        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of India. The appropriate courts and exact business
          jurisdiction should be confirmed in the final legal review before publication.
        </p>
      </LegalPage>
    </>
  );
}
