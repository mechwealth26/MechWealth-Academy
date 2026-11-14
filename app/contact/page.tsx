import type { Metadata } from "next";
import Link from "next/link";
import AboutHero from "@/components/about/AboutHero";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Container from "@/components/ui/Container";
import EnquiryForm from "@/components/contact/EnquiryForm";
import { siteConfig } from "@/data/site";
import { absoluteUrl, breadcrumbJsonLd, organizationJsonLd } from "@/lib/seo";
import { buttonClasses } from "@/lib/buttonStyles";

const title = "Contact — Course Questions & Enquiries";
const description =
  `Contact MECHWEALTH Trading Academy in ${siteConfig.contact.addressLocality}. Call ${siteConfig.contact.phone}, email ${siteConfig.contact.email} or ask about courses and enrolment using the enquiry form.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `${title} | ${siteConfig.name}`,
    description,
    url: "/contact",
    type: "website",
    siteName: siteConfig.name,
    locale: "en_IN",
  },
};

const QUICK_ANSWERS = [
  {
    question: "I am new to markets. Where should I begin?",
    answer: "Foundation starts with market basics, charts and candlesticks, with no prerequisite. You can also leave the course choice as ‘Not sure yet’ and describe what you want to learn.",
    href: "/courses/foundation",
    link: "See the Foundation course",
  },
  {
    question: "Where can I compare the courses?",
    answer: "The course overview shows all four stages: Foundation, Practitioner, Method and One-to-One. Compare their topics, formats and prerequisites before choosing a starting point.",
    href: "/courses",
    link: "Compare all four courses",
  },
  {
    question: "Who teaches the courses?",
    answer: `${siteConfig.founder.name} teaches every session. The About page explains his background, the teaching method and the academy’s standards.`,
    href: "/about",
    link: "Meet the founder",
  },
];

export default function ContactPage() {
  const contact = siteConfig.contact;
  const address = `${contact.streetAddress}, ${contact.addressLocality}, ${contact.addressRegion} ${contact.postalCode}`;

  return (
    <main id="main" className="relative min-h-screen">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "@id": absoluteUrl("/contact#webpage"),
        url: absoluteUrl("/contact"),
        name: `${title} | ${siteConfig.name}`,
        description,
        about: {
          ...organizationJsonLd(),
          "@id": absoluteUrl("/#organization"),
        },
      }} />
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ])} />
      <AboutHero
        eyebrow={`Contact · ${siteConfig.shortName}`}
        titleLines={["Ready to learn", "the market?"]}
        intro="Tell us what you want to learn. We'll help you find the right path."
      />

      <Container className="flex flex-wrap items-center justify-between gap-4 pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        <a href="#enquiry" className={buttonClasses("secondary", "sm")}>Go to the enquiry form<span aria-hidden>↓</span></a>
      </Container>

      <section aria-labelledby="enquiry-heading" className="py-16 sm:py-24">
        <Container className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <p className="font-mono text-[11px] uppercase leading-5 tracking-[0.28em] text-gold-400">01 · Let’s talk</p>
            <h2 id="enquiry-heading" className="mt-5 max-w-lg font-display text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-cream-100 sm:text-4xl lg:text-5xl">
              A question is<br /> a good place to start.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-copy-secondary">
              Ask about a course, the topics it covers or where to begin.
              You do not need to choose a course before getting in touch.
            </p>
            <dl className="mt-8 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              <div className="py-5">
                <dt className="text-sm text-copy-muted">Call/WhatsApp</dt>
                <dd><a href={`tel:${contact.telephone}`} className="inline-flex min-h-11 items-center font-display text-xl text-cream-100 underline decoration-gold-400/40 underline-offset-4 hover:text-gold-400">{contact.phone}</a></dd>
              </div>
              <div className="py-5">
                <dt className="text-sm text-copy-muted">Email</dt>
                <dd><a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center break-all font-display text-xl text-cream-100 underline decoration-gold-400/40 underline-offset-4 hover:text-gold-400">{contact.email}</a></dd>
              </div>
              <div className="py-5">
                <dt className="text-sm text-copy-muted">Address</dt>
                <dd>
                  <address className="mt-3 max-w-sm text-base not-italic leading-7 text-cream-100">{contact.streetAddress}<br />{contact.addressLocality}, {contact.addressRegion} {contact.postalCode}</address>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm text-gold-400 underline underline-offset-4">Get directions on Google Maps<span className="sr-only"> (opens in a new tab)</span><span aria-hidden className="ml-2">↗</span></a>
                </dd>
              </div>
            </dl>
            <p className="mt-8 max-w-md text-sm leading-7 text-copy-muted">
              Looking for information about a financial service? Name the service in your message, or <Link href="/services" className="text-gold-400 underline underline-offset-4">review the services page</Link> first.
            </p>
          </div>

          <div id="enquiry" className="min-w-0 scroll-mt-24 border border-white/[0.1] bg-ink-900/50 p-5 [border-radius:var(--radius-lg)] sm:p-8">
            <h3 className="font-display text-2xl text-cream-100">Send an enquiry</h3>
            <p id="enquiry-instructions" className="mb-7 mt-3 text-sm leading-7 text-copy-secondary">Only your name and phone number are required. Email, course choice and message are optional.</p>
            <EnquiryForm />
          </div>
        </Container>
      </section>

      <section aria-labelledby="questions-heading" className="border-t border-white/[0.08] py-20 sm:py-28">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <p className="font-mono text-[11px] uppercase leading-5 tracking-[0.28em] text-gold-400">02 · Before you ask</p>
            <h2 id="questions-heading" className="mt-5 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-cream-100 sm:text-4xl lg:text-5xl">A few useful<br /> starting points.</h2>
            <p className="mt-6 max-w-md leading-7 text-copy-secondary">These pages explain the courses and the people behind the academy. If your question is still unanswered, use the enquiry form above.</p>
          </div>
          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {QUICK_ANSWERS.map((item) => (
              <article key={item.href} className="py-7 sm:py-8">
                <h3 className="font-display text-xl leading-snug text-cream-100 sm:text-2xl">{item.question}</h3>
                <p className="mt-4 leading-7 text-copy-secondary">{item.answer}</p>
                <Link href={item.href} className={`${buttonClasses("secondary", "sm")} mt-5`}>{item.link}<span aria-hidden>→</span></Link>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
