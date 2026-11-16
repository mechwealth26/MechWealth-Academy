import type { Metadata } from "next";
import CookiePreferencesButton from "@/components/analytics/CookiePreferencesButton";
import LegalPage from "@/components/legal/LegalPage";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/data/site";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MECHWEALTH collects, uses and protects personal data on this website.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy" },
        ])}
      />
      <LegalPage
        eyebrow="Privacy · Last updated 5 September 2026"
        title="Privacy Policy"
        intro="This notice explains what personal data this website handles, why it is used, who may receive it and the choices available to you."
      >
        <p>
          This notice is intended to align the website&apos;s data practices with India&apos;s Digital
          Personal Data Protection Act, 2023 and applicable rules. It should be reviewed whenever
          those requirements or the services used by this website change.
        </p>

        <h2>Who is responsible for your data</h2>
        <p>
          {siteConfig.name} is responsible for personal data collected through this website. For
          privacy questions or requests, email{" "}
          <a href={`mailto:${siteConfig.privacyEmail}`}>{siteConfig.privacyEmail}</a>.
        </p>

        <h2>Data we collect</h2>
        <h3>Enquiries</h3>
        <p>
          When you submit the contact form, we require your name and phone number. Your email address,
          program of interest and message are optional. We use this information to understand and
          respond to your enquiry, keep an appropriate record of the conversation and prevent
          duplicate or abusive submissions.
        </p>
        <h3>Optional Google Analytics</h3>
        <p>
          If you accept analytics, Google Analytics 4 may collect page views, interactions,
          approximate location, device and browser information and a cookie-based client
          identifier. Google Analytics is not loaded before you accept.
        </p>
        <h3>Website hosting</h3>
        <p>
          The website is hosted on GoDaddy. The hosting provider may process request and security
          information needed to deliver and protect the website.
        </p>

        <h2>Why we use this data</h2>
        <ul>
          <li>To respond to a request you choose to send and provide the information requested.</li>
          <li>To operate, secure, troubleshoot and improve the website.</li>
          <li>To measure visits and conversion actions when you have accepted Google Analytics.</li>
          <li>To meet applicable legal, accounting, security and regulatory obligations.</li>
        </ul>

        <h2>Consent and your choices</h2>
        <p>
          Consent for Google Analytics is optional and separate from using the site or sending an
          enquiry. Rejecting analytics does not limit access. You may withdraw or change that
          choice at any time using the button below; withdrawal does not affect processing already
          carried out before it.
        </p>
        <CookiePreferencesButton />

        <h2>Sharing and international processing</h2>
        <p>
          Data is shared only where needed with service providers that support hosting, security,
          analytics or enquiry handling, including GoDaddy for hosting, Resend for enquiry emails
          and—only after consent—Google Analytics.
          These providers may process information outside India under their own data-processing
          terms. We do not sell personal data.
        </p>

        <h2>Retention and security</h2>
        <p>
          Enquiry records are retained only for as long as needed to answer the enquiry, maintain
          necessary business records or comply with law, then deleted or anonymised. Reasonable
          technical and organisational safeguards are used, but no internet transmission or
          storage system can be guaranteed completely secure.
        </p>

        <h2>Your rights</h2>
        <p>
          Subject to applicable law, you may ask for a summary of personal data being processed,
          correction or completion of inaccurate data, erasure when retention is no longer
          required, withdrawal of consent, and grievance redressal. You may also nominate another
          individual to exercise your rights in the circumstances provided by law. Contact the
          email above with enough information to identify the relevant enquiry. We may need to
          verify your identity before acting on a request.
        </p>

        <h2>Children</h2>
        <p>
          This website and its services are not directed to children. Do not submit a child&apos;s
          personal data through the enquiry form without the verifiable consent required by law.
        </p>

        <h2>Updates and grievances</h2>
        <p>
          This notice may be updated when the website, providers or legal requirements change. The
          current date will appear at the top. Please first raise any privacy grievance using the
          contact email above so it can be addressed through the available grievance process.
        </p>
      </LegalPage>
    </>
  );
}
